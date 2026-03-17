import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTasks } from "@/hooks/use-tasks";
import { useStudyNotes } from "@/hooks/use-study-notes";
import { useToast } from "@/hooks/use-toast";
import { useAIProvider } from "@/contexts/AIProviderContext";

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
  const { aiProvider } = useAIProvider();

  const mutation = useMutation({
    mutationFn: async ({ prompt, useTasks: ut, useNotes: un, useMaterials: um }: AskOptions) => {
      const { data, error } = await supabase.functions.invoke("ai-assistant", {
        body: {
          prompt,
          tasks: ut ? tasks : [],
          notes: un ? notes : [],
          materials: um ? [] : [],
          aiProvider,
        },
      });
      if (error) throw error;
      return data as { text: string };
    },
    onError: (error: any) => {
      toast({
        title: "AI Assistant error",
        description: error.message ?? "Something went wrong.",
        variant: "destructive",
      });
    },
  });

  return { ask: mutation };
}
