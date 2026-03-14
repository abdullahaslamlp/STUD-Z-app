// Supabase Edge Function: ai-assistant
// Deno runtime

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

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
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Missing OPENAI_API_KEY environment variable" }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    const body = (await req.json()) as RequestBody;
    const { prompt, tasks = [], notes = [], materials = [] } = body;

    if (!prompt || typeof prompt !== "string") {
      return new Response(
        JSON.stringify({ error: "Missing or invalid 'prompt' in request body" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const tasksSummary =
      tasks.length === 0
        ? "No tasks provided."
        : tasks
            .slice(0, 20)
            .map(
              (t) =>
                `- [${t.status}] (${t.priority}) ${t.title}${
                  t.due_date ? ` (due: ${t.due_date})` : ""
                }${t.description ? ` — ${t.description}` : ""}`,
            )
            .join("\n");

    const notesSummary =
      notes.length === 0
        ? "No notes provided."
        : notes
            .slice(0, 20)
            .map(
              (n) =>
                `- ${n.title}${
                  n.subject ? ` [${n.subject}]` : ""
                }: ${n.content ? n.content.slice(0, 200) : ""}`,
            )
            .join("\n");

    const materialsSummary =
      materials.length === 0
        ? "No materials provided."
        : materials
            .slice(0, 20)
            .map(
              (m) =>
                `- ${m.title}${
                  m.subject ? ` [${m.subject}]` : ""
                }${m.description ? ` — ${m.description}` : ""}`,
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

    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.4,
      }),
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error("OpenAI error:", errorText);
      return new Response(
        JSON.stringify({ error: "LLM request failed", details: errorText }),
        { status: 502, headers: { "Content-Type": "application/json" } },
      );
    }

    const completion = await openaiResponse.json();
    const content =
      completion.choices?.[0]?.message?.content ??
      "I could not generate a response. Please try again.";

    return new Response(JSON.stringify({ text: content }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (err) {
    console.error("ai-assistant error:", err);
    return new Response(
      JSON.stringify({ error: "Unexpected error in ai-assistant function" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
});

