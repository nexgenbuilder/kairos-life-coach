import React, { Suspense, useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useSound } from '@/hooks/useSound';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { createTaskQuick, logExpenseQuick, logIncomeQuick, scanReceiptQuick, createSpaceQuick } from '@/lib/command-actions';
import { supabase } from '@/integrations/supabase/client';
import { TaskList } from '@/components/tasks/TaskList';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { NotificationSettings } from '@/components/notifications/NotificationSettings';
import { SecurityDashboard } from '@/components/security/SecurityDashboard';
import { InboxView } from '@/components/chat/InboxView';
import { Activity, Dumbbell, Heart, Pill, Calendar as CalendarIcon, Upload, Loader2, Send, Bell, FileIcon, MapPin as MapPinIcon } from 'lucide-react';
import { startOfWeek } from 'date-fns';

const SmartChatInterface = React.lazy(() => import('@/components/chat/SmartChatInterface'));

export type ModuleKey = 'perplexity'|'gemini'|'messages'|'tasks'|'money'|'receipts'|'calendar'|'fitness'|'health'|'spaces'|'notifications'|'feed'|'settings'|'cloud'|'locations';

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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [parsed, setParsed] = useState<any>(null);
  const { toast } = useToast();
  const { play } = useSound();
  const { user } = useAuth();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      toast({ title: 'Invalid file type', description: 'Please upload an image or PDF', variant: 'destructive' });
      play('warn');
      return;
    }
    
    if (file.size > 20 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Max size is 20MB', variant: 'destructive' });
      play('warn');
      return;
    }
    
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      const fakeEvent = { target: { files: [file] } } as any;
      handleFileSelect(fakeEvent);
    }
  };

  const processReceipt = async () => {
    if (!selectedFile || !user) return;
    
    setProcessing(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const { data, error } = await supabase.functions.invoke('process-receipt', {
          body: { image: base64 }
        });
        
        if (error) throw error;
        
        setParsed(data);
        toast({ title: 'Receipt processed successfully' });
        play('success');
      };
      reader.readAsDataURL(selectedFile);
    } catch (e: any) {
      toast({ title: 'Processing failed', description: e.message, variant: 'destructive' });
      play('warn');
    } finally {
      setProcessing(false);
    }
  };

  const saveToExpenses = async () => {
    if (!parsed || !user) return;
    
    try {
      await supabase.from('expenses').insert({
        user_id: user.id,
        amount: parsed.amount || 0,
        description: parsed.description || 'Scanned receipt',
        category: parsed.category || 'other',
        date: parsed.date || new Date().toISOString()
      });
      
      toast({ title: 'Saved to expenses' });
      play('success');
      setSelectedFile(null);
      setPreview(null);
      setParsed(null);
    } catch (e: any) {
      toast({ title: 'Failed to save', description: e.message, variant: 'destructive' });
      play('warn');
    }
  };
  
  return (
    <ModuleWindow open={props.open} onOpenChange={props.onOpenChange} title='Scan Receipt'>
      <div className='space-y-4'>
        <p className='text-sm text-muted'>Upload a receipt image to automatically extract expenses using OCR</p>
        
        <div 
          className='border-2 border-dashed border-white/10 rounded-lg p-8 text-center glass-soft cursor-pointer hover:border-white/20 transition-colors'
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => document.getElementById('receipt-file')?.click()}
        >
          {preview ? (
            <div className='space-y-2'>
              <img src={preview} alt='Receipt preview' className='max-h-40 mx-auto rounded' />
              <p className='text-xs text-muted'>{selectedFile?.name}</p>
            </div>
          ) : (
            <div className='space-y-2'>
              <Upload className='h-8 w-8 mx-auto text-muted' />
              <p className='text-muted'>Drag & drop or click to upload</p>
              <p className='text-xs text-soft'>Images and PDFs up to 20MB</p>
            </div>
          )}
          <input
            id='receipt-file'
            type='file'
            accept='image/*,application/pdf'
            onChange={handleFileSelect}
            className='hidden'
          />
        </div>

        {parsed && (
          <div className='p-4 glass-soft rounded-lg space-y-2'>
            <p className='text-sm font-medium text-strong'>Parsed Data:</p>
            <div className='space-y-1 text-sm'>
              <div className='flex justify-between'>
                <span className='text-muted'>Amount:</span>
                <span className='text-strong'>${parsed.amount || '0.00'}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-muted'>Date:</span>
                <span className='text-strong'>{parsed.date || 'Today'}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-muted'>Vendor:</span>
                <span className='text-strong'>{parsed.vendor || 'Unknown'}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-muted'>Category:</span>
                <span className='text-strong'>{parsed.category || 'Other'}</span>
              </div>
            </div>
          </div>
        )}

        <div className='flex justify-end gap-2 pt-2'>
          {parsed ? (
            <>
              <Button variant='outline' onClick={() => { setParsed(null); setSelectedFile(null); setPreview(null); }}>
                Clear
              </Button>
              <Button onClick={saveToExpenses}>Save to Expenses</Button>
            </>
          ) : (
            <>
              <Button variant='outline' onClick={() => props.onOpenChange(false)}>Cancel</Button>
              <Button onClick={processReceipt} disabled={!selectedFile || processing}>
                {processing ? (
                  <><Loader2 className='h-4 w-4 mr-2 animate-spin' />Processing...</>
                ) : (
                  'Process Receipt'
                )}
              </Button>
            </>
          )}
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
  const [activeTab, setActiveTab] = useState('compose');
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { play } = useSound();
  const { user } = useAuth();

  useEffect(() => {
    if (props.open) {
      fetchUsers();
    }
  }, [props.open]);

  const fetchUsers = async () => {
    if (!user) return;
    try {
      const { data } = await supabase.from('profiles').select('user_id, full_name').neq('user_id', user.id).limit(20);
      setUsers(data || []);
    } catch (e) {
      console.error('Failed to fetch users:', e);
    }
  };

  const sendMessage = async () => {
    if (!to || !content.trim()) {
      toast({ title: 'Recipient and message required', variant: 'destructive' });
      play('warn');
      return;
    }

    setLoading(true);
    try {
      await supabase.from('user_messages').insert({
        sender_id: user?.id,
        recipients: [to],
        content,
        is_all_mention: false
      });

      toast({ title: 'Message sent successfully' });
      play('success');
      setTo('');
      setSubject('');
      setContent('');
    } catch (e: any) {
      toast({ title: 'Failed to send message', description: e.message, variant: 'destructive' });
      play('warn');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModuleWindow open={props.open} onOpenChange={props.onOpenChange} title='Messages'>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className='glass-soft w-full'>
          <TabsTrigger value='compose' className='flex-1'>Compose</TabsTrigger>
          <TabsTrigger value='inbox' className='flex-1'>Inbox</TabsTrigger>
        </TabsList>
        <TabsContent value='compose' className='mt-4'>
          <div className='space-y-4'>
            <div className='grid gap-2'>
              <Label className='text-muted'>To</Label>
              <Select value={to} onValueChange={setTo} disabled={loading}>
                <SelectTrigger className='glass-soft border-white/10'><SelectValue placeholder='Select recipient' /></SelectTrigger>
                <SelectContent>
                  {users.map((u)=>(
                    <SelectItem key={u.user_id} value={u.user_id}>{u.full_name || 'Unknown'}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='grid gap-2'>
              <Label className='text-muted'>Message</Label>
              <Textarea value={content} onChange={(e)=>setContent(e.target.value)} placeholder='Type your message...' className='glass-soft border-white/10 min-h-[150px]' disabled={loading} />
            </div>
            <div className='flex justify-end gap-2 pt-2'>
              <Button variant='outline' onClick={()=>props.onOpenChange(false)} disabled={loading}>Cancel</Button>
              <Button onClick={sendMessage} disabled={!to || !content || loading}>
                {loading ? 'Sending...' : <><Send className='h-4 w-4 mr-2' />Send Message</>}
              </Button>
            </div>
          </div>
        </TabsContent>
        <TabsContent value='inbox' className='mt-4'>
          <div className='h-[400px]'>
            <InboxView />
          </div>
        </TabsContent>
      </Tabs>
    </ModuleWindow>
  );
}

export function CalendarWindow(p:{open:boolean; onOpenChange:(v:boolean)=>void}){
  const [activeTab, setActiveTab] = useState('quick');
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [upcoming, setUpcoming] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { play } = useSound();
  const { user } = useAuth();

  useEffect(() => {
    if (p.open && activeTab === 'upcoming') {
      fetchUpcoming();
    }
  }, [p.open, activeTab]);

  const fetchUpcoming = async () => {
    if (!user) return;
    try {
      const { data } = await supabase.from('events').select('*').eq('user_id', user.id).gte('start_time', new Date().toISOString()).order('start_time').limit(10);
      setUpcoming(data || []);
    } catch (e) {
      console.error('Failed to fetch events:', e);
    }
  };

  const createEvent = async () => {
    if (!title.trim() || !startDate) {
      toast({ title: 'Title and date required', variant: 'destructive' });
      play('warn');
      return;
    }

    setLoading(true);
    try {
      const startDateTime = `${startDate}T${startTime || '09:00'}`;
      const endDateTime = `${startDate}T${endTime || '10:00'}`;

      await supabase.from('events').insert({
        user_id: user?.id,
        title,
        start_time: startDateTime,
        end_time: endDateTime,
        location: location || null,
        description: notes || null
      });

      toast({ title: 'Event created successfully' });
      play('success');
      setTitle('');
      setStartDate('');
      setStartTime('');
      setEndTime('');
      setLocation('');
      setNotes('');
    } catch (e: any) {
      toast({ title: 'Failed to create event', description: e.message, variant: 'destructive' });
      play('warn');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModuleWindow open={p.open} onOpenChange={p.onOpenChange} title='Calendar'>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className='glass-soft w-full'>
          <TabsTrigger value='quick' className='flex-1'>Quick Add</TabsTrigger>
          <TabsTrigger value='upcoming' className='flex-1'>Upcoming</TabsTrigger>
        </TabsList>
        <TabsContent value='quick' className='mt-4'>
          <div className='space-y-4'>
            <div className='grid gap-2'>
              <Label className='text-muted'>Event Title</Label>
              <Input value={title} onChange={(e)=>setTitle(e.target.value)} placeholder='Meeting, Workout, etc.' className='glass-soft border-white/10' disabled={loading} />
            </div>
            <div className='grid grid-cols-3 gap-4'>
              <div className='grid gap-2'>
                <Label className='text-muted'>Date</Label>
                <Input type='date' value={startDate} onChange={(e)=>setStartDate(e.target.value)} className='glass-soft border-white/10' disabled={loading} />
              </div>
              <div className='grid gap-2'>
                <Label className='text-muted'>Start Time</Label>
                <Input type='time' value={startTime} onChange={(e)=>setStartTime(e.target.value)} className='glass-soft border-white/10' disabled={loading} />
              </div>
              <div className='grid gap-2'>
                <Label className='text-muted'>End Time</Label>
                <Input type='time' value={endTime} onChange={(e)=>setEndTime(e.target.value)} className='glass-soft border-white/10' disabled={loading} />
              </div>
            </div>
            <div className='grid gap-2'>
              <Label className='text-muted'>Location / Link</Label>
              <Input value={location} onChange={(e)=>setLocation(e.target.value)} placeholder='Office, Zoom link...' className='glass-soft border-white/10' disabled={loading} />
            </div>
            <div className='grid gap-2'>
              <Label className='text-muted'>Notes</Label>
              <Textarea value={notes} onChange={(e)=>setNotes(e.target.value)} placeholder='Additional details...' className='glass-soft border-white/10 min-h-[60px]' disabled={loading} />
            </div>
            <div className='flex justify-end gap-2 pt-2'>
              <Button variant='outline' onClick={()=>p.onOpenChange(false)} disabled={loading}>Cancel</Button>
              <Button onClick={createEvent} disabled={!title || !startDate || loading}>{loading ? 'Creating...' : 'Create Event'}</Button>
            </div>
          </div>
        </TabsContent>
        <TabsContent value='upcoming' className='mt-4'>
          <ScrollArea className='h-[400px]'>
            <div className='space-y-2'>
              {upcoming.length === 0 ? (
                <p className='text-sm text-muted text-center py-8'>No upcoming events</p>
              ) : (
                upcoming.map((e)=>(
                  <div key={e.id} className='p-3 glass-soft rounded-lg'>
                    <p className='text-sm font-medium text-strong'>{e.title}</p>
                    <p className='text-xs text-muted'>{new Date(e.start_time).toLocaleString()}</p>
                    {e.location && <p className='text-xs text-soft mt-1'>{e.location}</p>}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </ModuleWindow>
  );
}

export function FitnessWindow(p:{open:boolean; onOpenChange:(v:boolean)=>void}){
  const [activeTab, setActiveTab] = useState('log');
  const [exerciseName, setExerciseName] = useState('');
  const [exerciseType, setExerciseType] = useState<'cardio'|'strength'|'bodyweight'|'flexibility'|'sports'>('cardio');
  const [duration, setDuration] = useState('');
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  const [distance, setDistance] = useState('');
  const [calories, setCalories] = useState('');
  const [notes, setNotes] = useState('');
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalWorkouts: 0, thisWeek: 0, topExercise: 'None', totalCalories: 0, activeGoals: 0 });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { play } = useSound();
  const { user } = useAuth();

  useEffect(() => {
    if (p.open) {
      fetchWorkouts();
      fetchGoals();
    }
  }, [p.open]);

  const fetchWorkouts = async () => {
    if (!user) return;
    try {
      const { data } = await supabase.from('fitness_workouts').select('*').eq('user_id', user.id).order('workout_date', { ascending: false }).limit(10);
      setWorkouts(data || []);
      calculateStats(data || []);
    } catch (e) {
      console.error('Failed to fetch workouts:', e);
    }
  };

  const fetchGoals = async () => {
    if (!user) return;
    try {
      const { data } = await supabase.from('fitness_goals').select('*').eq('user_id', user.id).eq('is_active', true);
      setGoals(data || []);
    } catch (e) {
      console.error('Failed to fetch goals:', e);
    }
  };

  const calculateStats = (data: any[]) => {
    const weekStart = startOfWeek(new Date());
    const thisWeek = data.filter(w => new Date(w.workout_date) >= weekStart).length;
    const exerciseCounts: Record<string, number> = {};
    data.forEach(w => exerciseCounts[w.exercise_name] = (exerciseCounts[w.exercise_name] || 0) + 1);
    const topExercise = Object.entries(exerciseCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';
    const totalCalories = data.reduce((sum, w) => sum + (w.calories_burned || 0), 0);
    setStats({ totalWorkouts: data.length, thisWeek, topExercise, totalCalories, activeGoals: goals.length });
  };

  const saveWorkout = async () => {
    if (!exerciseName.trim()) {
      toast({ title: 'Exercise name required', variant: 'destructive' });
      play('warn');
      return;
    }

    setLoading(true);
    try {
      await supabase.from('fitness_workouts').insert({
        user_id: user?.id,
        exercise_name: exerciseName,
        exercise_type: exerciseType,
        duration_minutes: duration ? parseInt(duration) : null,
        sets: sets ? parseInt(sets) : null,
        reps: reps ? parseInt(reps) : null,
        weight_lbs: weight ? parseFloat(weight) : null,
        distance_miles: distance ? parseFloat(distance) : null,
        calories_burned: calories ? parseInt(calories) : null,
        notes: notes || null,
        workout_date: new Date().toISOString().split('T')[0]
      });

      toast({ title: 'Workout logged successfully' });
      play('success');
      setExerciseName('');
      setDuration('');
      setSets('');
      setReps('');
      setWeight('');
      setDistance('');
      setCalories('');
      setNotes('');
      fetchWorkouts();
    } catch (e: any) {
      toast({ title: 'Failed to log workout', description: e.message, variant: 'destructive' });
      play('warn');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModuleWindow open={p.open} onOpenChange={p.onOpenChange} title='Fitness'>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className='glass-soft w-full'>
          <TabsTrigger value='log' className='flex-1'>Log Workout</TabsTrigger>
          <TabsTrigger value='stats' className='flex-1'>Stats</TabsTrigger>
          <TabsTrigger value='history' className='flex-1'>History</TabsTrigger>
        </TabsList>
        <TabsContent value='log' className='mt-4'>
          <div className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div className='grid gap-2'>
                <Label className='text-muted'>Exercise Name</Label>
                <Input value={exerciseName} onChange={(e)=>setExerciseName(e.target.value)} placeholder='Push-ups, Running...' className='glass-soft border-white/10' disabled={loading} />
              </div>
              <div className='grid gap-2'>
                <Label className='text-muted'>Type</Label>
                <Select value={exerciseType} onValueChange={(v:any)=>setExerciseType(v)} disabled={loading}>
                  <SelectTrigger className='glass-soft border-white/10'><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value='cardio'>Cardio</SelectItem>
                    <SelectItem value='strength'>Strength</SelectItem>
                    <SelectItem value='bodyweight'>Bodyweight</SelectItem>
                    <SelectItem value='flexibility'>Flexibility</SelectItem>
                    <SelectItem value='sports'>Sports</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className='grid grid-cols-3 gap-4'>
              <div className='grid gap-2'>
                <Label className='text-muted'>Duration (min)</Label>
                <Input type='number' value={duration} onChange={(e)=>setDuration(e.target.value)} placeholder='30' className='glass-soft border-white/10' disabled={loading} />
              </div>
              <div className='grid gap-2'>
                <Label className='text-muted'>Sets</Label>
                <Input type='number' value={sets} onChange={(e)=>setSets(e.target.value)} placeholder='3' className='glass-soft border-white/10' disabled={loading} />
              </div>
              <div className='grid gap-2'>
                <Label className='text-muted'>Reps</Label>
                <Input type='number' value={reps} onChange={(e)=>setReps(e.target.value)} placeholder='10' className='glass-soft border-white/10' disabled={loading} />
              </div>
            </div>
            <div className='grid grid-cols-3 gap-4'>
              <div className='grid gap-2'>
                <Label className='text-muted'>Weight (lbs)</Label>
                <Input type='number' value={weight} onChange={(e)=>setWeight(e.target.value)} placeholder='135' className='glass-soft border-white/10' disabled={loading} />
              </div>
              <div className='grid gap-2'>
                <Label className='text-muted'>Distance (mi)</Label>
                <Input type='number' step='0.1' value={distance} onChange={(e)=>setDistance(e.target.value)} placeholder='3.1' className='glass-soft border-white/10' disabled={loading} />
              </div>
              <div className='grid gap-2'>
                <Label className='text-muted'>Calories</Label>
                <Input type='number' value={calories} onChange={(e)=>setCalories(e.target.value)} placeholder='300' className='glass-soft border-white/10' disabled={loading} />
              </div>
            </div>
            <div className='grid gap-2'>
              <Label className='text-muted'>Notes</Label>
              <Textarea value={notes} onChange={(e)=>setNotes(e.target.value)} placeholder='How did it feel?' className='glass-soft border-white/10 min-h-[60px]' disabled={loading} />
            </div>
            <div className='flex justify-end gap-2 pt-2'>
              <Button variant='outline' onClick={()=>p.onOpenChange(false)} disabled={loading}>Cancel</Button>
              <Button onClick={saveWorkout} disabled={!exerciseName || loading}>{loading ? 'Logging...' : 'Log Workout'}</Button>
            </div>
          </div>
        </TabsContent>
        <TabsContent value='stats' className='mt-4'>
          <div className='grid grid-cols-2 gap-3'>
            <div className='p-3 glass-soft rounded-lg'>
              <div className='flex items-center gap-2 mb-1'>
                <Activity className='h-4 w-4 text-primary' />
                <span className='text-xs text-muted'>Total Workouts</span>
              </div>
              <p className='text-2xl font-bold text-strong'>{stats.totalWorkouts}</p>
            </div>
            <div className='p-3 glass-soft rounded-lg'>
              <div className='flex items-center gap-2 mb-1'>
                <CalendarIcon className='h-4 w-4 text-green-400' />
                <span className='text-xs text-muted'>This Week</span>
              </div>
              <p className='text-2xl font-bold text-strong'>{stats.thisWeek}</p>
            </div>
            <div className='p-3 glass-soft rounded-lg'>
              <div className='flex items-center gap-2 mb-1'>
                <Dumbbell className='h-4 w-4 text-blue-400' />
                <span className='text-xs text-muted'>Top Exercise</span>
              </div>
              <p className='text-sm font-semibold text-strong truncate'>{stats.topExercise}</p>
            </div>
            <div className='p-3 glass-soft rounded-lg'>
              <div className='flex items-center gap-2 mb-1'>
                <Activity className='h-4 w-4 text-orange-400' />
                <span className='text-xs text-muted'>Calories Burned</span>
              </div>
              <p className='text-2xl font-bold text-strong'>{stats.totalCalories}</p>
            </div>
          </div>
        </TabsContent>
        <TabsContent value='history' className='mt-4'>
          <ScrollArea className='h-[400px]'>
            <div className='space-y-2'>
              {workouts.length === 0 ? (
                <p className='text-sm text-muted text-center py-8'>No workouts yet</p>
              ) : (
                workouts.map((w)=>(
                  <div key={w.id} className='p-3 glass-soft rounded-lg'>
                    <div className='flex justify-between items-start mb-1'>
                      <p className='text-sm font-medium text-strong'>{w.exercise_name}</p>
                      <Badge variant='outline' className='text-xs'>{w.exercise_type}</Badge>
                    </div>
                    <p className='text-xs text-muted'>
                      {w.workout_date} • {w.duration_minutes && `${w.duration_minutes}min`} {w.sets && `${w.sets}×${w.reps}`} {w.weight_lbs && `${w.weight_lbs}lbs`}
                    </p>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </ModuleWindow>
  );
}

export function HealthWindow(p:{open:boolean; onOpenChange:(v:boolean)=>void}){
  const [activeTab, setActiveTab] = useState('vitals');
  const [metricType, setMetricType] = useState<'weight'|'blood_pressure'|'heart_rate'|'temperature'|'blood_sugar'>('weight');
  const [metricValue, setMetricValue] = useState('');
  const [metricNotes, setMetricNotes] = useState('');
  const [medName, setMedName] = useState('');
  const [medDosage, setMedDosage] = useState('');
  const [medFrequency, setMedFrequency] = useState('');
  const [medType, setMedType] = useState<'prescription'|'supplement'|'over_counter'>('prescription');
  const [medNotes, setMedNotes] = useState('');
  const [metrics, setMetrics] = useState<any[]>([]);
  const [meds, setMeds] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { play } = useSound();
  const { user } = useAuth();

  useEffect(() => {
    if (p.open) {
      fetchMetrics();
      fetchMeds();
    }
  }, [p.open]);

  const fetchMetrics = async () => {
    if (!user) return;
    try {
      const { data } = await supabase.from('health_metrics').select('*').eq('user_id', user.id).order('date', { ascending: false }).limit(10);
      setMetrics(data || []);
    } catch (e) {
      console.error('Failed to fetch metrics:', e);
    }
  };

  const fetchMeds = async () => {
    if (!user) return;
    try {
      const { data } = await supabase.from('medications').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      setMeds(data || []);
    } catch (e) {
      console.error('Failed to fetch medications:', e);
    }
  };

  const saveMetric = async () => {
    if (!metricValue.trim()) {
      toast({ title: 'Value required', variant: 'destructive' });
      play('warn');
      return;
    }

    setLoading(true);
    try {
      await supabase.from('health_metrics').insert({
        user_id: user?.id,
        metric_type: metricType,
        value: metricValue,
        notes: metricNotes || null
      });

      toast({ title: 'Vitals logged successfully' });
      play('success');
      setMetricValue('');
      setMetricNotes('');
      fetchMetrics();
    } catch (e: any) {
      toast({ title: 'Failed to log vitals', description: e.message, variant: 'destructive' });
      play('warn');
    } finally {
      setLoading(false);
    }
  };

  const saveMed = async () => {
    if (!medName.trim() || !medFrequency.trim()) {
      toast({ title: 'Name and frequency required', variant: 'destructive' });
      play('warn');
      return;
    }

    setLoading(true);
    try {
      await supabase.from('medications').insert({
        user_id: user?.id,
        name: medName,
        dosage: medDosage || null,
        frequency: medFrequency,
        medication_type: medType,
        notes: medNotes || null
      });

      toast({ title: 'Medication added successfully' });
      play('success');
      setMedName('');
      setMedDosage('');
      setMedFrequency('');
      setMedNotes('');
      fetchMeds();
    } catch (e: any) {
      toast({ title: 'Failed to add medication', description: e.message, variant: 'destructive' });
      play('warn');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModuleWindow open={p.open} onOpenChange={p.onOpenChange} title='Health'>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className='glass-soft w-full'>
          <TabsTrigger value='vitals' className='flex-1'>Log Vitals</TabsTrigger>
          <TabsTrigger value='medications' className='flex-1'>Medications</TabsTrigger>
        </TabsList>
        <TabsContent value='vitals' className='mt-4'>
          <div className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div className='grid gap-2'>
                <Label className='text-muted'>Metric Type</Label>
                <Select value={metricType} onValueChange={(v:any)=>setMetricType(v)} disabled={loading}>
                  <SelectTrigger className='glass-soft border-white/10'><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value='weight'>Weight (lbs)</SelectItem>
                    <SelectItem value='blood_pressure'>Blood Pressure (mmHg)</SelectItem>
                    <SelectItem value='heart_rate'>Heart Rate (bpm)</SelectItem>
                    <SelectItem value='temperature'>Temperature (°F)</SelectItem>
                    <SelectItem value='blood_sugar'>Blood Sugar (mg/dL)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className='grid gap-2'>
                <Label className='text-muted'>Value</Label>
                <Input value={metricValue} onChange={(e)=>setMetricValue(e.target.value)} placeholder='Enter value...' className='glass-soft border-white/10' disabled={loading} />
              </div>
            </div>
            <div className='grid gap-2'>
              <Label className='text-muted'>Notes</Label>
              <Textarea value={metricNotes} onChange={(e)=>setMetricNotes(e.target.value)} placeholder='Optional notes...' className='glass-soft border-white/10 min-h-[60px]' disabled={loading} />
            </div>
            <ScrollArea className='h-[200px]'>
              <div className='space-y-2'>
                {metrics.length === 0 ? (
                  <p className='text-sm text-muted text-center py-4'>No metrics yet</p>
                ) : (
                  metrics.map((m)=>(
                    <div key={m.id} className='p-3 glass-soft rounded-lg flex justify-between items-center'>
                      <div>
                        <p className='text-sm font-medium text-strong capitalize'>{m.metric_type.replace('_', ' ')}</p>
                        <p className='text-xs text-muted'>{m.date}</p>
                      </div>
                      <Badge variant='secondary'>{m.value}</Badge>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
            <div className='flex justify-end gap-2 pt-2'>
              <Button variant='outline' onClick={()=>p.onOpenChange(false)} disabled={loading}>Cancel</Button>
              <Button onClick={saveMetric} disabled={!metricValue || loading}>{loading ? 'Logging...' : 'Log Vitals'}</Button>
            </div>
          </div>
        </TabsContent>
        <TabsContent value='medications' className='mt-4'>
          <div className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div className='grid gap-2'>
                <Label className='text-muted'>Name</Label>
                <Input value={medName} onChange={(e)=>setMedName(e.target.value)} placeholder='Medication name...' className='glass-soft border-white/10' disabled={loading} />
              </div>
              <div className='grid gap-2'>
                <Label className='text-muted'>Dosage</Label>
                <Input value={medDosage} onChange={(e)=>setMedDosage(e.target.value)} placeholder='10mg, 1 tablet...' className='glass-soft border-white/10' disabled={loading} />
              </div>
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <div className='grid gap-2'>
                <Label className='text-muted'>Frequency</Label>
                <Input value={medFrequency} onChange={(e)=>setMedFrequency(e.target.value)} placeholder='Daily, Twice daily...' className='glass-soft border-white/10' disabled={loading} />
              </div>
              <div className='grid gap-2'>
                <Label className='text-muted'>Type</Label>
                <Select value={medType} onValueChange={(v:any)=>setMedType(v)} disabled={loading}>
                  <SelectTrigger className='glass-soft border-white/10'><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value='prescription'>Prescription</SelectItem>
                    <SelectItem value='supplement'>Supplement</SelectItem>
                    <SelectItem value='over_counter'>Over the Counter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className='grid gap-2'>
              <Label className='text-muted'>Notes</Label>
              <Textarea value={medNotes} onChange={(e)=>setMedNotes(e.target.value)} placeholder='Additional notes...' className='glass-soft border-white/10 min-h-[60px]' disabled={loading} />
            </div>
            <ScrollArea className='h-[150px]'>
              <div className='space-y-2'>
                {meds.length === 0 ? (
                  <p className='text-sm text-muted text-center py-4'>No medications yet</p>
                ) : (
                  meds.map((m)=>(
                    <div key={m.id} className='p-3 glass-soft rounded-lg flex justify-between items-center'>
                      <div className='flex items-center gap-2'>
                        <Pill className='h-4 w-4 text-muted' />
                        <div>
                          <p className='text-sm font-medium text-strong'>{m.name}</p>
                          <p className='text-xs text-muted'>{m.dosage} • {m.frequency}</p>
                        </div>
                      </div>
                      <Badge variant={m.is_active ? 'default' : 'outline'}>{m.is_active ? 'Active' : 'Inactive'}</Badge>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
            <div className='flex justify-end gap-2 pt-2'>
              <Button variant='outline' onClick={()=>p.onOpenChange(false)} disabled={loading}>Cancel</Button>
              <Button onClick={saveMed} disabled={!medName || !medFrequency || loading}>{loading ? 'Adding...' : 'Add Medication'}</Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </ModuleWindow>
  );
}

export function NotificationsWindow(p:{open:boolean; onOpenChange:(v:boolean)=>void}){
  const [activeTab, setActiveTab] = useState('center');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [notifType, setNotifType] = useState('reminder');
  const [scheduledTime, setScheduledTime] = useState('');
  const { scheduleNotification } = useNotifications();
  const { toast } = useToast();
  const { play } = useSound();

  const createNotification = () => {
    if (!title.trim() || !message.trim()) {
      toast({ title: 'Title and message required', variant: 'destructive' });
      play('warn');
      return;
    }

    scheduleNotification({
      title,
      message,
      type: notifType as any,
      scheduledFor: scheduledTime ? new Date(scheduledTime) : new Date(),
      actionUrl: undefined
    });

    toast({ title: 'Notification created' });
    play('success');
    setTitle('');
    setMessage('');
    setScheduledTime('');
  };

  return (
    <ModuleWindow open={p.open} onOpenChange={p.onOpenChange} title='Notifications'>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className='glass-soft w-full'>
          <TabsTrigger value='center' className='flex-1'>Center</TabsTrigger>
          <TabsTrigger value='create' className='flex-1'>Create</TabsTrigger>
        </TabsList>
        <TabsContent value='center' className='mt-4'>
          <NotificationCenter />
        </TabsContent>
        <TabsContent value='create' className='mt-4'>
          <div className='space-y-4'>
            <div className='grid gap-2'>
              <Label className='text-muted'>Title</Label>
              <Input value={title} onChange={(e)=>setTitle(e.target.value)} placeholder='Notification title...' className='glass-soft border-white/10' />
            </div>
            <div className='grid gap-2'>
              <Label className='text-muted'>Message</Label>
              <Textarea value={message} onChange={(e)=>setMessage(e.target.value)} placeholder='Notification message...' className='glass-soft border-white/10 min-h-[80px]' />
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <div className='grid gap-2'>
                <Label className='text-muted'>Type</Label>
                <Select value={notifType} onValueChange={setNotifType}>
                  <SelectTrigger className='glass-soft border-white/10'><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value='reminder'>Reminder</SelectItem>
                    <SelectItem value='task'>Task</SelectItem>
                    <SelectItem value='event'>Event</SelectItem>
                    <SelectItem value='workout'>Workout</SelectItem>
                    <SelectItem value='expense'>Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className='grid gap-2'>
                <Label className='text-muted'>Scheduled Time</Label>
                <Input type='datetime-local' value={scheduledTime} onChange={(e)=>setScheduledTime(e.target.value)} className='glass-soft border-white/10' />
              </div>
            </div>
            <div className='flex justify-end gap-2 pt-2'>
              <Button variant='outline' onClick={()=>p.onOpenChange(false)}>Cancel</Button>
              <Button onClick={createNotification} disabled={!title || !message}>
                <Bell className='h-4 w-4 mr-2' />Create Notification
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </ModuleWindow>
  );
}

export function FeedWindow(p:{open:boolean; onOpenChange:(v:boolean)=>void}){
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    if (p.open) {
      fetchCurrentUser();
      fetchSharedSpacePosts();
    }
  }, [p.open]);

  const fetchCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setCurrentUserId(user.id);
  };

  const fetchSharedSpacePosts = async () => {
    try {
      setLoading(true);
      
      // Get all organizations the user is a member of that are shared spaces (not individual)
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: memberships, error: membershipError } = await supabase
        .from('organization_memberships')
        .select('organization_id, organizations(type)')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (membershipError) throw membershipError;

      // Filter to only shared spaces (exclude individual type)
      const sharedSpaceIds = memberships
        ?.filter((m: any) => m.organizations?.type !== 'individual')
        .map((m: any) => m.organization_id) || [];

      if (sharedSpaceIds.length === 0) {
        setPosts([]);
        setLoading(false);
        return;
      }

      // Fetch posts from all shared spaces
      const { data: postsData, error: postsError } = await supabase
        .from('space_posts')
        .select('*')
        .in('organization_id', sharedSpaceIds)
        .order('created_at', { ascending: false })
        .limit(20);

      if (postsError) throw postsError;

      setPosts(postsData || []);
    } catch (error) {
      console.error('Error fetching shared space posts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load feed',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModuleWindow open={p.open} onOpenChange={p.onOpenChange} title='Shared Spaces Feed'>
      <div className='space-y-4'>
        <p className='text-sm text-muted'>Posts from all your connected shared spaces</p>
        
        <ScrollArea className='h-[400px]'>
          {loading ? (
            <div className='flex items-center justify-center py-12'>
              <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary'></div>
            </div>
          ) : posts.length === 0 ? (
            <div className='text-center py-12'>
              <p className='text-muted mb-2'>No posts yet</p>
              <p className='text-sm text-soft'>
                Posts from your shared spaces will appear here
              </p>
            </div>
          ) : (
            <div className='space-y-3 pr-4'>
              {posts.map((post: any) => (
                <div key={post.id} className='p-4 rounded-lg glass-soft border border-white/10 space-y-2'>
                  <div className='flex items-start justify-between'>
                    <div className='flex-1'>
                      <p className='text-sm text-strong whitespace-pre-wrap'>{post.content}</p>
                    </div>
                  </div>
                  <div className='flex items-center justify-between text-xs text-soft'>
                    <span>{new Date(post.created_at).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </ModuleWindow>
  );
}

export function SettingsWindow(p:{open:boolean; onOpenChange:(v:boolean)=>void}){
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (p.open) {
      fetchProfile();
    }
  }, [p.open]);

  const fetchProfile = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      setProfile(data);
    }
    setLoading(false);
  };

  return (
    <ModuleWindow open={p.open} onOpenChange={p.onOpenChange} title='Settings'>
      <Tabs defaultValue='profile' className='w-full'>
        <TabsList className='w-full grid grid-cols-2'>
          <TabsTrigger value='profile'>Profile</TabsTrigger>
          <TabsTrigger value='notifications'>Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value='profile' className='space-y-3'>
          {loading ? (
            <div className='text-soft text-sm'>Loading profile...</div>
          ) : (
            <div className='space-y-3'>
              <div>
                <Label>Full Name</Label>
                <div className='text-sm text-soft'>{profile?.full_name || 'Not set'}</div>
              </div>
              <div>
                <Label>Role</Label>
                <div className='text-sm text-soft capitalize'>{profile?.role || 'user'}</div>
              </div>
              <Button variant='outline' size='sm' onClick={() => window.location.href = '/settings'}>
                Open Full Settings
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value='notifications'>
          <NotificationSettings />
        </TabsContent>
      </Tabs>
    </ModuleWindow>
  );
}

export function AssetsWindow(p:{open:boolean; onOpenChange:(v:boolean)=>void}){
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { play } = useSound();
  const { toast } = useToast();

  useEffect(() => {
    if (p.open) {
      fetchFiles();
    }
  }, [p.open]);

  const fetchFiles = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('file_metadata')
        .select('*')
        .eq('uploaded_by', user.id)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (data) setFiles(data);
    }
    setLoading(false);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const filePath = `${user.id}/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from('organization-files')
      .upload(filePath, file);

    if (!uploadError) {
      await supabase.from('file_metadata').insert({
        uploaded_by: user.id,
        file_path: filePath,
        file_name: file.name,
        mime_type: file.type,
        file_size: file.size,
        organization_id: null
      });

      play('success');
      toast({ title: 'File uploaded successfully' });
      fetchFiles();
    } else {
      toast({ title: 'Upload failed', variant: 'destructive' });
    }
    
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <ModuleWindow open={p.open} onOpenChange={p.onOpenChange} title='Assets'>
      <Tabs defaultValue='files' className='w-full'>
        <TabsList className='w-full grid grid-cols-2'>
          <TabsTrigger value='files'>My Files</TabsTrigger>
          <TabsTrigger value='upload'>Upload</TabsTrigger>
        </TabsList>

        <TabsContent value='files' className='space-y-3'>
          {loading ? (
            <div className='text-soft text-sm'>Loading files...</div>
          ) : files.length === 0 ? (
            <div className='text-soft text-sm'>No files uploaded yet</div>
          ) : (
            <ScrollArea className='h-[400px]'>
              <div className='space-y-2 pr-4'>
                {files.map((file) => (
                  <div key={file.id} className='p-3 rounded-lg bg-muted/30 space-y-1'>
                    <div className='flex items-center gap-2'>
                      <FileIcon className='h-4 w-4 text-soft' />
                      <span className='text-sm font-medium truncate flex-1'>{file.file_name}</span>
                    </div>
                    <div className='text-xs text-soft'>
                      {(file.file_size / 1024 / 1024).toFixed(2)} MB • {new Date(file.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </TabsContent>

        <TabsContent value='upload' className='space-y-3'>
          <div className='space-y-3'>
            <Label>Upload File</Label>
            <input
              ref={fileInputRef}
              type='file'
              onChange={handleUpload}
              disabled={uploading}
              className='block w-full text-sm text-soft file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90'
            />
            {uploading && <div className='text-sm text-soft'>Uploading...</div>}
          </div>
        </TabsContent>
      </Tabs>
    </ModuleWindow>
  );
}

export function LocationsWindow(p:{open:boolean; onOpenChange:(v:boolean)=>void}){
  const [activeTab, setActiveTab] = useState('bookmarks');
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [category, setCategory] = useState('restaurant');
  const [notes, setNotes] = useState('');
  const { toast } = useToast();
  const { play } = useSound();

  useEffect(() => {
    if (p.open) {
      fetchLocations();
    }
  }, [p.open]);

  const fetchLocations = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('locations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setLocations(data || []);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast({ title: 'Name required', variant: 'destructive' });
      play('warn');
      return;
    }
    
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      await supabase.from('locations').insert([{
        user_id: user.id,
        name: name.trim(),
        address: address.trim() || null,
        category,
        notes: notes.trim() || null
      }]);

      toast({ title: 'Location saved' });
      play('success');
      setName('');
      setAddress('');
      setCategory('restaurant');
      setNotes('');
      fetchLocations();
      setActiveTab('bookmarks');
    } catch (error: any) {
      console.error('Save error:', error);
      toast({ title: 'Error saving location', variant: 'destructive' });
      play('warn');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await supabase.from('locations').delete().eq('id', id);
      toast({ title: 'Location deleted' });
      play('success');
      fetchLocations();
    } catch (error) {
      console.error('Delete error:', error);
      toast({ title: 'Error deleting location', variant: 'destructive' });
    }
  };

  const categories = [
    'restaurant', 'cafe', 'bar', 'club', 'prospect', 'client', 
    'gym', 'park', 'office', 'shop', 'hotel', 'other'
  ];

  return (
    <ModuleWindow open={p.open} onOpenChange={p.onOpenChange} title='Locations'>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className='grid w-full grid-cols-2'>
          <TabsTrigger value='bookmarks'>My Places</TabsTrigger>
          <TabsTrigger value='add'>Add New</TabsTrigger>
        </TabsList>

        <TabsContent value='bookmarks' className='space-y-3'>
          {loading ? (
            <div className='text-soft text-sm'>Loading...</div>
          ) : locations.length === 0 ? (
            <div className='text-center py-8 text-soft'>
              <MapPinIcon className='h-12 w-12 mx-auto mb-2 opacity-50' />
              <p className='text-sm'>No saved locations yet</p>
              <Button 
                variant='ghost' 
                size='sm' 
                onClick={() => setActiveTab('add')}
                className='mt-2'
              >
                Add your first location
              </Button>
            </div>
          ) : (
            <ScrollArea className='h-[400px]'>
              <div className='space-y-2 pr-4'>
                {locations.map((loc) => (
                  <div key={loc.id} className='p-3 rounded-lg glass-soft space-y-2'>
                    <div className='flex items-start justify-between'>
                      <div className='flex-1'>
                        <div className='flex items-center gap-2'>
                          <MapPinIcon className='h-4 w-4 text-primary' />
                          <span className='font-medium text-strong'>{loc.name}</span>
                        </div>
                        <Badge variant='secondary' className='text-xs mt-1'>
                          {loc.category}
                        </Badge>
                      </div>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => handleDelete(loc.id)}
                        className='text-destructive hover:text-destructive'
                      >
                        Delete
                      </Button>
                    </div>
                    {loc.address && (
                      <div className='text-sm text-muted'>{loc.address}</div>
                    )}
                    {loc.notes && (
                      <div className='text-sm text-soft italic'>{loc.notes}</div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </TabsContent>

        <TabsContent value='add' className='space-y-4'>
          <div className='space-y-2'>
            <Label>Name *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder='e.g., Blue Bottle Coffee'
            />
          </div>

          <div className='space-y-2'>
            <Label>Category *</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <Label>Address</Label>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder='123 Main St, City'
            />
          </div>

          <div className='space-y-2'>
            <Label>Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder='Any additional context...'
              rows={3}
            />
          </div>

          <Button 
            onClick={handleSave} 
            disabled={loading}
            className='w-full'
          >
            {loading ? <Loader2 className='h-4 w-4 animate-spin mr-2' /> : null}
            Save Location
          </Button>
        </TabsContent>
      </Tabs>
    </ModuleWindow>
  );
}

export function AIPerplexityWindow(p:{open:boolean; onOpenChange:(v:boolean)=>void}){
  const SimplifiedAIChatLazy = React.lazy(() => import('@/components/command/SimplifiedAIChat').then(m => ({ default: m.SimplifiedAIChat })));
  
  return (
    <ModuleWindow open={p.open} onOpenChange={p.onOpenChange} title='Perplexity Search'>
      <Suspense fallback={<div className='p-6 text-soft'>Loading…</div>}>
        <SimplifiedAIChatLazy engine='perplexity' title='Perplexity' description='Live web search with real-time answers' />
      </Suspense>
    </ModuleWindow>
  );
}

export function AIGeminiWindow(p:{open:boolean; onOpenChange:(v:boolean)=>void}){
  const SimplifiedAIChatLazy = React.lazy(() => import('@/components/command/SimplifiedAIChat').then(m => ({ default: m.SimplifiedAIChat })));
  
  return (
    <ModuleWindow open={p.open} onOpenChange={p.onOpenChange} title='Gemini Chat'>
      <Suspense fallback={<div className='p-6 text-soft'>Loading…</div>}>
        <SimplifiedAIChatLazy engine='gemini' title='Gemini' description='Google AI for creative and analytical tasks' />
      </Suspense>
    </ModuleWindow>
  );
}
