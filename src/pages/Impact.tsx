import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Droplets, Home, BookOpen, TreePine, Users, Heart, 
  TrendingUp, MapPin, Calendar, Quote 
} from "lucide-react";

const impactStats = [
  { icon: Droplets, value: "25,000+", label: "People with clean water", color: "text-sky-500" },
  { icon: Home, value: "850+", label: "Homes built", color: "text-accent" },
  { icon: BookOpen, value: "5,000+", label: "Students supported", color: "text-primary" },
  { icon: TreePine, value: "100,000+", label: "Trees planted", color: "text-green-600" },
  { icon: Users, value: "50+", label: "Communities served", color: "text-purple-500" },
  { icon: Heart, value: "12", label: "Active projects", color: "text-rose-500" },
];

const stories = [
  {
    id: 1,
    title: "Clean Water Transforms Turkana Village",
    location: "Turkana County",
    date: "2025",
    excerpt: "After years of walking 10km daily for water, the Napetet community now has a solar-powered borehole serving 3,000 people.",
    image: "https://images.unsplash.com/photo-1594398901394-4e34939a4fd0?w=600",
    impact: "3,000 people served"
  },
  {
    id: 2,
    title: "Schools Empowered with Digital Learning",
    location: "Marsabit County",
    date: "2025",
    excerpt: "Five schools now have solar-powered computer labs, bringing digital education to over 1,200 students in remote areas.",
    image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600",
    impact: "1,200 students reached"
  },
  {
    id: 3,
    title: "Women's Cooperative Thrives",
    location: "Garissa County",
    date: "2024",
    excerpt: "A group of 45 women now run a successful recycling business, turning plastic waste into valuable products while earning sustainable income.",
    image: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=600",
    impact: "45 women employed"
  }
];

const milestones = [
  { year: "2020", event: "Foundation established" },
  { year: "2021", event: "First water project completed" },
  { year: "2022", event: "Expanded to 10 communities" },
  { year: "2023", event: "Launched education program" },
  { year: "2024", event: "50 communities milestone" },
  { year: "2025", event: "100,000 trees planted" },
];

export default function Impact() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-accent/10 via-background to-primary/10">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-block px-4 py-1 bg-accent/10 text-accent text-sm font-medium rounded-full mb-4">
              Our Impact
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
              Real Stories, <span className="text-accent">Measurable Change</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Every number represents a life transformed, a community empowered, 
              and a step toward a more sustainable future.
            </p>
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-16 bg-card border-y border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {impactStats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className={`inline-flex p-3 rounded-xl bg-muted mb-3 ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div className="font-display text-2xl font-bold text-foreground">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Stories */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold text-foreground mb-4">
              Stories of Transformation
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Behind every project are real people whose lives have been changed forever.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {stories.map((story) => (
              <article 
                key={story.id}
                className="group bg-card rounded-2xl overflow-hidden border border-border shadow-soft hover:shadow-elevated transition-all duration-300"
              >
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={story.image} 
                    alt={story.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                    {story.impact}
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {story.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {story.date}
                    </span>
                  </div>
                  <h3 className="font-display text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {story.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {story.excerpt}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="py-16 bg-primary">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Quote className="h-12 w-12 text-primary-foreground/30 mx-auto mb-6" />
            <blockquote className="font-display text-2xl md:text-3xl text-primary-foreground mb-6 italic">
              "Before the borehole, I spent 6 hours every day fetching water. 
              Now my daughters go to school instead of carrying jerrycans."
            </blockquote>
            <cite className="text-primary-foreground/80">
              — Mary Akiru, Turkana County
            </cite>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold text-foreground mb-4">
              Our Journey
            </h2>
            <p className="text-muted-foreground">
              Key milestones in our mission to transform communities.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="relative">
              <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-primary/20" />
              
              {milestones.map((milestone, index) => (
                <div 
                  key={index}
                  className={`relative flex items-center gap-8 mb-8 ${
                    index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'
                  }`}
                >
                  <div className={`w-1/2 ${index % 2 === 0 ? 'text-right pr-8' : 'text-left pl-8'}`}>
                    <div className="font-display text-2xl font-bold text-primary">
                      {milestone.year}
                    </div>
                    <div className="text-muted-foreground">{milestone.event}</div>
                  </div>
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-primary rounded-full border-4 border-background" />
                  <div className="w-1/2" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Transparency */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-card rounded-2xl border border-border p-8 md:p-12">
            <div className="flex items-start gap-6">
              <div className="p-4 bg-primary/10 rounded-xl shrink-0">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                  Transparency & Accountability
                </h2>
                <p className="text-muted-foreground mb-6">
                  We believe in complete transparency. Every donation is tracked, 
                  every project is documented, and our financial reports are publicly available. 
                  We undergo independent audits annually to ensure your contributions 
                  make the maximum impact.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button variant="outline">View Annual Reports</Button>
                  <Button variant="outline">Financial Statements</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-primary to-primary/80">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-3xl font-bold text-primary-foreground mb-4">
            Be Part of the Impact
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Your support enables us to reach more communities and create lasting change.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="hero" size="lg" asChild>
              <Link to="/donate">
                <Heart className="mr-2 h-5 w-5" />
                Donate Now
              </Link>
            </Button>
            <Button variant="heroOutline" size="lg" asChild>
              <Link to="/get-involved">Get Involved</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
