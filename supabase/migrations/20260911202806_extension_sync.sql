-- Additive pilot ingestion. Existing API/webhook contacts are never merged by name.
create unique index if not exists contacts_extension_identity on public.contacts(tenant_id, external_id) where source = 'whatsapp_extension';
create unique index if not exists conversations_extension_identity on public.conversations(tenant_id, external_conversation_id) where source = 'whatsapp_extension';
create unique index if not exists messages_extension_identity on public.messages(tenant_id, external_message_id) where connection_id is null and external_message_id like 'extension:%';

create or replace function private.ingest_extension_messages(p_tenant_id uuid, p_messages jsonb)
returns integer language plpgsql security definer set search_path = '' as $$
declare m jsonb; cid uuid; vid uuid; inserted integer := 0; affected integer; occurred timestamptz; phone text;
begin
  if auth.uid() is null or not private.has_tenant_role(p_tenant_id, array['owner','admin','member']::public.tenant_role[]) then
    raise exception 'workspace_forbidden' using errcode = '42501';
  end if;
  if jsonb_typeof(p_messages) is distinct from 'array' or jsonb_array_length(p_messages) not between 1 and 50 or octet_length(p_messages::text) > 600000 then
    raise exception 'invalid_batch' using errcode = '22023';
  end if;
  -- Serializes collectors for this tenant; prevents conflicting contact creation and preview regression.
  perform pg_advisory_xact_lock(hashtextextended('extension:' || p_tenant_id::text, 0));
  for m in select value from jsonb_array_elements(p_messages) loop
    if coalesce(m->>'chatId','') !~ '^\d{5,20}@(c\.us|s\.whatsapp\.net|lid)$'
      or coalesce(m->>'direction','') not in ('inbound','outbound')
      or length(coalesce(m->>'id','')) not between 10 and 240
      or left(m->>'id', length((case when m->>'direction'='outbound' then 'true_' else 'false_' end) || (m->>'chatId') || '_')) <> ((case when m->>'direction'='outbound' then 'true_' else 'false_' end) || (m->>'chatId') || '_')
      or length(btrim(coalesce(m->>'content',''))) not between 1 and 10000
      or length(coalesce(m->>'name','')) > 100 then raise exception 'invalid_message' using errcode='22023'; end if;
    occurred := (m->>'occurredAt')::timestamptz;
    if occurred is null or occurred > now() + interval '5 minutes' or occurred < '2009-01-01'::timestamptz then raise exception 'invalid_time' using errcode='22023'; end if;
    phone := case when m->>'chatId' like '%@lid' then null else split_part(m->>'chatId','@',1) end;
    if coalesce(m->>'phone','') <> coalesce(phone,'') then raise exception 'invalid_phone' using errcode='22023'; end if;
    insert into public.contacts(tenant_id,external_id,name,phone,source,metadata)
      values(p_tenant_id,m->>'chatId',nullif(m->>'name',''),phone,'whatsapp_extension','{"capture":"rendered_text","coverage":"partial"}')
      on conflict(tenant_id,external_id) where source='whatsapp_extension' do update set name=coalesce(excluded.name,contacts.name), updated_at=now()
      returning id into cid;
    insert into public.conversations(tenant_id,contact_id,external_conversation_id,source)
      values(p_tenant_id,cid,m->>'chatId','whatsapp_extension')
      on conflict(tenant_id,external_conversation_id) where source='whatsapp_extension' do update set contact_id=excluded.contact_id
      returning id into vid;
    insert into public.messages(tenant_id,conversation_id,external_message_id,direction,content,occurred_at,metadata)
      values(p_tenant_id,vid,'extension:'||(m->>'id'),(m->>'direction')::public.message_direction,m->>'content',occurred,'{"capture":"rendered_text","coverage":"partial"}')
      on conflict(tenant_id,external_message_id) where connection_id is null and external_message_id like 'extension:%' do nothing;
    get diagnostics affected = row_count;
    inserted := inserted + affected;
    if affected > 0 then
      update public.conversations set last_message_preview=left(m->>'content',240),last_message_at=occurred,updated_at=now()
      where id=vid and (last_message_at is null or occurred >= last_message_at);
    end if;
  end loop;
  return inserted;
end;
$$;
revoke all on function private.ingest_extension_messages(uuid,jsonb) from public,anon;
grant execute on function private.ingest_extension_messages(uuid,jsonb) to authenticated;
create or replace function public.ingest_extension_messages(p_tenant_id uuid,p_messages jsonb)
returns integer language sql security invoker set search_path='' as $$ select private.ingest_extension_messages(p_tenant_id,p_messages); $$;
revoke all on function public.ingest_extension_messages(uuid,jsonb) from public,anon;
grant execute on function public.ingest_extension_messages(uuid,jsonb) to authenticated;
