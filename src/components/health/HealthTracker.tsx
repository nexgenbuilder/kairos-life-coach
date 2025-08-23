import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Activity, Heart, Thermometer } from 'lucide-react';

interface HealthMetric {
  id: string;
  type: 'weight' | 'blood_pressure' | 'heart_rate' | 'temperature';
  value: string;
  date: string;
  notes?: string;
}

const HealthTracker: React.FC = () => {
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [newMetric, setNewMetric] = useState({
    type: 'weight' as const,
    value: '',
    notes: ''
  });

  const addMetric = () => {
    if (!newMetric.value) return;

    const metric: HealthMetric = {
      id: Date.now().toString(),
      type: newMetric.type,
      value: newMetric.value,
      date: new Date().toISOString().split('T')[0],
      notes: newMetric.notes
    };

    setMetrics([metric, ...metrics]);
    setNewMetric({ type: 'weight', value: '', notes: '' });
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'weight': return <Activity className="h-4 w-4" />;
      case 'heart_rate': return <Heart className="h-4 w-4" />;
      case 'temperature': return <Thermometer className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getUnit = (type: string) => {
    switch (type) {
      case 'weight': return 'lbs';
      case 'heart_rate': return 'bpm';
      case 'temperature': return '°F';
      case 'blood_pressure': return 'mmHg';
      default: return '';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add Health Metric</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <select 
                id="type"
                className="w-full p-2 border rounded-md"
                value={newMetric.type}
                onChange={(e) => setNewMetric({ ...newMetric, type: e.target.value as any })}
              >
                <option value="weight">Weight</option>
                <option value="blood_pressure">Blood Pressure</option>
                <option value="heart_rate">Heart Rate</option>
                <option value="temperature">Temperature</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="value">Value</Label>
              <Input
                id="value"
                placeholder={`Enter ${newMetric.type}`}
                value={newMetric.value}
                onChange={(e) => setNewMetric({ ...newMetric, value: e.target.value })}
              />
            </div>
            <div className="space-y-2 flex items-end">
              <Button onClick={addMetric} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          {metrics.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No health metrics recorded yet.
            </p>
          ) : (
            <div className="space-y-3">
              {metrics.map((metric) => (
                <div
                  key={metric.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getIcon(metric.type)}
                    <div>
                      <p className="font-medium capitalize">
                        {metric.type.replace('_', ' ')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {metric.date}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary">
                    {metric.value} {getUnit(metric.type)}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HealthTracker;