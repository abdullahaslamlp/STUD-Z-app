import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useStudyNotes } from "@/hooks/use-study-notes";
import { useToast } from "@/hooks/use-toast";

export interface Flashcard {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface GenerateOptions {
  numQuestions: number;
  difficulty: "easy" | "medium" | "hard";
}

export function useFlashcards() {
  const { notes } = useStudyNotes();
  const { toast } = useToast();

  const generate = useMutation({
    mutationFn: async ({ numQuestions, difficulty }: GenerateOptions) => {
      if (!notes.length) throw new Error("You need study notes first to generate flashcards.");

      const payload = {
        notes: notes.map((n) => ({ title: n.title, content: n.content, subject: n.subject })),
        num_questions: numQuestions,
        difficulty,
      };

      const { data, error } = await supabase.functions.invoke("flashcards-from-notes", { body: payload });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      return data.flashcards as Flashcard[];
    },
    onError: (error: any) => {
      toast({
        title: "Flashcard generation failed",
        description: error.message ?? "Something went wrong.",
        variant: "destructive",
      });
    },
  });

  return { generate, notesCount: notes.length };
}
