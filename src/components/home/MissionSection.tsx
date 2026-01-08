import { Target, Eye, Heart } from "lucide-react";

export function MissionSection() {
  return (
    <section className="py-24 bg-muted">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Mission */}
          <div className="bg-card rounded-2xl p-8 shadow-card hover:shadow-elevated transition-shadow duration-300">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
              <Target className="h-7 w-7 text-primary" />
            </div>
            <h3 className="font-display text-2xl font-bold text-foreground mb-4">
              Our Mission
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              To empower Kenyan communities by delivering sustainable water, shelter, education, and environmental solutions that improve lives while protecting the planet.
            </p>
          </div>

          {/* Vision */}
          <div className="bg-card rounded-2xl p-8 shadow-card hover:shadow-elevated transition-shadow duration-300">
            <div className="w-14 h-14 rounded-xl bg-secondary/10 flex items-center justify-center mb-6">
              <Eye className="h-7 w-7 text-secondary" />
            </div>
            <h3 className="font-display text-2xl font-bold text-foreground mb-4">
              Our Vision
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              A Kenya where every community has clean water, safe shelter, quality education, and a healthy environment for generations to come.
            </p>
          </div>

          {/* Values */}
          <div className="bg-card rounded-2xl p-8 shadow-card hover:shadow-elevated transition-shadow duration-300">
            <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mb-6">
              <Heart className="h-7 w-7 text-accent" />
            </div>
            <h3 className="font-display text-2xl font-bold text-foreground mb-4">
              Our Values
            </h3>
            <ul className="text-muted-foreground space-y-2">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Community-led solutions
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Environmental sustainability
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Transparency & accountability
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Long-term impact focus
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
