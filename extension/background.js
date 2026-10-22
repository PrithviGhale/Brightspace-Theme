/* Sleeps between scheduled public-release checks; never reads Brightspace tabs. */
importScripts('updates.js');
const updater=BrightUpdates.create({storage:chrome.storage.local,action:chrome.action,installed:chrome.runtime.getManifest().version});
const alarmName='after-hours-release-check';
async function schedule() {
  await chrome.alarms.create(alarmName,{periodInMinutes:360});
  await updater.check();
}
chrome.runtime.onInstalled.addListener(()=>{schedule().catch(()=>{});});
chrome.runtime.onStartup.addListener(()=>{schedule().catch(()=>{});});
chrome.alarms.onAlarm.addListener(alarm=>{if(alarm.name===alarmName)updater.check().catch(()=>{});});
chrome.runtime.onMessage.addListener((message,sender,reply)=>{
  if(sender.id!==chrome.runtime.id||sender.url!==chrome.runtime.getURL('popup.html'))return;
  if(message?.type!=='check-updates'&&message?.type!=='read-updates')return;
  (message.type==='read-updates'?updater.read():updater.check(message.force===true))
    .then(reply).catch(()=>reply({failed:true}));
  return true;
});
