import test from 'node:test'
import assert from 'node:assert/strict'
import {connectionError,isMetaOrigin} from '../src/lib/whatsapp-onboarding.ts'
test('shows actionable setup error from non-2xx function response',async()=>{
 const error={context:new Response(JSON.stringify({error:'meta_app_not_configured'}),{status:503})}
 assert.match(await connectionError(error),/ativada pelo administrador/)
})
test('handles expired session without exposing raw gateway details',async()=>{
 assert.match(await connectionError({context:new Response('private diagnostics',{status:401})}),/sessão expirou/)
})
test('handles non-JSON gateway failure',async()=>{
 assert.match(await connectionError({context:new Response('<html>bad gateway</html>',{status:502})}),/Não foi possível/)
})
test('handles application errors in successful HTTP response',async()=>{
 assert.match(await connectionError(null,{error:'meta_code_exchange_failed'}),/expirou/)
})
test('ignores unknown raw backend details',async()=>{
 const result=await connectionError(null,{error:'unknown',message:'secret diagnostic'})
 assert.doesNotMatch(result,/secret/)
})
test('only accepts HTTPS Facebook message origins',()=>{
 assert.equal(isMetaOrigin('https://www.facebook.com'),true)
 assert.equal(isMetaOrigin('https://facebook.com'),true)
 for(const origin of ['http://facebook.com','https://facebook.com.evil.test','https://evilfacebook.com','null','https://example.com']){
  assert.equal(isMetaOrigin(origin),false,origin)
 }
})
