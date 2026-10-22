/* Public release metadata only. Never loaded into a Brightspace content script. */
(() => {
  'use strict';
  const ENDPOINT='https://api.github.com/repos/PrithviGhale/Brightspace-Theme/releases/latest';
  const RELEASES='https://github.com/PrithviGhale/Brightspace-Theme/releases/latest';
  const INTERVAL=6*60*60*1000;
  function version(value) {
    if(typeof value!=='string'||!/^v?\d{1,6}\.\d{1,6}\.\d{1,6}$/.test(value)) return null;
    return value.replace(/^v/,'').split('.').map(Number);
  }
  function newer(latest,installed) {
    const a=version(latest),b=version(installed);
    if(!a||!b)return false;
    for(let i=0;i<3;i++){if(a[i]!==b[i])return a[i]>b[i];}
    return false;
  }
  function normalize(value) {
    return {latestVersion:version(value?.latestVersion)?value.latestVersion.replace(/^v/,''):'',
      checkedAt:Number.isFinite(value?.checkedAt)?value.checkedAt:0,
      attemptedAt:Number.isFinite(value?.attemptedAt)?value.attemptedAt:0,
      failed:value?.failed===true};
  }
  function create({storage,action,installed,request=(...args)=>globalThis.fetch(...args),now=Date.now}) {
    let pending;
    async function badge(value) {
      const available=newer(value.latestVersion,installed);
      await action.setBadgeBackgroundColor({color:'#d72f4b'});
      await action.setBadgeText({text:available?'•':''});
      await action.setTitle({title:available?`After Hours · v${value.latestVersion} available`:'Brightspace After Hours'});
      return {...value,available,installed,releaseUrl:RELEASES};
    }
    async function read() { return badge(normalize((await storage.get('updateInfo')).updateInfo)); }
    async function run(force) {
      const saved=normalize((await storage.get('updateInfo')).updateInfo);
      if(!force&&saved.attemptedAt&&now()-saved.attemptedAt<INTERVAL)return badge(saved);
      let next={...saved,attemptedAt:now()};
      try {
        const response=await request(ENDPOINT,{credentials:'omit',referrerPolicy:'no-referrer',redirect:'error',cache:'no-store',
          headers:{Accept:'application/vnd.github+json'},signal:AbortSignal.timeout(10000)});
        if(!response.ok)throw new Error('Release check unavailable');
        const release=await response.json();
        if(release.draft||release.prerelease||!version(release.tag_name))throw new Error('Invalid stable release');
        next={latestVersion:release.tag_name.replace(/^v/,''),attemptedAt:next.attemptedAt,checkedAt:now(),failed:false};
      } catch { next.failed=true; } // Keep a previously known update on offline/rate-limit failures.
      await storage.set({updateInfo:next});
      return badge(next);
    }
    function check(force=false) {
      if(!pending)pending=run(force).finally(()=>{pending=null;});
      return pending;
    }
    return Object.freeze({read,check});
  }
  globalThis.BrightUpdates=Object.freeze({ENDPOINT,RELEASES,INTERVAL,newer,normalize,create});
})();
