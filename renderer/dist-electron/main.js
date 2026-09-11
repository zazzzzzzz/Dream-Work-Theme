"use strict";var rn=Object.defineProperty;var an=(e,n,t)=>n in e?rn(e,n,{enumerable:!0,configurable:!0,writable:!0,value:t}):e[n]=t;var U=(e,n,t)=>an(e,typeof n!="symbol"?n+"":n,t);const A=require("electron"),on=require("path"),sn=require("fs"),cn=require("os"),Ue=require("child_process"),nt=require("util"),ln=require("http"),dn=require("net"),mn=require("fs/promises"),un=require("crypto"),pn=require("zlib");function ce(e){const n=Object.create(null,{[Symbol.toStringTag]:{value:"Module"}});if(e){for(const t in e)if(t!=="default"){const r=Object.getOwnPropertyDescriptor(e,t);Object.defineProperty(n,t,r.get?r:{enumerable:!0,get:()=>e[t]})}}return n.default=e,Object.freeze(n)}const d=ce(on),f=ce(sn),N=ce(cn),_t=ce(ln),Mt=ce(dn),rt=ce(un),G=process.env.LOCALAPPDATA||d.join(N.homedir(),"AppData","Local"),gt=process.env.APPDATA||d.join(N.homedir(),"AppData","Roaming"),Q=process.env.ProgramFiles||"C:\\Program Files",ze=process.env["ProgramFiles(x86)"]||"C:\\Program Files (x86)",Oe=[{id:"workbuddy",name:"WorkBuddy",exeNames:["WorkBuddy.exe"],processName:"WorkBuddy.exe",defaultPort:9339,installPaths:[d.join(G,"workbuddy"),d.join(G,"Programs","workbuddy"),d.join(Q,"WorkBuddy"),d.join(ze,"WorkBuddy"),"D:\\Program Files\\WorkBuddy"],rendererHints:["app.asar/renderer/index.html","renderer/index.html","index.html"],kind:"workbuddy"},{id:"codex",name:"Codex",exeNames:["ChatGPT.exe","Codex.exe"],processName:"ChatGPT.exe",defaultPort:9340,installPaths:[d.join(G,"Programs","Codex"),d.join(G,"Programs","OpenAI","Codex"),d.join(Q,"Codex"),d.join(ze,"Codex"),"D:\\Program Files\\Codex"],rendererHints:["index.html","renderer/index.html"],kind:"codex"},{id:"trae-work",name:"TRAE Work",exeNames:["TRAE SOLO CN.exe","TRAE Work CN.exe"],processName:"TRAE SOLO CN.exe",defaultPort:9341,installPaths:["D:\\Program Files\\TRAE SOLO CN",d.join(G,"Programs","TRAE SOLO CN"),d.join(Q,"TRAE SOLO CN")],rendererHints:["solo/solo-lite.html","solo-lite.html"],kind:"vscode-work"},{id:"qoder-work",name:"QoderWork",exeNames:["QoderWork CN.exe","QoderWork.exe"],processName:"QoderWork CN.exe",defaultPort:9342,installPaths:["D:\\Program Files\\QoderWork CN",d.join(G,"Programs","QoderWork CN"),d.join(Q,"QoderWork CN")],rendererHints:["out/renderer/index.html","renderer/index.html"],kind:"generic-work",devToolsActivePort:d.join(gt,"QoderWork CN","DevToolsActivePort")},{id:"catpaw",name:"CatPaw",exeNames:["CatPaw.exe"],processName:"CatPaw.exe",defaultPort:9343,installPaths:[d.join(G,"CatPaw"),d.join(G,"Programs","CatPaw"),d.join(Q,"CatPaw")],rendererHints:["app.asar/dist/index.html","dist/index.html"],kind:"generic-work"},{id:"zcode",name:"ZCode",exeNames:["ZCode.exe"],processName:"ZCode.exe",defaultPort:9344,installPaths:["D:\\Program Files\\ZCode",d.join(G,"Programs","ZCode"),d.join(Q,"ZCode")],rendererHints:["out/renderer/index.html","renderer/index.html"],kind:"generic-work"},{id:"qwen-office",name:"千问办公",exeNames:["QwenWorkCN.exe"],processName:"QwenWorkCN.exe",defaultPort:9345,installPaths:["D:\\Program Files\\QwenWorkCN",d.join(G,"Programs","QwenWorkCN"),d.join(Q,"QwenWorkCN")],rendererHints:["out/renderer/index.html","renderer/index.html"],kind:"generic-work",devToolsActivePort:d.join(gt,"QwenWorkCN","DevToolsActivePort")},{id:"hana-agent",name:"HanaAgent",exeNames:["HanaAgent.exe"],processName:"HanaAgent.exe",defaultPort:9346,installPaths:[d.join(G,"Programs","HanaAgent"),d.join(Q,"HanaAgent"),d.join(ze,"HanaAgent")],rendererHints:[".hanako/artifacts/renderer/","artifacts/renderer/","/index.html"],kind:"generic-work"}];function W(e){return Oe.find(n=>n.id===e)}const _e=1;function hn(){const e=Be().paths;return Oe.map(n=>{const t=e[n.id];return{appId:n.id,name:n.name,exeNames:[...n.exeNames],customPath:t,customPathStatus:t?at(n.id,t)?"valid":"invalid":"none"}})}function gn(e){const n=Be().paths[e];return n&&at(e,n)?n:void 0}function fn(e,n){const t=W(e);if(!t)throw new Error(`Unknown app: ${e}`);if(!at(e,n))throw new Error(`请选择 ${t.name} 的可执行文件（${t.exeNames.join(" 或 ")}）`);const r=Be();return r.paths[e]=d.resolve(n),At(r),r.paths[e]}function bn(e){if(!W(e))throw new Error(`Unknown app: ${e}`);const n=Be();delete n.paths[e],At(n)}function at(e,n){const t=W(e);if(!t||!n||typeof n!="string")return!1;try{if(!f.statSync(n).isFile())return!1}catch{return!1}const r=d.basename(n).toLowerCase();return t.exeNames.some(a=>a.toLowerCase()===r)}function It(){return d.join(A.app.getPath("userData"),"app-paths.json")}function Be(){try{const e=JSON.parse(f.readFileSync(It(),"utf8"));if(!e||typeof e!="object"||Array.isArray(e))return qe();const n=e;if(n.version!==_e||!n.paths||typeof n.paths!="object"||Array.isArray(n.paths))return qe();const t={};for(const[r,a]of Object.entries(n.paths))W(r)&&typeof a=="string"&&a.trim()&&(t[r]=a);return{version:_e,paths:t}}catch{return qe()}}function qe(){return{version:_e,paths:{}}}function At(e){const n=It();f.mkdirSync(d.dirname(n),{recursive:!0}),f.writeFileSync(n,`${JSON.stringify({version:_e,paths:e.paths},null,2)}
`,"utf8")}const xn=nt.promisify(Ue.execFile);async function Pt(e){const n=W(e);if(!n)return null;const t=gn(e);if(t)return t;const r=wn(n.exeNames,n.installPaths);if(r)return r;const a=yn(n);if(a)return a;if(e==="codex"){const o=vn();return o||kn()}return null}function wn(e,n){for(const t of n)if(!(!t||!f.existsSync(t)))try{if(f.statSync(t).isFile()&&Cn(t,e))return t;for(const a of e){const o=d.join(t,a);if(be(o))return o}const r=f.readdirSync(t,{withFileTypes:!0}).filter(a=>a.isDirectory()).sort((a,o)=>o.name.localeCompare(a.name,void 0,{numeric:!0}));for(const a of r)for(const o of e){const s=d.join(t,a.name,o);if(be(s))return s}}catch{}return null}function yn(e){const n=[process.env.ProgramFiles,process.env["ProgramFiles(x86)"]].filter(t=>!!t);for(const t of n)if(f.existsSync(t))try{const r=f.readdirSync(t).find(a=>a.toLowerCase().includes(e.id.replace("-",""))||a.toLowerCase().includes(e.name.toLowerCase()));if(!r)continue;for(const a of e.exeNames){const o=d.join(t,r,a);if(be(o))return o}}catch{}return null}function vn(){const e=d.join(process.env.ProgramFiles||"C:\\Program Files","WindowsApps");if(!f.existsSync(e))return null;try{for(const n of f.readdirSync(e)){if(!/^OpenAI\.Codex_\d+/i.test(n))continue;const t=d.join(e,n,"app","ChatGPT.exe");if(be(t))return t}}catch{}return null}async function kn(){const e=`
$ErrorActionPreference = 'SilentlyContinue'
$package = Get-AppxPackage -Name 'OpenAI.Codex' -ErrorAction SilentlyContinue
if (-not $package) { exit 1 }
$manifest = Get-AppxPackageManifest -Package $package.PackageFullName
$rel = [string]$manifest.Package.Applications.Application.Executable
if (-not $rel) { exit 1 }
$full = Join-Path $package.InstallLocation $rel
if (Test-Path -LiteralPath $full -PathType Leaf) { Write-Output $full } else { exit 1 }
`;try{const{stdout:n}=await xn("powershell.exe",["-NoLogo","-NoProfile","-NonInteractive","-ExecutionPolicy","Bypass","-Command",e],{encoding:"utf8",maxBuffer:4194304}),t=n.trim();return be(t)?t:null}catch{return null}}function Cn(e,n){const t=d.basename(e).toLowerCase();return n.some(r=>r.toLowerCase()===t)}function be(e){try{return f.statSync(e).isFile()}catch{return!1}}async function Sn(){if(N.platform()!=="win32")return[];const e=[];for(const n of Oe){const t=await Pt(n.id);t&&e.push({appId:n.id,name:n.name,path:t})}return e}const ft=nt.promisify(Ue.execFile);async function Tn(e){const n=W(e);if(!n)return!1;const t=[...new Set([n.processName,...n.exeNames].filter(Boolean))];if(N.platform()==="win32"){for(const r of t)try{const{stdout:a}=await ft("tasklist.exe",["/FI",`IMAGENAME eq ${r}`,"/FO","CSV","/NH"],{encoding:"utf8",windowsHide:!0});if(a.split(/\r?\n/).some(o=>o.trim().toLowerCase().startsWith(`"${r.toLowerCase()}"`)))return!0}catch{}return!1}for(const r of t)try{return await ft("pgrep",["-f",r],{encoding:"utf8"}),!0}catch{}return!1}async function Rt(e,n){if(!/^[a-z0-9-]+$/i.test(e||""))return{success:!1,error:`Invalid appId: ${e}`};if(n!=null&&!/^[a-z0-9._-]+$/i.test(n))return{success:!1,error:`Invalid themeId: ${n}`};const t=W(e);if(!t)return{success:!1,error:`Unknown app: ${e}`};const r=t.defaultPort,a=[`--remote-debugging-port=${r}`];e==="codex"&&a.push("--disable-extensions"),n&&a.push(`--dream-theme=${n}`);try{const o=await Dn(e);if(!o||!f.existsSync(o)||!f.statSync(o).isFile())return{success:!1,error:`Executable not found: ${o}`};if(N.platform()==="win32"&&!/\.exe$/i.test(o))return{success:!1,error:`Refusing to launch non-executable path: ${o}`};if(console.log(`[launcher] Killing existing ${e} instances...`),await Pn(e),await Rn(r,15e3),t.devToolsActivePort)try{f.unlinkSync(t.devToolsActivePort)}catch{}console.log(`[launcher] Launching ${o} with args: ${a.join(" ")}`);const s=Ue.spawn(o,a,{detached:!0,stdio:"ignore",env:$n()});s.unref(),console.log(`[launcher] Spawned process with PID: ${s.pid}`),console.log(`[launcher] Waiting for CDP port ${r} to be ready...`);let c=r;return t.devToolsActivePort?c=await En(t.devToolsActivePort,t.rendererHints,3e4):await In(r,3e4),console.log(`[launcher] CDP port ${c} is ready`),e==="hana-agent"&&await Mn(c,t.rendererHints,3e4),{success:!0,port:c}}catch(o){return console.error("[launcher] Launch failed:",o),{success:!1,error:o.message}}}function $n(){const e={...process.env};for(const n of["VITE_DEV_SERVER_URL","ELECTRON_RENDERER_URL","MAIN_VITE_DEV_SERVER_URL","ELECTRON_RUN_AS_NODE"])delete e[n];return e}async function En(e,n,t){const r=Date.now();let a=0;for(;Date.now()-r<t;){try{const o=f.readFileSync(e,"utf8").split(/\r?\n/,1)[0],s=Number(o);if(Number.isInteger(s)&&s>0)return a=s,await _n(s,n,3e3),s}catch{}await new Promise(o=>setTimeout(o,500))}throw new Error(`DevToolsActivePort did not expose a live renderer${a?` on port ${a}`:""}: ${e}`)}async function _n(e,n,t){const r=Date.now();for(;Date.now()-r<t;){try{const a=await fetch(`http://127.0.0.1:${e}/json/list`,{signal:AbortSignal.timeout(1e3)});if(a.ok){const o=await a.json();if(Array.isArray(o)&&o.some(s=>(s==null?void 0:s.type)==="page"&&n.some(c=>String(s.url).includes(c))))return}}catch{}await new Promise(a=>setTimeout(a,250))}throw new Error(`CDP renderer endpoint is not ready on port ${e}`)}async function Mn(e,n,t){const r=Date.now();let a="",o=0;for(;Date.now()-r<t;){try{const i=(await(await fetch(`http://127.0.0.1:${e}/json/list`,{signal:AbortSignal.timeout(1e3)})).json()).find(l=>(l==null?void 0:l.type)==="page"&&n.some(u=>String(l.url).includes(u)));if(i!=null&&i.id){if(i.id!==a)a=i.id,o=Date.now();else if(Date.now()-o>=3e3){console.log(`[launcher] Stable HanaAgent renderer ${a} confirmed`);return}}}catch{}await new Promise(s=>setTimeout(s,250))}throw new Error(`HanaAgent renderer did not stabilize on port ${e}`)}async function In(e,n){const t=Date.now();let r="unknown";for(;Date.now()-t<n;)try{await new Promise((a,o)=>{const s=Mt.createConnection(e,"127.0.0.1",()=>{s.end(),a()});s.once("error",c=>{r=c.message,o(c)}),setTimeout(()=>{s.destroy(),o(new Error("timeout"))},1e3)}),console.log(`[launcher] Port ${e} is open, verifying CDP endpoint...`),await An(e,15e3),console.log(`[launcher] CDP endpoint verified on port ${e}`);return}catch(a){r=a.message,console.log(`[launcher] Port check failed: ${a.message}, retrying...`),await new Promise(o=>setTimeout(o,1e3))}throw new Error(`CDP port ${e} did not become ready within ${n}ms (last error: ${r})`)}async function An(e,n){const t=Date.now();for(;Date.now()-t<n;)try{await new Promise((r,a)=>{const o=_t.request({hostname:"127.0.0.1",port:e,path:"/json/version",method:"GET",timeout:2e3},s=>{let c="";s.on("data",i=>{c+=i}),s.on("end",()=>{s.statusCode===200?(console.log(`[launcher] CDP version response: ${c.substring(0,200)}`),r()):a(new Error(`HTTP ${s.statusCode}`))})});o.on("error",a),o.on("timeout",()=>{o.destroy(),a(new Error("timeout"))}),o.end()});return}catch(r){if(Date.now()-t>=n)throw r;await new Promise(a=>setTimeout(a,1e3))}}async function Pn(e){const n=N.platform(),t=W(e);if(!t)return;const r=[...new Set([t.processName,...t.exeNames].filter(Boolean))];try{if(n==="win32"){const{spawnSync:a}=require("child_process");for(const o of r)try{a("taskkill",["/T","/F","/IM",o],{stdio:"ignore"}),console.log(`[launcher] Killed existing ${o} process tree`)}catch{}}else if(n==="darwin"){const{spawnSync:a}=require("child_process");for(const o of r)try{a("pkill",["-f",o],{stdio:"ignore"}),console.log(`[launcher] Killed existing ${o} processes`)}catch{}}else if(n==="linux"){const{spawnSync:a}=require("child_process");for(const o of r)try{a("pkill",["-f",o],{stdio:"ignore"}),console.log(`[launcher] Killed existing ${o} processes`)}catch{}}}catch(a){console.warn("[launcher] Failed to kill existing instances:",a)}}async function Rn(e,n){const t=Date.now();for(;Date.now()-t<n;){if(!await new Promise(a=>{const o=Mt.createConnection(e,"127.0.0.1");o.once("connect",()=>{o.destroy(),a(!0)}),o.once("error",()=>a(!1)),o.setTimeout(500,()=>{o.destroy(),a(!1)})})){console.log(`[launcher] Previous CDP port ${e} is closed`);return}await new Promise(a=>setTimeout(a,250))}throw new Error(`Existing ${e} CDP service did not stop; refusing to inject into the old application instance`)}async function Dn(e){if(!W(e))throw new Error(`Unknown app: ${e}`);const t=N.platform();if(t==="win32"){const r=await Pt(e);if(r)return r}else if(t==="darwin"){const r=["/Applications/WorkBuddy.app","/Applications/ChatGPT.app"];for(const a of r)if(f.existsSync(a))return a}else if(t==="linux"){const r=e==="workbuddy"?["workbuddy","WorkBuddy"]:["codex","Codex"],a=["/usr/bin","/usr/local/bin","/opt",d.join(N.homedir(),".local","bin"),"/snap/bin"];for(const o of a)if(f.existsSync(o))for(const s of r){const c=d.join(o,s);if(f.existsSync(c))return c}for(const o of r)try{const{spawnSync:s}=require("child_process"),c=s("which",[o],{encoding:"utf8"}),i=String(c.stdout||"").trim();if(i&&f.existsSync(i))return i}catch{}}throw new Error(`Could not find ${e} executable`)}const Un=5e3,On=100,Bn=15e3,jn=1e4,Nn=5e3;function Ln(e){if(!Number.isInteger(e)||e<1024||e>65535)throw new TypeError("port must be an integer from 1024 through 65535");return e}function ae(e,n,t={}){const r=t.allowZero?0:Number.EPSILON;if(!Number.isFinite(e)||e<r){const a=t.allowZero?"non-negative":"positive";throw new TypeError(`${n} must be a finite ${a} number`)}return e}function Dt(e){if(typeof e!="string"||e.length===0||e!==e.trim())throw new TypeError("webSocketDebuggerUrl must be a non-empty URL string");let n;try{n=new URL(e)}catch(t){throw new TypeError(`webSocketDebuggerUrl is invalid: ${t.message}`)}if(n.protocol!=="ws:"||n.hostname!=="127.0.0.1"||n.username||n.password||n.hash||!n.port)throw new TypeError("webSocketDebuggerUrl must use ws://127.0.0.1 with an explicit port");return Ln(Number(n.port)),n}function Wn(e,n){if(e===null||typeof e!="object"||Array.isArray(e)||e.type!=="page"||typeof e.url!="string"||typeof e.webSocketDebuggerUrl!="string")return!1;try{Dt(e.webSocketDebuggerUrl)}catch{return!1}return e.url.includes(n)}function je(e){if(e===null||typeof e!="object"||Array.isArray(e)||e.type!=="page"||typeof e.url!="string"||typeof e.webSocketDebuggerUrl!="string")return!1;try{return Dt(e.webSocketDebuggerUrl),!0}catch{return!1}}function Hn(e){return new Promise(n=>setTimeout(n,e))}async function bt(e,n){const t=Math.max(0,n.deadline-Date.now());let r=null;try{return await Promise.race([e,new Promise((a,o)=>{r=setTimeout(()=>{var s;(s=n.onTimeout)==null||s.call(n),o(new Error(`${n.label} timed out after ${n.timeoutMs}ms`))},t)})])}finally{r&&clearTimeout(r)}}async function le(e,n,t={}){const r=ae(t.timeoutMs??Nn,"timeoutMs",{allowZero:!1}),a=t.fetchImpl??globalThis.fetch;if(typeof a!="function")throw new TypeError("fetchImpl must be a function");const o=`http://127.0.0.1:${e}/json/list`,s=new AbortController,c=Date.now()+r,i=t.quiet===!0;i||console.log(`[cdp] fetchRendererTargets: port=${e}, timeoutMs=${r}, endpoint=${o}`);let l;try{l=await bt(Promise.resolve(a(o,{redirect:"error",signal:s.signal})),{deadline:c,timeoutMs:r,label:"renderer target discovery",onTimeout:()=>s.abort()})}catch(p){throw i||console.log("[cdp] fetchRendererTargets error:",p),new Error(`failed to fetch renderer targets from ${o}: ${p.message}`)}if(l===null||typeof l!="object"||!l.ok)throw new Error(`renderer target discovery failed with HTTP ${(l==null?void 0:l.status)??"unknown"}`);let u;try{u=await bt(Promise.resolve(l.json()),{deadline:c,timeoutMs:r,label:"renderer target discovery JSON",onTimeout:()=>s.abort()})}catch(p){throw new Error(`malformed renderer target JSON from ${o}: ${p.message}`)}if(!Array.isArray(u))throw new Error("malformed renderer target JSON: expected an array");return u.filter(p=>Wn(p,n)).sort(zn)}async function Fn(e,n,t={}){const r=ae(t.timeoutMs??Un,"timeoutMs",{allowZero:!0}),a=ae(t.pollMs??On,"pollMs",{allowZero:!1}),o=t.fetchImpl??globalThis.fetch;let s=0;const c=Date.now()+r;let i=new Error("no renderer discovery attempt completed");for(console.log(`[cdp] waitForRendererTargets: port=${e}, hint=${n}, timeoutMs=${r}`);;){try{const u=Math.max(1,Math.min(r-s,c-Date.now()));console.log(`[cdp] Attempting fetch: elapsed=${s}ms, remainingBudget=${u}ms, deadline=${c}`);const p=await le(e,n,{fetchImpl:o,timeoutMs:u});if(p.length>0)return p;i=new Error("no matching renderer/index.html page targets")}catch(u){i=u instanceof Error?u:new Error(String(u)),console.log("[cdp] Fetch error:",i.message)}if(s>=r||Date.now()>=c)throw new Error(`timed out after ${r}ms waiting for renderer targets on 127.0.0.1:${e}: ${i.message}`);const l=Math.min(a,r-s);await Hn(l),s+=l}}class J{constructor(n,t={}){U(this,"webSocketDebuggerUrl");U(this,"WebSocketImpl");U(this,"commandTimeoutMs");U(this,"connectTimeoutMs");U(this,"socket",null);U(this,"nextRequestId",1);U(this,"pending",new Map);U(this,"socketOpen",!1);U(this,"opened",!1);U(this,"closed",!1);U(this,"closeStarted",!1);U(this,"terminalError",null);U(this,"openPromise",null);U(this,"resolveOpen",null);U(this,"rejectOpen",null);U(this,"connectTimer",null);this.webSocketDebuggerUrl=n;let r=null,a=null;try{r=require("ws")??null,r||(a="ws loaded but WebSocket is undefined")}catch(o){a=`ws require failed: ${(o==null?void 0:o.message)??o}`}if(!r)try{const o=require("undici");r=(o==null?void 0:o.WebSocket)??null,r||(a="undici loaded but WebSocket is undefined")}catch(o){a=`undici require failed: ${(o==null?void 0:o.message)??o}`}if(!r&&typeof globalThis.WebSocket=="function"&&(r=globalThis.WebSocket,a=null),!r){const o=a?` (${a})`:"";throw new Error(`No WebSocket implementation available for CDP${o}`)}this.WebSocketImpl=t.WebSocketImpl??r,this.commandTimeoutMs=ae(t.commandTimeoutMs??Bn,"commandTimeoutMs"),this.connectTimeoutMs=ae(t.connectTimeoutMs??jn,"connectTimeoutMs")}open(){if(this.closed)return Promise.reject(this.terminalError??new Error("CDP session is closed"));if(this.opened)return Promise.resolve(this);if(this.openPromise)return this.openPromise;this.openPromise=new Promise((t,r)=>{this.resolveOpen=t,this.rejectOpen=r}),this.connectTimer=setTimeout(()=>{this.terminate(new Error(`CDP WebSocket connect timed out after ${this.connectTimeoutMs}ms`)),this.closeSocket()},this.connectTimeoutMs);try{this.socket=new this.WebSocketImpl(this.webSocketDebuggerUrl)}catch(t){return this.terminate(new Error(`failed to open CDP WebSocket: ${t.message}`)),this.openPromise}const n=this.socket;return n.onopen=()=>{this.closed||this.socketOpen||(this.clearConnectTimer(),this.socketOpen=!0,Promise.all([this.send("Runtime.enable"),this.send("Page.enable")]).then(()=>{if(this.closed)return;this.opened=!0;const t=this.resolveOpen;this.resolveOpen=null,this.rejectOpen=null,t==null||t(this)}).catch(t=>{this.terminate(t),this.closeSocket()}))},n.onmessage=t=>this.handleMessage(t),n.onerror=t=>{const r=t.error,a=r instanceof Error?r.message:typeof t.message=="string"&&t.message.length>0?t.message:"unknown socket error";this.terminate(new Error(`CDP WebSocket error: ${a}`)),this.closeSocket()},n.onclose=()=>{this.closeStarted=!0,this.terminate(new Error("CDP WebSocket closed"))},this.openPromise}send(n,t={},r={}){if(this.closed)return Promise.reject(this.terminalError??new Error("CDP session is closed"));if(!this.socketOpen||!this.socket)return Promise.reject(new Error("CDP session is not open"));if(typeof n!="string"||n.length===0)return Promise.reject(new TypeError("CDP method must be a non-empty string"));const a=ae(r.timeoutMs??this.commandTimeoutMs,"timeoutMs"),o=this.nextRequestId++;return new Promise((s,c)=>{const i=setTimeout(()=>{this.pending.delete(o),c(new Error(`CDP ${n} timed out after ${a}ms`))},a);this.pending.set(o,{resolve:s,reject:c,timer:i});try{this.socket.send(JSON.stringify({id:o,method:n,params:t}))}catch(l){clearTimeout(i),this.pending.delete(o),c(new Error(`failed to send CDP ${n}: ${l.message}`))}})}async evaluate(n,t={}){var a,o,s;if(typeof n!="string")throw new TypeError("Runtime.evaluate expression must be a string");const r=await this.send("Runtime.evaluate",{expression:n,awaitPromise:!0,returnByValue:!0},t);if(r!=null&&r.exceptionDetails)throw new Error(`Runtime.evaluate failed: ${((a=r.exceptionDetails.exception)==null?void 0:a.description)??r.exceptionDetails.text??"unknown JavaScript exception"}`);if(((o=r==null?void 0:r.result)==null?void 0:o.type)!=="undefined")return(s=r==null?void 0:r.result)==null?void 0:s.value}async addScriptToEvaluateOnNewDocument(n){const t=await this.send("Page.addScriptToEvaluateOnNewDocument",{source:n});return t==null?void 0:t.identifier}async removeScriptToEvaluateOnNewDocument(n){await this.send("Page.removeScriptToEvaluateOnNewDocument",{identifier:n})}close(){this.closeStarted||(this.terminate(new Error("CDP session closed by client")),this.closeSocket())}handleMessage(n){if(typeof n.data!="string"){this.terminate(new Error("received a non-text CDP WebSocket message")),this.closeSocket();return}let t;try{t=JSON.parse(n.data)}catch(a){this.terminate(new Error(`received malformed CDP JSON: ${a.message}`)),this.closeSocket();return}if(!Number.isInteger(t==null?void 0:t.id))return;const r=this.pending.get(t.id);if(r){if(this.pending.delete(t.id),clearTimeout(r.timer),t.error){r.reject(new Error(`CDP error: ${t.error.message}`));return}r.resolve(t.result)}}terminate(n){if(this.terminalError)return;this.clearConnectTimer(),this.terminalError=n,this.closed=!0,this.socketOpen=!1;const t=this.rejectOpen;this.resolveOpen=null,this.rejectOpen=null,t==null||t(n);for(const{reject:r,timer:a}of this.pending.values())clearTimeout(a),r(n);this.pending.clear()}clearConnectTimer(){this.connectTimer!==null&&(clearTimeout(this.connectTimer),this.connectTimer=null)}closeSocket(){if(this.closeStarted||(this.closeStarted=!0,!this.socket||typeof this.socket.close!="function"))return;const n=this.WebSocketImpl.CLOSING??2,t=this.WebSocketImpl.CLOSED??3;this.socket.readyState===n||this.socket.readyState===t||this.socket.close()}}function zn(e,n){const t=[String(e.id??""),e.url,e.webSocketDebuggerUrl],r=[String(n.id??""),n.url,n.webSocketDebuggerUrl];for(let a=0;a<t.length;a++){if(t[a]<r[a])return-1;if(t[a]>r[a])return 1}return 0}function qn(){return d.join(A.app.getAppPath(),"themes")}function Ut(){const e=d.join(A.app.getPath("userData"),"themes");return f.mkdirSync(e,{recursive:!0}),e}function Vn(){return[Ut(),qn()]}const xt=new Map;function Ne(e){var a;const n=[],t=new Set;for(const o of Vn()){if(!f.existsSync(o))continue;const s=f.readdirSync(o,{withFileTypes:!0});for(const c of s){if(!c.isDirectory())continue;const i=d.join(o,c.name),l=d.join(i,"theme.json");if(f.existsSync(l))try{const u=JSON.parse(f.readFileSync(l,"utf-8")),p=Yn(u);if(t.has(p.id))continue;const h=d.join(i,p.hero);if(!f.existsSync(h)||!f.statSync(h).isFile())throw new Error(`theme hero is missing: ${p.hero}`);if(e&&((a=p.apps[e])==null?void 0:a.compat)!==!0&&e!=="hana-agent")continue;t.add(p.id),n.push({id:p.id,name:p.name,author:p.author,path:i,manifest:p})}catch(u){console.error(`Failed to load theme ${c.name}:`,u)}}}const r=new Map;for(const o of n){const s=d.join(o.path,o.manifest.hero),c=Ye(s),i=`${o.name.trim().toLocaleLowerCase()}\0${o.author.trim().toLocaleLowerCase()}\0${c}`,l=r.get(i);(!l||Gn(o.id,l.id))&&r.set(i,o)}return[...r.values()].sort((o,s)=>o.name.localeCompare(s.name))}function Ye(e){const n=f.statSync(e),t=xt.get(e);if(t&&t.size===n.size&&t.mtimeMs===n.mtimeMs)return t.hash;const r=rt.createHash("sha256").update(f.readFileSync(e)).digest("hex");return xt.set(e,{size:n.size,mtimeMs:n.mtimeMs,hash:r}),r}function Gn(e,n){const t=e.startsWith("custom-"),r=n.startsWith("custom-");return t!==r?!t:e.length<n.length||e.length===n.length&&e.localeCompare(n)<0}function Ot(e,n){return Ne(n).find(t=>t.id===e)}function Jn(e){const n=Ot(e);if(!n)return;const t=d.resolve(n.path,n.manifest.hero);if(t.startsWith(`${d.resolve(n.path)}${d.sep}`))return t}function Kn(e){return`theme-asset://local/${encodeURIComponent(e)}`}function Zn(e){const n=d.resolve(e.path),t=d.resolve(n,e.manifest.hero);if(t!==n&&!t.startsWith(n+d.sep))throw new Error(`Theme hero path escapes theme directory: ${e.manifest.hero}`);const r=f.readFileSync(t);return`data:${Qn(e.manifest.hero)};base64,${r.toString("base64")}`}function Xn(e,n,t){const r=Ye(t);return Ne().some(a=>a.name.trim().toLowerCase()!==e.trim().toLowerCase()||a.author.trim().toLowerCase()!==n.trim().toLowerCase()?!1:Ye(d.join(a.path,a.manifest.hero))===r)}function Yn(e){if(typeof e!="object"||e===null||Array.isArray(e))throw new Error("theme manifest must be an object");if(e.schemaVersion!==1)throw new Error(`unsupported theme schema ${e.schemaVersion}`);if(typeof e.id!="string"||!/^[a-z0-9-]+$/.test(e.id))throw new Error("theme id must use lowercase letters, numbers, and hyphens");if(typeof e.name!="string"||!e.name.trim())throw new Error("theme name must be a non-empty string");if(typeof e.author!="string")throw new Error("theme author must be a string");if(typeof e.hero!="string")throw new Error("theme hero must be a string");let n;if(typeof e.video=="string"&&e.video.trim()){const r=e.video.trim();d.basename(r)!==r||!/\.(mp4|webm)$/i.test(r)?console.warn(`theme ${e.id}: ignoring invalid video field ${r}`):n=r}if(typeof e.colors!="object"||e.colors===null)throw new Error("theme colors must be an object");const t=["accent","secondary","surface","text"];for(const r of t)if(typeof e.colors[r]!="string"||!/^#[0-9a-fA-F]{6}$/.test(e.colors[r]))throw new Error(`theme color ${r} must be a hex color`);return{schemaVersion:1,id:e.id,name:e.name.trim(),author:e.author,hero:e.hero,video:n,colors:{accent:e.colors.accent,secondary:e.colors.secondary,surface:e.colors.surface,text:e.colors.text},copy:e.copy??void 0,apps:e.apps??{}}}function Qn(e){const n=d.extname(e).toLowerCase();return{".png":"image/png",".jpg":"image/jpeg",".jpeg":"image/jpeg",".webp":"image/webp",".gif":"image/gif",".mp4":"video/mp4",".webm":"video/webm"}[n]||"image/png"}function er(e){const n=e.manifest.video;if(!n)return null;const t=d.resolve(e.path);let r=d.resolve(t,n);if(r!==t&&!r.startsWith(t+d.sep)||!/\.(mp4|webm)$/i.test(d.extname(r)))return null;const a=A.app.getAppPath();if(a.endsWith(".asar")&&(t===a||t.startsWith(a+d.sep))){const o=d.resolve(a+".unpacked",d.relative(a,t));r=d.resolve(o,n)}try{if(!f.existsSync(r)||!f.statSync(r).isFile())return null}catch{return null}return r}const Bt=5,tr=32*1024*1024;let ve=null;function ot(){try{const e=JSON.parse(f.readFileSync(jt(),"utf8"));return st(e)}catch{return[]}}function nr(e){const n=st(e),t=[...ot()];for(const a of n){const o=t.findIndex(s=>s.id===a.id);o>=0?t[o]=a:t.push(a)}const r=t.slice(0,Bt);return Lt(r),r}function rr(e,n,t,r=4){const a=Wt()[e]??{};return[...n].sort((o,s)=>{if(o===t)return-1;if(s===t)return 1;const c=a[o]??{count:0,lastUsedAt:0},i=a[s]??{count:0,lastUsedAt:0};return i.lastUsedAt-c.lastUsedAt||i.count-c.count}).slice(0,r)}function Qe(e,n){if(!/^[a-z0-9-]+$/i.test(e)||!/^[a-z0-9-]+$/i.test(n))return;const t=Wt(),r=t[e]??{},a=r[n]??{count:0};r[n]={count:a.count+1,lastUsedAt:Date.now()},t[e]=r,Ht(Nt(),t)}function ar(){return ve||(ve=new Promise((e,n)=>{const t=rt.randomBytes(24).toString("hex"),r=_t.createServer((a,o)=>{if(o.setHeader("Access-Control-Allow-Origin","*"),o.setHeader("Access-Control-Allow-Headers","Authorization, Content-Type"),o.setHeader("Access-Control-Allow-Methods","GET, PUT, POST, OPTIONS"),o.setHeader("Access-Control-Allow-Private-Network","true"),a.method==="OPTIONS"){o.writeHead(204).end();return}if(a.headers.authorization!==`Bearer ${t}`){o.writeHead(401).end("Unauthorized");return}if(a.url==="/theme-usage"&&a.method==="POST"){wt(a,o,s=>{if(typeof(s==null?void 0:s.appId)!="string"||typeof(s==null?void 0:s.themeId)!="string")throw new Error("Invalid theme usage payload");Qe(s.appId,s.themeId),Ve(o,200,{success:!0})});return}if(a.url!=="/custom-themes"){o.writeHead(404).end("Not found");return}if(a.method==="GET"){Ve(o,200,ot());return}if(a.method!=="PUT"){o.writeHead(405).end("Method not allowed");return}wt(a,o,s=>{const c=st(s);Lt(c),Ve(o,200,c)})});r.once("error",n),r.listen(0,"127.0.0.1",()=>{const a=r.address();if(!a||typeof a=="string"){r.close(),n(new Error("Shared custom theme service did not expose a TCP port"));return}const o=`http://127.0.0.1:${a.port}`;e({endpoint:`${o}/custom-themes`,usageEndpoint:`${o}/theme-usage`,token:t})})}),ve)}function jt(){return d.join(A.app.getPath("userData"),"custom-themes.json")}function Nt(){return d.join(A.app.getPath("userData"),"theme-usage.json")}function Lt(e){Ht(jt(),e)}function Wt(){try{const e=JSON.parse(f.readFileSync(Nt(),"utf8"));return e&&typeof e=="object"&&!Array.isArray(e)?e:{}}catch{return{}}}function Ht(e,n){f.mkdirSync(d.dirname(e),{recursive:!0}),f.writeFileSync(e,`${JSON.stringify(n,null,2)}
`)}function wt(e,n,t){let r=0;const a=[];e.on("data",o=>{if(r+=o.length,r>tr){n.writeHead(413).end("Payload too large"),e.destroy();return}a.push(o)}),e.on("end",()=>{if(!n.headersSent)try{t(JSON.parse(Buffer.concat(a).toString("utf8")))}catch(o){n.writeHead(400).end(o.message)}})}function st(e){if(!Array.isArray(e))throw new Error("Custom themes must be an array");return e.slice(0,Bt).map((n,t)=>{var o,s;if(!n||typeof n!="object")throw new Error(`Invalid custom theme at index ${t}`);const r=n;if(typeof r.id!="string"||!/^custom-[a-z0-9-]+$/i.test(r.id))throw new Error(`Invalid custom theme id at index ${t}`);if(typeof r.name!="string"||!r.name.trim())throw new Error(`Invalid custom theme name at index ${t}`);if(typeof r.dataUrl!="string"||!/^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(r.dataUrl))throw new Error(`Invalid custom theme image at index ${t}`);for(const c of["accent","secondary","surface","text"])if(typeof((o=r.colors)==null?void 0:o[c])!="string"||!/^#[0-9a-fA-F]{6}$/.test(r.colors[c]))throw new Error(`Invalid custom theme color ${c} at index ${t}`);const a=typeof((s=r.colors)==null?void 0:s.average)=="string"&&/^#[0-9a-fA-F]{6}$/.test(r.colors.average)?r.colors.average:void 0;return{id:r.id,name:r.name.trim(),dataUrl:r.dataUrl,colors:{accent:r.colors.accent,secondary:r.colors.secondary,surface:r.colors.surface,text:r.colors.text,...a?{average:a}:{}}}})}function Ve(e,n,t){e.writeHead(n,{"Content-Type":"application/json; charset=utf-8"}),e.end(JSON.stringify(t))}function Me(e){const n=/^#([0-9a-f]{6})$/i.exec(e);if(!n)return[255,255,255];const t=parseInt(n[1],16);return[t>>16&255,t>>8&255,t&255]}function ue(e){return"#"+e.map(n=>Math.max(0,Math.min(255,Math.round(n))).toString(16).padStart(2,"0")).join("")}function Ge(e){const n=e/255;return n<=.04045?n/12.92:Math.pow((n+.055)/1.055,2.4)}function Ie(e){return .2126*Ge(e[0])+.7152*Ge(e[1])+.0722*Ge(e[2])}function ne(e,n){const t=Ie(e),r=Ie(n);return(Math.max(t,r)+.05)/(Math.min(t,r)+.05)}function re(e,n,t){return[0,1,2].map(r=>e[r]+(n[r]-e[r])*t)}function Ft(e){const n=e[0]/255,t=e[1]/255,r=e[2]/255,a=Math.max(n,t,r),o=Math.min(n,t,r),s=(a+o)/2;if(a===o)return[0,0,s];const c=a-o,i=s>.5?c/(2-a-o):c/(a+o);let l;return a===n?l=(t-r)/c+(t<r?6:0):a===t?l=(r-n)/c+2:l=(n-t)/c+4,[l/6,i,s]}function et(e,n,t){if(n<=0){const s=t*255;return[s,s,s]}const r=(s,c,i)=>(i<0&&(i+=1),i>1&&(i-=1),i<1/6?s+(c-s)*6*i:i<1/2?c:i<2/3?s+(c-s)*(2/3-i)*6:s),a=t<.5?t*(1+n):t+n-t*n,o=2*t-a;return[r(o,a,e+1/3)*255,r(o,a,e)*255,r(o,a,e-1/3)*255]}function or(e,n,t){if(ne(e,n)>=t)return e;const r=t+Math.max(.02,t*.02),a=Ie(e),o=Ie(n),s=a<o||a===o&&o>.475,[c,i,l]=Ft(e);if(i>=.02){let g=s?0:l,b=s?l:1;for(let _=0;_<14;_++){const B=(g+b)/2;ne(et(c,i,B),n)>=r?s?g=B:b=B:s?b=B:g=B}const w=et(c,i,s?g:b);if(ne(w,n)>=t)return w}const u=s?[0,0,0]:[255,255,255];let p=0,h=1;for(let g=0;g<12;g++){const b=(p+h)/2;ne(re(e,u,b),n)>=r?h=b:p=b}return re(e,u,h)}function ke(e,n,t){if(n.length===0)return e;const r=u=>Math.min(...n.map(p=>ne(u,p)));let a=e;for(let u=0;u<4;u++){if(r(a)>=t)return a;const p=r(a);let h=n[0],g=1/0;for(const w of n){const _=ne(a,w);_<g&&(g=_,h=w)}const b=or(a,h,t);if(r(b)<=p+1e-9)break;a=b}if(r(a)>=t)return a;const[o,s]=Ft(e),c=[e,a];for(const u of[.02,.06,.12,.22,.78,.88,.95,.99])c.push(et(o,s,u));let i=a,l=r(a);for(const u of c){const p=r(u);p>l+1e-9&&(l=p,i=u)}return i}function sr(e){if(e.length<16||e.readUInt32BE(0)!==2303741511)return null;let n=8,t=-1;const r=[];for(;n+12<=e.length;){const o=e.readUInt32BE(n),s=e.toString("ascii",n+4,n+8),c=e.subarray(n+8,n+8+o);if(s==="IHDR"){const i=c.readUInt32BE(0),l=c.readUInt32BE(4),u=c[8],p=c[12];if(i!==1||l!==1||u!==8||p!==0)return null;t=c[9]}else if(s==="IDAT")r.push(c);else if(s==="IEND")break;n+=12+o}if(t<0||r.length===0)return null;let a;try{a=pn.inflateSync(Buffer.concat(r))}catch{return null}if(a.length<2||a[0]>4)return null;switch(t){case 6:return a.length>=5?[a[1],a[2],a[3]]:null;case 2:return a.length>=4?[a[1],a[2],a[3]]:null;case 4:return a.length>=3?[a[1],a[1],a[1]]:null;case 0:return a.length>=2?[a[1],a[1],a[1]]:null;default:return null}}function ir(){return String.raw`(function () {
  if (window.top && window.top !== window) return;   // 只在主框架挂条，iframe 内不重复
  if (window.__dreamWorkUsageBar && document.getElementById('dream-usage-bar')) return;
  window.__dreamWorkUsageBar = true;
  var MY_GEN = (window.__dreamWorkUsageGen = (window.__dreamWorkUsageGen || 0) + 1);
  function stale() { return MY_GEN !== window.__dreamWorkUsageGen; }
  function ls(k, d) { try { return localStorage.getItem(k) ?? d; } catch (e) { return d; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { } }

  var LS_SHOW = 'dreamUsage.show';
  var state = {
    show: { ctx: 1, turn: 1, win: 1, tools: 1, today: 1, sub: 1 },
    data: null, nativeCtx: 0, excActive: false, excGone: false, pickedSid: ''
  };
  try {
    var saved = JSON.parse(ls(LS_SHOW, 'null'));
    if (saved && typeof saved === 'object') for (var sk in state.show) if (sk in saved) state.show[sk] = saved[sk] ? 1 : 0;
  } catch (e) { }

  var style = document.createElement('style');
  style.textContent =
    '#dream-usage-bar{position:fixed;display:none;font:13px/1.3 Consolas,\'Cascadia Mono\',Menlo,\'Microsoft YaHei UI\',\'Microsoft YaHei\',monospace;' +
    'font-variant-numeric:tabular-nums;color:var(--dream-work-text,#e9edf4);' +
    'background:color-mix(in srgb,var(--dream-work-surface,#10141c) 78%,transparent);' +
    'backdrop-filter:blur(14px) saturate(108%);-webkit-backdrop-filter:blur(14px) saturate(108%);' +
    'border:1px solid color-mix(in srgb,var(--dream-work-accent,#24c9d7) 30%,transparent);' +
    'border-radius:12px;padding:2px 6px;user-select:none;white-space:nowrap;z-index:50;' +
    'box-shadow:0 12px 30px color-mix(in srgb,var(--dream-work-surface,#10141c) 30%,transparent),inset 0 1px color-mix(in srgb,white 12%,transparent);' +
    'align-items:center;gap:2px}' +
    '#du-main{overflow:hidden;min-width:0;flex:1 1 auto;display:flex;align-items:center;gap:1px}' +
    '.dit{display:flex;align-items:center;gap:4px;padding:2px 6px;border-radius:8px;' +
    'transition:background-color .12s ease-out}' +
    '.dit:hover{background:color-mix(in srgb,var(--dream-work-accent,#24c9d7) 14%,transparent)}' +
    '.dsep{width:1px;height:15px;background:color-mix(in srgb,var(--dream-work-text,#e9edf4) 16%,transparent);flex:0 0 auto;margin:0 1px}' +
    '.dk{color:color-mix(in srgb,var(--dream-work-text,#e9edf4) 62%,transparent)}' +
    '.dv{color:var(--dream-work-text,#e9edf4);font-weight:600}' +
    '.dpct{font-weight:700}' +
    '.dok{color:color-mix(in srgb,#3ecf8e 84%,var(--dream-work-text,#e9edf4))}' +
    '.dwarm{color:color-mix(in srgb,#f5b944 84%,var(--dream-work-text,#e9edf4))}' +
    '.dhot{color:color-mix(in srgb,#ff6b57 84%,var(--dream-work-text,#e9edf4))}' +
    '@keyframes duexc{0%,100%{opacity:1}50%{opacity:.35}}' +
    '.dexc{color:color-mix(in srgb,#ff2d55 88%,var(--dream-work-text,#e9edf4));text-shadow:0 0 8px rgba(255,45,85,.5);animation:duexc 1.1s ease-in-out infinite}' +
    '.dbtn{cursor:pointer;padding:2px 6px;border-radius:8px;color:var(--dream-work-text,#e9edf4);' +
    'transition:background-color .12s ease-out;opacity:.8}' +
    '.dbtn:hover{opacity:1;background:color-mix(in srgb,var(--dream-work-accent,#24c9d7) 14%,transparent)}' +
    '.dico{width:12px;height:12px;flex:0 0 auto;color:var(--dream-work-text,#e9edf4);opacity:.75}' +
    '.deb{background:color-mix(in srgb,#ff6b57 16%,transparent);color:color-mix(in srgb,#ff8a73 88%,var(--dream-work-text,#e9edf4));' +
    'border-radius:999px;padding:0 6px;line-height:16px;font-weight:600;display:inline-flex;align-items:center;gap:2px}' +
    '.deb .dico{color:inherit}' +
    '.dcbar{display:inline-block;width:46px;height:5px;border-radius:999px;' +
    'background:color-mix(in srgb,var(--dream-work-text,#e9edf4) 14%,transparent);overflow:hidden;flex:0 0 auto}' +
    '.dcbar>i{display:block;height:100%;border-radius:999px;background:currentColor}' +
    '@keyframes dupulse{0%,100%{opacity:1}50%{opacity:.2}}' +
    '.ddot{animation:dupulse 1.6s ease-in-out infinite;font-size:13px;line-height:1;color:var(--dream-work-secondary,#ef8fd3)}' +
    '.dpanel{position:absolute;bottom:calc(100% + 10px);left:0;display:none;flex-direction:column;gap:3px;' +
    'background:color-mix(in srgb,var(--dream-work-surface,#10141c) 92%,transparent);' +
    'backdrop-filter:blur(18px) saturate(108%);-webkit-backdrop-filter:blur(18px) saturate(108%);' +
    'border:1px solid color-mix(in srgb,var(--dream-work-accent,#24c9d7) 30%,transparent);border-radius:12px;' +
    'padding:10px 12px;min-width:260px;max-width:480px;max-height:72vh;overflow:auto;white-space:normal;' +
    'color:var(--dream-work-text,#e9edf4);font:13px/1.6 Consolas,Menlo,\'Microsoft YaHei UI\',monospace;' +
    'box-shadow:0 12px 32px color-mix(in srgb,var(--dream-work-surface,#10141c) 45%,transparent),inset 0 1px color-mix(in srgb,white 12%,transparent);z-index:2147483647}' +
    '.dpanel.open{display:flex}' +
    '.dpanel .dph{font-weight:700;font-size:14px;margin-bottom:4px}' +
    '.dpanel label{display:flex;align-items:flex-start;gap:8px;cursor:pointer;padding:4px 8px;margin:0 -8px;border-radius:8px}' +
    '.dpanel label:hover{background:color-mix(in srgb,var(--dream-work-accent,#24c9d7) 12%,transparent)}' +
    '.dpanel label em{font-style:normal;display:block;color:color-mix(in srgb,var(--dream-work-text,#e9edf4) 60%,transparent);font-size:12px}' +
    '.dpanel input[type=checkbox]{accent-color:var(--dream-work-accent,#24c9d7);margin-top:3px}' +
    '.dpanel .dnote{color:color-mix(in srgb,var(--dream-work-text,#e9edf4) 60%,transparent);margin-top:5px;line-height:1.6}' +
    '.dpanel .dhr{border-top:1px solid color-mix(in srgb,var(--dream-work-text,#e9edf4) 12%,transparent);margin:4px 0}' +
    '#dream-usage-tip{position:fixed;display:none;background:color-mix(in srgb,var(--dream-work-surface,#10141c) 94%,transparent);' +
    'backdrop-filter:blur(16px) saturate(108%);-webkit-backdrop-filter:blur(16px) saturate(108%);' +
    'border:1px solid color-mix(in srgb,var(--dream-work-accent,#24c9d7) 30%,transparent);border-radius:10px;padding:8px 12px;' +
    'font:13px/1.6 Consolas,\'Microsoft YaHei UI\',monospace;color:var(--dream-work-text,#e9edf4);' +
    'box-shadow:0 10px 28px color-mix(in srgb,var(--dream-work-surface,#10141c) 45%,transparent),inset 0 1px color-mix(in srgb,white 12%,transparent);' +
    'white-space:pre-line;z-index:2147483646;max-width:560px}' +
    '#dream-usage-exc{position:fixed;display:none;max-width:470px;z-index:2147483647;white-space:normal;user-select:text;' +
    'background:color-mix(in srgb,#ff2d55 10%,var(--dream-work-surface,#10141c));' +
    'border:1px solid color-mix(in srgb,#ff2d55 40%,transparent);border-radius:12px;padding:12px 15px;' +
    'font:13px/1.7 Consolas,\'Microsoft YaHei UI\',monospace;color:var(--dream-work-text,#e9edf4);' +
    'box-shadow:0 12px 32px rgba(0,0,0,.35)}' +
    '#dream-usage-exc .du-xb-title{font-weight:700;color:color-mix(in srgb,#ff5c77 90%,var(--dream-work-text,#e9edf4));margin-bottom:6px}' +
    '#dream-usage-exc .du-xb-step{color:color-mix(in srgb,var(--dream-work-text,#e9edf4) 80%,transparent)}' +
    '@media (prefers-reduced-motion:reduce){.dexc,.ddot{animation:none}.dit,.dbtn{transition:none}}';

  var bar = document.createElement('div');
  bar.id = 'dream-usage-bar';
  bar.innerHTML = '<span id="du-main"></span><span class="dbtn" id="du-gear" title="状态条显示项">⚙</span>';
  var panel = document.createElement('div');
  panel.className = 'dpanel';
  bar.appendChild(panel);
  bar.appendChild(style);
  bar.style.position = 'fixed';
  bar.style.zIndex = '50';
  bar.style.display = 'none';
  document.body.appendChild(bar);

  var tip = document.createElement('div');
  tip.id = 'dream-usage-tip';
  tip.style.display = 'none';
  document.body.appendChild(tip);

  var excBubble = document.createElement('div');
  excBubble.id = 'dream-usage-exc';
  excBubble.innerHTML = '<div class="du-xb-title">⚠ 上下文超限</div>' +
    '<div class="du-xb-step">最近一次请求因超出上下文窗口容量被拒绝，本轮对话暂时无法继续。建议依次尝试：</div>' +
    '<div class="du-xb-step">① 回滚上一轮对话，去掉超限的那次请求后继续；</div>' +
    '<div class="du-xb-step">② 换用上下文窗口更大的模型继续，或压缩 / 精简本会话；</div>' +
    '<div class="du-xb-step">③ 仍无法解决时，新开一个对话继续。</div>' +
    '<div class="du-xb-step" style="margin-top:6px">会话 ID：<span id="du-exc-sid"></span></div>';
  document.body.appendChild(excBubble);

  var main = bar.querySelector('#du-main');
  var gear = bar.querySelector('#du-gear');
  var lastHtml = '';

  function fmt(n) {
    n = n || 0;
    if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
    return String(n);
  }
  function sec(ms) { return ms ? (ms / 1000).toFixed(1) + 's' : '–'; }
  function excActive(s) {
    return !!(s && s.ctxExc > 0 && s.ctxExc >= (s.lastAt || 0));
  }
  function cachePct(cache, input) {
    return input > 0 ? '<span class="dk">' + Math.round(cache / input * 100) + '%</span>' : '';
  }
  function ioc(inp, out, cache, rea, cw) {
    return '输入 ' + fmt(inp) + ' / 输出 ' + fmt(out) + ' / 缓存命中 ' + fmt(cache) +
      (cw > 0 ? ' / 缓存写入 ' + fmt(cw) : '') +
      (rea > 0 ? ' / 思考 ' + fmt(rea) : '');
  }
  function ico(paths) {
    return '<svg class="dico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + paths + '</svg>';
  }
  var ICON_TPS = '<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>';
  var ICON_TURN = '<path d="M23 4v6h-6"/><path d="M20.49 15A9 9 0 1 1 18.36 5.64L23 10"/>';
  var ICON_WIN = '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>';
  var ICON_TOOLS = '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>';
  var ICON_TODAY = '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>';
  var ICON_SUB = '<path d="M6 3v12"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/>';
  var ICON_ERR = '<circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/>';

  function stubFor(sid) {
    return {
      sid: String(sid || ''), title: '', active: false, turns: 0, requests: 0,
      input: 0, output: 0, reasoning: 0, cacheRead: 0, cacheWrite: 0, total: 0,
      toolCalls: 0, retries: 0, ctx: 0, updated: '', lastAt: 0, ctxExc: 0,
      live: { state: 'idle', at: 0 },
      lastTurn: { requests: 0, retries: 0, toolCalls: 0, toolErrors: 0, input: 0, output: 0, reasoning: 0, cacheRead: 0, cacheWrite: 0, total: 0, durationMs: 0, ttftMs: 0 },
      last: { durationMs: 0, ttftMs: 0, model: '', tps: 0 },
      code: { add: null, del: null, files: null },
      tools: { total: 0, errors: 0, list: [] },
      sub: { requests: 0, total: 0, input: 0, output: 0, cacheRead: 0, reasoning: 0, cacheWrite: 0, active: false, list: [] },
      contextWindow: 0, contextAuto: false
    };
  }

  /* 当前会话权威信号：侧栏任务列表的选中项（li[data-testid^=task-item-].bg-selected，
   * ZCode 用 bg-selected 标记当前打开的会话，项上直接带会话 id）。比 localStorage
   * 键启发式可靠：多工作区键并存时旧逻辑取"遍历顺序第一个"键，实测会指向另一个
   * 工作区的零用量会话（want 引用错会话、切到池外旧会话时条显示零值）。 */
  function activeSidFromSidebar() {
    try {
      var el = document.querySelector('li[data-testid^=task-item-].bg-selected');
      if (!el) return '';
      var m = (el.getAttribute('data-testid') || '').match(/^task-item-(sess_[A-Za-z0-9_-]+)$/);
      return m ? m[1] : '';
    } catch (e) { return ''; }
  }
  /* 当前会话识别：侧栏选中项优先（权威）；不可得（侧栏收起/设置页/类名变更）
   * 时退回 localStorage 键启发式：ZCode 在 zcode-v4-last-session:v1:<工作区路径>
   * 键里保存各工作区当前打开的会话 id；与快照池求交集，切换优先，多候选取最近活跃。 */
  var wsPrev = null;
  function pickCurrent(d) {
    var recent = d.recent || [];
    var active = activeSidFromSidebar();
    if (active) {
      for (var i = 0; i < recent.length; i++) {
        if (recent[i].sid === active) return { sess: recent[i], want: active };
      }
      /* 池里还没有该会话（新开/久远）：want 回传让泵强制补拉，先显示零值 */
      return { sess: null, want: active };
    }
    if (!recent.length) return null;
    var bySid = {}, kv = {};
    for (var j = 0; j < recent.length; j++) bySid[recent[j].sid] = recent[j];
    try {
      Object.keys(localStorage).forEach(function (k) {
        if (/^zcode-v4-last-session:/.test(k)) {
          var v = localStorage.getItem(k);
          if (v && /^[A-Za-z0-9_-]+$/.test(v)) kv[k] = v;
        }
      });
    } catch (e) { return null; }
    if (!Object.keys(kv).length) return null;
    var hit = {}, firstKeyVal = '';
    for (var k in kv) {
      if (bySid[kv[k]]) hit[k] = kv[k];
      if (!firstKeyVal) firstKeyVal = kv[k];
    }
    var switched = null;
    if (wsPrev) {
      for (var k2 in kv) {
        if (wsPrev[k2] && wsPrev[k2] !== kv[k2]) switched = kv[k2];
      }
    }
    wsPrev = kv;
    var want = switched || firstKeyVal;
    if (switched && bySid[switched]) return { sess: bySid[switched], want: switched };
    var cands = [];
    for (var k3 in hit) cands.push(bySid[hit[k3]]);
    if (cands.length === 1) return { sess: cands[0], want: cands[0].sid };
    if (!cands.length) return { sess: null, want: want };
    var best = cands[0];
    for (var n = 1; n < cands.length; n++) {
      if ((cands[n].lastAt || 0) > (best.lastAt || 0)) best = cands[n];
    }
    return { sess: best, want: best.sid };
  }

  function html(d) {
    var sess = d.session || stubFor('');
    var lt = sess.lastTurn || {};
    var today = d.today || {};
    var last = sess.last || {};
    var tls = sess.tools || { total: 0, errors: 0, list: [] };
    var subs = sess.sub || { requests: 0, total: 0, input: 0, output: 0, cacheRead: 0, reasoning: 0, cacheWrite: 0, active: false, list: [] };
    var items = [], tips = [];
    function it(inner, tipText) { items.push('<span class="dit">' + inner + '</span>'); tips.push(tipText || null); }
    if (last.tps) {
      var tpsCls = last.tps >= 70 ? 'dok' : last.tps >= 40 ? 'dwarm' : 'dhot';
      it(ico(ICON_TPS) + '<span class="' + tpsCls + '">' + last.tps + '</span><span class="dk">t/s</span>',
        '生成速度：最近完成请求的输出 tokens ÷ 生成耗时（首 token → 完成）\n≥70 t/s 绿色 · 40–70 黄色 · <40 红色\n模型 ' + (last.model || '?'));
    }
    if (state.show.ctx) {
      var cw = state.nativeCtx || sess.contextWindow || 0;
      var pct = cw ? sess.ctx / cw * 100 : 0;
      var exc = excActive(sess);
      var big = cw >= 1000000;
      var cls = exc ? 'dexc' : pct >= (big ? 60 : 85) ? 'dhot' : pct >= (big ? 40 : 70) ? 'dwarm' : 'dok';
      var inner = sess.pending
        ? '<span class="dk">…</span>'
        : cw
        ? '<span class="dcbar"><i class="' + cls + '" style="width:' + Math.min(100, pct).toFixed(1) + '%"></i></span>' +
          '<span class="dpct ' + cls + '">' + pct.toFixed(1) + '%</span>'
        : '<span class="dv' + (exc ? ' dexc' : '') + '">' + fmt(sess.ctx) + '</span>';
      it(inner, (sess.pending ? '会话数据加载中（刚切换，等待下一次刷新）\n' : '') +
        '上下文：当前会话上下文大小（最近一次请求的总输入）÷ 窗口容量\n已用 ' + fmt(sess.ctx) + ' / 窗口 ' + fmt(cw) +
        '\n颜色随占比：' + (big ? '≤40% 绿 · 40–60% 黄 · ≥60% 红（窗口 ≥100 万）' : '<70% 绿 · 70–85% 黄 · ≥85% 红') +
        ' · 超限被拒=亮红闪烁' + (exc ? '\n⚠ 上下文超限：最近一次请求超出窗口容量被拒绝（' + sess.updated + '），需要压缩会话或新开会话' : ''));
    }
    if (state.show.turn) {
      it(sess.pending ? ico(ICON_TURN) + '<span class="dk">…</span>' : ico(ICON_TURN) +
        '<span class="dv">' + fmt(lt.total) + '</span>' + cachePct(lt.cacheRead, lt.input) +
        '<span class="dk">' + (lt.requests || 0) + '次</span>' +
        ico('<path d="M6 3h12M6 21h12M8 3v3.5L12 11l4-4.5V3M8 21v-3.5L12 13l4 4.5V21"/>') + '<span class="dk">' + sec(last.durationMs) + '</span>' +
        ico('<path d="M5 20v-5M12 20v-9M19 20V5"/>') + '<span class="dk">' + sec(last.ttftMs) + '</span>',
        (sess.pending ? '会话数据加载中（刚切换，等待下一次刷新）\n' : '') +
        '本轮：最近一轮的 token 消耗（该轮共 ' + (lt.requests || 0) + ' 次模型请求）\n' +
        ioc(lt.input, lt.output, lt.cacheRead, lt.reasoning, lt.cacheWrite) +
        '\n单次耗时 ' + sec(last.durationMs) + ' · 首字 ' + sec(last.ttftMs) + ' · 轮总耗时 ' + sec(lt.durationMs) +
        (lt.toolCalls ? ' · 工具调用 ' + lt.toolCalls : '') +
        ((lt.retries || lt.toolErrors) ? ' · 重试 ' + (lt.retries || 0) + ' · 工具错误 ' + (lt.toolErrors || 0) : ''));
    }
    if (state.show.win) {
      it(sess.pending ? ico(ICON_WIN) + '<span class="dk">…</span>' : ico(ICON_WIN) +
        '<span class="dv">' + fmt(sess.total) + '</span>' + cachePct(sess.cacheRead, sess.input) +
        '<span class="dk">' + (sess.turns || 0) + '轮 · ' + (sess.requests || 0) + '次</span>',
        (sess.pending ? '会话数据加载中（刚切换，等待下一次刷新）\n' : '') +
        '会话累计：当前会话全部请求的 token 消耗\n' + ioc(sess.input, sess.output, sess.cacheRead, sess.reasoning, sess.cacheWrite) +
        '\n' + (sess.turns || 0) + ' 轮 · ' + (sess.requests || 0) + ' 次请求' +
        (sess.toolCalls ? ' · 工具调用 ' + sess.toolCalls : '') +
        (sess.retries ? ' · 重试 ' + sess.retries : '') +
        (sess.code && (sess.code.add || sess.code.del) ? '\n代码变更 +' + (sess.code.add || 0) + ' / −' + (sess.code.del || 0) + (sess.code.files ? '（' + sess.code.files + ' 文件）' : '') : ''));
    }
    if (state.show.tools) {
      var toolLines = [];
      (tls.list || []).forEach(function (t1) {
        toolLines.push(t1.name + ' ' + t1.count + '次 · ' + sec(t1.durationMs) + (t1.errors ? ' · ' + t1.errors + ' 个错误' : ''));
      });
      it(sess.pending ? ico(ICON_TOOLS) + '<span class="dk">…</span>' : ico(ICON_TOOLS) + '<span class="dv">' + (tls.total || 0) + '</span>' +
        (tls.errors ? '<span class="deb">' + ico(ICON_ERR) + tls.errors + '</span>' : ''),
        (sess.pending ? '会话数据加载中（刚切换，等待下一次刷新）\n' : '') +
        '工具调用：当前会话的工具使用统计（按调用次数排序）\n' +
        (toolLines.length ? toolLines.join('\n') : '无工具调用记录'));
    }
    if (state.show.today) {
      it(ico(ICON_TODAY) +
        '<span class="dv">' + fmt(today.total) + '</span>' + cachePct(today.cacheRead, today.input) +
        '<span class="dk">' + (today.requests || 0) + '次</span>',
        '今日合计：今天所有会话的 token 总消耗（跨会话汇总）\n' +
        ioc(today.input, today.output, today.cacheRead, today.reasoning, today.cacheWrite) +
        '\n' + (today.requests || 0) + ' 次请求');
    }
    if (state.show.sub) {
      var subLines = [];
      (subs.list || []).forEach(function (s1) {
        subLines.push((s1.title || s1.sid.slice(0, 16)) + ' · ' + fmt(s1.total) + '（输入 ' + fmt(s1.input) + ' / 输出 ' + fmt(s1.output) + '）' + (s1.active ? ' · 运行中' : ''));
      });
      it(ico(ICON_SUB) + '<span class="dv">' + fmt(subs.total) + '</span>' + (subs.active ? '<span class="ddot">●</span>' : ''),
        '子代理：当前会话的后台子代理消耗（独立统计，不计入会话累计）\n' +
        ioc(subs.input, subs.output, subs.cacheRead, subs.reasoning, subs.cacheWrite) +
        '，共 ' + (subs.requests || 0) + ' 次' + (subs.active ? ' · 运行中' : '') +
        (subLines.length ? '\n' + subLines.join('\n') : ''));
    }
    return { s: items.join('<span class="dsep"></span>') || '<span class="dk">等待数据…</span>', tips: tips };
  }

  /* ---------- tooltip：向上弹出，只读文本 ---------- */
  var hoverEl = null;
  function hideTip(force, cause) {
    if (!force && hoverEl) return;
    if (tip.style.display !== 'none') tip.style.display = 'none';
    hoverEl = null;
  }
  function drawTip(el, keepTop) {
    var t = el && el.__tip;
    if (!t) { tip.style.display = 'none'; hoverEl = null; return; }
    tip.textContent = t;
    tip.style.display = 'block';
    var tr = tip.getBoundingClientRect(), ar = el.getBoundingClientRect();
    var left = ar.left + ar.width / 2 - tr.width / 2;
    left = Math.max(8, Math.min(left, Math.max(8, innerWidth - tr.width - 8)));
    var top = Math.max(8, ar.top - tr.height - 8);
    tip.style.left = Math.round(left) + 'px';
    tip.style.top = Math.round(top) + 'px';
  }
  document.addEventListener('mousemove', function (e) {
    if (stale()) return;
    var t = e.target;
    if (!t || !t.closest) return;
    if (t.closest('#dream-usage-tip')) return;
    if (t.closest('.dpanel')) { if (hoverEl) hideTip(true, 'panel'); return; }
    var el = t.closest('#dream-usage-bar') ? t.closest('.dit') : null;
    if (el) {
      if (el !== hoverEl) {
        hoverEl = el;
        var els = main.querySelectorAll('.dit');
        el.__idx = Array.prototype.indexOf.call(els, el);
        el.__n = els.length;
        drawTip(el, false);
      }
    } else if (hoverEl) {
      hideTip(true, 'left');
    }
  }, true);

  /* ---------- 显示项开关面板 ---------- */
  function buildPanel() {
    panel.innerHTML =
      '<div class="dph">⚙ 状态条显示项</div>' +
      '<label><input type="checkbox" data-k="ctx"><span>上下文<em>进度条 + 百分比，颜色随占比变化</em></span></label>' +
      '<label><input type="checkbox" data-k="turn"><span>本轮<em>tokens / 次数 / 单次耗时 / 首字</em></span></label>' +
      '<label><input type="checkbox" data-k="win"><span>会话累计<em>当前会话 tokens / 轮数 / 次数</em></span></label>' +
      '<label><input type="checkbox" data-k="tools"><span>工具调用<em>当前会话，悬停看各工具明细与错误</em></span></label>' +
      '<label><input type="checkbox" data-k="today"><span>今日合计<em>今天所有会话的消耗</em></span></label>' +
      '<label><input type="checkbox" data-k="sub"><span>子代理<em>后台子代理消耗，悬停看明细</em></span></label>' +
      '<div class="dhr"></div>' +
      '<div class="dnote">数据源 ~/.zcode/cli/db/db.sqlite（只读）。悬停条面各项看明细；请求完成后数值才落库刷新。</div>';
    panel.querySelectorAll('input[type=checkbox]').forEach(function (cb) {
      cb.checked = !!state.show[cb.dataset.k];
      cb.addEventListener('change', function () {
        if (stale()) return;
        state.show[cb.dataset.k] = cb.checked ? 1 : 0;
        lsSet(LS_SHOW, JSON.stringify(state.show));
        if (state.data) render(state.data);
      });
    });
  }
  buildPanel();
  gear.addEventListener('click', function () {
    if (stale()) return;
    panel.classList.toggle('open');
    if (panel.classList.contains('open') && hoverEl) hideTip(true, 'panel');
  });

  /* ---------- 渲染 ---------- */
  function render(d) {
    state.data = d;
    var pc = pickCurrent(d);
    var p = pc ? pc.sess : (d.session || null);
    state.pickedSid = p ? p.sid : '';
    window.__dreamWorkUsageWant = (pc && pc.want) || '';
    if (!p) { p = stubFor((pc && pc.want) || ''); p.pending = !!(pc && pc.want); }
    else if (p.sid && (!d.recent || !d.recent.some(function (r) { return r.sid === p.sid; })) && pc && pc.want === p.sid) {
      p.pending = true;   // 池里还没这个会话（刚切换）：显示加载中，而不是把 0 值当数据
    }
    state.excActive = excActive(p);
    /* 广播给宠物（皮肤注入脚本）：当前会话 + 实时任务状态 */
    try {
      document.dispatchEvent(new CustomEvent('dream-usage', { detail: { sid: state.pickedSid, live: (p && p.live) || null } }));
    } catch (e) { }
    var h = html({ session: p, today: d.today || {} });
    if (h.s !== lastHtml) {
      lastHtml = h.s;
      main.innerHTML = h.s;
      var els = main.querySelectorAll('.dit');
      for (var i = 0; i < els.length; i++) els[i].__tip = h.tips[i] || null;
      if (hoverEl) {
        var nu = null;
        if (hoverEl === main) nu = main;
        else if (hoverEl.__n === els.length) nu = els[hoverEl.__idx];
        if (nu && nu.__tip) { hoverEl = nu; drawTip(nu, true); } else hideTip(true, 'orphan');
      }
    }
  }
  window.__dreamWorkUsageUpdate = function (d) {
    if (stale()) return;
    try { render(d); } catch (e) { }
  };

  /* ---------- 超限告警气泡 ---------- */
  function syncExcBubble() {
    var show = state.excActive && !state.excGone && curDisplay === 'flex';
    if (!show) {
      if (!state.excActive) state.excGone = false;
      if (excBubble.style.display !== 'none') excBubble.style.display = 'none';
      return;
    }
    var sidEl = excBubble.querySelector('#du-exc-sid');
    var sidStr = state.pickedSid || '（未知）';
    if (sidEl.textContent !== sidStr) sidEl.textContent = sidStr;
    if (excBubble.style.display !== 'block') excBubble.style.display = 'block';
    var br = bar.getBoundingClientRect();
    var r = excBubble.getBoundingClientRect();
    var left = Math.max(8, Math.round(Math.min(br.left, innerWidth - r.width - 8)));
    var top = Math.max(8, Math.round(br.top - r.height - 8));
    if (excBubble.style.left !== left + 'px') excBubble.style.left = left + 'px';
    if (excBubble.style.top !== top + 'px') excBubble.style.top = top + 'px';
  }

  /* ---------- 定位：输入框玻璃外壳正下方（留分离带，不与框体贴合成一体）。
   * 关键：ZCode 输入框的可见边界是 .chat-composer-region（玻璃壳 + 渐变描边，
   * 比内部圆角输入卡低 ~34px），让位 margin 必须加在玻璃壳上——加在内层卡上
   * 只是扩大壳内空隙，壳不动，条会落进壳里（实测翻车）。sticky bottom-0 容器
   * 内内容增高即整体上移，壳被抬离窗底，条落在壳与窗底之间的壁纸上。 ---------- */
  var composer = null, cardCache = null, hideSince = 0, lastPos = [-1, -1], curDisplay = 'none';
  var CARD_MARGIN = '44px';
  var BAR_GAP = 10;

  function isVisualBox(el) {
    try {
      var cs = getComputedStyle(el);
      return cs.borderTopWidth !== '0px' || cs.backgroundColor !== 'rgba(0, 0, 0, 0)';
    } catch (e) { return false; }
  }
  function cardOf(el) {
    /* 首选：应用自己的玻璃外壳类（稳定钩子，皮肤 CSS 同款选择器） */
    try {
      var region = el.closest('.chat-composer-region');
      if (region && region !== document.body) return region;
    } catch (e) { }
    /* 兜底：类名变更时退回启发式（向上找第一个有边框/背景的视觉盒） */
    var cr = el.getBoundingClientRect();
    var p = el.parentElement, last = el, i = 0;
    for (; p && p !== document.body && i < 8; p = p.parentElement, i++) {
      var r = p.getBoundingClientRect();
      if (r.height > cr.height * 8 + 80) break;
      if (isVisualBox(p)) return p;
      last = p;
    }
    return last;
  }
  /* 可见性判定（对齐原版 overlay 实测结论）：设置页等覆盖层不卸载聊天 DOM、
   * 也不改几何（工作区保活，offsetParent/visibility/rect 全都骗得过），
   * 唯一可靠信号是输入框中心点的 elementFromPoint 命中测试。 */
  function visibleBox(el) {
    var r = el.getBoundingClientRect();
    return r.width > 40 && r.height > 8 && r.bottom > 0 && r.top < innerHeight;
  }
  function isOwnOverlay(el) {
    try { return !!(el && el.closest && el.closest('#dream-usage-tip,.dpanel,#dream-usage-exc,#dream-usage-bar')); } catch (e) { return false; }
  }
  /* 命中根元素 = 穿透假象：下拉/模态的滚动锁定给应用层设 pointer-events:none，
   * elementFromPoint 会跳过被盖层一路穿到底，视同被盖。 */
  function hitIsThroughRoot(hit) {
    return hit === document.body || hit === document.documentElement;
  }
  function reallyVisible(el, ownOK) {
    if (!visibleBox(el)) return false;
    var r = el.getBoundingClientRect();
    var hit;
    try { hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); } catch (e) { return true; }
    if (!hit) return false;
    if (hitIsThroughRoot(hit)) return false;
    if (hit === el || hit.contains(el) || el.contains(hit)) return true;
    if (ownOK && isOwnOverlay(hit)) return true;
    return false;
  }
  function findComposer() {
    var best = null;
    var cands = document.querySelectorAll('textarea, [contenteditable="true"]');
    for (var i = 0; i < cands.length; i++) {
      var el = cands[i];
      if (!reallyVisible(el)) continue;   // 设置页里被盖住的保活输入框不选
      var r = el.getBoundingClientRect();
      if (r.top < innerHeight * 0.45) continue;
      if (!best || r.top > best.getBoundingClientRect().top) best = el;
    }
    return best;
  }
  function releasePads() {
    try {
      document.querySelectorAll('[data-du-pad]').forEach(function (el) {
        el.style.marginBottom = el.dataset.duPad || '';
        delete el.dataset.duPad;
      });
    } catch (e) { }
  }
  function ensureCardPad() {
    if (!cardCache) return;
    try {
      if (cardCache.dataset.duPad === undefined) cardCache.dataset.duPad = cardCache.style.marginBottom || '';
      if (cardCache.style.marginBottom !== CARD_MARGIN) cardCache.style.marginBottom = CARD_MARGIN;
    } catch (e) { }
  }
  function setComposer(el) {
    releasePads();
    composer = el;
    cardCache = null;
    if (composer) {
      var c = cardOf(composer);
      if (c && c !== document.body) cardCache = c;
    }
    if (cardCache) ensureCardPad();
  }
  /* 原生上下文总量：输入框工具行按钮文本/aria-label "…总量 1,000,000"（服务端下发，跟随模型） */
  var nativeCtx = { val: 0, at: 0 };
  function readNativeCtx(card) {
    if (Date.now() - nativeCtx.at < 5000) return nativeCtx.val;
    nativeCtx.at = Date.now();
    try {
      var els = card.querySelectorAll('button, [aria-label], [title]');
      for (var i = 0; i < els.length; i++) {
        var el = els[i];
        var t = el.getAttribute('aria-label') || el.getAttribute('title') || el.textContent || '';
        var m = t.match(/总量\s*([\d,，]+)/);
        if (m) {
          nativeCtx.val = parseInt(m[1].replace(/[,]/g, '').replace(/\uFF0C/g, ''), 10);
          return nativeCtx.val;
        }
      }
    } catch (e) { }
    return nativeCtx.val;
  }
  function themeOn() {
    var st = document.getElementById('dream-work-style');
    return !!(st && st.textContent && st.textContent.length > 0);
  }
  function hideBar() {
    if (curDisplay !== 'none') { bar.style.display = 'none'; curDisplay = 'none'; }
    hideTip(true, 'bar-hidden');
  }
  function heavy() {
    if (stale()) return;
    if (!bar.isConnected) document.body.appendChild(bar);
    if (!tip.isConnected) document.body.appendChild(tip);
    if (!excBubble.isConnected) document.body.appendChild(excBubble);
    if (!themeOn()) { hideBar(); return; }
    var el = findComposer();
    if (el && el !== composer) setComposer(el);
    else if (!el && composer && !composer.isConnected) setComposer(null);
    if (composer) {
      if (!cardCache || !cardCache.isConnected) {
        var c = cardOf(composer);
        cardCache = c && c !== document.body ? c : null;
      }
      if (cardCache) {
        ensureCardPad();
        state.nativeCtx = readNativeCtx(cardCache);
      }
    }
    if (state.data) {
      var pc = pickCurrent(state.data);
      var pSid = pc ? (pc.sess ? pc.sess.sid : pc.want) : '';
      window.__dreamWorkUsageWant = (pc && pc.want) || '';
      if (pSid !== state.pickedSid) render(state.data);
    }
  }
  /* 整页路由切换（设置页等）的即时信号：工作区被 CSS 整体隐藏时
   * checkVisibility 同步返回 false（会话页 true）。这是稳定状态，不能等
   * 400ms 防闪迟滞——用户要求"切换即消失"；迟滞只留给命中测试的瞬时抖动。 */
  function checkHidden(el) {
    try {
      if (typeof el.checkVisibility === 'function') {
        return !el.checkVisibility({ visibilityProperty: true, opacityProperty: true, contentVisibilityAuto: true });
      }
    } catch (e) { }
    return false;
  }
  function coverOK(el) {
    try {
      var r = el.getBoundingClientRect();
      var hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      if (!hit) return false;
      if (hitIsThroughRoot(hit)) return false;
      if (hit === el || hit.contains(el) || el.contains(hit)) return true;
      if (cardCache && cardCache.contains(el) && cardCache.contains(hit)) return true;
      if (isOwnOverlay(hit)) return true;
      return false;
    } catch (e) { return true; }
  }
  function track() {
    if (stale()) return;
    try {
      syncExcBubble();
      if (!composer || !composer.isConnected) { hideSince = 0; hideBar(); return; }
      if (cardCache && cardCache.style.marginBottom !== CARD_MARGIN) ensureCardPad();
      var r = composer.getBoundingClientRect();
      var on = reallyVisible(composer, true) || coverOK(composer);
      if (!on) {
        /* 路由切换/工作区整体隐藏/输入框移出视口 = 稳定状态，立即隐藏 */
        if (checkHidden(composer) || r.bottom <= 0 || r.top >= innerHeight) {
          hideSince = 0;
          hideBar();
          return;
        }
        if (!hideSince) hideSince = Date.now();
        if (Date.now() - hideSince > 400) hideBar();
        return;
      }
      hideSince = 0;
      if (curDisplay !== 'flex') { bar.style.display = 'flex'; curDisplay = 'flex'; }
      var anchor = cardCache || composer;
      var ar = anchor.getBoundingClientRect();
      var left = Math.round(ar.left);
      var top = Math.max(8, Math.min(Math.round(ar.bottom + BAR_GAP), innerHeight - bar.offsetHeight - 4));
      if (left !== lastPos[0] || top !== lastPos[1]) {
        bar.style.left = left + 'px';
        bar.style.top = top + 'px';
        lastPos = [left, top];
      }
      /* 条宽 = 输入卡片同宽：左右缘与卡片对齐；条目左对齐、⚙ 推到右缘 */
      var w = Math.max(60, Math.round(ar.width));
      if (bar.style.width !== w + 'px') bar.style.width = w + 'px';
    } catch (e) { } finally {
      requestAnimationFrame(track);
    }
  }

  setInterval(heavy, 600);
  heavy();
  requestAnimationFrame(track);
})();
`}const cr=30*60*1e3,lr=30*1e3,dr=128e3,Ce=96;function Ae(){return d.join(N.homedir(),".zcode","cli","db")}function mr(){const e=Ae();let n=0;for(const t of["db.sqlite","db.sqlite-wal","db.sqlite-shm"])try{n=Math.max(n,f.statSync(d.join(e,t)).mtimeMs)}catch{}return n}function Pe(e,n){let t=0;for(let a=0;a<8;a++){const o=e[n+a];if(o===void 0)throw new Error("varint out of range");if(t=t*128+(o&127),!(o&128))return{value:t,next:n+a+1}}const r=e[n+8];if(r===void 0)throw new Error("varint out of range");return t=t*256+r,{value:t,next:n+9}}function ur(e,n,t){let r=0;for(let a=0;a<t;a++)r=r*256+e[n+a];return t<8&&r>=Math.pow(2,t*8-1)&&(r-=Math.pow(2,t*8)),r}function yt(e){try{const n=Pe(e,0),t=n.value;if(t>e.length)return null;let r=n.next,a=t;const o=[];for(;r<t;){const s=Pe(e,r);r=s.next;const c=s.value;if(c===0){o.push(null);continue}if(c>=1&&c<=6){const i=[0,1,2,3,4,6,8][c];o.push(ur(e,a,i)),a+=i;continue}if(c===7){o.push(e.readDoubleBE(a)),a+=8;continue}if(c===8){o.push(0);continue}if(c===9){o.push(1);continue}if(c>=12&&c%2===0){const i=(c-12)/2;o.push(null),a+=i;continue}if(c>=13){const i=(c-13)/2;o.push(e.toString("utf8",a,a+i)),a+=i;continue}return null}return o}catch{return null}}function pr(e){const n=e.indexOf("(");if(n<0)return[];const t=h=>h==='"'||h==="'"||h.charCodeAt(0)===Ce,r=(h,g)=>{const b=h[g];if(t(b)){for(g++;g<h.length&&h[g]!==b;)g++;return g}if(b==="["){const w=h.indexOf("]",g);return w<0?h.length:w}return g};let a=0,o=-1;for(let h=n;h<e.length;h++){const g=r(e,h);if(g!==h){h=g;continue}if(e[h]==="(")a++;else if(e[h]===")"&&(a--,a===0)){o=h;break}}if(o<0)return[];const s=e.slice(n+1,o),c=[];let i="",l=0;for(let h=0;h<s.length;h++){const g=r(s,h);if(g!==h){i+=s.slice(h,g+1),h=g;continue}if(s[h]==="("?l++:s[h]===")"&&l--,s[h]===","&&l===0){c.push(i),i="";continue}i+=s[h]}i.trim()&&c.push(i);const u=new Set(["PRIMARY","UNIQUE","CHECK","FOREIGN","CONSTRAINT"]),p=[];for(const h of c){const g=h.trim();if(!g)continue;let b="";if(g.startsWith('"')){const w=g.indexOf('"',1);b=g.slice(1,w>0?w:1)}else if(g.startsWith("[")){const w=g.indexOf("]",1);b=g.slice(1,w>0?w:1)}else if(g.charCodeAt(0)===Ce){const w=String.fromCharCode(Ce),_=g.indexOf(w,1);b=g.slice(1,_>0?_:1)}else{const w=g.match(/^([A-Za-z_][A-Za-z0-9_]*)/);w&&(b=w[1])}b&&(!g.startsWith('"')&&!g.startsWith("[")&&g.charCodeAt(0)!==Ce&&u.has(b.toUpperCase())||p.push(b))}return p}function Je(e,n,t,r,a,o){for(let s=n;s+8<=n+t;s+=8){const c=r?e.readUInt32BE(s):e.readUInt32LE(s),i=r?e.readUInt32BE(s+4):e.readUInt32LE(s+4);a=a+c+o>>>0,o=o+i+a>>>0}return[a,o]}class it{constructor(n,t,r){U(this,"fd");U(this,"pageSize");U(this,"reserved");U(this,"wal",new Map);U(this,"cache",new Map);this.fd=n,this.pageSize=t,this.reserved=r}static open(n){const t=f.openSync(n,"r");try{const r=Buffer.alloc(100);let a=0;for(;a<100;){const i=f.readSync(t,r,a,100-a,a);if(i<=0)throw new Error("short header read");a+=i}if(r.toString("latin1",0,16)!=="SQLite format 3\0")throw new Error("not a sqlite database");let o=r.readUInt16BE(16);if(o===1&&(o=65536),o<512||o&o-1)throw new Error("invalid page size");const s=r[20];if(r.readUInt32BE(56)!==1)throw new Error("unsupported text encoding");const c=new it(t,o,s);return c.loadWal(n+"-wal"),c}catch(r){try{f.closeSync(t)}catch{}throw r}}close(){try{f.closeSync(this.fd)}catch{}}loadWal(n){let t;try{t=f.readFileSync(n)}catch{return}if(t.length<32)return;const r=t.readUInt32BE(0);if(r!==931071618&&r!==931071619)return;const a=r===931071619;if(t.readUInt32BE(8)!==this.pageSize)return;const o=t.readUInt32BE(16),s=t.readUInt32BE(20);let c=0,i=0;if([c,i]=Je(t,0,24,a,c,i),c!==t.readUInt32BE(24)||i!==t.readUInt32BE(28))return;const l=24+this.pageSize;let u=32;for(;u+l<=t.length;){const p=t.readUInt32BE(u);if(t.readUInt32BE(u+8)!==o||t.readUInt32BE(u+12)!==s||([c,i]=Je(t,u,8,a,c,i),[c,i]=Je(t,u+24,this.pageSize,a,c,i),c!==t.readUInt32BE(u+16)||i!==t.readUInt32BE(u+20)))break;p>=1&&this.wal.set(p,t.subarray(u+24,u+24+this.pageSize)),u+=l}}page(n){const t=this.cache.get(n);if(t)return t;const r=this.wal.get(n);if(r)return this.cache.set(n,r),r;if(n>2147483647)return null;const a=Buffer.alloc(this.pageSize);let o=0;try{for(;o<this.pageSize;){const s=f.readSync(this.fd,a,o,this.pageSize-o,(n-1)*this.pageSize+o);if(s<=0)break;o+=s}}catch{return null}return o===0?null:(this.cache.set(n,a),a)}walkTable(n,t,r){if(r>30)return;const a=this.page(n);if(!a)return;const o=n===1?100:0,s=a[o];let c=0;try{c=a.readUInt16BE(o+3)}catch{return}if(s===13){const i=this.pageSize-this.reserved,l=i-35,u=Math.floor((i-12)*32/255)-23;for(let p=0;p<c;p++)try{const h=a.readUInt16BE(o+8+p*2),g=Pe(a,h),b=Pe(a,g.next),w=g.value;let _=w,B=0;if(w>l&&(_=u+(w-u)%(i-4),_>l&&(_=u),B=a.readUInt32BE(b.next+_)),B===0){if(b.next+w>a.length)continue;t(b.value,a.subarray(b.next,b.next+w));continue}const y=Buffer.alloc(w);a.copy(y,0,b.next,b.next+_);let C=_,O=B,S=!1;for(;O&&C<w;){const P=this.page(O);if(!P){S=!0;break}const R=P.readUInt32BE(0),q=Math.min(w-C,i-4);P.copy(y,C,4,4+q),C+=q,O=R}if(S||C!==w)continue;t(b.value,y)}catch{continue}}else if(s===5)try{for(let i=0;i<c;i++){const l=a.readUInt16BE(o+12+i*2);this.walkTable(a.readUInt32BE(l),t,r+1)}this.walkTable(a.readUInt32BE(o+8),t,r+1)}catch{return}}tableRoots(){const n=new Map;return this.walkTable(1,(t,r)=>{const a=yt(r);a&&a[0]==="table"&&typeof a[1]=="string"&&typeof a[3]=="number"&&typeof a[4]=="string"&&n.set(a[1],{root:a[3],sql:a[4]})},0),n}scanTable(n,t,r,a){const o=pr(t);if(!o.length)return;const s=[];for(const c of r){const i=o.indexOf(c);i>=0&&s.push([c,i])}this.walkTable(n,(c,i)=>{const l=yt(i);if(!l)return;const u={};for(const[p,h]of s)u[p]=l[h]??null;a(u)},0)}}const vt={requests:0,retries:0,toolCalls:0,toolErrors:0,input:0,output:0,reasoning:0,cacheRead:0,cacheWrite:0,total:0,durationMs:0,ttftMs:0};function v(e){return typeof e=="number"&&Number.isFinite(e)?e:0}function j(e){return typeof e=="string"?e:""}function hr(e){if(!e)return"";const n=new Date(e),t=r=>(r<10?"0":"")+r;return t(n.getHours())+":"+t(n.getMinutes())+":"+t(n.getSeconds())}let Se=null;function gr(){if(Se&&Date.now()-Se.at<6e5)return Se.map;const e=new Map;try{const n=Oe.find(r=>r.id==="zcode"),t=new Set([...((n==null?void 0:n.installPaths)??[]).map(r=>d.join(r,"resources","model-providers")),"D:\\ZCode\\resources\\model-providers"]);for(const r of t){let a=[];try{a=f.readdirSync(r).filter(o=>o.toLowerCase().endsWith(".json"))}catch{continue}for(const o of a)try{const s=JSON.parse(f.readFileSync(d.join(r,o),"utf8"));for(const c of Array.isArray(s==null?void 0:s.providers)?s.providers:[])for(const i of Array.isArray(c==null?void 0:c.models)?c.models:[]){const l=String((i==null?void 0:i.id)??"").trim().toLowerCase(),u=Number(i==null?void 0:i.contextWindow);l&&Number.isFinite(u)&&u>0&&e.set(l,u)}}catch{}}}catch{}return Se={at:Date.now(),map:e},e}function fr(e,n){const t=e.get(n);if(t!==void 0)return t;let r="",a;for(const[o,s]of e)o.length>r.length&&n.startsWith(o+"-")&&(r=o,a=s);return a}function Ke(){return{requests:0,input:0,output:0,reasoning:0,cacheRead:0,cacheWrite:0,total:0,toolCalls:0,retries:0,lastAt:0,lastIn:0,last:null,ctxExc:0}}function br(e=[]){var r,a;const n=d.join(Ae(),"db.sqlite");let t;try{t=it.open(n)}catch(o){return console.warn("[usage-db] open failed:",o.message),null}try{const o=t.tableRoots(),s=["model_usage","turn_usage","tool_usage","session"];for(const m of s)if(!o.has(m))return console.warn("[usage-db] table missing:",m),null;const c=new Date;c.setHours(0,0,0,0);const i=c.getTime(),l=i+864e5,u=Date.now(),p=new Map,h=new Map,g=new Map,b=new Map,w={requests:0,input:0,output:0,cacheRead:0,cacheWrite:0,reasoning:0,total:0,retries:0},_=o.get("model_usage");t.scanTable(_.root,_.sql,["session_id","turn_id","status","started_at","completed_at","duration_ms","time_to_first_token_ms","first_token_at","output_tokens","input_tokens","reasoning_tokens","cache_read_input_tokens","cache_creation_input_tokens","computed_total_tokens","tool_call_count","retry_count","model_id","query_source","context_exceeded"],m=>{const x=j(m.session_id);if(!x)return;const k=j(m.status),T=v(m.completed_at);if(k==="completed"){const D=j(m.query_source)==="subagent";let $=D?h.get(x):p.get(x);$||($=Ke(),(D?h:p).set(x,$));const Y=v(m.input_tokens);$.requests++;const z=j(m.turn_id);if(z){let F=g.get(x);F||(F=new Set,g.set(x,F)),F.add(z)}$.input+=Y,$.output+=v(m.output_tokens),$.reasoning+=v(m.reasoning_tokens),$.cacheRead+=v(m.cache_read_input_tokens),$.cacheWrite+=v(m.cache_creation_input_tokens),$.total+=v(m.computed_total_tokens),$.toolCalls+=v(m.tool_call_count),$.retries+=v(m.retry_count),T>$.lastAt&&($.lastAt=T);const ye=$.last;(!ye||T>=ye.completedAt)&&($.last={durationMs:v(m.duration_ms),ttftMs:v(m.time_to_first_token_ms),model:j(m.model_id),output:v(m.output_tokens),firstTokenAt:v(m.first_token_at),completedAt:T,turnId:j(m.turn_id)},$.lastIn=Y),T>=i&&T<l&&(w.requests++,w.input+=Y,w.output+=v(m.output_tokens),w.cacheRead+=v(m.cache_read_input_tokens),w.cacheWrite+=v(m.cache_creation_input_tokens),w.reasoning+=v(m.reasoning_tokens),w.total+=v(m.computed_total_tokens),w.retries+=v(m.retry_count))}if(v(m.context_exceeded)===1){const D=T||v(m.started_at);let $=p.get(x);$||($=Ke(),p.set(x,$)),D>$.ctxExc&&($.ctxExc=D)}if(k==="running"){const D=v(m.started_at);D>(b.get(x)??0)&&b.set(x,D)}});const B=new Map,y=new Map,C=o.get("turn_usage");t.scanTable(C.root,C.sql,["session_id","turn_id","status","started_at","completed_at","model_request_count","model_retry_count","tool_call_count","tool_error_count","input_tokens","output_tokens","reasoning_tokens","cache_read_input_tokens","cache_creation_input_tokens","computed_total_tokens","duration_ms","time_to_first_token_ms"],m=>{const x=j(m.session_id),k=j(m.turn_id);if(!x||!k)return;const T=j(m.status),D=v(m.completed_at)||v(m.started_at),$=y.get(x);D&&(!$||D>=$.at)&&y.set(x,{status:T,at:D}),T==="completed"&&B.set(x+"|"+k,{requests:v(m.model_request_count),retries:v(m.model_retry_count),toolCalls:v(m.tool_call_count),toolErrors:v(m.tool_error_count),input:v(m.input_tokens),output:v(m.output_tokens),reasoning:v(m.reasoning_tokens),cacheRead:v(m.cache_read_input_tokens),cacheWrite:v(m.cache_creation_input_tokens),total:v(m.computed_total_tokens),durationMs:v(m.duration_ms),ttftMs:v(m.time_to_first_token_ms)})});const O=new Map,S=new Map,P=o.get("tool_usage");t.scanTable(P.root,P.sql,["session_id","tool_name","status","duration_ms","started_at"],m=>{const x=j(m.session_id),k=j(m.status);if(!x)return;if(k==="running"){const Y=v(m.started_at);Y>(S.get(x)??0)&&S.set(x,Y);return}if(k!=="completed"&&k!=="error")return;const T=j(m.tool_name)||"(unknown)";let D=O.get(x);D||(D={total:0,errors:0,list:new Map},O.set(x,D));let $=D.list.get(T);$||($={count:0,durationMs:0,errors:0},D.list.set(T,$)),D.total++,$.count++,$.durationMs+=v(m.duration_ms),k==="error"&&(D.errors++,$.errors++)});const R=new Map,q=o.get("session");t.scanTable(q.root,q.sql,["id","title","parent_id","summary_additions","summary_deletions","summary_files"],m=>{const x=j(m.id);x&&R.set(x,{title:j(m.title),parent:typeof m.parent_id=="string"&&m.parent_id?m.parent_id:null,add:typeof m.summary_additions=="number"?m.summary_additions:null,del:typeof m.summary_deletions=="number"?m.summary_deletions:null,files:typeof m.summary_files=="number"?m.summary_files:null})});let X="",V=0;for(const[m,x]of p)x.lastAt>V&&(V=x.lastAt,X=m);const xe=m=>[...p.entries()].filter(([x])=>x.startsWith("sess_subagent")===m).sort((x,k)=>k[1].lastAt-x[1].lastAt).slice(0,6).map(([x])=>x),te=[],we=m=>{m&&/^[A-Za-z0-9_-]{1,255}$/.test(m)&&!te.includes(m)&&te.push(m)};for(const m of e)we(m);we(X),xe(!1).forEach(we),xe(!0).forEach(we);const Le=new Set;for(const m of te){const x=((a=(r=p.get(m))==null?void 0:r.last)==null?void 0:a.turnId)??"";x&&!B.has(m+"|"+x)&&Le.add(m+"|"+x)}const We=new Map;Le.size&&t.scanTable(_.root,_.sql,["session_id","turn_id","status","input_tokens","output_tokens","computed_total_tokens","duration_ms","cache_read_input_tokens","reasoning_tokens","cache_creation_input_tokens"],m=>{if(j(m.status)!=="completed")return;const x=j(m.session_id)+"|"+j(m.turn_id);if(!Le.has(x))return;let k=We.get(x);k||(k={...vt},We.set(x,k)),k.requests++,k.input+=v(m.input_tokens),k.output+=v(m.output_tokens),k.total+=v(m.computed_total_tokens),k.durationMs+=v(m.duration_ms),k.cacheRead+=v(m.cache_read_input_tokens),k.reasoning+=v(m.reasoning_tokens),k.cacheWrite+=v(m.cache_creation_input_tokens)});const en=gr(),lt=m=>{var pt;const x=p.get(m)??Ke(),k=R.get(m),T=x.last;let D=0;if(T&&T.output>0){let M=0;T.firstTokenAt&&T.completedAt>T.firstTokenAt?M=T.completedAt-T.firstTokenAt:M=T.durationMs,M>0&&(D=Math.round(T.output/(M/1e3)*10)/10)}const $=(T==null?void 0:T.turnId)??"",Y=$&&B.get(m+"|"+$)||$&&We.get(m+"|"+$)||{...vt},z=O.get(m),ye={total:(z==null?void 0:z.total)??0,errors:(z==null?void 0:z.errors)??0,list:[...(z==null?void 0:z.list.entries())??[]].map(([M,E])=>({name:M,count:E.count,durationMs:E.durationMs,errors:E.errors})).sort((M,E)=>E.count-M.count||(M.name<E.name?-1:1))},F=[...h.entries()].filter(([M])=>{var E;return((E=R.get(M))==null?void 0:E.parent)===m}).sort((M,E)=>E[1].lastAt-M[1].lastAt).map(([M,E])=>{var ht;return{sid:M,title:((ht=R.get(M))==null?void 0:ht.title)??"",task:"",requests:E.requests,total:E.total,input:E.input,output:E.output,cacheRead:E.cacheRead,reasoning:E.reasoning,cacheWrite:E.cacheWrite,last:E.lastAt,active:u-E.lastAt<lr}}),nn={requests:F.reduce((M,E)=>M+E.requests,0),total:F.reduce((M,E)=>M+E.total,0),input:F.reduce((M,E)=>M+E.input,0),output:F.reduce((M,E)=>M+E.output,0),cacheRead:F.reduce((M,E)=>M+E.cacheRead,0),reasoning:F.reduce((M,E)=>M+E.reasoning,0),cacheWrite:F.reduce((M,E)=>M+E.cacheWrite,0),active:F.some(M=>M.active),list:F},mt=((T==null?void 0:T.model)??"").trim().toLowerCase(),ut=mt?fr(en,mt):void 0,He=S.get(m)??0,Fe=b.get(m)??0,K=y.get(m);let de="idle",me=0;return He&&u-He<6e5?(de="running",me=He):Fe&&u-Fe<6e5?(de="thinking",me=Fe):K&&(K.status==="error"||K.status==="cancelled")&&u-K.at<12e3?(de="failed",me=K.at):K&&K.status==="completed"&&u-K.at<8e3&&(de="done",me=K.at),{sid:m,title:(k==null?void 0:k.title)??"",active:x.lastAt>0&&u-x.lastAt<cr,turns:((pt=g.get(m))==null?void 0:pt.size)??0,requests:x.requests,input:x.input,output:x.output,reasoning:x.reasoning,cacheRead:x.cacheRead,cacheWrite:x.cacheWrite,total:x.total,toolCalls:x.toolCalls,retries:x.retries,ctx:x.lastIn,updated:hr(x.lastAt),lastAt:x.lastAt,live:{state:de,at:me},last:{durationMs:(T==null?void 0:T.durationMs)??0,ttftMs:(T==null?void 0:T.ttftMs)??0,model:(T==null?void 0:T.model)??"",tps:D},lastTurn:Y,tools:ye,sub:nn,code:{add:(k==null?void 0:k.add)??null,del:(k==null?void 0:k.del)??null,files:(k==null?void 0:k.files)??null},ctxExc:x.ctxExc,contextWindow:ut??dr,contextAuto:ut!==void 0,isSub:m.startsWith("sess_subagent"),parent:(k==null?void 0:k.parent)??null}},dt=te.map(lt),tn=X?dt.find(m=>m.sid===X)??lt(X):null;return{v:1,generatedAt:u,today:w,session:tn,recent:dt}}catch(o){return console.warn("[usage-db] snapshot failed:",o.message),null}finally{t.close()}}const kt=1500,xr=3e4,wr=300,H=new Map;function oe(...e){console.error("[usage-pump]",...e)}async function zt(e){var t;const n=((t=W("zcode"))==null?void 0:t.rendererHints)??["out/renderer/index.html","renderer/index.html"];for(const r of n)try{const a=await le(e,r,{timeoutMs:1500,quiet:!0});if(a.length>0)return a}catch{}try{const a=await(await fetch(`http://127.0.0.1:${e}/json/list`,{signal:AbortSignal.timeout(3e3)})).json();return(Array.isArray(a)?a:[]).filter(je)}catch{return[]}}async function tt(e,n){return await Promise.race([e,new Promise(t=>setTimeout(()=>t(null),n))])}async function yr(e,n,t=!1){const r=await zt(e);if(r.length===0)return;const a=[];for(const u of r){const p=new J(u.webSocketDebuggerUrl);try{await p.open();const h=await tt(p.evaluate("(window.__dreamWorkUsageWant || '')"),1500),g=typeof h=="string"?h.trim():"";g&&/^[A-Za-z0-9_-]{1,255}$/.test(g)&&!a.includes(g)&&a.push(g)}catch{}finally{p.close()}}const o=mr(),s=a.join(",");if(!t&&s===n.lastWants&&o>0&&o===n.lastStamp)return;const c=Date.now();if(c-n.lastSpawnAt<kt){vr(e,kt-(c-n.lastSpawnAt)+50);return}n.lastWants=s,o&&(n.lastStamp=o),n.lastSpawnAt=c;const i=br(a);if(!i)return;const l="window.__dreamWorkUsageUpdate && window.__dreamWorkUsageUpdate("+JSON.stringify(i).replace(/[\u2028\u2029]/g,u=>u==="\u2028"?"\\u2028":"\\u2029")+")";for(const u of r){const p=new J(u.webSocketDebuggerUrl);try{await p.open(),await tt(p.evaluate(l),5e3)}catch{}finally{p.close()}}t||(n.settleTimer&&clearTimeout(n.settleTimer),n.settleTimer=setTimeout(()=>{const u=H.get(e);u&&(u.settleTimer=null),ie(e,!0)},2500))}function vr(e,n){const t=H.get(e);t&&(t.retryTimer&&clearTimeout(t.retryTimer),t.retryTimer=setTimeout(()=>{const r=H.get(e);r&&(r.retryTimer=null,ie(e))},Math.max(50,n)))}let Ze=!1;async function ie(e,n=!1){const t=H.get(e);if(!(!t||t.busy||Ze)){t.busy=!0,Ze=!0;try{await yr(e,t,n)}catch(r){oe("cycle failed:",r.message)}finally{t.busy=!1,Ze=!1}}}function Re(e){const n=H.get(e);if(!(!n||n.watcher))try{n.watcher=f.watch(Ae(),(t,r)=>{if(r&&!/db\.sqlite/.test(r))return;const a=H.get(e);a&&(a.debounceTimer&&clearTimeout(a.debounceTimer),a.debounceTimer=setTimeout(()=>{const o=H.get(e);o&&(o.debounceTimer=null,ie(e))},wr))}),n.watcher.on("error",()=>{oe("db watcher error, re-arm in 5s");const t=H.get(e);if(t!=null&&t.watcher){try{t.watcher.close()}catch{}t.watcher=null}setTimeout(()=>{H.has(e)&&Re(e)},5e3)}),oe("watching",Ae(),"for port",e)}catch(t){oe("fs.watch failed, retry in 5s:",t.message),setTimeout(()=>{H.has(e)&&Re(e)},5e3)}}let Ee=null;async function kr(e){const n=H.get(e);if(!n||n.busy)return;const t=await zt(e).catch(()=>[]),r=t&&t[0];if(!r)return;const a=new J(r.webSocketDebuggerUrl);try{await a.open();const o=await tt(a.evaluate("(window.__dreamWorkUsageWant || '')"),1200),s=typeof o=="string"?o.trim():"";s&&/^[A-Za-z0-9_-]{1,255}$/.test(s)&&!n.lastWants.split(",").includes(s)&&ie(e)}catch{}finally{a.close()}}function Cr(e){let n=H.get(e);if(n){n.watcher||Re(e);return}n={watcher:null,heartbeat:null,retryTimer:null,debounceTimer:null,settleTimer:null,busy:!1,lastSpawnAt:0,lastStamp:0,lastWants:""},H.set(e,n),Re(e),n.heartbeat=setInterval(()=>void ie(e),xr),Ee=setInterval(()=>void kr(e),2e3),oe("started for port",e),ie(e)}function Sr(e){const n=H.get(e);if(n){if(H.delete(e),n.watcher)try{n.watcher.close()}catch{}n.heartbeat&&clearInterval(n.heartbeat),n.retryTimer&&clearTimeout(n.retryTimer),n.debounceTimer&&clearTimeout(n.debounceTimer),n.settleTimer&&clearTimeout(n.settleTimer),Ee&&(clearInterval(Ee),Ee=null),oe("stopped for port",e)}}const Z="dream-work-style",L="dream-work-menu",se=new Map,he=new Map,ee=new Map,ge=new Map,I={id:"wb-dream-sentinel-id",hero:"data:image/png;base64,WBDREAMHEROSENTINEL",accent:"#010203",secondary:"#040506",surface:"#070809",text:"#0a0b0c",textSubtle:"#0d0e0f",textSubtlest:"#101112",textSecondary:"#131415"},Tr={zcode:[.7,.76,.88,.9],codex:[.76,.82,.86,.9,.92],catpaw:[.78,.82],"qoder-work":[.7,.82,.86,.9],"qwen-office":[.86,.9],workbuddy:[.58,.62,.92],"hana-agent":[.62,.66,.78]},qt=[.7,.76,.88,.9];function Vt(e){return Tr[e]??qt}function Gt(e){if(e)return"file:///"+encodeURI(e.replace(/\\/g,"/")).replace(/#/g,"%23").replace(/\?/g,"%3F")}let Te=null;function $r(){if(Te)return Te.length?Te:void 0;const e=[];try{const n=A.app.getAppPath(),t=a=>n.endsWith(".asar")&&(a===n||a.startsWith(n+d.sep)),r=d.resolve(d.join(n,"assets","pet"));for(const a of f.readdirSync(r)){if(a!==d.basename(a))continue;const o=d.resolve(r,a);if(o!==r&&!o.startsWith(r+d.sep))continue;try{if(!f.statSync(o).isDirectory())continue}catch{continue}let s={};try{s=JSON.parse(f.readFileSync(d.join(o,"pet.json"),"utf8"))}catch{}const c={};try{for(const i of f.readdirSync(o)){const l=d.extname(i).toLowerCase();if(![".gif",".webp",".png"].includes(l)||i!==d.basename(i))continue;const u=i.slice(0,-l.length);if(c[u]&&l!==".webp")continue;let p=d.join(o,i);if(t(p)){const b=d.resolve(n+".unpacked",d.relative(n,p));f.existsSync(b)&&(p=b)}const h=Gt(p);if(!h)continue;let g=0;try{g=Math.round(f.statSync(p).mtimeMs)}catch{}c[u]=g?h+"?v="+g:h}}catch{}Object.keys(c).length&&e.push({id:String(s.id||a),name:String(s.name||a),order:Number.isFinite(Number(s.order))?Number(s.order):99,scale:Number.isFinite(Number(s.scale))&&Number(s.scale)>0?Number(s.scale):.5,states:c})}e.sort((a,o)=>a.order-o.order||(a.id<o.id?-1:1))}catch(n){console.warn("[injector] pet registry unavailable:",n.message)}return Te=e,e.length?e:void 0}const Ct=new Map;function Er(e){let n;try{n=f.statSync(e)}catch{return null}const t=Ct.get(e);if(t&&t.size===n.size&&t.mtimeMs===n.mtimeMs)return t.rgb;let r=null;try{const a=A.nativeImage.createFromPath(e);if(!a.isEmpty()){const o=a.resize({width:1,height:1}).toDataURL();r=sr(Buffer.from(o.slice(o.indexOf(",")+1),"base64"))}}catch(a){console.warn("[injector] Hero average sampling failed:",a.message)}return Ct.set(e,{size:n.size,mtimeMs:n.mtimeMs,rgb:r}),r}let $e=null;async function _r(){if(!$e)try{const e=d.resolve(__dirname,"manager","codex-dream-skin.css");$e=await mn.readFile(e,"utf-8")}catch(e){console.warn("[injector] Failed to load Codex base CSS:",e.message),$e=""}return $e}async function Jt(e,n,t,r={}){const a=W(e),o=r.rendererUrlHint?[r.rendererUrlHint]:(a==null?void 0:a.rendererHints)??["renderer/index.html","index.html"];let s=[],c="No renderer targets found";for(const i of o)try{if(console.log(`[injector] Trying hint "${i}" on port ${t}`),s=await Fn(t,i,{timeoutMs:2e4,pollMs:500}),s.length>0){console.log(`[injector] Found ${s.length} targets with hint "${i}"`);break}}catch(l){c=l.message,console.log(`[injector] Hint "${i}" failed: ${l.message}`)}if(s.length===0)try{console.log(`[injector] Strict hints failed, trying relaxed page-target fallback on port ${t}`);const l=await(await fetch(`http://127.0.0.1:${t}/json/list`,{signal:AbortSignal.timeout(5e3)})).json(),u=(Array.isArray(l)?l:[]).filter(je).sort((p,h)=>{const g=[String(p.id??""),p.url,p.webSocketDebuggerUrl],b=[String(h.id??""),h.url,h.webSocketDebuggerUrl];for(let w=0;w<g.length;w++){if(g[w]<b[w])return-1;if(g[w]>b[w])return 1}return 0});u.length>0&&(console.log(`[injector] Relaxed fallback found ${u.length} page targets`),s=u)}catch(i){console.log(`[injector] Relaxed fallback failed: ${i.message}`)}if(s.length===0)return{success:!1,applied:0,error:c};try{const i=Ne(e);if(console.log(`[injector] Loaded ${i.length} themes`),!i.some(y=>y.id===n))return{success:!1,applied:0,error:`Theme ${n} is not compatible with ${e}`};const l=rr(e,i.map(y=>y.id),n,8),u=new Map(i.map(y=>[y.id,y])),p=l.map(y=>u.get(y)).filter(Boolean),h=new Map;for(const y of p){const C=e==="zcode"?er(y):null;h.set(y.id,{name:y.name,css:Tt(e,y.manifest,Zn(y),Er(d.join(y.path,y.manifest.hero)),{video:!!C}),surface:y.manifest.colors.surface,videoUrl:Gt(C)})}const g=Array.from(h.entries()).map(([y,C])=>{var O;return{id:y,name:C.name,css:C.css,surface:C.surface,accent:((O=i.find(S=>S.id===y))==null?void 0:O.manifest.colors.accent)??"#24c9d7",videoUrl:C.videoUrl}});let b=ot();if(b.length===0){const y=e==="workbuddy"?"dreamCustomThemes":"dreamCodexCustomThemes";for(const C of s){const O=new J(C.webSocketDebuggerUrl);try{await O.open();const S=await O.evaluate(`(() => localStorage.getItem(${JSON.stringify(y)}) || '[]')()`),P=JSON.parse(S);if(Array.isArray(P)&&P.length>0){b=nr(P);break}}catch(S){console.warn(`[injector] Failed to import existing custom themes from ${e} target ${C.id}:`,S)}finally{O.close()}}}const w=await ar(),_=e==="workbuddy"?qr({styleId:Z,menuId:L,currentThemeId:n,themes:g,sharedCustomThemes:b,sharedCustomThemeService:w,cssTemplate:Zt({id:I.id,colors:{accent:I.accent,secondary:I.secondary,surface:I.surface,text:I.text},copy:null},I.hero,{accent:I.accent,secondary:I.secondary,surface:I.surface,text:I.text})}):e==="hana-agent"?Lr({styleId:Z,menuId:L,currentThemeId:n,themes:g,sharedCustomThemes:b,sharedCustomThemeService:w,cssTemplate:Kt({id:I.id,colors:{accent:I.accent,secondary:I.secondary,surface:I.surface,text:I.text}},I.hero,{accent:I.accent,secondary:I.secondary,surface:I.surface,text:I.text})}):Vr({styleId:Z,menuId:L,currentThemeId:n,appId:e,themes:g,sharedCustomThemes:b,sharedCustomThemeService:w,cssTemplate:Tt(e,{id:I.id,colors:{accent:I.accent,secondary:I.secondary,surface:I.surface,text:I.text}},I.hero,null,{template:!0}),surfaceAlphas:Vt(e),pets:e==="zcode"?$r():void 0});let B=0;for(const y of s)try{console.log(`[injector] Injecting to target ${y.id}: ${y.url}`);const C=new J(y.webSocketDebuggerUrl);if(await C.open(),e==="workbuddy"&&!await C.evaluate(`(() => {
            const body = document.body;
            return body?.dataset.applicationName === 'workbuddy' && Boolean(
              document.querySelector('[data-view-id], .teams-container, .conversation-list, .main-content')
            );
          })()`)){console.warn(`[injector] Skipping non-WorkBuddy target ${y.id}: ${y.url}`),C.close();continue}if(e==="codex"){const S=await _r();S&&await C.evaluate(`(() => {
              const existing = document.getElementById('codex-dream-skin-base');
              if (!existing) {
                const style = document.createElement('style');
                style.id = 'codex-dream-skin-base';
                style.textContent = ${JSON.stringify(S)};
                document.head.appendChild(style);
              }
            })()`)}if(e==="hana-agent"){const S=`(() => {
            const inject = () => ${_};
            if (document.readyState === 'loading') {
              window.addEventListener('DOMContentLoaded', inject, { once: true });
            } else {
              inject();
            }
          })()`,P=se.get(y.id);P&&await C.removeScriptToEvaluateOnNewDocument(P).catch(()=>{});const R=await C.addScriptToEvaluateOnNewDocument(S);R&&se.set(y.id,R)}const O=await C.evaluate(e==="hana-agent"?`(() => { window.__dreamWorkForceApply = true; return ${_}; })()`:_);if(console.log(`[injector] Injection result for target ${y.id}:`,O),e==="zcode"){const S=ir(),P=ge.get(y.id);P&&await C.removeScriptToEvaluateOnNewDocument(P).catch(()=>{});const R=await C.addScriptToEvaluateOnNewDocument(`(() => { const inject = () => { ${S} }; if (document.readyState === 'loading') window.addEventListener('DOMContentLoaded', inject, { once: true }); else inject(); })()`).catch(()=>{});R&&ge.set(y.id,R),await C.evaluate(S).catch(q=>console.warn(`[injector] Usage bar injection failed for target ${y.id}:`,q.message))}if(e==="hana-agent"){let S=!1;for(let P=0;P<20&&(S=await C.evaluate(`(() => {
              const host = document.getElementById('${L}-host');
              return Boolean(
                document.getElementById('${Z}') &&
                host?.shadowRoot?.getElementById('${L}') &&
                document.documentElement.dataset.dreamTheme
              );
            })()`).catch(()=>!1),!S);P++)await new Promise(R=>setTimeout(R,100));if(!S){console.warn(`[injector] HanaAgent injection did not become ready for target ${y.id}`),C.close();continue}}if(e==="codex")for(let S=1;S<=4;S++){const P=await C.evaluate(`(() => {
              const shellMain = document.querySelector('main.main-surface') || document.querySelector('main');
              let homeCandidate = shellMain ? (shellMain.matches('[role="main"]') ? shellMain : shellMain.querySelector('[role="main"]')) : null;
              
              // Fallback: if no [role="main"] found, try broader selectors.
              if (!homeCandidate) {
                homeCandidate = document.querySelector('[class*="home-main-content"]') ||
                                document.querySelector('[class*="home-content"]') ||
                                document.querySelector('main') ||
                                document.querySelector('.app-shell') ||
                                document.body;
              }
              
              if (!homeCandidate) return { error: 'no homeCandidate' };
              
              const hasGameSource = Boolean(homeCandidate.querySelector('[data-feature="game-source"]'));
              const hasSuggestions = Boolean(homeCandidate.querySelector('[class*="group/home-suggestions"]'));
              const hasTaskContent = Boolean(homeCandidate.querySelector('.thread-scroll-container, [data-message-author-role], article, .message'));
              
              // If we fell back to body/main and can't detect home signals, still tag it
              // so the CSS selectors have something to bind to.
              const isFallback = homeCandidate === document.body || homeCandidate.matches('main');
              const isHomeContainer = homeCandidate.matches('[class*="home-main-content"], [class*="container-name:home-main-content"]');
              if ((hasGameSource || hasSuggestions || isHomeContainer || isFallback) && !hasTaskContent) {
                homeCandidate.classList.add('dream-skin-home');
                if (shellMain) shellMain.classList.add('dream-skin-home-shell');
              } else if (shellMain) {
                shellMain.classList.remove('dream-skin-home-shell');
              }
              return {
                homeClasses: Array.from(homeCandidate.classList),
                shellClasses: shellMain ? Array.from(shellMain.classList) : [],
                hasGameSource,
                hasSuggestions,
                hasTaskContent,
                isHomeContainer,
                isFallback
              };
            })`);if(P.homeClasses&&P.homeClasses.includes("dream-skin-home")){console.log(`[injector] Codex home detection for ${y.id}: attempt=${S}`,JSON.stringify(P));break}S<4&&await new Promise(R=>setTimeout(R,800))}if(e==="codex")try{const S=await C.evaluate(`(() => {
              const html = document.documentElement;
              const body = document.body;
              const style = document.getElementById('dream-work-style');
              const baseStyle = document.getElementById('codex-dream-skin-base');
              const menu = document.getElementById('dream-work-menu');
              
              // Check computed styles of key elements
              const mainSurface = document.querySelector('main.main-surface') || document.querySelector('main');
              const sidebar = document.querySelector('aside.app-shell-left-panel');
              const homeEl = document.querySelector('.dream-skin-home');
              
              return {
                htmlClasses: Array.from(html.classList),
                bodyClasses: Array.from(body.classList),
                hasStyle: Boolean(style),
                styleLength: style ? style.textContent.length : 0,
                hasBaseStyle: Boolean(baseStyle),
                baseStyleLength: baseStyle ? baseStyle.textContent.length : 0,
                hasMenu: Boolean(menu),
                title: document.title,
                url: window.location.href,
                mainSurfaceClasses: mainSurface ? Array.from(mainSurface.classList) : null,
                sidebarClasses: sidebar ? Array.from(sidebar.classList) : null,
                homeClasses: homeEl ? Array.from(homeEl.classList) : null,
                codexDreamSkinOnHtml: html.classList.contains('codex-dream-skin'),
                dreamTheme: html.dataset.dreamTheme || null
              };
            })()`);console.log(`[injector] Codex debug info for ${y.id}:`,JSON.stringify(S,null,2))}catch(S){console.error(`[injector] Failed to get debug info for ${y.id}:`,S)}C.close(),B++}catch(C){console.error(`[injector] Failed to inject to target ${y.id}:`,C)}if(e==="hana-agent"&&B>0){const y=new Set(s.map(P=>P.id)),C=Date.now()+2e4;let O="",S=0;for(;Date.now()<C;){let P=[];try{P=await le(t,".hanako/artifacts/renderer/",{timeoutMs:2e3,quiet:!0})}catch{}const R=P[0];if(!R){O="",S=0,await new Promise(V=>setTimeout(V,250));continue}if(!y.has(R.id)){console.log(`[injector] HanaAgent created renderer target ${R.id}; injecting theme`);const V=new J(R.webSocketDebuggerUrl);try{await V.open();const xe=`(() => {
              const inject = () => ${_};
              if (document.readyState === 'loading') window.addEventListener('DOMContentLoaded', inject, { once: true });
              else inject();
            })()`,te=await V.addScriptToEvaluateOnNewDocument(xe);te&&se.set(R.id,te),await V.evaluate(`(() => { window.__dreamWorkForceApply = true; return ${_}; })()`),y.add(R.id)}finally{V.close()}}const q=new J(R.webSocketDebuggerUrl);let X=!1;try{await q.open(),X=await q.evaluate(`(() => {
            const host = document.getElementById('${L}-host');
            return Boolean(document.getElementById('${Z}') && host?.shadowRoot?.getElementById('${L}') && document.documentElement.dataset.dreamTheme);
          })()`)}catch{}finally{q.close()}if(X){if(O!==R.id)O=R.id,S=Date.now();else if(Date.now()-S>=2e3)return Ir(t,_,y),Qe(e,n),{success:!0,applied:1}}else O="",S=0;await new Promise(V=>setTimeout(V,250))}return{success:!1,applied:0,error:"HanaAgent renderer did not stabilize with the injected theme"}}return e==="zcode"&&B>0&&Cr(t),B>0&&Qe(e,n),{success:B>0,applied:B}}catch(i){return console.error("[injector] Injection failed:",i),{success:!1,applied:0,error:i.message}}}async function Mr(e,n,t={}){return Pr(e,n,t)}function Ir(e,n,t){const r=he.get(e);r&&clearInterval(r);const a=(ee.get(e)??0)+1;ee.set(e,a);let o=!1;const s=setInterval(async()=>{if(!o&&ee.get(e)===a){o=!0;try{const i=(await le(e,".hanako/artifacts/renderer/",{timeoutMs:1e3,quiet:!0}))[0];if(!i||ee.get(e)!==a)return;const l=new J(i.webSocketDebuggerUrl);try{await l.open();const u=await l.evaluate(`(() => {
          const host = document.getElementById('${L}-host');
          if (document.documentElement.dataset.dreamThemeRestored === 'true') return 'restored';
          return document.getElementById('${Z}') && host?.shadowRoot?.getElementById('${L}') && document.documentElement.dataset.dreamTheme
            ? 'ready'
            : 'missing';
        })()`).catch(()=>"missing");if(u==="ready"||u==="restored"){t.add(i.id);return}if(console.log(`[injector] HanaAgent watcher restoring theme on renderer target ${i.id}`),ee.get(e)!==a)return;const p=`(() => {
          const inject = () => ${n};
          if (document.readyState === 'loading') window.addEventListener('DOMContentLoaded', inject, { once: true });
          else inject();
        })()`;if(!t.has(i.id)){const h=await l.addScriptToEvaluateOnNewDocument(p);h&&se.set(i.id,h)}if(await l.evaluate(n),ee.get(e)!==a){await l.evaluate(`(() => {
            document.getElementById('${Z}')?.remove();
            document.getElementById('${L}-host')?.remove();
            clearInterval(window.__dreamWorkMenuGuard);
            delete window.__dreamWorkMenuGuard;
            delete document.documentElement.dataset.dreamTheme;
          })()`).catch(()=>{});return}t.add(i.id)}finally{l.close()}}catch{await Ar(e)||(clearInterval(s),he.delete(e))}finally{o=!1}}},1e3);he.set(e,s)}async function Ar(e){try{return(await fetch(`http://127.0.0.1:${e}/json/version`,{signal:AbortSignal.timeout(500)})).ok}catch{return!1}}async function Pr(e,n,t={}){var c;const r=t.rendererUrlHint?[t.rendererUrlHint]:((c=W(e))==null?void 0:c.rendererHints)??["renderer/index.html","index.html"];let a=[];for(const i of r)try{if(a=await le(n,i,{timeoutMs:1e3,quiet:!0}),a.length>0)break}catch{}if(a.length===0)try{const l=await(await fetch(`http://127.0.0.1:${n}/json/list`,{signal:AbortSignal.timeout(5e3)})).json();a=(Array.isArray(l)?l:[]).filter(je).sort((u,p)=>{const h=[String(u.id??""),u.url,u.webSocketDebuggerUrl],g=[String(p.id??""),p.url,p.webSocketDebuggerUrl];for(let b=0;b<h.length;b++){if(h[b]<g[b])return-1;if(h[b]>g[b])return 1}return 0})}catch{}if(a.length===0)return{installed:!1,menu:!1,targets:0};const o=[];for(const i of a){const l=new J(i.webSocketDebuggerUrl);try{if(await l.open(),e==="workbuddy"&&!await l.evaluate("(() => document.body?.dataset.applicationName === 'workbuddy')()"))continue;const u=await l.evaluate(`(() => {
        const style = document.getElementById('${Z}');
        const menuHost = document.getElementById('${L}-host');
        const menu = document.getElementById('${L}') || menuHost?.shadowRoot?.getElementById('${L}');
        return JSON.stringify({
          installed: Boolean(style),
          menu: Boolean(menu),
          themeId: document.documentElement.dataset.dreamTheme ?? undefined
        });
      })()`),p=JSON.parse(u);o.push(p)}catch(u){console.warn(`[injector] Status check failed for ${e} target ${i.id}:`,u)}finally{l.close()}}const s=o.find(i=>i.installed&&i.themeId)??o.find(i=>i.installed);return{installed:o.some(i=>i.installed),menu:o.some(i=>i.menu),themeId:s==null?void 0:s.themeId,targets:o.length}}async function Rr(e,n,t={}){var o;if(e==="hana-agent"){ee.set(n,(ee.get(n)??0)+1);const s=he.get(n);s&&clearInterval(s),he.delete(n)}const r=t.rendererUrlHint??((o=W(e))==null?void 0:o.rendererHints[0])??"renderer/index.html";let a=[];try{a=await le(n,r)}catch{}if(a.length===0)try{const c=await(await fetch(`http://127.0.0.1:${n}/json/list`,{signal:AbortSignal.timeout(5e3)})).json();a=(Array.isArray(c)?c:[]).filter(je).sort((i,l)=>{const u=[String(i.id??""),i.url,i.webSocketDebuggerUrl],p=[String(l.id??""),l.url,l.webSocketDebuggerUrl];for(let h=0;h<u.length;h++){if(u[h]<p[h])return-1;if(u[h]>p[h])return 1}return 0})}catch{}if(a.length===0)return{success:!1};for(const s of e==="hana-agent"?a:a.slice(0,1)){const c=new J(s.webSocketDebuggerUrl);if(await c.open(),e==="hana-agent"){const i=se.get(s.id);i&&(await c.removeScriptToEvaluateOnNewDocument(i).catch(()=>{}),se.delete(s.id))}if(e==="zcode"){const i=ge.get(s.id);i&&(await c.removeScriptToEvaluateOnNewDocument(i).catch(()=>{}),ge.delete(s.id))}await c.evaluate(`(() => {
      ${e==="hana-agent"?`try { localStorage.setItem('dream-work-theme:hana-agent:restored', '1'); } catch {}
      document.documentElement.dataset.dreamThemeRestored = 'true';`:""}
      document.getElementById('${Z}')?.remove();
      document.getElementById('${L}')?.remove();
      document.getElementById('${L}-host')?.remove();
      document.getElementById('${L}-pet-host')?.remove();
      clearInterval(window.__dreamWorkPetTimer);
      document.getElementById('dream-work-video-layer')?.remove();
      document.getElementById('dream-usage-bar')?.remove();
      document.getElementById('dream-usage-tip')?.remove();
      document.getElementById('dream-usage-exc')?.remove();
      document.querySelectorAll('[data-du-pad]').forEach((el) => {
        el.style.marginBottom = el.dataset.duPad || '';
        delete el.dataset.duPad;
      });
      clearInterval(window.__dreamWorkMenuGuard);
      delete window.__dreamWorkMenuGuard;
      delete window.__dreamWorkVideoSrc;
      delete window.__dreamWorkUsageBar;
      delete window.__dreamWorkUsageUpdate;
      delete window.__dreamWorkUsageWant;
      window.__dreamWorkUsageGen = (window.__dreamWorkUsageGen || 0) + 1;
      if (window.__dreamWorkOutsideClick) {
        document.removeEventListener('pointerdown', window.__dreamWorkOutsideClick, true);
        delete window.__dreamWorkOutsideClick;
      }
      delete document.documentElement.dataset.dreamTheme;
      delete document.documentElement.dataset.dreamShell;
      return true;
    })`),c.close()}return e==="zcode"&&(ge.clear(),Sr(n)),{success:!0}}function Dr(e,n,t,r){const a=Me(e),o=r.map(c=>re(t??a,a,c)),s=ke(Me(n),o,4.5);return{text:ue(s),textSubtle:ue(ke(re(a,s,.88),o,3)),textSubtlest:ue(ke(re(a,s,.8),o,3)),textSecondary:ue(ke(re(a,s,.72),o,3))}}function Ur(e){const n=e[0]/255,t=e[1]/255,r=e[2]/255,a=Math.max(n,t,r),o=Math.min(n,t,r),s=(a+o)/2,c=a-o,i=c===0?0:c/(1-Math.abs(2*s-1)),p=(((c===0?0:a===n?(t-r)/c%6:a===t?(r-n)/c+2:(n-t)/c+4)*60%360+360)%360-60+360)%360,h=(1-Math.abs(2*s-1))*Math.max(i,.35),g=h*(1-Math.abs(p/60%2-1)),b=s-h/2;return(p<60?[h,g,0]:p<120?[g,h,0]:p<180?[0,h,g]:p<240?[0,g,h]:p<300?[g,0,h]:[h,0,g]).map(_=>(_+b)*255)}function St(e){let n;try{n=Me(e)}catch{return null}const t=n[0]/255,r=n[1]/255,a=n[2]/255,o=Math.max(t,r,a),s=Math.min(t,r,a),c=o-s;let i=0;return c>0&&(i=((o===t?(r-a)/c%6:o===r?(a-t)/c+2:(t-r)/c+4)*60%360+360)%360),{h:i,chroma:c}}function Or(e,n){const t=St(e),r=St(n);if(!t||!r)return n;const a=Math.abs(t.h-r.h)%360;return(a>180?360-a:a)>=45&&r.chroma>=.1?n:ue(Ur(Me(e)))}function Tt(e,n,t,r=null,a={}){var u,p,h,g;const o=((u=n.colors)==null?void 0:u.surface)??"#f7fbff",s=((p=n.colors)==null?void 0:p.text)??"#17344f",c=a.template?{text:s,textSubtle:I.textSubtle,textSubtlest:I.textSubtlest,textSecondary:I.textSecondary}:Dr(o,s,r,Vt(e)),i={accent:((h=n.colors)==null?void 0:h.accent)??"#24c9d7",secondary:((g=n.colors)==null?void 0:g.secondary)??"#ef8fd3",surface:o,...c};if(e==="zcode"&&!a.template&&(i.secondary=Or(i.accent,i.secondary)),e==="codex")return Fr(n,t,i);const l=W(e);return(l==null?void 0:l.kind)==="vscode-work"?Br(n,t,i):(l==null?void 0:l.kind)==="generic-work"?e==="hana-agent"?Kt(n,t,i):jr(e,n,t,i,!!a.video):Zt({...n,copy:null},t,i)}function Br(e,n,t){return`/* DREAM_THEME:${e.id} */
