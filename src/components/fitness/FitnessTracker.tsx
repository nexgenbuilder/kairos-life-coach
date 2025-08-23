import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Dumbbell, Clock, Target } from 'lucide-react';

interface Workout {
  id: string;
  name: string;
  exercises: Exercise[];
  duration: number;
  date: string;
  notes?: string;
}

interface Exercise {
  name: string;
  sets: number;
  reps: number;
  weight?: number;
}

const FitnessTracker: React.FC = () => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isAddingWorkout, setIsAddingWorkout] = useState(false);
  const [newWorkout, setNewWorkout] = useState({
    name: '',
    duration: '',
    notes: '',
    exercises: [{ name: '', sets: 1, reps: 1, weight: 0 }]
  });

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

    const workout: Workout = {
      id: Date.now().toString(),
      name: newWorkout.name,
      exercises: newWorkout.exercises,
      duration: parseInt(newWorkout.duration) || 0,
      date: new Date().toISOString().split('T')[0],
      notes: newWorkout.notes
    };

    setWorkouts([workout, ...workouts]);
    setNewWorkout({
      name: '',
      duration: '',
      notes: '',
      exercises: [{ name: '', sets: 1, reps: 1, weight: 0 }]
    });
    setIsAddingWorkout(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Fitness Tracker</CardTitle>
            <Button 
              onClick={() => setIsAddingWorkout(!isAddingWorkout)}
              variant={isAddingWorkout ? "outline" : "default"}
            >
              <Plus className="h-4 w-4 mr-2" />
              {isAddingWorkout ? "Cancel" : "Add Workout"}
            </Button>
          </div>
        </CardHeader>
        {isAddingWorkout && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="workout-name">Workout Name</Label>
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
              Save Workout
            </Button>
          </CardContent>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Workouts</CardTitle>
        </CardHeader>
        <CardContent>
          {workouts.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No workouts recorded yet. Add your first workout above!
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
    </div>
  );
};

export default FitnessTracker;