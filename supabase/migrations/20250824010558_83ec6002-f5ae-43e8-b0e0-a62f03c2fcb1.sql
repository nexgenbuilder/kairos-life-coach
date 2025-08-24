-- Create task categories table
CREATE TABLE public.task_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  name text NOT NULL,
  color text DEFAULT '#3b82f6',
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, name)
);

-- Enable RLS for task_categories
ALTER TABLE public.task_categories ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for task_categories
CREATE POLICY "Users can view their own task categories" 
ON public.task_categories 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own task categories" 
ON public.task_categories 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own task categories" 
ON public.task_categories 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own task categories" 
ON public.task_categories 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add category_id to tasks table
ALTER TABLE public.tasks ADD COLUMN category_id uuid REFERENCES public.task_categories(id) ON DELETE SET NULL;

-- Create index for better performance
CREATE INDEX idx_tasks_category_id ON public.tasks(category_id);

-- Create trigger for task_categories updated_at
CREATE TRIGGER update_task_categories_updated_at
BEFORE UPDATE ON public.task_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for both tables
ALTER TABLE public.task_categories REPLICA IDENTITY FULL;
ALTER TABLE public.tasks REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.task_categories;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;