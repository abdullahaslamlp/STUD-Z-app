import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface NoteInput {
  title: string;
  content: string | null;
  subject: string | null;
}

interface RequestBody {
  notes: NoteInput[];
  num_questions: number;
  difficulty?: "easy" | "medium" | "hard";
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  try {
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      return new Response(JSON.stringify({ error: "Missing GEMINI_API_KEY. Set it in Supabase Edge Function secrets." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = (await req.json()) as RequestBody;
    const { notes = [], num_questions = 5, difficulty = "medium" } = body;

    if (!notes.length) {
      return new Response(
        JSON.stringify({ error: "No notes provided. Add some study notes first!" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const notesSummary = notes
      .slice(0, 15)
      .map((n) => `## ${n.title}${n.subject ? ` [${n.subject}]` : ""}\n${n.content ?? "(no content)"}`)
      .join("\n\n");

    const systemPrompt = `You are a university exam question generator. Given study notes, create multiple-choice questions (MCQs) that test conceptual understanding. Each question must have exactly 4 options with exactly one correct answer. Provide a brief explanation referencing the source material.

You must respond with ONLY a valid JSON object, no other text or markdown. The JSON must have this exact structure:
{"flashcards":[{"question":"...","options":["A","B","C","D"],"correctIndex":0,"explanation":"..."}]}
correctIndex is 0-based (0 = first option, 1 = second, etc.).`;

    const userPrompt = `Create exactly ${num_questions} MCQ questions at ${difficulty} difficulty from these study notes. Return ONLY the JSON object with a "flashcards" array.\n\n${notesSummary}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: "user", parts: [{ text: userPrompt }] }],
          generationConfig: {
            temperature: 0.6,
            maxOutputTokens: 8192,
            responseMimeType: "application/json",
          },
        }),
      },
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI request failed", details: errorText }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = await response.json();
    const textPart = result.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textPart) {
      return new Response(JSON.stringify({ error: "AI did not return structured flashcards." }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let flashcards: unknown[];
    try {
      const parsed = JSON.parse(textPart.trim());
      flashcards = Array.isArray(parsed?.flashcards) ? parsed.flashcards : (Array.isArray(parsed) ? parsed : []);
    } catch {
      return new Response(JSON.stringify({ error: "Failed to parse AI response." }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ flashcards }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("flashcards-from-notes error:", err);
    return new Response(JSON.stringify({ error: "Unexpected error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
