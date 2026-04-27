import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Sun, Moon, LogOut } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/stud-z-logo.png";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "Services", path: "/services" },
  { label: "About", path: "/about" },
  { label: "Tech Stack", path: "/tech" },
  { label: "Contact", path: "/contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b-2 border-border">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Stud-Z Logo" className="h-10 w-10 object-contain" />
          <span className="font-display text-xl font-bold text-gradient-logo">Stud-Z</span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((l) => (
            <Link
              key={l.path}
              to={l.path}
              className={`text-sm font-semibold transition-colors hover:text-primary ${
                location.pathname === l.path ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-none border-2 border-border hover:border-primary transition-colors text-foreground hover:text-primary"
            aria-label="Toggle theme"
          >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          {user ? (
            <div className="flex items-center gap-2">
              <Link to="/dashboard">
                <Button variant="blocky" size="sm">Dashboard</Button>
              </Link>
              <button
                onClick={handleSignOut}
                className="p-2 rounded-none border-2 border-border hover:border-destructive transition-colors text-muted-foreground hover:text-destructive"
                aria-label="Sign out"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link to="/auth">
              <Button variant="blocky" size="sm">Get Started →</Button>
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-none border-2 border-border hover:border-primary transition-colors text-foreground"
            aria-label="Toggle theme"
          >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <button className="text-foreground" onClick={() => setOpen(!open)}>
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-background border-t-2 border-border px-4 pb-4 animate-slide-up">
          {navLinks.map((l) => (
            <Link
              key={l.path}
              to={l.path}
              onClick={() => setOpen(false)}
              className={`block py-3 text-sm font-semibold transition-colors hover:text-primary ${
                location.pathname === l.path ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {l.label}
            </Link>
          ))}
          {user ? (
            <div className="flex gap-2 mt-2">
              <Link to="/dashboard" className="flex-1" onClick={() => setOpen(false)}>
                <Button variant="blocky" size="sm" className="w-full">Dashboard</Button>
              </Link>
              <Button variant="blocky-outline" size="sm" onClick={handleSignOut}>
                <LogOut size={16} />
              </Button>
            </div>
          ) : (
            <Link to="/auth" onClick={() => setOpen(false)}>
              <Button variant="blocky" size="sm" className="w-full mt-2">Get Started →</Button>
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
