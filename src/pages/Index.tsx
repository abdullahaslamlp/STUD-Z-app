import { Button } from "@/components/ui/button";
import GlassCard from "@/components/GlassCard";
import { Link } from "react-router-dom";
import { Zap, BookOpen, Brain, X, Check } from "lucide-react";
import heroImg from "@/assets/hero-students.jpg";
import logo from "@/assets/stud-z-logo.png";

const oldWay = [
  "Typing notes while missing half the lecture",
  "Manually making flashcards at 1 AM",
  "Ctrl+F-ing through 200 slides before finals",
  "Stress. Burnout. Repeat. 😩",
];

const studZWay = [
  "Instant AI transcription — just hit record",
  "Auto-generated flashcards in one click",
  "Chat with your notes like they're a tutor",
  "2:00 AM cram-session savior ⚡",
];

export default function Index() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImg} alt="Students studying" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/90 to-background" />
        </div>

        <div className="container mx-auto px-4 relative z-10 pt-24">
          <div className="max-w-3xl mx-auto text-center space-y-6 animate-slide-up">
            <img src={logo} alt="Stud-Z" className="h-24 w-24 mx-auto animate-float rounded-2xl" />
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-bold leading-tight">
              Study Smarter,{" "}
              <span className="text-gradient-neon">Not Harder</span> 🧠
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              The AI-powered companion that turns your lecture chaos into organized genius. Built by Gen Z, for Gen Z.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button variant="neon" size="lg" className="text-base">
                Get Started Free 🚀
              </Button>
              <Link to="/services">
                <Button variant="neon-outline" size="lg" className="text-base w-full sm:w-auto">
                  Explore Features
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Problem / Solution */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-center mb-4">
            Why <span className="text-gradient-neon">Stud-Z</span>? 🤔
          </h2>
          <p className="text-center text-muted-foreground mb-16 max-w-xl mx-auto">
            We get it. Traditional studying is broken. Here's how we fix it.
          </p>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <GlassCard className="space-y-4 border-destructive/30">
              <h3 className="font-display text-xl font-semibold text-destructive flex items-center gap-2">
                <X size={20} /> The Old Way 😤
              </h3>
              <ul className="space-y-3">
                {oldWay.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-muted-foreground text-sm">
                    <X size={16} className="text-destructive mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </GlassCard>

            <GlassCard glow="blue" className="space-y-4">
              <h3 className="font-display text-xl font-semibold text-primary flex items-center gap-2">
                <Zap size={20} /> The Stud-Z Way ⚡
              </h3>
              <ul className="space-y-3">
                {studZWay.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-muted-foreground text-sm">
                    <Check size={16} className="text-primary mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* Quick Features */}
      <section className="py-24 bg-card/20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-center mb-16">
            Core <span className="text-gradient-neon">Superpowers</span> 💪
          </h2>

          <div className="grid sm:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { icon: Zap, title: "LiveSync Audio", desc: "Record & get instant simplified transcripts", color: "blue" as const },
              { icon: BookOpen, title: "Flashcard Forge", desc: "One-click notes to active recall sets", color: "purple" as const },
              { icon: Brain, title: "Brain-Dump Chat", desc: "AI tutor trained on your class notes", color: "blue" as const },
            ].map((f) => (
              <GlassCard key={f.title} glow={f.color} className="text-center space-y-3">
                <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-neon flex items-center justify-center">
                  <f.icon size={24} className="text-primary-foreground" />
                </div>
                <h3 className="font-display font-semibold text-lg">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </GlassCard>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/services">
              <Button variant="neon-outline" size="lg">See All Features →</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
