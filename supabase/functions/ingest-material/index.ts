import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import JSZip from "https://esm.sh/jszip@3.10.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface RequestBody {
  filePath: string;
  userId: string;
  title?: string;
  subject?: string;
  aiProvider?: "lovable" | "gemini";
}

// Extract text from DOCX by unzipping and parsing word/document.xml
async function extractTextFromDocx(arrayBuffer: ArrayBuffer): Promise<string> {
  const zip = await JSZip.loadAsync(arrayBuffer);
  const docXml = zip.file("word/document.xml");
  if (!docXml) throw new Error("Invalid DOCX: missing word/document.xml");
  const xml = await docXml.async("string");
  // Strip XML tags, keep text content
  const text = xml
    .replace(/<w:br[^>]*\/>/gi, "\n")
    .replace(/<w:p[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return text;
}

// Extract text from PDF using unpdf
async function extractTextFromPdf(arrayBuffer: ArrayBuffer): Promise<string> {
  const { configureUnPDF, extractText, getDocumentProxy } = await import("https://esm.sh/unpdf@1.1.0");
  const pdfjs = await import("https://esm.sh/unpdf@1.1.0/pdfjs");
  await configureUnPDF({ pdfjs: async () => pdfjs });
  const pdf = await getDocumentProxy(new Uint8Array(arrayBuffer));
  const { text } = await extractText(pdf, { mergePages: true });
  return text?.trim() || "";
}

async function callLovableAI(systemPrompt: string, userPrompt: string): Promise<string> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.2,
      max_tokens: 8192,
    }),
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Lovable AI error ${res.status}: ${t}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || "";
}

async function callGeminiDirect(systemPrompt: string, userPrompt: string): Promise<string> {
  const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
  if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not configured. Add it in Edge Function secrets.");

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 8192 },
      }),
    },
  );

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${t}`);
  }
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
}

async function callAI(provider: string, systemPrompt: string, userPrompt: string): Promise<string> {
  if (provider === "gemini") {
    return callGeminiDirect(systemPrompt, userPrompt);
  }
  return callLovableAI(systemPrompt, userPrompt);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(JSON.stringify({ error: "Missing Supabase env" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const body = (await req.json()) as RequestBody;
    const { filePath, userId, title, subject, aiProvider = "lovable" } = body;

    if (!filePath || !userId) {
      return new Response(JSON.stringify({ error: "filePath and userId are required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Download file
    const { data: fileData, error: downloadError } = await supabase.storage.from("materials").download(filePath);
    if (downloadError || !fileData) {
      return new Response(JSON.stringify({ error: "Failed to download file", details: downloadError?.message }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const arrayBuffer = await fileData.arrayBuffer();
    const fileExtension = filePath.split(".").pop()?.toLowerCase() || "";

    // Extract text based on file type
    let rawText: string;
    try {
      if (fileExtension === "pdf") {
        rawText = await extractTextFromPdf(arrayBuffer);
      } else if (fileExtension === "docx" || fileExtension === "doc") {
        rawText = await extractTextFromDocx(arrayBuffer);
      } else {
        throw new Error(`Unsupported file type: .${fileExtension}. Use PDF or DOCX.`);
      }
    } catch (extractErr: unknown) {
      const msg = extractErr instanceof Error ? extractErr.message : "Text extraction failed";
      console.error("Extract error:", extractErr);
      return new Response(JSON.stringify({ error: "Failed to extract text", details: msg }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!rawText || rawText.length < 50) {
      return new Response(JSON.stringify({
        error: "Document appears empty or could not be read",
        details: "The file may be scanned (image-only), password-protected, or corrupted.",
      }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const maxChars = 120_000;
    const textForAi = rawText.length > maxChars
      ? rawText.slice(0, maxChars) + "\n\n[... document truncated ...]"
      : rawText;

    const systemPrompt = `You are a study notes extraction assistant. Turn raw document text into clean, well-structured study notes in markdown. Ignore headers, footers, watermarks, page numbers. Focus on definitions, theorems, formulas, key concepts, examples. Use headings, bullet points, bold for key terms. Output ONLY the notes.`;
    const userPrompt = `Turn the following document text into comprehensive study notes in markdown. ${subject ? `Subject: ${subject}.` : ""} Focus on key concepts, definitions, and important details.\n\n---\n\n${textForAi}`;

    const extractedContent = await callAI(aiProvider, systemPrompt, userPrompt);

    if (!extractedContent) {
      return new Response(JSON.stringify({ error: "AI returned empty content" }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const noteTitle = title?.trim() ||
      (filePath.split("/").pop() || "Uploaded Document").replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");

    const { data: note, error: insertError } = await supabase
      .from("study_notes")
      .insert({ user_id: userId, title: noteTitle, content: extractedContent, subject: subject?.trim() || null, tags: ["imported"] })
      .select()
      .single();

    if (insertError) {
      return new Response(JSON.stringify({ error: "Failed to save note", details: insertError.message }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ note }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("ingest-material error:", err);
    const message = err instanceof Error ? err.message : "Unexpected error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
