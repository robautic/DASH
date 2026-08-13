// Referências tipadas para cada coleção do Firestore — ponto único de acesso
// ao banco. O resto do backend importa daqui em vez de chamar
// `db.collection('leads')` espalhado pelo código (evita erro de digitação
// no nome da coleção e garante o tipo certo em toda leitura/escrita).
import type { FirestoreDataConverter, QueryDocumentSnapshot } from 'firebase-admin/firestore'
import { db } from './firebaseAdmin.js'
import type {
  AttendantDoc,
  AuditLogDoc,
  CampaignDoc,
  ConversationDoc,
  ConversionDoc,
  DepartmentDoc,
  GoalDoc,
  LeadDoc,
  LeadHistoryDoc,
  MessageDoc,
  MetricDoc,
  PipelineDoc,
  SettingsDoc,
  StageDoc,
  SyncStateDoc,
  TagDoc,
  UserDoc,
} from '../types/firestore.js'

// Converter "passthrough" — os DTOs já são objetos planos serializáveis;
// isso só dá o tipo certo em .data() sem reescrever toFirestore/fromFirestore
// para cada coleção.
function converter<T>(): FirestoreDataConverter<T> {
  return {
    toFirestore: (data: T) => data as FirebaseFirestore.DocumentData,
    fromFirestore: (snap: QueryDocumentSnapshot) => snap.data() as T,
  }
}

export const collections = {
  users: db.collection('users').withConverter(converter<UserDoc>()),
  departments: db.collection('departments').withConverter(converter<DepartmentDoc>()),
  leads: db.collection('leads').withConverter(converter<LeadDoc>()),
  conversations: db.collection('conversations').withConverter(converter<ConversationDoc>()),
  messages: db.collection('messages').withConverter(converter<MessageDoc>()),
  attendants: db.collection('attendants').withConverter(converter<AttendantDoc>()),
  campaigns: db.collection('campaigns').withConverter(converter<CampaignDoc>()),
  conversions: db.collection('conversions').withConverter(converter<ConversionDoc>()),
  pipelines: db.collection('pipelines').withConverter(converter<PipelineDoc>()),
  stages: db.collection('stages').withConverter(converter<StageDoc>()),
  tags: db.collection('tags').withConverter(converter<TagDoc>()),
  leadHistory: db.collection('leadHistory').withConverter(converter<LeadHistoryDoc>()),
  goals: db.collection('goals').withConverter(converter<GoalDoc>()),
  metrics: db.collection('metrics').withConverter(converter<MetricDoc>()),
  syncState: db.collection('syncState').withConverter(converter<SyncStateDoc>()),
  auditLogs: db.collection('auditLogs').withConverter(converter<AuditLogDoc>()),
  settings: db.collection('settings').withConverter(converter<SettingsDoc>()),
}
