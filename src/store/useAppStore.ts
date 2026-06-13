import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface TestPlanRecord {
  id: string;
  jiraId: string;
  testPlanMd: string;
  testCasesCsv: string;
  createdAt: string;
  createdBy: string;
}

interface AppState {
  groqKey: string;
  groqModel: string;
  jiraUrl: string;
  jiraEmail: string;
  jiraToken: string;
  history: TestPlanRecord[];
  
  setSettings: (settings: { groqKey?: string; groqModel?: string; jiraUrl?: string; jiraEmail?: string; jiraToken?: string }) => void;
  addHistoryRecord: (record: TestPlanRecord) => void;
  removeHistoryRecord: (id: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      groqKey: '',
      groqModel: 'llama-3.3-70b-versatile',
      jiraUrl: '',
      jiraEmail: '',
      jiraToken: '',
      history: [],
      
      setSettings: (settings) => set((state) => ({ ...state, ...settings })),
      addHistoryRecord: (record) => set((state) => ({ history: [record, ...state.history] })),
      removeHistoryRecord: (id) => set((state) => ({ history: state.history.filter(r => r.id !== id) })),
    }),
    {
      name: 'qa-copilot-storage',
    }
  )
);
