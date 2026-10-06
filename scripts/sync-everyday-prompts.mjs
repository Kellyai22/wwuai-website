// The audit owns these eight prompt texts. Keep its direct-access resource in sync.
// Run after editing a prompt in hours.html; --check detects drift without writing.
import {readFileSync,writeFileSync} from 'node:fs';
const root=new URL('../',import.meta.url);
const source=readFileSync(new URL('hours.html',root),'utf8');
const target=new URL('tools-everyday-jobs.html',root);
const original=readFileSync(target,'utf8');
let output=original;
for(const id of ['same','chasing','email','content','finding','admin','deciding','home']){
 const match=source.match(new RegExp('<div class="prompt-body" id="p-'+id+'">([\\s\\S]*?)</div>'));
 if(!match)throw new Error('Missing audit prompt: '+id);
 const pattern=new RegExp('(<pre id="prompt-'+id+'">)[\\s\\S]*?(</pre>)');
 if(!pattern.test(output))throw new Error('Missing resource prompt: '+id);
 output=output.replace(pattern,(_,start,end)=>start+match[1]+end);
}
if(process.argv.includes('--check')){
 // Compare decoded text because equivalent HTML entity escaping need not match byte-for-byte.
 const decode=s=>s.replace(/&#x27;|&#39;/g,"'").replace(/&quot;/g,'"').replace(/&gt;/g,'>').replace(/&lt;/g,'<').replace(/&amp;/g,'&');
 if(decode(output)!==decode(original)){console.error('Everyday prompts have drifted. Run node scripts/sync-everyday-prompts.mjs');process.exit(1)}
 console.log('Everyday prompts match the audit.');
}else{writeFileSync(target,output);console.log('Updated everyday prompts from hours.html.');}
