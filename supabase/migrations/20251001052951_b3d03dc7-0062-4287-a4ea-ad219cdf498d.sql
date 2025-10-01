-- Create space_posts table for public posts within shared spaces
CREATE TABLE public.space_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_pinned BOOLEAN DEFAULT false,
  mentioned_users UUID[] DEFAULT '{}'::uuid[]
);

-- Enable RLS
ALTER TABLE public.space_posts ENABLE ROW LEVEL SECURITY;

-- Create policies for space_posts
CREATE POLICY "Users can view posts in their organizations"
ON public.space_posts
FOR SELECT
USING (user_can_access_organization(organization_id));

CREATE POLICY "Users can create posts in their organizations"
ON public.space_posts
FOR INSERT
WITH CHECK (
  user_can_access_organization(organization_id) 
  AND auth.uid() = user_id
);

CREATE POLICY "Users can update their own posts"
ON public.space_posts
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can update any posts in their organization"
ON public.space_posts
FOR UPDATE
USING (user_is_org_admin(organization_id));

CREATE POLICY "Users can delete their own posts"
ON public.space_posts
FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can delete any posts in their organization"
ON public.space_posts
FOR DELETE
USING (user_is_org_admin(organization_id));

-- Create post_interactions table for likes/reactions
CREATE TABLE public.post_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.space_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  interaction_type TEXT NOT NULL DEFAULT 'like',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id, interaction_type)
);

-- Enable RLS
ALTER TABLE public.post_interactions ENABLE ROW LEVEL SECURITY;

-- Create policies for post_interactions
CREATE POLICY "Users can view interactions on accessible posts"
ON public.post_interactions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.space_posts
    WHERE id = post_id AND user_can_access_organization(organization_id)
  )
);

CREATE POLICY "Users can create interactions on accessible posts"
ON public.post_interactions
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.space_posts
    WHERE id = post_id AND user_can_access_organization(organization_id)
  )
);

CREATE POLICY "Users can delete their own interactions"
ON public.post_interactions
FOR DELETE
USING (auth.uid() = user_id);

-- Create post_comments table for threaded discussions
CREATE TABLE public.post_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.space_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  parent_comment_id UUID REFERENCES public.post_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  mentioned_users UUID[] DEFAULT '{}'::uuid[]
);

-- Enable RLS
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

-- Create policies for post_comments
CREATE POLICY "Users can view comments on accessible posts"
ON public.post_comments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.space_posts
    WHERE id = post_id AND user_can_access_organization(organization_id)
  )
);

CREATE POLICY "Users can create comments on accessible posts"
ON public.post_comments
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.space_posts
    WHERE id = post_id AND user_can_access_organization(organization_id)
  )
);

CREATE POLICY "Users can update their own comments"
ON public.post_comments
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
ON public.post_comments
FOR DELETE
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_space_posts_organization_id ON public.space_posts(organization_id);
CREATE INDEX idx_space_posts_user_id ON public.space_posts(user_id);
CREATE INDEX idx_space_posts_created_at ON public.space_posts(created_at DESC);
CREATE INDEX idx_post_interactions_post_id ON public.post_interactions(post_id);
CREATE INDEX idx_post_comments_post_id ON public.post_comments(post_id);
CREATE INDEX idx_post_comments_parent_id ON public.post_comments(parent_comment_id);

-- Create trigger for updating updated_at
CREATE TRIGGER update_space_posts_updated_at
BEFORE UPDATE ON public.space_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_post_comments_updated_at
BEFORE UPDATE ON public.post_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for space_posts
ALTER PUBLICATION supabase_realtime ADD TABLE public.space_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.post_interactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.post_comments;