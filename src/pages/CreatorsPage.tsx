import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import NotesManager from '@/components/shared/NotesManager';
import ContentForm from '@/components/content/ContentForm';
import PlatformForm from '@/components/content/PlatformForm';
import SchedulePostForm from '@/components/content/SchedulePostForm';
import { 
  Video, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Eye, 
  Heart, 
  MessageCircle,
  Plus,
  Share2,
  Camera,
  Plane,
  CalendarDays,
  BarChart3,
  Edit
} from 'lucide-react';
import { formatCurrency } from '@/lib/currency';
import { useToast } from '@/hooks/use-toast';

interface ContentPlatform {
  id: string;
  platform_name: string;
  account_handle: string;
  account_display_name?: string;
  followers_count: number;
  total_posts: number;
  total_likes: number;
  total_comments: number;
  is_active: boolean;
  ad_spend_cents: number;
}

interface ContentItem {
  id: string;
  title: string;
  content_type: string;
  status: string;
  scheduled_date?: string;
  published_date?: string;
  view_count: number;
  like_count: number;
  comment_count: number;
  engagement_rate: number;
  revenue_generated_cents: number;
  ad_spend_cents: number;
  platform?: ContentPlatform;
}

interface CreatorStats {
  totalPlatforms: number;
  activePlatforms: number;
  totalFollowers: number;
  totalContent: number;
  draftContent: number;
  scheduledContent: number;
  publishedContent: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
  totalEngagement: number;
  totalAdSpend: number;
  upcomingLivestreams: number;
  upcomingTravel: number;
}

const CreatorsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<CreatorStats>({
    totalPlatforms: 0,
    activePlatforms: 0,
    totalFollowers: 0,
    totalContent: 0,
    draftContent: 0,
    scheduledContent: 0,
    publishedContent: 0,
    monthlyRevenue: 0,
    monthlyExpenses: 0,
    totalEngagement: 0,
    totalAdSpend: 0,
    upcomingLivestreams: 0,
    upcomingTravel: 0,
  });
  const [platforms, setPlatforms] = useState<ContentPlatform[]>([]);
  const [recentContent, setRecentContent] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [contentFormOpen, setContentFormOpen] = useState(false);
  const [platformFormOpen, setPlatformFormOpen] = useState(false);
  const [editingPlatform, setEditingPlatform] = useState<ContentPlatform | null>(null);
  const [schedulePostOpen, setSchedulePostOpen] = useState(false);

  const fetchCreatorStats = async () => {
    if (!user) return;

    try {
      // Fetch platforms
      const { data: platformsData } = await supabase
        .from('content_platforms')
        .select('*')
        .eq('user_id', user.id);

      setPlatforms(platformsData || []);

      // Fetch content
      const { data: contentData } = await supabase
        .from('content_catalog')
        .select(`
          *,
          platform:content_platforms(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      setRecentContent(contentData || []);

      // Fetch income/expenses for current month
      const currentMonth = new Date().toISOString().slice(0, 7);
      
      const { data: incomeData } = await supabase
        .from('content_income')
        .select('amount_cents')
        .eq('user_id', user.id)
        .gte('date', `${currentMonth}-01`);

      const { data: expenseData } = await supabase
        .from('content_expenses')
        .select('amount_cents')
        .eq('user_id', user.id)
        .gte('date', `${currentMonth}-01`);

      // Fetch upcoming livestreams
      const { data: livestreamData } = await supabase
        .from('livestream_schedules')
        .select('id')
        .eq('user_id', user.id)
        .gte('scheduled_start', new Date().toISOString())
        .eq('status', 'scheduled');

      // Fetch upcoming travel
      const { data: travelData } = await supabase
        .from('travel_schedules')
        .select('id')
        .eq('user_id', user.id)
        .gte('start_date', new Date().toISOString().slice(0, 10));

      // Calculate stats
      const totalFollowers = platformsData?.reduce((sum, p) => sum + p.followers_count, 0) || 0;
      const totalEngagement = contentData?.reduce((sum, c) => sum + c.like_count + c.comment_count, 0) || 0;
      const totalAdSpend = (contentData?.reduce((sum, c) => sum + (c.ad_spend_cents || 0), 0) || 0) + 
                          (platformsData?.reduce((sum, p) => sum + (p.ad_spend_cents || 0), 0) || 0);
      const monthlyRevenue = incomeData?.reduce((sum, i) => sum + i.amount_cents, 0) || 0;
      const monthlyExpenses = expenseData?.reduce((sum, e) => sum + e.amount_cents, 0) || 0;

      setStats({
        totalPlatforms: platformsData?.length || 0,
        activePlatforms: platformsData?.filter(p => p.is_active).length || 0,
        totalFollowers,
        totalContent: contentData?.length || 0,
        draftContent: contentData?.filter(c => c.status === 'draft').length || 0,
        scheduledContent: contentData?.filter(c => c.status === 'scheduled').length || 0,
        publishedContent: contentData?.filter(c => c.status === 'published').length || 0,
        monthlyRevenue: monthlyRevenue / 100,
        monthlyExpenses: monthlyExpenses / 100,
        totalEngagement,
        totalAdSpend: totalAdSpend / 100,
        upcomingLivestreams: livestreamData?.length || 0,
        upcomingTravel: travelData?.length || 0,
      });
    } catch (error) {
      console.error('Error fetching creator stats:', error);
      toast({
        title: "Error",
        description: "Failed to load creator data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCreatorStats();
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'scheduled': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'draft': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'video': case 'vlog': case 'livestream': return <Video className="h-4 w-4" />;
      case 'photo': case 'carousel': return <Camera className="h-4 w-4" />;
      default: return <Share2 className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Loading creator dashboard...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Creator Studio
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your content empire across all platforms
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Followers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalFollowers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Across {stats.activePlatforms} active platforms
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Content Pieces</CardTitle>
              <Video className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalContent}</div>
              <p className="text-xs text-muted-foreground">
                {stats.publishedContent} published, {stats.scheduledContent} scheduled
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.monthlyRevenue)}</div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(stats.monthlyExpenses)} expenses
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Engagement</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEngagement.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Total likes & comments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ad Spend</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalAdSpend)}</div>
              <p className="text-xs text-muted-foreground">
                Total advertising investment
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="content" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="platforms">Platforms</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="finances">Finances</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Content Catalog</h2>
              <div className="flex gap-2">
                <Button onClick={() => setSchedulePostOpen(true)} variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Post
                </Button>
                <Button onClick={() => setContentFormOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Content
                </Button>
              </div>
            </div>

            <div className="grid gap-4">
              {recentContent.map((content) => (
                <Card key={content.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {getContentTypeIcon(content.content_type)}
                        <div>
                          <h3 className="font-medium">{content.title}</h3>
                          <p className="text-sm text-muted-foreground capitalize">
                            {content.content_type} • {content.platform?.platform_name || 'No platform'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Eye className="h-4 w-4" />
                          <span>{content.view_count}</span>
                          <Heart className="h-4 w-4" />
                          <span>{content.like_count}</span>
                          <MessageCircle className="h-4 w-4" />
                          <span>{content.comment_count}</span>
                          {content.ad_spend_cents > 0 && (
                            <>
                              <DollarSign className="h-4 w-4" />
                              <span>{formatCurrency(content.ad_spend_cents / 100)}</span>
                            </>
                          )}
                        </div>
                        <Badge className={getStatusColor(content.status)}>
                          {content.status}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="platforms" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Platform Accounts</h2>
              <Button onClick={() => setPlatformFormOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Account
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {platforms.map((platform) => (
                <Card key={platform.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="capitalize">{platform.platform_name}</CardTitle>
                      <Badge variant={platform.is_active ? "default" : "secondary"}>
                        {platform.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <CardDescription>
                      <div className="space-y-1">
                        <div>@{platform.account_handle}</div>
                        {platform.account_display_name && (
                          <div className="text-sm font-medium">{platform.account_display_name}</div>
                        )}
                      </div>
                    </CardDescription>
                  </CardHeader>
                   <CardContent className="space-y-2">
                     <div className="flex justify-between">
                       <span className="text-sm text-muted-foreground">Followers:</span>
                       <span className="font-medium">{platform.followers_count.toLocaleString()}</span>
                     </div>
                     <div className="flex justify-between">
                       <span className="text-sm text-muted-foreground">Posts:</span>
                       <span className="font-medium">{platform.total_posts}</span>
                     </div>
                     <div className="flex justify-between">
                       <span className="text-sm text-muted-foreground">Total Likes:</span>
                       <span className="font-medium">{platform.total_likes.toLocaleString()}</span>
                     </div>
                     <div className="flex justify-between">
                       <span className="text-sm text-muted-foreground">Comments:</span>
                       <span className="font-medium">{platform.total_comments.toLocaleString()}</span>
                     </div>
                     {platform.ad_spend_cents > 0 && (
                       <div className="flex justify-between">
                         <span className="text-sm text-muted-foreground">Ad Spend:</span>
                         <span className="font-medium">{formatCurrency(platform.ad_spend_cents / 100)}</span>
                       </div>
                     )}
                     <div className="pt-2">
                       <Button 
                         variant="outline" 
                         size="sm" 
                         onClick={() => {
                           setEditingPlatform(platform);
                           setPlatformFormOpen(true);
                         }}
                         className="w-full"
                       >
                         <Edit className="h-4 w-4 mr-2" />
                         Edit Account
                       </Button>
                     </div>
                   </CardContent>
                </Card>
              ))}
            </div>

            {/* Platform Summary by Type */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Platform Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(
                  platforms.reduce((acc, platform) => {
                    const key = platform.platform_name;
                    if (!acc[key]) {
                      acc[key] = {
                        count: 0,
                        totalFollowers: 0,
                        totalLikes: 0,
                        totalComments: 0,
                      };
                    }
                    acc[key].count += 1;
                    acc[key].totalFollowers += platform.followers_count;
                    acc[key].totalLikes += platform.total_likes;
                    acc[key].totalComments += platform.total_comments;
                    return acc;
                  }, {} as Record<string, { count: number; totalFollowers: number; totalLikes: number; totalComments: number }>)
                ).map(([platformName, data]) => (
                  <Card key={platformName}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm capitalize">{platformName}</CardTitle>
                      <CardDescription>{data.count} account{data.count > 1 ? 's' : ''}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Followers:</span>
                        <span className="font-medium">{data.totalFollowers.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Engagement:</span>
                        <span className="font-medium">{(data.totalLikes + data.totalComments).toLocaleString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <DashboardCard 
              title="Analytics Overview" 
              description="Performance metrics across all platforms"
              icon={BarChart3}
            >
              <div className="text-center py-8 text-muted-foreground">
                Analytics dashboard coming soon...
              </div>
            </DashboardCard>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DashboardCard 
                title="Upcoming Livestreams" 
                description="Scheduled live content"
                icon={Calendar}
              >
                <div className="text-center py-4">
                  <div className="text-2xl font-bold">{stats.upcomingLivestreams}</div>
                  <p className="text-sm text-muted-foreground">Livestreams scheduled</p>
                </div>
              </DashboardCard>

              <DashboardCard 
                title="Travel Schedule" 
                description="Upcoming trips and events"
                icon={Plane}
              >
                <div className="text-center py-4">
                  <div className="text-2xl font-bold">{stats.upcomingTravel}</div>
                  <p className="text-sm text-muted-foreground">Trips planned</p>
                </div>
              </DashboardCard>
            </div>
          </TabsContent>

          <TabsContent value="finances" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DashboardCard 
                title="Content Revenue" 
                description="Income from content creation"
                icon={TrendingUp}
              >
                <div className="text-center py-4">
                  <div className="text-3xl font-bold text-green-500">
                    {formatCurrency(stats.monthlyRevenue)}
                  </div>
                  <p className="text-sm text-muted-foreground">This month</p>
                </div>
              </DashboardCard>

              <DashboardCard 
                title="Content Expenses" 
                description="Production and platform costs"
                icon={DollarSign}
              >
                <div className="text-center py-4">
                  <div className="text-3xl font-bold text-red-500">
                    {formatCurrency(stats.monthlyExpenses)}
                  </div>
                  <p className="text-sm text-muted-foreground">This month</p>
                </div>
              </DashboardCard>
            </div>
          </TabsContent>

          <TabsContent value="notes">
            <NotesManager module="creators" />
          </TabsContent>
        </Tabs>
      </div>

      <ContentForm 
        open={contentFormOpen}
        onOpenChange={setContentFormOpen}
        onSuccess={fetchCreatorStats}
      />
      
        <SchedulePostForm
          open={schedulePostOpen}
          onOpenChange={setSchedulePostOpen}
          onSuccess={fetchCreatorStats}
          platforms={platforms}
        />

        <PlatformForm 
          open={platformFormOpen} 
          onOpenChange={(open) => {
            setPlatformFormOpen(open);
            if (!open) setEditingPlatform(null);
          }}
          onSuccess={() => {
            fetchCreatorStats();
            setEditingPlatform(null);
          }}
          platform={editingPlatform}
        />
    </AppLayout>
  );
};

export default CreatorsPage;