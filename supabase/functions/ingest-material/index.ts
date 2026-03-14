import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { configureUnPDF, extractText, getDocumentProxy } from "https://esm.sh/unpdf@1.1.0";
import * as pdfjs from "https://esm.sh/unpdf@1.1.0/pdfjs";
import mammoth from "https://esm.sh/mammoth@1.6.0";

// Required in Supabase Edge Functions so PDF.js is available (see unjs/unpdf#3)
await configureUnPDF({ pdfjs: async () => pdfjs });

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
}

async function extractTextFromFile(arrayBuffer: ArrayBuffer, fileExtension: string): Promise<string> {
  const ext = fileExtension.toLowerCase();
  if (ext === "pdf") {
    const pdf = await getDocumentProxy(new Uint8Array(arrayBuffer));
    const { text } = await extractText(pdf, { mergePages: true });
    return text?.trim() || "";
  }
  if (ext === "docx" || ext === "doc") {
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value?.trim() || "";
  }
  throw new Error(`Unsupported file type: .${ext}. Use PDF or DOCX.`);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(
        JSON.stringify({ error: "Missing server configuration" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const body = (await req.json()) as RequestBody;
    const { filePath, userId, title, subject } = body;

    if (!filePath || !userId) {
      return new Response(
        JSON.stringify({ error: "filePath and userId are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Download file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("materials")
      .download(filePath);

    if (downloadError || !fileData) {
      console.error("Download error:", downloadError);
      return new Response(
        JSON.stringify({ error: "Failed to download file", details: downloadError?.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Extract raw text from PDF/DOCX locally so we send text-only to the AI gateway
    // (the gateway does not reliably accept file/base64 document uploads)
    const arrayBuffer = await fileData.arrayBuffer();
    const fileExtension = filePath.split(".").pop()?.toLowerCase() || "";

    let rawText: string;
    try {
      rawText = await extractTextFromFile(arrayBuffer, fileExtension);
    } catch (extractErr: unknown) {
      const msg = extractErr instanceof Error ? extractErr.message : "Text extraction failed";
      console.error("Extract error:", extractErr);
      return new Response(
        JSON.stringify({ error: "Failed to extract text from file", details: msg }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!rawText || rawText.length < 50) {
      return new Response(
        JSON.stringify({
          error: "Document appears empty or could not be read",
          details: "The file may be scanned (image-only), password-protected, or corrupted.",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const maxChars = 120_000;
    const textForAi =
      rawText.length > maxChars
        ? rawText.slice(0, maxChars) + "\n\n[... document truncated for length ...]"
        : rawText;

    const systemPrompt = `You are a study notes extraction assistant. You will receive raw text from a document. Your job is to turn it into clean, well-structured study notes.

Rules:
- Ignore headers, footers, watermarks, page numbers, and repetitive boilerplate.
- Focus on: definitions, theorems, formulas, key concepts, examples, and important details.
- Output clean markdown with headings, bullet points, and bold for key terms.
- Be thorough but concise — capture everything a student would need to study from this document.
- Do NOT add commentary like "Here are the notes" — just output the notes directly.`;

    const userPrompt = `Turn the following document text into comprehensive study notes in markdown. ${subject ? `Subject: ${subject}.` : ""} Focus on key concepts, definitions, and important details.\n\n---\n\n${textForAi}`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.2,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI extraction failed", details: errorText }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const completion = await aiResponse.json();
    const extractedContent =
      completion.choices?.[0]?.message?.content ?? "Could not extract notes from document.";

    // Derive title from filename if not provided
    const noteTitle =
      title?.trim() ||
      (filePath.split("/").pop() || "Uploaded Document")
        .replace(/\.[^/.]+$/, "")
        .replace(/[-_]/g, " ");

    // Save as a study note
    const { data: note, error: insertError } = await supabase
      .from("study_notes")
      .insert({
        user_id: userId,
        title: noteTitle,
        content: extractedContent,
        subject: subject?.trim() || null,
        tags: ["imported"],
      })
      .select()
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to save note", details: insertError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(JSON.stringify({ note }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("ingest-material error:", err);
    return new Response(
      JSON.stringify({ error: "Unexpected error in ingest-material function" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
