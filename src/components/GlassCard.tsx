import { cn } from "@/lib/utils";
import React, { ReactNode } from "react";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  glow?: "blue" | "purple" | "none";
}

export default function GlassCard({ children, className, glow = "none", ...props }: GlassCardProps) {
  return (
    <div
      className={cn(
        "glass rounded-xl p-6 transition-all duration-300 hover:scale-[1.02]",
        glow === "blue" && "shadow-neon-blue hover:shadow-neon-blue",
        glow === "purple" && "shadow-neon-purple hover:shadow-neon-purple",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
