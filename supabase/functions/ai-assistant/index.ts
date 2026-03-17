import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface Task { id: string; title: string; description: string | null; due_date: string | null; priority: string; status: string; }
interface StudyNote { id: string; title: string; content: string | null; subject: string | null; }
interface MaterialsItem { id: string; title: string; description?: string | null; subject?: string | null; }
interface RequestBody {
  prompt: string;
  tasks?: Task[];
  notes?: StudyNote[];
  materials?: MaterialsItem[];
  aiProvider?: "lovable" | "gemini";
}

async function callLovableAI(systemPrompt: string, userPrompt: string): Promise<string> {
  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) throw new Error("LOVABLE_API_KEY not configured");
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
      temperature: 0.4, max_tokens: 8192,
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
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(key)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        generationConfig: { temperature: 0.4, maxOutputTokens: 8192 },
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
    const { prompt, tasks = [], notes = [], materials = [], aiProvider = "lovable" } = body;

    if (!prompt || typeof prompt !== "string") {
      return new Response(JSON.stringify({ error: "Missing 'prompt'" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const tasksSummary = tasks.length === 0 ? "No tasks." : tasks.slice(0, 20).map(t => `- [${t.status}] (${t.priority}) ${t.title}${t.due_date ? ` (due: ${t.due_date})` : ""}${t.description ? ` — ${t.description}` : ""}`).join("\n");
    const notesSummary = notes.length === 0 ? "No notes." : notes.slice(0, 20).map(n => `- ${n.title}${n.subject ? ` [${n.subject}]` : ""}: ${n.content ? n.content.slice(0, 200) : ""}`).join("\n");
    const materialsSummary = materials.length === 0 ? "No materials." : materials.slice(0, 20).map(m => `- ${m.title}${m.subject ? ` [${m.subject}]` : ""}`).join("\n");

    const systemPrompt = "You are Stud-Z, an AI study companion for university students. You help students turn their tasks, notes, and materials into clear, actionable study plans. You are concise, encouraging, and practical. Always answer as if you are personally mentoring the student, and try to give them a concrete next 1–3 actions they can take.";
    const userPrompt = `User question:\n${prompt}\n\nContext:\nTasks:\n${tasksSummary}\n\nNotes:\n${notesSummary}\n\nMaterials:\n${materialsSummary}\n\nGive a helpful, structured response with:\n1) A short summary.\n2) A prioritized mini-study plan.\n3) Smart tips based on their context.`;

    let content: string;
    try {
      content = aiProvider === "gemini" ? await callGeminiDirect(systemPrompt, userPrompt) : await callLovableAI(systemPrompt, userPrompt);
    } catch (e: any) {
      if (e.message === "RATE_LIMIT") {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (e.message === "PAYMENT_REQUIRED") {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      throw e;
    }

    return new Response(JSON.stringify({ text: content || "I could not generate a response." }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("ai-assistant error:", err);
    return new Response(JSON.stringify({ error: "Unexpected error in ai-assistant" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
