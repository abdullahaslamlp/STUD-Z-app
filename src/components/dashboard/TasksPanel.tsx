import { useState } from "react";
import { useTasks, Task } from "@/hooks/use-tasks";
import GlassCard from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, CheckCircle2, Circle, Clock } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function TasksPanel() {
  const { tasks, isLoading, addTask, updateTask, deleteTask } = useTasks();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");

  const handleAdd = () => {
    if (!title.trim()) return;
    addTask.mutate({
      title: title.trim(),
      description: description.trim() || null,
      priority,
      due_date: dueDate || null,
    });
    setTitle("");
    setDescription("");
    setPriority("medium");
    setDueDate("");
    setShowForm(false);
  };

  const toggleStatus = (task: Task) => {
    updateTask.mutate({
      id: task.id,
      status: task.status === "done" ? "pending" : "done",
    });
  };

  const priorityColor: Record<string, string> = {
    high: "bg-destructive/10 text-destructive border-destructive/30",
    medium: "bg-accent/10 text-accent border-accent/30",
    low: "bg-secondary/10 text-secondary border-secondary/30",
  };

  if (isLoading) return <GlassCard blocky className="animate-pulse h-40" />;

  return (
    <GlassCard blocky className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
          <Clock size={20} className="text-accent" /> Tasks
          <Badge variant="secondary" className="rounded-none text-xs">{tasks.length}</Badge>
        </h3>
        <Button variant="blocky-outline" size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus size={14} className="mr-1" /> Add
        </Button>
      </div>

      {showForm && (
        <div className="space-y-2 p-3 border-2 border-border bg-muted/30">
          <Input
            placeholder="Task title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="rounded-none border-2 border-border h-9 text-sm"
          />
          <Input
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="rounded-none border-2 border-border h-9 text-sm"
          />
          <div className="flex gap-2">
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger className="rounded-none border-2 border-border h-9 text-sm w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="rounded-none border-2 border-border h-9 text-sm flex-1"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="blocky-outline" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button variant="blocky" size="sm" onClick={handleAdd} disabled={addTask.isPending}>
              Save Task
            </Button>
          </div>
        </div>
      )}

      {tasks.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">No tasks yet. Add your first one!</p>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`flex items-center gap-3 p-3 border-2 border-border transition-colors ${
                task.status === "done" ? "bg-muted/40 opacity-60" : "bg-card"
              }`}
            >
              <button onClick={() => toggleStatus(task)} className="text-muted-foreground hover:text-primary">
                {task.status === "done" ? <CheckCircle2 size={18} className="text-secondary" /> : <Circle size={18} />}
              </button>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${task.status === "done" ? "line-through" : ""}`}>
                  {task.title}
                </p>
                {task.description && (
                  <p className="text-xs text-muted-foreground truncate">{task.description}</p>
                )}
              </div>
              <Badge variant="outline" className={`rounded-none text-[10px] ${priorityColor[task.priority]}`}>
                {task.priority}
              </Badge>
              <button onClick={() => deleteTask.mutate(task.id)} className="text-muted-foreground hover:text-destructive">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}
