import GlassCard from "@/components/GlassCard";
import { TrendingUp } from "lucide-react";
import abdullahImg from "@/assets/abdullah.jpeg";

const founders = [
  {
    name: "Abdullah Aslam",
    role: "Creator of Stud-Z",
    title: "Solo Developer & Designer",
    icon: TrendingUp,
    color: "blue" as const,
    image: abdullahImg,
  },
];

export default function About() {
  return (
    <div className="min-h-screen pt-24 pb-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-slide-up">
          <h1 className="text-4xl sm:text-5xl font-display font-bold mb-4 text-foreground">
            Meet the <span className="text-primary">Creator</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto text-lg">
            Stud-Z is a personal project built to make studying smarter, not harder.
          </p>
        </div>

        {/* Project info */}
        <GlassCard blocky className="max-w-3xl mx-auto mb-12 px-6 py-5">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Stud‑Z (Study‑Gen Z) is an AI‑powered study companion web app built with React, Supabase, and Lovable AI that helps students organize tasks, take structured notes, upload PDFs/DOCX for automatic note extraction, and generate personalized MCQ flashcard quizzes and study plans from their own content.
          </p>
        </GlassCard>

        {/* Creator */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto mb-24">
          {founders.map((f) => (
            <GlassCard key={f.role} blocky className="text-center space-y-4">
              <div className="w-20 h-20 mx-auto overflow-hidden bg-muted flex items-center justify-center pixel-border-sm rounded-none">
                {f.image ? (
                  <img src={f.image} alt={f.name} className="w-full h-full object-cover" />
                ) : (
                  <f.icon size={32} className="text-muted-foreground" />
                )}
              </div>
              <div>
                <h3 className="font-display font-semibold text-lg text-foreground">{f.name}</h3>
                <p className="text-sm text-primary font-medium">{f.role}</p>
                <p className="text-xs text-muted-foreground">{f.title}</p>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* No team recruiting section — Stud-Z is currently a solo project. */}
      </div>
    </div>
  );
}
