import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Dumbbell, Clock, Target, Calendar, CheckSquare, Activity, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { format, addDays, startOfWeek } from 'date-fns';

interface FitnessWorkout {
  id?: string;
  exercise_name: string;
  exercise_type: 'cardio' | 'strength' | 'bodyweight' | 'flexibility' | 'sports';
  duration_minutes?: number;
  sets?: number;
  reps?: number;
  weight_lbs?: number;
  distance_miles?: number;
  calories_burned?: number;
  notes?: string;
  workout_date: string;
}

interface FitnessGoal {
  id?: string;
  goal_type: 'weight_loss' | 'muscle_gain' | 'endurance' | 'strength' | 'custom';
  target_value: number;
  current_value: number;
  unit: string;
  target_date?: string;
  description: string;
  is_active: boolean;
}

const exerciseTypes = [
  { value: 'cardio', label: 'Cardio', examples: 'Running, Cycling, Swimming' },
  { value: 'strength', label: 'Strength Training', examples: 'Weight lifting, Resistance bands' },
  { value: 'bodyweight', label: 'Bodyweight', examples: 'Push-ups, Pull-ups, Squats' },
  { value: 'flexibility', label: 'Flexibility', examples: 'Yoga, Stretching, Pilates' },
  { value: 'sports', label: 'Sports', examples: 'Basketball, Tennis, Soccer' }
];

