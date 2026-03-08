import GlassCard from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Users, Code, TrendingUp, DollarSign, Palette, Terminal, Heart } from "lucide-react";
import abdullahImg from "@/assets/abdullah.jpeg";
import hasnatImg from "@/assets/hasnat.jpeg";
import basilImg from "@/assets/basil.jpeg";

const founders = [
  { name: "Abdullah Aslam", role: "CEO & Founder", title: "The Visionary", icon: TrendingUp, color: "blue" as const, image: abdullahImg },
  { name: "Hasnat Ahmed", role: "CTO", title: "Technical Lead", icon: Code, color: "purple" as const, image: hasnatImg },
  { name: "Basil Saleem", role: "COO", title: "Operations", icon: Users, color: "blue" as const, image: basilImg },
  { name: "Aima Aftab", role: "CFO", title: "Marketing & Finance", icon: DollarSign, color: "purple" as const, image: null },
];

const openRoles = [
  { title: "UI/UX Designer", icon: Palette },
  { title: "Prompt Engineer", icon: Terminal },
  { title: "Community Lead", icon: Heart },
];

export default function About() {
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-slide-up">
          <h1 className="text-4xl sm:text-5xl font-display font-bold mb-4">
            Meet the <span className="text-gradient-neon">Team</span> 👋
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto text-lg">
            We're Gen Z students who got tired of studying the hard way. So we built something better.
          </p>
        </div>

        {/* Founders */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto mb-24">
          {founders.map((f) => (
            <GlassCard key={f.role} glow={f.color} className="text-center space-y-4">
              <div className="w-20 h-20 mx-auto rounded-full overflow-hidden bg-gradient-neon flex items-center justify-center">
                {f.image ? (
                  <img src={f.image} alt={f.name} className="w-full h-full object-cover" />
                ) : (
                  <f.icon size={32} className="text-primary-foreground" />
                )}
              </div>
              <div>
                <h3 className="font-display font-semibold text-lg">{f.name}</h3>
                <p className="text-sm text-primary">{f.role}</p>
                <p className="text-xs text-muted-foreground">{f.title}</p>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Join the fam */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4">
            Join the <span className="text-gradient-neon">Fam</span> 🫶
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            We're always looking for passionate people to join our mission. Check out these open roles:
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
          {openRoles.map((r) => (
            <GlassCard key={r.title} glow="blue" className="text-center space-y-3">
              <r.icon size={28} className="mx-auto text-primary" />
              <h3 className="font-display font-semibold">{r.title}</h3>
              <Button variant="neon-outline" size="sm">Apply →</Button>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
}
