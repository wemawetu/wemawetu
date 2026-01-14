import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Search, Heart, Users, Target, Plus, TrendingUp, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Campaign {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  target_amount: number;
  raised_amount: number;
  image_url: string | null;
  donor_count: number;
  is_featured: boolean;
  created_at: string;
}

const Crowdfunding = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();

  const categories = [
    { id: 'all', label: 'All Campaigns' },
    { id: 'medical', label: 'Medical' },
    { id: 'education', label: 'Education' },
    { id: 'emergency', label: 'Emergency' },
    { id: 'community', label: 'Community' },
    { id: 'business', label: 'Business' },
    { id: 'general', label: 'General' },
  ];

  useEffect(() => {
    checkAuth();
    loadCampaigns();
  }, []);

  useEffect(() => {
    filterCampaigns();
  }, [campaigns, searchTerm, selectedCategory]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const loadCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('status', 'approved')
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading campaigns",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterCampaigns = () => {
    let filtered = campaigns;

    if (searchTerm) {
      filtered = filtered.filter(c => 
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(c => c.category === selectedCategory);
    }

    setFilteredCampaigns(filtered);
  };

  const getProgressPercentage = (raised: number, target: number) => {
    return Math.min((raised / target) * 100, 100);
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const featuredCampaigns = filteredCampaigns.filter(c => c.is_featured);
  const regularCampaigns = filteredCampaigns.filter(c => !c.is_featured);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary via-primary/90 to-accent py-20">
          <div className="container mx-auto px-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="h-8 w-8 text-primary-foreground" />
              <Badge variant="secondary" className="text-sm">Community Crowdfunding</Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
              Fund Dreams, Change Lives
            </h1>
            <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
              Join our community in supporting meaningful causes. Create a campaign or donate to help others achieve their goals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Link to="/dashboard">
                  <Button size="lg" variant="secondary" className="gap-2">
                    <Plus className="h-5 w-5" />
                    Start a Campaign
                  </Button>
                </Link>
              ) : (
                <Link to="/auth">
                  <Button size="lg" variant="secondary" className="gap-2">
                    <Plus className="h-5 w-5" />
                    Start a Campaign
                  </Button>
                </Link>
              )}
              <Button size="lg" variant="outline" className="gap-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                <TrendingUp className="h-5 w-5" />
                Browse Campaigns
              </Button>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 bg-muted/50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary">{campaigns.length}</div>
                <div className="text-muted-foreground">Active Campaigns</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary">
                  {formatAmount(campaigns.reduce((sum, c) => sum + Number(c.raised_amount), 0))}
                </div>
                <div className="text-muted-foreground">Total Raised</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary">
                  {campaigns.reduce((sum, c) => sum + c.donor_count, 0)}
                </div>
                <div className="text-muted-foreground">Total Donors</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary">10%</div>
                <div className="text-muted-foreground">Platform Fee</div>
              </div>
            </div>
          </div>
        </section>

        {/* Search and Filter */}
        <section className="py-8 border-b">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search campaigns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2 flex-wrap justify-center">
                {categories.map(cat => (
                  <Button
                    key={cat.id}
                    variant={selectedCategory === cat.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(cat.id)}
                  >
                    {cat.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Featured Campaigns */}
        {featuredCampaigns.length > 0 && (
          <section className="py-12">
            <div className="container mx-auto px-4">
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="h-6 w-6 text-yellow-500" />
                <h2 className="text-2xl font-bold">Featured Campaigns</h2>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredCampaigns.map(campaign => (
                  <CampaignCard key={campaign.id} campaign={campaign} formatAmount={formatAmount} getProgressPercentage={getProgressPercentage} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* All Campaigns */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6">
              {selectedCategory === 'all' ? 'All Campaigns' : categories.find(c => c.id === selectedCategory)?.label}
            </h2>
            
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : regularCampaigns.length === 0 ? (
              <div className="text-center py-12">
                <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No campaigns found</h3>
                <p className="text-muted-foreground mb-6">Be the first to start a campaign in this category!</p>
                <Link to={user ? "/dashboard" : "/auth"}>
                  <Button>Start a Campaign</Button>
                </Link>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {regularCampaigns.map(campaign => (
                  <CampaignCard key={campaign.id} campaign={campaign} formatAmount={formatAmount} getProgressPercentage={getProgressPercentage} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">1. Create Campaign</h3>
                <p className="text-muted-foreground">
                  Sign up, tell your story, set your goal, and submit for approval.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">2. Share & Receive</h3>
                <p className="text-muted-foreground">
                  Share your campaign and receive donations via M-Pesa directly to your phone.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">3. Withdraw Funds</h3>
                <p className="text-muted-foreground">
                  Request withdrawals anytime. 90% goes to you, 10% supports our foundation.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

interface CampaignCardProps {
  campaign: Campaign;
  formatAmount: (amount: number) => string;
  getProgressPercentage: (raised: number, target: number) => number;
}

const CampaignCard = ({ campaign, formatAmount, getProgressPercentage }: CampaignCardProps) => {
  const progress = getProgressPercentage(Number(campaign.raised_amount), Number(campaign.target_amount));
  
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
      <div className="relative h-48 overflow-hidden">
        <img
          src={campaign.image_url || '/placeholder.svg'}
          alt={campaign.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {campaign.is_featured && (
          <Badge className="absolute top-2 left-2 bg-yellow-500 text-yellow-950">
            <Sparkles className="h-3 w-3 mr-1" />
            Featured
          </Badge>
        )}
        <Badge variant="secondary" className="absolute top-2 right-2">
          {campaign.category}
        </Badge>
      </div>
      <CardHeader className="pb-2">
        <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
          {campaign.title}
        </h3>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
          {campaign.description}
        </p>
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-sm">
            <span className="font-semibold text-primary">{formatAmount(Number(campaign.raised_amount))}</span>
            <span className="text-muted-foreground">of {formatAmount(Number(campaign.target_amount))}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center pt-2 border-t">
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{campaign.donor_count} donors</span>
        </div>
        <Link to={`/campaign/${campaign.slug}`}>
          <Button size="sm" className="gap-1">
            <Heart className="h-4 w-4" />
            Donate
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default Crowdfunding;
