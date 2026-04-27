import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface Subject { id: string; user_id: string; name: string; code: string | null; color: string; }
export interface Teacher { id: string; user_id: string; name: string; email: string | null; }
export interface Room { id: string; user_id: string; name: string; building: string | null; }
export interface ClassSchedule {
  id: string; user_id: string; subject_id: string; teacher_id: string | null; room_id: string | null;
  day_of_week: number; start_time: string; end_time: string;
  recurrence: string; term_start: string | null; term_end: string | null; notes: string | null;
}

function makeListHook<T>(table: "subjects" | "teachers" | "rooms" | "class_schedules", successLabel: string) {
  return function useEntity() {
    const { user } = useAuth();
    const { toast } = useToast();
    const qc = useQueryClient();
    const key = [table, user?.id];

    const query = useQuery({
      queryKey: key,
      queryFn: async () => {
        const { data, error } = await supabase.from(table).select("*").eq("user_id", user!.id).order("created_at");
        if (error) throw error;
        return data as T[];
      },
      enabled: !!user,
    });

    const add = useMutation({
      mutationFn: async (payload: Partial<T>) => {
        const { data, error } = await supabase.from(table).insert({ ...payload, user_id: user!.id } as any).select().single();
        if (error) throw error;
        return data;
      },
      onSuccess: () => { qc.invalidateQueries({ queryKey: key }); toast({ title: `${successLabel} added ✅` }); },
      onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
    });

    const update = useMutation({
      mutationFn: async ({ id, ...updates }: { id: string } & Partial<T>) => {
        const { error } = await supabase.from(table).update(updates as any).eq("id", id);
        if (error) throw error;
      },
      onSuccess: () => qc.invalidateQueries({ queryKey: key }),
      onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
    });

    const remove = useMutation({
      mutationFn: async (id: string) => {
        const { error } = await supabase.from(table).delete().eq("id", id);
        if (error) throw error;
      },
      onSuccess: () => { qc.invalidateQueries({ queryKey: key }); toast({ title: `${successLabel} removed 🗑️` }); },
      onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
    });

    return { items: (query.data ?? []) as T[], isLoading: query.isLoading, add, update, remove };
  };
}

export const useSubjects = makeListHook<Subject>("subjects", "Subject");
export const useTeachers = makeListHook<Teacher>("teachers", "Teacher");
export const useRooms = makeListHook<Room>("rooms", "Room");
export const useSchedules = makeListHook<ClassSchedule>("class_schedules", "Class");