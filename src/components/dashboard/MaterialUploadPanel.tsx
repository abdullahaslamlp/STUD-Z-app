import { useRef, useState } from "react";
import { useMaterialIngestion, IngestionStatus } from "@/hooks/use-material-ingestion";
import GlassCard from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

const STATUS_CONFIG: Record<IngestionStatus, { label: string; icon: typeof Upload; color: string; progress: number }> = {
  idle: { label: "Ready", icon: Upload, color: "text-muted-foreground", progress: 0 },
  uploading: { label: "Uploading…", icon: Loader2, color: "text-primary", progress: 30 },
  processing: { label: "Extracting notes with AI…", icon: Loader2, color: "text-primary", progress: 70 },
  done: { label: "Done!", icon: CheckCircle, color: "text-green-500", progress: 100 },
  error: { label: "Failed", icon: AlertCircle, color: "text-destructive", progress: 0 },
};

export default function MaterialUploadPanel() {
  const { ingest, status, error, reset } = useMaterialIngestion();
  const fileRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [subject, setSubject] = useState("");

  const cfg = STATUS_CONFIG[status];
  const StatusIcon = cfg.icon;
  const isProcessing = status === "uploading" || status === "processing";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!["pdf", "docx"].includes(ext || "")) {
      alert("Only PDF and DOCX files are supported.");
      return;
    }
    setSelectedFile(file);
    if (status === "done" || status === "error") reset();
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    await ingest(selectedFile, { subject: subject.trim() || undefined });
    setSelectedFile(null);
    setSubject("");
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <GlassCard blocky className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
          <FileText size={20} className="text-primary" /> Upload Study Material
        </h3>
        <Badge variant="secondary" className="rounded-none text-xs">PDF / DOCX</Badge>
      </div>

      <div className="space-y-3">
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.docx"
          onChange={handleFileChange}
          className="hidden"
        />

        <Button
          variant="blocky-outline"
          className="w-full justify-start gap-2"
          onClick={() => fileRef.current?.click()}
          disabled={isProcessing}
        >
          <Upload size={16} />
          {selectedFile ? selectedFile.name : "Choose a file…"}
        </Button>

        {selectedFile && (
          <Input
            placeholder="Subject (optional)"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="rounded-none border-2 border-border h-9 text-sm"
          />
        )}

        {status !== "idle" && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <StatusIcon size={16} className={`${cfg.color} ${isProcessing ? "animate-spin" : ""}`} />
              <span className={cfg.color}>{cfg.label}</span>
            </div>
            {(isProcessing || status === "done") && (
              <Progress value={cfg.progress} className="h-2 rounded-none" />
            )}
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
        )}

        {selectedFile && !isProcessing && status !== "done" && (
          <Button variant="blocky" size="sm" onClick={handleUpload} className="w-full">
            Extract Notes with AI
          </Button>
        )}

        {status === "done" && (
          <p className="text-xs text-muted-foreground text-center">
            ✅ Notes added — check your Study Notes panel!
          </p>
        )}
      </div>
    </GlassCard>
  );
}
