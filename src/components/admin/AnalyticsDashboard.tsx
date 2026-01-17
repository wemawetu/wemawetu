import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, Users, DollarSign, Target, Calendar,
  ArrowUp, ArrowDown, Loader2
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';

interface DonationStats {
  total_raised: number;
  total_donations: number;
  total_donors: number;
  total_campaigns: number;
  platform_fees: number;
  avg_donation: number;
}

interface DonationTrend {
  date: string;
  amount: number;
  count: number;
}

interface TopCampaign {
  id: string;
  title: string;
  raised_amount: number;
  target_amount: number;
  donor_count: number;
}

interface CategoryBreakdown {
  category: string;
  amount: number;
  count: number;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

export function AnalyticsDashboard() {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30');
  const [stats, setStats] = useState<DonationStats>({
    total_raised: 0,
    total_donations: 0,
    total_donors: 0,
    total_campaigns: 0,
    platform_fees: 0,
    avg_donation: 0
  });
  const [trends, setTrends] = useState<DonationTrend[]>([]);
  const [topCampaigns, setTopCampaigns] = useState<TopCampaign[]>([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState<CategoryBreakdown[]>([]);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(timeRange));
      const startDate = daysAgo.toISOString();

      // Load donations within timeframe
      const { data: donations } = await supabase
        .from('campaign_donations')
        .select('amount, platform_fee, net_amount, created_at, campaign_id, donor_email')
        .eq('payment_status', 'completed')
        .gte('created_at', startDate);

      // Load campaigns
      const { data: campaigns } = await supabase
        .from('campaigns')
        .select('id, title, raised_amount, target_amount, donor_count, category, status');

      if (donations && campaigns) {
        // Calculate stats
        const totalRaised = donations.reduce((sum, d) => sum + Number(d.amount), 0);
        const platformFees = donations.reduce((sum, d) => sum + Number(d.platform_fee), 0);
        const uniqueDonors = new Set(donations.map(d => d.donor_email)).size;
        
        setStats({
          total_raised: totalRaised,
          total_donations: donations.length,
          total_donors: uniqueDonors,
          total_campaigns: campaigns.filter(c => c.status === 'approved').length,
          platform_fees: platformFees,
          avg_donation: donations.length > 0 ? totalRaised / donations.length : 0
        });

        // Calculate trends by day
        const trendMap = new Map<string, { amount: number; count: number }>();
        donations.forEach(d => {
          const date = new Date(d.created_at).toISOString().split('T')[0];
          const existing = trendMap.get(date) || { amount: 0, count: 0 };
          trendMap.set(date, {
            amount: existing.amount + Number(d.amount),
            count: existing.count + 1
          });
        });

        // Fill in missing days
        const trendData: DonationTrend[] = [];
        for (let i = parseInt(timeRange); i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          const data = trendMap.get(dateStr) || { amount: 0, count: 0 };
          trendData.push({
            date: dateStr,
            amount: data.amount,
            count: data.count
          });
        }
        setTrends(trendData);

        // Top campaigns
        const sortedCampaigns = [...campaigns]
          .filter(c => c.status === 'approved')
          .sort((a, b) => Number(b.raised_amount) - Number(a.raised_amount))
          .slice(0, 5);
        setTopCampaigns(sortedCampaigns);

        // Category breakdown
        const categoryMap = new Map<string, { amount: number; count: number }>();
        campaigns.forEach(c => {
          const existing = categoryMap.get(c.category) || { amount: 0, count: 0 };
          categoryMap.set(c.category, {
            amount: existing.amount + Number(c.raised_amount),
            count: existing.count + 1
          });
        });
        setCategoryBreakdown(
          Array.from(categoryMap.entries()).map(([category, data]) => ({
            category: category.charAt(0).toUpperCase() + category.slice(1),
            amount: data.amount,
            count: data.count
          }))
        );
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Track donation trends, top campaigns, and revenue breakdown</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="365">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Raised</p>
                <p className="text-xl font-bold">{formatCurrency(stats.total_raised)}</p>
              </div>
              <TrendingUp className="h-6 w-6 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Platform Fees</p>
                <p className="text-xl font-bold">{formatCurrency(stats.platform_fees)}</p>
              </div>
              <DollarSign className="h-6 w-6 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Donations</p>
                <p className="text-xl font-bold">{stats.total_donations}</p>
              </div>
              <ArrowUp className="h-6 w-6 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Unique Donors</p>
                <p className="text-xl font-bold">{stats.total_donors}</p>
              </div>
              <Users className="h-6 w-6 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Donation</p>
                <p className="text-xl font-bold">{formatCurrency(stats.avg_donation)}</p>
              </div>
              <Target className="h-6 w-6 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Campaigns</p>
                <p className="text-xl font-bold">{stats.total_campaigns}</p>
              </div>
              <Target className="h-6 w-6 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">Donation Trends</TabsTrigger>
          <TabsTrigger value="campaigns">Top Campaigns</TabsTrigger>
          <TabsTrigger value="categories">By Category</TabsTrigger>
        </TabsList>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Donation Trends</CardTitle>
              <CardDescription>Daily donation amounts over the selected period</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trends}>
                    <defs>
                      <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={formatDate}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <YAxis 
                      tickFormatter={(v) => formatCurrency(v)}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <Tooltip
                      formatter={(value: number) => [formatCurrency(value), 'Amount']}
                      labelFormatter={formatDate}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="hsl(var(--primary))" 
                      fillOpacity={1} 
                      fill="url(#colorAmount)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Campaigns</CardTitle>
                <CardDescription>Campaigns ranked by total raised</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topCampaigns} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        type="number" 
                        tickFormatter={(v) => formatCurrency(v)}
                        stroke="hsl(var(--muted-foreground))"
                      />
                      <YAxis 
                        type="category" 
                        dataKey="title" 
                        width={150}
                        stroke="hsl(var(--muted-foreground))"
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip
                        formatter={(value: number) => [formatCurrency(value), 'Raised']}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="raised_amount" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Campaign Progress</CardTitle>
                <CardDescription>Progress toward funding goals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topCampaigns.map((campaign, index) => {
                    const progress = Math.min(100, (Number(campaign.raised_amount) / Number(campaign.target_amount)) * 100);
                    return (
                      <div key={campaign.id} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium truncate max-w-[60%]">{campaign.title}</span>
                          <span className="text-muted-foreground">{progress.toFixed(0)}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all"
                            style={{ 
                              width: `${progress}%`,
                              backgroundColor: COLORS[index % COLORS.length]
                            }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{formatCurrency(Number(campaign.raised_amount))}</span>
                          <span>{campaign.donor_count} donors</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="categories">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Category</CardTitle>
                <CardDescription>Distribution of funds across categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryBreakdown}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={150}
                        fill="#8884d8"
                        dataKey="amount"
                        nameKey="category"
                      >
                        {categoryBreakdown.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => [formatCurrency(value), 'Amount']}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Breakdown</CardTitle>
                <CardDescription>Detailed stats per category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categoryBreakdown.map((cat, index) => (
                    <div key={cat.category} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <div>
                          <p className="font-medium">{cat.category}</p>
                          <p className="text-sm text-muted-foreground">{cat.count} campaigns</p>
                        </div>
                      </div>
                      <p className="font-bold">{formatCurrency(cat.amount)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
