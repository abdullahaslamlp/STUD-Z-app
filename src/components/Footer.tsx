import { Link } from "react-router-dom";
import logo from "@/assets/stud-z-logo.png";

export default function Footer() {
  return (
    <footer className="border-t-2 border-border bg-muted/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img src={logo} alt="Stud-Z" className="h-8 w-8 object-contain" />
              <span className="font-display text-lg font-bold text-gradient-logo">Stud-Z</span>
            </div>
            <p className="text-sm text-muted-foreground">Study Smarter, Not Harder.</p>
          </div>

          <div>
            <h4 className="font-display font-semibold text-foreground mb-3">Pages</h4>
            <div className="space-y-2">
              {[{ l: "Home", p: "/" }, { l: "Services", p: "/services" }, { l: "About", p: "/about" }, { l: "Tech Stack", p: "/tech" }, { l: "Contact", p: "/contact" }].map((i) => (
                <Link key={i.p} to={i.p} className="block text-sm text-muted-foreground hover:text-primary transition-colors">{i.l}</Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-display font-semibold text-foreground mb-3">Connect</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <a href="https://www.linkedin.com/in/abdullahaslamlp/" target="_blank" rel="noopener noreferrer" className="block hover:text-primary transition-colors">LinkedIn</a>
              <a href="https://github.com/abdullahaslamlp" target="_blank" rel="noopener noreferrer" className="block hover:text-primary transition-colors">GitHub</a>
            </div>
          </div>

          <div>
            <h4 className="font-display font-semibold text-foreground mb-3">Legal</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <a href="#" className="block hover:text-primary transition-colors">Privacy Policy</a>
              <a href="#" className="block hover:text-primary transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t-2 border-border text-center text-sm text-muted-foreground">
          © 2026 Stud-Z. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
