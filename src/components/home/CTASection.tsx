import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, Users, Handshake, ArrowRight } from "lucide-react";

const ctaOptions = [
  {
    icon: Heart,
    title: "Donate",
    description: "Your donation provides clean water, shelter, and education to families in need.",
    cta: "Give Today",
    href: "/donate",
    featured: true,
  },
  {
    icon: Users,
    title: "Volunteer",
    description: "Join our team of dedicated volunteers making a difference on the ground.",
    cta: "Join Us",
    href: "/get-involved",
    featured: false,
  },
  {
    icon: Handshake,
    title: "Partner",
    description: "Corporate partnerships and CSR collaborations that create lasting impact.",
    cta: "Partner With Us",
    href: "/contact",
    featured: false,
  },
];

export function CTASection() {
  return (
    <section className="py-24 bg-gradient-to-b from-background to-muted">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-primary font-medium text-sm uppercase tracking-wider">
            Get Involved
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-2 mb-4">
            Join the Movement
          </h2>
          <p className="text-muted-foreground text-lg">
            Every action counts. Choose how you want to make a difference today.
          </p>
        </div>

        {/* CTA Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {ctaOptions.map((option, index) => (
            <div
              key={index}
              className={`rounded-2xl p-8 transition-all duration-300 hover:-translate-y-2 ${
                option.featured
                  ? "bg-primary text-primary-foreground shadow-elevated"
                  : "bg-card text-foreground shadow-card hover:shadow-elevated"
              }`}
            >
              <div
                className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 ${
                  option.featured ? "bg-primary-foreground/20" : "bg-primary/10"
                }`}
              >
                <option.icon
                  className={`h-7 w-7 ${
                    option.featured ? "text-primary-foreground" : "text-primary"
                  }`}
                />
              </div>
              <h3 className="font-display text-2xl font-bold mb-3">
                {option.title}
              </h3>
              <p
                className={`text-sm leading-relaxed mb-6 ${
                  option.featured ? "text-primary-foreground/80" : "text-muted-foreground"
                }`}
              >
                {option.description}
              </p>
              <Button
                variant={option.featured ? "heroOutline" : "default"}
                className="w-full"
                asChild
              >
                <Link to={option.href}>
                  {option.cta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
