import { useState, useEffect } from "react";
import { X } from "lucide-react";

const motivations = [
  "Ayo lock in bestie, you got this! 🔐",
  "Main character energy = study energy 💅",
  "Your future self will thank you fr fr 🫡",
  "Grind now, flex later 💪🔥",
  "Touch grass AFTER you finish studying 🌿",
  "Plot twist: studying is your superpower ⚡",
  "Slay that exam like you slay everything else 💯",
  "You're literally one study sesh away from a W 📈",
  "No thoughts, just productive vibes ✨",
  "Imagine the GPA glow-up tho 👀",
  "Your notes miss you, go say hi 📝",
  "Be the academic weapon you were born to be 🎯",
];

export default function StudyBuddy() {
  const [message, setMessage] = useState("");
  const [visible, setVisible] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setMessage(motivations[Math.floor(Math.random() * motivations.length)]);

    const interval = setInterval(() => {
      setMessage(motivations[Math.floor(Math.random() * motivations.length)]);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  if (dismissed) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-end gap-3 max-w-xs">
      {visible && (
        <div className="bg-card border-2 border-border p-3 text-sm text-foreground font-body shadow-lg pixel-border-sm animate-slide-up relative">
          <button
            onClick={() => setDismissed(true)}
            className="absolute -top-2 -right-2 w-5 h-5 bg-destructive text-destructive-foreground flex items-center justify-center text-xs border border-border"
          >
            <X size={12} />
          </button>
          <p className="pr-2">{message}</p>
        </div>
      )}
      <button
        onClick={() => setVisible((v) => !v)}
        className="w-14 h-14 bg-primary text-primary-foreground border-2 border-border flex items-center justify-center text-2xl pixel-border-sm shrink-0 hover:scale-105 transition-transform"
        title="Study Buddy"
      >
        🧠
      </button>
    </div>
  );
}
