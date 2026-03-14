import { useState } from "react";
import GlassCard from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useAIAssistant, AssistantMessage } from "@/hooks/use-ai-assistant";
import { Sparkles, Send } from "lucide-react";

export default function AIAssistantPanel() {
  const { ask } = useAIAssistant();
  const [prompt, setPrompt] = useState("");
  const [useTasks, setUseTasks] = useState(true);
  const [useNotes, setUseNotes] = useState(true);
  const [useMaterials, setUseMaterials] = useState(false);
  const [messages, setMessages] = useState<AssistantMessage[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = prompt.trim();
    if (!trimmed || ask.isPending) return;

    const userMessage: AssistantMessage = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setPrompt("");

    try {
      const result = await ask.mutateAsync({
        prompt: trimmed,
        useTasks,
        useNotes,
        useMaterials,
      });

      const assistantMessage: AssistantMessage = {
        role: "assistant",
        content: result.text,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      // Error toast is handled in the hook
    }
  };

  return (
    <GlassCard blocky className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
          <Sparkles size={20} className="text-secondary" /> AI Study Companion
        </h3>
        <Badge variant="secondary" className="rounded-none text-[10px]">
          Beta
        </Badge>
      </div>

      <p className="text-xs text-muted-foreground">
        Ask Stud-Z to turn your tasks and notes into a focused study plan, summaries, or revision strategy.
      </p>

      <div className="flex flex-wrap gap-3 text-xs">
        <label className="inline-flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={useTasks}
            onChange={(e) => setUseTasks(e.target.checked)}
            className="h-3 w-3 accent-primary"
          />
          <span>Use my tasks</span>
        </label>
        <label className="inline-flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={useNotes}
            onChange={(e) => setUseNotes(e.target.checked)}
            className="h-3 w-3 accent-primary"
          />
          <span>Use my notes</span>
        </label>
        <label className="inline-flex items-center gap-2 cursor-not-allowed opacity-60">
          <input
            type="checkbox"
            checked={useMaterials}
            onChange={(e) => setUseMaterials(e.target.checked)}
            className="h-3 w-3 accent-primary"
            disabled
          />
          <span>Use materials (coming soon)</span>
        </label>
      </div>

      <div className="border-2 border-border bg-muted/40 max-h-64 overflow-y-auto p-3 space-y-2 text-xs">
        {messages.length === 0 ? (
          <p className="text-muted-foreground">
            No conversations yet. Try asking, &quot;Create a 2-hour revision plan for tonight based on my pending tasks&quot;.
          </p>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`p-2 ${
                message.role === "user"
                  ? "bg-background/80 border border-border"
                  : "bg-secondary/10 border border-secondary/40"
              }`}
            >
              <p className="font-semibold mb-1">
                {message.role === "user" ? "You" : "Stud-Z"}
              </p>
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
          ))
        )}
        {ask.isPending && (
          <p className="text-muted-foreground text-xs italic">Stud-Z is thinking…</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-2">
        <Textarea
          placeholder="Ask for a study plan, explanation, or summary..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="rounded-none border-2 border-border text-sm min-h-[80px]"
        />
        <div className="flex justify-end">
          <Button
            type="submit"
            variant="blocky"
            size="sm"
            disabled={ask.isPending || !prompt.trim()}
          >
            <Send size={14} className="mr-1" />
            {ask.isPending ? "Generating..." : "Ask Stud-Z"}
          </Button>
        </div>
      </form>
    </GlassCard>
  );
}

