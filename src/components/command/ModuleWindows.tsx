import React, { Suspense, useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useSound } from '@/hooks/useSound';
import { createTaskQuick, logExpenseQuick, logIncomeQuick, scanReceiptQuick, createSpaceQuick } from '@/lib/command-actions';
import { supabase } from '@/integrations/supabase/client';
import { TaskList } from '@/components/tasks/TaskList';

const SmartChatInterface = React.lazy(() => import('@/components/chat/SmartChatInterface'));

export type ModuleKey = 'general_ai'|'perplexity'|'gemini'|'messages'|'tasks'|'money'|'receipts'|'calendar'|'fitness'|'health'|'spaces'|'notifications'|'security'|'settings'|'assets'|'locations'|'leads'|'content';

export function ModuleWindow({ open, onOpenChange, title, children }: { open: boolean; onOpenChange: (v: boolean) => void; title: string; children: React.ReactNode }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-3xl glass-card'>
        <DialogHeader>
          <DialogTitle className='text-strong'>{title}</DialogTitle>
        </DialogHeader>
        <div className='mt-2'>{children}</div>
      </DialogContent>
    </Dialog>
  );
}

export function TasksWindow(props: { open: boolean; onOpenChange: (v:boolean)=>void }){
  const [activeTab, setActiveTab] = useState('create');
  const [title, setTitle] = useState('');
  const [due, setDue] = useState('');
  const [priority, setPriority] = useState<'low'|'medium'|'high'|'urgent'>('medium');
  const [status, setStatus] = useState<'inactive'|'in-progress'|'completed'>('inactive');
  const [categoryId, setCategoryId] = useState('');
  const [notes, setNotes] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { play } = useSound();
  
  useEffect(() => {
    if (props.open) {
      fetchCategories();
    }
  }, [props.open]);

  const fetchCategories = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('task_categories').select('*').eq('user_id', user.id).order('name');
      setCategories(data || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };
  
  async function save(){
    if (!title.trim()) {
      toast({ title: 'Title required', variant: 'destructive' });
      play('warn');
      return;
    }
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      await supabase.from('tasks').insert([{
        title,
        description: notes || null,
        due_date: due || null,
        priority,
        status,
        category_id: categoryId || null,
        user_id: user.id
      }]);
      
      toast({ title: 'Task created successfully' });
      play('success');
      setTitle('');
      setDue('');
      setPriority('medium');
      setStatus('inactive');
      setCategoryId('');
      setNotes('');
    } catch(e:any){
      toast({ title: 'Failed to create task', description: e.message, variant: 'destructive' });
      play('warn');
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <ModuleWindow open={props.open} onOpenChange={props.onOpenChange} title='Tasks'>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className='glass-soft w-full'>
          <TabsTrigger value='create'>Create</TabsTrigger>
          <TabsTrigger value='plan'>Plan Day</TabsTrigger>
          <TabsTrigger value='browse'>Browse</TabsTrigger>
        </TabsList>
        <TabsContent value='create' className='mt-4'>
          <div className='space-y-4'>
            <div className='grid gap-2'>
              <Label className='text-muted'>Title</Label>
              <Input 
                value={title} 
                onChange={(e)=>setTitle(e.target.value)} 
                placeholder='Task title...'
                className='glass-soft border-white/10'
                disabled={loading}
              />
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <div className='grid gap-2'>
                <Label className='text-muted'>Priority</Label>
                <Select value={priority} onValueChange={(v:any)=>setPriority(v)} disabled={loading}>
                  <SelectTrigger className='glass-soft border-white/10'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='low'>Low</SelectItem>
                    <SelectItem value='medium'>Medium</SelectItem>
                    <SelectItem value='high'>High</SelectItem>
                    <SelectItem value='urgent'>Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className='grid gap-2'>
                <Label className='text-muted'>Status</Label>
                <Select value={status} onValueChange={(v:any)=>setStatus(v)} disabled={loading}>
                  <SelectTrigger className='glass-soft border-white/10'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='inactive'>Open</SelectItem>
                    <SelectItem value='in-progress'>In Progress</SelectItem>
                    <SelectItem value='completed'>Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <div className='grid gap-2'>
                <Label className='text-muted'>Category</Label>
                <Select value={categoryId} onValueChange={setCategoryId} disabled={loading}>
                  <SelectTrigger className='glass-soft border-white/10'>
                    <SelectValue placeholder='Select category' />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat)=>(
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className='grid gap-2'>
                <Label className='text-muted'>Due Date</Label>
                <Input 
                  type='date' 
                  value={due} 
                  onChange={(e)=>setDue(e.target.value)}
                  className='glass-soft border-white/10'
                  disabled={loading}
                />
              </div>
            </div>
            <div className='grid gap-2'>
              <Label className='text-muted'>Notes</Label>
              <Textarea 
                value={notes} 
                onChange={(e)=>setNotes(e.target.value)} 
                placeholder='Additional details...'
                className='glass-soft border-white/10 min-h-[80px]'
                disabled={loading}
              />
            </div>
            <div className='flex justify-end gap-2 pt-2'>
              <Button variant='outline' onClick={()=>props.onOpenChange(false)} disabled={loading}>Cancel</Button>
              <Button onClick={save} disabled={!title || loading}>
                {loading ? 'Creating...' : 'Create Task'}
              </Button>
            </div>
          </div>
        </TabsContent>
        <TabsContent value='plan' className='mt-4'>
          <div className='space-y-4'>
            <p className='text-sm text-muted'>Plan your top 3 priorities for today</p>
            <div className='space-y-3'>
              {[1,2,3].map((num)=>(
                <div key={num} className='p-3 glass-soft rounded-lg'>
                  <Label className='text-sm text-muted'>Priority {num}</Label>
                  <Input placeholder={`Task ${num}...`} className='mt-1.5 glass border-white/10' />
                </div>
              ))}
            </div>
            <div className='flex justify-end gap-2 pt-2'>
              <Button variant='outline' onClick={()=>props.onOpenChange(false)}>Cancel</Button>
              <Button>Plan Day</Button>
            </div>
          </div>
        </TabsContent>
        <TabsContent value='browse' className='mt-4'>
          <Suspense fallback={<div className='text-sm text-muted'>Loading tasks...</div>}>
            <TaskList refreshTrigger={0} />
          </Suspense>
        </TabsContent>
      </Tabs>
    </ModuleWindow>
  );
}

