import { useAIProvider, AIProvider } from "@/contexts/AIProviderContext";
import GlassCard from "@/components/GlassCard";
import { Badge } from "@/components/ui/badge";
import { Bot, Sparkles } from "lucide-react";

export default function AIProviderSelector() {
  const { aiProvider, setAIProvider } = useAIProvider();

  const options: { value: AIProvider; label: string; desc: string; icon: typeof Bot }[] = [
    { value: "lovable", label: "Lovable AI", desc: "Built-in, no key needed", icon: Sparkles },
    { value: "gemini", label: "Gemini API", desc: "Your own API key", icon: Bot },
  ];

  return (
    <GlassCard blocky className="space-y-3">
      <h3 className="font-display font-semibold text-foreground text-sm">AI Provider</h3>
      <div className="flex gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setAIProvider(opt.value)}
            className={`flex-1 flex items-center gap-2 p-3 border-2 transition-colors ${
              aiProvider === opt.value
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-background text-muted-foreground hover:border-muted-foreground"
            }`}
          >
            <opt.icon size={18} />
            <div className="text-left">
              <p className="text-sm font-semibold">{opt.label}</p>
              <p className="text-[10px] opacity-70">{opt.desc}</p>
            </div>
          </button>
        ))}
      </div>
      <Badge variant="outline" className="rounded-none text-[10px]">
        {aiProvider === "lovable" ? "Using Lovable AI Gateway" : "Using your Gemini API key"}
      </Badge>
    </GlassCard>
  );
}
