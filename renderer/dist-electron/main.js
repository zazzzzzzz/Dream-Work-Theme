"use strict";var nt=Object.defineProperty;var ot=(e,r,t)=>r in e?nt(e,r,{enumerable:!0,configurable:!0,writable:!0,value:t}):e[r]=t;var $=(e,r,t)=>ot(e,typeof r!="symbol"?r+"":r,t);const y=require("electron"),at=require("path"),st=require("fs"),it=require("os"),te=require("child_process"),pe=require("util"),ct=require("http"),lt=require("net"),dt=require("fs/promises"),mt=require("crypto"),ut=require("zlib");function W(e){const r=Object.create(null,{[Symbol.toStringTag]:{value:"Module"}});if(e){for(const t in e)if(t!=="default"){const n=Object.getOwnPropertyDescriptor(e,t);Object.defineProperty(r,t,n.get?n:{enumerable:!0,get:()=>e[t]})}}return r.default=e,Object.freeze(r)}const d=W(at),u=W(st),I=W(it),je=W(ct),De=W(lt),he=W(mt),j=process.env.LOCALAPPDATA||d.join(I.homedir(),"AppData","Local"),ve=process.env.APPDATA||d.join(I.homedir(),"AppData","Roaming"),R=process.env.ProgramFiles||"C:\\Program Files",ae=process.env["ProgramFiles(x86)"]||"C:\\Program Files (x86)",ge=[{id:"workbuddy",name:"WorkBuddy",exeNames:["WorkBuddy.exe"],processName:"WorkBuddy.exe",defaultPort:9339,installPaths:[d.join(j,"workbuddy"),d.join(j,"Programs","workbuddy"),d.join(R,"WorkBuddy"),d.join(ae,"WorkBuddy"),"D:\\Program Files\\WorkBuddy"],rendererHints:["app.asar/renderer/index.html","renderer/index.html","index.html"],kind:"workbuddy"},{id:"codex",name:"Codex",exeNames:["ChatGPT.exe","Codex.exe"],processName:"ChatGPT.exe",defaultPort:9340,installPaths:[d.join(j,"Programs","Codex"),d.join(j,"Programs","OpenAI","Codex"),d.join(R,"Codex"),d.join(ae,"Codex"),"D:\\Program Files\\Codex"],rendererHints:["index.html","renderer/index.html"],kind:"codex"},{id:"trae-work",name:"TRAE Work",exeNames:["TRAE SOLO CN.exe","TRAE Work CN.exe"],processName:"TRAE SOLO CN.exe",defaultPort:9341,installPaths:["D:\\Program Files\\TRAE SOLO CN",d.join(j,"Programs","TRAE SOLO CN"),d.join(R,"TRAE SOLO CN")],rendererHints:["solo/solo-lite.html","solo-lite.html"],kind:"vscode-work"},{id:"qoder-work",name:"QoderWork",exeNames:["QoderWork CN.exe","QoderWork.exe"],processName:"QoderWork CN.exe",defaultPort:9342,installPaths:["D:\\Program Files\\QoderWork CN",d.join(j,"Programs","QoderWork CN"),d.join(R,"QoderWork CN")],rendererHints:["out/renderer/index.html","renderer/index.html"],kind:"generic-work",devToolsActivePort:d.join(ve,"QoderWork CN","DevToolsActivePort")},{id:"catpaw",name:"CatPaw",exeNames:["CatPaw.exe"],processName:"CatPaw.exe",defaultPort:9343,installPaths:[d.join(j,"CatPaw"),d.join(j,"Programs","CatPaw"),d.join(R,"CatPaw")],rendererHints:["app.asar/dist/index.html","dist/index.html"],kind:"generic-work"},{id:"zcode",name:"ZCode",exeNames:["ZCode.exe"],processName:"ZCode.exe",defaultPort:9344,installPaths:["D:\\Program Files\\ZCode",d.join(j,"Programs","ZCode"),d.join(R,"ZCode")],rendererHints:["out/renderer/index.html","renderer/index.html"],kind:"generic-work"},{id:"qwen-office",name:"千问办公",exeNames:["QwenWorkCN.exe"],processName:"QwenWorkCN.exe",defaultPort:9345,installPaths:["D:\\Program Files\\QwenWorkCN",d.join(j,"Programs","QwenWorkCN"),d.join(R,"QwenWorkCN")],rendererHints:["out/renderer/index.html","renderer/index.html"],kind:"generic-work",devToolsActivePort:d.join(ve,"QwenWorkCN","DevToolsActivePort")},{id:"hana-agent",name:"HanaAgent",exeNames:["HanaAgent.exe"],processName:"HanaAgent.exe",defaultPort:9346,installPaths:[d.join(j,"Programs","HanaAgent"),d.join(R,"HanaAgent"),d.join(ae,"HanaAgent")],rendererHints:[".hanako/artifacts/renderer/","artifacts/renderer/","/index.html"],kind:"generic-work"}];function P(e){return ge.find(r=>r.id===e)}const Q=1;function pt(){const e=re().paths;return ge.map(r=>{const t=e[r.id];return{appId:r.id,name:r.name,exeNames:[...r.exeNames],customPath:t,customPathStatus:t?be(r.id,t)?"valid":"invalid":"none"}})}function ht(e){const r=re().paths[e];return r&&be(e,r)?r:void 0}function gt(e,r){const t=P(e);if(!t)throw new Error(`Unknown app: ${e}`);if(!be(e,r))throw new Error(`请选择 ${t.name} 的可执行文件（${t.exeNames.join(" 或 ")}）`);const n=re();return n.paths[e]=d.resolve(r),Re(n),n.paths[e]}function bt(e){if(!P(e))throw new Error(`Unknown app: ${e}`);const r=re();delete r.paths[e],Re(r)}function be(e,r){const t=P(e);if(!t||!r||typeof r!="string")return!1;try{if(!u.statSync(r).isFile())return!1}catch{return!1}const n=d.basename(r).toLowerCase();return t.exeNames.some(o=>o.toLowerCase()===n)}function _e(){return d.join(y.app.getPath("userData"),"app-paths.json")}function re(){try{const e=JSON.parse(u.readFileSync(_e(),"utf8"));if(!e||typeof e!="object"||Array.isArray(e))return se();const r=e;if(r.version!==Q||!r.paths||typeof r.paths!="object"||Array.isArray(r.paths))return se();const t={};for(const[n,o]of Object.entries(r.paths))P(n)&&typeof o=="string"&&o.trim()&&(t[n]=o);return{version:Q,paths:t}}catch{return se()}}function se(){return{version:Q,paths:{}}}function Re(e){const r=_e();u.mkdirSync(d.dirname(r),{recursive:!0}),u.writeFileSync(r,`${JSON.stringify({version:Q,paths:e.paths},null,2)}
`,"utf8")}const ft=pe.promisify(te.execFile);async function Oe(e){const r=P(e);if(!r)return null;const t=ht(e);if(t)return t;const n=xt(r.exeNames,r.installPaths);if(n)return n;const o=wt(r);if(o)return o;if(e==="codex"){const a=yt();return a||kt()}return null}function xt(e,r){for(const t of r)if(!(!t||!u.existsSync(t)))try{if(u.statSync(t).isFile()&&vt(t,e))return t;for(const o of e){const a=d.join(t,o);if(J(a))return a}const n=u.readdirSync(t,{withFileTypes:!0}).filter(o=>o.isDirectory()).sort((o,a)=>a.name.localeCompare(o.name,void 0,{numeric:!0}));for(const o of n)for(const a of e){const s=d.join(t,o.name,a);if(J(s))return s}}catch{}return null}function wt(e){const r=[process.env.ProgramFiles,process.env["ProgramFiles(x86)"]].filter(t=>!!t);for(const t of r)if(u.existsSync(t))try{const n=u.readdirSync(t).find(o=>o.toLowerCase().includes(e.id.replace("-",""))||o.toLowerCase().includes(e.name.toLowerCase()));if(!n)continue;for(const o of e.exeNames){const a=d.join(t,n,o);if(J(a))return a}}catch{}return null}function yt(){const e=d.join(process.env.ProgramFiles||"C:\\Program Files","WindowsApps");if(!u.existsSync(e))return null;try{for(const r of u.readdirSync(e)){if(!/^OpenAI\.Codex_\d+/i.test(r))continue;const t=d.join(e,r,"app","ChatGPT.exe");if(J(t))return t}}catch{}return null}async function kt(){const e=`
$ErrorActionPreference = 'SilentlyContinue'
$package = Get-AppxPackage -Name 'OpenAI.Codex' -ErrorAction SilentlyContinue
if (-not $package) { exit 1 }
$manifest = Get-AppxPackageManifest -Package $package.PackageFullName
$rel = [string]$manifest.Package.Applications.Application.Executable
if (-not $rel) { exit 1 }
$full = Join-Path $package.InstallLocation $rel
if (Test-Path -LiteralPath $full -PathType Leaf) { Write-Output $full } else { exit 1 }
`;try{const{stdout:r}=await ft("powershell.exe",["-NoLogo","-NoProfile","-NonInteractive","-ExecutionPolicy","Bypass","-Command",e],{encoding:"utf8",maxBuffer:4194304}),t=r.trim();return J(t)?t:null}catch{return null}}function vt(e,r){const t=d.basename(e).toLowerCase();return r.some(n=>n.toLowerCase()===t)}function J(e){try{return u.statSync(e).isFile()}catch{return!1}}async function Ct(){if(I.platform()!=="win32")return[];const e=[];for(const r of ge){const t=await Oe(r.id);t&&e.push({appId:r.id,name:r.name,path:t})}return e}const Ce=pe.promisify(te.execFile);async function St(e){const r=P(e);if(!r)return!1;const t=[...new Set([r.processName,...r.exeNames].filter(Boolean))];if(I.platform()==="win32"){for(const n of t)try{const{stdout:o}=await Ce("tasklist.exe",["/FI",`IMAGENAME eq ${n}`,"/FO","CSV","/NH"],{encoding:"utf8",windowsHide:!0});if(o.split(/\r?\n/).some(a=>a.trim().toLowerCase().startsWith(`"${n.toLowerCase()}"`)))return!0}catch{}return!1}for(const n of t)try{return await Ce("pgrep",["-f",n],{encoding:"utf8"}),!0}catch{}return!1}async function Ue(e,r){const t=P(e);if(!t)return{success:!1,error:`Unknown app: ${e}`};const n=t.defaultPort,o=[`--remote-debugging-port=${n}`];e==="codex"&&o.push("--disable-extensions"),r&&o.push(`--dream-theme=${r}`);try{const a=await Dt(e);if(console.log(`[launcher] Killing existing ${e} instances...`),await At(e),await jt(n,15e3),t.devToolsActivePort)try{u.unlinkSync(t.devToolsActivePort)}catch{}console.log(`[launcher] Launching ${a} with args: ${o.join(" ")}`);const s=te.spawn(a,o,{detached:!0,stdio:"ignore",env:$t()});s.unref(),console.log(`[launcher] Spawned process with PID: ${s.pid}`),console.log(`[launcher] Waiting for CDP port ${n} to be ready...`);let c=n;return t.devToolsActivePort?c=await Tt(t.devToolsActivePort,t.rendererHints,3e4):await Pt(n,3e4),console.log(`[launcher] CDP port ${c} is ready`),e==="hana-agent"&&await It(c,t.rendererHints,3e4),{success:!0,port:c}}catch(a){return console.error("[launcher] Launch failed:",a),{success:!1,error:a.message}}}function $t(){const e={...process.env};for(const r of["VITE_DEV_SERVER_URL","ELECTRON_RENDERER_URL","MAIN_VITE_DEV_SERVER_URL","ELECTRON_RUN_AS_NODE"])delete e[r];return e}async function Tt(e,r,t){const n=Date.now();let o=0;for(;Date.now()-n<t;){try{const a=u.readFileSync(e,"utf8").split(/\r?\n/,1)[0],s=Number(a);if(Number.isInteger(s)&&s>0)return o=s,await Et(s,r,3e3),s}catch{}await new Promise(a=>setTimeout(a,500))}throw new Error(`DevToolsActivePort did not expose a live renderer${o?` on port ${o}`:""}: ${e}`)}async function Et(e,r,t){const n=Date.now();for(;Date.now()-n<t;){try{const o=await fetch(`http://127.0.0.1:${e}/json/list`,{signal:AbortSignal.timeout(1e3)});if(o.ok){const a=await o.json();if(Array.isArray(a)&&a.some(s=>(s==null?void 0:s.type)==="page"&&r.some(c=>String(s.url).includes(c))))return}}catch{}await new Promise(o=>setTimeout(o,250))}throw new Error(`CDP renderer endpoint is not ready on port ${e}`)}async function It(e,r,t){const n=Date.now();let o="",a=0;for(;Date.now()-n<t;){try{const i=(await(await fetch(`http://127.0.0.1:${e}/json/list`,{signal:AbortSignal.timeout(1e3)})).json()).find(l=>(l==null?void 0:l.type)==="page"&&r.some(m=>String(l.url).includes(m)));if(i!=null&&i.id){if(i.id!==o)o=i.id,a=Date.now();else if(Date.now()-a>=3e3){console.log(`[launcher] Stable HanaAgent renderer ${o} confirmed`);return}}}catch{}await new Promise(s=>setTimeout(s,250))}throw new Error(`HanaAgent renderer did not stabilize on port ${e}`)}async function Pt(e,r){const t=Date.now();let n="unknown";for(;Date.now()-t<r;)try{await new Promise((o,a)=>{const s=De.createConnection(e,"127.0.0.1",()=>{s.end(),o()});s.once("error",c=>{n=c.message,a(c)}),setTimeout(()=>{s.destroy(),a(new Error("timeout"))},1e3)}),console.log(`[launcher] Port ${e} is open, verifying CDP endpoint...`),await Mt(e,15e3),console.log(`[launcher] CDP endpoint verified on port ${e}`);return}catch(o){n=o.message,console.log(`[launcher] Port check failed: ${o.message}, retrying...`),await new Promise(a=>setTimeout(a,1e3))}throw new Error(`CDP port ${e} did not become ready within ${r}ms (last error: ${n})`)}async function Mt(e,r){const t=Date.now();for(;Date.now()-t<r;)try{await new Promise((n,o)=>{const a=je.request({hostname:"127.0.0.1",port:e,path:"/json/version",method:"GET",timeout:2e3},s=>{let c="";s.on("data",i=>{c+=i}),s.on("end",()=>{s.statusCode===200?(console.log(`[launcher] CDP version response: ${c.substring(0,200)}`),n()):o(new Error(`HTTP ${s.statusCode}`))})});a.on("error",o),a.on("timeout",()=>{a.destroy(),o(new Error("timeout"))}),a.end()});return}catch(n){if(Date.now()-t>=r)throw n;await new Promise(o=>setTimeout(o,1e3))}}async function At(e){const r=I.platform(),t=P(e);if(!t)return;const n=[...new Set([t.processName,...t.exeNames].filter(Boolean))];try{if(r==="win32"){const{execSync:o}=require("child_process");for(const a of n)try{o(`taskkill /T /F /IM "${a}" 2>nul`,{stdio:"ignore"}),console.log(`[launcher] Killed existing ${a} process tree`)}catch{}}else if(r==="darwin"){const{execSync:o}=require("child_process");for(const a of n)try{o(`pkill -f "${a}" 2>/dev/null || true`,{stdio:"ignore"}),console.log(`[launcher] Killed existing ${a} processes`)}catch{}}else if(r==="linux"){const{execSync:o}=require("child_process");for(const a of n)try{o(`pkill -f "${a}" 2>/dev/null || true`,{stdio:"ignore"}),console.log(`[launcher] Killed existing ${a} processes`)}catch{}}}catch(o){console.warn("[launcher] Failed to kill existing instances:",o)}}async function jt(e,r){const t=Date.now();for(;Date.now()-t<r;){if(!await new Promise(o=>{const a=De.createConnection(e,"127.0.0.1");a.once("connect",()=>{a.destroy(),o(!0)}),a.once("error",()=>o(!1)),a.setTimeout(500,()=>{a.destroy(),o(!1)})})){console.log(`[launcher] Previous CDP port ${e} is closed`);return}await new Promise(o=>setTimeout(o,250))}throw new Error(`Existing ${e} CDP service did not stop; refusing to inject into the old application instance`)}async function Dt(e){if(!P(e))throw new Error(`Unknown app: ${e}`);const t=I.platform();if(t==="win32"){const n=await Oe(e);if(n)return n}else if(t==="darwin"){const n=["/Applications/WorkBuddy.app","/Applications/ChatGPT.app"];for(const o of n)if(u.existsSync(o))return o}else if(t==="linux"){const n=e==="workbuddy"?["workbuddy","WorkBuddy"]:["codex","Codex"],o=["/usr/bin","/usr/local/bin","/opt",d.join(I.homedir(),".local","bin"),"/snap/bin"];for(const a of o)if(u.existsSync(a))for(const s of n){const c=d.join(a,s);if(u.existsSync(c))return c}for(const a of n)try{const{execSync:s}=require("child_process"),c=s(`which ${a} 2>/dev/null || echo ''`).toString().trim();if(c&&u.existsSync(c))return c}catch{}}throw new Error(`Could not find ${e} executable`)}const _t=5e3,Rt=100,Ot=15e3,Ut=1e4,Nt=5e3;function Lt(e){if(!Number.isInteger(e)||e<1024||e>65535)throw new TypeError("port must be an integer from 1024 through 65535");return e}function B(e,r,t={}){const n=t.allowZero?0:Number.EPSILON;if(!Number.isFinite(e)||e<n){const o=t.allowZero?"non-negative":"positive";throw new TypeError(`${r} must be a finite ${o} number`)}return e}function Ne(e){if(typeof e!="string"||e.length===0||e!==e.trim())throw new TypeError("webSocketDebuggerUrl must be a non-empty URL string");let r;try{r=new URL(e)}catch(t){throw new TypeError(`webSocketDebuggerUrl is invalid: ${t.message}`)}if(r.protocol!=="ws:"||r.hostname!=="127.0.0.1"||r.username||r.password||r.hash||!r.port)throw new TypeError("webSocketDebuggerUrl must use ws://127.0.0.1 with an explicit port");return Lt(Number(r.port)),r}function Bt(e,r){if(e===null||typeof e!="object"||Array.isArray(e)||e.type!=="page"||typeof e.url!="string"||typeof e.webSocketDebuggerUrl!="string")return!1;try{Ne(e.webSocketDebuggerUrl)}catch{return!1}return e.url.includes(r)}function fe(e){if(e===null||typeof e!="object"||Array.isArray(e)||e.type!=="page"||typeof e.url!="string"||typeof e.webSocketDebuggerUrl!="string")return!1;try{return Ne(e.webSocketDebuggerUrl),!0}catch{return!1}}function Ht(e){return new Promise(r=>setTimeout(r,e))}async function Se(e,r){const t=Math.max(0,r.deadline-Date.now());let n=null;try{return await Promise.race([e,new Promise((o,a)=>{n=setTimeout(()=>{var s;(s=r.onTimeout)==null||s.call(r),a(new Error(`${r.label} timed out after ${r.timeoutMs}ms`))},t)})])}finally{n&&clearTimeout(n)}}async function K(e,r,t={}){const n=B(t.timeoutMs??Nt,"timeoutMs",{allowZero:!1}),o=t.fetchImpl??globalThis.fetch;if(typeof o!="function")throw new TypeError("fetchImpl must be a function");const a=`http://127.0.0.1:${e}/json/list`,s=new AbortController,c=Date.now()+n,i=t.quiet===!0;i||console.log(`[cdp] fetchRendererTargets: port=${e}, timeoutMs=${n}, endpoint=${a}`);let l;try{l=await Se(Promise.resolve(o(a,{redirect:"error",signal:s.signal})),{deadline:c,timeoutMs:n,label:"renderer target discovery",onTimeout:()=>s.abort()})}catch(p){throw i||console.log("[cdp] fetchRendererTargets error:",p),new Error(`failed to fetch renderer targets from ${a}: ${p.message}`)}if(l===null||typeof l!="object"||!l.ok)throw new Error(`renderer target discovery failed with HTTP ${(l==null?void 0:l.status)??"unknown"}`);let m;try{m=await Se(Promise.resolve(l.json()),{deadline:c,timeoutMs:n,label:"renderer target discovery JSON",onTimeout:()=>s.abort()})}catch(p){throw new Error(`malformed renderer target JSON from ${a}: ${p.message}`)}if(!Array.isArray(m))throw new Error("malformed renderer target JSON: expected an array");return m.filter(p=>Bt(p,r)).sort(Ft)}async function Wt(e,r,t={}){const n=B(t.timeoutMs??_t,"timeoutMs",{allowZero:!0}),o=B(t.pollMs??Rt,"pollMs",{allowZero:!1}),a=t.fetchImpl??globalThis.fetch;let s=0;const c=Date.now()+n;let i=new Error("no renderer discovery attempt completed");for(console.log(`[cdp] waitForRendererTargets: port=${e}, hint=${r}, timeoutMs=${n}`);;){try{const m=Math.max(1,Math.min(n-s,c-Date.now()));console.log(`[cdp] Attempting fetch: elapsed=${s}ms, remainingBudget=${m}ms, deadline=${c}`);const p=await K(e,r,{fetchImpl:a,timeoutMs:m});if(p.length>0)return p;i=new Error("no matching renderer/index.html page targets")}catch(m){i=m instanceof Error?m:new Error(String(m)),console.log("[cdp] Fetch error:",i.message)}if(s>=n||Date.now()>=c)throw new Error(`timed out after ${n}ms waiting for renderer targets on 127.0.0.1:${e}: ${i.message}`);const l=Math.min(o,n-s);await Ht(l),s+=l}}class U{constructor(r,t={}){$(this,"webSocketDebuggerUrl");$(this,"WebSocketImpl");$(this,"commandTimeoutMs");$(this,"connectTimeoutMs");$(this,"socket",null);$(this,"nextRequestId",1);$(this,"pending",new Map);$(this,"socketOpen",!1);$(this,"opened",!1);$(this,"closed",!1);$(this,"closeStarted",!1);$(this,"terminalError",null);$(this,"openPromise",null);$(this,"resolveOpen",null);$(this,"rejectOpen",null);$(this,"connectTimer",null);this.webSocketDebuggerUrl=r;let n=null,o=null;try{n=require("ws")??null,n||(o="ws loaded but WebSocket is undefined")}catch(a){o=`ws require failed: ${(a==null?void 0:a.message)??a}`}if(!n)try{const a=require("undici");n=(a==null?void 0:a.WebSocket)??null,n||(o="undici loaded but WebSocket is undefined")}catch(a){o=`undici require failed: ${(a==null?void 0:a.message)??a}`}if(!n&&typeof globalThis.WebSocket=="function"&&(n=globalThis.WebSocket,o=null),!n){const a=o?` (${o})`:"";throw new Error(`No WebSocket implementation available for CDP${a}`)}this.WebSocketImpl=t.WebSocketImpl??n,this.commandTimeoutMs=B(t.commandTimeoutMs??Ot,"commandTimeoutMs"),this.connectTimeoutMs=B(t.connectTimeoutMs??Ut,"connectTimeoutMs")}open(){if(this.closed)return Promise.reject(this.terminalError??new Error("CDP session is closed"));if(this.opened)return Promise.resolve(this);if(this.openPromise)return this.openPromise;this.openPromise=new Promise((t,n)=>{this.resolveOpen=t,this.rejectOpen=n}),this.connectTimer=setTimeout(()=>{this.terminate(new Error(`CDP WebSocket connect timed out after ${this.connectTimeoutMs}ms`)),this.closeSocket()},this.connectTimeoutMs);try{this.socket=new this.WebSocketImpl(this.webSocketDebuggerUrl)}catch(t){return this.terminate(new Error(`failed to open CDP WebSocket: ${t.message}`)),this.openPromise}const r=this.socket;return r.onopen=()=>{this.closed||this.socketOpen||(this.clearConnectTimer(),this.socketOpen=!0,Promise.all([this.send("Runtime.enable"),this.send("Page.enable")]).then(()=>{if(this.closed)return;this.opened=!0;const t=this.resolveOpen;this.resolveOpen=null,this.rejectOpen=null,t==null||t(this)}).catch(t=>{this.terminate(t),this.closeSocket()}))},r.onmessage=t=>this.handleMessage(t),r.onerror=t=>{const n=t.error,o=n instanceof Error?n.message:typeof t.message=="string"&&t.message.length>0?t.message:"unknown socket error";this.terminate(new Error(`CDP WebSocket error: ${o}`)),this.closeSocket()},r.onclose=()=>{this.closeStarted=!0,this.terminate(new Error("CDP WebSocket closed"))},this.openPromise}send(r,t={},n={}){if(this.closed)return Promise.reject(this.terminalError??new Error("CDP session is closed"));if(!this.socketOpen||!this.socket)return Promise.reject(new Error("CDP session is not open"));if(typeof r!="string"||r.length===0)return Promise.reject(new TypeError("CDP method must be a non-empty string"));const o=B(n.timeoutMs??this.commandTimeoutMs,"timeoutMs"),a=this.nextRequestId++;return new Promise((s,c)=>{const i=setTimeout(()=>{this.pending.delete(a),c(new Error(`CDP ${r} timed out after ${o}ms`))},o);this.pending.set(a,{resolve:s,reject:c,timer:i});try{this.socket.send(JSON.stringify({id:a,method:r,params:t}))}catch(l){clearTimeout(i),this.pending.delete(a),c(new Error(`failed to send CDP ${r}: ${l.message}`))}})}async evaluate(r,t={}){var o,a,s;if(typeof r!="string")throw new TypeError("Runtime.evaluate expression must be a string");const n=await this.send("Runtime.evaluate",{expression:r,awaitPromise:!0,returnByValue:!0},t);if(n!=null&&n.exceptionDetails)throw new Error(`Runtime.evaluate failed: ${((o=n.exceptionDetails.exception)==null?void 0:o.description)??n.exceptionDetails.text??"unknown JavaScript exception"}`);if(((a=n==null?void 0:n.result)==null?void 0:a.type)!=="undefined")return(s=n==null?void 0:n.result)==null?void 0:s.value}async addScriptToEvaluateOnNewDocument(r){const t=await this.send("Page.addScriptToEvaluateOnNewDocument",{source:r});return t==null?void 0:t.identifier}async removeScriptToEvaluateOnNewDocument(r){await this.send("Page.removeScriptToEvaluateOnNewDocument",{identifier:r})}close(){this.closeStarted||(this.terminate(new Error("CDP session closed by client")),this.closeSocket())}handleMessage(r){if(typeof r.data!="string"){this.terminate(new Error("received a non-text CDP WebSocket message")),this.closeSocket();return}let t;try{t=JSON.parse(r.data)}catch(o){this.terminate(new Error(`received malformed CDP JSON: ${o.message}`)),this.closeSocket();return}if(!Number.isInteger(t==null?void 0:t.id))return;const n=this.pending.get(t.id);if(n){if(this.pending.delete(t.id),clearTimeout(n.timer),t.error){n.reject(new Error(`CDP error: ${t.error.message}`));return}n.resolve(t.result)}}terminate(r){if(this.terminalError)return;this.clearConnectTimer(),this.terminalError=r,this.closed=!0,this.socketOpen=!1;const t=this.rejectOpen;this.resolveOpen=null,this.rejectOpen=null,t==null||t(r);for(const{reject:n,timer:o}of this.pending.values())clearTimeout(o),n(r);this.pending.clear()}clearConnectTimer(){this.connectTimer!==null&&(clearTimeout(this.connectTimer),this.connectTimer=null)}closeSocket(){if(this.closeStarted||(this.closeStarted=!0,!this.socket||typeof this.socket.close!="function"))return;const r=this.WebSocketImpl.CLOSING??2,t=this.WebSocketImpl.CLOSED??3;this.socket.readyState===r||this.socket.readyState===t||this.socket.close()}}function Ft(e,r){const t=[String(e.id??""),e.url,e.webSocketDebuggerUrl],n=[String(r.id??""),r.url,r.webSocketDebuggerUrl];for(let o=0;o<t.length;o++){if(t[o]<n[o])return-1;if(t[o]>n[o])return 1}return 0}function zt(){return d.join(y.app.getAppPath(),"themes")}function Le(){const e=d.join(y.app.getPath("userData"),"themes");return u.mkdirSync(e,{recursive:!0}),e}function qt(){return[Le(),zt()]}const $e=new Map;function ne(e){var o;const r=[],t=new Set;for(const a of qt()){if(!u.existsSync(a))continue;const s=u.readdirSync(a,{withFileTypes:!0});for(const c of s){if(!c.isDirectory())continue;const i=d.join(a,c.name),l=d.join(i,"theme.json");if(u.existsSync(l))try{const m=JSON.parse(u.readFileSync(l,"utf-8")),p=Zt(m);if(t.has(p.id))continue;const g=d.join(i,p.hero);if(!u.existsSync(g)||!u.statSync(g).isFile())throw new Error(`theme hero is missing: ${p.hero}`);if(e&&((o=p.apps[e])==null?void 0:o.compat)!==!0&&e!=="hana-agent")continue;t.add(p.id),r.push({id:p.id,name:p.name,author:p.author,path:i,manifest:p})}catch(m){console.error(`Failed to load theme ${c.name}:`,m)}}}const n=new Map;for(const a of r){const s=d.join(a.path,a.manifest.hero),c=de(s),i=`${a.name.trim().toLocaleLowerCase()}\0${a.author.trim().toLocaleLowerCase()}\0${c}`,l=n.get(i);(!l||Jt(a.id,l.id))&&n.set(i,a)}return[...n.values()].sort((a,s)=>a.name.localeCompare(s.name))}function de(e){const r=u.statSync(e),t=$e.get(e);if(t&&t.size===r.size&&t.mtimeMs===r.mtimeMs)return t.hash;const n=he.createHash("sha256").update(u.readFileSync(e)).digest("hex");return $e.set(e,{size:r.size,mtimeMs:r.mtimeMs,hash:n}),n}function Jt(e,r){const t=e.startsWith("custom-"),n=r.startsWith("custom-");return t!==n?!t:e.length<r.length||e.length===r.length&&e.localeCompare(r)<0}function Be(e,r){return ne(r).find(t=>t.id===e)}function Kt(e){const r=Be(e);if(!r)return;const t=d.resolve(r.path,r.manifest.hero);if(t.startsWith(`${d.resolve(r.path)}${d.sep}`))return t}function Gt(e){return`theme-asset://local/${encodeURIComponent(e)}`}function Vt(e){const r=d.join(e.path,e.manifest.hero),t=u.readFileSync(r);return`data:${Qt(e.manifest.hero)};base64,${t.toString("base64")}`}function Xt(e,r,t){const n=de(t);return ne().some(o=>o.name.trim().toLowerCase()!==e.trim().toLowerCase()||o.author.trim().toLowerCase()!==r.trim().toLowerCase()?!1:de(d.join(o.path,o.manifest.hero))===n)}function Zt(e){if(typeof e!="object"||e===null||Array.isArray(e))throw new Error("theme manifest must be an object");if(e.schemaVersion!==1)throw new Error(`unsupported theme schema ${e.schemaVersion}`);if(typeof e.id!="string"||!/^[a-z0-9-]+$/.test(e.id))throw new Error("theme id must use lowercase letters, numbers, and hyphens");if(typeof e.name!="string"||!e.name.trim())throw new Error("theme name must be a non-empty string");if(typeof e.author!="string")throw new Error("theme author must be a string");if(typeof e.hero!="string")throw new Error("theme hero must be a string");if(typeof e.colors!="object"||e.colors===null)throw new Error("theme colors must be an object");const r=["accent","secondary","surface","text"];for(const t of r)if(typeof e.colors[t]!="string"||!/^#[0-9a-fA-F]{6}$/.test(e.colors[t]))throw new Error(`theme color ${t} must be a hex color`);return{schemaVersion:1,id:e.id,name:e.name.trim(),author:e.author,hero:e.hero,colors:{accent:e.colors.accent,secondary:e.colors.secondary,surface:e.colors.surface,text:e.colors.text},copy:e.copy??void 0,apps:e.apps??{}}}function Qt(e){const r=d.extname(e).toLowerCase();return{".png":"image/png",".jpg":"image/jpeg",".jpeg":"image/jpeg",".webp":"image/webp",".gif":"image/gif"}[r]||"image/png"}const He=5,Yt=32*1024*1024;let G=null;function xe(){try{const e=JSON.parse(u.readFileSync(We(),"utf8"));return we(e)}catch{return[]}}function er(e){const r=we(e),t=[...xe()];for(const o of r){const a=t.findIndex(s=>s.id===o.id);a>=0?t[a]=o:t.push(o)}const n=t.slice(0,He);return ze(n),n}function tr(e,r,t,n=4){const o=qe()[e]??{};return[...r].sort((a,s)=>{if(a===t)return-1;if(s===t)return 1;const c=o[a]??{count:0,lastUsedAt:0},i=o[s]??{count:0,lastUsedAt:0};return i.lastUsedAt-c.lastUsedAt||i.count-c.count}).slice(0,n)}function me(e,r){if(!/^[a-z0-9-]+$/i.test(e)||!/^[a-z0-9-]+$/i.test(r))return;const t=qe(),n=t[e]??{},o=n[r]??{count:0};n[r]={count:o.count+1,lastUsedAt:Date.now()},t[e]=n,Je(Fe(),t)}function rr(){return G||(G=new Promise((e,r)=>{const t=he.randomBytes(24).toString("hex"),n=je.createServer((o,a)=>{if(a.setHeader("Access-Control-Allow-Origin","*"),a.setHeader("Access-Control-Allow-Headers","Authorization, Content-Type"),a.setHeader("Access-Control-Allow-Methods","GET, PUT, POST, OPTIONS"),a.setHeader("Access-Control-Allow-Private-Network","true"),o.method==="OPTIONS"){a.writeHead(204).end();return}if(o.headers.authorization!==`Bearer ${t}`){a.writeHead(401).end("Unauthorized");return}if(o.url==="/theme-usage"&&o.method==="POST"){Te(o,a,s=>{if(typeof(s==null?void 0:s.appId)!="string"||typeof(s==null?void 0:s.themeId)!="string")throw new Error("Invalid theme usage payload");me(s.appId,s.themeId),ie(a,200,{success:!0})});return}if(o.url!=="/custom-themes"){a.writeHead(404).end("Not found");return}if(o.method==="GET"){ie(a,200,xe());return}if(o.method!=="PUT"){a.writeHead(405).end("Method not allowed");return}Te(o,a,s=>{const c=we(s);ze(c),ie(a,200,c)})});n.once("error",r),n.listen(0,"127.0.0.1",()=>{const o=n.address();if(!o||typeof o=="string"){n.close(),r(new Error("Shared custom theme service did not expose a TCP port"));return}const a=`http://127.0.0.1:${o.port}`;e({endpoint:`${a}/custom-themes`,usageEndpoint:`${a}/theme-usage`,token:t})})}),G)}function We(){return d.join(y.app.getPath("userData"),"custom-themes.json")}function Fe(){return d.join(y.app.getPath("userData"),"theme-usage.json")}function ze(e){Je(We(),e)}function qe(){try{const e=JSON.parse(u.readFileSync(Fe(),"utf8"));return e&&typeof e=="object"&&!Array.isArray(e)?e:{}}catch{return{}}}function Je(e,r){u.mkdirSync(d.dirname(e),{recursive:!0}),u.writeFileSync(e,`${JSON.stringify(r,null,2)}
`)}function Te(e,r,t){let n=0;const o=[];e.on("data",a=>{if(n+=a.length,n>Yt){r.writeHead(413).end("Payload too large"),e.destroy();return}o.push(a)}),e.on("end",()=>{if(!r.headersSent)try{t(JSON.parse(Buffer.concat(o).toString("utf8")))}catch(a){r.writeHead(400).end(a.message)}})}function we(e){if(!Array.isArray(e))throw new Error("Custom themes must be an array");return e.slice(0,He).map((r,t)=>{var a,s;if(!r||typeof r!="object")throw new Error(`Invalid custom theme at index ${t}`);const n=r;if(typeof n.id!="string"||!/^custom-[a-z0-9-]+$/i.test(n.id))throw new Error(`Invalid custom theme id at index ${t}`);if(typeof n.name!="string"||!n.name.trim())throw new Error(`Invalid custom theme name at index ${t}`);if(typeof n.dataUrl!="string"||!/^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(n.dataUrl))throw new Error(`Invalid custom theme image at index ${t}`);for(const c of["accent","secondary","surface","text"])if(typeof((a=n.colors)==null?void 0:a[c])!="string"||!/^#[0-9a-fA-F]{6}$/.test(n.colors[c]))throw new Error(`Invalid custom theme color ${c} at index ${t}`);const o=typeof((s=n.colors)==null?void 0:s.average)=="string"&&/^#[0-9a-fA-F]{6}$/.test(n.colors.average)?n.colors.average:void 0;return{id:n.id,name:n.name.trim(),dataUrl:n.dataUrl,colors:{accent:n.colors.accent,secondary:n.colors.secondary,surface:n.colors.surface,text:n.colors.text,...o?{average:o}:{}}}})}function ie(e,r,t){e.writeHead(r,{"Content-Type":"application/json; charset=utf-8"}),e.end(JSON.stringify(t))}function Ee(e){const r=/^#([0-9a-f]{6})$/i.exec(e);if(!r)return[255,255,255];const t=parseInt(r[1],16);return[t>>16&255,t>>8&255,t&255]}function V(e){return"#"+e.map(r=>Math.max(0,Math.min(255,Math.round(r))).toString(16).padStart(2,"0")).join("")}function ce(e){const r=e/255;return r<=.04045?r/12.92:Math.pow((r+.055)/1.055,2.4)}function Y(e){return .2126*ce(e[0])+.7152*ce(e[1])+.0722*ce(e[2])}function N(e,r){const t=Y(e),n=Y(r);return(Math.max(t,n)+.05)/(Math.min(t,n)+.05)}function L(e,r,t){return[0,1,2].map(n=>e[n]+(r[n]-e[n])*t)}function Ke(e){const r=e[0]/255,t=e[1]/255,n=e[2]/255,o=Math.max(r,t,n),a=Math.min(r,t,n),s=(o+a)/2;if(o===a)return[0,0,s];const c=o-a,i=s>.5?c/(2-o-a):c/(o+a);let l;return o===r?l=(t-n)/c+(t<n?6:0):o===t?l=(n-r)/c+2:l=(r-t)/c+4,[l/6,i,s]}function ue(e,r,t){if(r<=0){const s=t*255;return[s,s,s]}const n=(s,c,i)=>(i<0&&(i+=1),i>1&&(i-=1),i<1/6?s+(c-s)*6*i:i<1/2?c:i<2/3?s+(c-s)*(2/3-i)*6:s),o=t<.5?t*(1+r):t+r-t*r,a=2*t-o;return[n(a,o,e+1/3)*255,n(a,o,e)*255,n(a,o,e-1/3)*255]}function nr(e,r,t){if(N(e,r)>=t)return e;const n=t+Math.max(.02,t*.02),o=Y(e),a=Y(r),s=o<a||o===a&&a>.475,[c,i,l]=Ke(e);if(i>=.02){let x=s?0:l,b=s?l:1;for(let S=0;S<14;S++){const A=(x+b)/2;N(ue(c,i,A),r)>=n?s?x=A:b=A:s?b=A:x=A}const v=ue(c,i,s?x:b);if(N(v,r)>=t)return v}const m=s?[0,0,0]:[255,255,255];let p=0,g=1;for(let x=0;x<12;x++){const b=(p+g)/2;N(L(e,m,b),r)>=n?g=b:p=b}return L(e,m,g)}function X(e,r,t){if(r.length===0)return e;const n=m=>Math.min(...r.map(p=>N(m,p)));let o=e;for(let m=0;m<4;m++){if(n(o)>=t)return o;const p=n(o);let g=r[0],x=1/0;for(const v of r){const S=N(o,v);S<x&&(x=S,g=v)}const b=nr(o,g,t);if(n(b)<=p+1e-9)break;o=b}if(n(o)>=t)return o;const[a,s]=Ke(e),c=[e,o];for(const m of[.02,.06,.12,.22,.78,.88,.95,.99])c.push(ue(a,s,m));let i=o,l=n(o);for(const m of c){const p=n(m);p>l+1e-9&&(l=p,i=m)}return i}function or(e){if(e.length<16||e.readUInt32BE(0)!==2303741511)return null;let r=8,t=-1;const n=[];for(;r+12<=e.length;){const a=e.readUInt32BE(r),s=e.toString("ascii",r+4,r+8),c=e.subarray(r+8,r+8+a);if(s==="IHDR"){const i=c.readUInt32BE(0),l=c.readUInt32BE(4),m=c[8],p=c[12];if(i!==1||l!==1||m!==8||p!==0)return null;t=c[9]}else if(s==="IDAT")n.push(c);else if(s==="IEND")break;r+=12+a}if(t<0||n.length===0)return null;let o;try{o=ut.inflateSync(Buffer.concat(n))}catch{return null}if(o.length<2||o[0]>4)return null;switch(t){case 6:return o.length>=5?[o[1],o[2],o[3]]:null;case 2:return o.length>=4?[o[1],o[2],o[3]]:null;case 4:return o.length>=3?[o[1],o[1],o[1]]:null;case 0:return o.length>=2?[o[1],o[1],o[1]]:null;default:return null}}const D="dream-work-style",E="dream-work-menu",H=new Map,z=new Map,O=new Map,f={id:"wb-dream-sentinel-id",hero:"data:image/png;base64,WBDREAMHEROSENTINEL",accent:"#010203",secondary:"#040506",surface:"#070809",text:"#0a0b0c",textSubtle:"#0d0e0f",textSubtlest:"#101112",textSecondary:"#131415"},ar={zcode:[.7,.76,.88,.9],codex:[.76,.82,.86,.9,.92],catpaw:[.78,.82],"qoder-work":[.7,.82,.86,.9],"qwen-office":[.86,.9],workbuddy:[.58,.62,.92],"hana-agent":[.62,.66,.78]},Ge=[.7,.76,.88,.9];function Ve(e){return ar[e]??Ge}const Ie=new Map;function sr(e){let r;try{r=u.statSync(e)}catch{return null}const t=Ie.get(e);if(t&&t.size===r.size&&t.mtimeMs===r.mtimeMs)return t.rgb;let n=null;try{const o=y.nativeImage.createFromPath(e);if(!o.isEmpty()){const a=o.resize({width:1,height:1}).toDataURL();n=or(Buffer.from(a.slice(a.indexOf(",")+1),"base64"))}}catch(o){console.warn("[injector] Hero average sampling failed:",o.message)}return Ie.set(e,{size:r.size,mtimeMs:r.mtimeMs,rgb:n}),n}let Z=null;async function ir(){if(!Z)try{const e=d.resolve(__dirname,"manager","codex-dream-skin.css");Z=await dt.readFile(e,"utf-8")}catch(e){console.warn("[injector] Failed to load Codex base CSS:",e.message),Z=""}return Z}async function Xe(e,r,t,n={}){const o=P(e),a=n.rendererUrlHint?[n.rendererUrlHint]:(o==null?void 0:o.rendererHints)??["renderer/index.html","index.html"];let s=[],c="No renderer targets found";for(const i of a)try{if(console.log(`[injector] Trying hint "${i}" on port ${t}`),s=await Wt(t,i,{timeoutMs:2e4,pollMs:500}),s.length>0){console.log(`[injector] Found ${s.length} targets with hint "${i}"`);break}}catch(l){c=l.message,console.log(`[injector] Hint "${i}" failed: ${l.message}`)}if(s.length===0)try{console.log(`[injector] Strict hints failed, trying relaxed page-target fallback on port ${t}`);const l=await(await fetch(`http://127.0.0.1:${t}/json/list`,{signal:AbortSignal.timeout(5e3)})).json(),m=(Array.isArray(l)?l:[]).filter(fe).sort((p,g)=>{const x=[String(p.id??""),p.url,p.webSocketDebuggerUrl],b=[String(g.id??""),g.url,g.webSocketDebuggerUrl];for(let v=0;v<x.length;v++){if(x[v]<b[v])return-1;if(x[v]>b[v])return 1}return 0});m.length>0&&(console.log(`[injector] Relaxed fallback found ${m.length} page targets`),s=m)}catch(i){console.log(`[injector] Relaxed fallback failed: ${i.message}`)}if(s.length===0)return{success:!1,applied:0,error:c};try{const i=ne(e);if(console.log(`[injector] Loaded ${i.length} themes`),!i.some(h=>h.id===r))return{success:!1,applied:0,error:`Theme ${r} is not compatible with ${e}`};const l=tr(e,i.map(h=>h.id),r),m=new Map(i.map(h=>[h.id,h])),p=l.map(h=>m.get(h)).filter(Boolean),g=new Map;for(const h of p)g.set(h.id,{name:h.name,css:Pe(e,h.manifest,Vt(h),sr(d.join(h.path,h.manifest.hero))),surface:h.manifest.colors.surface});const x=Array.from(g.entries()).map(([h,k])=>{var M;return{id:h,name:k.name,css:k.css,surface:k.surface,accent:((M=i.find(w=>w.id===h))==null?void 0:M.manifest.colors.accent)??"#24c9d7"}});let b=xe();if(b.length===0){const h=e==="workbuddy"?"dreamCustomThemes":"dreamCodexCustomThemes";for(const k of s){const M=new U(k.webSocketDebuggerUrl);try{await M.open();const w=await M.evaluate(`(() => localStorage.getItem(${JSON.stringify(h)}) || '[]')()`),C=JSON.parse(w);if(Array.isArray(C)&&C.length>0){b=er(C);break}}catch(w){console.warn(`[injector] Failed to import existing custom themes from ${e} target ${k.id}:`,w)}finally{M.close()}}}const v=await rr(),S=e==="workbuddy"?vr({styleId:D,menuId:E,currentThemeId:r,themes:x,sharedCustomThemes:b,sharedCustomThemeService:v,cssTemplate:Qe({id:f.id,colors:{accent:f.accent,secondary:f.secondary,surface:f.surface,text:f.text},copy:null},f.hero,{accent:f.accent,secondary:f.secondary,surface:f.surface,text:f.text})}):e==="hana-agent"?fr({styleId:D,menuId:E,currentThemeId:r,themes:x,sharedCustomThemes:b,sharedCustomThemeService:v,cssTemplate:Ze({id:f.id,colors:{accent:f.accent,secondary:f.secondary,surface:f.surface,text:f.text}},f.hero,{accent:f.accent,secondary:f.secondary,surface:f.surface,text:f.text})}):Cr({styleId:D,menuId:E,currentThemeId:r,appId:e,themes:x,sharedCustomThemes:b,sharedCustomThemeService:v,cssTemplate:Pe(e,{id:f.id,colors:{accent:f.accent,secondary:f.secondary,surface:f.surface,text:f.text}},f.hero,null,{template:!0}),surfaceAlphas:Ve(e)});let A=0;for(const h of s)try{console.log(`[injector] Injecting to target ${h.id}: ${h.url}`);const k=new U(h.webSocketDebuggerUrl);if(await k.open(),e==="workbuddy"&&!await k.evaluate(`(() => {
            const body = document.body;
            return body?.dataset.applicationName === 'workbuddy' && Boolean(
              document.querySelector('[data-view-id], .teams-container, .conversation-list, .main-content')
            );
          })()`)){console.warn(`[injector] Skipping non-WorkBuddy target ${h.id}: ${h.url}`),k.close();continue}if(e==="codex"){const w=await ir();w&&await k.evaluate(`(() => {
              const existing = document.getElementById('codex-dream-skin-base');
              if (!existing) {
                const style = document.createElement('style');
                style.id = 'codex-dream-skin-base';
                style.textContent = ${JSON.stringify(w)};
                document.head.appendChild(style);
              }
            })()`)}if(e==="hana-agent"){const w=`(() => {
            const inject = () => ${S};
            if (document.readyState === 'loading') {
              window.addEventListener('DOMContentLoaded', inject, { once: true });
            } else {
              inject();
            }
          })()`,C=H.get(h.id);C&&await k.removeScriptToEvaluateOnNewDocument(C).catch(()=>{});const T=await k.addScriptToEvaluateOnNewDocument(w);T&&H.set(h.id,T)}const M=await k.evaluate(e==="hana-agent"?`(() => { window.__dreamWorkForceApply = true; return ${S}; })()`:S);if(console.log(`[injector] Injection result for target ${h.id}:`,M),e==="hana-agent"){let w=!1;for(let C=0;C<20&&(w=await k.evaluate(`(() => {
              const host = document.getElementById('${E}-host');
              return Boolean(
                document.getElementById('${D}') &&
                host?.shadowRoot?.getElementById('${E}') &&
                document.documentElement.dataset.dreamTheme
              );
            })()`).catch(()=>!1),!w);C++)await new Promise(T=>setTimeout(T,100));if(!w){console.warn(`[injector] HanaAgent injection did not become ready for target ${h.id}`),k.close();continue}}if(e==="codex")for(let w=1;w<=4;w++){const C=await k.evaluate(`(() => {
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
            })`);if(C.homeClasses&&C.homeClasses.includes("dream-skin-home")){console.log(`[injector] Codex home detection for ${h.id}: attempt=${w}`,JSON.stringify(C));break}w<4&&await new Promise(T=>setTimeout(T,800))}if(e==="codex")try{const w=await k.evaluate(`(() => {
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
            })()`);console.log(`[injector] Codex debug info for ${h.id}:`,JSON.stringify(w,null,2))}catch(w){console.error(`[injector] Failed to get debug info for ${h.id}:`,w)}k.close(),A++}catch(k){console.error(`[injector] Failed to inject to target ${h.id}:`,k)}if(e==="hana-agent"&&A>0){const h=new Set(s.map(C=>C.id)),k=Date.now()+2e4;let M="",w=0;for(;Date.now()<k;){let C=[];try{C=await K(t,".hanako/artifacts/renderer/",{timeoutMs:2e3,quiet:!0})}catch{}const T=C[0];if(!T){M="",w=0,await new Promise(_=>setTimeout(_,250));continue}if(!h.has(T.id)){console.log(`[injector] HanaAgent created renderer target ${T.id}; injecting theme`);const _=new U(T.webSocketDebuggerUrl);try{await _.open();const rt=`(() => {
              const inject = () => ${S};
              if (document.readyState === 'loading') window.addEventListener('DOMContentLoaded', inject, { once: true });
              else inject();
            })()`,ke=await _.addScriptToEvaluateOnNewDocument(rt);ke&&H.set(T.id,ke),await _.evaluate(`(() => { window.__dreamWorkForceApply = true; return ${S}; })()`),h.add(T.id)}finally{_.close()}}const oe=new U(T.webSocketDebuggerUrl);let ye=!1;try{await oe.open(),ye=await oe.evaluate(`(() => {
            const host = document.getElementById('${E}-host');
            return Boolean(document.getElementById('${D}') && host?.shadowRoot?.getElementById('${E}') && document.documentElement.dataset.dreamTheme);
          })()`)}catch{}finally{oe.close()}if(ye){if(M!==T.id)M=T.id,w=Date.now();else if(Date.now()-w>=2e3)return lr(t,S,h),me(e,r),{success:!0,applied:1}}else M="",w=0;await new Promise(_=>setTimeout(_,250))}return{success:!1,applied:0,error:"HanaAgent renderer did not stabilize with the injected theme"}}return A>0&&me(e,r),{success:A>0,applied:A}}catch(i){return console.error("[injector] Injection failed:",i),{success:!1,applied:0,error:i.message}}}async function cr(e,r,t={}){return mr(e,r,t)}function lr(e,r,t){const n=z.get(e);n&&clearInterval(n);const o=(O.get(e)??0)+1;O.set(e,o);let a=!1;const s=setInterval(async()=>{if(!a&&O.get(e)===o){a=!0;try{const i=(await K(e,".hanako/artifacts/renderer/",{timeoutMs:1e3,quiet:!0}))[0];if(!i||O.get(e)!==o)return;const l=new U(i.webSocketDebuggerUrl);try{await l.open();const m=await l.evaluate(`(() => {
          const host = document.getElementById('${E}-host');
          if (document.documentElement.dataset.dreamThemeRestored === 'true') return 'restored';
          return document.getElementById('${D}') && host?.shadowRoot?.getElementById('${E}') && document.documentElement.dataset.dreamTheme
            ? 'ready'
            : 'missing';
        })()`).catch(()=>"missing");if(m==="ready"||m==="restored"){t.add(i.id);return}if(console.log(`[injector] HanaAgent watcher restoring theme on renderer target ${i.id}`),O.get(e)!==o)return;const p=`(() => {
          const inject = () => ${r};
          if (document.readyState === 'loading') window.addEventListener('DOMContentLoaded', inject, { once: true });
          else inject();
        })()`;if(!t.has(i.id)){const g=await l.addScriptToEvaluateOnNewDocument(p);g&&H.set(i.id,g)}if(await l.evaluate(r),O.get(e)!==o){await l.evaluate(`(() => {
            document.getElementById('${D}')?.remove();
            document.getElementById('${E}-host')?.remove();
            clearInterval(window.__dreamWorkMenuGuard);
            delete window.__dreamWorkMenuGuard;
            delete document.documentElement.dataset.dreamTheme;
          })()`).catch(()=>{});return}t.add(i.id)}finally{l.close()}}catch{await dr(e)||(clearInterval(s),z.delete(e))}finally{a=!1}}},1e3);z.set(e,s)}async function dr(e){try{return(await fetch(`http://127.0.0.1:${e}/json/version`,{signal:AbortSignal.timeout(500)})).ok}catch{return!1}}async function mr(e,r,t={}){var c;const n=t.rendererUrlHint?[t.rendererUrlHint]:((c=P(e))==null?void 0:c.rendererHints)??["renderer/index.html","index.html"];let o=[];for(const i of n)try{if(o=await K(r,i,{timeoutMs:1e3,quiet:!0}),o.length>0)break}catch{}if(o.length===0)try{const l=await(await fetch(`http://127.0.0.1:${r}/json/list`,{signal:AbortSignal.timeout(5e3)})).json();o=(Array.isArray(l)?l:[]).filter(fe).sort((m,p)=>{const g=[String(m.id??""),m.url,m.webSocketDebuggerUrl],x=[String(p.id??""),p.url,p.webSocketDebuggerUrl];for(let b=0;b<g.length;b++){if(g[b]<x[b])return-1;if(g[b]>x[b])return 1}return 0})}catch{}if(o.length===0)return{installed:!1,menu:!1,targets:0};const a=[];for(const i of o){const l=new U(i.webSocketDebuggerUrl);try{if(await l.open(),e==="workbuddy"&&!await l.evaluate("(() => document.body?.dataset.applicationName === 'workbuddy')()"))continue;const m=await l.evaluate(`(() => {
        const style = document.getElementById('${D}');
        const menuHost = document.getElementById('${E}-host');
        const menu = document.getElementById('${E}') || menuHost?.shadowRoot?.getElementById('${E}');
        return JSON.stringify({
          installed: Boolean(style),
          menu: Boolean(menu),
          themeId: document.documentElement.dataset.dreamTheme ?? undefined
        });
      })()`),p=JSON.parse(m);a.push(p)}catch(m){console.warn(`[injector] Status check failed for ${e} target ${i.id}:`,m)}finally{l.close()}}const s=a.find(i=>i.installed&&i.themeId)??a.find(i=>i.installed);return{installed:a.some(i=>i.installed),menu:a.some(i=>i.menu),themeId:s==null?void 0:s.themeId,targets:a.length}}async function ur(e,r,t={}){var a;if(e==="hana-agent"){O.set(r,(O.get(r)??0)+1);const s=z.get(r);s&&clearInterval(s),z.delete(r)}const n=t.rendererUrlHint??((a=P(e))==null?void 0:a.rendererHints[0])??"renderer/index.html";let o=[];try{o=await K(r,n)}catch{}if(o.length===0)try{const c=await(await fetch(`http://127.0.0.1:${r}/json/list`,{signal:AbortSignal.timeout(5e3)})).json();o=(Array.isArray(c)?c:[]).filter(fe).sort((i,l)=>{const m=[String(i.id??""),i.url,i.webSocketDebuggerUrl],p=[String(l.id??""),l.url,l.webSocketDebuggerUrl];for(let g=0;g<m.length;g++){if(m[g]<p[g])return-1;if(m[g]>p[g])return 1}return 0})}catch{}if(o.length===0)return{success:!1};for(const s of e==="hana-agent"?o:o.slice(0,1)){const c=new U(s.webSocketDebuggerUrl);if(await c.open(),e==="hana-agent"){const i=H.get(s.id);i&&(await c.removeScriptToEvaluateOnNewDocument(i).catch(()=>{}),H.delete(s.id))}await c.evaluate(`(() => {
      ${e==="hana-agent"?`try { localStorage.setItem('dream-work-theme:hana-agent:restored', '1'); } catch {}
      document.documentElement.dataset.dreamThemeRestored = 'true';`:""}
      document.getElementById('${D}')?.remove();
      document.getElementById('${E}')?.remove();
      document.getElementById('${E}-host')?.remove();
      clearInterval(window.__dreamWorkMenuGuard);
      delete window.__dreamWorkMenuGuard;
      if (window.__dreamWorkOutsideClick) {
        document.removeEventListener('pointerdown', window.__dreamWorkOutsideClick, true);
        delete window.__dreamWorkOutsideClick;
      }
      delete document.documentElement.dataset.dreamTheme;
      delete document.documentElement.dataset.dreamShell;
      return true;
    })`),c.close()}return{success:!0}}function pr(e,r,t,n){const o=Ee(e),a=n.map(c=>L(t??o,o,c)),s=X(Ee(r),a,4.5);return{text:V(s),textSubtle:V(X(L(o,s,.88),a,3)),textSubtlest:V(X(L(o,s,.8),a,3)),textSecondary:V(X(L(o,s,.72),a,3))}}function Pe(e,r,t,n=null,o={}){var m,p,g,x;const a=((m=r.colors)==null?void 0:m.surface)??"#f7fbff",s=((p=r.colors)==null?void 0:p.text)??"#17344f",c=o.template?{text:s,textSubtle:f.textSubtle,textSubtlest:f.textSubtlest,textSecondary:f.textSecondary}:pr(a,s,n,Ve(e)),i={accent:((g=r.colors)==null?void 0:g.accent)??"#24c9d7",secondary:((x=r.colors)==null?void 0:x.secondary)??"#ef8fd3",surface:a,...c};if(e==="codex")return yr(r,t,i);const l=P(e);return(l==null?void 0:l.kind)==="vscode-work"?hr(r,t,i):(l==null?void 0:l.kind)==="generic-work"?e==="hana-agent"?Ze(r,t,i):gr(e,r,t,i):Qe({...r,copy:null},t,i)}function hr(e,r,t){return`/* DREAM_THEME:${e.id} */
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
  background-image: url(${JSON.stringify(r)}) !important;
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
`}function gr(e,r,t,n){const o={"qoder-work":'#root > div, [class*="layout"], [class*="content-area"], [class*="main-content"]',catpaw:".main-area, .main-content-container, .main-content, .chat-content-area",zcode:'main, main > div, [class*="min-h-0"][class*="flex-1"]',"qwen-office":".agents-content-area, .agents-parchment-paper-surface"},a={"qoder-work":'[class*="sidebar"]',catpaw:".sidebar-wrapper, .sidebar",zcode:"#sidebar, aside","qwen-office":".agents-sidebar, .group\\/sidebar"},s=o[e]??'main, [role="main"], [class*="main-content"]',c=a[e]??'aside, nav, [class*="sidebar"]',i=e==="qoder-work"?xr(n):e==="catpaw"?wr(t,n):e==="zcode"?br(n):"",l=e==="zcode"?'[class*="composer"], [class*="input-container"]':'[class*="message"], [class*="bubble"], [class*="composer"], [class*="input-container"]',m=e==="zcode"?`url(${JSON.stringify(t)}) center / cover no-repeat fixed !important`:`linear-gradient(90deg, color-mix(in srgb, ${n.surface} 82%, transparent) 0 12%, transparent 42%), url(${JSON.stringify(t)}) center / cover no-repeat fixed !important`;return`/* DREAM_THEME:${r.id} */
:root {
  --dream-work-accent: ${n.accent};
  --dream-work-secondary: ${n.secondary};
  --dream-work-surface: ${n.surface};
  --dream-work-text: ${n.text};
  /* ZCode 原生前景色变量：跟随动态提升后的文字色，毛玻璃背景上保持可读；
     次级色按 88%/80%/72% 混合并保证 3:1 对比度下限（见 deriveTextColors） */
  --color-foreground: ${n.text} !important;
  --color-foreground-subtle: ${n.textSubtle} !important;
  --color-foreground-subtlest: ${n.textSubtlest} !important;
  --catpaw-bg-primary: ${n.surface} !important;
  --catpaw-text-primary: ${n.text} !important;
  --catpaw-text-secondary: ${n.textSecondary} !important;
  --agents-sidebar-material-bg: color-mix(in srgb, ${n.surface} 90%, transparent) !important;
  --text-base-primary: ${n.text} !important;
  --text-base-secondary: ${n.textSecondary} !important;
  --bg-base: color-mix(in srgb, ${n.surface} 86%, transparent) !important;
  /* ZCode 选中/悬停变量：组件自身的 data-active:!bg-selected 类带 !important
     引用 --color-selected，接管变量让这类选中背景也跟随主题 accent */
  --color-selected: color-mix(in srgb, ${n.accent} 16%, ${n.surface}) !important;
  --color-hover: color-mix(in srgb, ${n.accent} 10%, ${n.surface}) !important;
}
html, body, #root { background: ${n.surface} !important; color: ${n.text} !important; }
:is(${c}) {
  background: color-mix(in srgb, ${n.surface} 90%, transparent) !important;
  color: ${n.text} !important;
  backdrop-filter: blur(20px) saturate(108%);
}
:is(${s}) {
  background: ${m};
  color: ${n.text} !important;
}
:is(${s}) :where([class*="message"], [class*="chat"], [class*="composer"], [class*="editor"], [contenteditable="true"], textarea) {
  color: ${n.text} !important;
}
:is(${s}) :where(${l}) {
  background-color: color-mix(in srgb, ${n.surface} 88%, transparent) !important;
  backdrop-filter: blur(16px) saturate(108%);
}
:is(${s}) :where(p, span, li, h1, h2, h3, h4, strong, em) { color: ${n.text} !important; }
button[class*="bg-primary"], button[class*="bg-accent"] { background-color: ${n.accent} !important; color: #fff !important; }
${i}`}function br(e){return`
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

/* ---- 会话流光：accent 亮弧沿 输入框 / 助手消息盒 / 侧栏选中会话
   的边框周长巡游，颜色随主题 ----
   @property 注册角度变量使 conic-gradient 可动画；reduced-motion 时静止。
   亮弧三层叠加：55% 宽底环 + 全亮 accent 彗头 + 提白热核，颜色随主题。 */
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
  background: conic-gradient(from var(--dream-flow), transparent 0deg, color-mix(in srgb, ${e.accent} 55%, white) 30deg, transparent 65deg), conic-gradient(from var(--dream-flow), transparent 0deg, ${e.accent} 70deg, transparent 120deg), conic-gradient(from var(--dream-flow), color-mix(in srgb, ${e.accent} 55%, transparent) 0deg, transparent 75deg, transparent 285deg, color-mix(in srgb, ${e.accent} 55%, transparent) 360deg) !important;
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0) !important;
  -webkit-mask-composite: xor !important;
  mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0) !important;
  mask-composite: exclude !important;
  animation: dream-flow-orbit 8s linear infinite !important;
  pointer-events: none !important;
}
#sidebar li[class*="bg-selected"]::after {
  border-radius: 10px !important;
  inset: -1.5px !important;
}
/* 用户气泡半径 rounded-xl（12px，右上 rounded-tr-xs 更小），外扩 2px 的环取 14px。 */
:is(main, div.border-l.border-border) [class~="group/user-row"] > div[class*="rounded-xl"]::after {
  border-radius: 14px !important;
}
/* Git 工具状态面板流光：与会话盒同款彗星环（类签名 popover-border 全局唯一）。
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
  background: conic-gradient(from var(--dream-flow), transparent 0deg, color-mix(in srgb, ${e.accent} 55%, white) 30deg, transparent 65deg), conic-gradient(from var(--dream-flow), transparent 0deg, ${e.accent} 70deg, transparent 120deg), conic-gradient(from var(--dream-flow), color-mix(in srgb, ${e.accent} 55%, transparent) 0deg, transparent 75deg, transparent 285deg, color-mix(in srgb, ${e.accent} 55%, transparent) 360deg) !important;
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0) !important;
  -webkit-mask-composite: xor !important;
  mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0) !important;
  mask-composite: exclude !important;
  animation: dream-flow-orbit 8s linear infinite !important;
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
  aside[class*="popover-border"]::after { animation: none !important; }
}`}function Ze(e,r,t){return`/* DREAM_THEME:${e.id} */
:root {
  --dream-work-accent: ${t.accent};
  --dream-work-secondary: ${t.secondary};
  --dream-work-surface: ${t.surface};
  --dream-work-text: ${t.text};
}
html, body, #react-root, .app-shell {
  background-color: ${t.surface} !important;
  background-image: url(${JSON.stringify(r)}) !important;
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
}`}function fr(e){return`(() => {
    const themes = ${JSON.stringify(e.themes)};
    const cssTemplate = ${JSON.stringify(e.cssTemplate)};
    const sentinels = ${JSON.stringify(f)};
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
  })()`}function xr(e){return`
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
}`}function wr(e,r){return`
/* CatPaw new-task and conversation surfaces */
html body #root .main-area {
  position: relative !important;
  isolation: isolate !important;
  background-color: ${r.surface} !important;
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
  background-color: color-mix(in srgb, ${r.surface} 78%, transparent) !important;
  border: 1px solid color-mix(in srgb, ${r.accent} 30%, transparent) !important;
  box-shadow: 0 16px 42px color-mix(in srgb, ${r.surface} 30%, transparent) !important;
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
  color: ${r.text} !important;
}
html body #root .catpaw-desk-inputBox :where(button, [role="button"]) {
  color: ${r.text} !important;
}
html body #root .catpaw-desk-inputBox :where(button, [role="button"]):hover {
  background-color: color-mix(in srgb, ${r.accent} 15%, transparent) !important;
}
html body #root .catpaw-desk-inputBox :where(svg, svg *) {
  color: currentColor !important;
}
`}function Me(e,r=""){return JSON.stringify(typeof e=="string"?e:r)}function Qe(e,r,t){var o,a;return`/* DREAM_THEME:${String(e.id??"custom").replace(/[^a-z0-9_-]/gi,"")} */
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
  background-image: url(${JSON.stringify(r)}) !important;
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
  content: ${Me((o=e.copy)==null?void 0:o.brand)};
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
  content: ${Me((a=e.copy)==null?void 0:a.headline)};
  color: var(--wb-text);
  font: 750 clamp(18px, 2.7vw, 42px)/1.15 ui-rounded, system-ui;
  text-shadow: 0 2px 12px white;
  pointer-events: none;
}`}function yr(e,r,t){const n=kr(t.surface),o=n?`color-mix(in srgb, ${t.surface} 90%, transparent)`:`color-mix(in srgb, ${t.surface} 86%, transparent)`,a=n?`color-mix(in srgb, ${t.accent} 16%, ${t.surface})`:`color-mix(in srgb, ${t.accent} 42%, ${t.surface})`,s=n?"#172033":`color-mix(in srgb, ${t.surface} 72%, #000000)`,c="#f2f6ff",i=`/* DREAM_THEME:${e.id} */
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
  --dream-skin-art: url(${JSON.stringify(r)});
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
  background: ${o} !important;
  color: ${t.text} !important;
  text-shadow: none !important;
  backdrop-filter: blur(18px) saturate(108%) !important;
}

