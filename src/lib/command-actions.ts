import { supabase } from '@/integrations/supabase/client';

async function getCurrentUserId() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  return user.id;
}

export async function createTaskQuick(input: { title: string; due_date?: string; notes?: string }) {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase.from('tasks').insert([{
    title: input.title,
    description: input.notes ?? null,
    due_date: input.due_date ?? null,
    status: 'inactive',
    user_id: userId
  }]).select('*').maybeSingle();
  
  if (error) throw error;
  return data;
}

export async function logExpenseQuick(input: { amount: number; description?: string; category?: string; date?: string }) {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase.from('expenses').insert([{
    amount: input.amount,
    description: input.description ?? 'Quick expense',
    category: input.category ?? 'other',
    date: input.date ?? new Date().toISOString(),
    user_id: userId
  }]).select('*').maybeSingle();
  
  if (error) throw error;
  return data;
}

export async function logIncomeQuick(input: { amount: number; description?: string; date?: string }) {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase.from('income').insert([{
    amount: input.amount,
    description: input.description ?? 'Quick income',
    category: 'other',
    date: input.date ?? new Date().toISOString(),
    user_id: userId
  }]).select('*').maybeSingle();
  
  if (error) throw error;
  return data;
}

export async function scanReceiptQuick(input: { image_url?: string; base64?: string }) {
  const { data, error } = await supabase.functions.invoke('process-receipt', { body: input });
  if (error) throw error;
  return (data as any) ?? {};
}

export async function createSpaceQuick(input: { name: string; visibility?: 'private'|'members'|'public'; description?: string }) {
  const { data, error } = await supabase.from('organizations').insert([{
    name: input.name,
    visibility: input.visibility ?? 'private',
    description: input.description ?? null
  }]).select('*').maybeSingle();
  
  if (error) throw error;
  return data;
}
