import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Heart, Users, Building2, Megaphone, Gift, 
  ArrowRight, CheckCircle, Mail 
} from "lucide-react";

const involvementOptions = [
  {
    icon: Heart,
    title: "Donate",
    description: "Your financial contribution directly funds our programs. Every donation, big or small, makes a difference.",
    cta: "Donate Now",
    link: "/donate",
    color: "bg-rose-500/10 text-rose-500"
  },
  {
    icon: Users,
    title: "Volunteer",
    description: "Share your skills and time. We need professionals, students, and passionate individuals to support our mission.",
    cta: "Apply to Volunteer",
    link: "/contact",
    color: "bg-primary/10 text-primary"
  },
  {
    icon: Building2,
    title: "Corporate Partnership",
    description: "Partner with us for CSR initiatives. We offer customized programs that align with your company's values.",
    cta: "Partner With Us",
    link: "/contact",
    color: "bg-accent/10 text-accent"
  },
  {
    icon: Megaphone,
    title: "Spread the Word",
    description: "Amplify our message on social media, in your community, or among your networks. Awareness drives change.",
    cta: "Share Our Story",
    link: "#",
    color: "bg-purple-500/10 text-purple-500"
  }
];

const volunteerRoles = [
  "Project Coordinators",
  "Community Health Workers",
  "Digital Marketing Specialists",
  "Grant Writers",
  "Event Organizers",
  "Translators",
  "Photography/Videography",
  "Data Analysts"
];

const partnerBenefits = [
  "Tax-deductible contributions",
  "Brand visibility on projects",
  "Employee volunteer programs",
  "Impact reports & updates",
  "Recognition in annual report",
  "Customized partnership packages"
];

export default function GetInvolved() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-block px-4 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full mb-4">
              Get Involved
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
              Join Us in Creating <span className="text-primary">Lasting Change</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              There are many ways to contribute to our mission. Whether you donate, 
              volunteer, or partner with us, your involvement matters.
            </p>
          </div>
        </div>
      </section>

      {/* Ways to Get Involved */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            {involvementOptions.map((option, index) => (
              <div 
                key={index}
                className="bg-card rounded-2xl border border-border p-8 shadow-soft hover:shadow-elevated transition-all duration-300"
              >
                <div className={`inline-flex p-4 rounded-xl ${option.color} mb-6`}>
                  <option.icon className="h-8 w-8" />
                </div>
                <h3 className="font-display text-2xl font-bold text-foreground mb-4">
                  {option.title}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {option.description}
                </p>
                <Button asChild>
                  <Link to={option.link}>
                    {option.cta}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Volunteer Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block px-4 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full mb-4">
                Volunteer With Us
              </span>
              <h2 className="font-display text-3xl font-bold text-foreground mb-6">
                Share Your Skills, Transform Lives
              </h2>
              <p className="text-muted-foreground mb-8">
                We're always looking for passionate individuals to join our team. 
                Whether you can commit a few hours or several months, 
                your contribution makes a difference.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {volunteerRoles.map((role, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span className="text-sm text-foreground">{role}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-card rounded-2xl border border-border p-8">
              <h3 className="font-display text-xl font-bold text-foreground mb-6">
                Express Interest
              </h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Full Name
                  </label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email
                  </label>
                  <input 
                    type="email" 
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Area of Interest
                  </label>
                  <select 
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  >
                    <option value="">Select an area</option>
                    {volunteerRoles.map((role) => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>
                <Button type="button" className="w-full">
                  Submit Interest
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Corporate Partnership */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-br from-primary to-primary/80 rounded-3xl p-8 md:p-12 text-center">
            <Building2 className="h-12 w-12 text-primary-foreground/30 mx-auto mb-6" />
            <h2 className="font-display text-3xl font-bold text-primary-foreground mb-4">
              Corporate Partnerships
            </h2>
            <p className="text-primary-foreground/80 max-w-2xl mx-auto mb-8">
              Partner with Wemawetu Foundation to create meaningful impact while 
              fulfilling your corporate social responsibility goals.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {partnerBenefits.map((benefit, index) => (
                <span 
                  key={index}
                  className="px-4 py-2 bg-primary-foreground/10 text-primary-foreground rounded-full text-sm"
                >
                  {benefit}
                </span>
              ))}
            </div>
            <Button variant="hero" size="lg" asChild>
              <Link to="/contact">
                <Mail className="mr-2 h-5 w-5" />
                Contact Our Partnerships Team
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Monthly Giving */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="p-4 bg-accent/10 rounded-full inline-block mb-6">
              <Gift className="h-8 w-8 text-accent" />
            </div>
            <h2 className="font-display text-3xl font-bold text-foreground mb-4">
              Become a Monthly Donor
            </h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Consistent support allows us to plan long-term and maximize impact. 
              Join our community of monthly givers and create sustainable change.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" asChild>
                <Link to="/donate">
                  <Heart className="mr-2 h-5 w-5" />
                  Start Monthly Giving
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