:root {
  --vscode-editor-background: transparent !important;
  --vscode-foreground: ${t.text} !important;
  --vscode-sideBar-background: color-mix(in srgb, ${t.surface} 92%, transparent) !important;
  --vscode-panel-background: transparent !important;
  --vscode-input-background: color-mix(in srgb, ${t.surface} 94%, transparent) !important;
  --vscode-button-background: ${t.accent} !important;
  --vscode-button-foreground: #ffffff !important;
  --vscode-focusBorder: ${t.accent} !important;
}
body.solo-lite {
  background-color: ${t.surface} !important;
  color: ${t.text} !important;
}
body.solo-lite #root {
  background-color: ${t.surface} !important;
  background-image: url(${JSON.stringify(n)}) !important;
  background-position: center center !important;
  background-size: cover !important;
  background-repeat: no-repeat !important;
  background-attachment: fixed !important;
  color: ${t.text} !important;
}
body.solo-lite #solo-lite-root {
  background-color: transparent !important;
  background-image: none !important;
}
.panel-content,
.initial-chat-panel,
.solo-lite-chat-panel-container {
  background-color: transparent !important;
  background-image: none !important;
  color: ${t.text} !important;
}
.panel-content > *,
.initial-chat-panel > *,
.initial-chat-panel-content,
.solo-lite-chat-panel-container > *,
.solo-lite-chat-panel-main,
.solo-lite-chat-panel,
.solo-lite-chat-panel-content > *,
.solo-lite-chat-container,
.session-panel-cache-layout,
.virtualized-message-list-view__content,
.virtualized-message-list-view,
[class*="virtualized-message-list-view__scroller"],
[class*="virtualized-message-list-view__virtuoso"] {
  background-color: transparent !important;
  background-image: none !important;
}
.messageInputContainer {
  background-color: color-mix(in srgb, ${t.surface} 76%, transparent) !important;
  color: ${t.text} !important;
  backdrop-filter: blur(12px) saturate(105%);
}
.messageInputContainer {
  border-color: color-mix(in srgb, ${t.accent} 34%, transparent) !important;
  box-shadow: 0 16px 44px color-mix(in srgb, ${t.surface} 34%, transparent) !important;
}
.messageInputContainer :where(
  .chat-input-v2-editor-part,
  .chat-input-v2-slot-header,
  .chat-input-v2-editor-part-lower-content,
  .chat-input-v2-editor-part-lower__left,
  .chat-input-v2-editor-part-lower__right,
  .chat-input-v2-slot-toolbar-right,
  .chat-input-v2-slot-overlay,
  .messageInputToolbarIconBtn,
  .messageInputPluginToolbar,
  .messageInputPluginToolbarIconWrapper,
  .messageInputPluginToolbarMore,
  .chat-input-v2-send-button
) {
  background-color: transparent !important;
  background-image: none !important;
  backdrop-filter: none !important;
}
html body.solo-lite #root .initial-chat-panel .messageInputContainer button.messageInputToolbarIconBtn,
html body.solo-lite #root .initial-chat-panel .messageInputContainer button.messageInputPluginToolbar,
html body.solo-lite #root .initial-chat-panel .messageInputContainer .messageInputPluginToolbarIconWrapper,
html body.solo-lite #root .initial-chat-panel .messageInputContainer .messageInputPluginToolbarMore,
html body.solo-lite #root .initial-chat-panel .messageInputContainer .chat-input-v2-editor-part-lower__right,
html body.solo-lite #root .initial-chat-panel .messageInputContainer .chat-input-v2-slot-toolbar-right,
html body.solo-lite #root .solo-lite-chat-panel-content .messageInputContainer button.messageInputToolbarIconBtn,
html body.solo-lite #root .solo-lite-chat-panel-content .messageInputContainer button.messageInputPluginToolbar,
html body.solo-lite #root .solo-lite-chat-panel-content .messageInputContainer .messageInputPluginToolbarIconWrapper,
html body.solo-lite #root .solo-lite-chat-panel-content .messageInputContainer .messageInputPluginToolbarMore,
html body.solo-lite #root .solo-lite-chat-panel-content .messageInputContainer .chat-input-v2-editor-part-lower__right,
html body.solo-lite #root .solo-lite-chat-panel-content .messageInputContainer .chat-input-v2-slot-toolbar-right {
  background: transparent !important;
  background-color: transparent !important;
  background-image: none !important;
  backdrop-filter: none !important;
}
html body.solo-lite #root :where(.initial-chat-panel, .solo-lite-chat-panel-content) .messageInputContainer
  :where(button, button span, .messageInputPluginToolbarMore, .core-model-select-trigger, .rtcVoicePluginButton, .voiceCallButton, .inputBarButton-ncFFma) {
  color: ${t.text} !important;
  -webkit-text-fill-color: ${t.text} !important;
}
html body.solo-lite #root :where(.initial-chat-panel, .solo-lite-chat-panel-content) .messageInputContainer
  :where(button, [role="button"]) svg {
  color: ${t.text} !important;
  fill: currentColor !important;
  stroke: currentColor !important;
}
.messageInputContainer .chat-input-v2-slot-overlay {
  pointer-events: none !important;
}
.messageInputContainer :where(
  button,
  .messageInputToolbarIconBtn,
  .messageInputPluginToolbar,
  .core-model-select-trigger,
  .rtcVoicePluginButton,
  .voiceCallButton,
  .inputBarButton-ncFFma
) {
  color: ${t.text} !important;
  -webkit-text-fill-color: ${t.text} !important;
}
.messageInputContainer :where(button, [role="button"]) svg {
  color: ${t.text} !important;
  fill: currentColor !important;
  stroke: currentColor !important;
}
.messageInputContainer :where(button, [role="button"]):hover {
  background-color: color-mix(in srgb, ${t.accent} 16%, transparent) !important;
}
.messageInputContainer .chat-input-v2-send-button:not(.disabled) {
  background-color: ${t.accent} !important;
  color: #ffffff !important;
  -webkit-text-fill-color: #ffffff !important;
}
.messageInputContainer .chat-input-v2-send-button.disabled {
  opacity: .5 !important;
}
.messageInputContainer .projectButtonPlaceholderWork-JV100D,
.messageInputContainer [class*="Placeholder"] {
  color: color-mix(in srgb, ${t.text} 66%, transparent) !important;
  -webkit-text-fill-color: color-mix(in srgb, ${t.text} 66%, transparent) !important;
}
html[data-dream-shell="dark"] body.solo-lite #root .messageInputContainer
  :where(.inputBarButton-ncFFma, .inputBarButton-ncFFma *, .core-model-select-trigger, .core-model-select-trigger *) {
  color: ${t.text} !important;
  -webkit-text-fill-color: ${t.text} !important;
}
html[data-dream-shell="dark"] body.solo-lite #root
  :where(.task-list-base-content, .soloLiteMenubar, .task-list-base-footer)
  :where(
    .tab-pLFRtu,
    .tab-pLFRtu *,
    .task-list-new-task-item,
    .task-list-new-task-item *,
    .taskItem,
    .taskItem *,
    .task-list-heading,
    .task-list-heading *,
    .task-list-group-title,
    .task-list-group-title *,
    .accountTrigger-rIX2_l,
    .accountTrigger-rIX2_l *,
    .solo-mobile-expanded-btn,
    .solo-mobile-expanded-btn *,
    .menubar-menu-title,
    .menubar-menu-title *
  ) {
  color: ${t.text} !important;
  -webkit-text-fill-color: ${t.text} !important;
}
html[data-dream-shell="dark"] body.solo-lite #root
  :where(.task-list-heading, .task-list-group-title, .menubar-menu-title) {
  opacity: .78 !important;
}
html[data-dream-shell="dark"] body.solo-lite #root
  :where(.task-list-base-content, .soloLiteMenubar, .task-list-base-footer, .messageInputContainer) svg {
  color: ${t.text} !important;
}
html[data-dream-shell="dark"] body.solo-lite #root
  :where(.task-list-base-content, .soloLiteMenubar, .task-list-base-footer, .messageInputContainer)
  :where(svg[fill]:not([fill="none"]), svg [fill]:not([fill="none"])) {
  fill: currentColor !important;
}
html[data-dream-shell="dark"] body.solo-lite #root
  :where(.task-list-base-content, .soloLiteMenubar, .task-list-base-footer, .messageInputContainer)
  :where(svg[stroke]:not([stroke="none"]), svg [stroke]:not([stroke="none"])) {
  stroke: currentColor !important;
}
`}function jr(e,n,t,r,a=!1){const o={"qoder-work":'#root > div, [class*="layout"], [class*="content-area"], [class*="main-content"]',catpaw:".main-area, .main-content-container, .main-content, .chat-content-area",zcode:'main, main > div, [class*="min-h-0"][class*="flex-1"]',"qwen-office":".agents-content-area, .agents-parchment-paper-surface"},s={"qoder-work":'[class*="sidebar"]',catpaw:".sidebar-wrapper, .sidebar",zcode:"#sidebar, aside","qwen-office":".agents-sidebar, .group\\/sidebar"},c=o[e]??'main, [role="main"], [class*="main-content"]',i=s[e]??'aside, nav, [class*="sidebar"]',l=e==="qoder-work"?Wr(r):e==="catpaw"?Hr(t,r):e==="zcode"?Nr(r):"",u=e==="zcode"?'[class*="composer"], [class*="input-container"]':'[class*="message"], [class*="bubble"], [class*="composer"], [class*="input-container"]',p=a?"transparent !important":e==="zcode"?`url(${JSON.stringify(t)}) center / cover no-repeat fixed !important`:`linear-gradient(90deg, color-mix(in srgb, ${r.surface} 82%, transparent) 0 12%, transparent 42%), url(${JSON.stringify(t)}) center / cover no-repeat fixed !important`;return`/* DREAM_THEME:${n.id} */
:root {
  --dream-work-accent: ${r.accent};
  --dream-work-secondary: ${r.secondary};
  --dream-work-surface: ${r.surface};
  --dream-work-text: ${r.text};
  /* ZCode 原生前景色变量：跟随动态提升后的文字色，毛玻璃背景上保持可读；
     次级色按 88%/80%/72% 混合并保证 3:1 对比度下限（见 deriveTextColors） */
  --color-foreground: ${r.text} !important;
  --color-foreground-subtle: ${r.textSubtle} !important;
  --color-foreground-subtlest: ${r.textSubtlest} !important;
  --catpaw-bg-primary: ${r.surface} !important;
  --catpaw-text-primary: ${r.text} !important;
  --catpaw-text-secondary: ${r.textSecondary} !important;
  --agents-sidebar-material-bg: color-mix(in srgb, ${r.surface} 90%, transparent) !important;
  --text-base-primary: ${r.text} !important;
  --text-base-secondary: ${r.textSecondary} !important;
  --bg-base: color-mix(in srgb, ${r.surface} 86%, transparent) !important;
  /* ZCode 选中/悬停变量：组件自身的 data-active:!bg-selected 类带 !important
     引用 --color-selected，接管变量让这类选中背景也跟随主题 accent */
  --color-selected: color-mix(in srgb, ${r.accent} 16%, ${r.surface}) !important;
  --color-hover: color-mix(in srgb, ${r.accent} 10%, ${r.surface}) !important;
}
html, body, #root { background: ${a?"transparent":r.surface} !important; color: ${r.text} !important; }
:is(${i}) {
  background: color-mix(in srgb, ${r.surface} 90%, transparent) !important;
  color: ${r.text} !important;
  backdrop-filter: blur(20px) saturate(108%);
}
:is(${c}) {
  background: ${p};
  color: ${r.text} !important;
}
:is(${c}) :where([class*="message"], [class*="chat"], [class*="composer"], [class*="editor"], [contenteditable="true"], textarea) {
  color: ${r.text} !important;
}
:is(${c}) :where(${u}) {
  background-color: color-mix(in srgb, ${r.surface} 88%, transparent) !important;
  backdrop-filter: blur(16px) saturate(108%);
}
:is(${c}) :where(p, span, li, h1, h2, h3, h4, strong, em) { color: ${r.text} !important; }
button[class*="bg-primary"], button[class*="bg-accent"] { background-color: ${r.accent} !important; color: #fff !important; }
${l}${a?`
/* ZCode 动态视频背景：fixed 层 z-index:-1 落于普通流内容之下（内容无需抬升，
   不破坏原生 sticky），层自身带 hero 底图作加载中/失败回退；玻璃 backdrop-filter 直接采样视频 */
#dream-work-video-layer {
  position: fixed !important;
  inset: 0 !important;
  z-index: -1 !important;
  pointer-events: none !important;
  overflow: hidden !important;
  background: url(${JSON.stringify(t)}) center / cover no-repeat !important;
}
#dream-work-video-layer video {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
  display: block !important;
}
/* 应用壳层根容器（bg-background-win-alt，实测 rgb(236,236,238)）不透明底会整个压住
   z-index:-1 的视频层——视频主题必须一并放行，人物/画面才可见 */
.bg-background-win-alt, [class*="bg-background-win"] { background: transparent !important; }
/* 独立整页（设置/插件市场/自动化）的内容壳 div.bg-background.rounded-xl.border-border
   同样不透明（rgb 248,248,248），视频主题一并放行；页内统计卡/侧栏自身已是玻璃 */
.bg-background.rounded-xl.border-border { background: transparent !important; }
#dream-work-video-layer[data-motion-error="true"] video { display: none !important; }`:""}`}function Nr(e){return`
/* ZCode conversations: the wallpaper stays on the timeline, while each
   semantic row receives its own readable surface instead of one large wash. */
:is(main) :where(
  [class*="chat"],
  [class*="conversation"],
  [class*="message"],
  [class*="thread"],
  [class*="virtual"]
):has([data-row-id]) {
  background-color: transparent !important;
  background-image: none !important;
  box-shadow: none !important;
  backdrop-filter: none !important;
}

:is(main) :where(
  [class~="group/user-row"] > div:first-child,
  [class~="group/user-row"] > div[class*="rounded-xl"],
  [class~="group/assistant-row"] > [data-conversation-selectable]
) {
  border: 1px solid color-mix(in srgb, ${e.accent} 30%, transparent) !important;
  border-radius: 16px !important;
  background: color-mix(in srgb, ${e.surface} 76%, transparent) !important;
  box-shadow: 0 12px 30px color-mix(in srgb, ${e.surface} 30%, transparent), inset 0 1px color-mix(in srgb, white 12%, transparent) !important;
  backdrop-filter: blur(14px) saturate(108%) !important;
}

:is(main) [class~="group/user-row"] > div:is(:first-child, [class*="rounded-xl"]) {
  border-color: color-mix(in srgb, ${e.accent} 44%, transparent) !important;
  background: color-mix(in srgb, ${e.surface} 70%, transparent) !important;
}

:is(main) [class~="group/assistant-row"] > [data-conversation-selectable] {
  padding: 14px 16px !important;
}

:is(main) [data-row-id]:has([data-reasoning-content]) {
  padding: 12px 16px !important;
}

:is(main) [data-row-id]:has([data-reasoning-content]) [data-reasoning-content] {
  background: transparent !important;
  box-shadow: none !important;
  backdrop-filter: none !important;
}

/* 思考行（Radix collapsible）：折叠态的"思考 · 持续了…"标签裸露，不加玻璃包裹；
   仅 data-state="open"（思考内容已展开）时整行恢复与会话行同款玻璃卡片。
   默认规则覆盖 main 与辅助对话面板两种作用域；缺 data-state 时宁可保持裸露也不误包。 */
:is(main, div.border-l.border-border) [data-row-id]:has([data-reasoning-content]) {
  background: transparent !important;
  background-image: none !important;
  border: none !important;
  box-shadow: none !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}

:is(main, div.border-l.border-border) [data-row-id]:has([data-reasoning-content][data-state="open"]) {
  border: 1px solid color-mix(in srgb, ${e.accent} 30%, transparent) !important;
  border-radius: 16px !important;
  background: color-mix(in srgb, ${e.surface} 76%, transparent) !important;
  box-shadow: 0 12px 30px color-mix(in srgb, ${e.surface} 30%, transparent), inset 0 1px color-mix(in srgb, white 12%, transparent) !important;
  backdrop-filter: blur(14px) saturate(108%) !important;
  -webkit-backdrop-filter: blur(14px) saturate(108%) !important;
  color: ${e.text} !important;
  text-shadow: none !important;
}

/* ---- 毛玻璃材质统一：左侧边栏 / 状态面板（Git 变更）/ 切换面板右侧栏 ----
   与会话输入、模型输出行使用同一种玻璃材质（surface 76% + blur 14px），
   并清除宽泛的 [class*="min-h-0"][class*="flex-1"] 壁纸选择器落在
   这些面板内部容器上的直出壁纸。 */
#sidebar[class],
#sidebar aside aside {
  background: transparent !important;
  background-image: none !important;
  backdrop-filter: none !important;
}
#sidebar aside {
  background: color-mix(in srgb, ${e.surface} 76%, transparent) !important;
  backdrop-filter: blur(14px) saturate(108%) !important;
}
/* 侧边栏整列包裹主题自适应边框：accent 30% 混透明，与会话行/输入区同配方。
   边框落在 #sidebar 外层列上，连同底部账号区一起被包住；贴窗缘的三边
   与窗口框重合，视觉上主要呈现为侧栏与主区之间的 accent 分隔线。 */
