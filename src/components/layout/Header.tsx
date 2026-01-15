import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Droplets, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/programs", label: "Programs" },
  { href: "/impact", label: "Impact" },
  { href: "/crowdfunding", label: "Crowdfunding" },
  { href: "/blog", label: "Blog" },
  { href: "/get-involved", label: "Get Involved" },
  { href: "/contact", label: "Contact" },
  { href: "/give", label: "Donate" },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isHomePage = location.pathname === "/";
  const headerBg = isScrolled || !isHomePage
    ? "bg-card/95 backdrop-blur-md shadow-soft"
    : "bg-transparent";

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        headerBg
      )}
    >
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <Droplets className={cn(
                "h-8 w-8 transition-colors duration-300",
                isScrolled || !isHomePage ? "text-primary" : "text-primary-foreground"
              )} />
              <Heart className={cn(
                "h-4 w-4 absolute -bottom-1 -right-1 transition-colors duration-300",
                isScrolled || !isHomePage ? "text-accent" : "text-accent"
              )} />
            </div>
            <div className="flex flex-col">
              <span className={cn(
                "font-display text-xl font-bold leading-tight transition-colors duration-300",
                isScrolled || !isHomePage ? "text-foreground" : "text-primary-foreground"
              )}>
                Wemawetu
              </span>
              <span className={cn(
                "text-xs font-medium tracking-wider uppercase transition-colors duration-300",
                isScrolled || !isHomePage ? "text-muted-foreground" : "text-primary-foreground/80"
              )}>
                Foundation
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300",
                  location.pathname === link.href
                    ? isScrolled || !isHomePage
                      ? "bg-primary/10 text-primary"
                      : "bg-primary-foreground/20 text-primary-foreground"
                    : isScrolled || !isHomePage
                      ? "text-foreground/80 hover:text-primary hover:bg-muted"
                      : "text-primary-foreground/90 hover:text-primary-foreground hover:bg-primary-foreground/10"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>


          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className={cn(
                "h-6 w-6 transition-colors",
                isScrolled || !isHomePage ? "text-foreground" : "text-primary-foreground"
              )} />
            ) : (
              <Menu className={cn(
                "h-6 w-6 transition-colors",
                isScrolled || !isHomePage ? "text-foreground" : "text-primary-foreground"
              )} />
            )}
          </button>
        </nav>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-card rounded-2xl shadow-elevated p-6 mb-4 animate-scale-in">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "px-4 py-3 rounded-lg text-base font-medium transition-all",
                    location.pathname === link.href
                      ? "bg-primary/10 text-primary"
                      : "text-foreground/80 hover:bg-muted"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
