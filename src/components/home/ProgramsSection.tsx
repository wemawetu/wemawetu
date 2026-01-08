import { Link } from "react-router-dom";
import { Droplets, Home, GraduationCap, Leaf, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import programWater from "@/assets/program-water.jpg";
import programShelter from "@/assets/program-shelter.jpg";
import programEducation from "@/assets/program-education.jpg";
import programEnvironment from "@/assets/program-environment.jpg";

const programs = [
  {
    id: "water",
    icon: Droplets,
    title: "Clean Water for Life",
    description: "Solar-powered boreholes, rainwater harvesting, and water purification systems for communities.",
    image: programWater,
    color: "from-secondary to-secondary/80",
  },
  {
    id: "shelter",
    icon: Home,
    title: "Safe & Sustainable Shelter",
    description: "Eco-friendly housing using stabilized soil blocks and local materials for lasting impact.",
    image: programShelter,
    color: "from-accent to-accent/80",
  },
  {
    id: "education",
    icon: GraduationCap,
    title: "Education Access",
    description: "School fees support, solar-powered classrooms, and digital learning hubs for every child.",
    image: programEducation,
    color: "from-primary to-primary/80",
  },
  {
    id: "environment",
    icon: Leaf,
    title: "Planet Protection",
    description: "Tree planting, community recycling, and climate-smart agriculture training programs.",
    image: programEnvironment,
    color: "from-primary to-secondary",
  },
];

export function ProgramsSection() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-primary font-medium text-sm uppercase tracking-wider">
            Our Programs
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-2 mb-4">
            Creating Lasting Change
          </h2>
          <p className="text-muted-foreground text-lg">
            We focus on long-term impact, not handouts. Our sustainable solutions empower communities to thrive.
          </p>
        </div>

        {/* Programs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {programs.map((program, index) => (
            <div
              key={program.id}
              className="group relative rounded-2xl overflow-hidden shadow-card hover:shadow-elevated transition-all duration-500"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Image */}
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={program.image}
                  alt={program.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>

              {/* Gradient Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-t ${program.color} opacity-0 group-hover:opacity-60 transition-opacity duration-500`} />
              
              {/* Dark Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/40 to-transparent" />

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${program.color} flex items-center justify-center`}>
                    <program.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                </div>
                <h3 className="font-display text-xl md:text-2xl font-bold text-primary-foreground mb-2">
                  {program.title}
                </h3>
                <p className="text-primary-foreground/80 text-sm md:text-base leading-relaxed mb-4">
                  {program.description}
                </p>
                <Link
                  to={`/programs#${program.id}`}
                  className="inline-flex items-center gap-2 text-primary font-medium text-sm group-hover:gap-3 transition-all"
                >
                  Learn More
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* View All CTA */}
        <div className="text-center mt-12">
          <Button variant="outline" size="lg" asChild>
            <Link to="/programs">
              View All Programs
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