#sidebar[class] {
  border: 2px solid color-mix(in srgb, ${e.accent} 30%, transparent) !important;
}
/* 项目 / 任务分区标签行辉光层染（Atmospheric Glow）：仅标签行（h-7 表头），
   展开列表区域不加。行背景不画渐变（28px 行高会把渐变硬裁出可见边界），
   改由 ::after 向上下各外扩 14px 绘椭圆径向渐变，透明色标恰好落在扩展边缘
   （垂直半径 60px、transparent 46% ≈ 27.6px），全向平滑归零无任何可见边界。
   左缘 2px accent 竖线（::before）自上而下渐隐作锚点。 */
#sidebar section[class~="group/purpose-section"] > div > div[class~="h-7"] {
  position: relative !important;
  background: transparent !important;
}
#sidebar section[class~="group/purpose-section"] > div > div[class~="h-7"]::after {
  content: "" !important;
  position: absolute !important;
  left: 0 !important;
  right: -36px !important;
  top: -14px !important;
  bottom: -14px !important;
  background: radial-gradient(420px 60px at 0% 50%, color-mix(in srgb, ${e.accent} 15%, transparent) 0%, color-mix(in srgb, ${e.accent} 6%, transparent) 22%, transparent 46%) !important;
  pointer-events: none !important;
}
#sidebar section[class~="group/purpose-section"] > div > div[class~="h-7"]::before {
  content: "" !important;
  position: absolute !important;
  left: 0 !important;
  top: 0 !important;
  bottom: 0 !important;
  width: 2px !important;
  background: linear-gradient(to bottom, ${e.accent}, transparent) !important;
  border-radius: 1px !important;
  pointer-events: none !important;
}
#sidebar [class*="min-h-0"][class*="flex-1"] {
  background: transparent !important;
  background-image: none !important;
}

