import { create } from 'zustand';
import { EmergencyCase, CaseStatus, Severity, EmergencyType } from '../types';
import { apiRequest } from '../lib/api';
import { getSocket } from '../lib/socket';

interface CaseFilters {
  status?: CaseStatus | '';
  severity?: Severity | '';
  type?: EmergencyType | '';
  search?: string;
}

interface CaseState {
  cases: EmergencyCase[];
  activeCases: EmergencyCase[];
  currentCase: EmergencyCase | null;
  isLoading: boolean;
  filters: CaseFilters;
  unreadAlertsCount: number;

  fetchCases: () => Promise<void>;
  fetchActiveCases: () => Promise<void>;
  fetchCaseById: (caseId: string) => Promise<EmergencyCase | null>;
  createCase: (caseData: any) => Promise<EmergencyCase | null>;
  updateCaseStatus: (caseId: string, status: CaseStatus, note?: string) => Promise<boolean>;
  acceptCase: (caseId: string) => Promise<boolean>;
  setFilters: (filters: Partial<CaseFilters>) => void;
  resetAllCases: () => Promise<boolean>;
  setupSocketListeners: () => void;
}

export const useCaseStore = create<CaseState>((set, get) => ({
  cases: [],
  activeCases: [],
  currentCase: null,
  isLoading: false,
  filters: {},
  unreadAlertsCount: 0,

  fetchCases: async () => {
    set({ isLoading: true });
    const { status, severity, type, search } = get().filters;
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (severity) params.append('severity', severity);
    if (type) params.append('type', type);
    if (search) params.append('search', search);

    const res = await apiRequest<EmergencyCase[]>(`/cases?${params.toString()}`);
    if (res.success && res.data) {
      set({ cases: res.data, isLoading: false });
    } else {
      set({ isLoading: false });
    }
  },

  fetchActiveCases: async () => {
    const res = await apiRequest<EmergencyCase[]>('/cases/active');
    if (res.success && res.data) {
      set({ activeCases: res.data });
    }
  },

  fetchCaseById: async (caseId: string) => {
    set({ isLoading: true });
    const res = await apiRequest<EmergencyCase>(`/cases/${caseId}`);
    if (res.success && res.data) {
      set({ currentCase: res.data, isLoading: false });
      return res.data;
    } else {
      set({ isLoading: false, currentCase: null });
      return null;
    }
  },

  createCase: async (caseData) => {
    set({ isLoading: true });
    const res = await apiRequest<EmergencyCase>('/cases', {
      method: 'POST',
      body: JSON.stringify(caseData),
    });

    if (res.success && res.data) {
      set((state) => ({
        cases: [res.data!, ...state.cases],
        activeCases: [res.data!, ...state.activeCases],
        currentCase: res.data,
        isLoading: false,
      }));
      return res.data;
    } else {
      set({ isLoading: false });
      return null;
    }
  },

  updateCaseStatus: async (caseId, status, note) => {
    const res = await apiRequest<EmergencyCase>(`/cases/${caseId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, note }),
    });

    if (res.success && res.data) {
      set((state) => ({
        currentCase: state.currentCase?.caseId === caseId ? res.data : state.currentCase,
        cases: state.cases.map((c) => (c.caseId === caseId ? res.data! : c)),
        activeCases: state.activeCases.map((c) => (c.caseId === caseId ? res.data! : c)),
      }));
      return true;
    }
    return false;
  },

  acceptCase: async (caseId) => {
    const res = await apiRequest<EmergencyCase>(`/cases/${caseId}/accept`, {
      method: 'POST',
    });

    if (res.success && res.data) {
      set((state) => ({
        currentCase: state.currentCase?.caseId === caseId ? res.data : state.currentCase,
        cases: state.cases.map((c) => (c.caseId === caseId ? res.data! : c)),
      }));
      return true;
    }
    return false;
  },

  setFilters: (newFilters) => {
    set((state) => ({ filters: { ...state.filters, ...newFilters } }));
    get().fetchCases();
  },

  resetAllCases: async () => {
    const res = await apiRequest('/admin/reset', { method: 'POST' });
    if (res.success) {
      set({ cases: [], activeCases: [], currentCase: null });
      return true;
    }
    return false;
  },

  setupSocketListeners: () => {
    const socket = getSocket();

    socket.off('case:new');
    socket.off('case:updated');
    socket.off('case:ai_result');

    socket.on('case:new', (newCase: EmergencyCase) => {
      set((state) => ({
        cases: [newCase, ...state.cases.filter((c) => c.caseId !== newCase.caseId)],
        activeCases: [newCase, ...state.activeCases.filter((c) => c.caseId !== newCase.caseId)],
        unreadAlertsCount: state.unreadAlertsCount + 1,
      }));
    });

    socket.on('case:updated', (updatedCase: EmergencyCase) => {
      set((state) => ({
        cases: state.cases.map((c) => (c.caseId === updatedCase.caseId ? updatedCase : c)),
        activeCases: state.activeCases.map((c) => (c.caseId === updatedCase.caseId ? updatedCase : c)),
        currentCase: state.currentCase?.caseId === updatedCase.caseId ? updatedCase : state.currentCase,
      }));
    });

    socket.on('case:ai_result', (aiAnalysis: any) => {
      set((state) => {
        if (!state.currentCase) return {};
        return {
          currentCase: {
            ...state.currentCase,
            aiAnalysis,
          },
        };
      });
    });
  },
}));
