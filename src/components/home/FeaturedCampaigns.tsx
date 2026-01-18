import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, Users, Heart, Loader2 } from "lucide-react";

interface Campaign {
  id: string;
  title: string;
  slug: string;
  description: string;
  image_url: string | null;
  target_amount: number;
  raised_amount: number;
  donor_count: number;
  category: string;
}

export function FeaturedCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCampaigns();
  }, []);

  async function loadCampaigns() {
    const { data } = await supabase
      .from("campaigns")
      .select("id, title, slug, description, image_url, target_amount, raised_amount, donor_count, category")
      .eq("status", "approved")
      .eq("is_featured", true)
      .order("created_at", { ascending: false })
      .limit(3);

    if (data) setCampaigns(data);
    setLoading(false);
  }

  if (loading) {
    return (
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  if (campaigns.length === 0) return null;

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full mb-4">
            Crowdfunding
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Support Our <span className="text-primary">Active Campaigns</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Help us reach our goals by contributing to these community-driven initiatives
          </p>
        </div>

        {/* Campaigns Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {campaigns.map((campaign) => {
            const progress = Math.min((campaign.raised_amount / campaign.target_amount) * 100, 100);
            
            return (
              <Link
                key={campaign.id}
                to={`/crowdfunding/${campaign.slug}`}
                className="group bg-card rounded-2xl border border-border overflow-hidden shadow-soft hover:shadow-elevated transition-all duration-300"
              >
                {/* Image */}
                <div className="aspect-video bg-muted overflow-hidden">
                  {campaign.image_url ? (
                    <img
                      src={campaign.image_url}
                      alt={campaign.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Heart className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full mb-3 capitalize">
                    {campaign.category}
                  </span>
                  
                  <h3 className="font-display text-xl font-bold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {campaign.title}
                  </h3>
                  
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {campaign.description}
                  </p>

                  {/* Progress */}
                  <div className="space-y-2 mb-4">
                    <Progress value={progress} className="h-2" />
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold text-foreground">
                        ${campaign.raised_amount.toLocaleString()}
                      </span>
                      <span className="text-muted-foreground">
                        of ${campaign.target_amount.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{campaign.donor_count} donors</span>
                    </div>
                    <span className="text-primary font-medium">
                      {progress.toFixed(0)}% funded
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Button variant="outline" size="lg" asChild>
            <Link to="/crowdfunding">
              View All Campaigns
              <ArrowRight className="h-5 w-5 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
