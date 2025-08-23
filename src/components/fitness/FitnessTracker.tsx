import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Dumbbell, Clock, Target, Calendar, CheckSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { format, addDays, startOfWeek } from 'date-fns';

interface Workout {
  id: string;
  name: string;
  exercises: Exercise[];
  duration: number;
  date: string;
  notes?: string;
  completed?: boolean;
}

interface Exercise {
  name: string;
  sets: number;
  reps: number;
  weight?: number;
}

interface ScheduledWorkout {
  id: string;
  name: string;
  duration: number;
  exercises: Exercise[];
  notes?: string;
  scheduled_date: string;
  scheduled_time: string;
  completed: boolean;
}

interface WorkoutTemplate {
  id: string;
  name: string;
  exercises: Exercise[];
  duration: number;
  notes?: string;
}

const FitnessTracker: React.FC = () => {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [scheduledWorkouts, setScheduledWorkouts] = useState<ScheduledWorkout[]>([]);
  const [workoutTemplates, setWorkoutTemplates] = useState<WorkoutTemplate[]>([]);
  const [isAddingWorkout, setIsAddingWorkout] = useState(false);
  const [isSchedulingWorkout, setIsSchedulingWorkout] = useState(false);
  const [newWorkout, setNewWorkout] = useState({
    name: '',
    duration: '',
    notes: '',
    exercises: [{ name: '', sets: 1, reps: 1, weight: 0 }]
  });
  const [scheduleForm, setScheduleForm] = useState({
    templateId: '',
    date: '',
    time: '09:00',
    notes: ''
  });

  useEffect(() => {
    if (user) {
      loadWorkoutTemplates();
      loadScheduledWorkouts();
    }
  }, [user]);

  const loadWorkoutTemplates = async () => {
    try {
      // For now, we'll use local storage since we don't have a workout_templates table
      const stored = localStorage.getItem(`workout_templates_${user?.id}`);
      if (stored) {
        setWorkoutTemplates(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading workout templates:', error);
    }
  };

  const loadScheduledWorkouts = async () => {
    try {
      // For now, we'll use local storage since we don't have a scheduled_workouts table
      const stored = localStorage.getItem(`scheduled_workouts_${user?.id}`);
      if (stored) {
        setScheduledWorkouts(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading scheduled workouts:', error);
    }
  };

  const addExercise = () => {
    setNewWorkout({
      ...newWorkout,
      exercises: [...newWorkout.exercises, { name: '', sets: 1, reps: 1, weight: 0 }]
    });
  };

  const updateExercise = (index: number, field: keyof Exercise, value: any) => {
    const exercises = [...newWorkout.exercises];
    exercises[index] = { ...exercises[index], [field]: value };
    setNewWorkout({ ...newWorkout, exercises });
  };

  const saveWorkout = () => {
    if (!newWorkout.name || newWorkout.exercises.some(ex => !ex.name)) return;

    const workout: WorkoutTemplate = {
      id: Date.now().toString(),
      name: newWorkout.name,
      exercises: newWorkout.exercises,
      duration: parseInt(newWorkout.duration) || 0,
      notes: newWorkout.notes
    };

    const updatedTemplates = [workout, ...workoutTemplates];
    setWorkoutTemplates(updatedTemplates);
    localStorage.setItem(`workout_templates_${user?.id}`, JSON.stringify(updatedTemplates));

    setNewWorkout({
      name: '',
      duration: '',
      notes: '',
      exercises: [{ name: '', sets: 1, reps: 1, weight: 0 }]
    });
    setIsAddingWorkout(false);
    toast.success('Workout template saved!');
  };

  const scheduleWorkout = async () => {
    if (!scheduleForm.templateId || !scheduleForm.date || !scheduleForm.time) {
      toast.error('Please fill in all required fields');
      return;
    }

    const template = workoutTemplates.find(t => t.id === scheduleForm.templateId);
    if (!template) return;

    try {
      const scheduledDateTime = new Date(`${scheduleForm.date}T${scheduleForm.time}`);
      const endDateTime = new Date(scheduledDateTime.getTime() + template.duration * 60 * 1000);

      // Create calendar event
      const { data, error } = await supabase
        .from('events')
        .insert({
          user_id: user?.id,
          title: `Workout: ${template.name}`,
          description: `${template.exercises.map(ex => ex.name).join(', ')}\n\n${scheduleForm.notes || template.notes || ''}`,
          start_time: scheduledDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
          is_synced_with_google: false
        })
        .select()
        .single();

      if (error) throw error;

      // Create scheduled workout record
      const scheduledWorkout: ScheduledWorkout = {
        id: data.id,
        name: template.name,
        duration: template.duration,
        exercises: template.exercises,
        notes: scheduleForm.notes || template.notes,
        scheduled_date: scheduleForm.date,
        scheduled_time: scheduleForm.time,
        completed: false
      };

      const updatedScheduled = [scheduledWorkout, ...scheduledWorkouts];
      setScheduledWorkouts(updatedScheduled);
      localStorage.setItem(`scheduled_workouts_${user?.id}`, JSON.stringify(updatedScheduled));

      setScheduleForm({
        templateId: '',
        date: '',
        time: '09:00',
        notes: ''
      });
      setIsSchedulingWorkout(false);
      toast.success('Workout scheduled and added to calendar!');
    } catch (error) {
      console.error('Error scheduling workout:', error);
      toast.error('Failed to schedule workout');
    }
  };

  const completeScheduledWorkout = async (workoutId: string) => {
    try {
      const updatedScheduled = scheduledWorkouts.map(w => 
        w.id === workoutId ? { ...w, completed: true } : w
      );
      setScheduledWorkouts(updatedScheduled);
      localStorage.setItem(`scheduled_workouts_${user?.id}`, JSON.stringify(updatedScheduled));

      // Add to completed workouts
      const workout = scheduledWorkouts.find(w => w.id === workoutId);
      if (workout) {
        const completedWorkout: Workout = {
          id: Date.now().toString(),
          name: workout.name,
          exercises: workout.exercises,
          duration: workout.duration,
          date: new Date().toISOString().split('T')[0],
          notes: workout.notes,
          completed: true
        };
        setWorkouts([completedWorkout, ...workouts]);
      }

      toast.success('Workout completed!');
    } catch (error) {
      console.error('Error completing workout:', error);
      toast.error('Failed to mark workout as complete');
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="schedule" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="schedule">Schedule Workouts</TabsTrigger>
          <TabsTrigger value="templates">Workout Templates</TabsTrigger>
          <TabsTrigger value="history">Workout History</TabsTrigger>
        </TabsList>

        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Schedule Workout</CardTitle>
                <Button 
                  onClick={() => setIsSchedulingWorkout(!isSchedulingWorkout)}
                  variant={isSchedulingWorkout ? "outline" : "default"}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  {isSchedulingWorkout ? "Cancel" : "Schedule New"}
                </Button>
              </div>
            </CardHeader>
            {isSchedulingWorkout && (
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="template-select">Workout Template</Label>
                    <Select onValueChange={(value) => setScheduleForm({ ...scheduleForm, templateId: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a workout template" />
                      </SelectTrigger>
                      <SelectContent>
                        {workoutTemplates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name} ({template.duration}min)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="schedule-date">Date</Label>
                    <Input
                      id="schedule-date"
                      type="date"
                      value={scheduleForm.date}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, date: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="schedule-time">Time</Label>
                    <Input
                      id="schedule-time"
                      type="time"
                      value={scheduleForm.time}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, time: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="schedule-notes">Notes (Optional)</Label>
                    <Input
                      id="schedule-notes"
                      placeholder="Additional notes for this session"
                      value={scheduleForm.notes}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, notes: e.target.value })}
                    />
                  </div>
                </div>
                <Button onClick={scheduleWorkout} className="w-full">
                  Schedule Workout
                </Button>
              </CardContent>
            )}
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Scheduled Workouts</CardTitle>
            </CardHeader>
            <CardContent>
              {scheduledWorkouts.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No workouts scheduled. Create templates and schedule them above!
                </p>
              ) : (
                <div className="space-y-4">
                  {scheduledWorkouts
                    .sort((a, b) => new Date(a.scheduled_date + 'T' + a.scheduled_time).getTime() - new Date(b.scheduled_date + 'T' + b.scheduled_time).getTime())
                    .map((workout) => (
                    <div
                      key={workout.id}
                      className={`p-4 border rounded-lg space-y-3 ${workout.completed ? 'opacity-60 bg-muted/20' : ''}`}
                    >
                      <div className="flex justify-between items-start">
                        <h3 className={`font-semibold text-lg ${workout.completed ? 'line-through' : ''}`}>
                          {workout.name}
                        </h3>
                        <div className="flex gap-2 items-center">
                          <Badge variant="secondary" className="gap-1">
                            <Clock className="h-3 w-3" />
                            {workout.duration}m
                          </Badge>
                          <Badge variant="outline">
                            {format(new Date(workout.scheduled_date + 'T' + workout.scheduled_time), 'MMM d, HH:mm')}
                          </Badge>
                          {workout.completed && (
                            <Badge className="bg-green-500/10 text-green-700">
                              <CheckSquare className="h-3 w-3 mr-1" />
                              Completed
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        {workout.exercises.map((exercise, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <Dumbbell className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{exercise.name}</span>
                            <span className="text-muted-foreground">
                              {exercise.sets} sets × {exercise.reps} reps
                              {exercise.weight && exercise.weight > 0 ? ` @ ${exercise.weight}lbs` : ''}
                            </span>
                          </div>
                        ))}
                      </div>
                      
                      {workout.notes && (
                        <p className="text-sm text-muted-foreground">{workout.notes}</p>
                      )}

                      {!workout.completed && (
                        <Button 
                          onClick={() => completeScheduledWorkout(workout.id)}
                          variant="outline" 
                          size="sm"
                          className="w-full"
                        >
                          Mark as Completed
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Workout Templates</CardTitle>
                <Button 
                  onClick={() => setIsAddingWorkout(!isAddingWorkout)}
                  variant={isAddingWorkout ? "outline" : "default"}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {isAddingWorkout ? "Cancel" : "Create Template"}
                </Button>
              </div>
            </CardHeader>
            {isAddingWorkout && (
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="workout-name">Template Name</Label>
                    <Input
                      id="workout-name"
                      placeholder="e.g., Upper Body Strength"
                      value={newWorkout.name}
                      onChange={(e) => setNewWorkout({ ...newWorkout, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      placeholder="45"
                      value={newWorkout.duration}
                      onChange={(e) => setNewWorkout({ ...newWorkout, duration: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Exercises</Label>
                  {newWorkout.exercises.map((exercise, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-2 p-3 border rounded-lg">
                      <Input
                        placeholder="Exercise name"
                        value={exercise.name}
                        onChange={(e) => updateExercise(index, 'name', e.target.value)}
                      />
                      <Input
                        type="number"
                        placeholder="Sets"
                        value={exercise.sets}
                        onChange={(e) => updateExercise(index, 'sets', parseInt(e.target.value))}
                      />
                      <Input
                        type="number"
                        placeholder="Reps"
                        value={exercise.reps}
                        onChange={(e) => updateExercise(index, 'reps', parseInt(e.target.value))}
                      />
                      <Input
                        type="number"
                        placeholder="Weight (lbs)"
                        value={exercise.weight}
                        onChange={(e) => updateExercise(index, 'weight', parseInt(e.target.value))}
                      />
                    </div>
                  ))}
                  <Button variant="outline" onClick={addExercise} className="w-full">
                    Add Exercise
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any additional notes about the workout..."
                    value={newWorkout.notes}
                    onChange={(e) => setNewWorkout({ ...newWorkout, notes: e.target.value })}
                  />
                </div>

                <Button onClick={saveWorkout} className="w-full">
                  Save Template
                </Button>
              </CardContent>
            )}
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>My Templates</CardTitle>
            </CardHeader>
            <CardContent>
              {workoutTemplates.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No workout templates yet. Create your first template above!
                </p>
              ) : (
                <div className="space-y-4">
                  {workoutTemplates.map((template) => (
                    <div
                      key={template.id}
                      className="p-4 border rounded-lg space-y-3"
                    >
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-lg">{template.name}</h3>
                        <Badge variant="secondary" className="gap-1">
                          <Clock className="h-3 w-3" />
                          {template.duration}m
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        {template.exercises.map((exercise, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <Dumbbell className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{exercise.name}</span>
                            <span className="text-muted-foreground">
                              {exercise.sets} sets × {exercise.reps} reps
                              {exercise.weight && exercise.weight > 0 ? ` @ ${exercise.weight}lbs` : ''}
                            </span>
                          </div>
                        ))}
                      </div>
                      
                      {template.notes && (
                        <p className="text-sm text-muted-foreground">{template.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Completed Workouts</CardTitle>
            </CardHeader>
            <CardContent>
              {workouts.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No completed workouts yet. Complete scheduled workouts to see them here!
                </p>
              ) : (
                <div className="space-y-4">
                  {workouts.map((workout) => (
                    <div
                      key={workout.id}
                      className="p-4 border rounded-lg space-y-3"
                    >
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-lg">{workout.name}</h3>
                        <div className="flex gap-2">
                          <Badge variant="secondary" className="gap-1">
                            <Clock className="h-3 w-3" />
                            {workout.duration}m
                          </Badge>
                          <Badge variant="outline">
                            {workout.date}
                          </Badge>
                          <Badge className="bg-green-500/10 text-green-700">
                            <CheckSquare className="h-3 w-3 mr-1" />
                            Completed
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        {workout.exercises.map((exercise, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <Dumbbell className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{exercise.name}</span>
                            <span className="text-muted-foreground">
                              {exercise.sets} sets × {exercise.reps} reps
                              {exercise.weight && exercise.weight > 0 ? ` @ ${exercise.weight}lbs` : ''}
                            </span>
                          </div>
                        ))}
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