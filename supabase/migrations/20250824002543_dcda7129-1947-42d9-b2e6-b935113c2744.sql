-- Create fitness workouts table for tracking exercises
CREATE TABLE public.fitness_workouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  exercise_name TEXT NOT NULL,
  exercise_type TEXT NOT NULL, -- 'cardio', 'strength', 'bodyweight', 'flexibility', 'sports'
  duration_minutes INTEGER,
  sets INTEGER,
  reps INTEGER,
  weight_lbs NUMERIC,
  distance_miles NUMERIC,
  calories_burned INTEGER,
  notes TEXT,
  workout_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.fitness_workouts ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own workouts" 
ON public.fitness_workouts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own workouts" 
ON public.fitness_workouts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workouts" 
ON public.fitness_workouts 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workouts" 
ON public.fitness_workouts 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_fitness_workouts_updated_at
  BEFORE UPDATE ON public.fitness_workouts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create fitness goals table
CREATE TABLE public.fitness_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  goal_type TEXT NOT NULL, -- 'weight_loss', 'muscle_gain', 'endurance', 'strength', 'custom'
  target_value NUMERIC,
  current_value NUMERIC DEFAULT 0,
  unit TEXT, -- 'lbs', 'kg', 'miles', 'minutes', 'reps', 'sets'
  target_date DATE,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for goals
ALTER TABLE public.fitness_goals ENABLE ROW LEVEL SECURITY;

-- Create policies for fitness goals
CREATE POLICY "Users can view their own fitness goals" 
ON public.fitness_goals 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own fitness goals" 
ON public.fitness_goals 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own fitness goals" 
ON public.fitness_goals 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own fitness goals" 
ON public.fitness_goals 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_fitness_goals_updated_at
  BEFORE UPDATE ON public.fitness_goals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();