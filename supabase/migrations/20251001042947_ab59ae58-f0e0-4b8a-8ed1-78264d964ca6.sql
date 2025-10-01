-- Create user_messages table for peer-to-peer messaging
CREATE TABLE public.user_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  recipients UUID[] NOT NULL DEFAULT '{}',
  is_all_mention BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create message_inbox table for tracking message read status
CREATE TABLE public.message_inbox (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.user_messages(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(message_id, recipient_id)
);

-- Enable RLS
ALTER TABLE public.user_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_inbox ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_messages
CREATE POLICY "Users can view messages they sent or received"
ON public.user_messages
FOR SELECT
USING (
  auth.uid() = sender_id 
  OR auth.uid() = ANY(recipients)
);

CREATE POLICY "Users can create messages"
ON public.user_messages
FOR INSERT
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Senders can update their own messages"
ON public.user_messages
FOR UPDATE
USING (auth.uid() = sender_id);

-- RLS Policies for message_inbox
CREATE POLICY "Users can view their own inbox"
ON public.message_inbox
FOR SELECT
USING (auth.uid() = recipient_id);

CREATE POLICY "System can create inbox entries"
ON public.message_inbox
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Recipients can update read status"
ON public.message_inbox
FOR UPDATE
USING (auth.uid() = recipient_id);

-- Create trigger for updated_at
CREATE TRIGGER update_user_messages_updated_at
BEFORE UPDATE ON public.user_messages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to get organization members for @mention autocomplete
CREATE OR REPLACE FUNCTION public.get_organization_members(org_id UUID)
RETURNS TABLE(
  user_id UUID,
  full_name TEXT,
  avatar_url TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.user_id,
    p.full_name,
    p.avatar_url
  FROM public.profiles p
  JOIN public.organization_memberships om ON om.user_id = p.user_id
  WHERE om.organization_id = org_id
    AND om.is_active = true
    AND p.user_id != auth.uid();
$$;

-- Create function to send message to inbox
CREATE OR REPLACE FUNCTION public.send_message_to_inbox()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create inbox entries for each recipient
  INSERT INTO public.message_inbox (message_id, recipient_id)
  SELECT NEW.id, unnest(NEW.recipients);
  
  RETURN NEW;
END;
$$;

-- Create trigger to automatically populate inbox
CREATE TRIGGER on_message_created
AFTER INSERT ON public.user_messages
FOR EACH ROW
EXECUTE FUNCTION public.send_message_to_inbox();