-- Controlled fixtures are rolled back; no customer messages are inspected or retained.
begin;
do $$
declare tenant uuid; actor uuid; batch jsonb; count_result integer; older jsonb;
begin
  select tenant_id,user_id into tenant,actor from public.tenant_members where role='owner' limit 1;
  if actor is null then raise exception 'No owner fixture available'; end if;
  if has_function_privilege('anon','public.ingest_extension_messages(uuid,jsonb)','execute') then raise exception 'Anonymous execute exposed'; end if;
  if has_function_privilege('anon','private.ingest_extension_messages(uuid,jsonb)','execute') then raise exception 'Anonymous private execute exposed'; end if;
  batch := jsonb_build_array(jsonb_build_object('id','false_5599999999999@c.us_FLUXOLU_TEST','chatId','5599999999999@c.us','name','Fluxolu rollback test','phone','5599999999999','direction','inbound','content','Controlled test newest','occurredAt',now()-interval '1 minute'));
  perform set_config('request.jwt.claim.sub',actor::text,true);
  perform set_config('request.jwt.claims',jsonb_build_object('sub',actor,'role','authenticated')::text,true);
  execute 'set local role authenticated';
  count_result := public.ingest_extension_messages(tenant,batch);
  if count_result <> 1 then raise exception 'Expected one insert, got %',count_result; end if;
  count_result := public.ingest_extension_messages(tenant,batch);
  if count_result <> 0 then raise exception 'Duplicate was inserted'; end if;
  older := jsonb_build_array((batch->0)||jsonb_build_object('id','true_5599999999999@c.us_FLUXOLU_TEST_OLD','direction','outbound','content','Controlled older','occurredAt',now()-interval '1 day'));
  perform public.ingest_extension_messages(tenant,older);
  if (select count(*) from public.contacts where tenant_id=tenant and external_id='5599999999999@c.us' and source='whatsapp_extension') <> 1 then raise exception 'Contact duplication'; end if;
  if (select last_message_preview from public.conversations where tenant_id=tenant and external_conversation_id='5599999999999@c.us' and source='whatsapp_extension') <> 'Controlled test newest' then raise exception 'Preview regressed'; end if;
  begin
    perform public.ingest_extension_messages(gen_random_uuid(),batch);
    raise exception 'Foreign tenant accepted';
  exception when insufficient_privilege then null; end;
  begin
    perform public.ingest_extension_messages(tenant,jsonb_build_array((batch->0)||'{"phone":"123456"}'::jsonb));
    raise exception 'Invalid phone accepted';
  exception when invalid_parameter_value then null; end;
  perform set_config('request.jwt.claim.sub','',true);
  perform set_config('request.jwt.claims','{}',true);
  begin
    perform public.ingest_extension_messages(tenant,batch);
    raise exception 'Missing session accepted';
  exception when insufficient_privilege then null; end;
end;
$$;
rollback;
select 'PASS: authenticated ingestion, idempotency, stable contact, newest preview, tenant isolation, input validation, missing session and anonymous grants; fixtures rolled back' as result;
