import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTasks } from "@/hooks/use-tasks";
import { useStudyNotes } from "@/hooks/use-study-notes";
import { Button } from "@/components/ui/button";
import GlassCard from "@/components/GlassCard";
import ProfileCard from "@/components/dashboard/ProfileCard";
import TasksPanel from "@/components/dashboard/TasksPanel";
import NotesPanel from "@/components/dashboard/NotesPanel";
import AIAssistantPanel from "@/components/dashboard/AIAssistantPanel";
import { BookOpen, Brain, Zap, LogOut } from "lucide-react";

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const { tasks } = useTasks();
  const { notes } = useStudyNotes();

  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Student";
  const pendingTasks = tasks.filter((t) => t.status !== "done").length;

  return (
    <div className="min-h-screen bg-background pt-20 px-4">
      <div className="container mx-auto max-w-5xl py-8 space-y-8">
        {/* Welcome Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">
              Hey, <span className="text-primary">{displayName}</span> 👋
            </h1>
            <p className="text-muted-foreground text-sm mt-1">Ready to crush today's study goals?</p>
          </div>
          <Button variant="blocky-outline" size="sm" onClick={signOut}>
            <LogOut size={16} className="mr-1" /> Sign Out
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { icon: BookOpen, label: "Study Notes", value: String(notes.length), color: "text-primary" },
            { icon: Brain, label: "Flashcards", value: "Quiz →", color: "text-secondary", link: "/flashcards" },
            { icon: Zap, label: "Tasks Due", value: String(pendingTasks), color: "text-accent" },
          ].map((stat) => {
            const inner = (
              <GlassCard key={stat.label} blocky className="flex items-center gap-4">
                <stat.icon size={28} className={stat.color} />
                <div>
                  <p className="text-2xl font-display font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </GlassCard>
            );
            return stat.link ? (
              <Link key={stat.label} to={stat.link}>{inner}</Link>
            ) : (
              <div key={stat.label}>{inner}</div>
            );
          })}
        </div>

        {/* Profile */}
        <ProfileCard />

        {/* Tasks & Notes side by side */}
        <div className="grid lg:grid-cols-2 gap-6">
          <TasksPanel />
          <NotesPanel />
        </div>

        {/* AI Study Assistant */}
        <AIAssistantPanel />
      </div>
    </div>
  );
}
