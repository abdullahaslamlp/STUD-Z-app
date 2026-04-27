import GlassCard from "@/components/GlassCard";
import { TrendingUp, Linkedin, Github } from "lucide-react";
import abdullahImg from "@/assets/abdullah.jpeg";
import SEO from "@/components/SEO";

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
      <SEO
        title="About Stud-Z (StudZ) — Built by Abdullah Aslam"
        description="Meet the creator of Stud-Z (StudZ), an AI-powered study companion for Gen Z students. Built solo by Abdullah Aslam."
        path="/about"
      />
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 animate-slide-up">
          <h1 className="text-4xl sm:text-5xl font-display font-bold mb-4 text-foreground">
            Meet the <span className="text-primary">Creator</span>
          </h1>
        </div>

        {/* Creator — centered under heading */}
        <div className="flex justify-center mb-8">
          {founders.map((f) => (
            <GlassCard key={f.role} blocky className="text-center space-y-4 w-full max-w-sm">
              <div className="w-24 h-24 mx-auto overflow-hidden bg-muted flex items-center justify-center pixel-border-sm rounded-none">
                {f.image ? (
                  <img src={f.image} alt={f.name} className="w-full h-full object-cover" />
                ) : (
                  <f.icon size={32} className="text-muted-foreground" />
                )}
              </div>
              <div>
                <h3 className="font-display font-semibold text-xl text-foreground">{f.name}</h3>
                <p className="text-sm text-primary font-medium">{f.role}</p>
                <p className="text-xs text-muted-foreground">{f.title}</p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <a href="https://www.linkedin.com/in/abdullahaslamlp/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                  <Linkedin size={20} />
                </a>
                <a href="https://github.com/abdullahaslamlp" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                  <Github size={20} />
                </a>
              </div>
            </GlassCard>
          ))}
        </div>

        <p className="text-muted-foreground max-w-xl mx-auto text-lg text-center mb-12">
          Built different. Built for us. No cap. 🔥
        </p>

        {/* Project info */}
        <GlassCard blocky className="max-w-3xl mx-auto px-6 py-5">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Stud‑Z (Study‑Gen Z) is an AI‑powered study companion web app built with React, Supabase, and Lovable AI that helps students organize tasks, take structured notes, upload PDFs/DOCX for automatic note extraction, and generate personalized MCQ flashcard quizzes and study plans from their own content.
          </p>
        </GlassCard>
      </div>
    </div>
  );
}
