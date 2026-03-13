import { useState } from "react";
import { useProfile } from "@/hooks/use-profile";
import GlassCard from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Save } from "lucide-react";

export default function ProfileCard() {
  const { profile, isLoading, updateProfile } = useProfile();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    university: "",
    major: "",
    semester: "",
  });

  const startEditing = () => {
    setForm({
      full_name: profile?.full_name ?? "",
      university: profile?.university ?? "",
      major: profile?.major ?? "",
      semester: profile?.semester?.toString() ?? "",
    });
    setEditing(true);
  };

  const handleSave = () => {
    updateProfile.mutate({
      full_name: form.full_name || null,
      university: form.university || null,
      major: form.major || null,
      semester: form.semester ? parseInt(form.semester) : null,
    });
    setEditing(false);
  };

  if (isLoading) return <GlassCard blocky className="animate-pulse h-32" />;

  return (
    <GlassCard blocky className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <User size={20} className="text-primary" />
          <h3 className="font-display font-semibold text-foreground">My Profile</h3>
        </div>
        {!editing && (
          <Button variant="blocky-outline" size="sm" onClick={startEditing}>
            Edit
          </Button>
        )}
      </div>

      {editing ? (
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { label: "Full Name", key: "full_name", type: "text" },
            { label: "University", key: "university", type: "text" },
            { label: "Major", key: "major", type: "text" },
            { label: "Semester", key: "semester", type: "number" },
          ].map((field) => (
            <div key={field.key} className="space-y-1">
              <Label className="text-xs text-muted-foreground">{field.label}</Label>
              <Input
                type={field.type}
                value={form[field.key as keyof typeof form]}
                onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                className="rounded-none border-2 border-border h-9 text-sm"
              />
            </div>
          ))}
          <div className="sm:col-span-2 flex gap-2 justify-end">
            <Button variant="blocky-outline" size="sm" onClick={() => setEditing(false)}>
              Cancel
            </Button>
            <Button variant="blocky" size="sm" onClick={handleSave} disabled={updateProfile.isPending}>
              <Save size={14} className="mr-1" /> Save
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-2 text-sm">
          <p><span className="text-muted-foreground">Name:</span> {profile?.full_name || "—"}</p>
          <p><span className="text-muted-foreground">University:</span> {profile?.university || "—"}</p>
          <p><span className="text-muted-foreground">Major:</span> {profile?.major || "—"}</p>
          <p><span className="text-muted-foreground">Semester:</span> {profile?.semester ?? "—"}</p>
        </div>
      )}
    </GlassCard>
  );
}
