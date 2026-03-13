import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Lock } from "lucide-react";
import logo from "@/assets/stud-z-logo.png";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check for recovery event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast({ title: "Password updated! 🎉", description: "You can now sign in with your new password." });
      navigate("/auth");
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 pt-20">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <img src={logo} alt="Stud-Z" className="h-16 w-16 mx-auto rounded-xl pixel-border-sm" />
          <h1 className="text-3xl font-display font-bold text-foreground">New Password</h1>
          <p className="text-muted-foreground text-sm">Enter your new password below.</p>
        </div>

        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground font-display text-sm">New Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                id="password"
                type="password"
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 rounded-none border-2 border-border"
                required
                minLength={6}
              />
            </div>
          </div>
          <Button variant="blocky" size="lg" className="w-full" disabled={loading || !ready}>
            {!ready ? "Verifying link..." : loading ? "Updating..." : "Update Password →"}
          </Button>
        </form>
      </div>
    </div>
  );
}
