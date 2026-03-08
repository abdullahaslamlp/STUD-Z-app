import GlassCard from "@/components/GlassCard";
import { Globe, Server, Database, Cpu } from "lucide-react";

const stack = [
  {
    category: "Frontend",
    tech: "Next.js",
    desc: "React-based framework for blazing-fast, SEO-friendly pages with server-side rendering.",
    icon: Globe,
    glow: "blue" as const,
  },
  {
    category: "Hosting",
    tech: "Vercel",
    desc: "Edge-deployed globally for instant load times. Your notes load before you can blink.",
    icon: Server,
    glow: "purple" as const,
  },
  {
    category: "AI Processing",
    tech: "Python / FastAPI",
    desc: "Lightning-fast AI pipeline for transcription, summarization, and smart flashcard generation.",
    icon: Cpu,
    glow: "blue" as const,
  },
  {
    category: "Database",
    tech: "PostgreSQL",
    desc: "Rock-solid, secure storage for all your notes, flashcards, and study data. Enterprise-grade reliability.",
    icon: Database,
    glow: "purple" as const,
  },
];

export default function TechStack() {
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-slide-up">
          <h1 className="text-4xl sm:text-5xl font-display font-bold mb-4">
            Our <span className="text-gradient-neon">Tech Stack</span> 🛠️
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto text-lg">
            Built with the best tools in the game. No compromises.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {stack.map((s) => (
            <GlassCard key={s.tech} glow={s.glow} className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-neon flex items-center justify-center">
                  <s.icon size={24} className="text-primary-foreground" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">{s.category}</p>
                  <h3 className="font-display font-bold text-xl">{s.tech}</h3>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
}
