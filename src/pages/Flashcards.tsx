import { useState } from "react";
import { useFlashcards, Flashcard } from "@/hooks/use-flashcards";
import GlassCard from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, ChevronRight, Check, X, RotateCcw, Loader2, Sparkles } from "lucide-react";

export default function Flashcards() {
  const { generate, notesCount } = useFlashcards();
  const [numQuestions, setNumQuestions] = useState("5");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState({ correct: 0, wrong: 0 });

  const handleGenerate = async () => {
    setCards([]);
    setCurrentIndex(0);
    setRevealed(false);
    setSelected(null);
    setScore({ correct: 0, wrong: 0 });

    const result = await generate.mutateAsync({ numQuestions: parseInt(numQuestions), difficulty });
    if (result) setCards(result);
  };

  const current = cards[currentIndex];

  const handleSelect = (idx: number) => {
    if (revealed) return;
    setSelected(idx);
    setRevealed(true);
    if (idx === current.correctIndex) {
      setScore((s) => ({ ...s, correct: s.correct + 1 }));
    } else {
      setScore((s) => ({ ...s, wrong: s.wrong + 1 }));
    }
  };

  const handleNext = () => {
    setRevealed(false);
    setSelected(null);
    setCurrentIndex((i) => i + 1);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setRevealed(false);
    setSelected(null);
    setScore({ correct: 0, wrong: 0 });
  };

  const isFinished = cards.length > 0 && currentIndex >= cards.length;

  return (
    <div className="min-h-screen bg-background pt-20 px-4">
      <div className="container mx-auto max-w-3xl py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-3">
            <Brain className="text-primary" size={32} /> Flashcards & Testing
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Generate MCQ quizzes from your study notes using AI.
          </p>
        </div>

        {/* Generator controls */}
        <GlassCard blocky className="space-y-4">
          <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
            <Sparkles size={18} className="text-accent" /> Generate Quiz
          </h3>

          {notesCount === 0 ? (
            <p className="text-sm text-muted-foreground">
              You need to add some study notes first before generating flashcards.
            </p>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Using all <strong>{notesCount}</strong> note{notesCount !== 1 ? "s" : ""} as source material.
              </p>
              <div className="flex flex-wrap gap-3 items-end">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Questions</label>
                  <Select value={numQuestions} onValueChange={setNumQuestions}>
                    <SelectTrigger className="w-24 rounded-none border-2 border-border h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="15">15</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Difficulty</label>
                  <Select value={difficulty} onValueChange={(v) => setDifficulty(v as any)}>
                    <SelectTrigger className="w-28 rounded-none border-2 border-border h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  variant="blocky"
                  size="sm"
                  onClick={handleGenerate}
                  disabled={generate.isPending}
                >
                  {generate.isPending ? (
                    <><Loader2 size={14} className="mr-1 animate-spin" /> Generating...</>
                  ) : (
                    "Generate Quiz"
                  )}
                </Button>
              </div>
            </>
          )}
        </GlassCard>

        {/* Finished summary */}
        {isFinished && (
          <GlassCard blocky className="text-center space-y-4">
            <h3 className="font-display text-2xl font-bold text-foreground">Quiz Complete! 🎉</h3>
            <div className="flex justify-center gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-secondary">{score.correct}</p>
                <p className="text-xs text-muted-foreground">Correct</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-destructive">{score.wrong}</p>
                <p className="text-xs text-muted-foreground">Wrong</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">
                  {Math.round((score.correct / cards.length) * 100)}%
                </p>
                <p className="text-xs text-muted-foreground">Score</p>
              </div>
            </div>
            <Button variant="blocky-outline" size="sm" onClick={handleRestart}>
              <RotateCcw size={14} className="mr-1" /> Try Again
            </Button>
          </GlassCard>
        )}

        {/* Current question */}
        {current && !isFinished && (
          <GlassCard blocky className="space-y-5">
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="rounded-none text-xs">
                Question {currentIndex + 1} / {cards.length}
              </Badge>
              <div className="flex gap-2 text-xs">
                <span className="text-secondary font-semibold">{score.correct} ✓</span>
                <span className="text-destructive font-semibold">{score.wrong} ✗</span>
              </div>
            </div>

            <p className="text-foreground font-semibold text-lg leading-snug">{current.question}</p>

            <div className="space-y-2">
              {current.options.map((opt, idx) => {
                let optionClass = "p-3 border-2 border-border bg-card cursor-pointer hover:border-primary transition-colors text-sm text-foreground";
                if (revealed) {
                  if (idx === current.correctIndex) {
                    optionClass = "p-3 border-2 border-secondary bg-secondary/10 text-sm text-foreground";
                  } else if (idx === selected) {
                    optionClass = "p-3 border-2 border-destructive bg-destructive/10 text-sm text-foreground";
                  } else {
                    optionClass = "p-3 border-2 border-border bg-muted/30 text-sm text-muted-foreground";
                  }
                } else if (idx === selected) {
                  optionClass = "p-3 border-2 border-primary bg-primary/10 text-sm text-foreground";
                }

                return (
                  <button
                    key={idx}
                    className={`w-full text-left flex items-center gap-3 ${optionClass}`}
                    onClick={() => handleSelect(idx)}
                    disabled={revealed}
                  >
                    <span className="font-bold text-muted-foreground min-w-[1.5rem]">
                      {String.fromCharCode(65 + idx)}.
                    </span>
                    {opt}
                    {revealed && idx === current.correctIndex && <Check size={16} className="ml-auto text-secondary" />}
                    {revealed && idx === selected && idx !== current.correctIndex && <X size={16} className="ml-auto text-destructive" />}
                  </button>
                );
              })}
            </div>

            {revealed && (
              <div className="p-3 border-2 border-accent/40 bg-accent/5 text-sm text-foreground space-y-2">
                <p className="font-semibold text-accent text-xs uppercase tracking-wide">Explanation</p>
                <p>{current.explanation}</p>
              </div>
            )}

            {revealed && currentIndex < cards.length - 1 && (
              <div className="flex justify-end">
                <Button variant="blocky" size="sm" onClick={handleNext}>
                  Next <ChevronRight size={14} className="ml-1" />
                </Button>
              </div>
            )}
            {revealed && currentIndex === cards.length - 1 && (
              <div className="flex justify-end">
                <Button variant="blocky" size="sm" onClick={handleNext}>
                  See Results <ChevronRight size={14} className="ml-1" />
                </Button>
              </div>
            )}
          </GlassCard>
        )}
      </div>
    </div>
  );
}
