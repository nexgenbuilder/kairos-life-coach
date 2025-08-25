import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Activity, Heart, Thermometer, Droplets, Pill, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface HealthMetric {
  id: string;
  metric_type: string;
  value: string;
  date: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

interface Medication {
  id: string;
  name: string;
  dosage?: string;
  frequency: string;
  medication_type: string;
  start_date: string;
  end_date?: string;
  is_active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

const HealthTracker: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [newMetric, setNewMetric] = useState({
    metric_type: 'weight' as const,
    value: '',
    notes: ''
  });
  const [newMedication, setNewMedication] = useState({
    name: '',
    dosage: '',
    frequency: '',
    medication_type: 'prescription' as const,
    notes: ''
  });

  const fetchData = async () => {
    if (!user) return;

    try {
      const [metricsResult, medicationsResult] = await Promise.all([
        supabase.from('health_metrics').select('*').eq('user_id', user.id).order('date', { ascending: false }),
        supabase.from('medications').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      ]);

      if (metricsResult.data) setMetrics(metricsResult.data);
      if (medicationsResult.data) setMedications(medicationsResult.data);
    } catch (error) {
      console.error('Error fetching health data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const addMetric = async () => {
    if (!newMetric.value || !user) return;

    console.log('Adding health metric:', { user_id: user.id, ...newMetric });

    try {
      const { data, error } = await supabase
        .from('health_metrics')
        .insert({
          user_id: user.id,
          metric_type: newMetric.metric_type,
          value: newMetric.value,
          notes: newMetric.notes
        })
        .select()
        .single();

      console.log('Health metric insert result:', { data, error });

      if (error) {
        console.error('Health metric insert error:', error);
        throw error;
      }

      if (data) {
        setMetrics([data, ...metrics]);
        setNewMetric({ metric_type: 'weight', value: '', notes: '' });
        toast({
          title: "Metric Added",
          description: "Health metric has been recorded successfully.",
        });
      }
    } catch (error) {
      console.error('Error adding health metric:', error);
      toast({
        title: "Error",
        description: `Failed to add health metric: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const addMedication = async () => {
    if (!newMedication.name || !newMedication.frequency || !user) return;

    console.log('Adding medication:', { user_id: user.id, ...newMedication });

    try {
      const { data, error } = await supabase
        .from('medications')
        .insert({
          user_id: user.id,
          name: newMedication.name,
          dosage: newMedication.dosage,
          frequency: newMedication.frequency,
          medication_type: newMedication.medication_type,
          notes: newMedication.notes
        })
        .select()
        .single();

      console.log('Medication insert result:', { data, error });

      if (error) {
        console.error('Medication insert error:', error);
        throw error;
      }

      if (data) {
        setMedications([data, ...medications]);
        setNewMedication({ name: '', dosage: '', frequency: '', medication_type: 'prescription', notes: '' });
        toast({
          title: "Medication Added",
          description: "Medication has been added to your list.",
        });
      }
    } catch (error) {
      console.error('Error adding medication:', error);
      toast({
        title: "Error",
        description: `Failed to add medication: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'weight': return <Activity className="h-4 w-4" />;
      case 'heart_rate': return <Heart className="h-4 w-4" />;
      case 'temperature': return <Thermometer className="h-4 w-4" />;
      case 'blood_sugar': return <Droplets className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getUnit = (type: string) => {
    switch (type) {
      case 'weight': return 'lbs';
      case 'heart_rate': return 'bpm';
      case 'temperature': return '°F';
      case 'blood_pressure': return 'mmHg';
      case 'blood_sugar': return 'mg/dL';
      default: return '';
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="metrics" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="metrics">Health Metrics</TabsTrigger>
          <TabsTrigger value="medications">Medications</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add Health Metric</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select 
                    value={newMetric.metric_type}
                    onValueChange={(value) => setNewMetric({ ...newMetric, metric_type: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weight">Weight</SelectItem>
                      <SelectItem value="blood_pressure">Blood Pressure</SelectItem>
                      <SelectItem value="heart_rate">Heart Rate</SelectItem>
                      <SelectItem value="temperature">Temperature</SelectItem>
                      <SelectItem value="blood_sugar">Blood Sugar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="value">Value</Label>
                  <Input
                    id="value"
                    placeholder={`Enter ${newMetric.metric_type.replace('_', ' ')}`}
                    value={newMetric.value}
                    onChange={(e) => setNewMetric({ ...newMetric, value: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Input
                    id="notes"
                    placeholder="Optional notes"
                    value={newMetric.notes}
                    onChange={(e) => setNewMetric({ ...newMetric, notes: e.target.value })}
                  />
                </div>
                <div className="space-y-2 flex items-end">
                  <Button onClick={addMetric} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Metric
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
                        {getIcon(metric.metric_type)}
                        <div>
                          <p className="font-medium capitalize">
                            {metric.metric_type.replace('_', ' ')}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {metric.date}
                          </p>
                          {metric.notes && (
                            <p className="text-sm text-muted-foreground italic">
                              {metric.notes}
                            </p>
                          )}
                        </div>
                      </div>
                      <Badge variant="secondary">
                        {metric.value} {getUnit(metric.metric_type)}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="medications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add Medication/Supplement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="med-name">Name</Label>
                  <Input
                    id="med-name"
                    placeholder="Medication or supplement name"
                    value={newMedication.name}
                    onChange={(e) => setNewMedication({ ...newMedication, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dosage">Dosage</Label>
                  <Input
                    id="dosage"
                    placeholder="e.g., 10mg, 1 tablet"
                    value={newMedication.dosage}
                    onChange={(e) => setNewMedication({ ...newMedication, dosage: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequency</Label>
                  <Input
                    id="frequency"
                    placeholder="e.g., Daily, Twice daily, As needed"
                    value={newMedication.frequency}
                    onChange={(e) => setNewMedication({ ...newMedication, frequency: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="med-type">Type</Label>
                  <Select 
                    value={newMedication.medication_type}
                    onValueChange={(value) => setNewMedication({ ...newMedication, medication_type: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="prescription">Prescription</SelectItem>
                      <SelectItem value="supplement">Supplement</SelectItem>
                      <SelectItem value="over_counter">Over the Counter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="med-notes">Notes</Label>
                <Textarea
                  id="med-notes"
                  placeholder="Additional notes about this medication"
                  value={newMedication.notes}
                  onChange={(e) => setNewMedication({ ...newMedication, notes: e.target.value })}
                />
              </div>
              <Button onClick={addMedication} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Medication
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Current Medications</CardTitle>
            </CardHeader>
            <CardContent>
              {medications.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No medications recorded yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {medications.map((medication) => (
                    <div
                      key={medication.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Pill className="h-4 w-4" />
                        <div>
                          <p className="font-medium">{medication.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {medication.dosage} • {medication.frequency}
                          </p>
                          {medication.notes && (
                            <p className="text-sm text-muted-foreground italic">
                              {medication.notes}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={medication.is_active ? "default" : "secondary"}
                          className="capitalize"
                        >
                          {medication.medication_type.replace('_', ' ')}
                        </Badge>
                        <Badge variant={medication.is_active ? "default" : "outline"}>
                          {medication.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HealthTracker;