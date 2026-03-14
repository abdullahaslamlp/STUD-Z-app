import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface Task {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  priority: string;
  status: string;
}

interface StudyNote {
  id: string;
  title: string;
  content: string | null;
  subject: string | null;
}

interface MaterialsItem {
  id: string;
  title: string;
  description?: string | null;
  subject?: string | null;
}

interface RequestBody {
  prompt: string;
  tasks?: Task[];
  notes?: StudyNote[];
  materials?: MaterialsItem[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Missing GEMINI_API_KEY. Set it in Supabase Edge Function secrets." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const body = (await req.json()) as RequestBody;
    const { prompt, tasks = [], notes = [], materials = [] } = body;

    if (!prompt || typeof prompt !== "string") {
      return new Response(
        JSON.stringify({ error: "Missing or invalid 'prompt' in request body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const tasksSummary =
      tasks.length === 0
        ? "No tasks provided."
        : tasks
            .slice(0, 20)
            .map(
              (t) =>
                `- [${t.status}] (${t.priority}) ${t.title}${t.due_date ? ` (due: ${t.due_date})` : ""}${t.description ? ` — ${t.description}` : ""}`,
            )
            .join("\n");

    const notesSummary =
      notes.length === 0
        ? "No notes provided."
        : notes
            .slice(0, 20)
            .map(
              (n) =>
                `- ${n.title}${n.subject ? ` [${n.subject}]` : ""}: ${n.content ? n.content.slice(0, 200) : ""}`,
            )
            .join("\n");

    const materialsSummary =
      materials.length === 0
        ? "No materials provided."
        : materials
            .slice(0, 20)
            .map(
              (m) =>
                `- ${m.title}${m.subject ? ` [${m.subject}]` : ""}${m.description ? ` — ${m.description}` : ""}`,
            )
            .join("\n");

    const systemPrompt =
      "You are Stud-Z, an AI study companion for university students. " +
      "You help students turn their tasks, notes, and materials into clear, " +
      "actionable study plans. You are concise, encouraging, and practical. " +
      "Always answer as if you are personally mentoring the student, and try " +
      "to give them a concrete next 1–3 actions they can take.";

    const userPrompt = `
User question or request:
${prompt}

Their current study context:

Tasks:
${tasksSummary}

Notes:
${notesSummary}

Materials:
${materialsSummary}

Based on this, give a helpful, structured response with:
1) A short summary in 1–2 sentences.
2) A prioritized mini-study plan.
3) Any smart tips based on their tasks/notes (if provided).
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: "user", parts: [{ text: userPrompt }] }],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 8192,
          },
        }),
      },
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI request failed", details: errorText }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const result = await response.json();
    const textPart = result.candidates?.[0]?.content?.parts?.[0];
    const content =
      textPart?.text?.trim() ?? "I could not generate a response. Please try again.";

    return new Response(JSON.stringify({ text: content }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("ai-assistant error:", err);
    return new Response(
      JSON.stringify({ error: "Unexpected error in ai-assistant function" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