#root aside[class*="bg-[var(--color-popover)]"] {
  background: color-mix(in srgb, ${e.surface} 76%, transparent) !important;
  border-color: color-mix(in srgb, ${e.accent} 30%, transparent) !important;
  backdrop-filter: blur(14px) saturate(108%) !important;
}
#root aside[class*="bg-[var(--color-popover)]"] [class*="min-h-0"][class*="flex-1"] {
  background: transparent !important;
  background-image: none !important;
}

.side-pane-open-tab-shell {
  background: color-mix(in srgb, ${e.surface} 76%, transparent) !important;
  backdrop-filter: blur(14px) saturate(108%) !important;
}
.side-pane-open-tab-shell [class*="min-h-0"][class*="flex-1"] {
  background: transparent !important;
  background-image: none !important;
}

/* 设置页面（aside.min-w-0 nav 出现时）里所有组件的背景统一毛玻璃材质，
   与对话行一致：surface 76% + blur 14px + accent 30% 边框；
   文字色统一为主题文字色，保证玻璃背景上的可读性。 */
html:has(aside.min-w-0 nav) main :is(button, input, select):where(
  [class*="bg-"], [class*="border"], [class*="ring-"], [class*="group/switch"]
),
html:has(aside.min-w-0 nav) main span:where(
  [class*="bg-surface"], [class*="bg-secondary"], [class*="bg-selected"]
) {
  background: color-mix(in srgb, ${e.surface} 76%, transparent) !important;
  border: 1px solid color-mix(in srgb, ${e.accent} 30%, transparent) !important;
  backdrop-filter: blur(14px) saturate(108%) !important;
  color: ${e.text} !important;
  text-shadow: none !important;
}
html:has(aside.min-w-0 nav) main :is(button, input, select):where(
  [class*="bg-"], [class*="border"], [class*="ring-"], [class*="group/switch"]
):hover {
  border-color: color-mix(in srgb, ${e.accent} 46%, transparent) !important;
}

