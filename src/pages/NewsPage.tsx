import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Newspaper, ExternalLink, Bookmark, BookmarkCheck, Eye, EyeOff, Filter, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface NewsArticle {
  id: string;
  title: string;
  content: string;
  source: string;
  url: string;
  published_date: string;
  category: string;
  keywords: string[];
  is_read: boolean;
  is_bookmarked: boolean;
  sentiment: string;
  created_at: string;
}

const NewsPage = () => {
  const { user } = useAuth();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterRead, setFilterRead] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    source: '',
    url: '',
    published_date: new Date().toISOString().split('T')[0],
    category: '',
    keywords: '',
    sentiment: 'neutral'
  });

  useEffect(() => {
    if (user) {
      loadArticles();
    }
  }, [user]);

  useEffect(() => {
    filterArticles();
  }, [articles, filterCategory, filterRead, searchTerm]);

  const filterArticles = () => {
    let filtered = articles;

    if (filterCategory !== 'all') {
      filtered = filtered.filter(article => article.category === filterCategory);
    }

    if (filterRead !== 'all') {
      filtered = filtered.filter(article => 
        filterRead === 'read' ? article.is_read : !article.is_read
      );
    }

    if (searchTerm) {
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.source.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredArticles(filtered);
  };

  const loadArticles = async () => {
    try {
      const { data, error } = await supabase
        .from('news_feed')
        .select('*')
        .eq('user_id', user!.id)
        .order('published_date', { ascending: false });

      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error('Error loading news articles:', error);
      toast({
        title: 'Error',
        description: 'Failed to load news articles',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const articleData = {
        user_id: user.id,
        title: formData.title,
        content: formData.content,
        source: formData.source,
        url: formData.url || null,
        published_date: formData.published_date,
        category: formData.category,
        keywords: formData.keywords ? formData.keywords.split(',').map(k => k.trim()) : [],
        is_read: false,
        is_bookmarked: false,
        sentiment: formData.sentiment
      };

      const { error } = await supabase
        .from('news_feed')
        .insert([articleData]);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'News article added successfully',
      });

      setIsDialogOpen(false);
      resetForm();
      loadArticles();
    } catch (error) {
      console.error('Error saving news article:', error);
      toast({
        title: 'Error',
        description: 'Failed to save news article',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      source: '',
      url: '',
      published_date: new Date().toISOString().split('T')[0],
      category: '',
      keywords: '',
      sentiment: 'neutral'
    });
  };

  const toggleRead = async (articleId: string, currentReadStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('news_feed')
        .update({ is_read: !currentReadStatus })
        .eq('id', articleId);

      if (error) throw error;
      loadArticles();
    } catch (error) {
      console.error('Error updating read status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update read status',
        variant: 'destructive',
      });
    }
  };

  const toggleBookmark = async (articleId: string, currentBookmarkStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('news_feed')
        .update({ is_bookmarked: !currentBookmarkStatus })
        .eq('id', articleId);

      if (error) throw error;
      loadArticles();
    } catch (error) {
      console.error('Error updating bookmark status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update bookmark status',
        variant: 'destructive',
      });
    }
  };

  const deleteArticle = async (articleId: string) => {
    try {
      const { error } = await supabase
        .from('news_feed')
        .delete()
        .eq('id', articleId);

      if (error) throw error;
      toast({ title: 'Success', description: 'Article deleted successfully' });
      loadArticles();
    } catch (error) {
      console.error('Error deleting article:', error);
      toast({ title: 'Error', description: 'Failed to delete article', variant: 'destructive' });
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-100 text-green-800';
      case 'negative': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const categories = [...new Set(articles.map(article => article.category))].filter(Boolean);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto p-4 sm:p-6 max-w-full overflow-x-hidden">
          <div className="text-center">Loading...</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-full overflow-x-hidden">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            News Feed
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-2">
            Stay updated with curated news articles
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
              <Newspaper className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{articles.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unread</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{articles.filter(a => !a.is_read).length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bookmarked</CardTitle>
              <Bookmark className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{articles.filter(a => a.is_bookmarked).length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
              <Filter className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{categories.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Add Button */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>News Articles</CardTitle>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetForm}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Article
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add News Article</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="content">Content</Label>
                      <Textarea
                        id="content"
                        value={formData.content}
                        onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                        rows={5}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="source">Source</Label>
                        <Input
                          id="source"
                          value={formData.source}
                          onChange={(e) => setFormData(prev => ({ ...prev, source: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="url">URL</Label>
                        <Input
                          id="url"
                          type="url"
                          value={formData.url}
                          onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Input
                          id="category"
                          value={formData.category}
                          onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="published_date">Published Date</Label>
                        <Input
                          id="published_date"
                          type="date"
                          value={formData.published_date}
                          onChange={(e) => setFormData(prev => ({ ...prev, published_date: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="sentiment">Sentiment</Label>
                        <Select value={formData.sentiment} onValueChange={(value) => setFormData(prev => ({ ...prev, sentiment: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="positive">Positive</SelectItem>
                            <SelectItem value="neutral">Neutral</SelectItem>
                            <SelectItem value="negative">Negative</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="keywords">Keywords (comma-separated)</Label>
                      <Input
                        id="keywords"
                        value={formData.keywords}
                        onChange={(e) => setFormData(prev => ({ ...prev, keywords: e.target.value }))}
                        placeholder="tech, AI, finance"
                      />
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">Add Article</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filter Controls */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4" />
                <Input
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-48"
                />
              </div>
              
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterRead} onValueChange={setFilterRead}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="read">Read</SelectItem>
                  <SelectItem value="unread">Unread</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Articles List */}
            <div className="space-y-4">
              {filteredArticles.map((article) => (
                <Card key={article.id} className={`${!article.is_read ? 'border-l-4 border-l-primary' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{article.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {article.source} • {new Date(article.published_date).toLocaleDateString()}
                        </p>
                        {article.content && (
                          <p className="text-sm mb-3 line-clamp-3">{article.content}</p>
                        )}
                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge variant="outline">{article.category}</Badge>
                          <Badge className={getSentimentColor(article.sentiment)}>
                            {article.sentiment}
                          </Badge>
                          {article.keywords?.map((keyword, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col space-y-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleRead(article.id, article.is_read)}
                        >
                          {article.is_read ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleBookmark(article.id, article.is_bookmarked)}
                        >
                          {article.is_bookmarked ? (
                            <BookmarkCheck className="h-4 w-4" />
                          ) : (
                            <Bookmark className="h-4 w-4" />
                          )}
                        </Button>
                        {article.url && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(article.url, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteArticle(article.id)}
                        >
                          ×
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default NewsPage;