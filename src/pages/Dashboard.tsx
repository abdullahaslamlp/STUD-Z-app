import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import GlassCard from "@/components/GlassCard";
import { BookOpen, Brain, Zap, LogOut } from "lucide-react";

export default function Dashboard() {
  const { user, signOut } = useAuth();

  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Student";

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
            { icon: BookOpen, label: "Study Notes", value: "0", color: "text-primary" },
            { icon: Brain, label: "AI Sessions", value: "0", color: "text-secondary" },
            { icon: Zap, label: "Tasks Due", value: "0", color: "text-accent" },
          ].map((stat) => (
            <GlassCard key={stat.label} blocky className="flex items-center gap-4">
              <stat.icon size={28} className={stat.color} />
              <div>
                <p className="text-2xl font-display font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Placeholder for Phase 2 */}
        <GlassCard blocky className="text-center py-12 space-y-3">
          <Brain size={48} className="mx-auto text-primary/40" />
          <h2 className="font-display text-xl font-semibold text-foreground">Your Study Hub</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            This is where your notes, tasks, and AI study tools will live. We'll build this out in Phase 2 & 3.
          </p>
        </GlassCard>
      </div>
    </div>
  );
}
