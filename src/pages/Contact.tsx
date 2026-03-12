import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import GlassCard from "@/components/GlassCard";
import { toast } from "sonner";
import { Send } from "lucide-react";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", type: "feedback", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message sent! We'll get back to you soon.");
    setForm({ name: "", email: "", type: "feedback", message: "" });
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-slide-up">
          <h1 className="text-4xl sm:text-5xl font-display font-bold mb-4 text-foreground">
            Get in <span className="text-primary">Touch</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto text-lg">
            Got feedback? Want to be a Campus Ambassador? We'd love to hear from you.
          </p>
        </div>

        <GlassCard blocky className="max-w-lg mx-auto">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Name</label>
              <Input
                placeholder="Your name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="bg-background border-2 border-border rounded-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Email</label>
              <Input
                type="email"
                placeholder="you@university.edu"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="bg-background border-2 border-border rounded-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">I'm reaching out for...</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full bg-background border-2 border-border px-3 py-2 text-sm text-foreground rounded-none"
              >
                <option value="feedback">Student Feedback</option>
                <option value="ambassador">Campus Ambassador</option>
                <option value="partnership">Partnership</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Message</label>
              <Textarea
                placeholder="Tell us what's on your mind..."
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                required
                rows={4}
                className="bg-background border-2 border-border rounded-none"
              />
            </div>
            <Button variant="blocky" className="w-full" type="submit">
              <Send size={16} /> Send Message
            </Button>
          </form>
        </GlassCard>
      </div>
    </div>
  );
}
