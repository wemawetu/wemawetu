import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Heart, Users, Target, Calendar, Share2, ArrowLeft,
  Phone, Sparkles, CheckCircle, AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Campaign {
  id: string;
  title: string;
  slug: string;
  description: string;
  story: string | null;
  category: string;
  target_amount: number;
  raised_amount: number;
  image_url: string | null;
  mpesa_phone: string;
  donor_count: number;
  is_featured: boolean;
  created_at: string;
  end_date: string | null;
}

interface Donation {
  id: string;
  donor_name: string;
  amount: number;
  message: string | null;
  is_anonymous: boolean;
  created_at: string;
}

const CampaignDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [donating, setDonating] = useState(false);
  const { toast } = useToast();

  // Donation form
  const [donorName, setDonorName] = useState('');
  const [donorPhone, setDonorPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  const presetAmounts = [100, 500, 1000, 2500, 5000, 10000];

  useEffect(() => {
    if (slug) {
      loadCampaign();
    }
  }, [slug]);

  const loadCampaign = async () => {
    try {
      const { data: campaignData, error: campaignError } = await supabase
        .from('campaigns')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'approved')
        .single();

      if (campaignError) throw campaignError;
      setCampaign(campaignData);

      // Load recent donations
      const { data: donationsData, error: donationsError } = await supabase
        .from('campaign_donations')
        .select('*')
        .eq('campaign_id', campaignData.id)
        .eq('payment_status', 'completed')
        .order('created_at', { ascending: false })
        .limit(10);

      if (!donationsError) {
        setDonations(donationsData || []);
      }
    } catch (error: any) {
      toast({
        title: "Campaign not found",
        description: "This campaign may have been removed or is not yet approved.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDonate = async () => {
    if (!campaign) return;
    if (!amount || Number(amount) < 10) {
      toast({
        title: "Invalid amount",
        description: "Minimum donation is KES 10",
        variant: "destructive"
      });
      return;
    }

    if (!donorPhone || !/^(254|0)\d{9}$/.test(donorPhone.replace(/\s/g, ''))) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid M-Pesa phone number",
        variant: "destructive"
      });
      return;
    }

    setDonating(true);

    try {
      // Format phone number
      let formattedPhone = donorPhone.replace(/\s/g, '');
      if (formattedPhone.startsWith('0')) {
        formattedPhone = '254' + formattedPhone.substring(1);
      }

      const donationAmount = Number(amount);
      const platformFee = donationAmount * 0.1; // 10% fee
      const netAmount = donationAmount - platformFee;

      // Create donation record
      const { data: donationRecord, error: donationError } = await supabase
        .from('campaign_donations')
        .insert({
          campaign_id: campaign.id,
          donor_name: isAnonymous ? 'Anonymous' : (donorName || 'Anonymous'),
          donor_phone: formattedPhone,
          amount: donationAmount,
          platform_fee: platformFee,
          net_amount: netAmount,
          message: message || null,
          is_anonymous: isAnonymous,
          payment_status: 'pending'
        })
        .select()
        .single();

      if (donationError) throw donationError;

      // Get M-Pesa config
      const { data: paymentConfig, error: configError } = await supabase
        .from('payment_config')
        .select('*')
        .eq('provider', 'mpesa')
        .eq('enabled', true)
        .single();

      if (configError || !paymentConfig) {
        toast({
          title: "M-Pesa not configured",
          description: "Please contact support to enable M-Pesa payments.",
          variant: "destructive"
        });
        return;
      }

      const config = paymentConfig.config as any;

      // Initiate STK Push
      const response = await supabase.functions.invoke('mpesa-stk-push', {
        body: {
          phone: formattedPhone,
          amount: Math.round(donationAmount),
          reference: `CAMP-${campaign.slug.toUpperCase().slice(0, 10)}`,
          description: `Donation to ${campaign.title}`,
          consumer_key: config.consumer_key,
          consumer_secret: config.consumer_secret,
          shortcode: config.shortcode,
          passkey: config.passkey,
          type: config.type || 'paybill',
          environment: config.environment || 'sandbox'
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const result = response.data;

      if (result.success) {
        toast({
          title: "STK Push Sent!",
          description: "Please enter your M-Pesa PIN on your phone to complete the donation.",
        });

        // Reset form
        setAmount('');
        setMessage('');
        setDonorName('');
        setDonorPhone('');
        setIsAnonymous(false);
      } else {
        throw new Error(result.error || 'STK Push failed');
      }
    } catch (error: any) {
      toast({
        title: "Donation failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setDonating(false);
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getProgressPercentage = () => {
    if (!campaign) return 0;
    return Math.min((Number(campaign.raised_amount) / Number(campaign.target_amount)) * 100, 100);
  };

  const shareCampaign = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: campaign?.title,
        text: campaign?.description,
        url: url
      });
    } else {
      navigator.clipboard.writeText(url);
      toast({
        title: "Link copied!",
        description: "Campaign link copied to clipboard"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Campaign Not Found</h1>
            <p className="text-muted-foreground mb-4">This campaign may have been removed or is not yet approved.</p>
            <Link to="/crowdfunding">
              <Button>Browse Campaigns</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-grow">
        {/* Breadcrumb */}
        <div className="bg-muted/50 py-4">
          <div className="container mx-auto px-4">
            <Link to="/crowdfunding" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Back to Campaigns
            </Link>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Campaign Image */}
              <div className="relative rounded-xl overflow-hidden">
                <img
                  src={campaign.image_url || '/placeholder.svg'}
                  alt={campaign.title}
                  className="w-full h-[400px] object-cover"
                />
                {campaign.is_featured && (
                  <Badge className="absolute top-4 left-4 bg-yellow-500 text-yellow-950">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Featured
                  </Badge>
                )}
              </div>

              {/* Title and Category */}
              <div>
                <Badge variant="secondary" className="mb-2">{campaign.category}</Badge>
                <h1 className="text-3xl md:text-4xl font-bold mb-4">{campaign.title}</h1>
                <p className="text-lg text-muted-foreground">{campaign.description}</p>
              </div>

              {/* Story */}
              {campaign.story && (
                <Card>
                  <CardHeader>
                    <CardTitle>Our Story</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: campaign.story.replace(/\n/g, '<br/>') }} />
                  </CardContent>
                </Card>
              )}

              {/* Recent Donations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-primary" />
                    Recent Supporters
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {donations.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      Be the first to support this campaign!
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {donations.map(donation => (
                        <div key={donation.id} className="flex items-start gap-4 pb-4 border-b last:border-0">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <Heart className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-semibold">
                                  {donation.is_anonymous ? 'Anonymous' : donation.donor_name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(donation.created_at).toLocaleDateString()}
                                </p>
                              </div>
                              <Badge variant="secondary">{formatAmount(Number(donation.amount))}</Badge>
                            </div>
                            {donation.message && (
                              <p className="text-sm text-muted-foreground mt-2 italic">"{donation.message}"</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - Donation Form */}
            <div className="lg:col-span-1">
              <div className="sticky top-4 space-y-6">
                {/* Progress Card */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="text-center">
                        <p className="text-4xl font-bold text-primary">
                          {formatAmount(Number(campaign.raised_amount))}
                        </p>
                        <p className="text-muted-foreground">
                          raised of {formatAmount(Number(campaign.target_amount))} goal
                        </p>
                      </div>
                      
                      <Progress value={getProgressPercentage()} className="h-3" />
                      
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <div className="flex items-center justify-center gap-1 text-lg font-semibold">
                            <Users className="h-5 w-5 text-primary" />
                            {campaign.donor_count}
                          </div>
                          <p className="text-sm text-muted-foreground">Donors</p>
                        </div>
                        <div>
                          <div className="flex items-center justify-center gap-1 text-lg font-semibold">
                            <Calendar className="h-5 w-5 text-primary" />
                            {Math.ceil(getProgressPercentage())}%
                          </div>
                          <p className="text-sm text-muted-foreground">Funded</p>
                        </div>
                      </div>

                      <Button variant="outline" className="w-full gap-2" onClick={shareCampaign}>
                        <Share2 className="h-4 w-4" />
                        Share Campaign
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Donation Form */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="h-5 w-5 text-primary" />
                      Make a Donation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Preset Amounts */}
                    <div className="grid grid-cols-3 gap-2">
                      {presetAmounts.map(preset => (
                        <Button
                          key={preset}
                          variant={amount === String(preset) ? "default" : "outline"}
                          size="sm"
                          onClick={() => setAmount(String(preset))}
                        >
                          {formatAmount(preset)}
                        </Button>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <Label>Custom Amount (KES)</Label>
                      <Input
                        type="number"
                        placeholder="Enter amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        min={10}
                      />
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label>Your Name</Label>
                      <Input
                        placeholder="Enter your name"
                        value={donorName}
                        onChange={(e) => setDonorName(e.target.value)}
                        disabled={isAnonymous}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>M-Pesa Phone Number *</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="254712345678"
                          value={donorPhone}
                          onChange={(e) => setDonorPhone(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Message (Optional)</Label>
                      <Textarea
                        placeholder="Leave a message of support..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={3}
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="anonymous"
                        checked={isAnonymous}
                        onCheckedChange={setIsAnonymous}
                      />
                      <Label htmlFor="anonymous">Donate anonymously</Label>
                    </div>

                    <div className="bg-muted/50 p-3 rounded-lg text-sm">
                      <p className="flex items-center gap-2 text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        10% platform fee supports Wemawetu Foundation
                      </p>
                    </div>

                    <Button 
                      className="w-full gap-2" 
                      size="lg"
                      onClick={handleDonate}
                      disabled={donating || !amount || Number(amount) < 10}
                    >
                      {donating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <Heart className="h-5 w-5" />
                          Donate {amount ? formatAmount(Number(amount)) : ''}
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CampaignDetail;
