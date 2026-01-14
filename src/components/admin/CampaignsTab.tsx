import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  CheckCircle, XCircle, Clock, Eye, Trash2, Star, 
  Users, Target, TrendingUp, AlertCircle, Search,
  ArrowDownCircle, DollarSign
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Campaign {
  id: string;
  user_id: string;
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
  is_featured: boolean;
  donor_count: number;
  created_at: string;
}

interface Withdrawal {
  id: string;
  campaign_id: string;
  user_id: string;
  amount: number;
  mpesa_phone: string;
  status: string;
  rejection_reason: string | null;
  created_at: string;
}

const CampaignsTab = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
  const [showWithdrawalDialog, setShowWithdrawalDialog] = useState(false);
  const [withdrawalAction, setWithdrawalAction] = useState<'approve' | 'reject'>('approve');
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [campaignsRes, withdrawalsRes] = await Promise.all([
        supabase.from('campaigns').select('*').order('created_at', { ascending: false }),
        supabase.from('withdrawal_requests').select('*').order('created_at', { ascending: false })
      ]);

      if (campaignsRes.error) throw campaignsRes.error;
      if (withdrawalsRes.error) throw withdrawalsRes.error;

      setCampaigns(campaignsRes.data || []);
      setWithdrawals(withdrawalsRes.data || []);
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

  const updateCampaignStatus = async (id: string, status: string, rejection_reason?: string) => {
    try {
      const { error } = await supabase
        .from('campaigns')
        .update({ status, rejection_reason: rejection_reason || null })
        .eq('id', id);

      if (error) throw error;

      toast({ title: `Campaign ${status}` });
      loadData();
      setShowRejectDialog(false);
      setRejectReason('');
    } catch (error: any) {
      toast({
        title: "Error updating campaign",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const toggleFeatured = async (id: string, is_featured: boolean) => {
    try {
      const { error } = await supabase
        .from('campaigns')
        .update({ is_featured })
        .eq('id', id);

      if (error) throw error;

      toast({ title: is_featured ? "Campaign featured" : "Campaign unfeatured" });
      loadData();
    } catch (error: any) {
      toast({
        title: "Error updating campaign",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const deleteCampaign = async (id: string) => {
    if (!confirm('Are you sure? This will delete all associated donations and withdrawals.')) return;

    try {
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({ title: "Campaign deleted" });
      loadData();
    } catch (error: any) {
      toast({
        title: "Error deleting campaign",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleWithdrawalAction = async () => {
    if (!selectedWithdrawal) return;

    try {
      const updateData: any = {
        status: withdrawalAction === 'approve' ? 'approved' : 'rejected',
        processed_at: new Date().toISOString()
      };

      if (withdrawalAction === 'reject' && rejectReason) {
        updateData.rejection_reason = rejectReason;
      }

      const { error } = await supabase
        .from('withdrawal_requests')
        .update(updateData)
        .eq('id', selectedWithdrawal.id);

      if (error) throw error;

      toast({ title: `Withdrawal ${withdrawalAction}d` });
      loadData();
      setShowWithdrawalDialog(false);
      setSelectedWithdrawal(null);
      setRejectReason('');
    } catch (error: any) {
      toast({
        title: "Error processing withdrawal",
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

  const filteredCampaigns = campaigns.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCampaigns = campaigns.filter(c => c.status === 'pending');
  const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending');

  // Stats
  const totalRaised = campaigns.reduce((sum, c) => sum + Number(c.raised_amount), 0);
  const platformFees = totalRaised * 0.1;
  const totalDonors = campaigns.reduce((sum, c) => sum + c.donor_count, 0);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                <p className="text-sm text-muted-foreground">Platform Fees (10%)</p>
                <p className="text-2xl font-bold">{formatAmount(platformFees)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500 opacity-50" />
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
                <p className="text-sm text-muted-foreground">Pending Review</p>
                <p className="text-2xl font-bold">{pendingCampaigns.length}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="campaigns">
        <TabsList>
          <TabsTrigger value="campaigns">
            Campaigns ({campaigns.length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending Approval ({pendingCampaigns.length})
          </TabsTrigger>
          <TabsTrigger value="withdrawals">
            Withdrawals ({pendingWithdrawals.length} pending)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Campaigns List */}
          <div className="space-y-4">
            {filteredCampaigns.map(campaign => (
              <Card key={campaign.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    <img
                      src={campaign.image_url || '/placeholder.svg'}
                      alt={campaign.title}
                      className="w-full md:w-32 h-24 object-cover rounded"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold flex items-center gap-2">
                            {campaign.title}
                            {campaign.is_featured && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-1">{campaign.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {getStatusBadge(campaign.status)}
                            <Badge variant="outline">{campaign.category}</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{formatAmount(Number(campaign.raised_amount))} raised</span>
                          <span className="text-muted-foreground">of {formatAmount(Number(campaign.target_amount))}</span>
                        </div>
                        <Progress value={(Number(campaign.raised_amount) / Number(campaign.target_amount)) * 100} className="h-1.5" />
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        {campaign.donor_count} donors
                        <span className="mx-2">•</span>
                        M-Pesa: {campaign.mpesa_phone}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`featured-${campaign.id}`} className="text-sm">Featured</Label>
                        <Switch
                          id={`featured-${campaign.id}`}
                          checked={campaign.is_featured}
                          onCheckedChange={(checked) => toggleFeatured(campaign.id, checked)}
                        />
                      </div>
                      {campaign.status === 'pending' && (
                        <>
                          <Button size="sm" onClick={() => updateCampaignStatus(campaign.id, 'approved')}>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => {
                            setSelectedCampaign(campaign);
                            setShowRejectDialog(true);
                          }}>
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                      <Button size="sm" variant="outline" onClick={() => window.open(`/campaign/${campaign.slug}`, '_blank')}>
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteCampaign(campaign.id)}>
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="pending">
          {pendingCampaigns.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                <h3 className="text-xl font-semibold mb-2">All caught up!</h3>
                <p className="text-muted-foreground">No campaigns pending approval</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pendingCampaigns.map(campaign => (
                <Card key={campaign.id} className="border-yellow-200 bg-yellow-50/50">
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                      <img
                        src={campaign.image_url || '/placeholder.svg'}
                        alt={campaign.title}
                        className="w-full md:w-48 h-32 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{campaign.title}</h3>
                        <Badge variant="outline" className="mt-1">{campaign.category}</Badge>
                        <p className="text-sm text-muted-foreground mt-2">{campaign.description}</p>
                        {campaign.story && (
                          <p className="text-sm mt-2 line-clamp-3">{campaign.story}</p>
                        )}
                        <div className="flex items-center gap-4 mt-3 text-sm">
                          <span><Target className="h-4 w-4 inline mr-1" />Target: {formatAmount(Number(campaign.target_amount))}</span>
                          <span>M-Pesa: {campaign.mpesa_phone}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Submitted: {new Date(campaign.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button onClick={() => updateCampaignStatus(campaign.id, 'approved')}>
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button variant="destructive" onClick={() => {
                          setSelectedCampaign(campaign);
                          setShowRejectDialog(true);
                        }}>
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
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
                <ArrowDownCircle className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No withdrawals yet</h3>
                <p className="text-muted-foreground">Withdrawal requests will appear here</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {withdrawals.map(withdrawal => {
                const campaign = campaigns.find(c => c.id === withdrawal.campaign_id);
                return (
                  <Card key={withdrawal.id} className={withdrawal.status === 'pending' ? 'border-yellow-200 bg-yellow-50/50' : ''}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-lg">{formatAmount(Number(withdrawal.amount))}</p>
                          <p className="text-sm text-muted-foreground">
                            Campaign: {campaign?.title || 'Unknown'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            To: {withdrawal.mpesa_phone}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Requested: {new Date(withdrawal.created_at).toLocaleString()}
                          </p>
                          {withdrawal.rejection_reason && (
                            <p className="text-sm text-destructive mt-1">
                              <AlertCircle className="h-4 w-4 inline mr-1" />
                              {withdrawal.rejection_reason}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {getStatusBadge(withdrawal.status)}
                          {withdrawal.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => {
                                setSelectedWithdrawal(withdrawal);
                                setWithdrawalAction('approve');
                                setShowWithdrawalDialog(true);
                              }}>
                                Approve
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => {
                                setSelectedWithdrawal(withdrawal);
                                setWithdrawalAction('reject');
                                setShowWithdrawalDialog(true);
                              }}>
                                Reject
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Reject Campaign Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Campaign</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting "{selectedCampaign?.title}". This will be shown to the campaign creator.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Rejection Reason</Label>
              <Textarea
                placeholder="Enter the reason for rejection..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>Cancel</Button>
            <Button 
              variant="destructive" 
              onClick={() => selectedCampaign && updateCampaignStatus(selectedCampaign.id, 'rejected', rejectReason)}
            >
              Reject Campaign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Withdrawal Action Dialog */}
      <Dialog open={showWithdrawalDialog} onOpenChange={setShowWithdrawalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {withdrawalAction === 'approve' ? 'Approve Withdrawal' : 'Reject Withdrawal'}
            </DialogTitle>
            <DialogDescription>
              {withdrawalAction === 'approve' 
                ? `Confirm approval of ${formatAmount(Number(selectedWithdrawal?.amount))} withdrawal to ${selectedWithdrawal?.mpesa_phone}`
                : 'Please provide a reason for rejecting this withdrawal request.'
              }
            </DialogDescription>
          </DialogHeader>
          {withdrawalAction === 'reject' && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Rejection Reason</Label>
                <Textarea
                  placeholder="Enter the reason for rejection..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWithdrawalDialog(false)}>Cancel</Button>
            <Button 
              variant={withdrawalAction === 'approve' ? 'default' : 'destructive'}
              onClick={handleWithdrawalAction}
            >
              {withdrawalAction === 'approve' ? 'Confirm Approval' : 'Reject Withdrawal'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CampaignsTab;
