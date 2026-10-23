// Optional build-time restoration of the explicitly recorded artwork files.
// Not shipped or executed by the extension. No runtime remote images.
import {writeFile,readFile} from 'node:fs/promises';
const sources=JSON.parse(await readFile(new URL('../extension/art/world-sources.json',import.meta.url),'utf8'));
for(const [file,url] of Object.entries(sources)){
  if(!/^[a-z-]+\.(png|jpg|svg)$/.test(file))throw Error('Invalid asset filename');
  const response=await fetch(url);
  if(!response.ok||!response.headers.get('content-type')?.startsWith('image/'))throw Error(`${file}: ${response.status}`);
  const data=Buffer.from(await response.arrayBuffer());
  if(data.length>8e6)throw Error('Unexpectedly large asset');
  await writeFile(new URL(`../extension/art/${file}`,import.meta.url),data);
  console.log(file,data.length);
}
