import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Droplets, Home, BookOpen, TreePine, Users, ArrowRight, CheckCircle } from "lucide-react";
import programWater from "@/assets/program-water.jpg";
import programShelter from "@/assets/program-shelter.jpg";
import programEducation from "@/assets/program-education.jpg";
import programEnvironment from "@/assets/program-environment.jpg";

const programs = [
  {
    id: "water",
    title: "Clean Water for Life",
    icon: Droplets,
    image: programWater,
    description: "Providing sustainable access to clean, safe drinking water for communities in need.",
    problem: "Millions still lack access to clean water, leading to preventable diseases and lost opportunities.",
    solutions: [
      "Solar-powered boreholes",
      "Rainwater harvesting systems",
      "Water storage tanks for schools & villages",
      "Water purification & filtration units",
      "Community water committees for sustainability"
    ],
    impact: "Reduced disease, more school attendance, time saved for women & children"
  },
  {
    id: "shelter",
    title: "Safe & Sustainable Shelter",
    icon: Home,
    image: programShelter,
    description: "Building eco-friendly, durable homes using local materials and community participation.",
    problem: "Many families live in unsafe, temporary housing vulnerable to weather and disasters.",
    solutions: [
      "Eco-friendly housing with stabilized soil blocks",
      "Emergency shelters for disaster victims",
      "Roofing replacement programs",
      "Insulated shelters for extreme climates",
      "Community-built housing projects"
    ],
    impact: "Safe living conditions, community ownership, sustainable local employment"
  },
  {
    id: "education",
    title: "Education Access & Digital Inclusion",
    icon: BookOpen,
    image: programEducation,
    description: "Ensuring every child has access to quality education and modern learning tools.",
    problem: "Poverty limits access to education, trapping communities in cycles of disadvantage.",
    solutions: [
      "School fees & scholarship support",
      "Solar-powered classrooms",
      "Digital learning hubs",
      "School water & sanitation (WASH)",
      "Reusable sanitary pad programs for girls",
      "School feeding support"
    ],
    impact: "Higher enrollment, improved retention, digital literacy for the future"
  },
  {
    id: "environment",
    title: "Planet Protection & Climate Action",
    icon: TreePine,
    image: programEnvironment,
    description: "Fighting climate change through reforestation, recycling, and sustainable practices.",
    problem: "Climate change and environmental degradation threaten livelihoods and ecosystems.",
    solutions: [
      "Tree planting & forest restoration",
      "Community recycling programs",
      "Plastic collection & upcycling",
      "Climate-smart agriculture training",
      "Clean cookstoves to reduce deforestation",
      "Carbon footprint awareness campaigns"
    ],
    impact: "Restored ecosystems, reduced emissions, sustainable livelihoods"
  }
];

export default function Programs() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-block px-4 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full mb-4">
              Our Programs
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
              Sustainable Solutions for <span className="text-primary">Lasting Change</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              We focus on four interconnected pillars that address the root causes of poverty 
              while protecting our planet for future generations.
            </p>
          </div>
        </div>
      </section>

      {/* Programs Detail */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="space-y-24">
            {programs.map((program, index) => (
              <div 
                key={program.id}
                id={program.id}
                className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-12 items-center`}
              >
                {/* Image */}
                <div className="lg:w-1/2">
                  <div className="relative rounded-2xl overflow-hidden shadow-elevated">
                    <img 
                      src={program.image} 
                      alt={program.title}
                      className="w-full h-[400px] object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/30 to-transparent" />
                    <div className="absolute bottom-6 left-6 flex items-center gap-3">
                      <div className="p-3 bg-primary rounded-xl">
                        <program.icon className="h-6 w-6 text-primary-foreground" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="lg:w-1/2 space-y-6">
                  <h2 className="font-display text-3xl font-bold text-foreground">
                    {program.title}
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    {program.description}
                  </p>
                  
                  <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4">
                    <h4 className="font-semibold text-destructive mb-2">The Problem</h4>
                    <p className="text-sm text-foreground/80">{program.problem}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-foreground mb-3">Our Solutions</h4>
                    <ul className="space-y-2">
                      {program.solutions.map((solution, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{solution}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-primary/10 rounded-xl p-4">
                    <h4 className="font-semibold text-primary mb-2">Impact</h4>
                    <p className="text-sm text-foreground/80">{program.impact}</p>
                  </div>

                  <Button asChild>
                    <Link to="/donate">
                      Support This Program
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Resilience Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="p-4 bg-accent/10 rounded-full inline-block mb-6">
              <Users className="h-8 w-8 text-accent" />
            </div>
            <h2 className="font-display text-3xl font-bold text-foreground mb-6">
              Community Resilience & Livelihoods
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Aid without income doesn't last. That's why we integrate livelihood programs 
              into all our initiatives—skills training, small eco-enterprises, women & youth 
              empowerment, and sustainable farming inputs.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild>
                <Link to="/get-involved">Partner With Us</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/contact">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
