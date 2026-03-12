import GlassCard from "@/components/GlassCard";
import { Globe, Paintbrush, Code, Component } from "lucide-react";

const stack = [
  {
    category: "UI Framework",
    tech: "React + Vite",
    desc: "Blazing-fast development with React 18 and Vite's instant HMR. Build at the speed of thought.",
    icon: Globe,
    color: "bg-primary",
  },
  {
    category: "Styling",
    tech: "Tailwind CSS",
    desc: "Utility-first CSS for rapid, consistent styling. Every component is pixel-perfect and responsive.",
    icon: Paintbrush,
    color: "bg-secondary",
  },
  {
    category: "Language",
    tech: "TypeScript",
    desc: "Type-safe code that catches bugs before they happen. Enterprise-grade reliability from day one.",
    icon: Code,
    color: "bg-accent",
  },
  {
    category: "Components",
    tech: "shadcn/ui",
    desc: "Beautiful, accessible UI components built on Radix primitives. Fully customizable to our design.",
    icon: Component,
    color: "bg-primary",
  },
];

export default function TechStack() {
  return (
    <div className="min-h-screen pt-24 pb-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-slide-up">
          <h1 className="text-4xl sm:text-5xl font-display font-bold mb-4 text-foreground">
            Our <span className="text-secondary">Tech Stack</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto text-lg">
            Built with the best tools in the game. No compromises.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {stack.map((s) => (
            <GlassCard key={s.tech} blocky className="space-y-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-none ${s.color} flex items-center justify-center pixel-border-sm`}>
                  <s.icon size={24} className="text-primary-foreground" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{s.category}</p>
                  <h3 className="font-display font-bold text-xl text-foreground">{s.tech}</h3>
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
