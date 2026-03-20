import GlassCard from "@/components/GlassCard";
import { Badge } from "@/components/ui/badge";
import { Zap, BookOpen, Brain, Mic, Clock, Shield } from "lucide-react";

const features = [
  {
    icon: Mic,
    title: "LiveSync Audio",
    desc: "Record your lectures and get instant, simplified transcripts powered by AI. Never miss a word again — even when the prof speed-runs through 50 slides. It's giving secretary energy 💅",
    color: "bg-primary",
    inProgress: true,
  },
  {
    icon: BookOpen,
    title: "Flashcard Forge",
    desc: "One-click conversion from your notes to active recall flashcard sets. Spaced repetition built in. Your brain will lowkey thank you 🧠",
    color: "bg-secondary",
  },
  {
    icon: Brain,
    title: "Brain-Dump Chat",
    desc: "A personalized AI tutor trained only on YOUR specific class notes. Ask it anything — it's like having a study bestie who actually paid attention 💀",
    color: "bg-accent",
  },
  {
    icon: Clock,
    title: "Cram Mode",
    desc: "Finals tomorrow? Cram Mode condenses your entire semester's notes into bite-sized summaries prioritized by exam relevance.",
    color: "bg-primary",
    inProgress: true,
  },
  {
    icon: Zap,
    title: "Smart Highlights",
    desc: "AI automatically highlights the most important concepts, formulas, and definitions across all your notes. No more yellow-highlighter roulette.",
    color: "bg-secondary",
  },
  {
    icon: Shield,
    title: "Privacy First",
    desc: "Your notes stay yours. End-to-end encryption and zero data selling. We're students too — we know how sketchy that feels.",
    color: "bg-accent",
  },
];

export default function Services() {
  return (
    <div className="min-h-screen pt-24 pb-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-slide-up">
          <h1 className="text-4xl sm:text-5xl font-display font-bold mb-4 text-foreground">
            Our <span className="text-primary">Features</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto text-lg">
            Every tool you need to ace your studies — all in one place.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((f, i) => (
            <GlassCard key={f.title} blocky className="space-y-4" style={{ animationDelay: `${i * 100}ms` }}>
              <div className={`w-12 h-12 rounded-none ${f.color} flex items-center justify-center pixel-border-sm`}>
                <f.icon size={24} className="text-primary-foreground" />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {(f as { inProgress?: boolean }).inProgress && (
                  <Badge variant="secondary" className="rounded-none text-[10px] font-normal">In progress</Badge>
                )}
                <h3 className="font-display font-semibold text-xl text-foreground">{f.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
}
