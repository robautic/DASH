export interface MaterializedKPIs {
  totalLeads: number;
  leadsAtivos: number;
  atendentesOnline: number;
  atendentesTotal: number;
  tempoMedioMin: number;
  conversoesTotal: number;
  faturamentoTotal: string;
  roasGeral: string;
  cacMedio: string;
}

export interface DashboardStoreData {
  attendants: any[];
  leads: any[];
  instances: any[];
  businesses: any[];
  stages: any[];
  conversations: any[];
  departments: any[];
  metrics: MaterializedKPIs;
  lastSyncTime: number;
  isSyncing: boolean;
  syncError: string | null;
}

let store: DashboardStoreData = {
  attendants: [],
  leads: [],
  instances: [],
  businesses: [],
  stages: [],
  conversations: [],
  departments: [],
  metrics: {
    totalLeads: 0,
    leadsAtivos: 0,
    atendentesOnline: 0,
    atendentesTotal: 0,
    tempoMedioMin: 8.2,
    conversoesTotal: 0,
    faturamentoTotal: "R$ 0,00",
    roasGeral: "0.0x",
    cacMedio: "R$ 0,00",
  },
  lastSyncTime: 0,
  isSyncing: false,
  syncError: null,
};

export function getDashboardStore(): DashboardStoreData {
  return store;
}

export function updateDashboardStore(newData: Partial<DashboardStoreData>) {
  store = {
    ...store,
    ...newData,
    lastSyncTime: newData.lastSyncTime || Date.now(),
  };
}
