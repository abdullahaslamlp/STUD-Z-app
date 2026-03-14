import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export type IngestionStatus = "idle" | "uploading" | "processing" | "done" | "error";

export function useMaterialIngestion() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<IngestionStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const ingest = async (file: File, meta?: { title?: string; subject?: string }) => {
    if (!user) return;
    setError(null);

    try {
      // 1. Upload to storage
      setStatus("uploading");
      const ext = file.name.split(".").pop()?.toLowerCase() || "pdf";
      const filePath = `${user.id}/${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("materials")
        .upload(filePath, file, { contentType: file.type });

      if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

      // 2. Call edge function to extract notes
      setStatus("processing");
      const { data, error: fnError } = await supabase.functions.invoke("ingest-material", {
        body: {
          filePath,
          userId: user.id,
          title: meta?.title || file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
          subject: meta?.subject || null,
        },
      });

      if (fnError) {
        let message = fnError.message;
        if (fnError instanceof FunctionsHttpError && fnError.context) {
          try {
            const body = await fnError.context.json() as { error?: string; details?: string };
            message = body.details ? `${body.error ?? "Error"}: ${body.details}` : (body.error ?? message);
          } catch {
            // keep fnError.message if parsing fails
          }
        }
        throw new Error(message);
      }
      if (data?.error) throw new Error(data.error);

      // 3. Refresh notes list
      queryClient.invalidateQueries({ queryKey: ["study_notes", user.id] });
      setStatus("done");
      toast({ title: "Notes extracted from your document! 📄✨" });

      return data.note;
    } catch (err: any) {
      setStatus("error");
      setError(err.message);
      toast({ title: "Ingestion failed", description: err.message, variant: "destructive" });
    }
  };

  const reset = () => {
    setStatus("idle");
    setError(null);
  };

  return { ingest, status, error, reset };
}
