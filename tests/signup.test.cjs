const {test} = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const source = fs.readFileSync(require.resolve('../assets/js/signup.js'), 'utf8');
function setup(fetcher, valid = true) {
  const button = {textContent: 'Get resource', disabled: false};
  const error = {dataset: {}, hidden: true, setAttribute(){}};
  const listeners = {};
  const form = {action: 'https://app.kit.com/forms/test/subscriptions', dataset: {successUrl:'/thank-you'},
    querySelector(selector){ return selector.startsWith('button') ? button : error; },
    reportValidity(){return valid;}, setAttribute(){}, removeAttribute(){},
    addEventListener(event,handler){listeners[event]=handler;}, appendChild(){}};
  let redirects = [], opened = 0;
  const context = {fetch:fetcher, FormData:class {}, AbortController, setTimeout, clearTimeout,
    location:{assign(url){redirects.push(url);}}, document:{querySelectorAll(){return [];},createElement(){return error;}}};
  vm.runInNewContext(source,context);
  context.WWUAIForms.bind(form,()=>opened++);
  return {form,button,error,redirects,get opened(){return opened;},submit:()=>listeners.submit({preventDefault(){}}),api:context.WWUAIForms};
}
const response = (status,ok=true,extra={})=>async()=>({ok,json:async()=>({status,...extra})});
test('confirmed Kit success unlocks once and restores the button',async()=>{const s=setup(response('success'));await s.submit();assert.equal(s.opened,1);assert.equal(s.button.disabled,false);assert.equal(s.error.hidden,true);});
test('HTTP 200 with Kit failed status does not unlock',async()=>{const s=setup(response('failed'));await s.submit();assert.equal(s.opened,0);assert.equal(s.error.hidden,false);assert.equal(s.button.textContent,'Get resource');});
test('HTTP failure cannot unlock even with a success body',async()=>{const s=setup(response('success',false));await s.submit();assert.equal(s.opened,0);assert.equal(s.error.hidden,false);});
test('network failure keeps resource closed and permits retry',async()=>{const s=setup(async()=>{throw Error('offline');});await s.submit();assert.equal(s.opened,0);assert.equal(s.error.hidden,false);assert.equal(s.form.dataset.submitting,undefined);});
test('malformed JSON keeps resource closed',async()=>{const s=setup(async()=>({ok:true,json:async()=>{throw Error('invalid JSON');}}));await s.submit();assert.equal(s.opened,0);assert.equal(s.error.hidden,false);});
test('additional consent required does not imply subscribed',async()=>{const s=setup(response('success',true,{consent:{enabled:true}}));await s.submit();assert.equal(s.opened,0);assert.equal(s.error.hidden,false);});
test('native field validation prevents any request',async()=>{let requests=0;const s=setup(async()=>{requests++;},false);await s.submit();assert.equal(requests,0);assert.equal(s.opened,0);});
test('double click only posts once while pending',async()=>{let finish,requests=0;const s=setup(()=>{requests++;return new Promise(r=>finish=r);});const pending=s.submit();assert.equal(s.button.disabled,true);await s.submit();assert.equal(requests,1);finish({ok:true,json:async()=>({status:'success'})});await pending;assert.equal(s.opened,1);});
test('duplicate binding is ignored',async()=>{const s=setup(response('success'));s.api.bind(s.form,()=>{throw Error('second binding');});await s.submit();assert.equal(s.opened,1);});
test('unknown or empty response cannot unlock',async()=>{const s=setup(response(undefined));await s.submit();assert.equal(s.opened,0);assert.equal(s.error.hidden,false);});
