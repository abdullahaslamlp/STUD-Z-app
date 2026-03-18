import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface NoteInput { title: string; content: string | null; subject: string | null; }
interface RequestBody {
  notes: NoteInput[];
  num_questions: number;
  difficulty?: "easy" | "medium" | "hard";
  aiProvider?: "lovable" | "gemini";
}

async function callLovableAI(systemPrompt: string, userPrompt: string): Promise<string> {
  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) throw new Error("LOVABLE_API_KEY not configured");
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
      temperature: 0.6, max_tokens: 8192,
      response_format: { type: "json_object" },
    }),
  });
  if (!res.ok) {
    if (res.status === 429) throw new Error("RATE_LIMIT");
    if (res.status === 402) throw new Error("PAYMENT_REQUIRED");
    throw new Error(`Lovable AI error ${res.status}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || "";
}

async function callGeminiDirect(systemPrompt: string, userPrompt: string): Promise<string> {
  const key = Deno.env.get("GEMINI_API_KEY");
  if (!key) throw new Error("GEMINI_API_KEY not configured");
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(key)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        generationConfig: { temperature: 0.6, maxOutputTokens: 8192, responseMimeType: "application/json" },
      }),
    },
  );
  if (!res.ok) {
    if (res.status === 429) throw new Error("RATE_LIMIT");
    throw new Error(`Gemini API error ${res.status}`);
  }
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  try {
    const body = (await req.json()) as RequestBody;
    const { notes = [], num_questions = 5, difficulty = "medium", aiProvider = "lovable" } = body;

    if (!notes.length) {
      return new Response(JSON.stringify({ error: "No notes provided." }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const notesSummary = notes.slice(0, 15).map(n => `## ${n.title}${n.subject ? ` [${n.subject}]` : ""}\n${n.content ?? "(no content)"}`).join("\n\n");

    const systemPrompt = `You are a university exam question generator. Given study notes, create multiple-choice questions (MCQs) that test conceptual understanding. Each question must have exactly 4 options with exactly one correct answer. Provide a brief explanation referencing the source material.\n\nYou must respond with ONLY a valid JSON object: {"flashcards":[{"question":"...","options":["A","B","C","D"],"correctIndex":0,"explanation":"..."}]}\ncorrectIndex is 0-based.`;
    const userPrompt = `Create exactly ${num_questions} MCQ questions at ${difficulty} difficulty from these study notes. Return ONLY the JSON.\n\n${notesSummary}`;

    let textResult: string;
    try {
      textResult = aiProvider === "gemini" ? await callGeminiDirect(systemPrompt, userPrompt) : await callLovableAI(systemPrompt, userPrompt);
    } catch (e: any) {
      if (e.message === "RATE_LIMIT") {
        return new Response(JSON.stringify({ error: "Rate limit exceeded." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (e.message === "PAYMENT_REQUIRED") {
        return new Response(JSON.stringify({ error: "Payment required." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      throw e;
    }

    if (!textResult) {
      return new Response(JSON.stringify({ error: "AI returned empty response." }), { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    let flashcards: unknown[];
    try {
      const parsed = JSON.parse(textResult);
      flashcards = Array.isArray(parsed?.flashcards) ? parsed.flashcards : (Array.isArray(parsed) ? parsed : []);
    } catch {
      return new Response(JSON.stringify({ error: "Failed to parse AI response." }), { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ flashcards }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    console.error("flashcards-from-notes error:", err);
    return new Response(JSON.stringify({ error: "Unexpected error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
