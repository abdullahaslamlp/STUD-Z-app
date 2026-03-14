import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTasks } from "@/hooks/use-tasks";
import { useStudyNotes } from "@/hooks/use-study-notes";
import { useToast } from "@/hooks/use-toast";

export interface AssistantMessage {
  role: "user" | "assistant";
  content: string;
}

interface AskOptions {
  prompt: string;
  useTasks: boolean;
  useNotes: boolean;
  useMaterials: boolean;
}

export function useAIAssistant() {
  const { tasks } = useTasks();
  const { notes } = useStudyNotes();
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async ({ prompt, useTasks, useNotes, useMaterials }: AskOptions) => {
      const payload = {
        prompt,
        tasks: useTasks ? tasks : [],
        notes: useNotes ? notes : [],
        // Materials UI not wired yet; keep shape for future extension.
        materials: useMaterials ? [] : [],
      };

      const { data, error } = await supabase.functions.invoke("ai-assistant", {
        body: payload,
      });

      if (error) {
        throw error;
      }

      return data as { text: string };
    },
    onError: (error: any) => {
      toast({
        title: "AI Assistant error",
        description: error.message ?? "Something went wrong while contacting Stud-Z.",
        variant: "destructive",
      });
    },
  });

  return {
    ask: mutation,
  };
}

