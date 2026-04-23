import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Flame, Shield, Award, HeartHandshake, BatteryCharging, Edit2, Swords, Crown, Moon, Sun, X, Check, Calendar as CalendarIcon, Trash } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { triggerHaptic, triggerConfetti, cn } from '@/src/lib/utils';
import { useAppStore } from '@/src/store';
import { subDays, format } from 'date-fns';

const ICONS: Record<string, React.ReactNode> = {
  users: <Users className="w-8 h-8" />,
  shield: <Shield className="w-8 h-8" />,
  flame: <Flame className="w-8 h-8" />,
  swords: <Swords className="w-8 h-8" />,
  crown: <Crown className="w-8 h-8" />,
  moon: <Moon className="w-8 h-8" />,
  sun: <Sun className="w-8 h-8" />
};

const COLORS = [
  { id: 'bg-surface-primary', render: 'bg-surface-primary text-text-primary border-border-subtle' },
  { id: 'bg-accent', render: 'bg-accent text-white border-transparent' },
  { id: 'bg-rpg-secondary', render: 'bg-rpg-secondary text-white border-transparent' },
  { id: 'bg-rpg-warning', render: 'bg-rpg-warning text-white border-transparent' },
  { id: 'bg-[#1E1E1E]', render: 'bg-[#1E1E1E] text-white border-transparent' },
];

const FONT_SIZES = [
  { id: 'text-2xl', label: 'Small' },
  { id: 'text-4xl', label: 'Medium' },
  { id: 'text-6xl', label: 'Large' },
];

const FONT_COLORS = [
  { id: '', render: 'Default', bg: 'bg-gray-400' }, // Inherits from parent banner color
  { id: 'text-white', render: 'White', bg: 'bg-white' },
  { id: 'text-text-primary', render: 'Dark', bg: 'bg-rpg-text' },
  { id: 'text-[#D4A373]', render: 'Gold', bg: 'bg-[#D4A373]' },
  { id: 'text-accent', render: 'Emerald', bg: 'bg-accent' },
];

