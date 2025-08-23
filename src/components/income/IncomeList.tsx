import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, TrendingUp } from 'lucide-react';

interface Income {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  is_recurring: boolean;
  recurring_frequency: string | null;
  created_at: string;
}

interface IncomeListProps {
  refreshTrigger: number;
}

const IncomeList: React.FC<IncomeListProps> = ({ refreshTrigger }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [income, setIncome] = useState<Income[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchIncome = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('income')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;
      setIncome(data || []);
    } catch (error) {
      console.error('Error fetching income:', error);
      toast({
        title: "Error",
        description: "Failed to fetch income",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteIncome = async (id: string) => {
    try {
      const { error } = await supabase
        .from('income')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setIncome(income.filter(item => item.id !== id));
      toast({
        title: "Success",
        description: "Income deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting income:', error);
      toast({
        title: "Error",
        description: "Failed to delete income",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchIncome();
    }
  }, [user, refreshTrigger]);

  const totalIncome = income.reduce((sum, item) => sum + item.amount, 0);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Salary': 'bg-blue-100 text-blue-800',
      'Freelance': 'bg-green-100 text-green-800',
      'Investment': 'bg-purple-100 text-purple-800',
      'Business': 'bg-orange-100 text-orange-800',
      'Rental': 'bg-yellow-100 text-yellow-800',
      'Other': 'bg-gray-100 text-gray-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading income...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Income List
        </CardTitle>
        <div className="text-2xl font-bold text-green-600">
          Total: ${totalIncome.toFixed(2)}
        </div>
      </CardHeader>
      <CardContent>
        {income.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No income records found. Add your first income entry above!
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {income.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{item.description}</span>
                    <Badge className={getCategoryColor(item.category)}>
                      {item.category}
                    </Badge>
                    {item.is_recurring && (
                      <Badge variant="outline">
                        {item.recurring_frequency}
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatDate(item.date)}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-green-600">
                    +${item.amount.toFixed(2)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteIncome(item.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default IncomeList;