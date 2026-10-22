import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
const context=vm.createContext({AbortSignal});
vm.runInContext(await readFile(new URL('../extension/updates.js',import.meta.url),'utf8'),context);
const u=context.BrightUpdates;
for(const [latest,current,expected] of [['1.5.1','1.5.0',true],['v1.10.0','1.9.9',true],['2.0.0','1.99.9',true],['1.5.0','1.5.0',false],['1.3.0','1.5.0',false],['1.6.0-beta','1.5.0',false],['bad','1.5.0',false]])assert.equal(u.newer(latest,current),expected);
let saved={},clock=1000,calls=0,payload={tag_name:'v1.6.0'},fail=false,badge='',title='';
const requests=[];
const storage={get:async()=>saved,set:async patch=>{saved={...saved,...patch};}};
const action={setBadgeBackgroundColor:async()=>{},setBadgeText:async v=>{badge=v.text;},setTitle:async v=>{title=v.title;}};
const updater=u.create({storage,action,installed:'1.5.0',now:()=>clock,request:async(url,options)=>{
  calls++;requests.push({url,options});await new Promise(r=>setTimeout(r,5));if(fail)throw new Error('offline');return {ok:true,json:async()=>payload};
}});
const [a,b]=await Promise.all([updater.check(),updater.check(true)]);
assert(a.available&&b.available);assert.equal(calls,1);assert.equal(badge,'•');assert.match(title,/1.6.0/);
await updater.check();assert.equal(calls,1,'cached popup/startup checks must not repeatedly contact GitHub');
assert.equal(requests[0].url,u.ENDPOINT);assert.equal(requests[0].options.credentials,'omit');assert.equal(requests[0].options.redirect,'error');assert.equal(requests[0].options.referrerPolicy,'no-referrer');
fail=true;clock+=u.INTERVAL;
const offline=await updater.check();assert(offline.failed&&offline.available);assert.equal(badge,'•','offline checks retain known updates');
fail=false;payload={tag_name:'v1.5.0'};
assert.equal((await updater.check(true)).available,false);assert.equal(badge,'');
for(const invalid of [{tag_name:'v8.0.0',prerelease:true},{tag_name:'v8.0.0',draft:true},{tag_name:'https://outside.invalid'}]) {
  payload=invalid;assert((await updater.check(true)).failed);assert.equal(saved.updateInfo.latestVersion,'1.5.0');
}
payload={tag_name:'v1.6.0',html_url:'https://outside.invalid'};
const validated=await updater.check(true);assert.equal(validated.releaseUrl,u.RELEASES,'release links never come from network data');
const installed=u.create({storage,action,installed:'1.6.0'});
assert.equal((await installed.read()).available,false);assert.equal(badge,'','installing the available version clears the dot');
console.log('PASS: stable version ordering, request deduplication/cache, fixed public endpoint, no credentials/referrer, invalid releases, offline retention, fixed release link and badge clearing after update.');