export function MoneyWindow(props: { open: boolean; onOpenChange: (v:boolean)=>void }){
  const [activeTab, setActiveTab] = useState('expense');
  const [ea, setEa] = useState('');
  const [edate, setEdate] = useState(new Date().toISOString().split('T')[0]);
  const [ed, setEd] = useState('');
  const [ev, setEv] = useState('');
  const [ec, setEc] = useState('');
  const [ep, setEp] = useState('');
  const [ia, setIa] = useState('');
  const [idate, setIdate] = useState(new Date().toISOString().split('T')[0]);
  const [id, setId] = useState('');
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState<any[]>([]);
  const { toast } = useToast();
  const { play } = useSound();
  
  useEffect(() => {
    if (props.open && activeTab === 'recent') {
      fetchRecent();
    }
  }, [props.open, activeTab]);

  const fetchRecent = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data: expenses } = await supabase.from('expenses').select('*').eq('user_id', user.id).order('date', { ascending: false }).limit(10);
      const { data: income } = await supabase.from('income').select('*').eq('user_id', user.id).order('date', { ascending: false }).limit(10);
      
      const combined = [
        ...(expenses || []).map(e => ({ ...e, type: 'expense' })),
        ...(income || []).map(i => ({ ...i, type: 'income' }))
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);
      
      setRecent(combined);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    }
  };
  
  async function saveExpense(){
    if (!ea || Number(ea) <= 0) {
      toast({ title: 'Invalid amount', variant: 'destructive' });
      play('warn');
      return;
    }
    setLoading(true);
    try {
      await logExpenseQuick({ amount: Number(ea), description: ed||undefined, category: ec||undefined, date: edate });
      toast({ title: 'Expense logged successfully' });
      play('success');
      setEa('');
      setEd('');
      setEv('');
      setEc('');
      setEp('');
      setEdate(new Date().toISOString().split('T')[0]);
    } catch(e:any){
      toast({ title: 'Failed to log expense', description: e.message, variant: 'destructive' });
      play('warn');
    } finally {
      setLoading(false);
    }
  }
  
  async function saveIncome(){
    if (!ia || Number(ia) <= 0) {
      toast({ title: 'Invalid amount', variant: 'destructive' });
      play('warn');
      return;
    }
    setLoading(true);
    try {
      await logIncomeQuick({ amount: Number(ia), description: id||undefined, date: idate });
      toast({ title: 'Income logged successfully' });
      play('success');
      setIa('');
      setId('');
      setIdate(new Date().toISOString().split('T')[0]);
    } catch(e:any){
      toast({ title: 'Failed to log income', description: e.message, variant: 'destructive' });
      play('warn');
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <ModuleWindow open={props.open} onOpenChange={props.onOpenChange} title='Money'>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className='glass-soft w-full'>
          <TabsTrigger value='expense' className='flex-1'>Expense</TabsTrigger>
          <TabsTrigger value='income' className='flex-1'>Income</TabsTrigger>
          <TabsTrigger value='recent' className='flex-1'>Recent</TabsTrigger>
        </TabsList>
        <TabsContent value='expense' className='mt-4'>
          <div className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div className='grid gap-2'>
                <Label className='text-muted'>Amount</Label>
                <Input 
                  type='number' 
                  step='0.01'
                  value={ea} 
                  onChange={(e)=>setEa(e.target.value)} 
                  placeholder='0.00'
                  className='glass-soft border-white/10'
                  disabled={loading}
                />
              </div>
              <div className='grid gap-2'>
                <Label className='text-muted'>Date</Label>
                <Input 
                  type='date'
                  value={edate} 
                  onChange={(e)=>setEdate(e.target.value)} 
                  className='glass-soft border-white/10'
                  disabled={loading}
                />
              </div>
            </div>
            <div className='grid gap-2'>
              <Label className='text-muted'>Vendor</Label>
              <Input 
                value={ev} 
                onChange={(e)=>setEv(e.target.value)} 
                placeholder='Where did you spend?'
                className='glass-soft border-white/10'
                disabled={loading}
              />
            </div>
            <div className='grid gap-2'>
              <Label className='text-muted'>Description</Label>
              <Input 
                value={ed} 
                onChange={(e)=>setEd(e.target.value)} 
                placeholder='What was it for?'
                className='glass-soft border-white/10'
                disabled={loading}
              />
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <div className='grid gap-2'>
                <Label className='text-muted'>Category</Label>
                <Select value={ec} onValueChange={setEc} disabled={loading}>
                  <SelectTrigger className='glass-soft border-white/10'>
                    <SelectValue placeholder='Select category' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='food'>Food & Dining</SelectItem>
                    <SelectItem value='transport'>Transportation</SelectItem>
                    <SelectItem value='shopping'>Shopping</SelectItem>
                    <SelectItem value='bills'>Bills & Utilities</SelectItem>
                    <SelectItem value='entertainment'>Entertainment</SelectItem>
                    <SelectItem value='health'>Health & Wellness</SelectItem>
                    <SelectItem value='other'>Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className='grid gap-2'>
                <Label className='text-muted'>Payment Method</Label>
                <Select value={ep} onValueChange={setEp} disabled={loading}>
                  <SelectTrigger className='glass-soft border-white/10'>
                    <SelectValue placeholder='Select method' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='cash'>Cash</SelectItem>
                    <SelectItem value='credit'>Credit Card</SelectItem>
                    <SelectItem value='debit'>Debit Card</SelectItem>
                    <SelectItem value='digital'>Digital Wallet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className='flex justify-end gap-2 pt-2'>
              <Button variant='outline' onClick={()=>props.onOpenChange(false)} disabled={loading}>Cancel</Button>
              <Button onClick={saveExpense} disabled={!ea || loading}>
                {loading ? 'Logging...' : 'Log Expense'}
              </Button>
            </div>
          </div>
        </TabsContent>
        <TabsContent value='income' className='mt-4'>
          <div className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div className='grid gap-2'>
                <Label className='text-muted'>Amount</Label>
                <Input 
                  type='number' 
                  step='0.01'
                  value={ia} 
                  onChange={(e)=>setIa(e.target.value)} 
                  placeholder='0.00'
                  className='glass-soft border-white/10'
                  disabled={loading}
                />
              </div>
              <div className='grid gap-2'>
                <Label className='text-muted'>Date</Label>
                <Input 
                  type='date'
                  value={idate} 
                  onChange={(e)=>setIdate(e.target.value)} 
                  className='glass-soft border-white/10'
                  disabled={loading}
                />
              </div>
            </div>
            <div className='grid gap-2'>
              <Label className='text-muted'>Source</Label>
              <Input 
                value={id} 
                onChange={(e)=>setId(e.target.value)} 
                placeholder='Where did it come from?'
                className='glass-soft border-white/10'
                disabled={loading}
              />
            </div>
            <div className='flex justify-end gap-2 pt-2'>
              <Button variant='outline' onClick={()=>props.onOpenChange(false)} disabled={loading}>Cancel</Button>
              <Button onClick={saveIncome} disabled={!ia || loading}>
                {loading ? 'Logging...' : 'Log Income'}
              </Button>
            </div>
          </div>
        </TabsContent>
        <TabsContent value='recent' className='mt-4'>
          <div className='space-y-3 max-h-[400px] overflow-y-auto'>
            {recent.length === 0 ? (
              <p className='text-sm text-muted text-center py-8'>No recent transactions</p>
            ) : (
              recent.map((txn)=>(
                <div key={txn.id} className='p-3 glass-soft rounded-lg flex justify-between items-center'>
                  <div>
                    <p className='text-sm font-medium text-strong'>{txn.description}</p>
                    <p className='text-xs text-muted'>{new Date(txn.date).toLocaleDateString()} • {txn.category}</p>
                  </div>
                  <span className={`text-sm font-semibold ${txn.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                    {txn.type === 'income' ? '+' : '-'}${txn.amount.toFixed(2)}
                  </span>
                </div>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </ModuleWindow>
  );
}

export function ReceiptsWindow(props: { open: boolean; onOpenChange: (v:boolean)=>void }){
  const { toast } = useToast();
  const { play } = useSound();
  
  async function scan(){
    try {
      await scanReceiptQuick({ image_url: 'https://example.com/receipt.jpg' });
      toast({ title: 'Receipt queued for processing' });
      play('success');
    } catch(e:any){
      toast({ title: 'Receipt processing failed', description: e.message, variant: 'destructive' });
      play('warn');
    }
  }
  
  return (
    <ModuleWindow open={props.open} onOpenChange={props.onOpenChange} title='Scan Receipt'>
      <div className='space-y-4 text-soft'>
        <p className='text-sm'>Upload a receipt image to automatically extract expenses using OCR.</p>
        <div className='border-2 border-dashed border-white/10 rounded-lg p-8 text-center glass-soft'>
          <p className='text-muted'>Upload component placeholder</p>
          <p className='text-xs text-soft mt-2'>Wire your ReceiptProcessor component here</p>
        </div>
        <div className='flex justify-end pt-2'>
          <Button onClick={scan}>Process Receipt</Button>
        </div>
      </div>
    </ModuleWindow>
  );
}

export function SpacesWindow(props: { open: boolean; onOpenChange: (v:boolean)=>void }){
  const [activeTab, setActiveTab] = useState('create');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<'private'|'members'|'public'>('private');
  const [brandColor, setBrandColor] = useState('#3b82f6');
  const [logoUrl, setLogoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [mySpaces, setMySpaces] = useState<any[]>([]);
  const { toast } = useToast();
  const { play } = useSound();
  
  useEffect(() => {
    if (props.open && activeTab === 'my-spaces') {
      fetchMySpaces();
    }
  }, [props.open, activeTab]);

  const fetchMySpaces = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data } = await supabase.from('organization_memberships').select(`
        organization_id,
        role,
        organizations (id, name, visibility, description, logo_url, type)
      `).eq('user_id', user.id).eq('is_active', true);
      
      setMySpaces(data || []);
    } catch (error) {
      console.error('Failed to fetch spaces:', error);
    }
  };
  
  async function create(){
    if (!name.trim()) {
      toast({ title: 'Name required', variant: 'destructive' });
      play('warn');
      return;
    }
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      await supabase.from('organizations').insert([{
        name,
        visibility,
        description: description || null,
        logo_url: logoUrl || null,
        created_by: user.id,
        settings: { brand_color: brandColor }
      }]);
      
      toast({ title: 'Space created successfully' });
      play('success');
      setName('');
      setDescription('');
      setVisibility('private');
      setBrandColor('#3b82f6');
      setLogoUrl('');
    } catch(e:any){
      toast({ title: 'Failed to create space', description: e.message, variant: 'destructive' });
      play('warn');
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <ModuleWindow open={props.open} onOpenChange={props.onOpenChange} title='Spaces'>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className='glass-soft w-full'>
          <TabsTrigger value='create'>Create</TabsTrigger>
          <TabsTrigger value='my-spaces'>My Spaces</TabsTrigger>
          <TabsTrigger value='branding'>Branding</TabsTrigger>
        </TabsList>
        <TabsContent value='create' className='mt-4'>
          <div className='space-y-4'>
            <div className='grid gap-2'>
              <Label className='text-muted'>Name</Label>
              <Input 
                value={name} 
                onChange={(e)=>setName(e.target.value)} 
                placeholder='Space name...'
                className='glass-soft border-white/10'
                disabled={loading}
              />
            </div>
            <div className='grid gap-2'>
              <Label className='text-muted'>Visibility</Label>
              <Select value={visibility} onValueChange={(v:any)=>setVisibility(v)} disabled={loading}>
                <SelectTrigger className='glass-soft border-white/10'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='private'>Private - Only invited members</SelectItem>
                  <SelectItem value='members'>Members Only - Join requests allowed</SelectItem>
                  <SelectItem value='public'>Public - Anyone can join</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className='grid gap-2'>
              <Label className='text-muted'>Description</Label>
              <Textarea 
                value={description} 
                onChange={(e)=>setDescription(e.target.value)} 
                placeholder="What's this space about?"
                className='glass-soft border-white/10 min-h-[80px]'
                disabled={loading}
              />
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <div className='grid gap-2'>
                <Label className='text-muted'>Logo URL</Label>
                <Input 
                  value={logoUrl} 
                  onChange={(e)=>setLogoUrl(e.target.value)} 
                  placeholder='https://...'
                  className='glass-soft border-white/10'
                  disabled={loading}
                />
              </div>
              <div className='grid gap-2'>
                <Label className='text-muted'>Brand Color</Label>
                <Input 
                  type='color'
                  value={brandColor} 
                  onChange={(e)=>setBrandColor(e.target.value)} 
                  className='glass-soft border-white/10 h-10'
                  disabled={loading}
                />
              </div>
            </div>
            <div className='flex justify-end gap-2 pt-2'>
              <Button variant='outline' onClick={()=>props.onOpenChange(false)} disabled={loading}>Cancel</Button>
              <Button onClick={create} disabled={!name || loading}>
                {loading ? 'Creating...' : 'Create Space'}
              </Button>
            </div>
          </div>
        </TabsContent>
        <TabsContent value='my-spaces' className='mt-4'>
          <div className='space-y-3 max-h-[400px] overflow-y-auto'>
            {mySpaces.length === 0 ? (
              <p className='text-sm text-muted text-center py-8'>No spaces yet</p>
            ) : (
              mySpaces.map((membership: any) => {
                const org = membership.organizations;
                return (
                  <div key={org.id} className='p-3 glass-soft rounded-lg flex justify-between items-center'>
                    <div className='flex items-center gap-3'>
                      {org.logo_url && (
                        <img src={org.logo_url} alt={org.name} className='w-8 h-8 rounded' />
                      )}
                      <div>
                        <p className='text-sm font-medium text-strong'>{org.name}</p>
                        <p className='text-xs text-muted'>{membership.role} • {org.visibility}</p>
                      </div>
                    </div>
                    <Button size='sm' variant='outline'>Manage</Button>
                  </div>
                );
              })
            )}
          </div>
        </TabsContent>
        <TabsContent value='branding' className='mt-4'>
          <div className='space-y-4'>
            <p className='text-sm text-muted'>Customize the look and feel of your spaces</p>
            <div className='space-y-4'>
              <div className='grid gap-2'>
                <Label className='text-muted'>Default Logo URL</Label>
                <Input placeholder='https://...' className='glass-soft border-white/10' />
              </div>
              <div className='grid gap-2'>
                <Label className='text-muted'>Default Brand Color</Label>
                <Input type='color' className='glass-soft border-white/10 h-10' />
              </div>
              <div className='grid gap-2'>
                <Label className='text-muted'>Font Style</Label>
                <Select defaultValue='inter'>
                  <SelectTrigger className='glass-soft border-white/10'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='inter'>Inter</SelectItem>
                    <SelectItem value='poppins'>Poppins</SelectItem>
                    <SelectItem value='roboto'>Roboto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className='flex justify-end gap-2 pt-2'>
              <Button variant='outline'>Reset</Button>
              <Button>Save Branding</Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </ModuleWindow>
  );
}

export function MessagesWindow(props:{ open:boolean; onOpenChange:(v:boolean)=>void }){
  return (
    <ModuleWindow open={props.open} onOpenChange={props.onOpenChange} title='Messages'>
      <Tabs defaultValue='compose'>
        <TabsList className='glass-soft w-full'>
          <TabsTrigger value='compose' className='flex-1'>Compose</TabsTrigger>
          <TabsTrigger value='inbox' className='flex-1'>Inbox</TabsTrigger>
          <TabsTrigger value='outbox' className='flex-1'>Outbox</TabsTrigger>
        </TabsList>
        <TabsContent value='compose' className='mt-4'>
          <div className='text-soft text-sm'>Compose message UI placeholder</div>
        </TabsContent>
        <TabsContent value='inbox' className='mt-4'>
          <div className='text-soft text-sm'>Inbox list placeholder</div>
        </TabsContent>
        <TabsContent value='outbox' className='mt-4'>
          <div className='text-soft text-sm'>Outbox list placeholder</div>
        </TabsContent>
      </Tabs>
    </ModuleWindow>
  );
}

export function CalendarWindow(p:{open:boolean; onOpenChange:(v:boolean)=>void}){
  return (
    <ModuleWindow open={p.open} onOpenChange={p.onOpenChange} title='Calendar'>
      <div className='text-soft text-sm'>Mini calendar view and quick event creation placeholder</div>
    </ModuleWindow>
  );
}

export function FitnessWindow(p:{open:boolean; onOpenChange:(v:boolean)=>void}){
  return (
    <ModuleWindow open={p.open} onOpenChange={p.onOpenChange} title='Fitness'>
      <div className='text-soft text-sm'>Log workout and view streak placeholder</div>
    </ModuleWindow>
  );
}

export function HealthWindow(p:{open:boolean; onOpenChange:(v:boolean)=>void}){
  return (
    <ModuleWindow open={p.open} onOpenChange={p.onOpenChange} title='Health'>
      <div className='text-soft text-sm'>Vitals tracking and health habits placeholder</div>
    </ModuleWindow>
  );
}

export function NotificationsWindow(p:{open:boolean; onOpenChange:(v:boolean)=>void}){
  return (
    <ModuleWindow open={p.open} onOpenChange={p.onOpenChange} title='Notifications'>
      <div className='text-soft text-sm'>Notification center and rules configuration placeholder</div>
    </ModuleWindow>
  );
}

export function SecurityWindow(p:{open:boolean; onOpenChange:(v:boolean)=>void}){
  return (
    <ModuleWindow open={p.open} onOpenChange={p.onOpenChange} title='Security'>
      <div className='text-soft text-sm'>Security dashboard and audit logs placeholder</div>
    </ModuleWindow>
  );
}

export function SettingsWindow(p:{open:boolean; onOpenChange:(v:boolean)=>void}){
  return (
    <ModuleWindow open={p.open} onOpenChange={p.onOpenChange} title='Settings'>
      <div className='text-soft text-sm'>Personal and organization settings placeholder</div>
    </ModuleWindow>
  );
}

export function AssetsWindow(p:{open:boolean; onOpenChange:(v:boolean)=>void}){
  return (
    <ModuleWindow open={p.open} onOpenChange={p.onOpenChange} title='Assets'>
      <div className='text-soft text-sm'>Files and media management placeholder</div>
    </ModuleWindow>
  );
}

export function LocationsWindow(p:{open:boolean; onOpenChange:(v:boolean)=>void}){
  return (
    <ModuleWindow open={p.open} onOpenChange={p.onOpenChange} title='Locations'>
      <div className='text-soft text-sm'>Places and visits log placeholder</div>
    </ModuleWindow>
  );
}

export function AIGeneralWindow(p:{open:boolean; onOpenChange:(v:boolean)=>void}){
  return (
    <ModuleWindow open={p.open} onOpenChange={p.onOpenChange} title='General AI'>
      <Suspense fallback={<div className='p-6 text-soft'>Loading chat interface…</div>}>
        <SmartChatInterface showHeader={false}/>
      </Suspense>
    </ModuleWindow>
  );
}

export function AIPerplexityWindow(p:{open:boolean; onOpenChange:(v:boolean)=>void}){
  return (
    <ModuleWindow open={p.open} onOpenChange={p.onOpenChange} title='Perplexity AI'>
      <Suspense fallback={<div className='p-6 text-soft'>Loading chat interface…</div>}>
        <SmartChatInterface showHeader={false} forceMode='perplexity'/>
      </Suspense>
    </ModuleWindow>
  );
}

export function AIGeminiWindow(p:{open:boolean; onOpenChange:(v:boolean)=>void}){
  return (
    <ModuleWindow open={p.open} onOpenChange={p.onOpenChange} title='Gemini AI'>
      <Suspense fallback={<div className='p-6 text-soft'>Loading chat interface…</div>}>
        <SmartChatInterface showHeader={false} forceMode='gemini'/>
      </Suspense>
    </ModuleWindow>
  );
}
