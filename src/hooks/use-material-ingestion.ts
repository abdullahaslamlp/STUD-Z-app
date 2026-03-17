import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useAIProvider } from "@/contexts/AIProviderContext";

export type IngestionStatus = "idle" | "uploading" | "processing" | "done" | "error";

export function useMaterialIngestion() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { aiProvider } = useAIProvider();
  const [status, setStatus] = useState<IngestionStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const ingest = async (file: File, meta?: { title?: string; subject?: string }) => {
    if (!user) return;
    setError(null);

    try {
      setStatus("uploading");
      const ext = file.name.split(".").pop()?.toLowerCase() || "pdf";
      const filePath = `${user.id}/${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("materials")
        .upload(filePath, file, { contentType: file.type });

      if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

      setStatus("processing");
      const { data, error: fnError } = await supabase.functions.invoke("ingest-material", {
        body: {
          filePath,
          userId: user.id,
          title: meta?.title || file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
          subject: meta?.subject || null,
          aiProvider,
        },
      });

      if (fnError) {
        let message = fnError.message;
        if (fnError instanceof FunctionsHttpError && fnError.context) {
          try {
            const body = (await fnError.context.json()) as { error?: string; details?: string };
            message = body.details ? `${body.error ?? "Error"}: ${body.details}` : (body.error ?? message);
          } catch { /* keep fnError.message */ }
        }
        throw new Error(message);
      }
      if (data?.error) throw new Error(data.error);

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

  const reset = () => { setStatus("idle"); setError(null); };

  return { ingest, status, error, reset };
}
