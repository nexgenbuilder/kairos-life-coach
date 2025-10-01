import React, { Suspense, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useSound } from '@/hooks/useSound';
import { createTaskQuick, logExpenseQuick, logIncomeQuick, scanReceiptQuick, createSpaceQuick } from '@/lib/command-actions';

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
  const [title, setTitle] = useState('');
  const [due, setDue] = useState('');
  const [notes, setNotes] = useState('');
  const { toast } = useToast();
  const { play } = useSound();
  
  async function save(){
    try {
      await createTaskQuick({ title, due_date: due || undefined, notes: notes || undefined });
      toast({ title: 'Task created successfully' });
      play('success');
      setTitle('');
      setDue('');
      setNotes('');
    } catch(e:any){
      toast({ title: 'Failed to create task', description: e.message, variant: 'destructive' });
      play('warn');
    }
  }
  
  return (
    <ModuleWindow open={props.open} onOpenChange={props.onOpenChange} title='Tasks'>
      <div className='space-y-4'>
        <div className='grid gap-2'>
          <Label className='text-muted'>Title</Label>
          <Input 
            value={title} 
            onChange={(e)=>setTitle(e.target.value)} 
            placeholder='e.g., Call supplier at 3pm'
            className='glass-soft border-white/10'
          />
        </div>
        <div className='grid gap-2'>
          <Label className='text-muted'>Due Date</Label>
          <Input 
            type='date' 
            value={due} 
            onChange={(e)=>setDue(e.target.value)}
            className='glass-soft border-white/10'
          />
        </div>
        <div className='grid gap-2'>
          <Label className='text-muted'>Notes</Label>
          <Textarea 
            value={notes} 
            onChange={(e)=>setNotes(e.target.value)} 
            placeholder='Optional details'
            className='glass-soft border-white/10 min-h-[100px]'
          />
        </div>
        <div className='flex justify-end pt-2'>
          <Button onClick={save} disabled={!title}>Save Task</Button>
        </div>
      </div>
    </ModuleWindow>
  );
}

export function MoneyWindow(props: { open: boolean; onOpenChange: (v:boolean)=>void }){
  const [ea, setEa] = useState('');
  const [ed, setEd] = useState('');
  const [ec, setEc] = useState('');
  const [ia, setIa] = useState('');
  const [id, setId] = useState('');
  const { toast } = useToast();
  const { play } = useSound();
  
  async function saveExpense(){
    try {
      await logExpenseQuick({ amount: Number(ea||0), description: ed||undefined, category: ec||undefined });
      toast({ title: 'Expense logged successfully' });
      play('success');
      setEa('');
      setEd('');
      setEc('');
    } catch(e:any){
      toast({ title: 'Failed to log expense', description: e.message, variant: 'destructive' });
      play('warn');
    }
  }
  
  async function saveIncome(){
    try {
      await logIncomeQuick({ amount: Number(ia||0), description: id||undefined });
      toast({ title: 'Income logged successfully' });
      play('success');
      setIa('');
      setId('');
    } catch(e:any){
      toast({ title: 'Failed to log income', description: e.message, variant: 'destructive' });
      play('warn');
    }
  }
  
  return (
    <ModuleWindow open={props.open} onOpenChange={props.onOpenChange} title='Money'>
      <Tabs defaultValue='expense'>
        <TabsList className='glass-soft w-full'>
          <TabsTrigger value='expense' className='flex-1'>Log Expense</TabsTrigger>
          <TabsTrigger value='income' className='flex-1'>Log Income</TabsTrigger>
        </TabsList>
        <TabsContent value='expense' className='mt-4'>
          <div className='space-y-4'>
            <div className='grid gap-2'>
              <Label className='text-muted'>Amount</Label>
              <Input 
                type='number' 
                step='0.01'
                value={ea} 
                onChange={(e)=>setEa(e.target.value)} 
                placeholder='0.00'
                className='glass-soft border-white/10'
              />
            </div>
            <div className='grid gap-2'>
              <Label className='text-muted'>Description</Label>
              <Input 
                value={ed} 
                onChange={(e)=>setEd(e.target.value)} 
                placeholder='What did you buy?'
                className='glass-soft border-white/10'
              />
            </div>
            <div className='grid gap-2'>
              <Label className='text-muted'>Category</Label>
              <Input 
                value={ec} 
                onChange={(e)=>setEc(e.target.value)} 
                placeholder='e.g., Food, Transport'
                className='glass-soft border-white/10'
              />
            </div>
            <div className='flex justify-end pt-2'>
              <Button onClick={saveExpense} disabled={!ea}>Save Expense</Button>
            </div>
          </div>
        </TabsContent>
        <TabsContent value='income' className='mt-4'>
          <div className='space-y-4'>
            <div className='grid gap-2'>
              <Label className='text-muted'>Amount</Label>
              <Input 
                type='number' 
                step='0.01'
                value={ia} 
                onChange={(e)=>setIa(e.target.value)} 
                placeholder='0.00'
                className='glass-soft border-white/10'
              />
            </div>
            <div className='grid gap-2'>
              <Label className='text-muted'>Source</Label>
              <Input 
                value={id} 
                onChange={(e)=>setId(e.target.value)} 
                placeholder='Where did it come from?'
                className='glass-soft border-white/10'
              />
            </div>
            <div className='flex justify-end pt-2'>
              <Button onClick={saveIncome} disabled={!ia}>Save Income</Button>
            </div>
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
  const [name, setName] = useState('');
  const { toast } = useToast();
  const { play } = useSound();
  
  async function create(){
    try {
      await createSpaceQuick({ name });
      toast({ title: 'Space created successfully' });
      play('success');
      setName('');
    } catch(e:any){
      toast({ title: 'Failed to create space', description: e.message, variant: 'destructive' });
      play('warn');
    }
  }
  
  return (
    <ModuleWindow open={props.open} onOpenChange={props.onOpenChange} title='Spaces'>
      <Tabs defaultValue='create'>
        <TabsList className='glass-soft w-full'>
          <TabsTrigger value='create' className='flex-1'>Create New</TabsTrigger>
          <TabsTrigger value='view' className='flex-1'>My Spaces</TabsTrigger>
        </TabsList>
        <TabsContent value='create' className='mt-4'>
          <div className='space-y-4'>
            <div className='grid gap-2'>
              <Label className='text-muted'>Space Name</Label>
              <Input 
                value={name} 
                onChange={(e)=>setName(e.target.value)} 
                placeholder='e.g., Personal Space, Work Team'
                className='glass-soft border-white/10'
              />
            </div>
            <div className='flex justify-end pt-2'>
              <Button onClick={create} disabled={!name}>Create Space</Button>
            </div>
          </div>
        </TabsContent>
        <TabsContent value='view' className='mt-4'>
          <div className='text-soft text-sm'>
            <p>Your spaces will appear here once created.</p>
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