export default function GuildDashboard() {
  const { stats, habits, guild, updateGuildSettings, claimVanguardReward } = useAppStore();
  const [isEditingBanner, setIsEditingBanner] = useState(false);

  const handleNudge = () => {
    triggerHaptic('success');
  };

  const today = new Date();

  // Calculate user's workouts in the last 7 days
  const myWorkouts = useMemo(() => {
    const last7Days = Array.from({ length: 7 }).map((_, i) => format(subDays(today, i), 'yyyy-MM-dd'));
    
    let count = 0;
    habits.forEach(habit => {
      if (habit.resourceReward === 'strength') {
        count += habit.completions.filter(c => last7Days.includes(c.date)).length;
      }
    });
    return count;
  }, [habits]);

  // Mock team contributions from Elena and Marcus
  const teamContributions = 9;
  const totalCompleted = Math.min(50, myWorkouts + teamContributions);
  const goalTarget = 50;
  const progressRatio = totalCompleted / goalTarget;

  const currentSettings = guild || { name: 'The Night Owls', icon: 'users', color: 'bg-surface-primary', fontSize: 'text-4xl', fontColor: '', events: [] };
  const bannerColorStyle = COLORS.find(c => c.id === currentSettings.color)?.render || 'bg-surface-primary text-text-primary';

  const [bannerDraft, setBannerDraft] = useState(currentSettings);

  const handleSaveBanner = () => {
    triggerHaptic('success');
    updateGuildSettings(bannerDraft);
    setIsEditingBanner(false);
  };

  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', description: '', date: format(today, 'yyyy-MM-dd'), time: '12:00' });
  const { addGuildEvent, removeGuildEvent } = useAppStore();

  const handleCreateEvent = () => {
    if (!newEvent.title) return;
    addGuildEvent(newEvent);
    setNewEvent({ title: '', description: '', date: format(today, 'yyyy-MM-dd'), time: '12:00' });
    setIsCreatingEvent(false);
    triggerHaptic('success');
  };

  const podMembers = [
    {
      id: 'me',
      name: 'You',
      level: stats.level,
      status: 'Active now',
      avatarColor: 'bg-accent',
      contributions: myWorkouts,
      canNudge: false,
    },
    {
      id: 'elena',
      name: 'Elena R.',
      level: 14,
      status: 'Last seen 2h ago',
      avatarColor: 'bg-[#D4A373]',
      contributions: 8,
      canNudge: true,
    },
    {
      id: 'marcus',
      name: 'Marcus V.',
      level: 22,
      status: 'Last seen 1d ago',
      avatarColor: 'bg-[#8C8A82]',
      contributions: 1,
      canNudge: true,
    }
  ];

  // Sort descending by contributions, tie-break by level
  const sortedMembers = [...podMembers].sort((a, b) => b.contributions - a.contributions || b.level - a.level);

  return (
    <div className="p-6 md:p-12 w-full max-w-4xl mx-auto min-h-screen text-text-primary safe-area-bottom relative">
      
      {/* Banner Editing Modal — Radix Dialog for guaranteed focus trap + scroll lock + portal */}
      <Dialog.Root open={isEditingBanner} onOpenChange={setIsEditingBanner}>
        <Dialog.Portal>
          <Dialog.Overlay asChild>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-md z-[60]"
            />
          </Dialog.Overlay>
          <Dialog.Content asChild onOpenAutoFocus={(e) => e.preventDefault()}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface-primary border border-border-subtle p-8 rounded-[32px] shadow-2xl z-[70] w-full max-w-md max-h-[90vh] overflow-y-auto"
            >
               <div className="flex justify-between items-center mb-6">
                 <Dialog.Title className="font-serif italic text-2xl text-text-primary">Guild Banner</Dialog.Title>
                 <Dialog.Close asChild>
                   <button className="p-2 hover:bg-surface-secondary rounded-full transition-colors text-text-secondary hover:text-text-primary">
                     <X className="w-5 h-5"/>
                   </button>
                 </Dialog.Close>
               </div>

               <div className="space-y-6">
                 <div>
                   <label className="text-xs uppercase tracking-widest text-text-secondary font-bold block mb-2">Guild Name</label>
                   <input 
                     value={bannerDraft.name}
                     onChange={(e) => setBannerDraft(prev => ({...prev, name: e.target.value}))}
                     className="w-full bg-surface-secondary/30 border border-border-subtle px-4 py-3 rounded-2xl outline-none focus:border-accent transition-colors font-medium text-lg text-text-primary"
                     placeholder="Name your pod..."
                   />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="text-xs uppercase tracking-widest text-text-secondary font-bold block mb-2">Text Size</label>
                     <div className="flex bg-surface-secondary/30 rounded-2xl p-1 border border-border-subtle">
                       {FONT_SIZES.map(sz => (
                         <button 
                           key={sz.id}
                           onClick={() => setBannerDraft(prev => ({...prev, fontSize: sz.id}))}
                           className={cn("flex-1 py-2 rounded-xl text-xs font-bold transition-all", (bannerDraft.fontSize || 'text-4xl') === sz.id ? 'bg-surface-primary shadow-sm text-text-primary text-sm' : 'text-text-secondary hover:bg-surface-primary/50')}
                         >
                           {sz.label}
                         </button>
                       ))}
                     </div>
                   </div>
                   
                   <div>
                     <label className="text-xs uppercase tracking-widest text-text-secondary font-bold block mb-2">Text Color</label>
                     <div className="flex gap-2 bg-surface-secondary/30 rounded-2xl p-2 border border-border-subtle items-center justify-between h-[46px]">
                       {FONT_COLORS.map(c => (
                         <button 
                           key={c.id} 
                           title={c.render}
                           onClick={() => setBannerDraft(prev => ({...prev, fontColor: c.id}))}
                           className={cn("w-6 h-6 rounded-full border border-black/20 shadow-sm transition-all", c.bg, (bannerDraft.fontColor || '') === c.id ? 'scale-125 ring-2 ring-accent ring-offset-1' : 'hover:scale-110')}
                         />
                       ))}
                     </div>
                   </div>
                 </div>

                 <div>
                   <label className="text-xs uppercase tracking-widest text-text-secondary font-bold block mb-2">Banner Background</label>
                   <div className="flex gap-3">
                     {COLORS.map(c => (
                       <button 
                         key={c.id} 
                         onClick={() => setBannerDraft(prev => ({...prev, color: c.id}))}
                         className={cn("w-10 h-10 rounded-full border-2 transition-all", c.id, bannerDraft.color === c.id ? 'border-text-primary scale-110' : 'border-transparent hover:scale-105')}
                       />
                     ))}
                   </div>
                 </div>

                 <div>
                   <label className="text-xs uppercase tracking-widest text-text-secondary font-bold block mb-2">Sigil</label>
                   <div className="grid grid-cols-4 gap-3">
                     {Object.keys(ICONS).map(iconKey => (
                       <button
                         key={iconKey}
                         onClick={() => setBannerDraft(prev => ({...prev, icon: iconKey}))}
                         className={cn("p-4 rounded-2xl flex items-center justify-center transition-all border", bannerDraft.icon === iconKey ? 'bg-accent/10 border-accent text-accent' : 'bg-transparent border-border-subtle text-text-secondary hover:bg-surface-secondary/30')}
                       >
                         {React.cloneElement(ICONS[iconKey] as React.ReactElement, { className: 'w-6 h-6' })}
                       </button>
                     ))}
                   </div>
                 </div>

                 <button 
                   onClick={handleSaveBanner}
                   className="w-full bg-text-primary text-surface-primary py-4 rounded-2xl font-bold mt-4 hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                 >
                   <Check className="w-5 h-5"/> Save Banner
                 </button>
               </div>
            </motion.div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Dynamic Banner Header */}
      <div className={cn("rounded-[32px] p-8 mb-10 border shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden group transition-all duration-500", bannerColorStyle)}>
        <div className="relative z-10 flex items-center gap-6">
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md shadow-inner">
             {ICONS[currentSettings.icon] || <Users className="w-8 h-8" />}
          </div>
          <div>
            <h1 className={cn("font-serif italic transition-all duration-300", currentSettings.fontSize || 'text-4xl', currentSettings.fontColor || '')}>{currentSettings.name}</h1>
            <p className="opacity-80 text-sm mt-1 font-bold tracking-widest uppercase">Co-op Pod</p>
          </div>
        </div>
        
        <div className="relative z-10 flex flex-col items-end gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/5 shadow-sm">
            <Users className="w-5 h-5 opacity-80" />
            <span className="font-bold">3 / 5 online</span>
          </div>
          <button 
            onClick={() => setIsEditingBanner(true)}
            className="text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-black/10 px-3 py-1.5 rounded-full hover:bg-black/20"
          >
            <Edit2 className="w-3 h-3" /> Customize Banner
          </button>
        </div>
      </div>

      <div className="bg-surface-primary border border-border-subtle p-8 rounded-[32px] shadow-sm mb-10 relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-[#D4A373]/5 rounded-full blur-3xl" />

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-accent/10 rounded-2xl">
                <Flame className="w-7 h-7 text-accent" />
              </div>
              <div>
                <h3 className="font-serif italic text-2xl">Weekly Vanguard Goal</h3>
                <p className="text-text-secondary text-sm mt-1">Complete <span className="font-bold text-text-primary">{goalTarget}</span> total workout habits as a pod this week.</p>
              </div>
            </div>
            
            {/* Reward Badge */}
            <div className={cn(
              "flex items-center gap-3 border px-5 py-3 rounded-2xl transition-all",
              stats.vanguardRewardClaimed 
                ? "bg-text-secondary/5 border-text-secondary/20 grayscale" 
                : "bg-amber-500/10 border-amber-500/20"
            )}>
              <div className={cn("p-2 rounded-xl", stats.vanguardRewardClaimed ? "bg-text-secondary/20" : "bg-amber-500/20")}>
                <Flame className={cn("w-5 h-5", stats.vanguardRewardClaimed ? "text-text-secondary" : "text-amber-500")} />
              </div>
              <div>
                <p className={cn("text-xs font-bold uppercase tracking-widest", stats.vanguardRewardClaimed ? "text-text-secondary" : "text-amber-500")}>Reward</p>
                <p className="text-sm font-bold text-text-primary">Phoenix Root × 1</p>
              </div>
              {progressRatio >= 1 && !stats.vanguardRewardClaimed && (
                <motion.button
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    claimVanguardReward();
                    triggerHaptic('success');
                    triggerConfetti(window.innerWidth / 2, window.innerHeight / 2);
                  }}
                  className="ml-4 bg-amber-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-lg shadow-amber-500/20"
                >
                  CLAIM
                </motion.button>
              )}
              {stats.vanguardRewardClaimed && (
                <div className="ml-4 flex items-center gap-1 text-text-secondary text-[10px] font-bold">
                  <Check className="w-3 h-3" /> CLAIMED
                </div>
              )}
            </div>
          </div>

          {/* Progress Section */}
          <div className="mb-4">
            <div className="flex justify-between items-baseline mb-3">
              <span className="text-2xl font-bold text-text-primary">{totalCompleted}<span className="text-lg text-text-secondary font-normal"> / {goalTarget}</span></span>
              <span className="text-sm font-bold text-accent">{Math.round(progressRatio * 100)}%</span>
            </div>

            {/* Premium Progress Bar */}
            <div className="w-full bg-surface-secondary rounded-full h-5 relative overflow-hidden">
              {/* Milestone markers */}
              <div className="absolute inset-0 z-10 flex items-center">
                {[25, 50, 75].map(pct => (
                  <div key={pct} className="absolute h-full w-px bg-white/40" style={{ left: `${pct}%` }} />
                ))}
              </div>

              {/* Animated fill */}
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progressRatio * 100, 100)}%` }}
                transition={{ type: "spring", stiffness: 40, damping: 15, duration: 1.5 }}
                className="h-full rounded-full relative overflow-hidden"
                style={{ background: 'linear-gradient(90deg, #10B981, #34D399, #6EE7B7)' }}
              >
                {/* Inner shimmer */}
                <div className="absolute inset-0 bg-white/20 w-full h-full animate-[pulse_2s_infinite]" />
                
                {/* Glowing edge */}
                <div className="absolute right-0 top-0 h-full w-4 bg-gradient-to-r from-transparent to-white/50 blur-sm" />
              </motion.div>
            </div>

            {/* Milestone labels */}
            <div className="flex justify-between mt-2 px-1">
              {[0, 25, 50, 75, 100].map(pct => (
                <span 
                  key={pct} 
                  className={cn(
                    "text-[10px] font-bold transition-colors",
                    progressRatio * 100 >= pct ? "text-accent" : "text-text-secondary/60"
                  )}
                >
                  {Math.round(goalTarget * pct / 100)}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
        <div>
          <h3 className="text-[10px] uppercase tracking-[0.2em] text-text-secondary font-bold mb-4 px-2">Fellow Gardeners</h3>
          <div className="space-y-4">
            {sortedMembers.map((member, idx) => (
              <GuildMember
                 key={member.id}
                 name={member.name}
                 level={member.level}
                 status={member.status}
                 avatarColor={member.avatarColor}
                 contributions={member.contributions}
                 canNudge={member.canNudge}
                 onNudge={handleNudge}
                 delay={0.1 + (idx * 0.1)}
                 rank={idx + 1}
              />
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-4 px-2">
            <h3 className="text-[10px] uppercase tracking-[0.2em] text-text-secondary font-bold flex items-center gap-2">
              <CalendarIcon className="w-3 h-3 text-text-primary" /> Pod Calendar
            </h3>
            <button 
              onClick={() => setIsCreatingEvent(!isCreatingEvent)}
              className="text-[10px] uppercase tracking-widest text-accent font-bold hover:underline"
            >
              {isCreatingEvent ? 'Cancel' : '+ Schedule'}
            </button>
          </div>

          <AnimatePresence mode="popLayout">
            {isCreatingEvent && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="bg-surface-primary border border-border-subtle p-5 rounded-3xl shadow-sm mb-4"
              >
                <input 
                  value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                  className="w-full bg-surface-secondary/30 border border-border-subtle px-3 py-2 rounded-xl text-sm outline-none mb-3"
                  placeholder="Event Title..."
                />
                <input 
                  value={newEvent.description} onChange={e => setNewEvent({...newEvent, description: e.target.value})}
                  className="w-full bg-surface-secondary/30 border border-border-subtle px-3 py-2 rounded-xl text-sm outline-none mb-3"
                  placeholder="Description..."
                />
                <div className="flex gap-3 mb-4">
                  <input 
                    type="date" value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})}
                    className="flex-1 bg-surface-secondary/30 border border-border-subtle px-3 py-2 rounded-xl text-sm outline-none text-text-secondary"
                  />
                  <input 
                    type="time" value={newEvent.time} onChange={e => setNewEvent({...newEvent, time: e.target.value})}
                    className="w-32 bg-surface-secondary/30 border border-border-subtle px-3 py-2 rounded-xl text-sm outline-none text-text-secondary"
                  />
                </div>
                <button 
                  onClick={handleCreateEvent}
                  className="w-full bg-accent text-white font-bold py-2 rounded-xl text-sm hover:opacity-90 transition-opacity"
                >
                  Create Event
                </button>
              </motion.div>
            )}

            {(currentSettings.events || []).map(evt => (
              <motion.div 
                key={evt.id}
                layout
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                className="bg-surface-primary border border-border-subtle p-5 rounded-3xl shadow-sm mb-4 group"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-md inline-block w-max mb-1">
                      {format(new Date(evt.date + 'T' + evt.time), 'MMM do')} • {evt.time}
                    </span>
                    <h4 className="font-bold text-text-primary">{evt.title}</h4>
                  </div>
                  <button 
                    onClick={() => removeGuildEvent(evt.id)}
                    className="p-2 text-text-secondary opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
                {evt.description && <p className="text-xs text-text-secondary">{evt.description}</p>}
              </motion.div>
            ))}
            
            {(currentSettings.events || []).length === 0 && !isCreatingEvent && (
              <div className="bg-surface-primary border border-border-subtle p-8 rounded-3xl text-center text-text-secondary">
                No events currently scheduled.
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

    </div>
  );
}

function GuildMember({ name, level, status, avatarColor, contributions, canNudge, onNudge, delay = 0, rank }: any) {
  const [nudged, setNudged] = React.useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      className="bg-surface-primary border border-border-subtle p-4 rounded-3xl flex items-center justify-between shadow-sm"
    >
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-inner ${avatarColor}`}>
          {name.charAt(0)}
        </div>
        <div>
          <div className="font-bold flex items-center gap-2">
            <span className={cn(
              "text-[10px] px-2 py-0.5 rounded-full border uppercase tracking-widest",
              rank === 1 ? 'border-[#D4A373] text-[#D4A373] bg-[#D4A373]/10' : 
              rank === 2 ? 'border-[#8C8A82] text-text-secondary bg-[#8C8A82]/10' : 
              rank === 3 ? 'border-[#C17F59] text-[#C17F59] bg-[#C17F59]/10' : 
              'border-transparent bg-surface-secondary text-text-secondary'
            )}>
              #{rank} {rank === 1 && <Crown className="w-3 h-3 inline-block ml-0.5 -mt-0.5" />}
            </span>
            {name}
            <span className="text-[10px] bg-surface-secondary/50 text-text-secondary px-2 py-0.5 rounded-full font-bold">Lvl {level}</span>
          </div>
          <div className="text-xs text-text-secondary mt-0.5">{status}</div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-right hidden sm:block">
          <div className="text-lg font-bold text-accent">{contributions}</div>
          <div className="text-[10px] uppercase tracking-widest text-text-secondary">Contributions</div>
        </div>
        
        {canNudge && (
          <button 
             onClick={() => {
                if (!nudged) {
                  setNudged(true);
                  if (onNudge) onNudge();
                }
             }}
             disabled={nudged}
             className={`p-3 rounded-2xl transition-all flex items-center justify-center ${nudged ? 'bg-surface-secondary text-text-secondary cursor-not-allowed' : 'bg-accent/10 text-accent hover:bg-accent hover:text-white'}`}
          >
             {nudged ? <HeartHandshake className="w-5 h-5" /> : <BatteryCharging className="w-5 h-5" />}
          </button>
        )}
      </div>
    </motion.div>
  )
}
