import { useState } from "react";
import { useStudyNotes } from "@/hooks/use-study-notes";
import GlassCard from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, BookOpen, Pencil } from "lucide-react";

export default function NotesPanel() {
  const { notes, isLoading, addNote, updateNote, deleteNote } = useStudyNotes();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [subject, setSubject] = useState("");

  const resetForm = () => {
    setTitle("");
    setContent("");
    setSubject("");
    setShowForm(false);
    setEditingId(null);
  };

  const handleSave = () => {
    if (!title.trim()) return;
    if (editingId) {
      updateNote.mutate({
        id: editingId,
        title: title.trim(),
        content: content.trim() || null,
        subject: subject.trim() || null,
      });
    } else {
      addNote.mutate({
        title: title.trim(),
        content: content.trim() || null,
        subject: subject.trim() || null,
        tags: [],
      });
    }
    resetForm();
  };

  const startEdit = (note: typeof notes[0]) => {
    setEditingId(note.id);
    setTitle(note.title);
    setContent(note.content ?? "");
    setSubject(note.subject ?? "");
    setShowForm(true);
  };

  if (isLoading) return <GlassCard blocky className="animate-pulse h-40" />;

  return (
    <GlassCard blocky className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
          <BookOpen size={20} className="text-primary" /> Study Notes
          <Badge variant="secondary" className="rounded-none text-xs">{notes.length}</Badge>
        </h3>
        <Button variant="blocky-outline" size="sm" onClick={() => { resetForm(); setShowForm(!showForm); }}>
          <Plus size={14} className="mr-1" /> Add
        </Button>
      </div>

      {showForm && (
        <div className="space-y-2 p-3 border-2 border-border bg-muted/30">
          <Input
            placeholder="Note title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="rounded-none border-2 border-border h-9 text-sm"
          />
          <Input
            placeholder="Subject (optional)"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="rounded-none border-2 border-border h-9 text-sm"
          />
          <Textarea
            placeholder="Write your notes here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="rounded-none border-2 border-border text-sm min-h-[100px]"
          />
          <div className="flex gap-2 justify-end">
            <Button variant="blocky-outline" size="sm" onClick={resetForm}>Cancel</Button>
            <Button variant="blocky" size="sm" onClick={handleSave} disabled={addNote.isPending || updateNote.isPending}>
              {editingId ? "Update" : "Save Note"}
            </Button>
          </div>
        </div>
      )}

      {notes.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">No notes yet. Start writing!</p>
      ) : (
        <div className="space-y-2">
          {notes.map((note) => (
            <div key={note.id} className="p-3 border-2 border-border bg-card space-y-1">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-foreground truncate">{note.title}</h4>
                <div className="flex gap-1">
                  <button onClick={() => startEdit(note)} className="text-muted-foreground hover:text-primary">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => deleteNote.mutate(note.id)} className="text-muted-foreground hover:text-destructive">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              {note.subject && (
                <Badge variant="outline" className="rounded-none text-[10px]">{note.subject}</Badge>
              )}
              {note.content && (
                <p className="text-xs text-muted-foreground line-clamp-2">{note.content}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}
