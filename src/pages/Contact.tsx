import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { 
  Mail, Phone, MapPin, Send, Clock, 
  Facebook, Twitter, Instagram, Linkedin 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ContactInfo {
  id: string;
  type: string;
  label: string;
  value: string;
  icon: string | null;
}

export default function Contact() {
  const [contactInfo, setContactInfo] = useState<ContactInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from("contact_submissions")
      .insert([formData]);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Message Sent!",
        description: "Thank you for reaching out. We'll respond within 48 hours."
      });
      setFormData({ name: "", email: "", subject: "", message: "" });
    }
    setLoading(false);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "email": return Mail;
      case "phone": return Phone;
      case "address": return MapPin;
      default: return Mail;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-block px-4 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full mb-4">
              Contact Us
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
              Let's Start a <span className="text-primary">Conversation</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Have questions, want to partner, or ready to get involved? 
              We'd love to hear from you.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-5 gap-12">
            {/* Contact Info */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground mb-6">
                  Get in Touch
                </h2>
                <p className="text-muted-foreground mb-8">
                  Our team is here to help. Reach out through any of the following channels.
                </p>
              </div>

              <div className="space-y-4">
                {contactInfo.length > 0 ? (
                  contactInfo.map((info) => {
                    const Icon = getIcon(info.type);
                    return (
                      <div 
                        key={info.id}
                        className="flex items-start gap-4 p-4 bg-card rounded-xl border border-border"
                      >
                        <div className="p-3 bg-primary/10 rounded-lg">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground">{info.label}</h4>
                          <p className="text-muted-foreground text-sm">{info.value}</p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <>
                    <div className="flex items-start gap-4 p-4 bg-card rounded-xl border border-border">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <Mail className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">Email</h4>
                        <p className="text-muted-foreground text-sm">info@wemawetu.org</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 bg-card rounded-xl border border-border">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <Phone className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">Phone</h4>
                        <p className="text-muted-foreground text-sm">+254 700 000 000</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 bg-card rounded-xl border border-border">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">Office</h4>
                        <p className="text-muted-foreground text-sm">Nairobi, Kenya</p>
                      </div>
                    </div>
                  </>
                )}

                <div className="flex items-start gap-4 p-4 bg-card rounded-xl border border-border">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">Working Hours</h4>
                    <p className="text-muted-foreground text-sm">Mon - Fri: 8am - 5pm EAT</p>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div>
                <h4 className="font-medium text-foreground mb-4">Follow Us</h4>
                <div className="flex gap-3">
                  <a 
                    href="#" 
                    className="p-3 bg-muted rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    <Facebook className="h-5 w-5" />
                  </a>
                  <a 
                    href="#" 
                    className="p-3 bg-muted rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    <Twitter className="h-5 w-5" />
                  </a>
                  <a 
                    href="#" 
                    className="p-3 bg-muted rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    <Instagram className="h-5 w-5" />
                  </a>
                  <a 
                    href="#" 
                    className="p-3 bg-muted rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    <Linkedin className="h-5 w-5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-3">
              <div className="bg-card rounded-2xl border border-border p-8">
                <h3 className="font-display text-xl font-bold text-foreground mb-6">
                  Send Us a Message
                </h3>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Full Name *
                      </label>
                      <input 
                        type="text" 
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Email Address *
                      </label>
                      <input 
                        type="email" 
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Subject
                    </label>
                    <input 
                      type="text" 
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                      placeholder="How can we help?"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Message *
                    </label>
                    <textarea 
                      required
                      rows={6}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
                      placeholder="Tell us more about your inquiry..."
                    />
                  </div>
                  <Button type="submit" size="lg" className="w-full" disabled={loading}>
                    {loading ? (
                      "Sending..."
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Placeholder */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="bg-muted rounded-2xl h-64 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Map integration coming soon</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
