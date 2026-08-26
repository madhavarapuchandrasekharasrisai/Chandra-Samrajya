import { create } from 'zustand';
import { toast } from 'sonner';
import {
  SoloLevelingStats,
  RPGTask,
  DAILY_CORE_PROTOCOLS,
  WEEKLY_SPECIALIZATIONS,
  calculateCurrentStats,
} from '@/lib/solo-leveling-calc';

export type { SoloLevelingStats, RPGTask };
export { DAILY_CORE_PROTOCOLS, WEEKLY_SPECIALIZATIONS };

interface SoloLevelingState {
  stats: SoloLevelingStats | null;
  baseStats: SoloLevelingStats | null; // Raw baseline before today's completed tasks
  completedTasks: Record<string, boolean>;
  isLoading: boolean;
  history: any[];

  fetchStats: () => Promise<void>;
  completeTask: (taskId: string, isCompleted: boolean) => Promise<void>;
  resetDaily: () => Promise<void>;
  purgeStats: () => Promise<void>;
  fetchHistory: () => Promise<void>;
}

const getHeaders = (extra: Record<string, string> = {}) => ({
  'x-client-date': new Date().toISOString(),
  'x-timezone-offset': String(new Date().getTimezoneOffset()),
  ...extra,
});

export const useSoloLevelingStore = create<SoloLevelingState>((set, get) => ({
  stats: null,
  baseStats: null,
  completedTasks: {},
  isLoading: false,
  history: [],

  fetchStats: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch('/api/solo-leveling', {
        headers: getHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        set({
          stats: data.stats,
          baseStats: data.baseStats,
          completedTasks: data.completedTasks || {},
        });
      }
    } catch (error) {
      console.error('Failed to fetch solo-leveling stats:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  completeTask: async (taskId: string, isCompleted: boolean) => {
    const { baseStats, completedTasks, stats } = get();
    if (!baseStats) return;

    // 1. Optimistic UI update for completedTasks
    const updatedCompletedTasks = { ...completedTasks, [taskId]: isCompleted };

    // 2. Extract completed task IDs array
    const completedTaskIds = Object.entries(updatedCompletedTasks)
      .filter(([_, val]) => val)
      .map(([id]) => id);

    // 3. Compute client-side deterministic optimistic stats projection
    const optimisticProjectedStats = calculateCurrentStats(baseStats, completedTaskIds);

    // Set optimistic state immediately for buttery-smooth interaction
    set({
      completedTasks: updatedCompletedTasks,
      stats: optimisticProjectedStats,
    });

    try {
      const res = await fetch('/api/solo-leveling/task', {
        method: 'POST',
        headers: getHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ taskId, isCompleted }),
      });
      if (res.ok) {
        const result = await res.json();
        set({
          stats: result.stats,
          baseStats: result.baseStats,
        });
        if (isCompleted) {
          const successMessages = [
            'Combat Protocol Cleared!',
            'Mind Reinforced!',
            'Discipline Increased!',
            'Combat Readiness Improved!',
            'Sovereign Synced!',
          ];
          toast.success(successMessages[Math.floor(Math.random() * successMessages.length)], {
            description: `Power level holds at ${result.stats.powerLevel} (${result.stats.currentRank})`,
          });
        }
      } else {
        // Rollback state on error
        set({ completedTasks, stats });
        toast.error('Protocol synchronization failed. Reverting biometrics.');
      }
    } catch (error) {
      console.error('Failed to sync complete task state:', error);
      // Rollback state on error
      set({ completedTasks, stats });
      toast.error('Connection drift detected. Rollback active.');
    }
  },

  resetDaily: async () => {
    try {
      const res = await fetch('/api/solo-leveling/reset', {
        method: 'POST',
        headers: getHeaders(),
      });
      if (res.ok) {
        const result = await res.json();
        set({
          stats: result.stats,
          baseStats: result.baseStats,
          completedTasks: result.completedTasks || {},
        });
        toast.info('Imperial Day Cycle Evaluated', {
          description: result.stats.failureState === 1
            ? '🔴 Protocols Broken. System entered Failure Mode!'
            : '🛡️ Sovereign Protocols Synced successfully.',
        });
      }
    } catch (error) {
      console.error('Daily reset error:', error);
    }
  },

  fetchHistory: async () => {
    try {
      const res = await fetch('/api/solo-leveling/history');
      if (res.ok) {
        const data = await res.json();
        set({ history: data.history });
      }
    } catch (error) {
      console.error('Failed to retrieve history logs:', error);
    }
  },

  purgeStats: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch('/api/solo-leveling', { method: 'DELETE' });
      if (res.ok) {
        const data = await res.json();
        set({
          stats: data.stats,
          baseStats: data.baseStats,
          completedTasks: {},
        });
        toast.success('System Reset Initiated!', {
          description: 'All biometrics purged back to starting default (Civilian Class).',
        });
      } else {
        toast.error('System reset failed to synchronize.');
      }
    } catch (error) {
      console.error('Purge error:', error);
      toast.error('Purge protocol failed due to database connection error.');
    } finally {
      set({ isLoading: false });
    }
  },
}));
