import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Flame, Shield, Award, HeartHandshake, BatteryCharging, Edit2, Swords, Crown, Moon, Sun, X, Check, Calendar as CalendarIcon, Trash } from 'lucide-react';
import { triggerHaptic, cn } from '@/src/lib/utils';
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
  { id: 'bg-rpg-surface', render: 'bg-rpg-surface text-rpg-text border-rpg-border' },
  { id: 'bg-rpg-primary', render: 'bg-rpg-primary text-white border-transparent' },
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
  { id: 'text-rpg-text', render: 'Dark', bg: 'bg-rpg-text' },
  { id: 'text-[#D4A373]', render: 'Gold', bg: 'bg-[#D4A373]' },
  { id: 'text-rpg-primary', render: 'Emerald', bg: 'bg-rpg-primary' },
];

export default function GuildDashboard() {
  const { stats, habits, guild, updateGuildSettings } = useAppStore();
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
        count += habit.completions.filter(dateStr => last7Days.includes(dateStr)).length;
      }
    });
    return count;
  }, [habits]);

  // Mock team contributions from Elena and Marcus
  const teamContributions = 9;
  const totalCompleted = Math.min(50, myWorkouts + teamContributions);
  const goalTarget = 50;
  const progressRatio = totalCompleted / goalTarget;

  const currentSettings = guild || { name: 'The Night Owls', icon: 'users', color: 'bg-rpg-surface', fontSize: 'text-4xl', fontColor: '', events: [] };
  const bannerColorStyle = COLORS.find(c => c.id === currentSettings.color)?.render || 'bg-rpg-surface text-rpg-text';

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
      avatarColor: 'bg-rpg-primary',
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
    <div className="p-6 md:p-12 w-full max-w-4xl mx-auto min-h-screen text-rpg-text pb-32 relative">
      
      {/* Banner Editing Modal */}
      <AnimatePresence>
        {isEditingBanner && (
          <>
             <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
               onClick={() => setIsEditingBanner(false)}
             />
             <motion.div
               initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-rpg-surface border border-rpg-border p-8 rounded-[32px] shadow-2xl z-50 w-full max-w-md"
             >
               <div className="flex justify-between items-center mb-6">
                 <h2 className="font-serif italic text-2xl">Guild Banner</h2>
                 <button onClick={() => setIsEditingBanner(false)} className="p-2 hover:bg-[#E5E2D9] rounded-full transition-colors"><X className="w-5 h-5"/></button>
               </div>

               <div className="space-y-6">
                 <div>
                   <label className="text-xs uppercase tracking-widest text-[#8C8A82] font-bold block mb-2">Guild Name</label>
                   <input 
                     value={bannerDraft.name}
                     onChange={(e) => setBannerDraft(prev => ({...prev, name: e.target.value}))}
                     className="w-full bg-[#E5E2D9]/30 border border-rpg-border px-4 py-3 rounded-2xl outline-none focus:border-rpg-primary transition-colors font-medium text-lg"
                     placeholder="Name your pod..."
                   />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="text-xs uppercase tracking-widest text-[#8C8A82] font-bold block mb-2">Text Size</label>
                     <div className="flex bg-[#E5E2D9]/30 rounded-2xl p-1 border border-rpg-border">
                       {FONT_SIZES.map(sz => (
                         <button 
                           key={sz.id}
                           onClick={() => setBannerDraft(prev => ({...prev, fontSize: sz.id}))}
                           className={cn("flex-1 py-2 rounded-xl text-xs font-bold transition-all", (bannerDraft.fontSize || 'text-4xl') === sz.id ? 'bg-white shadow-sm text-rpg-text text-sm' : 'text-[#8C8A82] hover:bg-white/50')}
                         >
                           {sz.label}
                         </button>
                       ))}
                     </div>
                   </div>
                   
                   <div>
                     <label className="text-xs uppercase tracking-widest text-[#8C8A82] font-bold block mb-2">Text Color</label>
                     <div className="flex gap-2 bg-[#E5E2D9]/30 rounded-2xl p-2 border border-rpg-border items-center justify-between h-[46px]">
                       {FONT_COLORS.map(c => (
                         <button 
                           key={c.id} 
                           title={c.render}
                           onClick={() => setBannerDraft(prev => ({...prev, fontColor: c.id}))}
                           className={cn("w-6 h-6 rounded-full border border-black/20 shadow-sm transition-all", c.bg, (bannerDraft.fontColor || '') === c.id ? 'scale-125 ring-2 ring-rpg-primary ring-offset-1' : 'hover:scale-110')}
                         />
                       ))}
                     </div>
                   </div>
                 </div>

                 <div>
                   <label className="text-xs uppercase tracking-widest text-[#8C8A82] font-bold block mb-2">Banner Background</label>
                   <div className="flex gap-3">
                     {COLORS.map(c => (
                       <button 
                         key={c.id} 
                         onClick={() => setBannerDraft(prev => ({...prev, color: c.id}))}
                         className={cn("w-10 h-10 rounded-full border-2 transition-all", c.id, bannerDraft.color === c.id ? 'border-rpg-text scale-110' : 'border-transparent hover:scale-105')}
                       />
                     ))}
                   </div>
                 </div>

                 <div>
                   <label className="text-xs uppercase tracking-widest text-[#8C8A82] font-bold block mb-2">Sigil</label>
                   <div className="grid grid-cols-4 gap-3">
                     {Object.keys(ICONS).map(iconKey => (
                       <button
                         key={iconKey}
                         onClick={() => setBannerDraft(prev => ({...prev, icon: iconKey}))}
                         className={cn("p-4 rounded-2xl flex items-center justify-center transition-all border", bannerDraft.icon === iconKey ? 'bg-rpg-primary/10 border-rpg-primary text-rpg-primary' : 'bg-transparent border-[#E5E2D9] text-[#8C8A82] hover:bg-[#E5E2D9]/30')}
                       >
                         {React.cloneElement(ICONS[iconKey] as React.ReactElement, { className: 'w-6 h-6' })}
                       </button>
                     ))}
                   </div>
                 </div>

                 <button 
                   onClick={handleSaveBanner}
                   className="w-full bg-rpg-text text-rpg-surface py-4 rounded-2xl font-bold mt-4 hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                 >
                   <Check className="w-5 h-5"/> Save Banner
                 </button>
               </div>
             </motion.div>
          </>
        )}
      </AnimatePresence>

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

      <div className="bg-rpg-surface border border-rpg-border p-8 rounded-[32px] shadow-sm mb-10">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-serif italic text-2xl flex items-center gap-2">
            <Flame className="w-6 h-6 text-rpg-primary" /> Weekly Vanguard Goal
          </h3>
          <span className="text-[#8C8A82] text-sm font-bold">{totalCompleted} / {goalTarget} Workouts</span>
        </div>
        
        <p className="text-[#8C8A82] text-sm mb-6">If the pod completes 50 total workout habits this week, everyone receives a Phoenix Root.</p>
        
        <div className="w-full bg-[#E5E2D9] rounded-full h-6 relative overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progressRatio * 100}%` }}
            transition={{ type: "spring", stiffness: 50, duration: 1.5 }}
            className="h-full rounded-full bg-rpg-primary relative overflow-hidden"
          >
             <div className="absolute inset-0 bg-white/20 w-full h-full animate-[pulse_2s_infinite]"></div>
          </motion.div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
        <div>
          <h3 className="text-[10px] uppercase tracking-[0.2em] text-[#8C8A82] font-bold mb-4 px-2">Fellow Gardeners</h3>
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
            <h3 className="text-[10px] uppercase tracking-[0.2em] text-[#8C8A82] font-bold flex items-center gap-2">
              <CalendarIcon className="w-3 h-3 text-rpg-text" /> Pod Calendar
            </h3>
            <button 
              onClick={() => setIsCreatingEvent(!isCreatingEvent)}
              className="text-[10px] uppercase tracking-widest text-rpg-primary font-bold hover:underline"
            >
              {isCreatingEvent ? 'Cancel' : '+ Schedule'}
            </button>
          </div>

          <AnimatePresence mode="popLayout">
            {isCreatingEvent && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="bg-rpg-surface border border-rpg-border p-5 rounded-3xl shadow-sm mb-4"
              >
                <input 
                  value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                  className="w-full bg-[#E5E2D9]/30 border border-rpg-border px-3 py-2 rounded-xl text-sm outline-none mb-3"
                  placeholder="Event Title..."
                />
                <input 
                  value={newEvent.description} onChange={e => setNewEvent({...newEvent, description: e.target.value})}
                  className="w-full bg-[#E5E2D9]/30 border border-rpg-border px-3 py-2 rounded-xl text-sm outline-none mb-3"
                  placeholder="Description..."
                />
                <div className="flex gap-3 mb-4">
                  <input 
                    type="date" value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})}
                    className="flex-1 bg-[#E5E2D9]/30 border border-rpg-border px-3 py-2 rounded-xl text-sm outline-none text-[#8C8A82]"
                  />
                  <input 
                    type="time" value={newEvent.time} onChange={e => setNewEvent({...newEvent, time: e.target.value})}
                    className="w-32 bg-[#E5E2D9]/30 border border-rpg-border px-3 py-2 rounded-xl text-sm outline-none text-[#8C8A82]"
                  />
                </div>
                <button 
                  onClick={handleCreateEvent}
                  className="w-full bg-rpg-primary text-white font-bold py-2 rounded-xl text-sm hover:opacity-90 transition-opacity"
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
                className="bg-[#FDFCF8] border border-rpg-border p-5 rounded-3xl shadow-sm mb-4 group"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-rpg-primary bg-rpg-primary/10 px-2 py-0.5 rounded-md inline-block w-max mb-1">
                      {format(new Date(evt.date + 'T' + evt.time), 'MMM do')} • {evt.time}
                    </span>
                    <h4 className="font-bold text-rpg-text">{evt.title}</h4>
                  </div>
                  <button 
                    onClick={() => removeGuildEvent(evt.id)}
                    className="p-2 text-[#8C8A82] opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
                {evt.description && <p className="text-xs text-[#8C8A82]">{evt.description}</p>}
              </motion.div>
            ))}
            
            {(currentSettings.events || []).length === 0 && !isCreatingEvent && (
              <div className="bg-[#FDFCF8] border border-rpg-border p-8 rounded-3xl text-center text-[#8C8A82]">
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
      className="bg-rpg-surface border border-rpg-border p-4 rounded-3xl flex items-center justify-between shadow-sm"
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
              rank === 2 ? 'border-[#8C8A82] text-[#8C8A82] bg-[#8C8A82]/10' : 
              rank === 3 ? 'border-[#C17F59] text-[#C17F59] bg-[#C17F59]/10' : 
              'border-transparent bg-[#E5E2D9] text-[#8C8A82]'
            )}>
              #{rank} {rank === 1 && <Crown className="w-3 h-3 inline-block ml-0.5 -mt-0.5" />}
            </span>
            {name}
            <span className="text-[10px] bg-[#E5E2D9]/50 text-[#8C8A82] px-2 py-0.5 rounded-full font-bold">Lvl {level}</span>
          </div>
          <div className="text-xs text-[#8C8A82] mt-0.5">{status}</div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-right hidden sm:block">
          <div className="text-lg font-bold text-rpg-primary">{contributions}</div>
          <div className="text-[10px] uppercase tracking-widest text-[#8C8A82]">Contributions</div>
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
             className={`p-3 rounded-2xl transition-all flex items-center justify-center ${nudged ? 'bg-[#E5E2D9] text-[#8C8A82] cursor-not-allowed' : 'bg-rpg-primary/10 text-rpg-primary hover:bg-rpg-primary hover:text-white'}`}
          >
             {nudged ? <HeartHandshake className="w-5 h-5" /> : <BatteryCharging className="w-5 h-5" />}
          </button>
        )}
      </div>
    </motion.div>
  )
}
