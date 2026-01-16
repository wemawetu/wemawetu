import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { 
  Plus, Target, Users, Wallet, TrendingUp, Clock, CheckCircle, 
  XCircle, AlertCircle, Phone, Edit, Trash2, Eye, DollarSign,
  ArrowDownCircle, Share2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ImageUpload } from '@/components/ImageUpload';
import { ShareCampaign } from '@/components/ShareCampaign';

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
  status: string;
  rejection_reason: string | null;
  donor_count: number;
  created_at: string;
}

interface Withdrawal {
  id: string;
  campaign_id: string;
  amount: number;
  mpesa_phone: string;
  status: string;
  rejection_reason: string | null;
  created_at: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    story: '',
    category: 'general',
    target_amount: '',
    mpesa_phone: '',
    image_url: '',
    end_date: ''
  });

  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawPhone, setWithdrawPhone] = useState('');

  const categories = [
    { id: 'medical', label: 'Medical' },
    { id: 'education', label: 'Education' },
    { id: 'emergency', label: 'Emergency' },
    { id: 'community', label: 'Community' },
    { id: 'business', label: 'Business' },
    { id: 'general', label: 'General' },
  ];

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth');
      return;
    }
    setUser(user);
    loadData(user.id);
  };

  const loadData = async (userId: string) => {
    try {
      // Load user's campaigns
      const { data: campaignsData, error: campaignsError } = await supabase
        .from('campaigns')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (campaignsError) throw campaignsError;
      setCampaigns(campaignsData || []);

      // Load user's withdrawals
      const { data: withdrawalsData, error: withdrawalsError } = await supabase
        .from('withdrawal_requests')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!withdrawalsError) {
        setWithdrawals(withdrawalsData || []);
      }
    } catch (error: any) {
      toast({
        title: "Error loading data",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      + '-' + Date.now().toString(36);
  };

  const handleCreateCampaign = async () => {
    if (!formData.title || !formData.description || !formData.target_amount || !formData.mpesa_phone) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase
        .from('campaigns')
        .insert({
          user_id: user.id,
          title: formData.title,
          slug: generateSlug(formData.title),
          description: formData.description,
          story: formData.story || null,
          category: formData.category,
          target_amount: Number(formData.target_amount),
          mpesa_phone: formData.mpesa_phone,
          image_url: formData.image_url || null,
          end_date: formData.end_date || null,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Campaign created!",
        description: "Your campaign has been submitted for approval. You'll be notified once it's reviewed."
      });

      setShowCreateDialog(false);
      setFormData({
        title: '',
        description: '',
        story: '',
        category: 'general',
        target_amount: '',
        mpesa_phone: '',
        image_url: '',
        end_date: ''
      });
      loadData(user.id);
    } catch (error: any) {
      toast({
        title: "Error creating campaign",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleWithdraw = async () => {
    if (!selectedCampaign || !withdrawAmount || !withdrawPhone) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const availableAmount = Number(selectedCampaign.raised_amount) * 0.9; // 90% available after 10% fee
    if (Number(withdrawAmount) > availableAmount) {
      toast({
        title: "Insufficient funds",
        description: `Maximum withdrawable amount is KES ${availableAmount.toLocaleString()}`,
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase
        .from('withdrawal_requests')
        .insert({
          campaign_id: selectedCampaign.id,
          user_id: user.id,
          amount: Number(withdrawAmount),
          mpesa_phone: withdrawPhone,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Withdrawal requested!",
        description: "Your withdrawal request has been submitted for processing."
      });

      setShowWithdrawDialog(false);
      setWithdrawAmount('');
      setWithdrawPhone('');
      setSelectedCampaign(null);
      loadData(user.id);
    } catch (error: any) {
      toast({
        title: "Error requesting withdrawal",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const deleteCampaign = async (id: string) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return;

    try {
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({ title: "Campaign deleted" });
      loadData(user.id);
    } catch (error: any) {
      toast({
        title: "Error deleting campaign",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      case 'completed':
        return <Badge className="bg-blue-500"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Calculate stats
  const totalRaised = campaigns.reduce((sum, c) => sum + Number(c.raised_amount), 0);
  const totalDonors = campaigns.reduce((sum, c) => sum + c.donor_count, 0);
  const activeCampaigns = campaigns.filter(c => c.status === 'approved').length;
  const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending').reduce((sum, w) => sum + Number(w.amount), 0);

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

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold">My Dashboard</h1>
              <p className="text-muted-foreground">Manage your campaigns and track your fundraising progress</p>
            </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-5 w-5" />
                  Create Campaign
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Campaign</DialogTitle>
                  <DialogDescription>
                    Fill in the details below to create your fundraising campaign. It will be reviewed before going live.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Campaign Title *</Label>
                    <Input
                      placeholder="Give your campaign a compelling title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Category *</Label>
                      <Select value={formData.category} onValueChange={(val) => setFormData({ ...formData, category: val })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(cat => (
                            <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Target Amount (KES) *</Label>
                      <Input
                        type="number"
                        placeholder="e.g. 100000"
                        value={formData.target_amount}
                        onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Short Description *</Label>
                    <Textarea
                      placeholder="Briefly describe your campaign (shown on cards)"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Full Story</Label>
                    <Textarea
                      placeholder="Tell your full story. Why do you need help? How will the funds be used?"
                      value={formData.story}
                      onChange={(e) => setFormData({ ...formData, story: e.target.value })}
                      rows={5}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>M-Pesa Phone Number *</Label>
                      <Input
                        placeholder="254712345678"
                        value={formData.mpesa_phone}
                        onChange={(e) => setFormData({ ...formData, mpesa_phone: e.target.value })}
                      />
                      <p className="text-xs text-muted-foreground">This is where donations will be sent</p>
                    </div>
                    <div className="space-y-2">
                      <Label>End Date (Optional)</Label>
                      <Input
                        type="date"
                        value={formData.end_date}
                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      />
                    </div>
                  </div>

                  <ImageUpload
                    value={formData.image_url}
                    onChange={(url) => setFormData({ ...formData, image_url: url })}
                    label="Campaign Image"
                    placeholder="Upload an image or paste a URL"
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
                  <Button onClick={handleCreateCampaign} disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Submit for Review'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Raised</p>
                    <p className="text-2xl font-bold">{formatAmount(totalRaised)}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-primary opacity-50" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Donors</p>
                    <p className="text-2xl font-bold">{totalDonors}</p>
                  </div>
                  <Users className="h-8 w-8 text-primary opacity-50" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Campaigns</p>
                    <p className="text-2xl font-bold">{activeCampaigns}</p>
                  </div>
                  <Target className="h-8 w-8 text-primary opacity-50" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Withdrawals</p>
                    <p className="text-2xl font-bold">{formatAmount(pendingWithdrawals)}</p>
                  </div>
                  <Wallet className="h-8 w-8 text-primary opacity-50" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="campaigns" className="space-y-6">
            <TabsList>
              <TabsTrigger value="campaigns">My Campaigns</TabsTrigger>
              <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
            </TabsList>

            <TabsContent value="campaigns">
              {campaigns.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Target className="h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No campaigns yet</h3>
                    <p className="text-muted-foreground mb-4">Create your first campaign to start raising funds</p>
                    <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
                      <Plus className="h-5 w-5" />
                      Create Campaign
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {campaigns.map(campaign => (
                    <Card key={campaign.id} className="overflow-hidden">
                      <div className="h-40 overflow-hidden">
                        <img
                          src={campaign.image_url || '/placeholder.svg'}
                          alt={campaign.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg line-clamp-1">{campaign.title}</CardTitle>
                          {getStatusBadge(campaign.status)}
                        </div>
                        <CardDescription className="line-clamp-2">{campaign.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {campaign.status === 'rejected' && campaign.rejection_reason && (
                          <div className="bg-destructive/10 p-2 rounded text-sm text-destructive">
                            <AlertCircle className="h-4 w-4 inline mr-1" />
                            {campaign.rejection_reason}
                          </div>
                        )}

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-semibold">
                              {formatAmount(Number(campaign.raised_amount))} / {formatAmount(Number(campaign.target_amount))}
                            </span>
                          </div>
                          <Progress value={(Number(campaign.raised_amount) / Number(campaign.target_amount)) * 100} className="h-2" />
                        </div>

                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {campaign.donor_count} donors
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            {campaign.mpesa_phone.slice(-4)}
                          </span>
                        </div>

                        <div className="flex gap-2">
                          {campaign.status === 'approved' && (
                            <>
                              <Link to={`/campaign/${campaign.slug}`} className="flex-1">
                                <Button variant="outline" size="sm" className="w-full gap-1">
                                  <Eye className="h-4 w-4" />
                                  View
                                </Button>
                              </Link>
                              <ShareCampaign 
                                campaign={campaign} 
                                variant="outline" 
                                size="sm"
                              />
                              <Button 
                                variant="default" 
                                size="sm" 
                                className="flex-1 gap-1"
                                onClick={() => {
                                  setSelectedCampaign(campaign);
                                  setWithdrawPhone(campaign.mpesa_phone);
                                  setShowWithdrawDialog(true);
                                }}
                                disabled={Number(campaign.raised_amount) <= 0}
                              >
                                <ArrowDownCircle className="h-4 w-4" />
                                Withdraw
                              </Button>
                            </>
                          )}
                          {campaign.status === 'pending' && (
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              className="w-full gap-1"
                              onClick={() => deleteCampaign(campaign.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="withdrawals">
              {withdrawals.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Wallet className="h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No withdrawals yet</h3>
                    <p className="text-muted-foreground">Once your campaign receives donations, you can request withdrawals here</p>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Withdrawal History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {withdrawals.map(withdrawal => {
                        const campaign = campaigns.find(c => c.id === withdrawal.campaign_id);
                        return (
                          <div key={withdrawal.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <p className="font-semibold">{formatAmount(Number(withdrawal.amount))}</p>
                              <p className="text-sm text-muted-foreground">
                                {campaign?.title || 'Unknown Campaign'} • {new Date(withdrawal.created_at).toLocaleDateString()}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                To: {withdrawal.mpesa_phone}
                              </p>
                              {withdrawal.rejection_reason && (
                                <p className="text-sm text-destructive mt-1">{withdrawal.rejection_reason}</p>
                              )}
                            </div>
                            {getStatusBadge(withdrawal.status)}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Withdraw Dialog */}
      <Dialog open={showWithdrawDialog} onOpenChange={setShowWithdrawDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Withdrawal</DialogTitle>
            <DialogDescription>
              {selectedCampaign && (
                <>
                  Withdraw funds from "{selectedCampaign.title}".
                  Available balance: {formatAmount(Number(selectedCampaign.raised_amount) * 0.9)} (after 10% platform fee)
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Amount (KES)</Label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>M-Pesa Phone Number</Label>
              <Input
                placeholder="254712345678"
                value={withdrawPhone}
                onChange={(e) => setWithdrawPhone(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWithdrawDialog(false)}>Cancel</Button>
            <Button onClick={handleWithdraw} disabled={submitting}>
              {submitting ? 'Processing...' : 'Request Withdrawal'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Dashboard;
