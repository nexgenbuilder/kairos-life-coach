import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Search, Sparkles, MessageSquare, Mail, Banknote, ReceiptText, CheckSquare, Calendar, Dumbbell, HeartPulse, Users, Bell, LayoutDashboard, Settings, Boxes, MapPin, Rss, Building } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useSound } from '@/hooks/useSound';
import {
  TasksWindow, MoneyWindow, ReceiptsWindow, SpacesWindow, MessagesWindow,
  CalendarWindow, FitnessWindow, HealthWindow, NotificationsWindow, FeedWindow, SettingsWindow, AssetsWindow, LocationsWindow,
  AIPerplexityWindow, AIGeminiWindow, BusinessWindow, ModuleKey
} from '@/components/command/ModuleWindows';

function CommandTile({ icon: Icon, label, subtitle, onClick }: any) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -2, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className='group rounded-2xl glass-card p-4 transition-all text-left'
    >
      <div className='flex items-center gap-3'>
        <div className='rounded-xl p-2 bg-white/10 group-hover:bg-white/20'>
          <Icon className='h-5 w-5 text-white' />
        </div>
        <div>
          <div className='font-medium leading-none text-white'>{label}</div>
          {subtitle ? <div className='text-xs text-white/70 mt-1'>{subtitle}</div> : null}
        </div>
      </div>
    </motion.button>
  );
}

