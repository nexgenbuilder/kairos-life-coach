import React, { Suspense, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bot, Search, Sparkles, MessageSquare, Mail, Banknote, ReceiptText, CheckSquare, Calendar, Dumbbell, HeartPulse, Users, Shield, Bell, LayoutDashboard, Settings, Boxes, MapPin, Send } from 'lucide-react';
import { createTaskQuick, logExpenseQuick, logIncomeQuick, createSpaceQuick } from '@/lib/command-actions';
import { MiniDashGrid } from '@/components/hub/MiniDashGrid';

const SmartChatInterface = React.lazy(() => import('@/components/chat/SmartChatInterface').then(m => ({ default: m.SmartChatInterface })));

function Field({ label, type = 'text', value, onChange, placeholder }: any) {
  return (
    <div className='grid gap-1.5'>
      <Label>{label}</Label>
      <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}

function ModuleModal({ open, onOpenChange, title, children }: { open: boolean; onOpenChange: (v: boolean) => void; title: string; children: React.ReactNode }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-3xl glass'>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className='mt-2'>{children}</div>
      </DialogContent>
    </Dialog>
  );
}

function CommandTile({ icon: Icon, label, subtitle, onClick }: any) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -2, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className='group rounded-2xl glass p-4 shadow-sm hover:shadow-lg transition-all text-left'
    >
      <div className='flex items-center gap-3'>
        <div className='rounded-xl p-2 bg-white/5 group-hover:bg-white/10'>
          <Icon className='h-5 w-5' />
        </div>
        <div>
          <div className='font-medium leading-none'>{label}</div>
          {subtitle ? <div className='text-xs text-muted-foreground mt-1'>{subtitle}</div> : null}
        </div>
      </div>
    </motion.button>
  );
}