/* 设置页列表行按钮（插件/技能/MCP 等列表整行）：容器已带毛玻璃，
   行本身保持透明，避免 76% 表面色双层叠加发黑。 */
html:has(aside.min-w-0 nav) main button.flex-1.text-left {
  background: transparent !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}

/* 设置页内容区里的分块背景区域（卡片/区块/分段容器）同款毛玻璃材质。
   使用统计等子页的统计卡/趋势图/模型用量是 section.bg-surface，与 div 一并接住。 */
html:has(aside.min-w-0 nav) main :where(
  div[class*="group/card"],
  div[class*="bg-card"],
  div[class*="bg-surface"],
  section[class*="bg-surface"],
  div[role="tablist"]
) {
  background: color-mix(in srgb, ${e.surface} 76%, transparent) !important;
  border: 1px solid color-mix(in srgb, ${e.accent} 30%, transparent) !important;
  backdrop-filter: blur(14px) saturate(108%) !important;
  color: ${e.text} !important;
}

/* 输入会话框：chat-composer-input-surface 已有毛玻璃（surface 88% + blur 16px），
   把内层 bg-input 纯白底改为透明，露出底层毛玻璃材质。 */
.chat-composer-input-surface div[class*="bg-input"],
.chat-composer-region div[class*="bg-input"] {
  background: transparent !important;
  background-color: transparent !important;
  border-color: color-mix(in srgb, ${e.accent} 30%, transparent) !important;
  box-shadow: none !important;
}

/* 输入框外层的毛玻璃区域：圆角 0px 时直角浅色玻璃会在编辑器胶囊
   （rounded-2xl）四周形成"白色长方形框"，圆角化后与胶囊边缘贴合 */
.chat-composer-region,
.chat-composer-input-surface {
  border-radius: 16px !important;
  border: 1px solid color-mix(in srgb, ${e.accent} 30%, transparent) !important;
}

/* 辅助对话面板打开时与主对话之间的分割线：原生 border-l 是无主题色的灰线，
   换成 accent 30% 主题自适应边框，与 #sidebar 边框同配方同宽度（2px）。 */
div.border-l.border-border {
  border-left: 2px solid color-mix(in srgb, ${e.accent} 30%, transparent) !important;
}

/* 主对话顶部工具条（workspace-header）：原生只有灰色 border-b，
   换成主题自适应包裹边框（2px accent 30%，与侧栏/分割线同配方）。
   左边不留框 —— 与侧栏的边界由侧栏边框充当，避免平行双线。 */
header[class*="workspace-header"] {
  border: solid color-mix(in srgb, ${e.accent} 30%, transparent) !important;
  border-width: 2px 2px 2px 0 !important;
}

/* 辅助面板顶部标签条：主题自适应包裹。
   作用域挂在辅助面板（div.border-l.border-border）之下，避免波及设置页的 tabs-list。
   上边不留框（工具条下边框充当分隔）、左边不留框（面板分割线充当），
   重合处归一成一条线。 */
div.border-l.border-border div[data-slot="tabs-list"] {
  border: solid color-mix(in srgb, ${e.accent} 30%, transparent) !important;
  border-width: 0 2px 2px 0 !important;
}

/* 标签条内的按钮（折叠箭头 / 加号）：与会话行同款毛玻璃。
   玻璃底与边框放 ::before 伪元素 —— 这些按钮自带分层的透明底 !important
   （Tailwind v4 分层 important 压过未分层注入），伪元素绕开该优先级；
   本体只接管文字色。圆角统一 10px —— 0 圆角玻璃会被看成白色矩形框。
   标签胶囊（tooltip-trigger / tabs-trigger）不上毛玻璃（用户定稿），
   只压掉原生不透明白底，保持透明、文字走全局主题变量。 */
div.border-l.border-border div[data-slot="tabs-list"] :is(button, [role="tab"]) {
  position: relative !important;
  isolation: isolate !important;
  color: ${e.text} !important;
  text-shadow: none !important;
}

div.border-l.border-border div[data-slot="tabs-list"] :is(button, [role="tab"])::before {
  content: "" !important;
  position: absolute !important;
  inset: 0 !important;
  z-index: -1 !important;
  border-radius: 10px !important;
  border: 1px solid color-mix(in srgb, ${e.accent} 30%, transparent) !important;
  background: color-mix(in srgb, ${e.surface} 76%, transparent) !important;
  backdrop-filter: blur(14px) saturate(108%) !important;
  -webkit-backdrop-filter: blur(14px) saturate(108%) !important;
  pointer-events: none !important;
}

/* 标签胶囊（tooltip-trigger / tabs-trigger）保持原生 —— 皮肤不碰它的底色与边框。
   玻璃只给条内的独立按钮（折叠箭头 / 加号）；胶囊内的 × 关闭按钮
   通过 content:none 豁免，避免在原生胶囊上再叠玻璃方块。 */
div.border-l.border-border div[data-slot="tabs-list"] [data-slot="tooltip-trigger"] button::before,
div.border-l.border-border div[data-slot="tabs-list"] [data-slot="tabs-trigger"] button::before {
  content: none !important;
}

/* 辅助对话（侧边面板，不在 main 内）的消息行：同款毛玻璃材质。
   思考行不在此列 —— 折叠裸露/展开玻璃由上方统一规则覆盖两种作用域。 */
div.border-l.border-border :where(
  [class~="group/user-row"] > div:first-child,
  [class~="group/user-row"] > div[class*="rounded-xl"],
  [class~="group/assistant-row"] > [data-conversation-selectable]
) {
  border: 1px solid color-mix(in srgb, ${e.accent} 30%, transparent) !important;
  border-radius: 16px !important;
  background: color-mix(in srgb, ${e.surface} 76%, transparent) !important;
  box-shadow: 0 12px 30px color-mix(in srgb, ${e.surface} 30%, transparent), inset 0 1px color-mix(in srgb, white 12%, transparent) !important;
  backdrop-filter: blur(14px) saturate(108%) !important;
  color: ${e.text} !important;
  text-shadow: none !important;
}
div.border-l.border-border [class~="group/user-row"] > div:is(:first-child, [class*="rounded-xl"]) {
  border-color: color-mix(in srgb, ${e.accent} 44%, transparent) !important;
  background: color-mix(in srgb, ${e.surface} 70%, transparent) !important;
}

/* 子代理输出（主对话与辅助对话面板中）同款毛玻璃材质。 */
:is(main, div.border-l.border-border) :where(
  [class*="agent-row"] > [data-conversation-selectable],
  [class*="subagent"] > [data-conversation-selectable],
  [class*="subagent-row"] > div,
  [class*="agent-row"] > div
) {
  border: 1px solid color-mix(in srgb, ${e.accent} 30%, transparent) !important;
  border-radius: 16px !important;
  background: color-mix(in srgb, ${e.surface} 76%, transparent) !important;
  box-shadow: 0 12px 30px color-mix(in srgb, ${e.surface} 30%, transparent), inset 0 1px color-mix(in srgb, white 12%, transparent) !important;
  backdrop-filter: blur(14px) saturate(108%) !important;
  color: ${e.text} !important;
  text-shadow: none !important;
}

/* 已执行命令的输出卡片（bg-panel 白底）同款毛玻璃材质。 */
:is(main, div.border-l.border-border) div[class*="bg-panel"][class*="rounded-xl"] {
  background: color-mix(in srgb, ${e.surface} 76%, transparent) !important;
  border: 1px solid color-mix(in srgb, ${e.accent} 30%, transparent) !important;
  backdrop-filter: blur(14px) saturate(108%) !important;
  color: ${e.text} !important;
}

/* ---- 选中/悬停态：与主题一致的底色（accent 混 surface），强化视觉反馈。
   通用毛玻璃规则会抹平原生选中样式，这里补回更明显的激活态。 ---- */
/* 标签页与按钮的激活态（Radix data-state=active / aria-selected） */
:is(main, #sidebar, aside, [role="dialog"], [role="menu"]) :is(button, [role="tab"], [role="button"], a):where(
  [data-state="active"], [aria-selected="true"], [data-active], [data-active="true"]
) {
  background: color-mix(in srgb, ${e.accent} 16%, ${e.surface}) !important;
  color: ${e.text} !important;
  box-shadow: inset 0 0 0 1px color-mix(in srgb, ${e.accent} 38%, transparent) !important;
}

/* 悬停态：轻微 accent 底色，仅作用于交互元素 */
:is(main, #sidebar, aside, [role="dialog"], [role="menu"]) :is(button, [role="button"], a, li[class*="cursor-pointer"]):hover {
  background-color: color-mix(in srgb, ${e.accent} 10%, transparent) !important;
}

/* 侧栏/列表选中项（bg-selected、激活任务项）：accent 混 surface 底 + 左缘强调线；
   不再添加 inset 1px 描边环 —— 会话导轨的选中项几乎占满导轨宽度，
   描边环会被看成"整个导轨被边框包起来" */
:is(#sidebar, main, aside) :where(
  li[class*="bg-selected"],
  [class*="group/task-item"][data-state="active"],
  [class*="group/task-item"][aria-current="true"]
) {
  background: color-mix(in srgb, ${e.accent} 18%, ${e.surface}) !important;
  box-shadow: inset 2px 0 0 ${e.accent} !important;
}

/* 开关（Radix switch）选中时轨道染主题 accent */
:is([role="switch"][data-state="checked"], button[class*="switch"][data-state="checked"]) {
  background-color: ${e.accent} !important;
  border-color: color-mix(in srgb, ${e.accent} 70%, transparent) !important;
}

/* 设置页内的激活控件：覆盖设置页通用毛玻璃（属性选择器提高优先级） */
html:has(aside.min-w-0 nav) main :is(button, [role="tab"], a, input, select):where(
  [data-state="active"], [aria-selected="true"], [class*="bg-selected"]
) {
  background: color-mix(in srgb, ${e.accent} 16%, ${e.surface}) !important;
  border-color: color-mix(in srgb, ${e.accent} 44%, transparent) !important;
  color: ${e.text} !important;
}
html:has(aside.min-w-0 nav) main :is(button, [role="tab"], a):where(
  [data-state="active"], [aria-selected="true"]
):hover {
  background: color-mix(in srgb, ${e.accent} 24%, ${e.surface}) !important;
}

/* 设置页插件/技能/MCP 列表：外层卡片保留 accent 边框与毛玻璃，
   内部行按钮去掉各自重复的边框，避免盒中盒双重边框；行间 hover 用 accent 底区分 */
html:has(aside.min-w-0 nav) main [class*="max-w-4xl"] div[class*="rounded-xl"] :is(
  button[class*="flex-1"], button[class*="min-w-0"], button[class*="w-full"]
) {
  border-color: transparent !important;
  box-shadow: none !important;
}

/* 设置页计数标签（插件/MCP/技能）的轨道：玻璃底已生效但为直角，
   呈现白色矩形框；圆角化与胶囊标签协调 */
html:has(aside.min-w-0 nav) main [class*="max-w-4xl"] [class*="tabs-list"] {
  border-radius: 999px !important;
}

/* 会话列左缘的历史会话导航导轨（NAV.w-12 竖向细轨）：选中态规则会给
   指示按钮加 accent 内描边环与底色，看起来像"导轨被边框包起来"；
   用户要求导轨无边框也无底色 —— 完全还原为透明，仅保留原生形态 */
#root nav[class*="inset-y-0"][class*="left-0"] :is(button, [role="button"]) {
  background: transparent !important;
  background-color: transparent !important;
  box-shadow: none !important;
  border: none !important;
  outline: none !important;
}

/* ---- 悬停浮层与点击弹窗（tooltip / popover / 下拉菜单 / 对话框 / 命令面板）：
   这类组件 portal 挂载在 body 下，不随 main/#sidebar 作用域，这里统一为
   与会话行一致的毛玻璃材质（surface + blur 14px + accent 30% 边框）。 ---- */
:is(
  [data-radix-popper-content-wrapper] > *,
  [role="menu"],
  [role="listbox"],
  [role="dialog"],
  [role="alertdialog"],
  [class*="cmdk-root"],
  div[class*="Popover"],
  div[class*="DropdownMenu"],
  div[class*="DialogContent"],
  div[class*="HoverCard"],
  div[class*="bg-popover"],
  div[class*="bg-dropdown"]
):not([class*="Overlay"]):not([data-radix-dialog-overlay]):not([class*="backdrop"]) {
  background: color-mix(in srgb, ${e.surface} 88%, transparent) !important;
  border: 1px solid color-mix(in srgb, ${e.accent} 30%, transparent) !important;
  box-shadow: 0 12px 30px color-mix(in srgb, ${e.surface} 30%, transparent) !important;
  backdrop-filter: blur(14px) saturate(108%) !important;
  color: ${e.text} !important;
  text-shadow: none !important;
}

/* ZCode 模型选择器的供应商菜单会把 Radix 子菜单 portal 挂在主菜单内部。
   backdrop-filter 会让主菜单成为 fixed 子菜单的包含块，随后子菜单又被主菜单的
   overflow 裁切。把模糊材质移到伪元素后，外观不变，子菜单可以继续相对视口定位。 */
body.zcode-startup-ready [role="menu"][data-slot="dropdown-menu-content"]:has([data-model-provider-key]) {
  position: relative !important;
  isolation: isolate;
  background: transparent !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}
body.zcode-startup-ready [role="menu"][data-slot="dropdown-menu-content"]:has([data-model-provider-key])::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  border-radius: inherit;
  background: color-mix(in srgb, ${e.surface} 88%, transparent);
  backdrop-filter: blur(14px) saturate(108%);
  -webkit-backdrop-filter: blur(14px) saturate(108%);
  pointer-events: none;
}

/* 菜单底部的粘性页脚（如模型菜单的"管理模型"项，sticky bottom-0 z-10 bg-menu
   + after:bg-menu 补缝条）自带不透明原生底，会盖住菜单玻璃形成黑块。
   换成与弹层同款玻璃（surface 88% + blur14），滚动经过的菜单项在其后被磨砂遮住。 */
[role="menu"] .bg-menu {
  background: color-mix(in srgb, ${e.surface} 88%, transparent) !important;
  backdrop-filter: blur(14px) saturate(108%) !important;
  -webkit-backdrop-filter: blur(14px) saturate(108%) !important;
}
[role="menu"] .bg-menu::after {
  background: color-mix(in srgb, ${e.surface} 88%, transparent) !important;
}

/* tooltip 更小更密：更高不透明度保证可读性 */
[role="tooltip"] {
  background: color-mix(in srgb, ${e.surface} 92%, transparent) !important;
  border: 1px solid color-mix(in srgb, ${e.accent} 30%, transparent) !important;
  box-shadow: 0 8px 20px color-mix(in srgb, ${e.surface} 30%, transparent) !important;
  backdrop-filter: blur(14px) saturate(108%) !important;
  color: ${e.text} !important;
  text-shadow: none !important;
}

/* 弹层内部的菜单项/选项：默认透明，悬停与选中用 accent 底色 */
:is([role="menu"], [role="listbox"]) :is(
  [role="menuitem"], [role="menuitemcheckbox"], [role="menuitemradio"], [role="option"], a, button
) {
  background: transparent !important;
  color: ${e.text} !important;
}
:is([role="menu"], [role="listbox"]) :is(
  [role="menuitem"], [role="menuitemcheckbox"], [role="menuitemradio"], [role="option"], a, button
):hover,
:is([role="menu"], [role="listbox"]) :is([role="option"], [role="menuitem"]):where([aria-selected="true"], [data-state="checked"]) {
  background: color-mix(in srgb, ${e.accent} 14%, ${e.surface}) !important;
  color: ${e.text} !important;
}

/* 对话框标题/正文/标签跟随主题文字色（输入类控件背景交由上方毛玻璃容器透出） */
:is([role="dialog"], [role="alertdialog"]) :where(h1, h2, h3, h4, label, p, span, li, [class*="DialogLabel"], [class*="DialogTitle"], [class*="DialogDescription"]) {
  color: ${e.text} !important;
  text-shadow: none !important;
}

/* ---- 插件市场页（独立整页，含 H1 标题，无设置侧栏）：
   设置页规则按 aside.min-w-0 nav 作用域，市场页不命中导致搜索框原生纯白、
   插件图标与卡片透明浮在壁纸上。这里按 max-w-4xl:has(h1) 精确限定，
   与会话列（无 h1）区分开。 ---- */
main [class*="max-w-4xl"]:has(h1) :is(
  input,
  button,
  div[class*="group/card"],
  div[class*="bg-card"],
  div[class*="rounded-xl"],
  div[class*="min-h-11"]
):not([class*="bg-accent"]):not([class*="bg-primary"]) {
  background: color-mix(in srgb, ${e.surface} 76%, transparent) !important;
  border: 1px solid color-mix(in srgb, ${e.accent} 30%, transparent) !important;
  box-shadow: 0 12px 30px color-mix(in srgb, ${e.surface} 30%, transparent) !important;
  backdrop-filter: blur(14px) saturate(108%) !important;
  color: ${e.text} !important;
  text-shadow: none !important;
}
main [class*="max-w-4xl"]:has(h1) :is(
  button, div[class*="group/card"], div[class*="bg-card"]
):not([class*="bg-accent"]):not([class*="bg-primary"]):hover {
  background: color-mix(in srgb, ${e.accent} 14%, ${e.surface}) !important;
}
main [class*="max-w-4xl"]:has(h1) input {
  color: ${e.text} !important;
  caret-color: ${e.accent} !important;
}
main [class*="max-w-4xl"]:has(h1) input::placeholder {
  color: ${e.textSecondary} !important;
  opacity: 1 !important;
}

/* 会话流内的文件更改汇总卡（bg-card）：原生 oklch 深底完全不透明，
   接入与设置页卡片同款毛玻璃材质；行底的 bg-background/50 深色叠底
   改为透明，避免在玻璃上再压一层暗色。 */
:is(main, div.border-l.border-border) [class~="group/assistant-turn"] div[class~="bg-card"] {
  background: color-mix(in srgb, ${e.surface} 76%, transparent) !important;
  border: 1px solid color-mix(in srgb, ${e.accent} 30%, transparent) !important;
  backdrop-filter: blur(14px) saturate(108%) !important;
  -webkit-backdrop-filter: blur(14px) saturate(108%) !important;
  color: ${e.text} !important;
}
:is(main, div.border-l.border-border) [class~="group/assistant-turn"] div[class~="bg-card"] div[class~="bg-background/50"] {
  background: transparent !important;
}

/* 上下文叠加 HoverCard（composer 工具条图标悬停触发）：容器已由上方弹层
   规则提供毛玻璃，但内层 bg-menu 不透明深底把玻璃盖平；改透明让玻璃透出，
   并按用户点名接入同款边框流光。 */
div[data-slot="hover-card-content"] {
  position: relative !important;
}
div[data-slot="hover-card-content"] div[class~="bg-menu"] {
  background: transparent !important;
}
div[data-slot="hover-card-content"]::after {
  content: "" !important;
  position: absolute !important;
  inset: -2px !important;
  border-radius: inherit !important;
  padding: 2px !important;
  background: conic-gradient(from var(--dream-flow), color-mix(in srgb, #ffffff 14%, transparent) 0deg, color-mix(in srgb, #ffffff 7%, transparent) 15deg, transparent 30deg, transparent 150deg, color-mix(in srgb, #ffffff 7%, transparent) 165deg, color-mix(in srgb, #ffffff 14%, transparent) 180deg, color-mix(in srgb, #ffffff 7%, transparent) 195deg, transparent 210deg, transparent 330deg, color-mix(in srgb, #ffffff 7%, transparent) 345deg, color-mix(in srgb, #ffffff 14%, transparent) 360deg), conic-gradient(from var(--dream-flow), color-mix(in srgb, ${e.accent} 82%, transparent) 15deg, color-mix(in srgb, ${e.secondary} 82%, transparent) 45deg, color-mix(in srgb, ${e.secondary} 82%, transparent) 75deg, color-mix(in srgb, ${e.accent} 82%, transparent) 105deg, color-mix(in srgb, ${e.accent} 82%, transparent) 135deg, color-mix(in srgb, ${e.secondary} 82%, transparent) 165deg, color-mix(in srgb, ${e.secondary} 82%, transparent) 195deg, color-mix(in srgb, ${e.accent} 82%, transparent) 225deg, color-mix(in srgb, ${e.accent} 82%, transparent) 255deg, color-mix(in srgb, ${e.secondary} 82%, transparent) 285deg, color-mix(in srgb, ${e.secondary} 82%, transparent) 315deg, color-mix(in srgb, ${e.accent} 82%, transparent) 345deg) !important;
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0) !important;
  -webkit-mask-composite: xor !important;
  mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0) !important;
  mask-composite: exclude !important;
  animation: dream-flow-orbit 6s linear infinite !important;
  pointer-events: none !important;
}

/* ---- 会话流光（多彩流光环）：等粗恒定 82% alpha 色环包围整个框，
   accent/secondary 以 60° 周期六段交替（30° 保持 + 30° 混色，转一圈每点
   交替三次色相），一对半透明白纱微光 180° 对置巡游只提亮不增粗。环带
   亮度处处相等（粗细视觉恒定），单 --dream-flow 时钟 6s/圈（彗星基线
   24s 的 4 倍速）。颜色随主题 ----
   @property 注册角度变量使 conic-gradient 可动画；reduced-motion 时静止。 */
@property --dream-flow { syntax: '<angle>'; inherits: false; initial-value: 0deg; }
:is(main) .chat-composer-region,
:is(main, div.border-l.border-border) [class~="group/assistant-row"] > [data-conversation-selectable],
:is(main, div.border-l.border-border) [class~="group/user-row"] > div[class*="rounded-xl"],
#sidebar li[class*="bg-selected"] {
  position: relative !important;
}
:is(main) .chat-composer-region::after,
:is(main, div.border-l.border-border) [class~="group/assistant-row"] > [data-conversation-selectable]::after,
:is(main, div.border-l.border-border) [class~="group/user-row"] > div[class*="rounded-xl"]::after,
#sidebar li[class*="bg-selected"]::after {
  content: "" !important;
  position: absolute !important;
  inset: -2px !important;
  border-radius: 18px !important;
  padding: 2px !important;
  background: conic-gradient(from var(--dream-flow), color-mix(in srgb, #ffffff 14%, transparent) 0deg, color-mix(in srgb, #ffffff 7%, transparent) 15deg, transparent 30deg, transparent 150deg, color-mix(in srgb, #ffffff 7%, transparent) 165deg, color-mix(in srgb, #ffffff 14%, transparent) 180deg, color-mix(in srgb, #ffffff 7%, transparent) 195deg, transparent 210deg, transparent 330deg, color-mix(in srgb, #ffffff 7%, transparent) 345deg, color-mix(in srgb, #ffffff 14%, transparent) 360deg), conic-gradient(from var(--dream-flow), color-mix(in srgb, ${e.accent} 82%, transparent) 15deg, color-mix(in srgb, ${e.secondary} 82%, transparent) 45deg, color-mix(in srgb, ${e.secondary} 82%, transparent) 75deg, color-mix(in srgb, ${e.accent} 82%, transparent) 105deg, color-mix(in srgb, ${e.accent} 82%, transparent) 135deg, color-mix(in srgb, ${e.secondary} 82%, transparent) 165deg, color-mix(in srgb, ${e.secondary} 82%, transparent) 195deg, color-mix(in srgb, ${e.accent} 82%, transparent) 225deg, color-mix(in srgb, ${e.accent} 82%, transparent) 255deg, color-mix(in srgb, ${e.secondary} 82%, transparent) 285deg, color-mix(in srgb, ${e.secondary} 82%, transparent) 315deg, color-mix(in srgb, ${e.accent} 82%, transparent) 345deg) !important;
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0) !important;
  -webkit-mask-composite: xor !important;
  mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0) !important;
  mask-composite: exclude !important;
  animation: dream-flow-orbit 6s linear infinite !important;
  pointer-events: none !important;
}
/* 输入框区域（chat-composer-region，shrink-0 钉在外层容器底边）下缘被
   容器边界裁剪：外扩 2px 的环下缘整条不可见。底边改贴边内绘（同 Git
   面板 inset 0 方案），上/左/右仍外扩 2px。 */
:is(main) .chat-composer-region::after {
  inset: -2px -2px 0 -2px !important;
}
#sidebar li[class*="bg-selected"]::after {
  border-radius: 10px !important;
  inset: -1.5px !important;
}
/* 侧栏任务树的横向滚动条拇指（内容溢出时出现在头像行上方，用户确认为
   非原生观感）：隐藏条本体，overflow 保持 auto——内容仍可横向滚、不裁
   选中会话环的外扩 1.5px。 */
#sidebar div[class*="overflow-y-auto"] {
  scrollbar-width: none !important;
}
#sidebar div[class*="overflow-y-auto"]::-webkit-scrollbar {
  display: none !important;
  height: 0 !important;
  width: 0 !important;
}
/* 用户气泡半径 rounded-xl（12px，右上 rounded-tr-xs 更小），外扩 2px 的环取 14px。 */
:is(main, div.border-l.border-border) [class~="group/user-row"] > div[class*="rounded-xl"]::after {
  border-radius: 14px !important;
}
/* Git 工具状态面板流光：与会话盒同款多彩流光环（类签名 popover-border 全局唯一）。
   面板自身 overflow-hidden + 16px 圆角，环贴边内绘（inset 0）避免裁剪。 */
aside[class*="popover-border"] {
  position: relative !important;
}
aside[class*="popover-border"]::after {
  content: "" !important;
  position: absolute !important;
  inset: 0 !important;
  border-radius: 16px !important;
  padding: 2px !important;
  background: conic-gradient(from var(--dream-flow), color-mix(in srgb, #ffffff 14%, transparent) 0deg, color-mix(in srgb, #ffffff 7%, transparent) 15deg, transparent 30deg, transparent 150deg, color-mix(in srgb, #ffffff 7%, transparent) 165deg, color-mix(in srgb, #ffffff 14%, transparent) 180deg, color-mix(in srgb, #ffffff 7%, transparent) 195deg, transparent 210deg, transparent 330deg, color-mix(in srgb, #ffffff 7%, transparent) 345deg, color-mix(in srgb, #ffffff 14%, transparent) 360deg), conic-gradient(from var(--dream-flow), color-mix(in srgb, ${e.accent} 82%, transparent) 15deg, color-mix(in srgb, ${e.secondary} 82%, transparent) 45deg, color-mix(in srgb, ${e.secondary} 82%, transparent) 75deg, color-mix(in srgb, ${e.accent} 82%, transparent) 105deg, color-mix(in srgb, ${e.accent} 82%, transparent) 135deg, color-mix(in srgb, ${e.secondary} 82%, transparent) 165deg, color-mix(in srgb, ${e.secondary} 82%, transparent) 195deg, color-mix(in srgb, ${e.accent} 82%, transparent) 225deg, color-mix(in srgb, ${e.accent} 82%, transparent) 255deg, color-mix(in srgb, ${e.secondary} 82%, transparent) 285deg, color-mix(in srgb, ${e.secondary} 82%, transparent) 315deg, color-mix(in srgb, ${e.accent} 82%, transparent) 345deg) !important;
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0) !important;
  -webkit-mask-composite: xor !important;
  mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0) !important;
  mask-composite: exclude !important;
  animation: dream-flow-orbit 6s linear infinite !important;
  pointer-events: none !important;
}
#sidebar li[class*="bg-selected"] {
  border: 1px solid color-mix(in srgb, ${e.accent} 45%, transparent) !important;
}
#sidebar li[class*="bg-selected"] {
  border: 1px solid color-mix(in srgb, ${e.accent} 45%, transparent) !important;
}
/* 会话输出框仪表角标（Tactical Corners）：左上/右下 L 形 2.5px 加粗角标
   （20px 臂长、圆角端点、小弧拐弯），右上/左下短刻度圆点，accent 随主题；
   角标组呼吸式流光闪烁（静态 drop-shadow 光晕 + 透明度脉动）。
   ::before 定位绘制于底色之上、角落留白区，pointer-events 关闭不挡交互。
   用户气泡（group/user-row 下 rounded-xl 子盒）同款。 */