const FitnessTracker: React.FC = () => {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<FitnessWorkout[]>([]);
  const [goals, setGoals] = useState<FitnessGoal[]>([]);
  const [isAddingWorkout, setIsAddingWorkout] = useState(false);
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    thisWeekWorkouts: 0,
    topExercise: '',
    totalCalories: 0,
    activeGoals: 0
  });

  const [newWorkout, setNewWorkout] = useState<FitnessWorkout>({
    exercise_name: '',
    exercise_type: 'cardio',
    duration_minutes: undefined,
    sets: undefined,
    reps: undefined,
    weight_lbs: undefined,
    distance_miles: undefined,
    calories_burned: undefined,
    notes: '',
    workout_date: new Date().toISOString().split('T')[0]
  });

  const [newGoal, setNewGoal] = useState<FitnessGoal>({
    goal_type: 'custom',
    target_value: 0,
    current_value: 0,
    unit: '',
    target_date: '',
    description: '',
    is_active: true
  });

  useEffect(() => {
    if (user) {
      loadWorkouts();
      loadGoals();
    }
  }, [user]);

  const loadWorkouts = async () => {
    try {
      const { data, error } = await supabase
        .from('fitness_workouts')
        .select('*')
        .eq('user_id', user?.id)
        .order('workout_date', { ascending: false });

      if (error) throw error;
      setWorkouts(data as FitnessWorkout[] || []);
      calculateStats(data as FitnessWorkout[] || []);
    } catch (error) {
      console.error('Error loading workouts:', error);
      toast.error('Failed to load workouts');
    }
  };

  const loadGoals = async () => {
    try {
      const { data, error } = await supabase
        .from('fitness_goals')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGoals(data as FitnessGoal[] || []);
    } catch (error) {
      console.error('Error loading goals:', error);
      toast.error('Failed to load goals');
    }
  };

  const calculateStats = (workoutsData: FitnessWorkout[]) => {
    const now = new Date();
    const weekStart = startOfWeek(now);
    
    const thisWeekWorkouts = workoutsData.filter(w => 
      new Date(w.workout_date) >= weekStart
    ).length;

    const exerciseCounts: { [key: string]: number } = {};
    workoutsData.forEach(w => {
      exerciseCounts[w.exercise_name] = (exerciseCounts[w.exercise_name] || 0) + 1;
    });

    const topExercise = Object.entries(exerciseCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';
    const totalCalories = workoutsData.reduce((sum, w) => sum + (w.calories_burned || 0), 0);

    setStats({
      totalWorkouts: workoutsData.length,
      thisWeekWorkouts,
      topExercise,
      totalCalories,
      activeGoals: goals.filter(g => g.is_active).length
    });
  };

  const saveWorkout = async () => {
    if (!newWorkout.exercise_name) {
      toast.error('Please enter an exercise name');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('fitness_workouts')
        .insert({
          user_id: user?.id,
          ...newWorkout
        })
        .select()
        .single();

      if (error) throw error;

      setWorkouts([data as FitnessWorkout, ...workouts]);
      calculateStats([data as FitnessWorkout, ...workouts]);
      
      setNewWorkout({
        exercise_name: '',
        exercise_type: 'cardio',
        duration_minutes: undefined,
        sets: undefined,
        reps: undefined,
        weight_lbs: undefined,
        distance_miles: undefined,
        calories_burned: undefined,
        notes: '',
        workout_date: new Date().toISOString().split('T')[0]
      });
      
      setIsAddingWorkout(false);
      toast.success('Workout logged successfully!');
    } catch (error) {
      console.error('Error saving workout:', error);
      toast.error('Failed to save workout');
    }
  };

  const saveGoal = async () => {
    if (!newGoal.description || !newGoal.target_value) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('fitness_goals')
        .insert({
          user_id: user?.id,
          ...newGoal
        })
        .select()
        .single();

      if (error) throw error;

      setGoals([data as FitnessGoal, ...goals]);
      
      setNewGoal({
        goal_type: 'custom',
        target_value: 0,
        current_value: 0,
        unit: '',
        target_date: '',
        description: '',
        is_active: true
      });
      
      setIsAddingGoal(false);
      toast.success('Goal created successfully!');
    } catch (error) {
      console.error('Error saving goal:', error);
      toast.error('Failed to save goal');
    }
  };

  const updateGoalProgress = async (goalId: string, newProgress: number) => {
    try {
      const { error } = await supabase
        .from('fitness_goals')
        .update({ current_value: newProgress })
        .eq('id', goalId)
        .eq('user_id', user?.id);

      if (error) throw error;

      setGoals(goals.map(g => 
        g.id === goalId ? { ...g, current_value: newProgress } : g
      ));
      toast.success('Goal progress updated!');
    } catch (error) {
      console.error('Error updating goal:', error);
      toast.error('Failed to update goal');
    }
  };

  const deleteWorkout = async (workoutId: string) => {
    try {
      const { error } = await supabase
        .from('fitness_workouts')
        .delete()
        .eq('id', workoutId)
        .eq('user_id', user?.id);

      if (error) throw error;

      const updatedWorkouts = workouts.filter(w => w.id !== workoutId);
      setWorkouts(updatedWorkouts);
      calculateStats(updatedWorkouts);
      toast.success('Workout deleted!');
    } catch (error) {
      console.error('Error deleting workout:', error);
      toast.error('Failed to delete workout');
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Workouts</p>
                <p className="text-2xl font-bold">{stats.totalWorkouts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">This Week</p>
                <p className="text-2xl font-bold">{stats.thisWeekWorkouts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Dumbbell className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Top Exercise</p>
                <p className="text-lg font-semibold truncate">{stats.topExercise}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Calories Burned</p>
                <p className="text-2xl font-bold">{stats.totalCalories}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Active Goals</p>
                <p className="text-2xl font-bold">{stats.activeGoals}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="workouts" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="workouts">Log Workouts</TabsTrigger>
          <TabsTrigger value="goals">Fitness Goals</TabsTrigger>
          <TabsTrigger value="history">Workout History</TabsTrigger>
        </TabsList>

        <TabsContent value="workouts" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Log Workout</CardTitle>
                <Button 
                  onClick={() => setIsAddingWorkout(!isAddingWorkout)}
                  variant={isAddingWorkout ? "outline" : "default"}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {isAddingWorkout ? "Cancel" : "Log Workout"}
                </Button>
              </div>
            </CardHeader>
            {isAddingWorkout && (
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="exercise-name">Exercise Name *</Label>
                    <Input
                      id="exercise-name"
                      placeholder="e.g., Push-ups, Running, Bench Press"
                      value={newWorkout.exercise_name}
                      onChange={(e) => setNewWorkout({ ...newWorkout, exercise_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="exercise-type">Exercise Type *</Label>
                    <Select onValueChange={(value: any) => setNewWorkout({ ...newWorkout, exercise_type: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select exercise type" />
                      </SelectTrigger>
                      <SelectContent>
                        {exerciseTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div>
                              <div className="font-medium">{type.label}</div>
                              <div className="text-xs text-muted-foreground">{type.examples}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      placeholder="30"
                      value={newWorkout.duration_minutes || ''}
                      onChange={(e) => setNewWorkout({ ...newWorkout, duration_minutes: e.target.value ? parseInt(e.target.value) : undefined })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sets">Sets</Label>
                    <Input
                      id="sets"
                      type="number"
                      placeholder="3"
                      value={newWorkout.sets || ''}
                      onChange={(e) => setNewWorkout({ ...newWorkout, sets: e.target.value ? parseInt(e.target.value) : undefined })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reps">Reps</Label>
                    <Input
                      id="reps"
                      type="number"
                      placeholder="10"
                      value={newWorkout.reps || ''}
                      onChange={(e) => setNewWorkout({ ...newWorkout, reps: e.target.value ? parseInt(e.target.value) : undefined })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (lbs)</Label>
                    <Input
                      id="weight"
                      type="number"
                      placeholder="135"
                      value={newWorkout.weight_lbs || ''}
                      onChange={(e) => setNewWorkout({ ...newWorkout, weight_lbs: e.target.value ? parseFloat(e.target.value) : undefined })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="distance">Distance (miles)</Label>
                    <Input
                      id="distance"
                      type="number"
                      step="0.1"
                      placeholder="3.1"
                      value={newWorkout.distance_miles || ''}
                      onChange={(e) => setNewWorkout({ ...newWorkout, distance_miles: e.target.value ? parseFloat(e.target.value) : undefined })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="calories">Calories Burned</Label>
                    <Input
                      id="calories"
                      type="number"
                      placeholder="300"
                      value={newWorkout.calories_burned || ''}
                      onChange={(e) => setNewWorkout({ ...newWorkout, calories_burned: e.target.value ? parseInt(e.target.value) : undefined })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="workout-date">Workout Date</Label>
                    <Input
                      id="workout-date"
                      type="date"
                      value={newWorkout.workout_date}
                      onChange={(e) => setNewWorkout({ ...newWorkout, workout_date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="How did it feel? Any observations..."
                      value={newWorkout.notes || ''}
                      onChange={(e) => setNewWorkout({ ...newWorkout, notes: e.target.value })}
                    />
                  </div>
                </div>

                <Button onClick={saveWorkout} className="w-full">
                  Log Workout
                </Button>
              </CardContent>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Fitness Goals</CardTitle>
                <Button 
                  onClick={() => setIsAddingGoal(!isAddingGoal)}
                  variant={isAddingGoal ? "outline" : "default"}
                >
                  <Target className="h-4 w-4 mr-2" />
                  {isAddingGoal ? "Cancel" : "Add Goal"}
                </Button>
              </div>
            </CardHeader>
            {isAddingGoal && (
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="goal-description">Goal Description *</Label>
                    <Input
                      id="goal-description"
                      placeholder="e.g., Lose 10 pounds, Run a 5K"
                      value={newGoal.description}
                      onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="goal-type">Goal Type</Label>
                    <Select onValueChange={(value: any) => setNewGoal({ ...newGoal, goal_type: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select goal type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weight_loss">Weight Loss</SelectItem>
                        <SelectItem value="muscle_gain">Muscle Gain</SelectItem>
                        <SelectItem value="endurance">Endurance</SelectItem>
                        <SelectItem value="strength">Strength</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="target-value">Target Value *</Label>
                    <Input
                      id="target-value"
                      type="number"
                      placeholder="10"
                      value={newGoal.target_value || ''}
                      onChange={(e) => setNewGoal({ ...newGoal, target_value: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="current-value">Current Value</Label>
                    <Input
                      id="current-value"
                      type="number"
                      placeholder="0"
                      value={newGoal.current_value || ''}
                      onChange={(e) => setNewGoal({ ...newGoal, current_value: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unit">Unit</Label>
                    <Input
                      id="unit"
                      placeholder="lbs, miles, reps"
                      value={newGoal.unit}
                      onChange={(e) => setNewGoal({ ...newGoal, unit: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="target-date">Target Date</Label>
                  <Input
                    id="target-date"
                    type="date"
                    value={newGoal.target_date || ''}
                    onChange={(e) => setNewGoal({ ...newGoal, target_date: e.target.value })}
                  />
                </div>

                <Button onClick={saveGoal} className="w-full">
                  Create Goal
                </Button>
              </CardContent>
            )}
          </Card>

          {/* Active Goals */}
          <div className="space-y-4">
            {goals.filter(g => g.is_active).map((goal) => (
              <Card key={goal.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold">{goal.description}</h3>
                      <Badge variant="outline" className="mt-1">
                        {goal.goal_type.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Progress</p>
                      <p className="text-lg font-bold">
                        {goal.current_value} / {goal.target_value} {goal.unit}
                      </p>
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${Math.min((goal.current_value / goal.target_value) * 100, 100)}%` }}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Update progress"
                      className="flex-1"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          const value = parseFloat((e.target as HTMLInputElement).value);
                          if (value && goal.id) {
                            updateGoalProgress(goal.id, value);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }
                      }}
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        const input = document.querySelector(`input[placeholder="Update progress"]`) as HTMLInputElement;
                        const value = parseFloat(input.value);
                        if (value && goal.id) {
                          updateGoalProgress(goal.id, value);
                          input.value = '';
                        }
                      }}
                    >
                      Update
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Workouts</CardTitle>
            </CardHeader>
            <CardContent>
              {workouts.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No workouts logged yet. Start by logging your first workout!
                </p>
              ) : (
                <div className="space-y-4">
                  {workouts.map((workout) => (
                    <div
                      key={workout.id}
                      className="p-4 border rounded-lg space-y-2"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg">{workout.exercise_name}</h3>
                          <Badge variant="outline" className="mt-1">
                            {workout.exercise_type}
                          </Badge>
                        </div>
                        <div className="flex gap-2 items-center">
                          <Badge variant="secondary">
                            {format(new Date(workout.workout_date), 'MMM d, yyyy')}
                          </Badge>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => workout.id && deleteWorkout(workout.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        {workout.duration_minutes && (
                          <div>
                            <p className="text-muted-foreground">Duration</p>
                            <p className="font-medium">{workout.duration_minutes} min</p>
                          </div>
                        )}
                        {workout.sets && workout.reps && (
                          <div>
                            <p className="text-muted-foreground">Sets × Reps</p>
                            <p className="font-medium">{workout.sets} × {workout.reps}</p>
                          </div>
                        )}
                        {workout.weight_lbs && (
                          <div>
                            <p className="text-muted-foreground">Weight</p>
                            <p className="font-medium">{workout.weight_lbs} lbs</p>
                          </div>
                        )}
                        {workout.distance_miles && (
                          <div>
                            <p className="text-muted-foreground">Distance</p>
                            <p className="font-medium">{workout.distance_miles} mi</p>
                          </div>
                        )}
                        {workout.calories_burned && (
                          <div>
                            <p className="text-muted-foreground">Calories</p>
                            <p className="font-medium">{workout.calories_burned}</p>
                          </div>
                        )}
                      </div>
                      
                      {workout.notes && (
                        <p className="text-sm text-muted-foreground">{workout.notes}</p>
                      )}
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

export default FitnessTracker;