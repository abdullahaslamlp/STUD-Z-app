import GlassCard from "@/components/GlassCard";
import { Badge } from "@/components/ui/badge";
import { Bot } from "lucide-react";

export default function AIProviderSelector() {
  return (
    <GlassCard blocky className="space-y-3">
      <h3 className="font-display font-semibold text-foreground text-sm">AI Provider</h3>
      <div className="flex items-center gap-2 p-3 border-2 border-primary bg-primary/10 text-primary">
        <Bot size={18} />
        <div className="text-left">
          <p className="text-sm font-semibold">Gemini API</p>
          <p className="text-[10px] opacity-70">Using your own API key (free tier)</p>
        </div>
      </div>
      <Badge variant="outline" className="rounded-none text-[10px]">
        Using Gemini API — no credit usage
      </Badge>
    </GlassCard>
  );
}