export default function CommandCenterDashboard() {
  const [open, setOpen] = useState<null | string>(null);
  const { toast } = useToast();

  // --- Quick action state ---
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDue, setTaskDue] = useState('');
  const [taskNotes, setTaskNotes] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expDescription, setExpDescription] = useState('');
  const [expCategory, setExpCategory] = useState('');
  const [incAmount, setIncAmount] = useState('');
  const [incDescription, setIncDescription] = useState('');
  const [spaceName, setSpaceName] = useState('');

  async function handleCreateTask() {
    try {
      await createTaskQuick({ title: taskTitle, due_date: taskDue || undefined, notes: taskNotes || undefined });
      toast({ title: 'Task created' });
      setTaskTitle('');
      setTaskDue('');
      setTaskNotes('');
      setOpen(null);
    } catch (e: any) {
      toast({ title: 'Task failed', description: e.message, variant: 'destructive' });
    }
  }

  async function handleLogExpense() {
    try {
      await logExpenseQuick({ amount: Number(expAmount || 0), description: expDescription || undefined, category: expCategory || undefined });
      toast({ title: 'Expense logged' });
      setExpAmount('');
      setExpDescription('');
      setExpCategory('');
      setOpen(null);
    } catch (e: any) {
      toast({ title: 'Expense failed', description: e.message, variant: 'destructive' });
    }
  }

  async function handleLogIncome() {
    try {
      await logIncomeQuick({ amount: Number(incAmount || 0), description: incDescription || undefined });
      toast({ title: 'Income logged' });
      setIncAmount('');
      setIncDescription('');
      setOpen(null);
    } catch (e: any) {
      toast({ title: 'Income failed', description: e.message, variant: 'destructive' });
    }
  }

  async function handleCreateSpace() {
    try {
      await createSpaceQuick({ name: spaceName });
      toast({ title: 'Space created' });
      setSpaceName('');
      setOpen(null);
    } catch (e: any) {
      toast({ title: 'Space failed', description: e.message, variant: 'destructive' });
    }
  }

  const tiles = useMemo(() => [
    { key: 'general_ai', label: 'General AI', icon: Bot, subtitle: 'Assistant for everything', action: () => setOpen('general_ai') },
    { key: 'perplexity', label: 'Perplexity', icon: Search, subtitle: 'Live web answers', action: () => setOpen('perplexity') },
    { key: 'gemini', label: 'Gemini', icon: Sparkles, subtitle: 'Google AI chat', action: () => setOpen('gemini') },
    { key: 'messages', label: 'Messages', icon: MessageSquare, subtitle: 'Inbox / Compose', action: () => setOpen('messages') },
    { key: 'tasks', label: 'Tasks', icon: CheckSquare, subtitle: 'Quick create / Plan day', action: () => setOpen('tasks') },
    { key: 'money', label: 'Money', icon: Banknote, subtitle: 'Log expense / income', action: () => setOpen('money') },
    { key: 'receipts', label: 'Receipts', icon: ReceiptText, subtitle: 'Scan & extract', action: () => setOpen('receipts') },
    { key: 'calendar', label: 'Calendar', icon: Calendar, subtitle: 'Schedule & view', action: () => setOpen('calendar') },
    { key: 'fitness', label: 'Fitness', icon: Dumbbell, subtitle: 'Workouts & streaks', action: () => setOpen('fitness') },
    { key: 'health', label: 'Health', icon: HeartPulse, subtitle: 'Vitals & habits', action: () => setOpen('health') },
    { key: 'spaces', label: 'Spaces', icon: Users, subtitle: 'Create / manage', action: () => setOpen('spaces') },
    { key: 'notifications', label: 'Notifications', icon: Bell, subtitle: 'Center & rules', action: () => setOpen('notifications') },
    { key: 'security', label: 'Security', icon: Shield, subtitle: 'Audit & controls', action: () => setOpen('security') },
    { key: 'settings', label: 'Settings', icon: Settings, subtitle: 'Personal & org', action: () => setOpen('settings') },
    { key: 'assets', label: 'Assets', icon: Boxes, subtitle: 'Files & media', action: () => setOpen('assets') },
    { key: 'locations', label: 'Locations', icon: MapPin, subtitle: 'Places & visits', action: () => setOpen('locations') }
  ], []);

  return (
    <div className='w-full mx-auto max-w-6xl px-4 md:px-6 py-6 space-y-6 bg-aurora min-h-[100svh] text-white'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <div className='rounded-xl p-2 glass-soft'>
            <LayoutDashboard className='h-5 w-5' />
          </div>
          <div>
            <h1 className='text-xl font-semibold leading-tight'>Command Center</h1>
            <p className='text-sm text-white/70'>One roof. One snapshot. Launch any workflow instantly.</p>
          </div>
        </div>
        <div className='hidden md:flex gap-2'>
          <Button variant='outline' onClick={() => setOpen('messages')} className='glass-soft text-white border-white/10'>
            <Mail className='h-4 w-4 mr-2' />Compose
          </Button>
          <Button onClick={() => setOpen('tasks')} className='glass-soft text-white border-white/10'>
            <CheckSquare className='h-4 w-4 mr-2' />Quick Task
          </Button>
        </div>
      </div>

      <Card className='border-0 bg-transparent shadow-none'>
        <CardHeader className='pb-2'>
          <CardTitle className='text-base text-white/90'>Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3'>
            {tiles.map(t => <CommandTile key={t.key} icon={t.icon} label={t.label} subtitle={t.subtitle} onClick={t.action} />)}
          </div>
        </CardContent>
      </Card>

      <Separator className='bg-white/10' />

      <section>
        <div className='mb-2 flex items-center justify-between'>
          <h2 className='text-base font-semibold'>Quick Overview</h2>
        </div>
        <MiniDashGrid />
      </section>

      {/* Modals */}
      <ModuleModal open={open === 'tasks'} onOpenChange={() => setOpen(null)} title='Tasks'>
        <Tabs defaultValue='quick'>
          <TabsList className='glass-soft'>
            <TabsTrigger value='quick'>Quick Task</TabsTrigger>
            <TabsTrigger value='plan'>Plan My Day</TabsTrigger>
          </TabsList>
          <TabsContent value='quick'>
            <div className='space-y-3'>
              <Field label='Title' value={taskTitle} onChange={setTaskTitle} placeholder='e.g., Call supplier at 3pm' />
              <Field label='Due Date' type='date' value={taskDue} onChange={setTaskDue} />
              <Field label='Notes' value={taskNotes} onChange={setTaskNotes} placeholder='optional' />
              <div className='flex justify-end pt-2'>
                <Button onClick={handleCreateTask}><Send className='h-4 w-4 mr-2' />Save</Button>
              </div>
            </div>
          </TabsContent>
          <TabsContent value='plan'>
            <div className='text-sm text-white/70'>(Wireframe) Add 3 priorities; we can later map to multiple insert calls.</div>
          </TabsContent>
        </Tabs>
      </ModuleModal>

      <ModuleModal open={open === 'money'} onOpenChange={() => setOpen(null)} title='Money'>
        <Tabs defaultValue='expense'>
          <TabsList className='glass-soft'>
            <TabsTrigger value='expense'>Log Expense</TabsTrigger>
            <TabsTrigger value='income'>Log Income</TabsTrigger>
          </TabsList>
          <TabsContent value='expense'>
            <div className='space-y-3'>
              <Field label='Amount' type='number' value={expAmount} onChange={setExpAmount} placeholder='0.00' />
              <Field label='Description' value={expDescription} onChange={setExpDescription} placeholder='Optional' />
              <Field label='Category' value={expCategory} onChange={setExpCategory} placeholder='e.g., Food' />
              <div className='flex justify-end pt-2'>
                <Button onClick={handleLogExpense}><Send className='h-4 w-4 mr-2' />Save</Button>
              </div>
            </div>
          </TabsContent>
          <TabsContent value='income'>
            <div className='space-y-3'>
              <Field label='Amount' type='number' value={incAmount} onChange={setIncAmount} placeholder='0.00' />
              <Field label='Description' value={incDescription} onChange={setIncDescription} placeholder='Optional' />
              <div className='flex justify-end pt-2'>
                <Button onClick={handleLogIncome}><Send className='h-4 w-4 mr-2' />Save</Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </ModuleModal>

      <ModuleModal open={open === 'receipts'} onOpenChange={() => setOpen(null)} title='Scan Receipt'>
        <div className='space-y-3 text-sm text-white/80'>(Wireframe) Hook your existing upload component here; for now we call edge function with a URL/base64 via scanReceiptQuick().</div>
      </ModuleModal>

      <ModuleModal open={open === 'messages'} onOpenChange={() => setOpen(null)} title='Messages'>
        <Tabs defaultValue='compose'>
          <TabsList className='glass-soft'>
            <TabsTrigger value='compose'>Compose</TabsTrigger>
            <TabsTrigger value='inbox'>Inbox</TabsTrigger>
            <TabsTrigger value='outbox'>Outbox</TabsTrigger>
          </TabsList>
          <TabsContent value='compose'>
            <div className='text-sm text-white/70'>(Wireframe) We can wire to your existing messaging tables/flows next pass.</div>
          </TabsContent>
          <TabsContent value='inbox'>
            <div className='text-sm text-white/70'>(Wireframe) Inbox list placeholder.</div>
          </TabsContent>
          <TabsContent value='outbox'>
            <div className='text-sm text-white/70'>(Wireframe) Outbox list placeholder.</div>
          </TabsContent>
        </Tabs>
      </ModuleModal>

      <ModuleModal open={open === 'spaces'} onOpenChange={() => setOpen(null)} title='Spaces'>
        <Tabs defaultValue='create'>
          <TabsList className='glass-soft'>
            <TabsTrigger value='create'>Create</TabsTrigger>
            <TabsTrigger value='manage'>Manage</TabsTrigger>
          </TabsList>
          <TabsContent value='create'>
            <div className='space-y-3'>
              <Field label='Name' value={spaceName} onChange={setSpaceName} placeholder='e.g., Personal Space' />
              <div className='flex justify-end pt-2'>
                <Button onClick={handleCreateSpace}><Send className='h-4 w-4 mr-2' />Create</Button>
              </div>
            </div>
          </TabsContent>
          <TabsContent value='manage'>
            <div className='text-sm text-white/70'>(Wireframe) Membership/permissions section.</div>
          </TabsContent>
        </Tabs>
      </ModuleModal>

      {/* AI Chats */}
      <ModuleModal open={open === 'general_ai'} onOpenChange={() => setOpen(null)} title='General AI'>
        <Suspense fallback={<div className='p-6 text-sm text-white/70'>Loading chat…</div>}>
          <SmartChatInterface showHeader={false} forceMode='general' />
        </Suspense>
      </ModuleModal>
      <ModuleModal open={open === 'perplexity'} onOpenChange={() => setOpen(null)} title='Perplexity AI'>
        <Suspense fallback={<div className='p-6 text-sm text-white/70'>Loading chat…</div>}>
          <SmartChatInterface showHeader={false} forceMode='perplexity' />
        </Suspense>
      </ModuleModal>
      <ModuleModal open={open === 'gemini'} onOpenChange={() => setOpen(null)} title='Gemini AI'>
        <Suspense fallback={<div className='p-6 text-sm text-white/70'>Loading chat…</div>}>
          <SmartChatInterface showHeader={false} forceMode='gemini' />
        </Suspense>
      </ModuleModal>
    </div>
  );
}