html.codex-dream-skin main.main-surface:not(.dream-skin-home-shell) [data-message-author-role="user"],
html.codex-dream-skin main.main-surface:not(.dream-skin-home-shell) [class*="bg-token-foreground"] {
  background: ${a} !important;
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
`+l}function kr(e){const r=/^#([0-9a-f]{6})$/i.exec(e);if(!r)return!0;const t=parseInt(r[1],16);return .299*(t>>16&255)+.587*(t>>8&255)+.114*(t&255)>140}function vr(e){return`(() => {
  const data = ${JSON.stringify({styleId:e.styleId,menuId:e.menuId,activeId:e.currentThemeId,themes:e.themes,cssTemplate:e.cssTemplate,sentinels:f,storageKey:"dreamCustomThemes",selectedKey:"wb-dream-selected",sharedCustomThemes:e.sharedCustomThemes,sharedCustomThemeService:e.sharedCustomThemeService})};
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
})()`}function Cr(e){const r=JSON.stringify(e.themes),t=JSON.stringify(e.cssTemplate??""),n=e.appId,o=e.surfaceAlphas??Ge;return`(() => {
  const themes = ${r};
  const cssTemplate = ${t};
  const sentinels = ${JSON.stringify(f)};
  const surfaceAlphas = ${JSON.stringify(o)};
  const currentThemeId = '${e.currentThemeId}';
  const appId = '${n}';
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
  const materializeCss = (css, cacheKey) => {
    const head = css.indexOf('data:image/');
    if (head < 0) return css;
    const comma = css.indexOf(';base64,', head);
    if (comma < 0) return css;
    let end = comma + 8;
    while (end < css.length && isBase64Char(css.charCodeAt(end))) end++;
    const dataUrl = css.slice(head, end);
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

  const panel = document.createElement('div');
  panel.style.cssText = "display:none;margin-bottom:8px;min-width:200px;padding:6px;border-radius:12px;border:1px solid rgba(0,0,0,.1);background:rgba(255,255,255,.96);backdrop-filter:blur(16px);box-shadow:0 10px 30px rgba(0,0,0,.18);color:#17344f!important;-webkit-text-fill-color:#17344f!important;";

  const row = (label, dotColor, onPick, before) => {
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
    if (before) panel.insertBefore(item, before); else panel.appendChild(item);
    return item;
  };

  for (const theme of themes) {
    const item = row(theme.name, theme.accent || '#24c9d7', () => {
      applyTheme(theme.id);
      void recordPresetUsage(theme.id);
      panel.style.display = 'none';
    });
    item.className = 'dream-theme-row';
    item.dataset.themeId = theme.id;
  }

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
  const native = row('还原主题', 'rgba(0,0,0,.24)', () => restoreNative());
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
})()`}async function Sr(e){try{return I.platform()==="win32"?$r(e):I.platform()==="darwin"?Tr(e):I.platform()==="linux"?Er(e):{success:!1,error:`Unsupported platform: ${I.platform()}`}}catch(r){return{success:!1,error:r.message}}}function $r(e){const r=d.join(I.homedir(),"Desktop"),t=d.join(r,`${e.label}.lnk`),n=process.execPath,o=d.dirname(n),a=`
    $WshShell = New-Object -comObject WScript.Shell
    $Shortcut = $WshShell.CreateShortcut("${t.replace(/\\/g,"\\\\")}")
    $Shortcut.TargetPath = "${n.replace(/\\/g,"\\\\")}"
    $Shortcut.Arguments = "--launch=${e.appId}:${e.themeId}"
    $Shortcut.WorkingDirectory = "${o.replace(/\\/g,"\\\\")}"
    $Shortcut.Save()
  `;return new Promise(s=>{require("child_process").exec(`powershell -Command "${a.replace(/"/g,'\\"')}"`,c=>{s(c?{success:!1,error:c.message}:{success:!0,path:t})})})}function Tr(e){const r=d.join(I.homedir(),"Desktop"),t=d.join(r,`${e.label}.app`),o=`
    tell application "Terminal"
      do script "'${process.execPath}' --launch=${e.appId}:${e.themeId}"
    end tell
  `,a=d.join(r,`${e.id}.scpt`);return u.writeFileSync(a,o),new Promise(s=>{require("child_process").exec(`osacompile -o "${t}" "${a}"`,c=>{u.unlinkSync(a),s(c?{success:!1,error:c.message}:{success:!0,path:t})})})}async function Er(e){const r=d.join(I.homedir(),".local","share","applications");u.existsSync(r)||u.mkdirSync(r,{recursive:!0});const t=d.join(r,`${e.id}.desktop`),n=process.execPath,o=`[Desktop Entry]