:is(main, div.border-l.border-border) [class~="group/assistant-row"] > [data-conversation-selectable]::before,
:is(main, div.border-l.border-border) [class~="group/user-row"] > div[class*="rounded-xl"]::before {
  content: "" !important;
  position: absolute !important;
  inset: -1px !important;
  background: url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M19.5 0.5H15.5A15 15 0 0 0 0.5 15.5V19.5" stroke="${e.accent}" stroke-width="2.5" stroke-linecap="round"/></svg>`)}") 0 0 / 20px 20px no-repeat, url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M0.5 19.5H4.5A15 15 0 0 0 19.5 4.5V0.5" stroke="${e.accent}" stroke-width="2.5" stroke-linecap="round"/></svg>`)}") right 0 bottom 0 / 20px 20px no-repeat, radial-gradient(circle, ${e.accent} 0 2px, transparent 2.8px) right 8px top 3px / 6px 6px no-repeat, radial-gradient(circle, ${e.accent} 0 2px, transparent 2.8px) left 8px bottom 3px / 6px 6px no-repeat !important;
  filter: drop-shadow(0 0 5px color-mix(in srgb, ${e.accent} 70%, transparent)) !important;
  animation: dream-corner-blink 2.2s ease-in-out infinite !important;
  pointer-events: none !important;
}
@keyframes dream-corner-blink { 0%, 100% { opacity: 0.35; } 50% { opacity: 1; } }
@keyframes dream-flow-orbit { to { --dream-flow: 360deg; } }
@media (prefers-reduced-motion: reduce) {
  :is(main) .chat-composer-region::after,
  :is(main, div.border-l.border-border) [class~="group/assistant-row"] > [data-conversation-selectable]::after,
  #sidebar li[class*="bg-selected"]::after,
  :is(main, div.border-l.border-border) [class~="group/assistant-row"] > [data-conversation-selectable]::before,
  aside[class*="popover-border"]::after,
  div[data-slot="hover-card-content"]::after { animation: none !important; }
}`}function Kt(e,n,t){return`/* DREAM_THEME:${e.id} */
:root {
  --dream-work-accent: ${t.accent};
  --dream-work-secondary: ${t.secondary};
  --dream-work-surface: ${t.surface};
  --dream-work-text: ${t.text};
}
html, body, #react-root, .app-shell {
  background-color: ${t.surface} !important;
  background-image: url(${JSON.stringify(n)}) !important;
  background-position: center center !important;
  background-size: cover !important;
  background-repeat: no-repeat !important;
  background-attachment: fixed !important;
  color: ${t.text} !important;
}
.titlebar, .app, .main-content, .chat-area, .input-area {
  background-color: transparent !important;
  background-image: none !important;
}
#sidebar, #jianSidebar .universal-card, #previewBody {
  background: color-mix(in srgb, ${t.surface} 66%, transparent) !important;
  border-color: color-mix(in srgb, ${t.accent} 24%, transparent) !important;
  color: ${t.text} !important;
  backdrop-filter: blur(20px) saturate(110%) !important;
}
.titlebar {
  background: color-mix(in srgb, ${t.surface} 62%, transparent) !important;
  color: ${t.text} !important;
  backdrop-filter: blur(18px) saturate(108%) !important;
}
[class*="input-wrapper"] {
  background: color-mix(in srgb, ${t.surface} 78%, transparent) !important;
  border-color: color-mix(in srgb, ${t.accent} 30%, transparent) !important;
  color: ${t.text} !important;
  box-shadow: 0 16px 42px color-mix(in srgb, ${t.surface} 28%, transparent) !important;
  backdrop-filter: blur(18px) saturate(108%) !important;
}
[class*="input-wrapper"] :where(textarea, input, [contenteditable="true"]) {
  background: transparent !important;
  color: ${t.text} !important;
  caret-color: ${t.accent} !important;
}
#sidebar :where(button, [role="button"]):hover,
#jianSidebar :where(button, [role="button"]):hover {
  background-color: color-mix(in srgb, ${t.accent} 16%, transparent) !important;
}
:where(button[class*="primary"], button[type="submit"]) {
  background-color: ${t.accent} !important;
  color: #ffffff !important;
}`}function Lr(e){return`(() => {
    const themes = ${JSON.stringify(e.themes)};
    const cssTemplate = ${JSON.stringify(e.cssTemplate)};
    const sentinels = ${JSON.stringify(I)};
    const restoreKey = 'dream-work-theme:hana-agent:restored';
    const customStorageKey = 'dreamCodexCustomThemes';
    const selectedKey = 'dream-work-theme:hana-agent:selected-theme';
    const sharedCustomThemes = ${JSON.stringify(e.sharedCustomThemes)};
    const sharedCustomThemeService = ${JSON.stringify(e.sharedCustomThemeService)};
    const recordPresetUsage = (themeId) => fetch(sharedCustomThemeService.usageEndpoint, {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + sharedCustomThemeService.token, 'Content-Type': 'application/json' },
      body: JSON.stringify({ appId: 'hana-agent', themeId }),
    }).catch(() => {});
    const forceApply = Boolean(window.__dreamWorkForceApply);
    delete window.__dreamWorkForceApply;
    let restored = false;
    try { restored = localStorage.getItem(restoreKey) === '1'; } catch {}
    if (forceApply) {
      restored = false;
      try { localStorage.removeItem(restoreKey); } catch {}
    }
    if (restored) document.documentElement.dataset.dreamThemeRestored = 'true';
    else delete document.documentElement.dataset.dreamThemeRestored;
    let active = !restored;
    let style = document.getElementById('${e.styleId}');
    if (!style) {
      style = document.createElement('style');
      style.id = '${e.styleId}';
    }
    const attachStyle = () => {
      if (active && !style.isConnected) document.head.appendChild(style);
    };
    let rows = [];
    const applyTheme = (themeId) => {
      const theme = themes.find(item => item.id === themeId);
      if (!theme) return;
      active = true;
      try { localStorage.removeItem(restoreKey); } catch {}
      delete document.documentElement.dataset.dreamThemeRestored;
      style.textContent = theme.css;
      attachStyle();
      document.documentElement.dataset.dreamTheme = themeId;
      try { localStorage.setItem(selectedKey, themeId); } catch {}
      rows.forEach((row) => {
        const selected = row.dataset.themeId === themeId;
        row.style.background = selected ? 'rgba(36,201,215,.16)' : 'transparent';
        row.style.fontWeight = selected ? '700' : '500';
      });
    };
    const restoreNative = () => {
      active = false;
      try { localStorage.setItem(restoreKey, '1'); } catch {}
      document.documentElement.dataset.dreamThemeRestored = 'true';
      clearInterval(window.__dreamWorkMenuGuard);
      style.remove();
      delete document.documentElement.dataset.dreamTheme;
      try { localStorage.removeItem(selectedKey); } catch {}
      panel.style.display = 'none';
    };
    if (window.__dreamWorkOutsideClick) {
      document.removeEventListener('pointerdown', window.__dreamWorkOutsideClick, true);
      delete window.__dreamWorkOutsideClick;
    }
    document.getElementById('${e.menuId}-host')?.remove();
    clearInterval(window.__dreamWorkMenuGuard);
    const host = document.createElement('div');
    host.id = '${e.menuId}-host';
    host.style.cssText = 'all:initial!important;position:fixed!important;right:16px!important;bottom:16px!important;z-index:2147483647!important;display:block!important;pointer-events:auto!important;';
    const shadow = host.attachShadow({ mode: 'open' });
    const root = document.createElement('div');
    root.id = '${e.menuId}';
    root.style.cssText = 'display:flex;flex-direction:column;align-items:flex-end;font:500 13px/1.4 system-ui;color:#17344f;';
    const panel = document.createElement('div');
    panel.style.cssText = 'display:none;margin-bottom:8px;min-width:190px;padding:6px;border-radius:12px;border:1px solid rgba(0,0,0,.1);background:rgba(255,255,255,.96);box-shadow:0 10px 30px rgba(0,0,0,.18);';
    const button = document.createElement('button');
    button.type = 'button';
    button.title = 'Dream Work Theme';
    button.textContent = '◉';
    button.style.cssText = 'width:36px;height:36px;border-radius:10px;border:1px solid rgba(0,0,0,.12);background:rgba(255,255,255,.92);box-shadow:0 3px 12px rgba(0,0,0,.2);cursor:pointer;padding:0;display:flex;align-items:center;justify-content:center;color:#17344f;font-size:18px;line-height:1;';
    const addRow = (label, themeId, accent, onClick, before) => {
      const row = document.createElement('div');
      row.dataset.themeId = themeId || '';
      row.style.cssText = 'display:flex;align-items:center;gap:8px;padding:7px 10px;border-radius:8px;cursor:pointer;color:#17344f;';
      const dot = document.createElement('span');
      dot.style.cssText = 'width:10px;height:10px;border-radius:50%;flex:none;background:' + accent + ';';
      const text = document.createElement('span');
      text.textContent = label;
      row.append(dot, text);
      row.addEventListener('click', onClick);
      if (before) panel.insertBefore(row, before); else panel.appendChild(row);
      rows.push(row);
      return row;
    };
    themes.forEach((theme) => addRow(theme.name, theme.id, theme.accent || '#24c9d7', () => {
      applyTheme(theme.id);
      void recordPresetUsage(theme.id);
      panel.style.display = 'none';
    }));
    const materializeCustomCss = (dataUrl, colors, customId) => cssTemplate
      .split(sentinels.hero).join(dataUrl)
      .split(sentinels.accent).join(colors.accent)
      .split(sentinels.secondary).join(colors.secondary)
      .split(sentinels.surface).join(colors.surface)
      .split(sentinels.text).join(colors.text)
      .split(sentinels.id).join(customId);
    const hex = (r, g, b) => '#' + [r, g, b].map((value) => Math.max(0, Math.min(255, Math.round(value))).toString(16).padStart(2, '0')).join('');
    const mix = (a, b, amount) => a.map((value, index) => value + (b[index] - value) * amount);
    const extractPalette = (canvas) => {
      const context = canvas.getContext('2d');
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
      const buckets = new Map();
      let luminanceSum = 0;
      let count = 0;
      for (let index = 0; index < pixels.length; index += 4) {
        const r = pixels[index], g = pixels[index + 1], b = pixels[index + 2];
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        luminanceSum += luminance;
        count += 1;
        const saturation = max === 0 ? 0 : (max - min) / max;
        if (saturation < 0.18 || luminance < 24 || luminance > 245) continue;
        const delta = max - min || 1;
        const hue = max === r ? (g - b) / delta + (g < b ? 6 : 0) : max === g ? (b - r) / delta + 2 : (r - g) / delta + 4;
        const bucket = (Math.round(hue) % 6) * 2 + (saturation > 0.55 ? 1 : 0);
        const entry = buckets.get(bucket) || { weight: 0, r: 0, g: 0, b: 0, hue: hue * 60 };
        const weight = saturation * saturation;
        entry.weight += weight;
        entry.r += r * weight;
        entry.g += g * weight;
        entry.b += b * weight;
        buckets.set(bucket, entry);
      }
      const ranked = [...buckets.values()].sort((left, right) => right.weight - left.weight)
        .map((entry) => ({ rgb: [entry.r / entry.weight, entry.g / entry.weight, entry.b / entry.weight], hue: entry.hue }));
      const accent = ranked[0]?.rgb || [36, 201, 215];
      const secondary = ranked.find((entry) => Math.abs(entry.hue - (ranked[0]?.hue || 0)) > 50)?.rgb || mix(accent, [255, 255, 255], 0.35);
      const light = (count ? luminanceSum / count : 128) > 128;
      return {
        accent: hex(...accent),
        secondary: hex(...secondary),
        surface: hex(...(light ? mix(accent, [252, 252, 255], 0.92) : mix(accent, [12, 12, 18], 0.86))),
        text: hex(...(light ? mix(accent, [16, 24, 40], 0.82) : mix(accent, [244, 246, 252], 0.85))),
      };
    };
    const MAX_CUSTOM = 5;
    const customRows = new Map();
    const removeCustomRow = (slotId) => {
      const row = customRows.get(slotId);
      if (!row) return;
      const rowIndex = rows.indexOf(row);
      if (rowIndex >= 0) rows.splice(rowIndex, 1);
      row.remove();
      customRows.delete(slotId);
    };
    const loadCustoms = () => {
      try {
        const saved = JSON.parse(localStorage.getItem(customStorageKey) || '[]');
        return Array.isArray(saved) ? saved.filter((item) => item?.id && item?.dataUrl && item?.colors).slice(0, MAX_CUSTOM) : [];
      } catch { return []; }
    };
    const writeLocalCustoms = (saved) => {
      try { localStorage.setItem(customStorageKey, JSON.stringify(saved.slice(0, MAX_CUSTOM))); }
      catch (error) { console.warn('Dream Theme: HanaAgent 自定义图片本地缓存失败', error); }
    };
    const syncSharedCustoms = (saved) => fetch(sharedCustomThemeService.endpoint, {
      method: 'PUT',
      headers: { Authorization: 'Bearer ' + sharedCustomThemeService.token, 'Content-Type': 'application/json' },
      body: JSON.stringify(saved.slice(0, MAX_CUSTOM)),
    }).then((response) => {
      if (!response.ok) throw new Error('共享图片同步失败: HTTP ' + response.status);
      return response.json();
    });
    const saveCustoms = (saved) => {
      const limited = saved.slice(0, MAX_CUSTOM);
      writeLocalCustoms(limited);
      return syncSharedCustoms(limited).catch((error) => {
        console.warn('Dream Theme: HanaAgent 共享图片同步失败', error);
        return limited;
      });
    };
    const localCustomThemes = loadCustoms();
    const initialCustomThemes = sharedCustomThemes.length > 0 ? sharedCustomThemes : localCustomThemes;
    writeLocalCustoms(initialCustomThemes);
    if (sharedCustomThemes.length === 0 && localCustomThemes.length > 0) void saveCustoms(localCustomThemes);
    const paintRows = (themeId) => rows.forEach((row) => {
      const selected = row.dataset.themeId === themeId;
      row.style.background = selected ? 'rgba(36,201,215,.16)' : 'transparent';
      row.style.fontWeight = selected ? '700' : '500';
    });
    const applyCustomTheme = (slot) => {
      active = true;
      try {
        localStorage.removeItem(restoreKey);
        localStorage.setItem(selectedKey, slot.id);
      } catch {}
      delete document.documentElement.dataset.dreamThemeRestored;
      style.textContent = materializeCustomCss(slot.dataUrl, slot.colors, slot.id);
      attachStyle();
      document.documentElement.dataset.dreamTheme = slot.id;
      paintRows(slot.id);
    };
    let uploadRow;
    const deleteCustom = async (slotId) => {
      const saved = loadCustoms();
      const index = saved.findIndex((item) => item.id === slotId);
      if (index < 0) return;
      if (document.documentElement.dataset.dreamTheme === slotId) restoreNative();
      saved.splice(index, 1);
      await saveCustoms(saved);
      removeCustomRow(slotId);
    };
    const ensureCustomRow = (slot) => {
      const existing = customRows.get(slot.id);
      if (existing) return;
      const item = addRow(slot.name, slot.id, slot.colors.accent, () => {
        const current = loadCustoms().find((saved) => saved.id === slot.id) || slot;
        applyCustomTheme(current);
        panel.style.display = 'none';
      }, uploadRow);
      const text = item.querySelector('span + span');
      text.style.cssText = 'flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;';
      const remove = document.createElement('span');
      remove.textContent = '×';
      remove.title = '删除这张自定义图片';
      remove.style.cssText = 'flex:none;width:18px;height:18px;line-height:18px;text-align:center;border-radius:50%;color:rgba(0,0,0,.45);font-size:14px;';
      remove.addEventListener('click', (event) => { event.stopPropagation(); deleteCustom(slot.id); });
      item.appendChild(remove);
      customRows.set(slot.id, item);
    };
    const importFromDataUrl = (dataUrl, name) => new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = async () => {
        const scale = Math.min(1, 1280 / image.width);
        const full = document.createElement('canvas');
        full.width = Math.max(1, Math.round(image.width * scale));
        full.height = Math.max(1, Math.round(image.height * scale));
        full.getContext('2d').drawImage(image, 0, 0, full.width, full.height);
        const sample = document.createElement('canvas');
        sample.width = 48;
        sample.height = Math.max(1, Math.round(48 * image.height / image.width));
        sample.getContext('2d').drawImage(image, 0, 0, sample.width, sample.height);
        const colors = extractPalette(sample);
        const compressed = full.toDataURL('image/webp', 0.78);
        const saved = loadCustoms();
        let slot;
        if (saved.length < MAX_CUSTOM) {
          slot = { id: 'custom-hana-' + Date.now().toString(36), name: name || '我的图片', dataUrl: compressed, colors };
          saved.push(slot);
        } else {
          const activeId = document.documentElement.dataset.dreamTheme;
          let index = saved.findIndex((item) => item.id === activeId);
          if (index < 0) index = 0;
          slot = { id: saved[index].id, name: name || '我的图片', dataUrl: compressed, colors };
          saved[index] = slot;
          removeCustomRow(slot.id);
        }
        await saveCustoms(saved);
        ensureCustomRow(slot);
        applyCustomTheme(slot);
        resolve(colors);
      };
      image.onerror = () => reject(new Error('图片读取失败'));
      image.src = dataUrl;
    });
    const picker = document.createElement('input');
    picker.type = 'file';
    picker.accept = 'image/png,image/jpeg,image/webp';
    picker.style.display = 'none';
    picker.addEventListener('change', () => {
      const file = picker.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => importFromDataUrl(reader.result, file.name.replace(/\\.[a-z0-9]+$/i, '')).catch((error) => console.warn('Dream Theme: HanaAgent 图片导入失败', error));
      reader.readAsDataURL(file);
      picker.value = '';
      panel.style.display = 'none';
    });
    uploadRow = addRow('＋ 自定义图片', '', 'rgba(36,201,215,.9)', () => picker.click());
    uploadRow.style.borderTop = '1px solid rgba(0,0,0,.08)';
    addRow('还原主题', '', 'rgba(0,0,0,.24)', restoreNative);
    initialCustomThemes.forEach(ensureCustomRow);
    fetch(sharedCustomThemeService.endpoint, {
      headers: { Authorization: 'Bearer ' + sharedCustomThemeService.token },
    }).then((response) => response.ok ? response.json() : Promise.reject(new Error('HTTP ' + response.status)))
      .then((latest) => {
        if (!Array.isArray(latest)) return;
        for (const slotId of [...customRows.keys()]) {
          if (!latest.some((item) => item.id === slotId)) removeCustomRow(slotId);
        }
        writeLocalCustoms(latest);
        latest.forEach(ensureCustomRow);
        let selectedId = '';
        try { selectedId = localStorage.getItem(selectedKey) || ''; } catch {}
        const selected = latest.find((item) => item.id === selectedId);
        if (selected) applyCustomTheme(selected);
      }).catch((error) => console.warn('Dream Theme: HanaAgent 共享图片读取失败', error));
    button.addEventListener('click', () => {
      panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    });
    const closeOnOutsideClick = (event) => {
      if (panel.style.display === 'none') return;
      const path = event.composedPath?.() || [];
      if (!path.includes(host)) panel.style.display = 'none';
    };
    window.__dreamWorkOutsideClick = closeOnOutsideClick;
    document.addEventListener('pointerdown', closeOnOutsideClick, true);
    root.append(panel, button, picker);
    shadow.appendChild(root);
    document.documentElement.appendChild(host);
    window.__dreamWorkMenuGuard = setInterval(() => {
      attachStyle();
      if (!host.isConnected) document.documentElement.appendChild(host);
    }, 250);
    if (!restored || forceApply) {
      let selectedId = '${e.currentThemeId}';
      if (!forceApply) {
        try { selectedId = localStorage.getItem(selectedKey) || selectedId; } catch {}
      }
      const selectedCustom = loadCustoms().find((item) => item.id === selectedId);
      if (selectedCustom) applyCustomTheme(selectedCustom);
      else applyTheme('${e.currentThemeId}');
    }
    return true;
  })()`}function Wr(e){return`
/* QoderWork shell controls */
body > #root > div:first-child > div:first-child button[aria-label] {
  background-color: transparent !important;
  color: ${e.text} !important;
  border-color: transparent !important;
  box-shadow: none !important;
}

