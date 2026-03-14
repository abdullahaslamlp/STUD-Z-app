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
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "Missing LOVABLE_API_KEY" }), {
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

    const systemPrompt = `You are a university exam question generator. Given study notes, create multiple-choice questions (MCQs) that test conceptual understanding. Each question must have exactly 4 options with exactly one correct answer. Provide a brief explanation referencing the source material.`;

    const userPrompt = `Create exactly ${num_questions} MCQ questions at ${difficulty} difficulty from these study notes:\n\n${notesSummary}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.6,
        tools: [
          {
            type: "function",
            function: {
              name: "return_flashcards",
              description: "Return the generated MCQ flashcards as structured data.",
              parameters: {
                type: "object",
                properties: {
                  flashcards: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        question: { type: "string" },
                        options: {
                          type: "array",
                          items: { type: "string" },
                          minItems: 4,
                          maxItems: 4,
                        },
                        correctIndex: {
                          type: "integer",
                          description: "0-based index of the correct option",
                        },
                        explanation: { type: "string" },
                      },
                      required: ["question", "options", "correctIndex", "explanation"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["flashcards"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "return_flashcards" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI usage limit reached. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI request failed", details: errorText }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const completion = await response.json();

    // Extract tool call result
    const toolCall = completion.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      return new Response(JSON.stringify({ error: "AI did not return structured flashcards." }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let flashcards;
    try {
      const parsed = JSON.parse(toolCall.function.arguments);
      flashcards = parsed.flashcards;
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
