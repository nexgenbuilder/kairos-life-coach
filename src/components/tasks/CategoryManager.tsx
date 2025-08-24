import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TaskCategory {
  id: string;
  name: string;
  color: string;
  description: string | null;
  total_tasks?: number;
  active_tasks?: number;
  inactive_tasks?: number;
  completed_tasks?: number;
}

interface CategoryStats {
  [categoryId: string]: {
    total: number;
    active: number;
    inactive: number;
    completed: number;
  };
}

export const CategoryManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [categories, setCategories] = useState<TaskCategory[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryStats>({});
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<TaskCategory | null>(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    color: '#3b82f6',
    description: ''
  });

  const resetForm = () => {
    setFormData({ name: '', color: '#3b82f6', description: '' });
    setEditingCategory(null);
  };

  const fetchCategories = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('task_categories')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Error",
        description: "Failed to load categories",
        variant: "destructive",
      });
    }
  };

  const fetchCategoryStats = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('category_id, status')
        .eq('user_id', user.id);

      if (error) throw error;

      const stats: CategoryStats = {};
      
      data?.forEach(task => {
        const categoryId = task.category_id || 'uncategorized';
        if (!stats[categoryId]) {
          stats[categoryId] = { total: 0, active: 0, inactive: 0, completed: 0 };
        }
        
        stats[categoryId].total++;
        switch (task.status) {
          case 'active':
            stats[categoryId].active++;
            break;
          case 'inactive':
            stats[categoryId].inactive++;
            break;
          case 'completed':
            stats[categoryId].completed++;
            break;
        }
      });

      setCategoryStats(stats);
    } catch (error) {
      console.error('Error fetching category stats:', error);
    }
  };

  useEffect(() => {
    if (user) {
      Promise.all([fetchCategories(), fetchCategoryStats()]).finally(() => setLoading(false));
    }
  }, [user]);

  // Real-time updates
  useEffect(() => {
    if (!user) return;

    const categoriesChannel = supabase
      .channel('categories-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'task_categories',
          filter: `user_id=eq.${user.id}`
        },
        () => fetchCategories()
      )
      .subscribe();

    const tasksChannel = supabase
      .channel('tasks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `user_id=eq.${user.id}`
        },
        () => fetchCategoryStats()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(categoriesChannel);
      supabase.removeChannel(tasksChannel);
    };
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.name.trim()) return;

    try {
      if (editingCategory) {
        const { error } = await supabase
          .from('task_categories')
          .update({
            name: formData.name.trim(),
            color: formData.color,
            description: formData.description.trim() || null,
          })
          .eq('id', editingCategory.id);

        if (error) throw error;
        toast({ title: "Success", description: "Category updated successfully" });
      } else {
        const { error } = await supabase
          .from('task_categories')
          .insert({
            user_id: user.id,
            name: formData.name.trim(),
            color: formData.color,
            description: formData.description.trim() || null,
          });

        if (error) throw error;
        toast({ title: "Success", description: "Category created successfully" });
      }

      resetForm();
      setIsCreateDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save category",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (category: TaskCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      color: category.color,
      description: category.description || ''
    });
    setIsCreateDialogOpen(true);
  };

  const handleDelete = async (categoryId: string) => {
    if (!confirm('Are you sure? Tasks in this category will be uncategorized.')) return;

    try {
      const { error } = await supabase
        .from('task_categories')
        .delete()
        .eq('id', categoryId);

      if (error) throw error;
      toast({ title: "Success", description: "Category deleted successfully" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete category",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="text-center p-4">Loading categories...</div>;
  }

  const uncategorizedStats = categoryStats['uncategorized'] || { total: 0, active: 0, inactive: 0, completed: 0 };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Task Categories</h3>
        <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? 'Edit Category' : 'Create New Category'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Category Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter category name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="color">Color</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="color"
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    className="w-16 h-10"
                  />
                  <div
                    className="w-10 h-10 rounded border"
                    style={{ backgroundColor: formData.color }}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter category description"
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">
                  {editingCategory ? 'Update' : 'Create'} Category
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Uncategorized tasks */}
        {uncategorizedStats.total > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center justify-between">
                <span>Uncategorized</span>
                <Badge variant="secondary">{uncategorizedStats.total}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-green-600">Active: {uncategorizedStats.active}</span>
                <span className="text-yellow-600">Inactive: {uncategorizedStats.inactive}</span>
                <span className="text-blue-600">Completed: {uncategorizedStats.completed}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Category cards */}
        {categories.map((category) => {
          const stats = categoryStats[category.id] || { total: 0, active: 0, inactive: 0, completed: 0 };
          return (
            <Card key={category.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span>{category.name}</span>
                  </div>
                  <Badge variant="secondary">{stats.total}</Badge>
                </CardTitle>
                {category.description && (
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                )}
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">Active: {stats.active}</span>
                  <span className="text-yellow-600">Inactive: {stats.inactive}</span>
                  <span className="text-blue-600">Completed: {stats.completed}</span>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(category)}
                    className="flex-1"
                  >
                    <Edit2 className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(category.id)}
                    className="flex-1 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};