body > #root > div:first-child > div:first-child button[aria-label]:hover,
body > #root > div:first-child > div:first-child button[aria-label]:focus-visible {
  background-color: color-mix(in srgb, ${e.accent} 16%, transparent) !important;
  color: ${e.text} !important;
}
body > #root > div:first-child > div:first-child button[aria-label="Close"]:hover {
  background-color: color-mix(in srgb, #ef4444 20%, transparent) !important;
  color: #ef4444 !important;
}
.agents-sidebar :where(button, [role="button"], [class*="cursor-pointer"]) {
  color: ${e.textSecondary} !important;
}
.agents-sidebar :where(button, [role="button"], [class*="cursor-pointer"]):hover {
  background-color: color-mix(in srgb, ${e.accent} 14%, transparent) !important;
  color: ${e.text} !important;
}
.agents-sidebar :where(button[aria-label="任务"], button[aria-label="频道"]) {
  background-color: transparent !important;
  color: ${e.textSecondary} !important;
  border-color: transparent !important;
  box-shadow: none !important;
}
.agents-sidebar :where(button[aria-label="任务"], button[aria-label="频道"])[data-state="active"],
.agents-sidebar :where(button[aria-label="任务"], button[aria-label="频道"])[aria-selected="true"],
.agents-sidebar :where(button[aria-label="任务"], button[aria-label="频道"]):focus-visible {
  background-color: color-mix(in srgb, ${e.accent} 20%, transparent) !important;
  color: ${e.text} !important;
}
.agents-sidebar > :last-child button {
  background-color: transparent !important;
  color: ${e.text} !important;
  border-color: transparent !important;
  box-shadow: none !important;
}
.agents-sidebar > :last-child button:hover {
  background-color: color-mix(in srgb, ${e.accent} 14%, transparent) !important;
}
.agents-content-area button.rounded-full:not(.SendButton-send),
.agents-parchment-paper-surface button.rounded-full:not(.SendButton-send) {
  background-color: color-mix(in srgb, ${e.surface} 70%, transparent) !important;
  color: ${e.text} !important;
  border-color: color-mix(in srgb, ${e.text} 14%, transparent) !important;
  box-shadow: none !important;
}
.agents-content-area button.rounded-full:not(.SendButton-send):hover,
.agents-parchment-paper-surface button.rounded-full:not(.SendButton-send):hover {
  background-color: color-mix(in srgb, ${e.accent} 18%, transparent) !important;
  border-color: color-mix(in srgb, ${e.accent} 34%, transparent) !important;
}
.agents-content-area button svg,
.agents-sidebar button svg,
body > #root > div:first-child > div:first-child button[aria-label] svg {
  color: currentColor !important;
}`}function Hr(e,n){return`
/* CatPaw new-task and conversation surfaces */
html body #root .main-area {
  position: relative !important;
  isolation: isolate !important;
  background-color: ${n.surface} !important;
  background-image: url(${JSON.stringify(e)}) !important;
  background-position: center center !important;
  background-size: cover !important;
  background-repeat: no-repeat !important;
}
html body #root .main-content-container,
html body #root .main-content,
html body #root .chat-content-area {
  background-color: transparent !important;
  background-image: none !important;
}
html body #root .chat-content-area > .relative.flex.flex-col.items-center.h-full,
html body #root .chat-content-area [class~="bg-catpaw-bg-primary"] {
  background-color: transparent !important;
  background-image: none !important;
}
html body #root .catpaw-desk-inputBox > .bg-catpaw-bg-card,
html body #root .catpaw-desk-inputBox [class~="bg-catpaw-bg-card"] {
  background-color: color-mix(in srgb, ${n.surface} 78%, transparent) !important;
  border: 1px solid color-mix(in srgb, ${n.accent} 30%, transparent) !important;
  box-shadow: 0 16px 42px color-mix(in srgb, ${n.surface} 30%, transparent) !important;
  backdrop-filter: blur(16px) saturate(108%) !important;
}
html body #root .catpaw-desk-inputBox :where(
  .catpaw-chat-input,
  .catpaw-editor,
  .catpaw-editor__body,
  .catpaw-editor__content,
  .mc-input-container
) {
  background-color: transparent !important;
  background-image: none !important;
  backdrop-filter: none !important;
  color: ${n.text} !important;
}
html body #root .catpaw-desk-inputBox :where(button, [role="button"]) {
  color: ${n.text} !important;
}
html body #root .catpaw-desk-inputBox :where(button, [role="button"]):hover {
  background-color: color-mix(in srgb, ${n.accent} 15%, transparent) !important;
}
html body #root .catpaw-desk-inputBox :where(svg, svg *) {
  color: currentColor !important;
}
`}function $t(e,n=""){return JSON.stringify(typeof e=="string"?e:n)}function Zt(e,n,t){var a,o;return`/* DREAM_THEME:${String(e.id??"custom").replace(/[^a-z0-9_-]/gi,"")} */
body[data-application-name="workbuddy"] {
  --wb-accent: ${t.accent};
  --wb-secondary: ${t.secondary};
  --wb-surface: ${t.surface};
  --wb-text: ${t.text};

  /* 背景 */
  --cb-bg-primary: var(--wb-surface) !important;
  --cb-bg-secondary: color-mix(in srgb, var(--wb-surface) 94%, transparent) !important;
  --cb-panel-bg-primary: color-mix(in srgb, var(--wb-surface) 92%, transparent) !important;
  --cb-team-member-card-background: color-mix(in srgb, var(--wb-surface) 92%, transparent) !important;

  /* 文字 */
  --cb-text-primary: var(--wb-text) !important;
  --cb-text-secondary: color-mix(in srgb, var(--wb-text) 82%, transparent) !important;
  --cb-text-disabled: color-mix(in srgb, var(--wb-text) 62%, transparent) !important;
  --cb-text-link: var(--wb-accent) !important;
  --cb-text-error-active: var(--wb-accent) !important;

  /* VS Code 主题色包装 */
  --cb-vscode-editor-background: var(--wb-surface) !important;
  --cb-vscode-sideBar-background: color-mix(in srgb, var(--wb-surface) 94%, transparent) !important;
  --cb-vscode-foreground: var(--wb-text) !important;
  --cb-vscode-editor-foreground: var(--wb-text) !important;
  --cb-vscode-descriptionForeground: color-mix(in srgb, var(--wb-text) 70%, transparent) !important;
  --cb-vscode-titleBar-activeBackground: var(--wb-accent) !important;
  --cb-vscode-titleBar-activeForeground: #ffffff !important;
  --cb-vscode-titleBar-inactiveBackground: color-mix(in srgb, var(--wb-accent) 80%, var(--wb-surface)) !important;
  --cb-vscode-titleBar-inactiveForeground: color-mix(in srgb, #ffffff 70%, transparent) !important;
  --cb-titlebar-control-hover-background: color-mix(in srgb, var(--wb-accent) 16%, transparent) !important;
  --cb-vscode-input-background: color-mix(in srgb, var(--wb-surface) 94%, transparent) !important;
  --cb-vscode-dropdown-background: color-mix(in srgb, var(--wb-surface) 96%, transparent) !important;
  --cb-vscode-list-hoverBackground: color-mix(in srgb, var(--wb-accent) 16%, transparent) !important;
  --cb-vscode-toolbar-hoverBackground: color-mix(in srgb, var(--wb-accent) 16%, transparent) !important;
  --cb-vscode-scrollbarSlider-background: color-mix(in srgb, var(--wb-accent) 30%, transparent) !important;
  --cb-vscode-scrollbarSlider-hoverBackground: color-mix(in srgb, var(--wb-accent) 50%, transparent) !important;
  --cb-vscode-textLink-foreground: var(--wb-accent) !important;
  --cb-vscode-widget-border: color-mix(in srgb, var(--wb-accent) 45%, transparent) !important;
  --cb-vscode-panel-border: color-mix(in srgb, var(--wb-accent) 30%, transparent) !important;

  /* 按钮 */
  --cb-button-dark-background: var(--wb-accent) !important;
  --cb-button-dark-foreground: #ffffff !important;
  --cb-button-dark-hover-background: color-mix(in srgb, var(--wb-accent) 85%, #000000) !important;
  --cb-vscode-button-background: var(--wb-accent) !important;
  --cb-vscode-button-foreground: #ffffff !important;
  --cb-vscode-button-hoverBackground: color-mix(in srgb, var(--wb-accent) 85%, #000000) !important;

  /* 描边 */
  --cb-stroke-secondary: color-mix(in srgb, var(--wb-accent) 45%, transparent) !important;
  --cb-markdown-hr-border-color: color-mix(in srgb, var(--wb-accent) 30%, transparent) !important;
}

#root {
  color: var(--wb-text) !important;
  background-color: var(--wb-surface) !important;
  background-image: url(${JSON.stringify(n)}) !important;
  background-position: center center !important;
  background-size: cover !important;
  background-repeat: no-repeat !important;
  background-attachment: fixed !important;
}

/* 关键：teams-container 是 #root 直接子层，默认有不透明灰底，会完全盖住背景图 */
.teams-container,
.teams-container.is-mac {
  background: transparent !important;
}

/* 所有 grid 项容器透明，让 #root 背景图大面积透出 */
[data-view-id] {
  background: transparent !important;
}

/* 内容区内的子层也透明（否则会盖住背景图和磨砂层） */
.conversation-list,
.main-content,
.main-content--welcome,
.sidebar-next {
  background: transparent !important;
}

/* 侧边栏磨砂玻璃（覆盖上面的 transparent） */
[data-view-id=sidebar] {
  background: color-mix(in srgb, var(--wb-surface) 62%, transparent) !important;
  border-right: 1px solid color-mix(in srgb, var(--wb-accent) 45%, transparent) !important;
  backdrop-filter: blur(20px) saturate(1.12);
}

/* 主内容区：顶部透出底图，底部更强遮罩保证内容可读 */
[data-view-id=main-content] {
  background: linear-gradient(180deg, transparent 0 58%, color-mix(in srgb, var(--wb-surface) 58%, transparent) 100%) !important;
}

/* 详情面板半透明磨砂 */
[data-view-id=detail-panel] {
  background: color-mix(in srgb, var(--wb-surface) 64%, transparent) !important;
  backdrop-filter: blur(18px) saturate(1.08);
}

/* brand 文案（copy 为空时不显示） */
#root::before {
  position: fixed;
  z-index: 20;
  top: 60px;
  left: max(300px, 22vw);
  content: ${$t((a=e.copy)==null?void 0:a.brand)};
  color: var(--wb-accent);
  font: 800 clamp(16px, 2vw, 30px)/1.2 ui-rounded, system-ui;
  text-shadow: 0 2px 10px white;
  pointer-events: none;
}

/* headline 文案 */
#root::after {
  position: fixed;
  z-index: 20;
  top: 104px;
  left: max(300px, 22vw);
  max-width: 42vw;
  content: ${$t((o=e.copy)==null?void 0:o.headline)};
  color: var(--wb-text);
  font: 750 clamp(18px, 2.7vw, 42px)/1.15 ui-rounded, system-ui;
  text-shadow: 0 2px 12px white;
  pointer-events: none;
}`}function Fr(e,n,t){const r=zr(t.surface),a=r?`color-mix(in srgb, ${t.surface} 90%, transparent)`:`color-mix(in srgb, ${t.surface} 86%, transparent)`,o=r?`color-mix(in srgb, ${t.accent} 16%, ${t.surface})`:`color-mix(in srgb, ${t.accent} 42%, ${t.surface})`,s=r?"#172033":`color-mix(in srgb, ${t.surface} 72%, #000000)`,c="#f2f6ff",i=`/* DREAM_THEME:${e.id} */
:root.codex-dream-skin {
  --ds-bg: ${t.surface};
  --ds-panel: ${t.surface};
  --ds-panel-2: ${t.surface};
  --ds-surface: ${t.surface};
  --ds-green: ${t.accent};
  --ds-lime: ${t.secondary};
  --ds-cyan: ${t.secondary};
  --ds-purple: ${t.accent};
  --ds-text: ${t.text};
  --ds-muted: color-mix(in srgb, ${t.text} 82%, transparent);
  --ds-line: color-mix(in srgb, ${t.accent} 22%, transparent);
  --ds-hero-height: 252px;
  --ds-radius: 24px;
  --dream-skin-art: url(${JSON.stringify(n)});
}`,l=`/* DREAM_THEME_BODY:${e.id} */
html.codex-dream-skin body {
  background-color: ${t.surface} !important;
  background-image: none !important;
}

html.codex-dream-skin main.main-surface {
  position: relative !important;
  isolation: isolate !important;
  background-color: ${t.surface} !important;
  background-image: none !important;
}

html.codex-dream-skin main.main-surface::before {
  content: "" !important;
  position: absolute !important;
  inset: 0 !important;
  z-index: -1 !important;
  pointer-events: none !important;
  background-color: ${t.surface} !important;
  background-image: var(--dream-skin-art) !important;
  background-position: center center !important;
  background-size: cover !important;
  background-repeat: no-repeat !important;
  opacity: 1 !important;
}

html.codex-dream-skin main.main-surface > header.app-header-tint {
  background: color-mix(in srgb, ${t.surface} 76%, transparent) !important;
  backdrop-filter: blur(14px) saturate(108%) !important;
}

html.codex-dream-skin main.main-surface [role="main"],
html.codex-dream-skin main.main-surface .thread-scroll-container {
  --color-token-conversation-body: ${t.text} !important;
  --color-token-text-secondary: color-mix(in srgb, ${t.text} 76%, transparent) !important;
  --color-token-text-tertiary: color-mix(in srgb, ${t.text} 58%, transparent) !important;
  --color-token-conversation-summary-leading: color-mix(in srgb, ${t.text} 88%, transparent) !important;
  --color-token-conversation-summary-trailing: color-mix(in srgb, ${t.text} 68%, transparent) !important;
  --color-token-conversation-header: color-mix(in srgb, ${t.text} 78%, transparent) !important;
  --color-token-description-foreground: color-mix(in srgb, ${t.text} 72%, transparent) !important;
  --shimmer-text-secondary: color-mix(in srgb, ${t.text} 68%, transparent) !important;
  --shimmer-contrast: ${t.text} !important;
  background-color: transparent !important;
  color: ${t.text} !important;
}

html.codex-dream-skin main.main-surface:not(.dream-skin-home-shell) {
  background-color: transparent !important;
  background-image: none !important;
}

html.codex-dream-skin main.main-surface:not(.dream-skin-home-shell) article,
html.codex-dream-skin main.main-surface:not(.dream-skin-home-shell) .message,
html.codex-dream-skin main.main-surface:not(.dream-skin-home-shell) [data-message-author-role],
html.codex-dream-skin main.main-surface:not(.dream-skin-home-shell) [class*="surface"]:not(.composer-surface-chrome):not([class*="home-main-content"]) {
  border-color: color-mix(in srgb, ${t.accent} 24%, transparent) !important;
  background: ${a} !important;
  color: ${t.text} !important;
  text-shadow: none !important;
  backdrop-filter: blur(18px) saturate(108%) !important;
}

html.codex-dream-skin main.main-surface:not(.dream-skin-home-shell) [data-message-author-role="user"],
html.codex-dream-skin main.main-surface:not(.dream-skin-home-shell) [class*="bg-token-foreground"] {
  background: ${o} !important;
  color: ${t.text} !important;
}

html.codex-dream-skin main.main-surface:not(.dream-skin-home-shell)
  .thread-scroll-container [class*="_markdownContent_"],
html.codex-dream-skin main.main-surface:not(.dream-skin-home-shell)
  .thread-scroll-container [class*="_markdownContent_"] :where(p, li, h1, h2, h3, h4, h5, h6, strong, em, blockquote, span),
html.codex-dream-skin main.main-surface:not(.dream-skin-home-shell)
  .thread-scroll-container :where(.text-token-conversation-body, .text-token-text-secondary, .group/activity-header),
html.codex-dream-skin main.main-surface:not(.dream-skin-home-shell)
  .thread-scroll-container .group/activity-header :where(span, svg) {
  color: ${t.text} !important;
  text-shadow: none !important;
}

html.codex-dream-skin main.main-surface:not(.dream-skin-home-shell)
  .thread-scroll-container :where(
    article,
    article *,
    .message,
    .message *,
    [data-message-author-role],
    [data-message-author-role] *
  ) {
  color: ${t.text} !important;
  text-shadow: none !important;
}

html.codex-dream-skin main.main-surface:not(.dream-skin-home-shell)
  .thread-scroll-container * {
  color: ${t.text} !important;
}

html.codex-dream-skin main.main-surface:not(.dream-skin-home-shell)
  .thread-scroll-container [class*="_markdownContent_"] a {
  color: ${t.accent} !important;
}

html.codex-dream-skin .composer-surface-chrome {
  background: color-mix(in srgb, ${t.surface} 92%, transparent) !important;
  color: ${t.text} !important;
}

html.codex-dream-skin .composer-surface-chrome *,
html.codex-dream-skin .composer-surface-chrome .ProseMirror {
  color: ${t.text} !important;
  caret-color: ${t.accent} !important;
}

html.codex-dream-skin main.main-surface pre,
html.codex-dream-skin main.main-surface code,
html.codex-dream-skin main.main-surface table,
html.codex-dream-skin main.main-surface [data-testid*="code"] {
  background: ${s} !important;
  color: ${c} !important;
  text-shadow: none !important;
}

html.codex-dream-skin main.main-surface :where(pre, code, table) * {
  color: ${c} !important;
}

/* The main surface already owns the full artwork; avoid a second hero image. */
html.codex-dream-skin .dream-skin-home > div:first-child > div:first-child > div:first-child {
  background-image: none !important;
  background-color: transparent !important;
}

/* Codex new-task home: remove the full-page wash while keeping cards readable. */
html.codex-dream-skin main.main-surface.dream-skin-home-shell,
html.codex-dream-skin main.main-surface.dream-skin-home-shell > div,
html.codex-dream-skin .dream-skin-home,
html.codex-dream-skin .dream-skin-home > div {
  background-color: transparent !important;
  background-image: none !important;
}
html.codex-dream-skin .dream-skin-home :where([class*="bg-token-main-surface"], [class*="from-token-main-surface"], [class*="via-token-main-surface"]) {
  background-color: transparent !important;
  background-image: none !important;
}
html.codex-dream-skin main.main-surface [class*="container-name:home-main-content"] {
  background-color: transparent !important;
  background-image: none !important;
  backdrop-filter: none !important;
}
html.codex-dream-skin .dream-skin-home .composer-surface-chrome {
  background-color: color-mix(in srgb, ${t.surface} 82%, transparent) !important;
  backdrop-filter: blur(14px) saturate(106%) !important;
}`;return i+`
`+l}function zr(e){const n=/^#([0-9a-f]{6})$/i.exec(e);if(!n)return!0;const t=parseInt(n[1],16);return .299*(t>>16&255)+.587*(t>>8&255)+.114*(t&255)>140}function qr(e){return`(() => {
  const data = ${JSON.stringify({styleId:e.styleId,menuId:e.menuId,activeId:e.currentThemeId,themes:e.themes,cssTemplate:e.cssTemplate,sentinels:I,storageKey:"dreamCustomThemes",selectedKey:"wb-dream-selected",sharedCustomThemes:e.sharedCustomThemes,sharedCustomThemeService:e.sharedCustomThemeService})};
  const recordPresetUsage = (themeId) => fetch(data.sharedCustomThemeService.usageEndpoint, {
    method: "POST",
    headers: { Authorization: "Bearer " + data.sharedCustomThemeService.token, "Content-Type": "application/json" },
    body: JSON.stringify({ appId: "workbuddy", themeId }),
  }).catch(() => {});
  const themeBlobUrls = new Map();
  const materializeCss = (css, cacheKey) => {
    const dataUrl = css.match(new RegExp('data:image/(?:png|jpeg|webp|gif);base64,[A-Za-z0-9+/=]+'))?.[0];
    if (!dataUrl) return css;
    let blobUrl = themeBlobUrls.get(cacheKey);
    if (!blobUrl) {
      const [header, encoded] = dataUrl.split(',', 2);
      const mime = header.slice(5, header.indexOf(';'));
      const binary = atob(encoded);
      const bytes = new Uint8Array(binary.length);
      for (let index = 0; index < binary.length; index++) bytes[index] = binary.charCodeAt(index);
      blobUrl = URL.createObjectURL(new Blob([bytes], { type: mime }));
      themeBlobUrls.set(cacheKey, blobUrl);
    }
    return css.split(dataUrl).join(blobUrl);
  };
  let style = document.getElementById(data.styleId);
  if (!style) {
    style = document.createElement("style");
    style.id = data.styleId;
    document.head.appendChild(style);
  }

  document.getElementById(data.menuId)?.remove();
  const root = document.createElement("div");
  root.id = data.menuId;
  root.style.cssText = "position:fixed;bottom:16px;right:16px;z-index:2147483000;font:500 13px/1.4 system-ui;user-select:none;";

  const button = document.createElement("button");
  button.type = "button";
  button.title = "WorkBuddy 主题切换";
  button.textContent = "◉";
  button.style.cssText = "margin-left:auto;width:36px;height:36px;border-radius:10px;border:1px solid rgba(0,0,0,.12);background:rgba(255,255,255,.92);backdrop-filter:blur(10px);box-shadow:0 3px 12px rgba(0,0,0,.2);cursor:pointer;padding:0;display:flex;align-items:center;justify-content:center;color:#17344f;font-size:18px;line-height:1;";

  const panel = document.createElement("div");
  panel.style.cssText = "display:none;margin-bottom:8px;min-width:200px;padding:6px;border-radius:12px;border:1px solid rgba(0,0,0,.1);background:rgba(255,255,255,.94);backdrop-filter:blur(16px);box-shadow:0 10px 30px rgba(0,0,0,.18);color:#17344f;";

  const rows = new Map();
  const paint = (id) => {
    for (const [rowId, item] of rows) {
      item.style.background = rowId === id ? "rgba(36,201,215,.16)" : "transparent";
      item.style.fontWeight = rowId === id ? "700" : "500";
    }
  };
  const row = (label, dotColor, onPick, before) => {
    const item = document.createElement("div");
    item.style.cssText = "display:flex;align-items:center;gap:8px;padding:7px 10px;border-radius:8px;cursor:pointer;";
    const dot = document.createElement("span");
    dot.style.cssText = "width:10px;height:10px;border-radius:50%;flex:none;background:" + dotColor + ";";
    const text = document.createElement("span");
    text.textContent = label;
    item.append(dot, text);
    item.addEventListener("mouseenter", () => { if (item.style.fontWeight !== "700") item.style.background = "rgba(0,0,0,.05)"; });
    item.addEventListener("mouseleave", () => paint(document.documentElement.dataset.dreamTheme ?? null));
    item.addEventListener("click", () => onPick(item));
    if (before) panel.insertBefore(item, before); else panel.appendChild(item);
    return item;
  };

  const isLightSurface = (hex) => {
    const match = /^#([0-9a-f]{6})$/i.exec(hex || "");
    if (!match) return true;
    const value = parseInt(match[1], 16);
    return (0.299 * ((value >> 16) & 255) + 0.587 * ((value >> 8) & 255) + 0.114 * (value & 255)) > 140;
  };
  const applyMode = (surface) => {
    const dark = !isLightSurface(surface);
    const body = document.body;
    const html = document.documentElement;
    html.dataset.dreamShell = dark ? "dark" : "light";
    body.dataset.vscodeThemeKind = dark ? "vscode-dark" : "vscode-light";
    body.dataset.vscodeThemeName = dark ? "IDE Dark" : "IDE Light";
    html.style.colorScheme = dark ? "dark" : "light";
    ["light", "vscode-light", "cb-light", "dark", "vscode-dark", "cb-dark"].forEach((className) => {
      const darkClass = className === "dark" || className === "vscode-dark" || className === "cb-dark";
      body.classList.toggle(className, dark ? darkClass : !darkClass);
      html.classList.toggle(className, dark ? darkClass : !darkClass);
    });
  };
  const setTheme = (id) => {
    const theme = data.themes.find((candidate) => candidate.id === id);
    if (!theme) return;
    style.textContent = materializeCss(theme.css, theme.id);
    document.documentElement.dataset.dreamTheme = theme.id;
    try { localStorage.setItem(data.selectedKey, theme.id); } catch {}
    applyMode(theme.surface);
    paint(theme.id);
  };
  const clearTheme = () => {
    style.textContent = "";
    delete document.documentElement.dataset.dreamTheme;
    try { localStorage.removeItem(data.selectedKey); } catch {}
    applyMode("#ffffff");
    paint(null);
  };

  for (const theme of data.themes) {
    const item = row(theme.name, theme.accent, () => { setTheme(theme.id); void recordPresetUsage(theme.id); panel.style.display = "none"; });
    item.dataset.dreamThemeId = theme.id;
    rows.set(theme.id, item);
  }

  const buildCustomCss = (dataUrl, colors, customId) => data.cssTemplate
    .split(data.sentinels.hero).join(dataUrl)
    .split(data.sentinels.accent).join(colors.accent)
    .split(data.sentinels.secondary).join(colors.secondary)
    .split(data.sentinels.surface).join(colors.surface)
    .split(data.sentinels.text).join(colors.text)
    .split(data.sentinels.id).join(customId);
  const hex = (r, g, b) => "#" + [r, g, b].map((value) => Math.max(0, Math.min(255, Math.round(value))).toString(16).padStart(2, "0")).join("");
  const mix = (a, b, amount) => a.map((value, index) => value + (b[index] - value) * amount);
  const extractPalette = (canvas) => {
    const context = canvas.getContext("2d");
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    const buckets = new Map();
    let luminanceSum = 0;
    let count = 0;
    for (let index = 0; index < pixels.length; index += 4) {
      const r = pixels[index], g = pixels[index + 1], b = pixels[index + 2];
      const max = Math.max(r, g, b), min = Math.min(r, g, b);
      const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      luminanceSum += luminance;
      count += 1;
      const saturation = max === 0 ? 0 : (max - min) / max;
      if (saturation < 0.18 || luminance < 24 || luminance > 245) continue;
      const delta = max - min || 1;
      let hue = max === r ? (g - b) / delta + (g < b ? 6 : 0) : max === g ? (b - r) / delta + 2 : (r - g) / delta + 4;
      const bucket = (Math.round(hue) % 6) * 2 + (saturation > 0.55 ? 1 : 0);
      const entry = buckets.get(bucket) ?? { weight: 0, r: 0, g: 0, b: 0, hue: hue * 60 };
      const weight = saturation * saturation;
      entry.weight += weight;
      entry.r += r * weight;
      entry.g += g * weight;
      entry.b += b * weight;
      buckets.set(bucket, entry);
    }
    const averageLuminance = count ? luminanceSum / count : 128;
    const ranked = [...buckets.values()].sort((left, right) => right.weight - left.weight)
      .map((entry) => ({ rgb: [entry.r / entry.weight, entry.g / entry.weight, entry.b / entry.weight], hue: entry.hue }));
    const accent = ranked[0]?.rgb ?? [36, 201, 215];
    const secondary = ranked.find((entry) => Math.abs(entry.hue - (ranked[0]?.hue ?? 0)) > 50)?.rgb ?? mix(accent, [255, 255, 255], 0.35);
    const light = averageLuminance > 128;
    return {
      accent: hex(...accent),
      secondary: hex(...secondary),
      surface: hex(...(light ? mix(accent, [252, 252, 255], 0.92) : mix(accent, [12, 12, 18], 0.86))),
      text: hex(...(light ? mix(accent, [16, 24, 40], 0.82) : mix(accent, [244, 246, 252], 0.85))),
    };
  };

  const MAX_CUSTOM = 5;
  const customRows = new Map();
  const loadCustoms = () => {
    try {
      const themes = JSON.parse(localStorage.getItem(data.storageKey) ?? "[]");
      return Array.isArray(themes) ? themes.filter((theme) => theme && theme.dataUrl && theme.colors).slice(0, MAX_CUSTOM) : [];
    } catch { return []; }
  };
  const writeLocalCustoms = (themes) => {
    try { localStorage.setItem(data.storageKey, JSON.stringify(themes.slice(0, MAX_CUSTOM))); }
    catch (error) { console.warn("Dream Theme: 自定义图片本地缓存失败", error); }
  };
  const syncSharedCustoms = (themes) => fetch(data.sharedCustomThemeService.endpoint, {
    method: "PUT",
    headers: { Authorization: "Bearer " + data.sharedCustomThemeService.token, "Content-Type": "application/json" },
    body: JSON.stringify(themes.slice(0, MAX_CUSTOM)),
  }).then((response) => {
    if (!response.ok) throw new Error("共享图片同步失败: HTTP " + response.status);
    return response.json();
  });
  const saveCustoms = (themes) => {
    const limited = themes.slice(0, MAX_CUSTOM);
    writeLocalCustoms(limited);
    return syncSharedCustoms(limited).catch((error) => {
      console.warn("Dream Theme: 共享图片同步失败", error);
      return limited;
    });
  };
  const localCustomThemes = loadCustoms();
  const initialCustomThemes = data.sharedCustomThemes.length > 0 ? data.sharedCustomThemes : localCustomThemes;
  writeLocalCustoms(initialCustomThemes);
  if (data.sharedCustomThemes.length === 0 && localCustomThemes.length > 0) void saveCustoms(localCustomThemes);
  const applyCustomTheme = (slot) => {
    style.textContent = materializeCss(buildCustomCss(slot.dataUrl, slot.colors, slot.id), slot.id);
    document.documentElement.dataset.dreamTheme = slot.id;
    try { localStorage.removeItem(data.selectedKey); } catch {}
    applyMode(slot.colors.surface);
    ensureCustomRow(slot);
    paint(slot.id);
  };
  const deleteCustom = async (slotId) => {
    const themes = loadCustoms();
    const index = themes.findIndex((theme) => theme.id === slotId);
    if (index < 0) return;
    if (document.documentElement.dataset.dreamTheme === slotId) clearTheme();
    themes.splice(index, 1);
    await saveCustoms(themes);
    customRows.get(slotId)?.remove();
    customRows.delete(slotId);
    rows.delete(slotId);
  };
  const ensureCustomRow = (slot) => {
    const existing = customRows.get(slot.id);
    if (existing) {
      existing.querySelector("span + span").textContent = slot.name;
      existing.firstChild.style.background = slot.colors.accent;
      return;
    }
    const item = row(slot.name, slot.colors.accent, () => {
      const current = loadCustoms().find((theme) => theme.id === slot.id) ?? slot;
      applyCustomTheme(current);
      panel.style.display = "none";
    }, uploadRow);
    item.dataset.dreamThemeId = slot.id;
    const text = item.querySelector("span + span");
    text.style.cssText = "flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;";
    const remove = document.createElement("span");
    remove.textContent = "×";
    remove.title = "删除这张自定义图片";
    remove.style.cssText = "flex:none;width:18px;height:18px;line-height:18px;text-align:center;border-radius:50%;color:rgba(0,0,0,.45);font-size:14px;";
    remove.addEventListener("mouseenter", () => { remove.style.background = "rgba(220,60,60,.15)"; remove.style.color = "#c03030"; });
    remove.addEventListener("mouseleave", () => { remove.style.background = "transparent"; remove.style.color = "rgba(0,0,0,.45)"; });
    remove.addEventListener("click", (event) => { event.stopPropagation(); deleteCustom(slot.id); });
    item.appendChild(remove);
    customRows.set(slot.id, item);
    rows.set(slot.id, item);
  };

  const importFromDataUrl = (dataUrl, name) => new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = async () => {
      const scale = Math.min(1, 1600 / image.width);
      const full = document.createElement("canvas");
      full.width = Math.round(image.width * scale);
      full.height = Math.round(image.height * scale);
      full.getContext("2d").drawImage(image, 0, 0, full.width, full.height);
      const sample = document.createElement("canvas");
      sample.width = 48;
      sample.height = Math.max(1, Math.round(48 * image.height / image.width));
      sample.getContext("2d").drawImage(image, 0, 0, sample.width, sample.height);
      const colors = extractPalette(sample);
      const compressed = full.toDataURL("image/webp", 0.8);
      const themes = loadCustoms();
      let slot;
      if (themes.length < MAX_CUSTOM) {
        slot = { id: "custom-upload-" + Date.now().toString(36), name: name || "我的图片", dataUrl: compressed, colors };
        themes.push(slot);
      } else {
        const activeId = document.documentElement.dataset.dreamTheme;
        let index = themes.findIndex((theme) => theme.id === activeId);
        if (index < 0) index = 0;
        slot = { id: themes[index].id, name: name || "我的图片", dataUrl: compressed, colors };
        themes[index] = slot;
      }
      await saveCustoms(themes);
      applyCustomTheme(slot);
      resolve(colors);
    };
    image.onerror = () => reject(new Error("图片读取失败"));
    image.src = dataUrl;
  });

  const picker = document.createElement("input");
  picker.type = "file";
  picker.accept = "image/png,image/jpeg,image/webp";
  picker.style.display = "none";
  picker.addEventListener("change", () => {
    const file = picker.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => importFromDataUrl(reader.result, file.name.replace(/\\.[a-z0-9]+$/i, ""));
    reader.readAsDataURL(file);
    picker.value = "";
    panel.style.display = "none";
  });

  const uploadRow = row("＋ 自定义图片", "rgba(36,201,215,.9)", () => picker.click());
  uploadRow.style.borderTop = "1px solid rgba(0,0,0,.08)";
  const native = row("还原主题", "rgba(0,0,0,.24)", () => { clearTheme(); panel.style.display = "none"; });
  rows.set(null, native);
  initialCustomThemes.forEach(ensureCustomRow);
  fetch(data.sharedCustomThemeService.endpoint, {
    headers: { Authorization: "Bearer " + data.sharedCustomThemeService.token },
  }).then((response) => response.ok ? response.json() : Promise.reject(new Error("HTTP " + response.status)))
    .then((latest) => {
      if (!Array.isArray(latest)) return;
      for (const slotId of [...customRows.keys()]) {
        if (!latest.some((item) => item.id === slotId)) {
          customRows.get(slotId)?.remove();
          customRows.delete(slotId);
          rows.delete(slotId);
        }
      }
      writeLocalCustoms(latest);
      latest.forEach(ensureCustomRow);
    }).catch((error) => console.warn("Dream Theme: 共享图片读取失败", error));

  button.addEventListener("click", () => { panel.style.display = panel.style.display === "none" ? "block" : "none"; });
  const closeOnOutsideClick = (event) => {
    if (panel.style.display === "none" || root.contains(event.target)) return;
    panel.style.display = "none";
  };
  if (window.__dreamWorkOutsideClick) {
    document.removeEventListener("pointerdown", window.__dreamWorkOutsideClick, true);
  }
  window.__dreamWorkOutsideClick = closeOnOutsideClick;
  document.addEventListener("pointerdown", closeOnOutsideClick, true);
  root.append(panel, button, picker);
  document.body.appendChild(root);

  setTheme(data.activeId);

  window.__dreamTheme = { importFromDataUrl, setTheme, clearTheme, deleteCustom };
  return true;
})()`}function Vr(e){const n=JSON.stringify(e.themes),t=JSON.stringify(e.cssTemplate??""),r=e.appId,a=e.surfaceAlphas??qt;return`(() => {
  const themes = ${n};
  const cssTemplate = ${t};
  const sentinels = ${JSON.stringify(I)};
  const surfaceAlphas = ${JSON.stringify(a)};
  const currentThemeId = '${e.currentThemeId}';
  const appId = '${r}';
  const pets = ${JSON.stringify(e.pets??[])};
  const hasPet = pets.length > 0 && appId === 'zcode';   // 桌面宠物（按任务状态切换 GIF）
  const customStorageKey = 'dreamCodexCustomThemes';
  const sharedCustomThemes = ${JSON.stringify(e.sharedCustomThemes)};
  const sharedCustomThemeService = ${JSON.stringify(e.sharedCustomThemeService)};
  const recordPresetUsage = (themeId) => fetch(sharedCustomThemeService.usageEndpoint, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + sharedCustomThemeService.token, 'Content-Type': 'application/json' },
    body: JSON.stringify({ appId, themeId }),
  }).catch(() => {});
  const themeBlobUrls = new Map();
  const isBase64Char = (code) => (code >= 48 && code <= 57) || (code >= 65 && code <= 90) || (code >= 97 && code <= 122) || code === 43 || code === 47 || code === 61;
  // 不用正则提取 data URL：大体积 hero（10MB+ base64）会让旧版 V8 的正则
  // 回溯栈溢出（RangeError: Maximum call stack size exceeded）。
  // CSS 可能同时含多个 data URL（如流光角饰的 URL 编码 SVG 在 hero 之前），
  // 必须逐个按各自边界提取：head/comma/end 三段都必须落在同一个 URL 内，
  // 否则跨 URL 拼接会让 atob 拿到乱码直接 InvalidCharacterError。
  const materializeCss = (css, cacheKey) => {
    if (css.indexOf('data:image/') < 0) return css;
    const chunks = [];
    let pos = 0;
    for (;;) {
      const head = css.indexOf('data:image/', pos);
      if (head < 0) break;
      const comma = css.indexOf(',', head);
      if (comma < 0) break;
      const header = css.slice(head, comma);
      const isBase64Url = /;base64$/.test(header);
      let end = comma + 1;
      if (isBase64Url) {
        while (end < css.length && isBase64Char(css.charCodeAt(end))) end++;
      } else {
        while (end < css.length) {
          const code = css.charCodeAt(end);
          if (code === 34 || code === 39 || code === 41 || code === 32 || code === 10) break;
          end++;
        }
      }
      const dataUrl = css.slice(head, end);
      if (isBase64Url && dataUrl.length > 4096) {
        let blobUrl = themeBlobUrls.get(cacheKey + ':' + head);
        if (!blobUrl) {
          const mime = header.slice(5, header.indexOf(';'));
          const binary = atob(css.slice(comma + 1, end));
          const bytes = new Uint8Array(binary.length);
          for (let index = 0; index < binary.length; index++) bytes[index] = binary.charCodeAt(index);
          blobUrl = URL.createObjectURL(new Blob([bytes], { type: mime }));
          themeBlobUrls.set(cacheKey + ':' + head, blobUrl);
        }
        chunks.push(css.slice(pos, head), blobUrl);
      } else {
        chunks.push(css.slice(pos, end));
      }
      pos = end;
    }
    chunks.push(css.slice(pos));
    return chunks.join('');
  };

  const isLightSurface = (hex) => {
    const m = /^#([0-9a-f]{6})$/i.exec(hex || "");
    if (!m) return true;
    const v = parseInt(m[1], 16);
    return (0.299 * ((v >> 16) & 255) + 0.587 * ((v >> 8) & 255) + 0.114 * (v & 255)) > 140;
  };
  const applyMode = (surface) => {
    const dark = !isLightSurface(surface);
    const body = document.body;
    const html = document.documentElement;
    html.dataset.dreamShell = dark ? "dark" : "light";
    body.dataset.vscodeThemeKind = dark ? "vscode-dark" : "vscode-light";
    body.dataset.vscodeThemeName = dark ? "IDE Dark" : "IDE Light";
    html.style.colorScheme = dark ? "dark" : "light";
    ["light", "vscode-light", "cb-light", "dark", "vscode-dark", "cb-dark"].forEach((cls) => {
      const isDarkCls = cls === "dark" || cls === "vscode-dark" || cls === "cb-dark";
      body.classList.toggle(cls, dark ? isDarkCls : !isDarkCls);
      html.classList.toggle(cls, dark ? isDarkCls : !isDarkCls);
    });
  };

  /* ZCode 动态视频背景（预设主题 video 字段）：幂等管理 fixed 视频层。
     菜单脚本被 watcher 周期重注入，src 未变化时绝不重建/重载，避免播放反复归零；
     视频出错回退层底图（hero），页面隐藏暂停省电，prefers-reduced-motion 不建层。 */
  const applyVideoLayer = (videoUrl) => {
    const layerId = 'dream-work-video-layer';
    let layer = document.getElementById(layerId);
    if (!videoUrl || (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) {
      if (layer) layer.remove();
      delete window.__dreamWorkVideoSrc;
      return;
    }
    if (!layer) {
      layer = document.createElement('div');
      layer.id = layerId;
      const video = document.createElement('video');
      video.muted = true;
      video.loop = true;
      video.autoplay = true;
      video.setAttribute('playsinline', '');
      video.preload = 'auto';
      video.addEventListener('error', () => { layer.dataset.motionError = 'true'; });
      video.addEventListener('canplay', () => { if (layer.dataset.motionError) delete layer.dataset.motionError; });
      layer.appendChild(video);
    }
    if (!layer.isConnected) document.body.appendChild(layer);
    const video = layer.querySelector('video');
    if (window.__dreamWorkVideoSrc !== videoUrl) {
      window.__dreamWorkVideoSrc = videoUrl;
      if (layer.dataset.motionError) delete layer.dataset.motionError;
      video.src = videoUrl;
      video.load();
      const playing = video.play();
      if (playing && playing.catch) playing.catch(() => {});
    } else if (video.paused && !document.hidden) {
      const playing = video.play();
      if (playing && playing.catch) playing.catch(() => {});
    }
  };
  if (!window.__dreamWorkVideoVisibility) {
    window.__dreamWorkVideoVisibility = true;
    document.addEventListener('visibilitychange', () => {
      const video = document.querySelector('#dream-work-video-layer video');
      if (!video) return;
      if (document.hidden) video.pause();
      else { const playing = video.play(); if (playing && playing.catch) playing.catch(() => {}); }
    });
  }

  const style = document.getElementById('${e.styleId}');
  if (!style) {
    const s = document.createElement('style');
    s.id = '${e.styleId}';
    document.head.appendChild(s);
    window.__dreamWorkThemeStyle = s;
  } else {
    window.__dreamWorkThemeStyle = style;
  }

  const applyTheme = (themeId) => {
    const theme = themes.find(t => t.id === themeId);
    if (!theme) return;
    window.__dreamWorkThemeStyle.textContent = materializeCss(theme.css, theme.id);
    document.documentElement.dataset.dreamTheme = themeId;
    if (appId !== 'hana-agent') applyMode(theme.surface);
    if (appId === 'zcode') applyVideoLayer(theme.videoUrl);
    
    // Codex themes require the codex-dream-skin class on <html> for CSS selectors to match
    if (appId === 'codex') {
      document.documentElement.classList.add('codex-dream-skin');
      const shellMain = document.querySelector('main.main-surface') || document.querySelector('main');
      if (shellMain) {
        const homeCandidate = (shellMain.matches('[role="main"]') ? shellMain : shellMain.querySelector('[role="main"]')) ||
          shellMain.querySelector('[class*="home-main-content"], [class*="container-name:home-main-content"]');
        if (homeCandidate) {
          const hasGameSource = homeCandidate.querySelector('[data-feature="game-source"]');
          const hasSuggestions = homeCandidate.querySelector('[class*="group/home-suggestions"]');
          const hasTaskContent = homeCandidate.querySelector('.thread-scroll-container, [data-message-author-role], article, .message');
          const isHomeContainer = homeCandidate.matches('[class*="home-main-content"], [class*="container-name:home-main-content"]');
          if ((hasGameSource || hasSuggestions || isHomeContainer) && !hasTaskContent) {
            homeCandidate.classList.add('dream-skin-home');
            shellMain.classList.add('dream-skin-home-shell');
          } else {
            shellMain.classList.remove('dream-skin-home-shell');
          }
        }
      }
    }
    
    const rows = root.querySelectorAll('.dream-theme-row');
    rows.forEach(row => {
      const id = row.dataset.themeId;
      row.style.background = id === themeId ? 'rgba(36,201,215,.16)' : 'transparent';
      row.style.fontWeight = id === themeId ? '700' : '500';
    });
  };

  const restoreNative = () => {
    window.__dreamWorkThemeStyle.textContent = '';
    delete document.documentElement.dataset.dreamTheme;
    if (appId !== 'hana-agent') applyMode('#ffffff');
    if (appId === 'zcode') applyVideoLayer(null);
    if (appId === 'codex') {
      document.documentElement.classList.remove('codex-dream-skin');
      delete document.documentElement.dataset.dreamShell;
    }
    panel.style.display = 'none';
  };

  document.getElementById('${e.menuId}-host')?.remove();
  document.getElementById('${e.menuId}')?.remove();
  if (window.__dreamWorkOutsideClick) {
    document.removeEventListener('pointerdown', window.__dreamWorkOutsideClick, true);
    delete window.__dreamWorkOutsideClick;
  }

  const host = document.createElement('div');
  host.id = '${e.menuId}-host';
  host.style.cssText = "all:initial!important;position:fixed!important;right:16px!important;bottom:16px!important;z-index:2147483647!important;display:block!important;visibility:visible!important;opacity:1!important;pointer-events:auto!important;width:fit-content!important;height:fit-content!important;transform:none!important;filter:none!important;contain:none!important;isolation:isolate!important;";
  const mount = host.attachShadow({ mode: 'open' });

  const root = document.createElement('div');
  root.id = '${e.menuId}';
  root.style.cssText = "position:relative;display:flex;flex-direction:column;align-items:flex-end;font:500 13px/1.4 system-ui;user-select:none;color-scheme:light;pointer-events:auto;color:#17344f!important;";

  const button = document.createElement('button');
  button.type = 'button';
  button.title = 'Dream Work Theme';
  button.textContent = '◉';
  button.style.cssText = "margin-left:auto;width:36px;height:36px;border-radius:10px;border:1px solid rgba(0,0,0,.12);background:rgba(255,255,255,.92);backdrop-filter:blur(10px);box-shadow:0 3px 12px rgba(0,0,0,.2);cursor:pointer;padding:0;display:flex;align-items:center;justify-content:center;color:#17344f;font-size:18px;line-height:1;";

  /* 任务宠物（ZCode）：独立于换肤按钮的浮层精灵，GIF 随当前会话任务状态切换——
   * 等待确认(waiting) > 运行中(工具在跑：沿输入框上边框左右跑动，running-left/right/running 交替)
   * > 思考(模型在飞：review) > 任务失败(failed，8s) > 任务完成(jumping，5s) > 空闲
   * (idle/look-left-side/look-right-side 每 3-5s 交替，每 5 轮插一次 waving)。
   * 位置：底边对齐 .chat-composer-region 上边框（输入框上沿），跑动范围 = 输入框左右缘；
   * pointer-events:none 纯装饰不挡点击；输入框不在（设置页等）时隐藏。换肤按钮保持原样。
   * 状态来源 = 用量泵 payload（document 'dream-usage' 事件，实时任务状态 live）+ 本地 DOM
   * 信号（侧栏当前任务项"等待确认"标签，含 agent 提问；对话区确认卡兜底）。 */
  if (hasPet) {
    (function () {
      clearInterval(window.__dreamWorkPetTimer);   // 重注入：旧实例计时器停表
      document.getElementById('${e.menuId}-pet-host')?.remove();
      const PET_SRC_W = 192, PET_SRC_H = 208;   // 素材原始尺寸，按宠物 scale 缩放
      let PET_W = 96, PET_H = 104;
      const petHost = document.createElement('div');
      petHost.id = '${e.menuId}-pet-host';
      petHost.style.cssText = "all:initial!important;position:fixed!important;z-index:2147483640!important;display:block!important;pointer-events:none!important;width:fit-content!important;height:fit-content!important;contain:none!important;isolation:isolate!important;";
      const petMount = petHost.attachShadow({ mode: 'open' });
      const wrap = document.createElement('div');
      wrap.style.cssText = 'position:relative;line-height:0;';
      /* 落地阴影：静态椭圆（不依赖逐帧 alpha）——drop-shadow 滤镜会随 GIF 每帧轮廓重算，
       * 精灵一动影子就闪，已弃用 */
      const shadowEl = document.createElement('div');
      shadowEl.style.cssText = 'position:absolute;left:50%;bottom:1px;transform:translateX(-50%);width:58%;height:9px;border-radius:50%;background:radial-gradient(ellipse at center,rgba(0,0,0,.34) 0%,rgba(0,0,0,.16) 48%,transparent 74%);pointer-events:none;';
      const img = document.createElement('img');
      img.draggable = false;
      img.alt = '';
      img.style.cssText = 'position:relative;display:block;pointer-events:none;user-select:none;-webkit-user-select:none;';
      wrap.append(shadowEl, img);
      petMount.appendChild(wrap);
      document.documentElement.appendChild(petHost);
      const pos = { x: -1, y: 0 };
      let spanLeft = 0, spanRight = 0, edgeY = 0;
      let cur = '', target = null, pauseUntil = 0;
      /* 当前宠物：localStorage dreamPet.id（'none' = 不显示；空 = 默认第一只）。
       * 兼容旧开关 dreamPet.enabled='0' → 视为不显示。dream-pet 事件即时生效。 */
      const readPetSel = () => {
        try {
          const id = localStorage.getItem('dreamPet.id');
          if (id) return id;
          return localStorage.getItem('dreamPet.enabled') === '0' ? 'none' : '';
        } catch (e) { return ''; }
      };
      let activePet = null;
      const resolvePet = () => {
        const sel = readPetSel();
        if (sel === 'none') return null;
        for (let i = 0; i < pets.length; i++) if (pets[i].id === sel) return pets[i];
        return pets[0] || null;
      };
      const applyPet = () => {
        activePet = resolvePet();
        const sc = activePet && activePet.scale ? activePet.scale : 0.5;
        PET_W = Math.round(PET_SRC_W * sc);
        PET_H = Math.round(PET_SRC_H * sc);
        img.style.width = PET_W + 'px';
        img.style.height = PET_H + 'px';
        cur = '';   // 换宠物：状态键不变也要重挂新宠物的图
      };
      applyPet();
      /* 切换宠物：立即重挂新图——空闲轮换有最长 5s 节流，不重置 idleNextAt 会出现
       * "切了宠物要等好几秒才换" 的迟滞（cur='' 只保证下一次 setGif 会执行，
       * 但空闲分支要等轮换到点才会调 setGif） */
      document.addEventListener('dream-pet', () => { applyPet(); idleNextAt = 0; });
      let live = null, liveAt = 0;
      let idleNextAt = 0, idleIdx = 0, idleCount = 0, lastState = '';
      /* 回合结束的 DOM 边沿检测：停止生成按钮消失的那一刻立即进入完成态（不等泵推送，
       * 实测泵最快也要 1.5s）；若这段窗口内数据库随后报 failed（回合其实失败/被取消），
       * failed 判定优先于合成完成，宠物切到沮丧帧。切会话时复位，避免把上一个会话的
       * 完成带进新会话。 */
      let synthDoneUntil = 0, lastTurnActive = false, lastUseSid = '';
      /* 状态键 → 当前宠物的 GIF data URL；缺状态回退（跑步方向→running→idle，其余→idle） */
      const stateGif = (key) => {
        const s = activePet ? activePet.states : null;
        if (!s) return '';
        return s[key] || ((key === 'running-left' || key === 'running-right') ? (s.running || s.idle) : '') || s.idle || '';
      };
      const setGif = (name) => {
        const key = name === 'thinking' ? 'review' : name === 'done' ? 'jumping' : name;
        if (cur === key) return;
        cur = key;
        const url = stateGif(key);
        if (url) img.src = url;
        img.dataset.gif = key;   // 诊断/测试可读
      };
      const place = () => {
        /* petHost 的 all:initial!important 会把无 !important 的 left/top 一起重置，
         * 必须走 setProperty 带 important 才能生效 */
        petHost.style.setProperty('left', Math.round(pos.x) + 'px', 'important');
        petHost.style.setProperty('top', Math.round(pos.y) + 'px', 'important');
        img.dataset.petPos = Math.round(pos.x) + ',' + Math.round(pos.y);
      };
      /* 贴边定位：底边 = 输入框（.chat-composer-region）上边框，跑动范围 = 输入框左右缘。
       * 设置页等整页路由**不卸载会话 DOM、几何依旧有效**（工作区保活），必须叠加
       * checkVisibility（隐藏层同步返回 false）判定，否则宠物会跟着"保活"的输入框留在设置页。 */
      const trackEdge = () => {
        const region = document.querySelector('.chat-composer-region');
        if (!region) return false;
        try {
          if (typeof region.checkVisibility === 'function' &&
              !region.checkVisibility({ visibilityProperty: true, opacityProperty: true, contentVisibilityAuto: true })) return false;
        } catch (e) { }
        const r = region.getBoundingClientRect();
        if (r.width < 120 || r.height < 40) return false;
        edgeY = r.top - PET_H;
        spanLeft = r.left;
        spanRight = Math.max(r.left, r.right - PET_W);
        return true;
      };
      document.addEventListener('dream-usage', (e) => {
        const d = e && e.detail;
        if (!d) return;
        if (d.sid && lastUseSid && d.sid !== lastUseSid) synthDoneUntil = 0;   // 切会话：复位
        if (d.sid) lastUseSid = d.sid;
        live = d.live || null;
        liveAt = Date.now();
      });
      const domWaiting = () => {
        try {
          const li = document.querySelector('li[data-testid^=task-item-].bg-selected');
          if (li && li.textContent && li.textContent.indexOf('等待确认') >= 0) return true;
          const els = document.querySelectorAll('span, div, button');
          for (let i = 0; i < els.length; i++) {
            const el = els[i];
            if (el.children.length || (el.textContent || '').trim() !== '等待确认') continue;
            if (el.closest && el.closest('#sidebar')) continue;
            /* offsetParent 对 position:fixed 恒为 null，用 checkVisibility 判可见 */
            const vis = el.checkVisibility ? el.checkVisibility() : el.getClientRects().length > 0;
            if (vis) return true;
          }
        } catch (e) { }
        return false;
      };
      /* 回合进行中的 DOM 信号：输入框区域里的"停止生成"按钮（生成期间可见，回合结束隐藏）。
       * 数据库没有在飞模型请求的行（实测全库 0 条 running），"思考"只能由此判定：
       * 回合进行中且没有工具在跑 = 模型在思考/生成。 */
      const domTurnActive = () => {
        try {
          const region = document.querySelector('.chat-composer-region');
          if (!region) return false;
          const btns = region.querySelectorAll('button');
          for (let i = 0; i < btns.length; i++) {
            const b = btns[i];
            const label = (b.getAttribute('aria-label') || b.title || '').trim();
            if (!/停止|Stop/i.test(label)) continue;
            const vis = b.checkVisibility ? b.checkVisibility() : b.getClientRects().length > 0;
            if (vis) return true;
          }
        } catch (e) { }
        return false;
      };
      const pickState = (now, turnActive) => {
        if (domWaiting()) return 'waiting';
        if (live && now - liveAt < 150000) {
          if (live.state === 'waiting') return 'waiting';
          if (live.state === 'running') return 'running';   // 工具在跑（db 在飞行）
          if (live.state === 'failed' && now - live.at < 12000) return 'failed';
          if (live.state === 'done' && now - live.at < 8000) return 'done';
        }
        if (turnActive) return 'thinking';
        if (now < synthDoneUntil) return 'done';   // DOM 边沿：回合刚结束，立即跳跃
        return 'idle';
      };
      const tick = () => {
        if (!petHost.isConnected) return;   // 旧实例：宿主已被重注入替换
        try {
          if (!activePet) { petHost.style.setProperty('display', 'none', 'important'); return; }
          const now = Date.now();
          const turnActive = domTurnActive();
          if (lastTurnActive && !turnActive) synthDoneUntil = now + 8000;   // 回合刚结束
          lastTurnActive = turnActive;
          const state = pickState(now, turnActive);
          if (!trackEdge()) {
            petHost.style.setProperty('display', 'none', 'important');   // 输入框不在（设置页等）
            return;
          }
          petHost.style.setProperty('display', 'block', 'important');
          if (pos.x < 0) pos.x = spanRight;   // 首次：从输入框右端起
          if (pos.x < spanLeft) pos.x = spanLeft;
          if (pos.x > spanRight) pos.x = spanRight;
          pos.y = edgeY;
          if (state === 'running') {
            if (pauseUntil && now < pauseUntil) {
              setGif('running');
            } else if (target === null) {
              target = spanLeft + Math.random() * (spanRight - spanLeft);   // 沿上边框随机选一个落点
            } else {
              const dx = target - pos.x;
              if (Math.abs(dx) < 4) {
                target = null;
                pauseUntil = now + 500 + Math.random() * 1000;
                setGif('running');
              } else {
                pos.x += Math.min(Math.abs(dx), 14) * (dx > 0 ? 1 : -1);   // ~115px/s @120ms
                setGif(dx > 2 ? 'running-right' : dx < -2 ? 'running-left' : 'running');
              }
            }
          } else if (state === 'idle') {
            target = null; pauseUntil = 0;
            if (lastState !== 'idle') idleNextAt = 0;   // 从其它状态回空闲：立即换回空闲帧，不等轮换节流
            if (now >= idleNextAt) {
              idleNextAt = now + 3000 + Math.random() * 2000;
              const seq = ['idle', 'look-left-side', 'look-right-side'];
              setGif(idleCount > 0 && idleCount % 5 === 0 ? 'waving' : seq[idleIdx % 3]);
              idleIdx++;
              idleCount++;
            }
          } else {
            target = null; pauseUntil = 0;
            setGif(state);
          }
          lastState = state;
          place();
        } catch (e) { }
      };
      if (trackEdge()) pos.x = spanRight;
      pos.y = Math.max(0, edgeY);
      setGif('idle');
      place();
      window.__dreamWorkPetTimer = setInterval(tick, 120);
    })();
  }

  const panel = document.createElement('div');
  panel.style.cssText = "display:none;margin-bottom:8px;min-width:200px;padding:6px;border-radius:12px;border:1px solid rgba(0,0,0,.1);background:rgba(255,255,255,.96);backdrop-filter:blur(16px);box-shadow:0 10px 30px rgba(0,0,0,.18);color:#17344f!important;-webkit-text-fill-color:#17344f!important;";

  /* 分类：皮肤（8 款常用预设 + 自定义 + 还原）与宠物各为折叠组，点击分类标签展开/收起，
   * 展开态存 localStorage（dreamMenu.cat），重注入后保持。 */
  const skinBox = document.createElement('div');
  const petBox = document.createElement('div');
  const catState = (() => { try { return JSON.parse(localStorage.getItem('dreamMenu.cat') || '{}') || {}; } catch (e) { return {}; } })();
  const saveCat = () => { try { localStorage.setItem('dreamMenu.cat', JSON.stringify(catState)); } catch (e) { } };
  const catRow = (label, key, box) => {
    const item = document.createElement('div');
    item.style.cssText = "display:flex;align-items:center;gap:8px;padding:7px 10px;border-radius:8px;cursor:pointer;font-weight:700;color:#17344f!important;-webkit-text-fill-color:#17344f!important;";
    const caret = document.createElement('span');
    caret.style.cssText = "flex:none;width:12px;text-align:center;opacity:.65;font-size:11px;color:#17344f!important;-webkit-text-fill-color:#17344f!important;";
    const text = document.createElement('span');
    text.textContent = label;
    text.style.cssText = 'color:#17344f!important;-webkit-text-fill-color:#17344f!important;';
    item.append(caret, text);
    const sync = () => {
      const open = !!catState[key];
      caret.textContent = open ? '▾' : '▸';
      box.style.display = open ? 'block' : 'none';
    };
    item.addEventListener('mouseenter', () => { item.style.background = 'rgba(0,0,0,.05)'; });
    item.addEventListener('mouseleave', () => { item.style.background = 'transparent'; });
    item.addEventListener('click', () => { catState[key] = !catState[key]; saveCat(); sync(); });
    sync();
    return item;
  };

  const row = (label, dotColor, onPick, before, container) => {
    const item = document.createElement('div');
    item.style.cssText = "display:flex;align-items:center;gap:8px;padding:7px 10px;border-radius:8px;cursor:pointer;color:#17344f!important;-webkit-text-fill-color:#17344f!important;";
    const dot = document.createElement('span');
    dot.style.cssText = "width:10px;height:10px;border-radius:50%;flex:none;background:" + dotColor + ";";
    const text = document.createElement('span');
    text.textContent = label;
    text.style.cssText = 'color:#17344f!important;-webkit-text-fill-color:#17344f!important;';
    item.append(dot, text);
    item.addEventListener('mouseenter', () => { if (item.style.fontWeight !== '700') item.style.background = 'rgba(0,0,0,.05)'; });
    item.addEventListener('mouseleave', () => { item.style.background = 'transparent'; });
    item.addEventListener('click', () => onPick(item));
    const host = container || skinBox;
    if (before) host.insertBefore(item, before); else host.appendChild(item);
    return item;
  };

  panel.append(catRow('皮肤', 'skin', skinBox), skinBox);
  if (hasPet) {
    panel.append(catRow('宠物', 'pet', petBox), petBox);
    /* 宠物选择：一宠物一行 + 「不显示宠物」，✓ = 当前选中（dreamPet.id 持久化；
     * dream-pet 事件让宠物脚本即时切换/隐藏） */
    const petSel = () => {
      try {
        const id = localStorage.getItem('dreamPet.id');
        if (id) return id;
        return localStorage.getItem('dreamPet.enabled') === '0' ? 'none' : pets[0].id;
      } catch (e) { return pets[0].id; }
    };
    const petRows = [];
    const syncPetRows = () => {
      const sel = petSel();
      petRows.forEach(({ item, id }) => {
        const on = id === sel;
        item.style.opacity = on ? '1' : '.5';
        const mark = item.querySelector('.dream-pet-mark');
        if (mark) mark.textContent = on ? '✓' : '';
      });
    };
    const addPetRow = (id, label, dot) => {
      const item = row(label, dot, () => {
        try { localStorage.setItem('dreamPet.id', id); } catch (e) { }
        document.dispatchEvent(new CustomEvent('dream-pet'));
        syncPetRows();
      }, null, petBox);
      const mark = document.createElement('span');
      mark.className = 'dream-pet-mark';
      mark.style.cssText = 'margin-left:auto;flex:none;font-weight:700;color:#2a9d68!important;-webkit-text-fill-color:#2a9d68!important;';
      item.appendChild(mark);
      petRows.push({ item, id });
    };
    addPetRow('none', '不显示宠物', 'rgba(0,0,0,.24)');
    for (const petDef of pets) addPetRow(petDef.id, petDef.name, '#e2557a');
    syncPetRows();
  }

  for (const theme of themes) {
    const item = row(theme.name, theme.accent || '#24c9d7', () => {
      applyTheme(theme.id);
      void recordPresetUsage(theme.id);
      panel.style.display = 'none';
    });
    item.className = 'dream-theme-row';
    item.dataset.themeId = theme.id;
  }

  // 快捷键：Ctrl+Alt+1~8 直切前 8 套预设皮肤；行尾数字角标 = 键位提示。
  // 输入控件聚焦时不劫持；重注入先摘除上一轮监听（同 __dreamWorkOutsideClick 模式）。
  if (window.__dreamWorkHotkeys) {
    document.removeEventListener('keydown', window.__dreamWorkHotkeys, true);
    delete window.__dreamWorkHotkeys;
  }
  const hotkeyRows = Array.prototype.slice.call(panel.querySelectorAll('.dream-theme-row'), 0, 8);
  hotkeyRows.forEach((item, index) => {
    const chip = document.createElement('span');
    chip.textContent = String(index + 1);
    chip.title = 'Ctrl+Alt+' + (index + 1) + ' 快速切换';
    chip.style.cssText = 'margin-left:auto;flex:none;min-width:16px;height:16px;padding:0 4px;border-radius:5px;border:1px solid rgba(0,0,0,.12);display:inline-flex;align-items:center;justify-content:center;font:600 10px/1 system-ui;color:rgba(23,52,79,.62)!important;-webkit-text-fill-color:rgba(23,52,79,.62)!important;background:rgba(0,0,0,.04);';
    item.appendChild(chip);
  });
  window.__dreamWorkHotkeys = (event) => {
    if (!event.ctrlKey || !event.altKey || event.shiftKey || event.metaKey) return;
    const target = event.target;
    if (target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName || ''))) return;
    const code = String(event.code || '');
    const digitMatch = code.match(/^Digit([1-8])$/) || code.match(/^Numpad([1-8])$/);
    const index = digitMatch ? Number(digitMatch[1]) - 1 : -1;
    if (index < 0 || index >= Math.min(8, themes.length)) return;
    event.preventDefault();
    event.stopPropagation();
    const theme = themes[index];
    applyTheme(theme.id);
    void recordPresetUsage(theme.id);
    panel.style.display = 'none';
  };
  document.addEventListener('keydown', window.__dreamWorkHotkeys, true);

  /* __DREAM_PAGE_CONTRAST_START__（与 electron/manager/contrast.ts 保持同逻辑） */
  const pageHexToRgb = (value) => {
    const m = /^#([0-9a-f]{6})$/i.exec(value || '');
    if (!m) return [255, 255, 255];
    const v = parseInt(m[1], 16);
    return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
  };
  const pageRgbToHex = (rgb) => '#' + rgb.map((value) => Math.max(0, Math.min(255, Math.round(value))).toString(16).padStart(2, '0')).join('');
  const pageMixRgb = (a, b, t) => a.map((value, index) => value + (b[index] - value) * t);
  const pageRgbToHsl = (rgb) => {
    const r = rgb[0] / 255, g = rgb[1] / 255, b = rgb[2] / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const l = (max + min) / 2;
    if (max === min) return [0, 0, l];
    const d = max - min;
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    let h;
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    return [h / 6, s, l];
  };
  const pageHslToRgb = (h, s, l) => {
    if (s <= 0) { const v = l * 255; return [v, v, v]; }
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    // 保持浮点精度，只在 pageRgbToHex 输出时取整一次
    return [hue2rgb(p, q, h + 1 / 3) * 255, hue2rgb(p, q, h) * 255, hue2rgb(p, q, h - 1 / 3) * 255];
  };
  const pageSrgbToLinear = (c) => { const x = c / 255; return x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); };
  const pageLuminance = (rgb) => 0.2126 * pageSrgbToLinear(rgb[0]) + 0.7152 * pageSrgbToLinear(rgb[1]) + 0.0722 * pageSrgbToLinear(rgb[2]);
  const pageContrast = (a, b) => {
    const la = pageLuminance(a), lb = pageLuminance(b);
    return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
  };
  // 色相保持：只调明度达标，避免推向无彩色黑白；方向按“远离背景亮度”选择；
  // 不可能时才退回黑白混合
  const pageEnsureOne = (fg, bg, target) => {
    if (pageContrast(fg, bg) >= target) return fg;
    const aim = target + Math.max(0.02, target * 0.02);
    const lfg = pageLuminance(fg), lbg = pageLuminance(bg);
    const darken = lfg < lbg || (lfg === lbg && lbg > 0.475);
    const [h, s, l] = pageRgbToHsl(fg);
    if (s >= 0.02) {
      let lo = darken ? 0 : l, hi = darken ? l : 1;
      for (let i = 0; i < 14; i++) {
        const mid = (lo + hi) / 2;
        if (pageContrast(pageHslToRgb(h, s, mid), bg) >= aim) {
          if (darken) lo = mid; else hi = mid;
        } else {
          if (darken) hi = mid; else lo = mid;
        }
      }
      const candidate = pageHslToRgb(h, s, darken ? lo : hi);
      if (pageContrast(candidate, bg) >= target) return candidate;
    }
    const toward = darken ? [0, 0, 0] : [255, 255, 255];
    let lo = 0, hi = 1;
    for (let i = 0; i < 12; i++) {
      const mid = (lo + hi) / 2;
      if (pageContrast(pageMixRgb(fg, toward, mid), bg) >= aim) hi = mid;
      else lo = mid;
    }
    return pageMixRgb(fg, toward, hi);
  };
  const pageEnsureAll = (fg, backgrounds, target) => {
    const minContrast = (color) => Math.min(...backgrounds.map((bg) => pageContrast(color, bg)));
    let current = fg;
    for (let round = 0; round < 4; round++) {
      if (minContrast(current) >= target) return current;
      const before = minContrast(current);
      let worst = null, worstRatio = Infinity;
      for (const bg of backgrounds) {
        const ratio = pageContrast(current, bg);
        if (ratio < worstRatio) { worstRatio = ratio; worst = bg; }
      }
      const boosted = pageEnsureOne(current, worst, target);
      if (minContrast(boosted) <= before + 1e-9) break;
      current = boosted;
    }
    if (minContrast(current) >= target) return current;
    const [h, s] = pageRgbToHsl(fg);
    const candidates = [fg, current];
    for (const l of [0.02, 0.06, 0.12, 0.22, 0.78, 0.88, 0.95, 0.99]) {
      candidates.push(pageHslToRgb(h, s, l));
    }
    let bestColor = current, bestRatio = minContrast(current);
    for (const candidate of candidates) {
      const ratio = minContrast(candidate);
      if (ratio > bestRatio + 1e-9) { bestRatio = ratio; bestColor = candidate; }
    }
    return bestColor;
  };
  // 替换出真实调色板后再做对比度提升：主文字 4.5:1、次级 3:1，
  // 背景用 surface 与图片平均色按各表面透明度合成（colors.average 由
  // extractPalette 计算；旧存档没有该字段时退化为纯 surface）。
  const deriveTextColors = (colors) => {
    const surface = pageHexToRgb(colors.surface);
    const hero = pageHexToRgb(colors.average || colors.surface);
    const backgrounds = surfaceAlphas.map((alpha) => pageMixRgb(hero, surface, alpha));
    const text = pageEnsureAll(pageHexToRgb(colors.text), backgrounds, 4.5);
    return {
      text: pageRgbToHex(text),
      textSubtle: pageRgbToHex(pageEnsureAll(pageMixRgb(surface, text, 0.88), backgrounds, 3)),
      textSubtlest: pageRgbToHex(pageEnsureAll(pageMixRgb(surface, text, 0.80), backgrounds, 3)),
      textSecondary: pageRgbToHex(pageEnsureAll(pageMixRgb(surface, text, 0.72), backgrounds, 3)),
    };
  };
  /* __DREAM_PAGE_CONTRAST_END__ */
  const buildCustomCss = (dataUrl, colors, customId) => {
    const derived = deriveTextColors(colors);
    // 极端壁纸下兜底色可能恰好等于某个哨兵十六进制串，替换前轻微提亮避开，
    // 防止后续 split/join 把它当成哨兵再次替换
    const sentinelHexes = [sentinels.accent, sentinels.secondary, sentinels.surface, sentinels.text, sentinels.textSubtle, sentinels.textSubtlest, sentinels.textSecondary];
    const dodgeSentinel = (hex) => sentinelHexes.includes(hex)
      ? pageRgbToHex(pageMixRgb(pageHexToRgb(hex), [255, 255, 255], 0.05))
      : hex;
    return cssTemplate
      .split(sentinels.hero).join(dataUrl)
      .split(sentinels.accent).join(colors.accent)
      .split(sentinels.secondary).join(colors.secondary)
      .split(sentinels.surface).join(colors.surface)
      .split(sentinels.text).join(dodgeSentinel(derived.text))
      .split(sentinels.textSubtle).join(dodgeSentinel(derived.textSubtle))
      .split(sentinels.textSubtlest).join(dodgeSentinel(derived.textSubtlest))
      .split(sentinels.textSecondary).join(dodgeSentinel(derived.textSecondary))
      .split(sentinels.id).join(customId);
  };
  const hex = (r, g, b) => '#' + [r, g, b].map((value) => Math.max(0, Math.min(255, Math.round(value))).toString(16).padStart(2, '0')).join('');
  const mix = (a, b, amount) => a.map((value, index) => value + (b[index] - value) * amount);
  const extractPalette = (canvas) => {
    const context = canvas.getContext('2d');
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    // 24 个色相桶 + 圆周均值：比旧版 6 桶细一倍，色相均值跨 0°/360° 不跳变，
    // 桶内平均色相不再是"第一个像素"的色相
    const HUE_BUCKETS = 24;
    const buckets = new Array(HUE_BUCKETS).fill(null);
    let luminanceSum = 0;
    let rSum = 0, gSum = 0, bSum = 0;
    let count = 0;
    for (let index = 0; index < pixels.length; index += 4) {
      if (pixels[index + 3] < 128) continue; // 透明像素不参与统计，避免黑边污染
      const r = pixels[index], g = pixels[index + 1], b = pixels[index + 2];
      const max = Math.max(r, g, b), min = Math.min(r, g, b);
      const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      luminanceSum += luminance;
      rSum += r;
      gSum += g;
      bSum += b;
      count += 1;
      const saturation = max === 0 ? 0 : (max - min) / max;
      // 无彩/过曝/死黑的像素不参与色相投票
      if (saturation < 0.14 || luminance < 20 || luminance > 248) continue;
      const delta = max - min || 1;
      const hue = max === r ? (g - b) / delta + (g < b ? 6 : 0) : max === g ? (b - r) / delta + 2 : (r - g) / delta + 4;
      const bucket = Math.min(HUE_BUCKETS - 1, Math.floor(hue * HUE_BUCKETS / 6));
      // 频次 × 彩度²：既看"多"也看"艳"，小面积高彩点缀不再碾压大面积主色
      const weight = saturation * saturation;
      let entry = buckets[bucket];
      if (!entry) {
        entry = { weight: 0, r: 0, g: 0, b: 0, hueX: 0, hueY: 0 };
        buckets[bucket] = entry;
      }
      const angle = hue * (Math.PI / 3);
      entry.weight += weight;
      entry.r += r * weight;
      entry.g += g * weight;
      entry.b += b * weight;
      entry.hueX += Math.cos(angle) * weight;
      entry.hueY += Math.sin(angle) * weight;
    }
    const averageLuminance = count ? luminanceSum / count : 128;
    const light = averageLuminance > 128;
    const ranked = [];
    for (const entry of buckets) {
      if (!entry) continue;
      let hueDeg = Math.atan2(entry.hueY, entry.hueX) * 180 / Math.PI;
      if (hueDeg < 0) hueDeg += 360;
      ranked.push({ rgb: [entry.r / entry.weight, entry.g / entry.weight, entry.b / entry.weight], hue: hueDeg, weight: entry.weight });
    }
    ranked.sort((left, right) => right.weight - left.weight);
    const accent = ranked.length > 0 ? ranked[0].rgb : [36, 201, 215];
    // secondary：取与 accent 色相距离 ≥28° 且权重足够（≥accent 的 18% 且 ≥
    // 全彩权重的 6%）的最大色块；都不达标就由 accent 旋转 +42° 调和出辅色，
    // 不再随机向白混合成灰粉
    const hueDistance = (a, b) => { const d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; };
    let secondary = null;
    if (ranked.length > 0) {
      const totalWeight = ranked.reduce((sum, entry) => sum + entry.weight, 0);
      for (let index = 1; index < ranked.length; index++) {
        const entry = ranked[index];
        if (hueDistance(entry.hue, ranked[0].hue) < 28) continue;
        if (entry.weight < ranked[0].weight * 0.18 || entry.weight < totalWeight * 0.06) continue;
        secondary = entry.rgb;
        break;
      }
    }
    if (!secondary) {
      const accentHsl = pageRgbToHsl(accent);
      const secLight = Math.min(0.85, Math.max(0.15, light ? accentHsl[2] + 0.2 : accentHsl[2] - 0.15));
      secondary = pageHslToRgb((accentHsl[0] + 42 / 360) % 1, Math.min(1, accentHsl[1] * 0.9 + 0.06), secLight);
    }
    // average：整图平均色（不透明像素），供 deriveTextColors 与 surface 合成实际背景
    return {
      accent: hex(...accent),
      secondary: hex(...secondary),
      surface: hex(...(light ? mix(accent, [252, 252, 255], 0.92) : mix(accent, [12, 12, 18], 0.86))),
      text: hex(...(light ? mix(accent, [16, 24, 40], 0.82) : mix(accent, [244, 246, 252], 0.85))),
      average: hex(rSum / (count || 1), gSum / (count || 1), bSum / (count || 1)),
    };
  };
  const MAX_CUSTOM = 5;
  const customRows = new Map();
  const loadCustoms = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(customStorageKey) || '[]');
      return Array.isArray(saved) ? saved.filter((theme) => theme && theme.dataUrl && theme.colors).slice(0, MAX_CUSTOM) : [];
    } catch { return []; }
  };
  const writeLocalCustoms = (saved) => {
    try { localStorage.setItem(customStorageKey, JSON.stringify(saved.slice(0, MAX_CUSTOM))); }
    catch (error) { console.warn('Dream Theme: 自定义图片本地缓存失败', error); }
  };
  const syncSharedCustoms = (saved) => fetch(sharedCustomThemeService.endpoint, {
    method: 'PUT',
    headers: { Authorization: 'Bearer ' + sharedCustomThemeService.token, 'Content-Type': 'application/json' },
    body: JSON.stringify(saved.slice(0, MAX_CUSTOM)),
  }).then((response) => {
    if (!response.ok) throw new Error('共享图片同步失败: HTTP ' + response.status);
    return response.json();
  });
  const saveCustoms = (saved) => {
    const limited = saved.slice(0, MAX_CUSTOM);
    writeLocalCustoms(limited);
    return syncSharedCustoms(limited).catch((error) => {
      console.warn('Dream Theme: 共享图片同步失败', error);
      return limited;
    });
  };
  const localCustomThemes = loadCustoms();
  const initialCustomThemes = sharedCustomThemes.length > 0 ? sharedCustomThemes : localCustomThemes;
  writeLocalCustoms(initialCustomThemes);
  if (sharedCustomThemes.length === 0 && localCustomThemes.length > 0) void saveCustoms(localCustomThemes);
  const applyCustomTheme = (slot) => {
    window.__dreamWorkThemeStyle.textContent = materializeCss(buildCustomCss(slot.dataUrl, slot.colors, slot.id), slot.id);
    document.documentElement.dataset.dreamTheme = slot.id;
    if (appId !== 'hana-agent') applyMode(slot.colors.surface);
    if (appId === 'zcode') applyVideoLayer(null);
    if (appId === 'codex') document.documentElement.classList.add('codex-dream-skin');
    ensureCustomRow(slot);
  };
  const deleteCustom = async (slotId) => {
    const saved = loadCustoms();
    const index = saved.findIndex((theme) => theme.id === slotId);
    if (index < 0) return;
    if (document.documentElement.dataset.dreamTheme === slotId) restoreNative();
    saved.splice(index, 1);
    await saveCustoms(saved);
    customRows.get(slotId)?.remove();
    customRows.delete(slotId);
  };
  const ensureCustomRow = (slot) => {
    const existing = customRows.get(slot.id);
    if (existing) {
      existing.querySelector('span + span').textContent = slot.name;
      existing.firstChild.style.background = slot.colors.accent;
      return;
    }
    const item = row(slot.name, slot.colors.accent, () => {
      const current = loadCustoms().find((theme) => theme.id === slot.id) || slot;
      applyCustomTheme(current);
      panel.style.display = 'none';
    }, uploadRow);
    const text = item.querySelector('span + span');
    text.style.cssText = 'flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;';
    const remove = document.createElement('span');
    remove.textContent = '×';
    remove.title = '删除这张自定义图片';
    remove.style.cssText = 'flex:none;width:18px;height:18px;line-height:18px;text-align:center;border-radius:50%;color:rgba(0,0,0,.45);font-size:14px;';
    remove.addEventListener('click', (event) => { event.stopPropagation(); deleteCustom(slot.id); });
    item.appendChild(remove);
    customRows.set(slot.id, item);
  };
  const importFromDataUrl = (dataUrl, name) => new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = async () => {
      const scale = Math.min(1, 1600 / image.width);
      const full = document.createElement('canvas');
      full.width = Math.round(image.width * scale);
      full.height = Math.round(image.height * scale);
      full.getContext('2d').drawImage(image, 0, 0, full.width, full.height);
      const sample = document.createElement('canvas');
      // 64px 采样：48 → 64 提升色相统计稳定性，开销仍可忽略（~4K 像素单趟）
      sample.width = 64;
      sample.height = Math.max(1, Math.round(64 * image.height / image.width));
      sample.getContext('2d').drawImage(image, 0, 0, sample.width, sample.height);
      const colors = extractPalette(sample);
      const compressed = full.toDataURL('image/webp', 0.8);
      const saved = loadCustoms();
      let slot;
      if (saved.length < MAX_CUSTOM) {
        slot = { id: 'custom-codex-' + Date.now().toString(36), name: name || '我的图片', dataUrl: compressed, colors };
        saved.push(slot);
      } else {
        slot = { id: saved[0].id, name: name || '我的图片', dataUrl: compressed, colors };
        saved[0] = slot;
      }
      await saveCustoms(saved);
      applyCustomTheme(slot);
      resolve(colors);
    };
    image.onerror = () => reject(new Error('图片读取失败'));
    image.src = dataUrl;
  });
  const picker = document.createElement('input');
  picker.type = 'file';
  picker.accept = 'image/png,image/jpeg,image/webp';
  picker.style.display = 'none';
  picker.addEventListener('change', () => {
    const file = picker.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => importFromDataUrl(reader.result, file.name.replace(/\\.[a-z0-9]+$/i, ''));
    reader.readAsDataURL(file);
    picker.value = '';
    panel.style.display = 'none';
  });
  const uploadRow = row('＋ 自定义图片', 'rgba(36,201,215,.9)', () => picker.click());
  uploadRow.style.borderTop = '1px solid rgba(0,0,0,.08)';
  /* 「还原主题」不进皮肤分类：常驻面板顶层底部，随时可点 */
  const native = row('还原主题', 'rgba(0,0,0,.24)', () => restoreNative(), null, panel);
  native.style.borderTop = '1px solid rgba(0,0,0,.08)';
  initialCustomThemes.forEach(ensureCustomRow);
  fetch(sharedCustomThemeService.endpoint, {
    headers: { Authorization: 'Bearer ' + sharedCustomThemeService.token },
  }).then((response) => response.ok ? response.json() : Promise.reject(new Error('HTTP ' + response.status)))
    .then((latest) => {
      if (!Array.isArray(latest)) return;
      for (const slotId of [...customRows.keys()]) {
        if (!latest.some((item) => item.id === slotId)) {
          customRows.get(slotId)?.remove();
          customRows.delete(slotId);
        }
      }
      writeLocalCustoms(latest);
      latest.forEach(ensureCustomRow);
    }).catch((error) => console.warn('Dream Theme: 共享图片读取失败', error));

  button.addEventListener('click', () => {
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
  });

  const closeOnOutsideClick = (event) => {
    if (panel.style.display === 'none') return;
    const path = event.composedPath?.() || [];
    if (!path.includes(host)) panel.style.display = 'none';
  };
  if (window.__dreamWorkOutsideClick) {
    document.removeEventListener('pointerdown', window.__dreamWorkOutsideClick, true);
  }
  window.__dreamWorkOutsideClick = closeOnOutsideClick;
  document.addEventListener('pointerdown', closeOnOutsideClick, true);

  root.append(panel, button, picker);
  mount.appendChild(root);
  document.documentElement.appendChild(host);

  clearInterval(window.__dreamWorkMenuGuard);
  const ensureInjectedNodes = () => {
    if (!window.__dreamWorkThemeStyle.isConnected) document.head.appendChild(window.__dreamWorkThemeStyle);
    if (!host.isConnected) document.documentElement.appendChild(host);
  };
  window.__dreamWorkMenuGuard = setInterval(() => {
    ensureInjectedNodes();
  }, 250);
  applyTheme(currentThemeId);
  ensureInjectedNodes();
})()`}function Gr(e){if(!/^[a-z0-9._-]+$/i.test(e.id||""))throw new Error(`Invalid shortcut id: ${e.id}`);if(!/^[a-z0-9-]+$/i.test(e.appId||""))throw new Error(`Invalid appId: ${e.appId}`);if(!/^[a-z0-9._-]+$/i.test(e.themeId||""))throw new Error(`Invalid themeId: ${e.themeId}`)}function ct(e){const n=e.replace(/[^\p{L}\p{N} ._-]/gu,"").trim();return n.length>0?n.slice(0,80):"DreamWorkTheme"}async function Jr(e){try{return Gr(e),N.platform()==="win32"?Kr(e):N.platform()==="darwin"?Zr(e):N.platform()==="linux"?Xr(e):{success:!1,error:`Unsupported platform: ${N.platform()}`}}catch(n){return{success:!1,error:n.message}}}function Kr(e){const n=d.join(N.homedir(),"Desktop"),t=d.join(n,`${ct(e.label)}.lnk`),r=process.execPath,a=d.dirname(r),o=`
    $WshShell = New-Object -comObject WScript.Shell
    $Shortcut = $WshShell.CreateShortcut("${t.replace(/\\/g,"\\\\")}")
    $Shortcut.TargetPath = "${r.replace(/\\/g,"\\\\")}"
    $Shortcut.Arguments = "--launch=${e.appId}:${e.themeId}"
    $Shortcut.WorkingDirectory = "${a.replace(/\\/g,"\\\\")}"
    $Shortcut.Save()
  `;return new Promise(s=>{require("child_process").execFile("powershell.exe",["-NoProfile","-Command",o],c=>{s(c?{success:!1,error:c.message}:{success:!0,path:t})})})}function Zr(e){const n=d.join(N.homedir(),"Desktop"),t=d.join(n,`${ct(e.label)}.app`),a=`
    tell application "Terminal"
      do script "'${process.execPath}' --launch=${e.appId}:${e.themeId}"
    end tell
  `,o=d.join(n,`${e.id}.scpt`);return f.writeFileSync(o,a),new Promise(s=>{require("child_process").execFile("osacompile",["-o",t,o],c=>{f.unlinkSync(o),s(c?{success:!1,error:c.message}:{success:!0,path:t})})})}async function Xr(e){const n=d.join(N.homedir(),".local","share","applications");f.existsSync(n)||f.mkdirSync(n,{recursive:!0});const t=d.join(n,`${e.id}.desktop`),r=process.execPath,a=`[Desktop Entry]