export default function CommandCenterDashboard() {
  const [open, setOpen] = useState<ModuleKey | null>(null);
  const { play } = useSound();

  const tiles = useMemo(() => [
    { key: 'perplexity', label: 'Perplexity', icon: Search, subtitle: 'Live web answers', action: () => { play('ui'); setOpen('perplexity'); } },
    { key: 'gemini', label: 'Gemini', icon: Sparkles, subtitle: 'Google AI chat', action: () => { play('ui'); setOpen('gemini'); } },
    { key: 'messages', label: 'Messages', icon: MessageSquare, subtitle: 'Inbox / Compose', action: () => { play('ui'); setOpen('messages'); } },
    { key: 'tasks', label: 'Tasks', icon: CheckSquare, subtitle: 'Quick create / Plan day', action: () => { play('ui'); setOpen('tasks'); } },
    { key: 'money', label: 'Money', icon: Banknote, subtitle: 'Log expense / income', action: () => { play('ui'); setOpen('money'); } },
    { key: 'receipts', label: 'Receipts', icon: ReceiptText, subtitle: 'Scan & extract', action: () => { play('ui'); setOpen('receipts'); } },
    { key: 'business', label: 'Business', icon: Building, subtitle: 'Manage business', action: () => { play('ui'); setOpen('business'); } },
    { key: 'calendar', label: 'Calendar', icon: Calendar, subtitle: 'Schedule & view', action: () => { play('ui'); setOpen('calendar'); } },
    { key: 'fitness', label: 'Fitness', icon: Dumbbell, subtitle: 'Workouts & streaks', action: () => { play('ui'); setOpen('fitness'); } },
    { key: 'health', label: 'Health', icon: HeartPulse, subtitle: 'Vitals & habits', action: () => { play('ui'); setOpen('health'); } },
    { key: 'spaces', label: 'Spaces', icon: Users, subtitle: 'Create / manage', action: () => { play('ui'); setOpen('spaces'); } },
    { key: 'notifications', label: 'Notifications', icon: Bell, subtitle: 'Center & rules', action: () => { play('ui'); setOpen('notifications'); } },
    { key: 'feed', label: 'Feed', icon: Rss, subtitle: 'Shared spaces posts', action: () => { play('ui'); setOpen('feed'); } },
    { key: 'settings', label: 'Settings', icon: Settings, subtitle: 'Personal & org', action: () => { play('ui'); setOpen('settings'); } },
    { key: 'cloud', label: 'Cloud', icon: Boxes, subtitle: 'Files & media', action: () => { play('ui'); setOpen('cloud'); } },
    { key: 'locations', label: 'Locations', icon: MapPin, subtitle: 'Places & visits', action: () => { play('ui'); setOpen('locations'); } }
  ], [play]);

  return (
    <AppLayout>
    <div className='w-full mx-auto max-w-6xl px-4 md:px-6 py-6 space-y-6 bg-aurora min-h-[100svh] text-white'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <div className='rounded-xl p-2 glass-card'>
            <LayoutDashboard className='h-5 w-5 text-white' />
          </div>
          <div>
            <h1 className='text-xl font-semibold leading-tight text-white'>Command Center</h1>
            <p className='text-sm text-white/70'>One roof. One snapshot. Launch any workflow instantly.</p>
          </div>
        </div>
        <div className='hidden md:flex gap-2'>
          <Button variant='outline' onClick={() => { play('ui'); setOpen('messages'); }} className='glass-card text-white border-white/10 hover:bg-white/10'>
            <Mail className='h-4 w-4 mr-2' />Compose
          </Button>
          <Button onClick={() => { play('ui'); setOpen('tasks'); }} className='glass-card text-white border-white/10 hover:bg-white/10'>
            <CheckSquare className='h-4 w-4 mr-2' />Quick Task
          </Button>
        </div>
      </div>

      <Card className='border-0 bg-transparent shadow-none'>
        <CardHeader className='pb-2'>
          <CardTitle className='text-base text-white'>Controls</CardTitle>
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
          <h2 className='text-base font-semibold text-white'>Quick Overview</h2>
          <Button variant='ghost' size='sm' className='text-white/70 hover:text-white hover:bg-white/10'>Customize</Button>
        </div>
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3'>
          {[
            { key:'today', title: 'Today', value:'0/0', foot:'tasks', openKey:'tasks' as ModuleKey },
            { key:'spend', title:'Spend This Week', value:'$0', foot:'this week', openKey:'money' as ModuleKey },
            { key:'leads', title:'Leads', value:'4', foot:'active', openKey:'messages' as ModuleKey },
            { key:'fitness', title:'Fitness Streak', value:'0', foot:'days', openKey:'fitness' as ModuleKey },
            { key:'content', title:'Content Performance', value:'0', foot:'views', openKey:'cloud' as ModuleKey },
            { key:'notifs', title:'Notifications', value:'2', foot:'unread', openKey:'notifications' as ModuleKey }
          ].map(c => (
            <button key={c.key} onClick={()=>{ play('ui'); setOpen(c.openKey); }} className='rounded-2xl w-full text-left'>
              <Card className='bg-black/40 backdrop-blur-sm border-white/20 rounded-2xl h-full hover:bg-black/50 hover:border-white/30 transition-all'>
                <CardContent className='p-4'>
                  <div className='text-xs font-semibold text-white mb-1'>{c.title}</div>
                  <div className='text-2xl font-bold text-white mb-1'>{c.value}</div>
                  <div className='text-xs text-white/90'>{c.foot}</div>
                </CardContent>
              </Card>
            </button>
          ))}
        </div>
      </section>

    </div>

    {/* Attach windows (modals) for every module */}
    <TasksWindow open={open==='tasks'} onOpenChange={()=>setOpen(null)} />
    <MoneyWindow open={open==='money'} onOpenChange={()=>setOpen(null)} />
    <ReceiptsWindow open={open==='receipts'} onOpenChange={()=>setOpen(null)} />
    <BusinessWindow open={open==='business'} onOpenChange={()=>setOpen(null)} />
    <SpacesWindow open={open==='spaces'} onOpenChange={()=>setOpen(null)} />
    <MessagesWindow open={open==='messages'} onOpenChange={()=>setOpen(null)} />
    <CalendarWindow open={open==='calendar'} onOpenChange={()=>setOpen(null)} />
    <FitnessWindow open={open==='fitness'} onOpenChange={()=>setOpen(null)} />
    <HealthWindow open={open==='health'} onOpenChange={()=>setOpen(null)} />
    <NotificationsWindow open={open==='notifications'} onOpenChange={()=>setOpen(null)} />
    <FeedWindow open={open==='feed'} onOpenChange={()=>setOpen(null)} />
    <SettingsWindow open={open==='settings'} onOpenChange={()=>setOpen(null)} />
    <AssetsWindow open={open==='cloud'} onOpenChange={()=>setOpen(null)} />
    <LocationsWindow open={open==='locations'} onOpenChange={()=>setOpen(null)} />
    <AIPerplexityWindow open={open==='perplexity'} onOpenChange={()=>setOpen(null)} />
    <AIGeminiWindow open={open==='gemini'} onOpenChange={()=>setOpen(null)} />
    </AppLayout>
  );
}
