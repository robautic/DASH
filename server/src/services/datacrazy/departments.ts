// A API do DataCrazy não expõe um endpoint dedicado de departamentos — eles
// só aparecem embutidos em outras respostas (ex.: `currentDepartment` dentro
// de uma conversa, tipado como `DataCrazyDepartment` em conversations.ts).
// Por isso esse módulo não faz chamadas HTTP nem reexporta tipo próprio (pra
// não duplicar o export de conversations.ts) — ele só deixa documentado de
// onde os departamentos vêm, para quem for popular a coleção `departments`
// do Firestore a partir da sincronização de conversas.
export {}