Type=Application
Name=${ct(e.label)}
Exec="${r}" --launch=${e.appId}:${e.themeId}
Icon=${e.icon||"utilities-terminal"}
Terminal=false
Categories=Utility;
`;return f.writeFileSync(t,a),f.chmodSync(t,493),{success:!0,path:t}}const Yr=nt.promisify(Ue.execFile),Qr="https://api.dreamskin.cc",Xt=`${Qr}/v1/themes`,Yt=32*1024*1024,De=6;let Xe=0;const ea=["workbuddy","codex","trae-work","qoder-work","catpaw","zcode","qwen-office","hana-agent"];async function ta(){const e=Xe,n=await na(e),t=n.items;Xe=e+t.length>=n.total?0:e+De;const r=Ut(),a={checked:t.length,imported:0,skipped:0,offset:e,page:Math.floor(e/De)+1,total:n.total,nextOffset:Xe,failed:[]};for(const o of t){const s=ia(o.themeId);if(!o.applyCompatible||Ot(s)){a.skipped++;continue}try{await ra(o,r,s)?a.imported++:a.skipped++}catch(c){a.failed.push({id:o.id,name:o.name,error:c.message})}}return a}async function na(e){const n=`${Xt}?limit=${De}&offset=${e}&sort=recent`,t=await fetch(n,{signal:AbortSignal.timeout(3e4),redirect:"error"});if(!t.ok)throw new Error(`Theme list request failed: HTTP ${t.status}`);const r=await t.json();if(!Array.isArray(r.items)||r.items.length>De||!Number.isInteger(r.total)||r.total<0)throw new Error("Theme list response is invalid");return{items:r.items,total:r.total}}async function ra(e,n,t){sa(e);const r=f.mkdtempSync(d.join(N.tmpdir(),"dream-work-theme-")),a=d.join(r,"theme.zip"),o=d.join(r,"extract"),s=d.join(n,`.updating-${t}-${process.pid}`);try{f.mkdirSync(o);const c=`${Xt}/${e.id}/download`,i=await fetch(c,{signal:AbortSignal.timeout(12e4),redirect:"error"});if(!i.ok)throw new Error(`Theme download failed: HTTP ${i.status}`);const l=Buffer.from(await i.arrayBuffer());if(l.length!==e.packageBytes)throw new Error(`Downloaded size mismatch: expected ${e.packageBytes}, got ${l.length}`);if(l.length>Yt)throw new Error("Theme package exceeds 32 MiB");if(rt.createHash("sha256").update(l).digest("hex")!==e.packageSha256)throw new Error("Downloaded SHA-256 does not match metadata");f.writeFileSync(a,l,{flag:"wx"}),await aa(a,o);const p=oa(o),h=JSON.parse(f.readFileSync(d.join(p,"theme.json"),"utf8")),g=h.image;if(typeof g!="string"||d.basename(g)!==g||!/\.(png|jpe?g|webp)$/i.test(g))throw new Error("Theme image name is invalid");const b=d.join(p,g),w=d.join(p,"theme.css");if(!f.existsSync(b)||!f.statSync(b).isFile())throw new Error("Theme image is missing");if(!f.existsSync(w)||!f.statSync(w).isFile())throw new Error("theme.css is missing");const _=ca(h,e,t,`hero${d.extname(g).toLowerCase()}`);return Xn(_.name,_.author,b)?!1:(f.mkdirSync(s),f.copyFileSync(b,d.join(s,_.hero)),f.copyFileSync(w,d.join(s,"theme.css")),f.writeFileSync(d.join(s,"theme.json"),`${JSON.stringify(_,null,2)}
`),f.renameSync(s,d.join(n,t)),!0)}finally{f.rmSync(s,{recursive:!0,force:!0}),f.rmSync(r,{recursive:!0,force:!0})}}async function aa(e,n){const{path7za:t}=require("7zip-bin");await Yr(t,["x",e,`-o${n}`,"-y"],{windowsHide:!0,timeout:12e4})}function oa(e){const t=[e,...f.readdirSync(e,{withFileTypes:!0}).filter(r=>r.isDirectory()).map(r=>d.join(e,r.name))].filter(r=>f.existsSync(d.join(r,"theme.json"))&&f.existsSync(d.join(r,"theme.css")));if(t.length!==1)throw new Error("Theme ZIP must contain one theme root");return t[0]}function sa(e){if(!/^ver_[a-z0-9]{8,64}$/.test(e.id))throw new Error("Theme version ID is invalid");if(!Number.isInteger(e.packageBytes)||e.packageBytes<1||e.packageBytes>Yt)throw new Error("Theme package size is invalid");if(!/^[a-f0-9]{64}$/.test(e.packageSha256))throw new Error("Theme package SHA-256 is invalid")}function ia(e){return String(e).toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").replace(/-+/g,"-")||"community-theme"}function ca(e,n,t,r){const a=e.appearance==="dark"?"dark":"light",o=a==="dark"?"#10141c":"#f4f7fa",s=e.colors||{};return{schemaVersion:1,id:t,name:String(e.name||n.name||t).trim(),author:n.authorDisplayName||"DreamSkin Community",hero:r,colors:{accent:pe(s.accent,"#4f8cff",o),secondary:pe(s.secondary||s.accentAlt,"#7ba7d8",o),surface:pe(s.panelAlt||s.panel||s.background,o,o),text:pe(s.text,a==="dark"?"#eef2f7":"#1f2937",o)},copy:null,apps:Object.fromEntries(ea.map(c=>[c,{compat:!0}]))}}function pe(e,n,t){if(typeof e!="string")return n;const r=e.trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i);if(r){let i=r[1];return i.length===3&&(i=i.split("").map(l=>l+l).join("")),`#${i.slice(0,6).toLowerCase()}`}const a=e.trim().match(/^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*(0|1|0?\.\d+))?\s*\)$/i);if(!a)return n;const o=a[4]===void 0?1:Number(a[4]),s=pe(t,n,n).slice(1).match(/../g).map(i=>parseInt(i,16));return`#${[1,2,3].map(i=>Math.round(Number(a[i])*o+s[i-1]*(1-o))).map(i=>i.toString(16).padStart(2,"0")).join("")}`}let fe=null;A.protocol.registerSchemesAsPrivileged([{scheme:"theme-asset",privileges:{standard:!0,secure:!0,supportFetchAPI:!0,stream:!0}}]);function Qt(){fe=new A.BrowserWindow({width:1200,height:800,webPreferences:{preload:d.join(__dirname,"preload.js"),contextIsolation:!0,nodeIntegration:!1}}),process.env.VITE_DEV_SERVER_URL?fe.loadURL(process.env.VITE_DEV_SERVER_URL):fe.loadFile(d.join(__dirname,"../renderer/dist/index.html"))}A.app.whenReady().then(()=>{A.protocol.handle("theme-asset",e=>{const n=decodeURIComponent(new URL(e.url).pathname.replace(/^\//,"")),t=Jn(n);return t?new Response(f.readFileSync(t),{headers:{"Content-Type":la(t),"Cache-Control":"public, max-age=3600"}}):new Response("Theme asset not found",{status:404})}),Qt()});function la(e){const n=d.extname(e).toLowerCase();return n===".jpg"||n===".jpeg"?"image/jpeg":n===".webp"?"image/webp":"image/png"}A.app.on("window-all-closed",()=>{process.platform!=="darwin"&&A.app.quit()});A.app.on("activate",()=>{A.BrowserWindow.getAllWindows().length===0&&Qt()});const Et=process.argv.find(e=>e.startsWith("--launch="));if(Et){const[,e]=Et.split("="),[n,t]=e.split(":");n&&t&&(console.log(`[main] Received launch args: ${n}:${t}`),setTimeout(async()=>{try{const r=await Rt(n,t);r.success?(console.log(`[main] Launched ${n} with theme ${t} on port ${r.port}`),setTimeout(async()=>{try{console.log(`[main] Starting theme injection for ${n}:${t} on port ${r.port}`);const a=await Jt(n,t,r.port);console.log("[main] Injection result:",a)}catch(a){console.error("[main] Failed to inject theme:",a)}},3e3)):console.error(`[main] Failed to launch ${n}: ${r.error}`)}catch(r){console.error("[main] Launch error:",r)}},1e3))}A.ipcMain.handle("discover-apps",async()=>Sn());A.ipcMain.handle("list-app-path-configurations",()=>hn());A.ipcMain.handle("choose-custom-app-path",async(e,n)=>{if(process.platform!=="win32")return{success:!1,error:"自定义应用路径目前仅支持 Windows。"};const t=W(n);if(!t)return{success:!1,error:`Unknown app: ${n}`};const r={title:`选择 ${t.name} 的可执行文件`,buttonLabel:"选择此文件",properties:["openFile"],filters:[{name:`${t.name} 可执行文件`,extensions:["exe"]}]},a=fe?await A.dialog.showOpenDialog(fe,r):await A.dialog.showOpenDialog(r);if(a.canceled||a.filePaths.length===0)return{success:!1,cancelled:!0};try{return{success:!0,path:fn(n,a.filePaths[0])}}catch(o){return{success:!1,error:(o==null?void 0:o.message)||String(o)}}});A.ipcMain.handle("clear-custom-app-path",(e,n)=>{try{return bn(n),{success:!0}}catch(t){return{success:!1,error:(t==null?void 0:t.message)||String(t)}}});A.ipcMain.handle("launch-app",async(e,n,t)=>Rt(n,t));A.ipcMain.handle("apply-theme",async(e,n,t,r)=>Jt(n,t,r));A.ipcMain.handle("create-shortcut",async(e,n)=>{const t={...n,id:`${n.appId}-${n.themeId}-${Date.now()}`};return Jr(t)});A.ipcMain.handle("list-themes",async(e,n)=>Ne(n).map(t=>({id:t.id,name:t.name,author:t.author,hero:Kn(t.id)})));A.ipcMain.handle("update-themes",async()=>ta());A.ipcMain.handle("get-status",async(e,n,t)=>{var a;return await Tn(n)?{...await Mr(n,t||((a=W(n))==null?void 0:a.defaultPort)||9339),running:!0}:{installed:!1,menu:!1,targets:0,running:!1}});A.ipcMain.handle("remove-skin",async(e,n,t)=>Rr(n,t));A.ipcMain.handle("debug-targets",async(e,n)=>{try{const r=await(await fetch(`http://127.0.0.1:${n}/json/list`,{signal:AbortSignal.timeout(5e3)})).json();return{success:!0,count:r.length,raw:r,targets:r.map(a=>({id:a.id,type:a.type,url:a.url,title:a.title,webSocketDebuggerUrl:a.webSocketDebuggerUrl}))}}catch(t){return{success:!1,error:t.message}}});
