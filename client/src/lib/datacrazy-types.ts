/**
 * Interfaces baseadas na estrutura real da API Datacrazy
 */

export interface DatacrazyAttendant {
  userId: string;
  id: string;
  name: string;
  email: string;
  phone: string;
  image: string;
}

export interface DatacrazyLead {
  id: string;
  createdAt: string;
  updatedAt?: string;
  name: string;
  image: string;
  phone: string;
  rawPhone: string;
  email: string;
  source: string | null;
  company: string | null;
  taxId: string | null;
  tags: any[];
  lists: any[];
  contacts: Array<{
    platform: string;
    contactId: string;
    instanceId: string | null;
    lastContactStatus: any;
  }>;
  attendant: {
    userId: string;
    id: string;
    name: string;
    email: string;
    phone: string;
    image: string;
  } | null;
}

export interface DatacrazyInstance {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  platform: string;
  provider: string;
  engine: string;
  isActive: boolean;
  status: string;
  deletedAt: string | null;
  config?: {
    phoneNumberId?: string;
    phoneNumber?: string;
    businessId?: string;
  };
}

export interface DatacrazyBusiness {
  id: string;
  createdAt: string;
  updatedAt?: string;
  stageId: string;
  leadId: string;
  attendantId: string | null;
  nextActivityId: string | null;
  total: number;
  discount: number;
  status: string;
  code: number;
  lastMovedAt: string;
  statusChangedAt: string | null;
  productsCount: number;
  lead?: {
    name: string;
    phone: string;
    rawPhone: string;
    source: string | null;
  };
}

export interface DatacrazyPipeline {
  id: string;
  name: string;
  description: string;
  group: string;
  stagesCount: number;
}

export interface DatacrazyStage {
  id: string;
  name: string;
  color: string;
  index: number;
  activitiesCount: number;
}

export interface DatacrazyConversation {
  id: string;
  name: string;
  imageURL: string;
  createdAt: string;
  updatedAt: string;
  isPending: boolean;
  finished: boolean;
  lastMessageDate: string;
  lastMessage: {
    body: string;
    received: boolean;
    createdAt: string;
  };
  attendants: Array<{
    userId: string;
    name: string;
    email: string;
    imageURL: string;
    id: string;
  }>;
  statuses: string[];
}

// Derived types for dashboard display
export interface DashboardAttendant {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  image: string;
  leadsAtribuidos: number;
  leadsEmAtendimento: number;
  leadsFinalizados: number;
  taxaResposta: number;
  tempoMedioResposta: string;
  status: "online" | "offline" | "ocupado";
  ultimasAtualizacoes: string;
}

export interface DashboardLead {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  source: string | null;
  pipeline: string;
  etapa: string;
  atendente: string;
  atendenteId: string | null;
  dataCriacao: string;
  dataUltimaAtualizacao: string;
  status: string;
  instanciaId: string | null;
  isPending: boolean;
}

export interface DashboardInstance {
  id: string;
  name: string;
  platform: string;
  provider: string;
  status: string;
  isActive: boolean;
  phoneNumber: string;
  leadsHoje: number;
  leadsTotal: number;
  color: string;
}