Type=Application
Name=${e.label}
Exec="${n}" --launch=${e.appId}:${e.themeId}
Icon=${e.icon||"utilities-terminal"}
Terminal=false
Categories=Utility;
`;return u.writeFileSync(t,o),u.chmodSync(t,493),{success:!0,path:t}}const Ir=pe.promisify(te.execFile),Pr="https://api.dreamskin.cc",Ye=`${Pr}/v1/themes`,et=32*1024*1024,ee=6;let le=0;const Mr=["workbuddy","codex","trae-work","qoder-work","catpaw","zcode","qwen-office","hana-agent"];async function Ar(){const e=le,r=await jr(e),t=r.items;le=e+t.length>=r.total?0:e+ee;const n=Le(),o={checked:t.length,imported:0,skipped:0,offset:e,page:Math.floor(e/ee)+1,total:r.total,nextOffset:le,failed:[]};for(const a of t){const s=Ur(a.themeId);if(!a.applyCompatible||Be(s)){o.skipped++;continue}try{await Dr(a,n,s)?o.imported++:o.skipped++}catch(c){o.failed.push({id:a.id,name:a.name,error:c.message})}}return o}async function jr(e){const r=`${Ye}?limit=${ee}&offset=${e}&sort=recent`,t=await fetch(r,{signal:AbortSignal.timeout(3e4),redirect:"error"});if(!t.ok)throw new Error(`Theme list request failed: HTTP ${t.status}`);const n=await t.json();if(!Array.isArray(n.items)||n.items.length>ee||!Number.isInteger(n.total)||n.total<0)throw new Error("Theme list response is invalid");return{items:n.items,total:n.total}}async function Dr(e,r,t){Or(e);const n=u.mkdtempSync(d.join(I.tmpdir(),"dream-work-theme-")),o=d.join(n,"theme.zip"),a=d.join(n,"extract"),s=d.join(r,`.updating-${t}-${process.pid}`);try{u.mkdirSync(a);const c=`${Ye}/${e.id}/download`,i=await fetch(c,{signal:AbortSignal.timeout(12e4),redirect:"error"});if(!i.ok)throw new Error(`Theme download failed: HTTP ${i.status}`);const l=Buffer.from(await i.arrayBuffer());if(l.length!==e.packageBytes)throw new Error(`Downloaded size mismatch: expected ${e.packageBytes}, got ${l.length}`);if(l.length>et)throw new Error("Theme package exceeds 32 MiB");if(he.createHash("sha256").update(l).digest("hex")!==e.packageSha256)throw new Error("Downloaded SHA-256 does not match metadata");u.writeFileSync(o,l,{flag:"wx"}),await _r(o,a);const p=Rr(a),g=JSON.parse(u.readFileSync(d.join(p,"theme.json"),"utf8")),x=g.image;if(typeof x!="string"||d.basename(x)!==x||!/\.(png|jpe?g|webp)$/i.test(x))throw new Error("Theme image name is invalid");const b=d.join(p,x),v=d.join(p,"theme.css");if(!u.existsSync(b)||!u.statSync(b).isFile())throw new Error("Theme image is missing");if(!u.existsSync(v)||!u.statSync(v).isFile())throw new Error("theme.css is missing");const S=Nr(g,e,t,`hero${d.extname(x).toLowerCase()}`);return Xt(S.name,S.author,b)?!1:(u.mkdirSync(s),u.copyFileSync(b,d.join(s,S.hero)),u.copyFileSync(v,d.join(s,"theme.css")),u.writeFileSync(d.join(s,"theme.json"),`${JSON.stringify(S,null,2)}
`),u.renameSync(s,d.join(r,t)),!0)}finally{u.rmSync(s,{recursive:!0,force:!0}),u.rmSync(n,{recursive:!0,force:!0})}}async function _r(e,r){const{path7za:t}=require("7zip-bin");await Ir(t,["x",e,`-o${r}`,"-y"],{windowsHide:!0,timeout:12e4})}function Rr(e){const t=[e,...u.readdirSync(e,{withFileTypes:!0}).filter(n=>n.isDirectory()).map(n=>d.join(e,n.name))].filter(n=>u.existsSync(d.join(n,"theme.json"))&&u.existsSync(d.join(n,"theme.css")));if(t.length!==1)throw new Error("Theme ZIP must contain one theme root");return t[0]}function Or(e){if(!/^ver_[a-z0-9]{8,64}$/.test(e.id))throw new Error("Theme version ID is invalid");if(!Number.isInteger(e.packageBytes)||e.packageBytes<1||e.packageBytes>et)throw new Error("Theme package size is invalid");if(!/^[a-f0-9]{64}$/.test(e.packageSha256))throw new Error("Theme package SHA-256 is invalid")}function Ur(e){return String(e).toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").replace(/-+/g,"-")||"community-theme"}function Nr(e,r,t,n){const o=e.appearance==="dark"?"dark":"light",a=o==="dark"?"#10141c":"#f4f7fa",s=e.colors||{};return{schemaVersion:1,id:t,name:String(e.name||r.name||t).trim(),author:r.authorDisplayName||"DreamSkin Community",hero:n,colors:{accent:F(s.accent,"#4f8cff",a),secondary:F(s.secondary||s.accentAlt,"#7ba7d8",a),surface:F(s.panelAlt||s.panel||s.background,a,a),text:F(s.text,o==="dark"?"#eef2f7":"#1f2937",a)},copy:null,apps:Object.fromEntries(Mr.map(c=>[c,{compat:!0}]))}}function F(e,r,t){if(typeof e!="string")return r;const n=e.trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i);if(n){let i=n[1];return i.length===3&&(i=i.split("").map(l=>l+l).join("")),`#${i.slice(0,6).toLowerCase()}`}const o=e.trim().match(/^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*(0|1|0?\.\d+))?\s*\)$/i);if(!o)return r;const a=o[4]===void 0?1:Number(o[4]),s=F(t,r,r).slice(1).match(/../g).map(i=>parseInt(i,16));return`#${[1,2,3].map(i=>Math.round(Number(o[i])*a+s[i-1]*(1-a))).map(i=>i.toString(16).padStart(2,"0")).join("")}`}let q=null;y.protocol.registerSchemesAsPrivileged([{scheme:"theme-asset",privileges:{standard:!0,secure:!0,supportFetchAPI:!0,stream:!0}}]);function tt(){q=new y.BrowserWindow({width:1200,height:800,webPreferences:{preload:d.join(__dirname,"preload.js"),contextIsolation:!0,nodeIntegration:!1}}),process.env.VITE_DEV_SERVER_URL?q.loadURL(process.env.VITE_DEV_SERVER_URL):q.loadFile(d.join(__dirname,"../renderer/dist/index.html"))}y.app.whenReady().then(()=>{y.protocol.handle("theme-asset",e=>{const r=decodeURIComponent(new URL(e.url).pathname.replace(/^\//,"")),t=Kt(r);return t?new Response(u.readFileSync(t),{headers:{"Content-Type":Lr(t),"Cache-Control":"public, max-age=3600"}}):new Response("Theme asset not found",{status:404})}),tt()});function Lr(e){const r=d.extname(e).toLowerCase();return r===".jpg"||r===".jpeg"?"image/jpeg":r===".webp"?"image/webp":"image/png"}y.app.on("window-all-closed",()=>{process.platform!=="darwin"&&y.app.quit()});y.app.on("activate",()=>{y.BrowserWindow.getAllWindows().length===0&&tt()});const Ae=process.argv.find(e=>e.startsWith("--launch="));if(Ae){const[,e]=Ae.split("="),[r,t]=e.split(":");r&&t&&(console.log(`[main] Received launch args: ${r}:${t}`),setTimeout(async()=>{try{const n=await Ue(r,t);n.success?(console.log(`[main] Launched ${r} with theme ${t} on port ${n.port}`),setTimeout(async()=>{try{console.log(`[main] Starting theme injection for ${r}:${t} on port ${n.port}`);const o=await Xe(r,t,n.port);console.log("[main] Injection result:",o)}catch(o){console.error("[main] Failed to inject theme:",o)}},3e3)):console.error(`[main] Failed to launch ${r}: ${n.error}`)}catch(n){console.error("[main] Launch error:",n)}},1e3))}y.ipcMain.handle("discover-apps",async()=>Ct());y.ipcMain.handle("list-app-path-configurations",()=>pt());y.ipcMain.handle("choose-custom-app-path",async(e,r)=>{if(process.platform!=="win32")return{success:!1,error:"自定义应用路径目前仅支持 Windows。"};const t=P(r);if(!t)return{success:!1,error:`Unknown app: ${r}`};const n={title:`选择 ${t.name} 的可执行文件`,buttonLabel:"选择此文件",properties:["openFile"],filters:[{name:`${t.name} 可执行文件`,extensions:["exe"]}]},o=q?await y.dialog.showOpenDialog(q,n):await y.dialog.showOpenDialog(n);if(o.canceled||o.filePaths.length===0)return{success:!1,cancelled:!0};try{return{success:!0,path:gt(r,o.filePaths[0])}}catch(a){return{success:!1,error:(a==null?void 0:a.message)||String(a)}}});y.ipcMain.handle("clear-custom-app-path",(e,r)=>{try{return bt(r),{success:!0}}catch(t){return{success:!1,error:(t==null?void 0:t.message)||String(t)}}});y.ipcMain.handle("launch-app",async(e,r,t)=>Ue(r,t));y.ipcMain.handle("apply-theme",async(e,r,t,n)=>Xe(r,t,n));y.ipcMain.handle("create-shortcut",async(e,r)=>{const t={...r,id:`${r.appId}-${r.themeId}-${Date.now()}`};return Sr(t)});y.ipcMain.handle("list-themes",async(e,r)=>ne(r).map(t=>({id:t.id,name:t.name,author:t.author,hero:Gt(t.id)})));y.ipcMain.handle("update-themes",async()=>Ar());y.ipcMain.handle("get-status",async(e,r,t)=>{var o;return await St(r)?{...await cr(r,t||((o=P(r))==null?void 0:o.defaultPort)||9339),running:!0}:{installed:!1,menu:!1,targets:0,running:!1}});y.ipcMain.handle("remove-skin",async(e,r,t)=>ur(r,t));y.ipcMain.handle("debug-targets",async(e,r)=>{try{const n=await(await fetch(`http://127.0.0.1:${r}/json/list`,{signal:AbortSignal.timeout(5e3)})).json();return{success:!0,count:n.length,raw:n,targets:n.map(o=>({id:o.id,type:o.type,url:o.url,title:o.title,webSocketDebuggerUrl:o.webSocketDebuggerUrl}))}}catch(t){return{success:!1,error:t.message}}});
