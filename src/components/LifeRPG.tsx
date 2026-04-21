import { useAppStore } from '@/src/store';
import { triggerHaptic, cn } from '@/src/lib/utils';
import { motion } from 'motion/react';
import { Flame, Shield, Zap, Book, ShieldAlert, Crosshair, Award } from 'lucide-react';
import { differenceInDays, format, subDays } from 'date-fns';
import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

export default function LifeRPG() {
  const { stats, habits, repairStreak } = useAppStore();

  const handleRepair = (habitId: string, date: string) => {
    triggerHaptic('success');
    repairStreak(habitId, date);
  };

  const today = new Date();
  
  // Find broken streaks recently for the Phoenix Protocol
  const breakages: { habitTitle: string, habitId: string, date: string }[] = [];
  habits.forEach(habit => {
    for(let i=1; i<=3; i++) {
      const d = format(subDays(today, i), 'yyyy-MM-dd');
      if (!habit.completions.includes(d)) {
         breakages.push({ habitTitle: habit.title, habitId: habit.id, date: d });
      }
    }
  });

  // Data for the Attributes Radar Chart
  const radarData = [
    { subject: 'STR', A: Math.max(1, stats.resources.strength), fullMark: Math.max(10, stats.resources.strength * 1.5) },
    { subject: 'INT', A: Math.max(1, stats.resources.intelligence), fullMark: Math.max(10, stats.resources.intelligence * 1.5) },
    { subject: 'VIT', A: Math.max(1, stats.resources.vitality), fullMark: Math.max(10, stats.resources.vitality * 1.5) },
    { subject: 'FOC', A: Math.max(1, stats.resources.focus), fullMark: Math.max(10, stats.resources.focus * 1.5) },
  ];

  // Data for the Weekly Heatmap
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    // We reverse it to start from 6 days ago up to today
    const d = subDays(today, 6 - i);
    const dateStr = format(d, 'yyyy-MM-dd');
    const completions = habits.reduce((acc, h) => acc + (h.completions.includes(dateStr) ? 1 : 0), 0);
    const total = habits.length;
    let intensity = 0;
    if (total > 0) {
      intensity = completions / total;
    }
    return { 
      date: d, 
      dayName: format(d, 'EEEE').substring(0, 1), 
      completions, 
      total, 
      intensity 
    };
  });

  // Artifact definitions
  const ALL_ARTIFACTS = [
    { id: 'first_seed', name: 'The First Seed', desc: 'Starting your journey.', icon: <Flame className="w-6 h-6" />, req: 'Started' },
    { id: 'apprentice_gardener', name: 'Apprentice Gardener', desc: 'Reach Level 5', icon: <Award className="w-6 h-6" />, req: 'Lvl 5' },
    { id: 'botanical_weaver', name: 'Botanical Weaver', desc: 'Reach Level 10', icon: <Shield className="w-6 h-6" />, req: 'Lvl 10' },
    { id: 'zen_master', name: 'Zen Master', desc: 'Complete 3 Pomodoros', icon: <Zap className="w-6 h-6" />, req: '3 Pomo' },
    { id: 'scholar', name: 'The Scholar', desc: 'Gain 10 Intelligence', icon: <Book className="w-6 h-6" />, req: '10 INT' },
    { id: 'iron_will', name: 'Iron Will', desc: 'Gain 10 Strength', icon: <Crosshair className="w-6 h-6" />, req: '10 STR' },
  ];

  return (
    <div className="p-6 md:p-12 w-full max-w-4xl mx-auto min-h-screen text-rpg-text">
      <div className="flex justify-between items-end mb-10 w-full relative z-10">
        <div>
          <h1 className="text-4xl font-serif italic text-rpg-text">The Orchard</h1>
          <p className="text-[#8C8A82] text-sm mt-2 font-bold uppercase tracking-widest text-[10px]">
             {stats.level < 5 ? 'Novice Gardener' : stats.level < 10 ? 'Apprentice Gardener' : 'Botanical Weaver'} • Level {stats.level}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-rpg-surface px-4 py-2 rounded-2xl border border-rpg-border shadow-sm">
          <Award className="w-5 h-5 text-rpg-secondary" />
          <span className="font-bold text-rpg-text">{stats.gold}</span>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-10">
        
        {/* Main XP & Heatmap box */}
        <div className="md:col-span-8 bg-rpg-surface border border-rpg-border p-8 rounded-[32px] shadow-sm flex flex-col justify-between overflow-hidden relative">
          <div className="mb-8">
            <div className="flex justify-between text-sm font-medium mb-4 relative z-10">
              <h3 className="font-serif italic text-xl">Ecosystem Health</h3>
              <span className="text-rpg-primary font-bold">{stats.xp} / {stats.maxXp} XP</span>
            </div>
            <div className="w-full bg-[#E5E2D9] rounded-full h-4 relative z-10">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(stats.xp / stats.maxXp) * 100}%` }}
                transition={{ type: "spring", stiffness: 50 }}
                className="h-full rounded-full bg-rpg-primary transition-all"
              />
            </div>
          </div>

          <div className="mt-auto">
             <h3 className="text-[10px] uppercase tracking-[0.2em] text-[#8C8A82] font-bold mb-4">Past 7 Days Consistency</h3>
             <div className="flex gap-2 justify-between">
                {last7Days.map((day, idx) => {
                  let bgColor = "bg-[#E5E2D9]"; // 0%
                  if (day.intensity > 0) bgColor = "bg-[#ADC178]"; // >0%
                  if (day.intensity >= 0.5) bgColor = "bg-[#7A9E66]"; // >=50%
                  if (day.intensity >= 1) bgColor = "bg-[#4F6D44]"; // 100%
                  
                  return (
                    <div key={idx} className="flex flex-col items-center gap-2 flex-1">
                      <div className={cn("w-full aspect-square rounded-xl transition-colors duration-500", bgColor)} title={`${day.completions}/${day.total} Habits`}></div>
                      <span className="text-[10px] font-bold text-[#8C8A82]">{day.dayName}</span>
                    </div>
                  );
                })}
             </div>
          </div>
        </div>

        {/* Radar Chart Box */}
        <div className="md:col-span-4 bg-rpg-surface border border-rpg-border p-6 rounded-[32px] shadow-sm flex flex-col justify-center items-center min-h-[300px]">
          <h3 className="text-[10px] uppercase tracking-[0.2em] text-[#8C8A82] font-bold mb-2 w-full text-left">Growth Balance</h3>
          <div className="w-full h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="60%" data={radarData}>
                <PolarGrid stroke="#E5E2D9" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#8C8A82', fontSize: 10, fontWeight: 'bold' }} />
                <PolarRadiusAxis 
                  angle={90} 
                  domain={[0, Math.max(...radarData.map(d => d.fullMark))]} 
                  tick={false} 
                  axisLine={false} 
                />
                <Radar
                   name="Attributes"
                   dataKey="A"
                   stroke="#4F6D44"
                   fill="#4F6D44"
                   fillOpacity={0.4}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Attributes Static Cards */}
        <div className="md:col-span-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={<Shield className="text-white w-5 h-5"/>} color="bg-rpg-primary" label="Strength" value={stats.resources.strength} />
          <StatCard icon={<Book className="text-white w-5 h-5"/>} color="bg-rpg-secondary" label="Intelligence" value={stats.resources.intelligence} />
          <StatCard icon={<Zap className="text-white w-5 h-5"/>} color="bg-rpg-success" label="Vitality" value={stats.resources.vitality} />
          <StatCard icon={<Crosshair className="text-white w-5 h-5"/>} color="bg-rpg-warning" label="Focus" value={stats.resources.focus} />
        </div>
      </div>

      {/* The Artifact Cabinet (Badges) */}
      <div className="mb-10">
        <div className="flex justify-between items-end mb-4 px-2">
          <div>
            <h3 className="text-[10px] uppercase tracking-[0.2em] text-[#8C8A82] font-bold flex items-center gap-2">
              <Award className="w-3 h-3 text-rpg-secondary" /> Artifact Cabinet
            </h3>
          </div>
          <div className="text-xs text-[#8C8A82] font-medium inline-block">
            {(stats.unlockedBadges || []).length} / {ALL_ARTIFACTS.length} Collected
          </div>
        </div>

        <div className="bg-rpg-surface border border-rpg-border rounded-[32px] p-8 shadow-sm">
           <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {ALL_ARTIFACTS.map(artifact => {
                const isUnlocked = (stats.unlockedBadges || []).includes(artifact.id);
                return (
                  <div key={artifact.id} className="relative flex flex-col items-center text-center">
                     <motion.div
                       whileHover={isUnlocked ? { scale: 1.05, rotate: [0, -5, 5, 0] } : {}}
                       className={cn(
                         "w-16 h-16 rounded-2xl flex items-center justify-center mb-3 shadow-sm border",
                         isUnlocked ? "bg-gradient-to-br from-[#E5E2D9] to-white border-[#D4A373] text-[#D4A373]" : "bg-[#F5F4F0] border-[#E5E2D9] text-[#E5E2D9] grayscale opacity-50"
                       )}
                     >
                        {artifact.icon}
                     </motion.div>
                     <h4 className={cn("text-xs font-bold", isUnlocked ? "text-rpg-text" : "text-[#8C8A82]")}>{artifact.name}</h4>
                     <p className="text-[10px] text-[#8C8A82] mt-1">{isUnlocked ? artifact.desc : `Requires: ${artifact.req}`}</p>
                     
                     {/* Shine effect for unlocked items */}
                     {isUnlocked && (
                       <div className="absolute inset-x-0 -top-4 -bottom-4 bg-gradient-to-t from-white/0 via-white/50 to-white/0 opacity-0 pointer-events-none animate-[shine_3s_infinite]" />
                     )}
                  </div>
                )
              })}
           </div>
        </div>
      </div>

      {/* The Phoenix Protocol */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        
        {/* Breakages List */}
        <div>
          <div className="flex justify-between items-end mb-4 px-2">
            <div>
              <h3 className="text-[10px] uppercase tracking-[0.2em] text-[#8C8A82] font-bold flex items-center gap-2">
                <Flame className="w-3 h-3 text-rpg-primary" /> Phoenix Roots
              </h3>
            </div>
            <div className="text-xs bg-[#4F6D44]/10 text-rpg-primary px-3 py-1 rounded-full font-medium inline-block">
              Charges: {stats.phoenixFreezes}
            </div>
          </div>

          <div className="bg-rpg-surface border border-rpg-border rounded-[32px] p-8 shadow-sm h-[300px] overflow-y-auto hidden-scrollbar">
            {breakages.length > 0 ? (
              <div className="space-y-4">
                <p className="text-sm text-[#8C8A82] mb-6">Restore broken streaks from the past 3 days and recover lost momentum.</p>
                {breakages.slice(0, 3).map((b, i) => (
                  <div key={i} className="flex items-center justify-between bg-[#FDFCF8] border border-rpg-border p-4 rounded-2xl">
                    <div>
                      <p className="font-medium text-sm">{b.habitTitle}</p>
                      <p className="text-xs text-[#8C8A82] mt-1">{format(new Date(b.date), 'MMM do, yyyy')}</p>
                    </div>
                    <button 
                      disabled={stats.phoenixFreezes <= 0}
                      onClick={() => handleRepair(b.habitId, b.date)}
                      className="px-4 py-2 bg-rpg-primary text-white hover:bg-rpg-primary/90 transition-colors rounded-xl text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-rpg-primary/20"
                    >
                      Restore
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-[#8C8A82] flex flex-col items-center justify-center h-full">
                <ShieldAlert className="w-8 h-8 mb-3 opacity-50" />
                <p className="font-medium">No recent breaks detected.</p>
                <p className="text-sm mt-1">Your momentum is unbreakable.</p>
              </div>
            )}
          </div>
        </div>

        {/* The Orchard Store */}
        <div>
          <div className="flex justify-between items-end mb-4 px-2">
            <div>
              <h3 className="text-[10px] uppercase tracking-[0.2em] text-[#8C8A82] font-bold flex items-center gap-2">
                <Award className="w-3 h-3 text-rpg-secondary" /> Grand Bazaar
              </h3>
            </div>
            <div className="text-xs bg-[#D4A373]/10 text-rpg-secondary px-3 py-1 rounded-full font-medium inline-block">
              {stats.gold} Gold
            </div>
          </div>

          <div className="bg-rpg-surface border border-rpg-border rounded-[32px] p-8 shadow-sm h-[300px] flex flex-col">
            <p className="text-sm text-[#8C8A82] mb-6">Exchange your hard-earned gold for mystical items and aesthetic titles.</p>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-[#FDFCF8] border border-rpg-border p-4 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-rpg-primary/10 rounded-xl">
                    <Flame className="w-5 h-5 text-rpg-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Phoenix Root</p>
                    <p className="text-xs text-[#8C8A82] mt-1">+1 Break Forgiveness</p>
                  </div>
                </div>
                <button 
                  disabled={stats.gold < 50}
                  onClick={() => {
                    triggerHaptic('heavy');
                    useAppStore.getState().buyPhoenixCharge();
                  }}
                  className="px-4 py-2 bg-rpg-secondary text-white hover:bg-rpg-secondary/90 transition-colors rounded-xl text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-rpg-secondary/20 flex items-center gap-1"
                >
                  50 <Award className="w-3 h-3"/>
                </button>
              </div>

              <div className="flex items-center justify-between bg-[#FDFCF8] border border-rpg-border p-4 rounded-2xl opacity-60">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#8C8A82]/10 rounded-xl">
                    <Shield className="w-5 h-5 text-[#8C8A82]" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Theme: Midnight</p>
                    <p className="text-xs text-[#8C8A82] mt-1">Cosmetic Dashboard</p>
                  </div>
                </div>
                <button 
                  disabled={stats.gold < 200 || stats.activeTheme === 'midnight'}
                  onClick={() => {
                     triggerHaptic('success');
                     useAppStore.getState().buyTheme('midnight', 200);
                  }}
                  className="px-4 py-2 bg-[#8C8A82] text-white hover:bg-[#8C8A82]/90 transition-colors rounded-xl text-sm font-bold disabled:cursor-not-allowed shadow-sm flex items-center gap-1"
                >
                  {stats.activeTheme === 'midnight' ? 'Owned' : '200'} {stats.activeTheme !== 'midnight' && <Award className="w-3 h-3"/>}
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
}

function StatCard({ icon, color, label, value }: { icon: React.ReactNode, color: string, label: string, value: number }) {
  return (
    <div className="bg-rpg-surface border border-rpg-border p-5 rounded-3xl flex items-center gap-4 shadow-sm">
      <div className={`p-3 rounded-2xl ${color}`}>
        {icon}
      </div>
      <div>
        <div className="text-2xl font-serif italic font-bold">{value}</div>
        <div className="text-[10px] text-[#8C8A82] uppercase tracking-[0.2em] font-bold mt-1">{label}</div>
      </div>
    </div>
  )
}
