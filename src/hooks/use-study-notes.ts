import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface StudyNote {
  id: string;
  user_id: string;
  title: string;
  content: string | null;
  subject: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export function useStudyNotes() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const key = ["study_notes", user?.id];

  const query = useQuery({
    queryKey: key,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("study_notes")
        .select("*")
        .eq("user_id", user!.id)
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data as StudyNote[];
    },
    enabled: !!user,
  });

  const addNote = useMutation({
    mutationFn: async (note: Pick<StudyNote, "title" | "content" | "subject" | "tags">) => {
      const { data, error } = await supabase
        .from("study_notes")
        .insert({ ...note, user_id: user!.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key });
      toast({ title: "Note saved! 📝" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const updateNote = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<StudyNote> & { id: string }) => {
      const { error } = await supabase.from("study_notes").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: key }),
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteNote = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("study_notes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key });
      toast({ title: "Note deleted 🗑️" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  return { notes: query.data ?? [], isLoading: query.isLoading, addNote, updateNote, deleteNote };
}
