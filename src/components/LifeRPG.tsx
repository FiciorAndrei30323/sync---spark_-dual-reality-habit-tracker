import { useAppStore } from '@/src/store';
import { triggerHaptic, cn } from '@/src/lib/utils';
import { motion } from 'motion/react';
import { Flame, Shield, Zap, Book, ShieldAlert, Crosshair, Award, Download, ShieldCheck } from 'lucide-react';
import { format, subDays } from 'date-fns';
import React from 'react';
import FocusRadarChart from './viz/FocusRadarChart';
import FocusProgressBar from './viz/FocusProgressBar';
import ArtifactCard from './rewards/ArtifactCard';

export default function LifeRPG() {
  const { stats, habits, repairStreak } = useAppStore();

  const handleRepair = (habitId: string, date: string) => {
    triggerHaptic('success');
    repairStreak(habitId, date);
  };

  const handleExport = async () => {
    triggerHaptic('heavy');
    try {
      const { exportGrowthPortfolio } = await import('../database/utilities/exportPortfolio');
      const json = await exportGrowthPortfolio();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Apex-Portfolio-${format(new Date(), 'yyyy-MM-dd')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const today = new Date();
  
  // Find broken streaks recently for the Phoenix Protocol
  const breakages: { habitTitle: string, habitId: string, date: string }[] = [];
  habits.forEach(habit => {
    for(let i=1; i<=3; i++) {
      const d = format(subDays(today, i), 'yyyy-MM-dd');
      if (!habit.completions.some(c => c.date === d)) {
         breakages.push({ habitTitle: habit.title, habitId: habit.id, date: d });
      }
    }
  });

  // Data for the Attributes Radar Chart
  const radarData = [
    { subject: 'STR', A: stats.resources.strength, fullMark: 100 },
    { subject: 'INT', A: stats.resources.intelligence, fullMark: 100 },
    { subject: 'VIT', A: stats.resources.vitality, fullMark: 100 },
    { subject: 'FOC', A: stats.resources.focus, fullMark: 100 },
  ];

  // Data for the Weekly Heatmap
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = subDays(today, 6 - i);
    const dateStr = format(d, 'yyyy-MM-dd');
    const dayCompletions = habits.map(h => h.completions.find(c => c.date === dateStr)).filter(Boolean);
    const completions = dayCompletions.length;
    const hasRepair = dayCompletions.some(c => (c as any).status === 'repaired');
    const total = habits.length;
    let intensity = 0;
    if (total > 0) intensity = completions / total;
    return { date: d, dayName: format(d, 'EEEE').substring(0, 1), completions, total, intensity, hasRepair };
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
    <div className="p-6 md:p-12 w-full max-w-4xl mx-auto min-h-screen text-text-primary safe-area-bottom">
      <div className="flex justify-between items-end mb-10 w-full relative z-10">
        <div>
          <h1 className="text-4xl font-serif italic text-text-primary">The Orchard</h1>
          <p className="text-text-secondary text-sm mt-2 font-bold uppercase tracking-widest text-[10px]">
             {stats.level < 5 ? 'Novice Gardener' : stats.level < 10 ? 'Apprentice Gardener' : 'Botanical Weaver'} • Level {stats.level}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-surface-primary px-4 py-2 rounded-2xl border border-border-subtle shadow-sm">
          <Award className="w-5 h-5 text-pillar-work" />
          <span className="font-bold text-text-primary">{stats.gold}</span>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-10">
        
        {/* Main XP & Heatmap box */}
        <div className="md:col-span-8 bg-surface-primary border border-border-subtle p-8 rounded-[32px] shadow-sm flex flex-col justify-between overflow-hidden relative">
          <div className="mb-8">
            <div className="flex justify-between text-sm font-medium mb-4 relative z-10">
              <h3 className="font-serif italic text-xl">Ecosystem Health</h3>
              <span className="text-accent font-bold">{stats.xp} / {stats.maxXp} XP</span>
            </div>
            <FocusProgressBar progress={(stats.xp / stats.maxXp) * 100} color="var(--color-accent)" />
          </div>

          <div className="mt-auto">
             <h3 className="text-[10px] uppercase tracking-[0.2em] text-text-secondary font-bold mb-4">Past 7 Days Consistency</h3>
             <div className="flex gap-2 justify-between">
                {last7Days.map((day, idx) => {
                  let bgColor = "bg-border-subtle/50"; 
                  if (day.intensity > 0) {
                    bgColor = day.hasRepair ? "bg-repaired/40" : "bg-pillar-health/30";
                  }
                  if (day.intensity >= 0.5) {
                    bgColor = day.hasRepair ? "bg-repaired/70" : "bg-pillar-health/60";
                  }
                  if (day.intensity >= 1) {
                    bgColor = day.hasRepair ? "bg-repaired" : "bg-pillar-health";
                  } 
                  


                  return (
                    <div key={idx} className="flex flex-col items-center gap-2 flex-1">
                      <div 
                        className={cn(
                          "w-full aspect-square rounded-xl transition-all duration-500", 
                          bgColor,
                          day.hasRepair && "animate-gleam shadow-sm border border-white/20 ring-1 ring-repaired/30"
                        )} 
                        title={`${day.completions}/${day.total} Habits ${day.hasRepair ? '(Momentum Shield Active)' : ''}`}
                      ></div>
                      <span className="text-[10px] font-bold text-text-secondary">{day.dayName}</span>
                    </div>
                  );
                })}
             </div>
          </div>
        </div>

        {/* Radar Chart Box */}
        <div className="md:col-span-4 bg-surface-primary border border-border-subtle p-6 rounded-[32px] shadow-sm flex flex-col justify-center items-center min-h-[300px]">
          <h3 className="text-[10px] uppercase tracking-[0.2em] text-text-secondary font-bold mb-4 w-full text-left">Growth Balance</h3>
          <FocusRadarChart data={radarData} pillarColor="var(--color-pillar-health)" />
        </div>

        {/* Attributes Static Cards */}
        <div className="md:col-span-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={<Shield className="text-white w-5 h-5"/>} color="bg-pillar-health" label="Strength" value={stats.resources.strength} />
          <StatCard icon={<Book className="text-white w-5 h-5"/>} color="bg-pillar-work" label="Intelligence" value={stats.resources.intelligence} />
          <StatCard icon={<Zap className="text-white w-5 h-5"/>} color="bg-pillar-mind" label="Vitality" value={stats.resources.vitality} />
          <StatCard icon={<Crosshair className="text-white w-5 h-5"/>} color="bg-accent" label="Focus" value={stats.resources.focus} />
        </div>
      </div>

      {/* The Artifact Cabinet (Badges) */}
      <div className="mb-10">
        <div className="flex justify-between items-end mb-4 px-2">
          <div>
            <h3 className="text-[10px] uppercase tracking-[0.2em] text-text-secondary font-bold flex items-center gap-2">
              <Award className="w-3 h-3 text-pillar-work" /> Artifact Cabinet
            </h3>
          </div>
          <div className="text-xs text-text-secondary font-medium inline-block">
            {(stats.unlockedBadges || []).length} / {ALL_ARTIFACTS.length} Collected
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {ALL_ARTIFACTS.map(artifact => (
            <ArtifactCard 
              key={artifact.id}
              name={artifact.name}
              description={artifact.desc}
              isLocked={!(stats.unlockedBadges || []).includes(artifact.id)}
              icon={artifact.icon}
            />
          ))}
        </div>
      </div>

      {/* The Phoenix Protocol */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        
        {/* Breakages List */}
        <div>
          <div className="flex justify-between items-end mb-4 px-2">
            <div>
              <h3 className="text-[10px] uppercase tracking-[0.2em] text-text-secondary font-bold flex items-center gap-2">
                <Flame className="w-3 h-3 text-pillar-health" /> Phoenix Roots
              </h3>
            </div>
            <div className="text-xs bg-pillar-health/10 text-pillar-health-dark px-3 py-1 rounded-full font-medium inline-block">
              Charges: {stats.phoenixFreezes}
            </div>
          </div>

          <div className="bg-surface-primary border border-border-subtle rounded-[32px] p-8 shadow-sm h-[300px] overflow-y-auto hidden-scrollbar">
            {breakages.length > 0 ? (
              <div className="space-y-4">
                <p className="text-sm text-text-secondary mb-6">Claim your second chance. Shield your momentum from the past 3 days.</p>
                {breakages.slice(0, 3).map((b, i) => (
                  <div key={i} className="flex items-center justify-between bg-surface-secondary/30 border border-border-subtle p-4 rounded-2xl">
                    <div>
                      <p className="font-medium text-sm text-text-primary">{b.habitTitle}</p>
                      <p className="text-xs text-text-secondary mt-1">{format(new Date(b.date), 'MMM do, yyyy')}</p>
                    </div>
                    <button 
                      disabled={stats.phoenixFreezes <= 0}
                      onClick={() => handleRepair(b.habitId, b.date)}
                      className="px-4 py-2 bg-pillar-health text-white hover:bg-pillar-health-dark transition-colors rounded-xl text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-pillar-health/20"
                    >
                      Invoke Phoenix
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-text-secondary flex flex-col items-center justify-center h-full">
                <ShieldAlert className="w-8 h-8 mb-3 opacity-50" />
                <p className="font-medium">No recent breaks detected.</p>
                <p className="text-sm mt-1">Your momentum is unbreakable.</p>
              </div>
            )}
          </div>
        </div>

        {/* The Grand Bazaar — Premium Storefront */}
        <div className="md:col-span-2">
          <div className="flex justify-between items-end mb-6 px-2">
            <div>
              <h3 className="font-serif italic text-xl text-text-primary flex items-center gap-3">
                <div className="p-2 bg-pillar-work/10 rounded-xl">
                  <Award className="w-5 h-5 text-pillar-work" />
                </div>
                Grand Bazaar
              </h3>
              <p className="text-sm text-text-secondary mt-2 ml-12">Exchange your gold for mystical items and aesthetic upgrades.</p>
            </div>
            <div className="flex items-center gap-2 bg-surface-primary px-4 py-2 rounded-2xl border border-border-subtle shadow-sm">
              <Award className="w-4 h-4 text-pillar-work" />
              <span className="font-bold text-text-primary">{stats.gold}</span>
              <span className="text-xs text-text-secondary">Gold</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Phoenix Root Card */}
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className={cn(
                "relative bg-surface-primary border border-border-subtle rounded-[28px] p-6 shadow-sm overflow-hidden group transition-all duration-300",
                stats.gold >= 50 && "animate-gleam"
              )}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-pillar-health/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-pillar-health/10 transition-colors duration-500" />
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-5">
                  <div className="p-3 bg-pillar-health/10 rounded-2xl group-hover:bg-pillar-health/20 transition-colors duration-300">
                    <Flame className="w-7 h-7 text-pillar-health" />
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-pillar-health bg-pillar-health/10 px-3 py-1 rounded-full">Consumable</span>
                </div>

                <h4 className="text-lg font-bold text-text-primary mb-1">Phoenix Root</h4>
                <p className="text-sm text-text-secondary mb-6 leading-relaxed">Retroactively shield a broken streak. Claim your second chance at momentum.</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-pillar-work" />
                    <span className="text-xl font-bold text-text-primary">50</span>
                    <span className="text-xs text-text-secondary">Gold</span>
                  </div>
                  <button 
                    disabled={stats.gold < 50}
                    onClick={() => {
                      triggerHaptic('heavy');
                      useAppStore.getState().buyPhoenixCharge();
                    }}
                    className="px-6 py-2.5 bg-pillar-health text-white hover:bg-pillar-health-dark transition-all rounded-xl text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-pillar-health/20 hover:shadow-pillar-health/40"
                  >
                    {stats.gold >= 50 ? 'Acquire' : 'Insufficient Gold'}
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Theme: Midnight Card */}
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className={cn(
                "relative bg-surface-primary border border-border-subtle rounded-[28px] p-6 shadow-sm overflow-hidden group transition-all duration-300",
                stats.activeTheme === 'midnight' && "border-pillar-mind/30"
              )}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-pillar-mind/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-pillar-mind/10 transition-colors duration-500" />
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-5">
                  <div className="p-3 bg-surface-secondary rounded-2xl group-hover:bg-surface-secondary/80 transition-colors duration-300">
                    <Shield className="w-7 h-7 text-pillar-mind" />
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-pillar-mind bg-pillar-mind/10 px-3 py-1 rounded-full">
                    {stats.activeTheme === 'midnight' ? '✓ Owned' : 'Cosmetic'}
                  </span>
                </div>

                <h4 className="text-lg font-bold text-text-primary mb-1">Theme: Midnight</h4>
                <p className="text-sm text-text-secondary mb-6 leading-relaxed">Transform your entire dashboard into a sleek, dark aesthetic. Pure focus, zero distractions.</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-pillar-work" />
                    <span className="text-xl font-bold text-text-primary">200</span>
                    <span className="text-xs text-text-secondary">Gold</span>
                  </div>
                  <button 
                    disabled={stats.gold < 200 || stats.activeTheme === 'midnight'}
                    onClick={() => {
                       triggerHaptic('success');
                       useAppStore.getState().buyTheme('midnight', 200);
                    }}
                    className={cn(
                      "px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg",
                      stats.activeTheme === 'midnight' 
                        ? "bg-pillar-mind/10 text-pillar-mind cursor-default shadow-none"
                        : "bg-text-primary text-surface-primary hover:bg-text-primary/90 disabled:opacity-40 disabled:cursor-not-allowed shadow-black/10 hover:shadow-black/20"
                    )}
                  >
                    {stats.activeTheme === 'midnight' ? 'Equipped' : stats.gold >= 200 ? 'Acquire' : 'Insufficient Gold'}
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Theme: Emerald Card */}
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className={cn(
                "relative bg-surface-primary border border-border-subtle rounded-[28px] p-6 shadow-sm overflow-hidden group transition-all duration-300",
                stats.activeTheme === 'emerald' && "border-pillar-health/30"
              )}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-pillar-health/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-pillar-health/10 transition-colors duration-500" />
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-5">
                  <div className="p-3 bg-surface-secondary rounded-2xl group-hover:bg-surface-secondary/80 transition-colors duration-300">
                    <Shield className="w-7 h-7 text-pillar-health" />
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-pillar-health bg-pillar-health/10 px-3 py-1 rounded-full">
                    {stats.activeTheme === 'emerald' ? '✓ Owned' : 'Cosmetic'}
                  </span>
                </div>

                <h4 className="text-lg font-bold text-text-primary mb-1">Theme: Emerald</h4>
                <p className="text-sm text-text-secondary mb-6 leading-relaxed">Embrace the vibrant, lush aesthetic of the peak Orchard. Maximum vitality for your workflow.</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-pillar-work" />
                    <span className="text-xl font-bold text-text-primary">400</span>
                    <span className="text-xs text-text-secondary">Gold</span>
                  </div>
                  <button 
                    disabled={stats.gold < 400 || stats.activeTheme === 'emerald'}
                    onClick={() => {
                       triggerHaptic('success');
                       useAppStore.getState().buyTheme('emerald', 400);
                    }}
                    className={cn(
                      "px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg",
                      stats.activeTheme === 'emerald' 
                        ? "bg-pillar-health/10 text-pillar-health cursor-default shadow-none"
                        : "bg-text-primary text-surface-primary hover:bg-text-primary/90 disabled:opacity-40 disabled:cursor-not-allowed shadow-black/10 hover:shadow-black/20"
                    )}
                  >
                    {stats.activeTheme === 'emerald' ? 'Equipped' : stats.gold >= 400 ? 'Acquire' : 'Insufficient Gold'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Identity & Legacy — The Absolute Freedom Export */}
        <div className="mt-6 bg-surface-primary border border-border-subtle p-8 rounded-[32px] shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <ShieldCheck className="w-24 h-24 text-text-primary" />
          </div>
          
          <div className="relative z-10">
            <h3 className="font-serif italic text-2xl mb-2">Absolute Freedom.</h3>
            <p className="text-text-secondary text-sm max-w-lg mb-8 leading-relaxed font-medium">
              Your growth belongs to you, not us. We believe in high-trust relationships: you are free to leave at any time with your full history. Ironically, this is the very reason our gardeners choose to stay.
            </p>
            
            <button 
              onClick={handleExport}
              className="flex items-center gap-3 bg-text-primary text-surface-primary px-6 py-4 rounded-2xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-black/10"
            >
              <Download className="w-5 h-5" />
              Export My Growth Portfolio (.json)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, color, label, value }: { icon: React.ReactNode, color: string, label: string, value: number }) {
  return (
    <div className="bg-surface-primary border border-border-subtle p-5 rounded-3xl flex items-center gap-4 shadow-sm">
      <div className={`p-3 rounded-2xl ${color}`}>
        {icon}
      </div>
      <div>
        <div className="text-2xl font-serif italic font-bold text-text-primary">{value}</div>
        <div className="text-[10px] text-text-secondary uppercase tracking-[0.2em] font-bold mt-1">{label}</div>
      </div>
    </div>
  );
}
