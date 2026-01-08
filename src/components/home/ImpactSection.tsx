import { Users, Droplets, Home, TreePine, GraduationCap, Heart } from "lucide-react";

const impactStats = [
  { icon: Users, value: "50,000+", label: "Lives Impacted", color: "text-primary" },
  { icon: Droplets, value: "120+", label: "Water Projects", color: "text-secondary" },
  { icon: Home, value: "500+", label: "Homes Built", color: "text-accent" },
  { icon: TreePine, value: "25,000+", label: "Trees Planted", color: "text-primary" },
  { icon: GraduationCap, value: "3,000+", label: "Students Supported", color: "text-secondary" },
  { icon: Heart, value: "15+", label: "Communities Served", color: "text-accent" },
];

export function ImpactSection() {
  return (
    <section className="py-24 bg-foreground text-primary-foreground overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-primary font-medium text-sm uppercase tracking-wider">
            Our Impact
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mt-2 mb-4">
            Making a Real Difference
          </h2>
          <p className="text-primary-foreground/70 text-lg">
            Every project we complete creates ripples of positive change throughout communities.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {impactStats.map((stat, index) => (
            <div
              key={index}
              className="text-center p-6 rounded-2xl bg-primary-foreground/5 hover:bg-primary-foreground/10 transition-colors duration-300"
            >
              <stat.icon className={`h-8 w-8 mx-auto mb-4 ${stat.color}`} />
              <div className="font-display text-2xl md:text-3xl font-bold mb-1">
                {stat.value}
              </div>
              <div className="text-primary-foreground/60 text-sm">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Quote */}
        <div className="mt-16 text-center">
          <blockquote className="font-display text-2xl md:text-3xl italic text-primary max-w-4xl mx-auto">
            "Where Humanity Meets Sustainability"
          </blockquote>
        </div>
      </div>
    </section>
  );
}
