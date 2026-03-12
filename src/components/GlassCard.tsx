import { cn } from "@/lib/utils";
import React, { ReactNode } from "react";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  glow?: "blue" | "purple" | "none";
  blocky?: boolean;
}

export default function GlassCard({ children, className, glow = "none", blocky = false, ...props }: GlassCardProps) {
  return (
    <div
      className={cn(
        "bg-card border-2 border-border p-6 transition-all duration-200",
        blocky ? "rounded-none pixel-border" : "rounded-xl card-elevated",
        glow === "blue" && "border-primary/30",
        glow === "purple" && "border-secondary/30",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
