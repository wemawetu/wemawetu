import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Droplets, Heart, Mail, Phone, MapPin, Globe, Clock, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

interface ContactInfo {
  id: string;
  type: string;
  label: string;
  value: string;
  icon: string | null;
}

const iconMap: Record<string, React.ElementType> = {
  Mail,
  Phone,
  MapPin,
  Globe,
  Clock,
};

const getIconFromType = (type: string, iconName: string | null) => {
  if (iconName && iconMap[iconName]) return iconMap[iconName];
  switch (type) {
    case "email": return Mail;
    case "phone": return Phone;
    case "address": return MapPin;
    case "website": return Globe;
    case "hours": return Clock;
    default: return Mail;
  }
};

export function Footer() {
  const [contactInfo, setContactInfo] = useState<ContactInfo[]>([]);

  useEffect(() => {
    async function fetchContactInfo() {
      const { data } = await supabase
        .from("contact_info")
        .select("*")
        .eq("active", true)
        .order("sort_order");
      
      if (data) {
        setContactInfo(data);
      }
    }
    fetchContactInfo();
  }, []);

  const renderContactValue = (info: ContactInfo) => {
    switch (info.type) {
      case "email":
        return (
          <a href={`mailto:${info.value}`} className="text-primary-foreground/70 hover:text-primary transition-colors text-sm">
            {info.value}
          </a>
        );
      case "phone":
        return (
          <a href={`tel:${info.value.replace(/\s/g, '')}`} className="text-primary-foreground/70 hover:text-primary transition-colors text-sm">
            {info.value}
          </a>
        );
      case "website":
        return (
          <a href={info.value} target="_blank" rel="noopener noreferrer" className="text-primary-foreground/70 hover:text-primary transition-colors text-sm">
            {info.value}
          </a>
        );
      default:
        return <span className="text-primary-foreground/70 text-sm">{info.value}</span>;
    }
  };

  return (
    <footer className="bg-foreground text-primary-foreground">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="relative">
                <Droplets className="h-8 w-8 text-primary" />
                <Heart className="h-4 w-4 absolute -bottom-1 -right-1 text-accent" />
              </div>
              <div className="flex flex-col">
                <span className="font-display text-xl font-bold leading-tight">
                  Wemawetu
                </span>
                <span className="text-xs font-medium tracking-wider uppercase text-primary-foreground/70">
                  Foundation
                </span>
              </div>
            </Link>
            <p className="text-primary-foreground/70 text-sm leading-relaxed">
              Empowering Kenyan communities through sustainable water, shelter, education, and environmental solutions.
            </p>
            <p className="font-display text-lg italic text-primary">
              "People. Planet. Future."
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { href: "/programs", label: "Our Programs" },
                { href: "/impact", label: "Our Impact" },
                { href: "/blog", label: "News & Stories" },
                { href: "/get-involved", label: "Get Involved" },
                { href: "/track-order", label: "Track Your Order" },
                { href: "/contact", label: "Contact Us" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-primary-foreground/70 hover:text-primary transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Programs */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-4">Our Programs</h4>
            <ul className="space-y-2">
              {[
                "Clean Water for Life",
                "Safe & Sustainable Shelter",
                "Education Access",
                "Planet Protection",
                "Community Resilience",
              ].map((program) => (
                <li key={program}>
                  <span className="text-primary-foreground/70 text-sm">{program}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3">
              {contactInfo.length > 0 ? (
                contactInfo.map((info) => {
                  const Icon = getIconFromType(info.type, info.icon);
                  return (
                    <li key={info.id} className="flex items-start gap-3">
                      <Icon className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <span className="text-primary-foreground/50 text-xs block">{info.label}</span>
                        {renderContactValue(info)}
                      </div>
                    </li>
                  );
                })
              ) : (
                <>
                  <li className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-primary-foreground/70 text-sm">
                      Nairobi, Kenya
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-primary shrink-0" />
                    <a href="tel:+254700000000" className="text-primary-foreground/70 hover:text-primary transition-colors text-sm">
                      +254 700 000 000
                    </a>
                  </li>
                  <li className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-primary shrink-0" />
                    <a href="mailto:info@wemawetu.org" className="text-primary-foreground/70 hover:text-primary transition-colors text-sm">
                      info@wemawetu.org
                    </a>
                  </li>
                </>
              )}
            </ul>

            {/* Social Links */}
            <div className="flex gap-3 mt-6">
              {[
                { icon: Facebook, href: "#" },
                { icon: Twitter, href: "#" },
                { icon: Instagram, href: "#" },
                { icon: Linkedin, href: "#" },
              ].map(({ icon: Icon, href }, index) => (
                <a
                  key={index}
                  href={href}
                  className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center hover:bg-primary transition-colors"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-primary-foreground/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-primary-foreground/60">
            <p>© {new Date().getFullYear()} Wemawetu Foundation. All rights reserved.</p>
            <div className="flex gap-6">
              <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
