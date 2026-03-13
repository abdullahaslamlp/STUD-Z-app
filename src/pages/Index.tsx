import { Button } from "@/components/ui/button";
import GlassCard from "@/components/GlassCard";
import { Link } from "react-router-dom";
import { Zap, BookOpen, Brain, X, Check, Star, Quote } from "lucide-react";
import heroImg from "@/assets/hero-students.jpg";
import logo from "@/assets/stud-z-logo.png";

const oldWay = [
  "Typing notes while missing half the lecture",
  "Manually making flashcards at 1 AM",
  "Ctrl+F-ing through 200 slides before finals",
  "Stress. Burnout. Repeat.",
];

const studZWay = [
  "Instant AI transcription — just hit record",
  "Auto-generated flashcards in one click",
  "Chat with your notes like they're a tutor",
  "Your 2 AM cram-session savior",
];

const testimonials = [
  {
    name: "Fatima Raza",
    university: "LUMS, Lahore",
    text: "Stud-Z literally saved my CGPA last semester. I recorded every lecture and the AI summaries were better than my own notes. 10/10 recommend!",
    rating: 5,
  },
  {
    name: "Ahmed Khan",
    university: "NUST, Islamabad",
    text: "The flashcard feature is insane. I used to spend hours making Anki decks — now it takes one click. My friends think I've become a genius overnight.",
    rating: 5,
  },
  {
    name: "Ayesha Malik",
    university: "FAST, Karachi",
    text: "Brain-Dump Chat is like having a TA who's available 24/7. I asked it questions about my DSA notes at 3 AM before my final and it actually helped me pass.",
    rating: 5,
  },
  {
    name: "Usman Ali",
    university: "UET, Lahore",
    text: "As an engineering student, I have way too many formulas to memorize. Smart Highlights picks out exactly what I need. This app understands the struggle.",
    rating: 4,
  },
  {
    name: "Zainab Iqbal",
    university: "AKU, Karachi",
    text: "Cram Mode before my anatomy final was a lifesaver. It condensed 16 weeks into the most important points. I actually slept before the exam for once!",
    rating: 5,
  },
  {
    name: "Bilal Hussain",
    university: "COMSATS, Islamabad",
    text: "I was skeptical at first, but after using Stud-Z for one week I couldn't go back. The transcription quality is surprisingly good even with my professor's accent.",
    rating: 4,
  },
];

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImg} alt="Students studying together" className="w-full h-full object-cover opacity-10" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
        </div>

        <div className="container mx-auto px-4 relative z-10 pt-24">
          <div className="max-w-3xl mx-auto text-center space-y-6 animate-slide-up">
            <img src={logo} alt="Stud-Z" className="h-20 w-20 mx-auto rounded-xl pixel-border" />
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-bold leading-tight text-foreground">
              Study Smarter,{" "}
              <span className="text-primary">Not Harder</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              The AI-powered companion that turns your lecture chaos into organized genius. Built by students, for students.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link to="/auth">
                <Button variant="blocky" size="lg" className="text-base">
                  Get Started Free →
                </Button>
              </Link>
              <Link to="/services">
                <Button variant="blocky-outline" size="lg" className="text-base w-full sm:w-auto">
                  Explore Features
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Problem / Solution */}
      <section className="py-24 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-center mb-4 text-foreground">
            Why <span className="text-primary">Stud-Z</span>?
          </h2>
          <p className="text-center text-muted-foreground mb-16 max-w-xl mx-auto">
            Traditional studying is broken. Here's how we fix it.
          </p>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <GlassCard blocky className="space-y-4 border-destructive/40">
              <h3 className="font-display text-xl font-semibold text-destructive flex items-center gap-2">
                <X size={20} /> The Old Way
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

            <GlassCard blocky glow="blue" className="space-y-4 border-primary/40">
              <h3 className="font-display text-xl font-semibold text-primary flex items-center gap-2">
                <Zap size={20} /> The Stud-Z Way
              </h3>
              <ul className="space-y-3">
                {studZWay.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-muted-foreground text-sm">
                    <Check size={16} className="text-secondary mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-center mb-16 text-foreground">
            Core <span className="text-secondary">Superpowers</span>
          </h2>

          <div className="grid sm:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { icon: Zap, title: "LiveSync Audio", desc: "Record & get instant simplified transcripts", color: "bg-primary" },
              { icon: BookOpen, title: "Flashcard Forge", desc: "One-click notes to active recall sets", color: "bg-secondary" },
              { icon: Brain, title: "Brain-Dump Chat", desc: "AI tutor trained on your class notes", color: "bg-accent" },
            ].map((f) => (
              <GlassCard key={f.title} blocky className="text-center space-y-3">
                <div className={`w-12 h-12 mx-auto rounded-none ${f.color} flex items-center justify-center pixel-border-sm`}>
                  <f.icon size={24} className="text-primary-foreground" />
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </GlassCard>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/services">
              <Button variant="blocky-outline" size="lg">See All Features →</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Student Testimonials */}
      <section className="py-24 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-center mb-4 text-foreground">
            What <span className="text-primary">Students</span> Say
          </h2>
          <p className="text-center text-muted-foreground mb-16 max-w-xl mx-auto">
            Real reviews from real students across Pakistan.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {testimonials.map((t) => (
              <GlassCard key={t.name} blocky className="space-y-4 flex flex-col">
                <Quote size={24} className="text-primary/40" />
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">"{t.text}"</p>
                <div className="pt-2 border-t-2 border-border">
                  <div className="flex items-center gap-1 mb-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={i < t.rating ? "text-accent fill-accent" : "text-border"}
                      />
                    ))}
                  </div>
                  <p className="font-display font-semibold text-sm text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.university}</p>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
