"use strict";var rt=Object.defineProperty;var ot=(e,n,t)=>n in e?rt(e,n,{enumerable:!0,configurable:!0,writable:!0,value:t}):e[n]=t;var T=(e,n,t)=>ot(e,typeof n!="symbol"?n+"":n,t);const y=require("electron"),at=require("path"),st=require("fs"),it=require("os"),te=require("child_process"),he=require("util"),ct=require("http"),lt=require("net"),dt=require("fs/promises"),mt=require("crypto"),ut=require("zlib");function F(e){const n=Object.create(null,{[Symbol.toStringTag]:{value:"Module"}});if(e){for(const t in e)if(t!=="default"){const r=Object.getOwnPropertyDescriptor(e,t);Object.defineProperty(n,t,r.get?r:{enumerable:!0,get:()=>e[t]})}}return n.default=e,Object.freeze(n)}const d=F(at),u=F(st),I=F(it),je=F(ct),De=F(lt),pe=F(mt),j=process.env.LOCALAPPDATA||d.join(I.homedir(),"AppData","Local"),ve=process.env.APPDATA||d.join(I.homedir(),"AppData","Roaming"),O=process.env.ProgramFiles||"C:\\Program Files",ae=process.env["ProgramFiles(x86)"]||"C:\\Program Files (x86)",ge=[{id:"workbuddy",name:"WorkBuddy",exeNames:["WorkBuddy.exe"],processName:"WorkBuddy.exe",defaultPort:9339,installPaths:[d.join(j,"workbuddy"),d.join(j,"Programs","workbuddy"),d.join(O,"WorkBuddy"),d.join(ae,"WorkBuddy"),"D:\\Program Files\\WorkBuddy"],rendererHints:["app.asar/renderer/index.html","renderer/index.html","index.html"],kind:"workbuddy"},{id:"codex",name:"Codex",exeNames:["ChatGPT.exe","Codex.exe"],processName:"ChatGPT.exe",defaultPort:9340,installPaths:[d.join(j,"Programs","Codex"),d.join(j,"Programs","OpenAI","Codex"),d.join(O,"Codex"),d.join(ae,"Codex"),"D:\\Program Files\\Codex"],rendererHints:["index.html","renderer/index.html"],kind:"codex"},{id:"trae-work",name:"TRAE Work",exeNames:["TRAE SOLO CN.exe","TRAE Work CN.exe"],processName:"TRAE SOLO CN.exe",defaultPort:9341,installPaths:["D:\\Program Files\\TRAE SOLO CN",d.join(j,"Programs","TRAE SOLO CN"),d.join(O,"TRAE SOLO CN")],rendererHints:["solo/solo-lite.html","solo-lite.html"],kind:"vscode-work"},{id:"qoder-work",name:"QoderWork",exeNames:["QoderWork CN.exe","QoderWork.exe"],processName:"QoderWork CN.exe",defaultPort:9342,installPaths:["D:\\Program Files\\QoderWork CN",d.join(j,"Programs","QoderWork CN"),d.join(O,"QoderWork CN")],rendererHints:["out/renderer/index.html","renderer/index.html"],kind:"generic-work",devToolsActivePort:d.join(ve,"QoderWork CN","DevToolsActivePort")},{id:"catpaw",name:"CatPaw",exeNames:["CatPaw.exe"],processName:"CatPaw.exe",defaultPort:9343,installPaths:[d.join(j,"CatPaw"),d.join(j,"Programs","CatPaw"),d.join(O,"CatPaw")],rendererHints:["app.asar/dist/index.html","dist/index.html"],kind:"generic-work"},{id:"zcode",name:"ZCode",exeNames:["ZCode.exe"],processName:"ZCode.exe",defaultPort:9344,installPaths:["D:\\Program Files\\ZCode",d.join(j,"Programs","ZCode"),d.join(O,"ZCode")],rendererHints:["out/renderer/index.html","renderer/index.html"],kind:"generic-work"},{id:"qwen-office",name:"千问办公",exeNames:["QwenWorkCN.exe"],processName:"QwenWorkCN.exe",defaultPort:9345,installPaths:["D:\\Program Files\\QwenWorkCN",d.join(j,"Programs","QwenWorkCN"),d.join(O,"QwenWorkCN")],rendererHints:["out/renderer/index.html","renderer/index.html"],kind:"generic-work",devToolsActivePort:d.join(ve,"QwenWorkCN","DevToolsActivePort")},{id:"hana-agent",name:"HanaAgent",exeNames:["HanaAgent.exe"],processName:"HanaAgent.exe",defaultPort:9346,installPaths:[d.join(j,"Programs","HanaAgent"),d.join(O,"HanaAgent"),d.join(ae,"HanaAgent")],rendererHints:[".hanako/artifacts/renderer/","artifacts/renderer/","/index.html"],kind:"generic-work"}];function P(e){return ge.find(n=>n.id===e)}const Q=1;function ht(){const e=ne().paths;return ge.map(n=>{const t=e[n.id];return{appId:n.id,name:n.name,exeNames:[...n.exeNames],customPath:t,customPathStatus:t?fe(n.id,t)?"valid":"invalid":"none"}})}function pt(e){const n=ne().paths[e];return n&&fe(e,n)?n:void 0}function gt(e,n){const t=P(e);if(!t)throw new Error(`Unknown app: ${e}`);if(!fe(e,n))throw new Error(`请选择 ${t.name} 的可执行文件（${t.exeNames.join(" 或 ")}）`);const r=ne();return r.paths[e]=d.resolve(n),Oe(r),r.paths[e]}function ft(e){if(!P(e))throw new Error(`Unknown app: ${e}`);const n=ne();delete n.paths[e],Oe(n)}function fe(e,n){const t=P(e);if(!t||!n||typeof n!="string")return!1;try{if(!u.statSync(n).isFile())return!1}catch{return!1}const r=d.basename(n).toLowerCase();return t.exeNames.some(o=>o.toLowerCase()===r)}function _e(){return d.join(y.app.getPath("userData"),"app-paths.json")}function ne(){try{const e=JSON.parse(u.readFileSync(_e(),"utf8"));if(!e||typeof e!="object"||Array.isArray(e))return se();const n=e;if(n.version!==Q||!n.paths||typeof n.paths!="object"||Array.isArray(n.paths))return se();const t={};for(const[r,o]of Object.entries(n.paths))P(r)&&typeof o=="string"&&o.trim()&&(t[r]=o);return{version:Q,paths:t}}catch{return se()}}function se(){return{version:Q,paths:{}}}function Oe(e){const n=_e();u.mkdirSync(d.dirname(n),{recursive:!0}),u.writeFileSync(n,`${JSON.stringify({version:Q,paths:e.paths},null,2)}
`,"utf8")}const bt=he.promisify(te.execFile);async function Re(e){const n=P(e);if(!n)return null;const t=pt(e);if(t)return t;const r=wt(n.exeNames,n.installPaths);if(r)return r;const o=xt(n);if(o)return o;if(e==="codex"){const a=yt();return a||kt()}return null}function wt(e,n){for(const t of n)if(!(!t||!u.existsSync(t)))try{if(u.statSync(t).isFile()&&vt(t,e))return t;for(const o of e){const a=d.join(t,o);if(J(a))return a}const r=u.readdirSync(t,{withFileTypes:!0}).filter(o=>o.isDirectory()).sort((o,a)=>a.name.localeCompare(o.name,void 0,{numeric:!0}));for(const o of r)for(const a of e){const s=d.join(t,o.name,a);if(J(s))return s}}catch{}return null}function xt(e){const n=[process.env.ProgramFiles,process.env["ProgramFiles(x86)"]].filter(t=>!!t);for(const t of n)if(u.existsSync(t))try{const r=u.readdirSync(t).find(o=>o.toLowerCase().includes(e.id.replace("-",""))||o.toLowerCase().includes(e.name.toLowerCase()));if(!r)continue;for(const o of e.exeNames){const a=d.join(t,r,o);if(J(a))return a}}catch{}return null}function yt(){const e=d.join(process.env.ProgramFiles||"C:\\Program Files","WindowsApps");if(!u.existsSync(e))return null;try{for(const n of u.readdirSync(e)){if(!/^OpenAI\.Codex_\d+/i.test(n))continue;const t=d.join(e,n,"app","ChatGPT.exe");if(J(t))return t}}catch{}return null}async function kt(){const e=`
$ErrorActionPreference = 'SilentlyContinue'
$package = Get-AppxPackage -Name 'OpenAI.Codex' -ErrorAction SilentlyContinue
if (-not $package) { exit 1 }
$manifest = Get-AppxPackageManifest -Package $package.PackageFullName
$rel = [string]$manifest.Package.Applications.Application.Executable
if (-not $rel) { exit 1 }
$full = Join-Path $package.InstallLocation $rel
if (Test-Path -LiteralPath $full -PathType Leaf) { Write-Output $full } else { exit 1 }
`;try{const{stdout:n}=await bt("powershell.exe",["-NoLogo","-NoProfile","-NonInteractive","-ExecutionPolicy","Bypass","-Command",e],{encoding:"utf8",maxBuffer:4194304}),t=n.trim();return J(t)?t:null}catch{return null}}function vt(e,n){const t=d.basename(e).toLowerCase();return n.some(r=>r.toLowerCase()===t)}function J(e){try{return u.statSync(e).isFile()}catch{return!1}}async function Ct(){if(I.platform()!=="win32")return[];const e=[];for(const n of ge){const t=await Re(n.id);t&&e.push({appId:n.id,name:n.name,path:t})}return e}const Ce=he.promisify(te.execFile);async function St(e){const n=P(e);if(!n)return!1;const t=[...new Set([n.processName,...n.exeNames].filter(Boolean))];if(I.platform()==="win32"){for(const r of t)try{const{stdout:o}=await Ce("tasklist.exe",["/FI",`IMAGENAME eq ${r}`,"/FO","CSV","/NH"],{encoding:"utf8",windowsHide:!0});if(o.split(/\r?\n/).some(a=>a.trim().toLowerCase().startsWith(`"${r.toLowerCase()}"`)))return!0}catch{}return!1}for(const r of t)try{return await Ce("pgrep",["-f",r],{encoding:"utf8"}),!0}catch{}return!1}async function Ne(e,n){const t=P(e);if(!t)return{success:!1,error:`Unknown app: ${e}`};const r=t.defaultPort,o=[`--remote-debugging-port=${r}`];e==="codex"&&o.push("--disable-extensions"),n&&o.push(`--dream-theme=${n}`);try{const a=await Dt(e);if(console.log(`[launcher] Killing existing ${e} instances...`),await Mt(e),await jt(r,15e3),t.devToolsActivePort)try{u.unlinkSync(t.devToolsActivePort)}catch{}console.log(`[launcher] Launching ${a} with args: ${o.join(" ")}`);const s=te.spawn(a,o,{detached:!0,stdio:"ignore",env:Tt()});s.unref(),console.log(`[launcher] Spawned process with PID: ${s.pid}`),console.log(`[launcher] Waiting for CDP port ${r} to be ready...`);let c=r;return t.devToolsActivePort?c=await $t(t.devToolsActivePort,t.rendererHints,3e4):await Pt(r,3e4),console.log(`[launcher] CDP port ${c} is ready`),e==="hana-agent"&&await It(c,t.rendererHints,3e4),{success:!0,port:c}}catch(a){return console.error("[launcher] Launch failed:",a),{success:!1,error:a.message}}}function Tt(){const e={...process.env};for(const n of["VITE_DEV_SERVER_URL","ELECTRON_RENDERER_URL","MAIN_VITE_DEV_SERVER_URL","ELECTRON_RUN_AS_NODE"])delete e[n];return e}async function $t(e,n,t){const r=Date.now();let o=0;for(;Date.now()-r<t;){try{const a=u.readFileSync(e,"utf8").split(/\r?\n/,1)[0],s=Number(a);if(Number.isInteger(s)&&s>0)return o=s,await Et(s,n,3e3),s}catch{}await new Promise(a=>setTimeout(a,500))}throw new Error(`DevToolsActivePort did not expose a live renderer${o?` on port ${o}`:""}: ${e}`)}async function Et(e,n,t){const r=Date.now();for(;Date.now()-r<t;){try{const o=await fetch(`http://127.0.0.1:${e}/json/list`,{signal:AbortSignal.timeout(1e3)});if(o.ok){const a=await o.json();if(Array.isArray(a)&&a.some(s=>(s==null?void 0:s.type)==="page"&&n.some(c=>String(s.url).includes(c))))return}}catch{}await new Promise(o=>setTimeout(o,250))}throw new Error(`CDP renderer endpoint is not ready on port ${e}`)}async function It(e,n,t){const r=Date.now();let o="",a=0;for(;Date.now()-r<t;){try{const i=(await(await fetch(`http://127.0.0.1:${e}/json/list`,{signal:AbortSignal.timeout(1e3)})).json()).find(l=>(l==null?void 0:l.type)==="page"&&n.some(m=>String(l.url).includes(m)));if(i!=null&&i.id){if(i.id!==o)o=i.id,a=Date.now();else if(Date.now()-a>=3e3){console.log(`[launcher] Stable HanaAgent renderer ${o} confirmed`);return}}}catch{}await new Promise(s=>setTimeout(s,250))}throw new Error(`HanaAgent renderer did not stabilize on port ${e}`)}async function Pt(e,n){const t=Date.now();let r="unknown";for(;Date.now()-t<n;)try{await new Promise((o,a)=>{const s=De.createConnection(e,"127.0.0.1",()=>{s.end(),o()});s.once("error",c=>{r=c.message,a(c)}),setTimeout(()=>{s.destroy(),a(new Error("timeout"))},1e3)}),console.log(`[launcher] Port ${e} is open, verifying CDP endpoint...`),await At(e,15e3),console.log(`[launcher] CDP endpoint verified on port ${e}`);return}catch(o){r=o.message,console.log(`[launcher] Port check failed: ${o.message}, retrying...`),await new Promise(a=>setTimeout(a,1e3))}throw new Error(`CDP port ${e} did not become ready within ${n}ms (last error: ${r})`)}async function At(e,n){const t=Date.now();for(;Date.now()-t<n;)try{await new Promise((r,o)=>{const a=je.request({hostname:"127.0.0.1",port:e,path:"/json/version",method:"GET",timeout:2e3},s=>{let c="";s.on("data",i=>{c+=i}),s.on("end",()=>{s.statusCode===200?(console.log(`[launcher] CDP version response: ${c.substring(0,200)}`),r()):o(new Error(`HTTP ${s.statusCode}`))})});a.on("error",o),a.on("timeout",()=>{a.destroy(),o(new Error("timeout"))}),a.end()});return}catch(r){if(Date.now()-t>=n)throw r;await new Promise(o=>setTimeout(o,1e3))}}async function Mt(e){const n=I.platform(),t=P(e);if(!t)return;const r=[...new Set([t.processName,...t.exeNames].filter(Boolean))];try{if(n==="win32"){const{execSync:o}=require("child_process");for(const a of r)try{o(`taskkill /T /F /IM "${a}" 2>nul`,{stdio:"ignore"}),console.log(`[launcher] Killed existing ${a} process tree`)}catch{}}else if(n==="darwin"){const{execSync:o}=require("child_process");for(const a of r)try{o(`pkill -f "${a}" 2>/dev/null || true`,{stdio:"ignore"}),console.log(`[launcher] Killed existing ${a} processes`)}catch{}}else if(n==="linux"){const{execSync:o}=require("child_process");for(const a of r)try{o(`pkill -f "${a}" 2>/dev/null || true`,{stdio:"ignore"}),console.log(`[launcher] Killed existing ${a} processes`)}catch{}}}catch(o){console.warn("[launcher] Failed to kill existing instances:",o)}}async function jt(e,n){const t=Date.now();for(;Date.now()-t<n;){if(!await new Promise(o=>{const a=De.createConnection(e,"127.0.0.1");a.once("connect",()=>{a.destroy(),o(!0)}),a.once("error",()=>o(!1)),a.setTimeout(500,()=>{a.destroy(),o(!1)})})){console.log(`[launcher] Previous CDP port ${e} is closed`);return}await new Promise(o=>setTimeout(o,250))}throw new Error(`Existing ${e} CDP service did not stop; refusing to inject into the old application instance`)}async function Dt(e){if(!P(e))throw new Error(`Unknown app: ${e}`);const t=I.platform();if(t==="win32"){const r=await Re(e);if(r)return r}else if(t==="darwin"){const r=["/Applications/WorkBuddy.app","/Applications/ChatGPT.app"];for(const o of r)if(u.existsSync(o))return o}else if(t==="linux"){const r=e==="workbuddy"?["workbuddy","WorkBuddy"]:["codex","Codex"],o=["/usr/bin","/usr/local/bin","/opt",d.join(I.homedir(),".local","bin"),"/snap/bin"];for(const a of o)if(u.existsSync(a))for(const s of r){const c=d.join(a,s);if(u.existsSync(c))return c}for(const a of r)try{const{execSync:s}=require("child_process"),c=s(`which ${a} 2>/dev/null || echo ''`).toString().trim();if(c&&u.existsSync(c))return c}catch{}}throw new Error(`Could not find ${e} executable`)}const _t=5e3,Ot=100,Rt=15e3,Nt=1e4,Ut=5e3;function Lt(e){if(!Number.isInteger(e)||e<1024||e>65535)throw new TypeError("port must be an integer from 1024 through 65535");return e}function B(e,n,t={}){const r=t.allowZero?0:Number.EPSILON;if(!Number.isFinite(e)||e<r){const o=t.allowZero?"non-negative":"positive";throw new TypeError(`${n} must be a finite ${o} number`)}return e}function Ue(e){if(typeof e!="string"||e.length===0||e!==e.trim())throw new TypeError("webSocketDebuggerUrl must be a non-empty URL string");let n;try{n=new URL(e)}catch(t){throw new TypeError(`webSocketDebuggerUrl is invalid: ${t.message}`)}if(n.protocol!=="ws:"||n.hostname!=="127.0.0.1"||n.username||n.password||n.hash||!n.port)throw new TypeError("webSocketDebuggerUrl must use ws://127.0.0.1 with an explicit port");return Lt(Number(n.port)),n}function Bt(e,n){if(e===null||typeof e!="object"||Array.isArray(e)||e.type!=="page"||typeof e.url!="string"||typeof e.webSocketDebuggerUrl!="string")return!1;try{Ue(e.webSocketDebuggerUrl)}catch{return!1}return e.url.includes(n)}function be(e){if(e===null||typeof e!="object"||Array.isArray(e)||e.type!=="page"||typeof e.url!="string"||typeof e.webSocketDebuggerUrl!="string")return!1;try{return Ue(e.webSocketDebuggerUrl),!0}catch{return!1}}function Wt(e){return new Promise(n=>setTimeout(n,e))}async function Se(e,n){const t=Math.max(0,n.deadline-Date.now());let r=null;try{return await Promise.race([e,new Promise((o,a)=>{r=setTimeout(()=>{var s;(s=n.onTimeout)==null||s.call(n),a(new Error(`${n.label} timed out after ${n.timeoutMs}ms`))},t)})])}finally{r&&clearTimeout(r)}}async function K(e,n,t={}){const r=B(t.timeoutMs??Ut,"timeoutMs",{allowZero:!1}),o=t.fetchImpl??globalThis.fetch;if(typeof o!="function")throw new TypeError("fetchImpl must be a function");const a=`http://127.0.0.1:${e}/json/list`,s=new AbortController,c=Date.now()+r,i=t.quiet===!0;i||console.log(`[cdp] fetchRendererTargets: port=${e}, timeoutMs=${r}, endpoint=${a}`);let l;try{l=await Se(Promise.resolve(o(a,{redirect:"error",signal:s.signal})),{deadline:c,timeoutMs:r,label:"renderer target discovery",onTimeout:()=>s.abort()})}catch(h){throw i||console.log("[cdp] fetchRendererTargets error:",h),new Error(`failed to fetch renderer targets from ${a}: ${h.message}`)}if(l===null||typeof l!="object"||!l.ok)throw new Error(`renderer target discovery failed with HTTP ${(l==null?void 0:l.status)??"unknown"}`);let m;try{m=await Se(Promise.resolve(l.json()),{deadline:c,timeoutMs:r,label:"renderer target discovery JSON",onTimeout:()=>s.abort()})}catch(h){throw new Error(`malformed renderer target JSON from ${a}: ${h.message}`)}if(!Array.isArray(m))throw new Error("malformed renderer target JSON: expected an array");return m.filter(h=>Bt(h,n)).sort(Ht)}async function Ft(e,n,t={}){const r=B(t.timeoutMs??_t,"timeoutMs",{allowZero:!0}),o=B(t.pollMs??Ot,"pollMs",{allowZero:!1}),a=t.fetchImpl??globalThis.fetch;let s=0;const c=Date.now()+r;let i=new Error("no renderer discovery attempt completed");for(console.log(`[cdp] waitForRendererTargets: port=${e}, hint=${n}, timeoutMs=${r}`);;){try{const m=Math.max(1,Math.min(r-s,c-Date.now()));console.log(`[cdp] Attempting fetch: elapsed=${s}ms, remainingBudget=${m}ms, deadline=${c}`);const h=await K(e,n,{fetchImpl:a,timeoutMs:m});if(h.length>0)return h;i=new Error("no matching renderer/index.html page targets")}catch(m){i=m instanceof Error?m:new Error(String(m)),console.log("[cdp] Fetch error:",i.message)}if(s>=r||Date.now()>=c)throw new Error(`timed out after ${r}ms waiting for renderer targets on 127.0.0.1:${e}: ${i.message}`);const l=Math.min(o,r-s);await Wt(l),s+=l}}class N{constructor(n,t={}){T(this,"webSocketDebuggerUrl");T(this,"WebSocketImpl");T(this,"commandTimeoutMs");T(this,"connectTimeoutMs");T(this,"socket",null);T(this,"nextRequestId",1);T(this,"pending",new Map);T(this,"socketOpen",!1);T(this,"opened",!1);T(this,"closed",!1);T(this,"closeStarted",!1);T(this,"terminalError",null);T(this,"openPromise",null);T(this,"resolveOpen",null);T(this,"rejectOpen",null);T(this,"connectTimer",null);this.webSocketDebuggerUrl=n;let r=null,o=null;try{r=require("ws")??null,r||(o="ws loaded but WebSocket is undefined")}catch(a){o=`ws require failed: ${(a==null?void 0:a.message)??a}`}if(!r)try{const a=require("undici");r=(a==null?void 0:a.WebSocket)??null,r||(o="undici loaded but WebSocket is undefined")}catch(a){o=`undici require failed: ${(a==null?void 0:a.message)??a}`}if(!r&&typeof globalThis.WebSocket=="function"&&(r=globalThis.WebSocket,o=null),!r){const a=o?` (${o})`:"";throw new Error(`No WebSocket implementation available for CDP${a}`)}this.WebSocketImpl=t.WebSocketImpl??r,this.commandTimeoutMs=B(t.commandTimeoutMs??Rt,"commandTimeoutMs"),this.connectTimeoutMs=B(t.connectTimeoutMs??Nt,"connectTimeoutMs")}open(){if(this.closed)return Promise.reject(this.terminalError??new Error("CDP session is closed"));if(this.opened)return Promise.resolve(this);if(this.openPromise)return this.openPromise;this.openPromise=new Promise((t,r)=>{this.resolveOpen=t,this.rejectOpen=r}),this.connectTimer=setTimeout(()=>{this.terminate(new Error(`CDP WebSocket connect timed out after ${this.connectTimeoutMs}ms`)),this.closeSocket()},this.connectTimeoutMs);try{this.socket=new this.WebSocketImpl(this.webSocketDebuggerUrl)}catch(t){return this.terminate(new Error(`failed to open CDP WebSocket: ${t.message}`)),this.openPromise}const n=this.socket;return n.onopen=()=>{this.closed||this.socketOpen||(this.clearConnectTimer(),this.socketOpen=!0,Promise.all([this.send("Runtime.enable"),this.send("Page.enable")]).then(()=>{if(this.closed)return;this.opened=!0;const t=this.resolveOpen;this.resolveOpen=null,this.rejectOpen=null,t==null||t(this)}).catch(t=>{this.terminate(t),this.closeSocket()}))},n.onmessage=t=>this.handleMessage(t),n.onerror=t=>{const r=t.error,o=r instanceof Error?r.message:typeof t.message=="string"&&t.message.length>0?t.message:"unknown socket error";this.terminate(new Error(`CDP WebSocket error: ${o}`)),this.closeSocket()},n.onclose=()=>{this.closeStarted=!0,this.terminate(new Error("CDP WebSocket closed"))},this.openPromise}send(n,t={},r={}){if(this.closed)return Promise.reject(this.terminalError??new Error("CDP session is closed"));if(!this.socketOpen||!this.socket)return Promise.reject(new Error("CDP session is not open"));if(typeof n!="string"||n.length===0)return Promise.reject(new TypeError("CDP method must be a non-empty string"));const o=B(r.timeoutMs??this.commandTimeoutMs,"timeoutMs"),a=this.nextRequestId++;return new Promise((s,c)=>{const i=setTimeout(()=>{this.pending.delete(a),c(new Error(`CDP ${n} timed out after ${o}ms`))},o);this.pending.set(a,{resolve:s,reject:c,timer:i});try{this.socket.send(JSON.stringify({id:a,method:n,params:t}))}catch(l){clearTimeout(i),this.pending.delete(a),c(new Error(`failed to send CDP ${n}: ${l.message}`))}})}async evaluate(n,t={}){var o,a,s;if(typeof n!="string")throw new TypeError("Runtime.evaluate expression must be a string");const r=await this.send("Runtime.evaluate",{expression:n,awaitPromise:!0,returnByValue:!0},t);if(r!=null&&r.exceptionDetails)throw new Error(`Runtime.evaluate failed: ${((o=r.exceptionDetails.exception)==null?void 0:o.description)??r.exceptionDetails.text??"unknown JavaScript exception"}`);if(((a=r==null?void 0:r.result)==null?void 0:a.type)!=="undefined")return(s=r==null?void 0:r.result)==null?void 0:s.value}async addScriptToEvaluateOnNewDocument(n){const t=await this.send("Page.addScriptToEvaluateOnNewDocument",{source:n});return t==null?void 0:t.identifier}async removeScriptToEvaluateOnNewDocument(n){await this.send("Page.removeScriptToEvaluateOnNewDocument",{identifier:n})}close(){this.closeStarted||(this.terminate(new Error("CDP session closed by client")),this.closeSocket())}handleMessage(n){if(typeof n.data!="string"){this.terminate(new Error("received a non-text CDP WebSocket message")),this.closeSocket();return}let t;try{t=JSON.parse(n.data)}catch(o){this.terminate(new Error(`received malformed CDP JSON: ${o.message}`)),this.closeSocket();return}if(!Number.isInteger(t==null?void 0:t.id))return;const r=this.pending.get(t.id);if(r){if(this.pending.delete(t.id),clearTimeout(r.timer),t.error){r.reject(new Error(`CDP error: ${t.error.message}`));return}r.resolve(t.result)}}terminate(n){if(this.terminalError)return;this.clearConnectTimer(),this.terminalError=n,this.closed=!0,this.socketOpen=!1;const t=this.rejectOpen;this.resolveOpen=null,this.rejectOpen=null,t==null||t(n);for(const{reject:r,timer:o}of this.pending.values())clearTimeout(o),r(n);this.pending.clear()}clearConnectTimer(){this.connectTimer!==null&&(clearTimeout(this.connectTimer),this.connectTimer=null)}closeSocket(){if(this.closeStarted||(this.closeStarted=!0,!this.socket||typeof this.socket.close!="function"))return;const n=this.WebSocketImpl.CLOSING??2,t=this.WebSocketImpl.CLOSED??3;this.socket.readyState===n||this.socket.readyState===t||this.socket.close()}}function Ht(e,n){const t=[String(e.id??""),e.url,e.webSocketDebuggerUrl],r=[String(n.id??""),n.url,n.webSocketDebuggerUrl];for(let o=0;o<t.length;o++){if(t[o]<r[o])return-1;if(t[o]>r[o])return 1}return 0}function zt(){return d.join(y.app.getAppPath(),"themes")}function Le(){const e=d.join(y.app.getPath("userData"),"themes");return u.mkdirSync(e,{recursive:!0}),e}function qt(){return[Le(),zt()]}const Te=new Map;function re(e){var o;const n=[],t=new Set;for(const a of qt()){if(!u.existsSync(a))continue;const s=u.readdirSync(a,{withFileTypes:!0});for(const c of s){if(!c.isDirectory())continue;const i=d.join(a,c.name),l=d.join(i,"theme.json");if(u.existsSync(l))try{const m=JSON.parse(u.readFileSync(l,"utf-8")),h=Zt(m);if(t.has(h.id))continue;const g=d.join(i,h.hero);if(!u.existsSync(g)||!u.statSync(g).isFile())throw new Error(`theme hero is missing: ${h.hero}`);if(e&&((o=h.apps[e])==null?void 0:o.compat)!==!0&&e!=="hana-agent")continue;t.add(h.id),n.push({id:h.id,name:h.name,author:h.author,path:i,manifest:h})}catch(m){console.error(`Failed to load theme ${c.name}:`,m)}}}const r=new Map;for(const a of n){const s=d.join(a.path,a.manifest.hero),c=de(s),i=`${a.name.trim().toLocaleLowerCase()}\0${a.author.trim().toLocaleLowerCase()}\0${c}`,l=r.get(i);(!l||Jt(a.id,l.id))&&r.set(i,a)}return[...r.values()].sort((a,s)=>a.name.localeCompare(s.name))}function de(e){const n=u.statSync(e),t=Te.get(e);if(t&&t.size===n.size&&t.mtimeMs===n.mtimeMs)return t.hash;const r=pe.createHash("sha256").update(u.readFileSync(e)).digest("hex");return Te.set(e,{size:n.size,mtimeMs:n.mtimeMs,hash:r}),r}function Jt(e,n){const t=e.startsWith("custom-"),r=n.startsWith("custom-");return t!==r?!t:e.length<n.length||e.length===n.length&&e.localeCompare(n)<0}function Be(e,n){return re(n).find(t=>t.id===e)}function Kt(e){const n=Be(e);if(!n)return;const t=d.resolve(n.path,n.manifest.hero);if(t.startsWith(`${d.resolve(n.path)}${d.sep}`))return t}function Gt(e){return`theme-asset://local/${encodeURIComponent(e)}`}function Vt(e){const n=d.join(e.path,e.manifest.hero),t=u.readFileSync(n);return`data:${Qt(e.manifest.hero)};base64,${t.toString("base64")}`}function Xt(e,n,t){const r=de(t);return re().some(o=>o.name.trim().toLowerCase()!==e.trim().toLowerCase()||o.author.trim().toLowerCase()!==n.trim().toLowerCase()?!1:de(d.join(o.path,o.manifest.hero))===r)}function Zt(e){if(typeof e!="object"||e===null||Array.isArray(e))throw new Error("theme manifest must be an object");if(e.schemaVersion!==1)throw new Error(`unsupported theme schema ${e.schemaVersion}`);if(typeof e.id!="string"||!/^[a-z0-9-]+$/.test(e.id))throw new Error("theme id must use lowercase letters, numbers, and hyphens");if(typeof e.name!="string"||!e.name.trim())throw new Error("theme name must be a non-empty string");if(typeof e.author!="string")throw new Error("theme author must be a string");if(typeof e.hero!="string")throw new Error("theme hero must be a string");if(typeof e.colors!="object"||e.colors===null)throw new Error("theme colors must be an object");const n=["accent","secondary","surface","text"];for(const t of n)if(typeof e.colors[t]!="string"||!/^#[0-9a-fA-F]{6}$/.test(e.colors[t]))throw new Error(`theme color ${t} must be a hex color`);return{schemaVersion:1,id:e.id,name:e.name.trim(),author:e.author,hero:e.hero,colors:{accent:e.colors.accent,secondary:e.colors.secondary,surface:e.colors.surface,text:e.colors.text},copy:e.copy??void 0,apps:e.apps??{}}}function Qt(e){const n=d.extname(e).toLowerCase();return{".png":"image/png",".jpg":"image/jpeg",".jpeg":"image/jpeg",".webp":"image/webp",".gif":"image/gif"}[n]||"image/png"}const We=5,Yt=32*1024*1024;let G=null;function we(){try{const e=JSON.parse(u.readFileSync(Fe(),"utf8"));return xe(e)}catch{return[]}}function en(e){const n=xe(e),t=[...we()];for(const o of n){const a=t.findIndex(s=>s.id===o.id);a>=0?t[a]=o:t.push(o)}const r=t.slice(0,We);return ze(r),r}function tn(e,n,t,r=4){const o=qe()[e]??{};return[...n].sort((a,s)=>{if(a===t)return-1;if(s===t)return 1;const c=o[a]??{count:0,lastUsedAt:0},i=o[s]??{count:0,lastUsedAt:0};return i.lastUsedAt-c.lastUsedAt||i.count-c.count}).slice(0,r)}function me(e,n){if(!/^[a-z0-9-]+$/i.test(e)||!/^[a-z0-9-]+$/i.test(n))return;const t=qe(),r=t[e]??{},o=r[n]??{count:0};r[n]={count:o.count+1,lastUsedAt:Date.now()},t[e]=r,Je(He(),t)}function nn(){return G||(G=new Promise((e,n)=>{const t=pe.randomBytes(24).toString("hex"),r=je.createServer((o,a)=>{if(a.setHeader("Access-Control-Allow-Origin","*"),a.setHeader("Access-Control-Allow-Headers","Authorization, Content-Type"),a.setHeader("Access-Control-Allow-Methods","GET, PUT, POST, OPTIONS"),a.setHeader("Access-Control-Allow-Private-Network","true"),o.method==="OPTIONS"){a.writeHead(204).end();return}if(o.headers.authorization!==`Bearer ${t}`){a.writeHead(401).end("Unauthorized");return}if(o.url==="/theme-usage"&&o.method==="POST"){$e(o,a,s=>{if(typeof(s==null?void 0:s.appId)!="string"||typeof(s==null?void 0:s.themeId)!="string")throw new Error("Invalid theme usage payload");me(s.appId,s.themeId),ie(a,200,{success:!0})});return}if(o.url!=="/custom-themes"){a.writeHead(404).end("Not found");return}if(o.method==="GET"){ie(a,200,we());return}if(o.method!=="PUT"){a.writeHead(405).end("Method not allowed");return}$e(o,a,s=>{const c=xe(s);ze(c),ie(a,200,c)})});r.once("error",n),r.listen(0,"127.0.0.1",()=>{const o=r.address();if(!o||typeof o=="string"){r.close(),n(new Error("Shared custom theme service did not expose a TCP port"));return}const a=`http://127.0.0.1:${o.port}`;e({endpoint:`${a}/custom-themes`,usageEndpoint:`${a}/theme-usage`,token:t})})}),G)}function Fe(){return d.join(y.app.getPath("userData"),"custom-themes.json")}function He(){return d.join(y.app.getPath("userData"),"theme-usage.json")}function ze(e){Je(Fe(),e)}function qe(){try{const e=JSON.parse(u.readFileSync(He(),"utf8"));return e&&typeof e=="object"&&!Array.isArray(e)?e:{}}catch{return{}}}function Je(e,n){u.mkdirSync(d.dirname(e),{recursive:!0}),u.writeFileSync(e,`${JSON.stringify(n,null,2)}
`)}function $e(e,n,t){let r=0;const o=[];e.on("data",a=>{if(r+=a.length,r>Yt){n.writeHead(413).end("Payload too large"),e.destroy();return}o.push(a)}),e.on("end",()=>{if(!n.headersSent)try{t(JSON.parse(Buffer.concat(o).toString("utf8")))}catch(a){n.writeHead(400).end(a.message)}})}function xe(e){if(!Array.isArray(e))throw new Error("Custom themes must be an array");return e.slice(0,We).map((n,t)=>{var a,s;if(!n||typeof n!="object")throw new Error(`Invalid custom theme at index ${t}`);const r=n;if(typeof r.id!="string"||!/^custom-[a-z0-9-]+$/i.test(r.id))throw new Error(`Invalid custom theme id at index ${t}`);if(typeof r.name!="string"||!r.name.trim())throw new Error(`Invalid custom theme name at index ${t}`);if(typeof r.dataUrl!="string"||!/^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(r.dataUrl))throw new Error(`Invalid custom theme image at index ${t}`);for(const c of["accent","secondary","surface","text"])if(typeof((a=r.colors)==null?void 0:a[c])!="string"||!/^#[0-9a-fA-F]{6}$/.test(r.colors[c]))throw new Error(`Invalid custom theme color ${c} at index ${t}`);const o=typeof((s=r.colors)==null?void 0:s.average)=="string"&&/^#[0-9a-fA-F]{6}$/.test(r.colors.average)?r.colors.average:void 0;return{id:r.id,name:r.name.trim(),dataUrl:r.dataUrl,colors:{accent:r.colors.accent,secondary:r.colors.secondary,surface:r.colors.surface,text:r.colors.text,...o?{average:o}:{}}}})}function ie(e,n,t){e.writeHead(n,{"Content-Type":"application/json; charset=utf-8"}),e.end(JSON.stringify(t))}function Ee(e){const n=/^#([0-9a-f]{6})$/i.exec(e);if(!n)return[255,255,255];const t=parseInt(n[1],16);return[t>>16&255,t>>8&255,t&255]}function V(e){return"#"+e.map(n=>Math.max(0,Math.min(255,Math.round(n))).toString(16).padStart(2,"0")).join("")}function ce(e){const n=e/255;return n<=.04045?n/12.92:Math.pow((n+.055)/1.055,2.4)}function Y(e){return .2126*ce(e[0])+.7152*ce(e[1])+.0722*ce(e[2])}function U(e,n){const t=Y(e),r=Y(n);return(Math.max(t,r)+.05)/(Math.min(t,r)+.05)}function L(e,n,t){return[0,1,2].map(r=>e[r]+(n[r]-e[r])*t)}function Ke(e){const n=e[0]/255,t=e[1]/255,r=e[2]/255,o=Math.max(n,t,r),a=Math.min(n,t,r),s=(o+a)/2;if(o===a)return[0,0,s];const c=o-a,i=s>.5?c/(2-o-a):c/(o+a);let l;return o===n?l=(t-r)/c+(t<r?6:0):o===t?l=(r-n)/c+2:l=(n-t)/c+4,[l/6,i,s]}function ue(e,n,t){if(n<=0){const s=t*255;return[s,s,s]}const r=(s,c,i)=>(i<0&&(i+=1),i>1&&(i-=1),i<1/6?s+(c-s)*6*i:i<1/2?c:i<2/3?s+(c-s)*(2/3-i)*6:s),o=t<.5?t*(1+n):t+n-t*n,a=2*t-o;return[r(a,o,e+1/3)*255,r(a,o,e)*255,r(a,o,e-1/3)*255]}function rn(e,n,t){if(U(e,n)>=t)return e;const r=t+Math.max(.02,t*.02),o=Y(e),a=Y(n),s=o<a||o===a&&a>.475,[c,i,l]=Ke(e);if(i>=.02){let w=s?0:l,f=s?l:1;for(let S=0;S<14;S++){const M=(w+f)/2;U(ue(c,i,M),n)>=r?s?w=M:f=M:s?f=M:w=M}const v=ue(c,i,s?w:f);if(U(v,n)>=t)return v}const m=s?[0,0,0]:[255,255,255];let h=0,g=1;for(let w=0;w<12;w++){const f=(h+g)/2;U(L(e,m,f),n)>=r?g=f:h=f}return L(e,m,g)}function X(e,n,t){if(n.length===0)return e;const r=m=>Math.min(...n.map(h=>U(m,h)));let o=e;for(let m=0;m<4;m++){if(r(o)>=t)return o;const h=r(o);let g=n[0],w=1/0;for(const v of n){const S=U(o,v);S<w&&(w=S,g=v)}const f=rn(o,g,t);if(r(f)<=h+1e-9)break;o=f}if(r(o)>=t)return o;const[a,s]=Ke(e),c=[e,o];for(const m of[.02,.06,.12,.22,.78,.88,.95,.99])c.push(ue(a,s,m));let i=o,l=r(o);for(const m of c){const h=r(m);h>l+1e-9&&(l=h,i=m)}return i}function on(e){if(e.length<16||e.readUInt32BE(0)!==2303741511)return null;let n=8,t=-1;const r=[];for(;n+12<=e.length;){const a=e.readUInt32BE(n),s=e.toString("ascii",n+4,n+8),c=e.subarray(n+8,n+8+a);if(s==="IHDR"){const i=c.readUInt32BE(0),l=c.readUInt32BE(4),m=c[8],h=c[12];if(i!==1||l!==1||m!==8||h!==0)return null;t=c[9]}else if(s==="IDAT")r.push(c);else if(s==="IEND")break;n+=12+a}if(t<0||r.length===0)return null;let o;try{o=ut.inflateSync(Buffer.concat(r))}catch{return null}if(o.length<2||o[0]>4)return null;switch(t){case 6:return o.length>=5?[o[1],o[2],o[3]]:null;case 2:return o.length>=4?[o[1],o[2],o[3]]:null;case 4:return o.length>=3?[o[1],o[1],o[1]]:null;case 0:return o.length>=2?[o[1],o[1],o[1]]:null;default:return null}}const D="dream-work-style",E="dream-work-menu",W=new Map,z=new Map,R=new Map,b={id:"wb-dream-sentinel-id",hero:"data:image/png;base64,WBDREAMHEROSENTINEL",accent:"#010203",secondary:"#040506",surface:"#070809",text:"#0a0b0c",textSubtle:"#0d0e0f",textSubtlest:"#101112",textSecondary:"#131415"},an={zcode:[.7,.76,.88,.9],codex:[.76,.82,.86,.9,.92],catpaw:[.78,.82],"qoder-work":[.7,.82,.86,.9],"qwen-office":[.86,.9],workbuddy:[.58,.62,.92],"hana-agent":[.62,.66,.78]},Ge=[.7,.76,.88,.9];function Ve(e){return an[e]??Ge}const Ie=new Map;function sn(e){let n;try{n=u.statSync(e)}catch{return null}const t=Ie.get(e);if(t&&t.size===n.size&&t.mtimeMs===n.mtimeMs)return t.rgb;let r=null;try{const o=y.nativeImage.createFromPath(e);if(!o.isEmpty()){const a=o.resize({width:1,height:1}).toDataURL();r=on(Buffer.from(a.slice(a.indexOf(",")+1),"base64"))}}catch(o){console.warn("[injector] Hero average sampling failed:",o.message)}return Ie.set(e,{size:n.size,mtimeMs:n.mtimeMs,rgb:r}),r}let Z=null;async function cn(){if(!Z)try{const e=d.resolve(__dirname,"manager","codex-dream-skin.css");Z=await dt.readFile(e,"utf-8")}catch(e){console.warn("[injector] Failed to load Codex base CSS:",e.message),Z=""}return Z}async function Xe(e,n,t,r={}){const o=P(e),a=r.rendererUrlHint?[r.rendererUrlHint]:(o==null?void 0:o.rendererHints)??["renderer/index.html","index.html"];let s=[],c="No renderer targets found";for(const i of a)try{if(console.log(`[injector] Trying hint "${i}" on port ${t}`),s=await Ft(t,i,{timeoutMs:2e4,pollMs:500}),s.length>0){console.log(`[injector] Found ${s.length} targets with hint "${i}"`);break}}catch(l){c=l.message,console.log(`[injector] Hint "${i}" failed: ${l.message}`)}if(s.length===0)try{console.log(`[injector] Strict hints failed, trying relaxed page-target fallback on port ${t}`);const l=await(await fetch(`http://127.0.0.1:${t}/json/list`,{signal:AbortSignal.timeout(5e3)})).json(),m=(Array.isArray(l)?l:[]).filter(be).sort((h,g)=>{const w=[String(h.id??""),h.url,h.webSocketDebuggerUrl],f=[String(g.id??""),g.url,g.webSocketDebuggerUrl];for(let v=0;v<w.length;v++){if(w[v]<f[v])return-1;if(w[v]>f[v])return 1}return 0});m.length>0&&(console.log(`[injector] Relaxed fallback found ${m.length} page targets`),s=m)}catch(i){console.log(`[injector] Relaxed fallback failed: ${i.message}`)}if(s.length===0)return{success:!1,applied:0,error:c};try{const i=re(e);if(console.log(`[injector] Loaded ${i.length} themes`),!i.some(p=>p.id===n))return{success:!1,applied:0,error:`Theme ${n} is not compatible with ${e}`};const l=tn(e,i.map(p=>p.id),n),m=new Map(i.map(p=>[p.id,p])),h=l.map(p=>m.get(p)).filter(Boolean),g=new Map;for(const p of h)g.set(p.id,{name:p.name,css:Pe(e,p.manifest,Vt(p),sn(d.join(p.path,p.manifest.hero))),surface:p.manifest.colors.surface});const w=Array.from(g.entries()).map(([p,k])=>{var A;return{id:p,name:k.name,css:k.css,surface:k.surface,accent:((A=i.find(x=>x.id===p))==null?void 0:A.manifest.colors.accent)??"#24c9d7"}});let f=we();if(f.length===0){const p=e==="workbuddy"?"dreamCustomThemes":"dreamCodexCustomThemes";for(const k of s){const A=new N(k.webSocketDebuggerUrl);try{await A.open();const x=await A.evaluate(`(() => localStorage.getItem(${JSON.stringify(p)}) || '[]')()`),C=JSON.parse(x);if(Array.isArray(C)&&C.length>0){f=en(C);break}}catch(x){console.warn(`[injector] Failed to import existing custom themes from ${e} target ${k.id}:`,x)}finally{A.close()}}}const v=await nn(),S=e==="workbuddy"?Cn({styleId:D,menuId:E,currentThemeId:n,themes:w,sharedCustomThemes:f,sharedCustomThemeService:v,cssTemplate:Qe({id:b.id,colors:{accent:b.accent,secondary:b.secondary,surface:b.surface,text:b.text},copy:null},b.hero,{accent:b.accent,secondary:b.secondary,surface:b.surface,text:b.text})}):e==="hana-agent"?wn({styleId:D,menuId:E,currentThemeId:n,themes:w,sharedCustomThemes:f,sharedCustomThemeService:v,cssTemplate:Ze({id:b.id,colors:{accent:b.accent,secondary:b.secondary,surface:b.surface,text:b.text}},b.hero,{accent:b.accent,secondary:b.secondary,surface:b.surface,text:b.text})}):Sn({styleId:D,menuId:E,currentThemeId:n,appId:e,themes:w,sharedCustomThemes:f,sharedCustomThemeService:v,cssTemplate:Pe(e,{id:b.id,colors:{accent:b.accent,secondary:b.secondary,surface:b.surface,text:b.text}},b.hero,null,{template:!0}),surfaceAlphas:Ve(e)});let M=0;for(const p of s)try{console.log(`[injector] Injecting to target ${p.id}: ${p.url}`);const k=new N(p.webSocketDebuggerUrl);if(await k.open(),e==="workbuddy"&&!await k.evaluate(`(() => {
            const body = document.body;
            return body?.dataset.applicationName === 'workbuddy' && Boolean(
              document.querySelector('[data-view-id], .teams-container, .conversation-list, .main-content')
            );
          })()`)){console.warn(`[injector] Skipping non-WorkBuddy target ${p.id}: ${p.url}`),k.close();continue}if(e==="codex"){const x=await cn();x&&await k.evaluate(`(() => {
              const existing = document.getElementById('codex-dream-skin-base');
              if (!existing) {
                const style = document.createElement('style');
                style.id = 'codex-dream-skin-base';
                style.textContent = ${JSON.stringify(x)};
                document.head.appendChild(style);
              }
            })()`)}if(e==="hana-agent"){const x=`(() => {
            const inject = () => ${S};
            if (document.readyState === 'loading') {
              window.addEventListener('DOMContentLoaded', inject, { once: true });
            } else {
              inject();
            }
          })()`,C=W.get(p.id);C&&await k.removeScriptToEvaluateOnNewDocument(C).catch(()=>{});const $=await k.addScriptToEvaluateOnNewDocument(x);$&&W.set(p.id,$)}const A=await k.evaluate(e==="hana-agent"?`(() => { window.__dreamWorkForceApply = true; return ${S}; })()`:S);if(console.log(`[injector] Injection result for target ${p.id}:`,A),e==="hana-agent"){let x=!1;for(let C=0;C<20&&(x=await k.evaluate(`(() => {
              const host = document.getElementById('${E}-host');
              return Boolean(
                document.getElementById('${D}') &&
                host?.shadowRoot?.getElementById('${E}') &&
                document.documentElement.dataset.dreamTheme
              );
            })()`).catch(()=>!1),!x);C++)await new Promise($=>setTimeout($,100));if(!x){console.warn(`[injector] HanaAgent injection did not become ready for target ${p.id}`),k.close();continue}}if(e==="codex")for(let x=1;x<=4;x++){const C=await k.evaluate(`(() => {
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
            })`);if(C.homeClasses&&C.homeClasses.includes("dream-skin-home")){console.log(`[injector] Codex home detection for ${p.id}: attempt=${x}`,JSON.stringify(C));break}x<4&&await new Promise($=>setTimeout($,800))}if(e==="codex")try{const x=await k.evaluate(`(() => {
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
            })()`);console.log(`[injector] Codex debug info for ${p.id}:`,JSON.stringify(x,null,2))}catch(x){console.error(`[injector] Failed to get debug info for ${p.id}:`,x)}k.close(),M++}catch(k){console.error(`[injector] Failed to inject to target ${p.id}:`,k)}if(e==="hana-agent"&&M>0){const p=new Set(s.map(C=>C.id)),k=Date.now()+2e4;let A="",x=0;for(;Date.now()<k;){let C=[];try{C=await K(t,".hanako/artifacts/renderer/",{timeoutMs:2e3,quiet:!0})}catch{}const $=C[0];if(!$){A="",x=0,await new Promise(_=>setTimeout(_,250));continue}if(!p.has($.id)){console.log(`[injector] HanaAgent created renderer target ${$.id}; injecting theme`);const _=new N($.webSocketDebuggerUrl);try{await _.open();const nt=`(() => {
              const inject = () => ${S};
              if (document.readyState === 'loading') window.addEventListener('DOMContentLoaded', inject, { once: true });
              else inject();
            })()`,ke=await _.addScriptToEvaluateOnNewDocument(nt);ke&&W.set($.id,ke),await _.evaluate(`(() => { window.__dreamWorkForceApply = true; return ${S}; })()`),p.add($.id)}finally{_.close()}}const oe=new N($.webSocketDebuggerUrl);let ye=!1;try{await oe.open(),ye=await oe.evaluate(`(() => {
            const host = document.getElementById('${E}-host');
            return Boolean(document.getElementById('${D}') && host?.shadowRoot?.getElementById('${E}') && document.documentElement.dataset.dreamTheme);
          })()`)}catch{}finally{oe.close()}if(ye){if(A!==$.id)A=$.id,x=Date.now();else if(Date.now()-x>=2e3)return dn(t,S,p),me(e,n),{success:!0,applied:1}}else A="",x=0;await new Promise(_=>setTimeout(_,250))}return{success:!1,applied:0,error:"HanaAgent renderer did not stabilize with the injected theme"}}return M>0&&me(e,n),{success:M>0,applied:M}}catch(i){return console.error("[injector] Injection failed:",i),{success:!1,applied:0,error:i.message}}}async function ln(e,n,t={}){return un(e,n,t)}function dn(e,n,t){const r=z.get(e);r&&clearInterval(r);const o=(R.get(e)??0)+1;R.set(e,o);let a=!1;const s=setInterval(async()=>{if(!a&&R.get(e)===o){a=!0;try{const i=(await K(e,".hanako/artifacts/renderer/",{timeoutMs:1e3,quiet:!0}))[0];if(!i||R.get(e)!==o)return;const l=new N(i.webSocketDebuggerUrl);try{await l.open();const m=await l.evaluate(`(() => {
          const host = document.getElementById('${E}-host');
          if (document.documentElement.dataset.dreamThemeRestored === 'true') return 'restored';
          return document.getElementById('${D}') && host?.shadowRoot?.getElementById('${E}') && document.documentElement.dataset.dreamTheme
            ? 'ready'
            : 'missing';
        })()`).catch(()=>"missing");if(m==="ready"||m==="restored"){t.add(i.id);return}if(console.log(`[injector] HanaAgent watcher restoring theme on renderer target ${i.id}`),R.get(e)!==o)return;const h=`(() => {
          const inject = () => ${n};
          if (document.readyState === 'loading') window.addEventListener('DOMContentLoaded', inject, { once: true });
          else inject();
        })()`;if(!t.has(i.id)){const g=await l.addScriptToEvaluateOnNewDocument(h);g&&W.set(i.id,g)}if(await l.evaluate(n),R.get(e)!==o){await l.evaluate(`(() => {
            document.getElementById('${D}')?.remove();
            document.getElementById('${E}-host')?.remove();
            clearInterval(window.__dreamWorkMenuGuard);
            delete window.__dreamWorkMenuGuard;
            delete document.documentElement.dataset.dreamTheme;
          })()`).catch(()=>{});return}t.add(i.id)}finally{l.close()}}catch{await mn(e)||(clearInterval(s),z.delete(e))}finally{a=!1}}},1e3);z.set(e,s)}async function mn(e){try{return(await fetch(`http://127.0.0.1:${e}/json/version`,{signal:AbortSignal.timeout(500)})).ok}catch{return!1}}async function un(e,n,t={}){var c;const r=t.rendererUrlHint?[t.rendererUrlHint]:((c=P(e))==null?void 0:c.rendererHints)??["renderer/index.html","index.html"];let o=[];for(const i of r)try{if(o=await K(n,i,{timeoutMs:1e3,quiet:!0}),o.length>0)break}catch{}if(o.length===0)try{const l=await(await fetch(`http://127.0.0.1:${n}/json/list`,{signal:AbortSignal.timeout(5e3)})).json();o=(Array.isArray(l)?l:[]).filter(be).sort((m,h)=>{const g=[String(m.id??""),m.url,m.webSocketDebuggerUrl],w=[String(h.id??""),h.url,h.webSocketDebuggerUrl];for(let f=0;f<g.length;f++){if(g[f]<w[f])return-1;if(g[f]>w[f])return 1}return 0})}catch{}if(o.length===0)return{installed:!1,menu:!1,targets:0};const a=[];for(const i of o){const l=new N(i.webSocketDebuggerUrl);try{if(await l.open(),e==="workbuddy"&&!await l.evaluate("(() => document.body?.dataset.applicationName === 'workbuddy')()"))continue;const m=await l.evaluate(`(() => {
        const style = document.getElementById('${D}');
        const menuHost = document.getElementById('${E}-host');
        const menu = document.getElementById('${E}') || menuHost?.shadowRoot?.getElementById('${E}');
        return JSON.stringify({
          installed: Boolean(style),
          menu: Boolean(menu),
          themeId: document.documentElement.dataset.dreamTheme ?? undefined
        });
      })()`),h=JSON.parse(m);a.push(h)}catch(m){console.warn(`[injector] Status check failed for ${e} target ${i.id}:`,m)}finally{l.close()}}const s=a.find(i=>i.installed&&i.themeId)??a.find(i=>i.installed);return{installed:a.some(i=>i.installed),menu:a.some(i=>i.menu),themeId:s==null?void 0:s.themeId,targets:a.length}}async function hn(e,n,t={}){var a;if(e==="hana-agent"){R.set(n,(R.get(n)??0)+1);const s=z.get(n);s&&clearInterval(s),z.delete(n)}const r=t.rendererUrlHint??((a=P(e))==null?void 0:a.rendererHints[0])??"renderer/index.html";let o=[];try{o=await K(n,r)}catch{}if(o.length===0)try{const c=await(await fetch(`http://127.0.0.1:${n}/json/list`,{signal:AbortSignal.timeout(5e3)})).json();o=(Array.isArray(c)?c:[]).filter(be).sort((i,l)=>{const m=[String(i.id??""),i.url,i.webSocketDebuggerUrl],h=[String(l.id??""),l.url,l.webSocketDebuggerUrl];for(let g=0;g<m.length;g++){if(m[g]<h[g])return-1;if(m[g]>h[g])return 1}return 0})}catch{}if(o.length===0)return{success:!1};for(const s of e==="hana-agent"?o:o.slice(0,1)){const c=new N(s.webSocketDebuggerUrl);if(await c.open(),e==="hana-agent"){const i=W.get(s.id);i&&(await c.removeScriptToEvaluateOnNewDocument(i).catch(()=>{}),W.delete(s.id))}await c.evaluate(`(() => {
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
    })`),c.close()}return{success:!0}}function pn(e,n,t,r){const o=Ee(e),a=r.map(c=>L(t??o,o,c)),s=X(Ee(n),a,4.5);return{text:V(s),textSubtle:V(X(L(o,s,.88),a,3)),textSubtlest:V(X(L(o,s,.8),a,3)),textSecondary:V(X(L(o,s,.72),a,3))}}function Pe(e,n,t,r=null,o={}){var m,h,g,w;const a=((m=n.colors)==null?void 0:m.surface)??"#f7fbff",s=((h=n.colors)==null?void 0:h.text)??"#17344f",c=o.template?{text:s,textSubtle:b.textSubtle,textSubtlest:b.textSubtlest,textSecondary:b.textSecondary}:pn(a,s,r,Ve(e)),i={accent:((g=n.colors)==null?void 0:g.accent)??"#24c9d7",secondary:((w=n.colors)==null?void 0:w.secondary)??"#ef8fd3",surface:a,...c};if(e==="codex")return kn(n,t,i);const l=P(e);return(l==null?void 0:l.kind)==="vscode-work"?gn(n,t,i):(l==null?void 0:l.kind)==="generic-work"?e==="hana-agent"?Ze(n,t,i):fn(e,n,t,i):Qe({...n,copy:null},t,i)}function gn(e,n,t){return`/* DREAM_THEME:${e.id} */
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
`}function fn(e,n,t,r){const o={"qoder-work":'#root > div, [class*="layout"], [class*="content-area"], [class*="main-content"]',catpaw:".main-area, .main-content-container, .main-content, .chat-content-area",zcode:'main, main > div, [class*="min-h-0"][class*="flex-1"]',"qwen-office":".agents-content-area, .agents-parchment-paper-surface"},a={"qoder-work":'[class*="sidebar"]',catpaw:".sidebar-wrapper, .sidebar",zcode:"#sidebar, aside","qwen-office":".agents-sidebar, .group\\/sidebar"},s=o[e]??'main, [role="main"], [class*="main-content"]',c=a[e]??'aside, nav, [class*="sidebar"]',i=e==="qoder-work"?xn(r):e==="catpaw"?yn(t,r):e==="zcode"?bn(r):"",l=e==="zcode"?'[class*="composer"], [class*="input-container"]':'[class*="message"], [class*="bubble"], [class*="composer"], [class*="input-container"]',m=e==="zcode"?`url(${JSON.stringify(t)}) center / cover no-repeat fixed !important`:`linear-gradient(90deg, color-mix(in srgb, ${r.surface} 82%, transparent) 0 12%, transparent 42%), url(${JSON.stringify(t)}) center / cover no-repeat fixed !important`;return`/* DREAM_THEME:${n.id} */
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
}
html, body, #root { background: ${r.surface} !important; color: ${r.text} !important; }
:is(${c}) {
  background: color-mix(in srgb, ${r.surface} 90%, transparent) !important;
  color: ${r.text} !important;
  backdrop-filter: blur(20px) saturate(108%);
}
:is(${s}) {
  background: ${m};
  color: ${r.text} !important;
}
:is(${s}) :where([class*="message"], [class*="chat"], [class*="composer"], [class*="editor"], [contenteditable="true"], textarea) {
  color: ${r.text} !important;
}
:is(${s}) :where(${l}) {
  background-color: color-mix(in srgb, ${r.surface} 88%, transparent) !important;
  backdrop-filter: blur(16px) saturate(108%);
}
:is(${s}) :where(p, span, li, h1, h2, h3, h4, strong, em) { color: ${r.text} !important; }
button[class*="bg-primary"], button[class*="bg-accent"] { background-color: ${r.accent} !important; color: #fff !important; }
${i}`}function bn(e){return`
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
  [class~="group/assistant-row"] > [data-conversation-selectable],
  [data-row-id]:has([data-reasoning-content])
) {
  border: 1px solid color-mix(in srgb, ${e.accent} 30%, transparent) !important;
  border-radius: 16px !important;
  background: color-mix(in srgb, ${e.surface} 76%, transparent) !important;
  box-shadow: 0 12px 30px color-mix(in srgb, ${e.surface} 30%, transparent), inset 0 1px color-mix(in srgb, white 12%, transparent) !important;
  backdrop-filter: blur(14px) saturate(108%) !important;
}

:is(main) [class~="group/user-row"] > div:first-child {
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

/* 设置页内容区里的分块背景区域（卡片/区块/分段容器）同款毛玻璃材质。 */
html:has(aside.min-w-0 nav) main :where(
  div[class*="group/card"],
  div[class*="bg-card"],
  div[class*="bg-surface"],
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

/* 辅助对话（侧边面板，不在 main 内）的消息行：同款毛玻璃材质。 */
div.border-l.border-border :where(
  [class~="group/user-row"] > div:first-child,
  [class~="group/assistant-row"] > [data-conversation-selectable],
  [data-row-id]:has([data-reasoning-content])
) {
  border: 1px solid color-mix(in srgb, ${e.accent} 30%, transparent) !important;
  border-radius: 16px !important;
  background: color-mix(in srgb, ${e.surface} 76%, transparent) !important;
  box-shadow: 0 12px 30px color-mix(in srgb, ${e.surface} 30%, transparent), inset 0 1px color-mix(in srgb, white 12%, transparent) !important;
  backdrop-filter: blur(14px) saturate(108%) !important;
  color: ${e.text} !important;
  text-shadow: none !important;
}
div.border-l.border-border [class~="group/user-row"] > div:first-child {
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
`}function Ze(e,n,t){return`/* DREAM_THEME:${e.id} */
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
}`}function wn(e){return`(() => {
    const themes = ${JSON.stringify(e.themes)};
    const cssTemplate = ${JSON.stringify(e.cssTemplate)};
    const sentinels = ${JSON.stringify(b)};
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
  })()`}function xn(e){return`
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
}`}function yn(e,n){return`
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
`}function Ae(e,n=""){return JSON.stringify(typeof e=="string"?e:n)}function Qe(e,n,t){var o,a;return`/* DREAM_THEME:${String(e.id??"custom").replace(/[^a-z0-9_-]/gi,"")} */
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
  content: ${Ae((o=e.copy)==null?void 0:o.brand)};
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
  content: ${Ae((a=e.copy)==null?void 0:a.headline)};
  color: var(--wb-text);
  font: 750 clamp(18px, 2.7vw, 42px)/1.15 ui-rounded, system-ui;
  text-shadow: 0 2px 12px white;
  pointer-events: none;
}`}function kn(e,n,t){const r=vn(t.surface),o=r?`color-mix(in srgb, ${t.surface} 90%, transparent)`:`color-mix(in srgb, ${t.surface} 86%, transparent)`,a=r?`color-mix(in srgb, ${t.accent} 16%, ${t.surface})`:`color-mix(in srgb, ${t.accent} 42%, ${t.surface})`,s=r?"#172033":`color-mix(in srgb, ${t.surface} 72%, #000000)`,c="#f2f6ff",i=`/* DREAM_THEME:${e.id} */
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
`+l}function vn(e){const n=/^#([0-9a-f]{6})$/i.exec(e);if(!n)return!0;const t=parseInt(n[1],16);return .299*(t>>16&255)+.587*(t>>8&255)+.114*(t&255)>140}function Cn(e){return`(() => {
  const data = ${JSON.stringify({styleId:e.styleId,menuId:e.menuId,activeId:e.currentThemeId,themes:e.themes,cssTemplate:e.cssTemplate,sentinels:b,storageKey:"dreamCustomThemes",selectedKey:"wb-dream-selected",sharedCustomThemes:e.sharedCustomThemes,sharedCustomThemeService:e.sharedCustomThemeService})};
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
})()`}function Sn(e){const n=JSON.stringify(e.themes),t=JSON.stringify(e.cssTemplate??""),r=e.appId,o=e.surfaceAlphas??Ge;return`(() => {
  const themes = ${n};
  const cssTemplate = ${t};
  const sentinels = ${JSON.stringify(b)};
  const surfaceAlphas = ${JSON.stringify(o)};
  const currentThemeId = '${e.currentThemeId}';
  const appId = '${r}';
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
    const buckets = new Map();
    let luminanceSum = 0;
    let rSum = 0, gSum = 0, bSum = 0;
    let count = 0;
    for (let index = 0; index < pixels.length; index += 4) {
      const r = pixels[index], g = pixels[index + 1], b = pixels[index + 2];
      const max = Math.max(r, g, b), min = Math.min(r, g, b);
      const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      luminanceSum += luminance;
      rSum += r;
      gSum += g;
      bSum += b;
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
    const averageLuminance = count ? luminanceSum / count : 128;
    const ranked = [...buckets.values()].sort((left, right) => right.weight - left.weight)
      .map((entry) => ({ rgb: [entry.r / entry.weight, entry.g / entry.weight, entry.b / entry.weight], hue: entry.hue }));
    const accent = ranked[0]?.rgb || [36, 201, 215];
    const secondary = ranked.find((entry) => Math.abs(entry.hue - (ranked[0]?.hue || 0)) > 50)?.rgb || mix(accent, [255, 255, 255], 0.35);
    const light = averageLuminance > 128;
    // average：整图平均色，供 deriveTextColors 与 surface 合成实际背景
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
      sample.width = 48;
      sample.height = Math.max(1, Math.round(48 * image.height / image.width));
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
})()`}async function Tn(e){try{return I.platform()==="win32"?$n(e):I.platform()==="darwin"?En(e):I.platform()==="linux"?In(e):{success:!1,error:`Unsupported platform: ${I.platform()}`}}catch(n){return{success:!1,error:n.message}}}function $n(e){const n=d.join(I.homedir(),"Desktop"),t=d.join(n,`${e.label}.lnk`),r=process.execPath,o=d.dirname(r),a=`
    $WshShell = New-Object -comObject WScript.Shell
    $Shortcut = $WshShell.CreateShortcut("${t.replace(/\\/g,"\\\\")}")
    $Shortcut.TargetPath = "${r.replace(/\\/g,"\\\\")}"
    $Shortcut.Arguments = "--launch=${e.appId}:${e.themeId}"
    $Shortcut.WorkingDirectory = "${o.replace(/\\/g,"\\\\")}"
    $Shortcut.Save()
  `;return new Promise(s=>{require("child_process").exec(`powershell -Command "${a.replace(/"/g,'\\"')}"`,c=>{s(c?{success:!1,error:c.message}:{success:!0,path:t})})})}function En(e){const n=d.join(I.homedir(),"Desktop"),t=d.join(n,`${e.label}.app`),o=`
    tell application "Terminal"
      do script "'${process.execPath}' --launch=${e.appId}:${e.themeId}"
    end tell
  `,a=d.join(n,`${e.id}.scpt`);return u.writeFileSync(a,o),new Promise(s=>{require("child_process").exec(`osacompile -o "${t}" "${a}"`,c=>{u.unlinkSync(a),s(c?{success:!1,error:c.message}:{success:!0,path:t})})})}async function In(e){const n=d.join(I.homedir(),".local","share","applications");u.existsSync(n)||u.mkdirSync(n,{recursive:!0});const t=d.join(n,`${e.id}.desktop`),r=process.execPath,o=`[Desktop Entry]
Type=Application
Name=${e.label}
Exec="${r}" --launch=${e.appId}:${e.themeId}
Icon=${e.icon||"utilities-terminal"}
Terminal=false
Categories=Utility;
`;return u.writeFileSync(t,o),u.chmodSync(t,493),{success:!0,path:t}}const Pn=he.promisify(te.execFile),An="https://api.dreamskin.cc",Ye=`${An}/v1/themes`,et=32*1024*1024,ee=6;let le=0;const Mn=["workbuddy","codex","trae-work","qoder-work","catpaw","zcode","qwen-office","hana-agent"];async function jn(){const e=le,n=await Dn(e),t=n.items;le=e+t.length>=n.total?0:e+ee;const r=Le(),o={checked:t.length,imported:0,skipped:0,offset:e,page:Math.floor(e/ee)+1,total:n.total,nextOffset:le,failed:[]};for(const a of t){const s=Un(a.themeId);if(!a.applyCompatible||Be(s)){o.skipped++;continue}try{await _n(a,r,s)?o.imported++:o.skipped++}catch(c){o.failed.push({id:a.id,name:a.name,error:c.message})}}return o}async function Dn(e){const n=`${Ye}?limit=${ee}&offset=${e}&sort=recent`,t=await fetch(n,{signal:AbortSignal.timeout(3e4),redirect:"error"});if(!t.ok)throw new Error(`Theme list request failed: HTTP ${t.status}`);const r=await t.json();if(!Array.isArray(r.items)||r.items.length>ee||!Number.isInteger(r.total)||r.total<0)throw new Error("Theme list response is invalid");return{items:r.items,total:r.total}}async function _n(e,n,t){Nn(e);const r=u.mkdtempSync(d.join(I.tmpdir(),"dream-work-theme-")),o=d.join(r,"theme.zip"),a=d.join(r,"extract"),s=d.join(n,`.updating-${t}-${process.pid}`);try{u.mkdirSync(a);const c=`${Ye}/${e.id}/download`,i=await fetch(c,{signal:AbortSignal.timeout(12e4),redirect:"error"});if(!i.ok)throw new Error(`Theme download failed: HTTP ${i.status}`);const l=Buffer.from(await i.arrayBuffer());if(l.length!==e.packageBytes)throw new Error(`Downloaded size mismatch: expected ${e.packageBytes}, got ${l.length}`);if(l.length>et)throw new Error("Theme package exceeds 32 MiB");if(pe.createHash("sha256").update(l).digest("hex")!==e.packageSha256)throw new Error("Downloaded SHA-256 does not match metadata");u.writeFileSync(o,l,{flag:"wx"}),await On(o,a);const h=Rn(a),g=JSON.parse(u.readFileSync(d.join(h,"theme.json"),"utf8")),w=g.image;if(typeof w!="string"||d.basename(w)!==w||!/\.(png|jpe?g|webp)$/i.test(w))throw new Error("Theme image name is invalid");const f=d.join(h,w),v=d.join(h,"theme.css");if(!u.existsSync(f)||!u.statSync(f).isFile())throw new Error("Theme image is missing");if(!u.existsSync(v)||!u.statSync(v).isFile())throw new Error("theme.css is missing");const S=Ln(g,e,t,`hero${d.extname(w).toLowerCase()}`);return Xt(S.name,S.author,f)?!1:(u.mkdirSync(s),u.copyFileSync(f,d.join(s,S.hero)),u.copyFileSync(v,d.join(s,"theme.css")),u.writeFileSync(d.join(s,"theme.json"),`${JSON.stringify(S,null,2)}
`),u.renameSync(s,d.join(n,t)),!0)}finally{u.rmSync(s,{recursive:!0,force:!0}),u.rmSync(r,{recursive:!0,force:!0})}}async function On(e,n){const{path7za:t}=require("7zip-bin");await Pn(t,["x",e,`-o${n}`,"-y"],{windowsHide:!0,timeout:12e4})}function Rn(e){const t=[e,...u.readdirSync(e,{withFileTypes:!0}).filter(r=>r.isDirectory()).map(r=>d.join(e,r.name))].filter(r=>u.existsSync(d.join(r,"theme.json"))&&u.existsSync(d.join(r,"theme.css")));if(t.length!==1)throw new Error("Theme ZIP must contain one theme root");return t[0]}function Nn(e){if(!/^ver_[a-z0-9]{8,64}$/.test(e.id))throw new Error("Theme version ID is invalid");if(!Number.isInteger(e.packageBytes)||e.packageBytes<1||e.packageBytes>et)throw new Error("Theme package size is invalid");if(!/^[a-f0-9]{64}$/.test(e.packageSha256))throw new Error("Theme package SHA-256 is invalid")}function Un(e){return String(e).toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").replace(/-+/g,"-")||"community-theme"}function Ln(e,n,t,r){const o=e.appearance==="dark"?"dark":"light",a=o==="dark"?"#10141c":"#f4f7fa",s=e.colors||{};return{schemaVersion:1,id:t,name:String(e.name||n.name||t).trim(),author:n.authorDisplayName||"DreamSkin Community",hero:r,colors:{accent:H(s.accent,"#4f8cff",a),secondary:H(s.secondary||s.accentAlt,"#7ba7d8",a),surface:H(s.panelAlt||s.panel||s.background,a,a),text:H(s.text,o==="dark"?"#eef2f7":"#1f2937",a)},copy:null,apps:Object.fromEntries(Mn.map(c=>[c,{compat:!0}]))}}function H(e,n,t){if(typeof e!="string")return n;const r=e.trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i);if(r){let i=r[1];return i.length===3&&(i=i.split("").map(l=>l+l).join("")),`#${i.slice(0,6).toLowerCase()}`}const o=e.trim().match(/^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*(0|1|0?\.\d+))?\s*\)$/i);if(!o)return n;const a=o[4]===void 0?1:Number(o[4]),s=H(t,n,n).slice(1).match(/../g).map(i=>parseInt(i,16));return`#${[1,2,3].map(i=>Math.round(Number(o[i])*a+s[i-1]*(1-a))).map(i=>i.toString(16).padStart(2,"0")).join("")}`}let q=null;y.protocol.registerSchemesAsPrivileged([{scheme:"theme-asset",privileges:{standard:!0,secure:!0,supportFetchAPI:!0,stream:!0}}]);function tt(){q=new y.BrowserWindow({width:1200,height:800,webPreferences:{preload:d.join(__dirname,"preload.js"),contextIsolation:!0,nodeIntegration:!1}}),process.env.VITE_DEV_SERVER_URL?q.loadURL(process.env.VITE_DEV_SERVER_URL):q.loadFile(d.join(__dirname,"../renderer/dist/index.html"))}y.app.whenReady().then(()=>{y.protocol.handle("theme-asset",e=>{const n=decodeURIComponent(new URL(e.url).pathname.replace(/^\//,"")),t=Kt(n);return t?new Response(u.readFileSync(t),{headers:{"Content-Type":Bn(t),"Cache-Control":"public, max-age=3600"}}):new Response("Theme asset not found",{status:404})}),tt()});function Bn(e){const n=d.extname(e).toLowerCase();return n===".jpg"||n===".jpeg"?"image/jpeg":n===".webp"?"image/webp":"image/png"}y.app.on("window-all-closed",()=>{process.platform!=="darwin"&&y.app.quit()});y.app.on("activate",()=>{y.BrowserWindow.getAllWindows().length===0&&tt()});const Me=process.argv.find(e=>e.startsWith("--launch="));if(Me){const[,e]=Me.split("="),[n,t]=e.split(":");n&&t&&(console.log(`[main] Received launch args: ${n}:${t}`),setTimeout(async()=>{try{const r=await Ne(n,t);r.success?(console.log(`[main] Launched ${n} with theme ${t} on port ${r.port}`),setTimeout(async()=>{try{console.log(`[main] Starting theme injection for ${n}:${t} on port ${r.port}`);const o=await Xe(n,t,r.port);console.log("[main] Injection result:",o)}catch(o){console.error("[main] Failed to inject theme:",o)}},3e3)):console.error(`[main] Failed to launch ${n}: ${r.error}`)}catch(r){console.error("[main] Launch error:",r)}},1e3))}y.ipcMain.handle("discover-apps",async()=>Ct());y.ipcMain.handle("list-app-path-configurations",()=>ht());y.ipcMain.handle("choose-custom-app-path",async(e,n)=>{if(process.platform!=="win32")return{success:!1,error:"自定义应用路径目前仅支持 Windows。"};const t=P(n);if(!t)return{success:!1,error:`Unknown app: ${n}`};const r={title:`选择 ${t.name} 的可执行文件`,buttonLabel:"选择此文件",properties:["openFile"],filters:[{name:`${t.name} 可执行文件`,extensions:["exe"]}]},o=q?await y.dialog.showOpenDialog(q,r):await y.dialog.showOpenDialog(r);if(o.canceled||o.filePaths.length===0)return{success:!1,cancelled:!0};try{return{success:!0,path:gt(n,o.filePaths[0])}}catch(a){return{success:!1,error:(a==null?void 0:a.message)||String(a)}}});y.ipcMain.handle("clear-custom-app-path",(e,n)=>{try{return ft(n),{success:!0}}catch(t){return{success:!1,error:(t==null?void 0:t.message)||String(t)}}});y.ipcMain.handle("launch-app",async(e,n,t)=>Ne(n,t));y.ipcMain.handle("apply-theme",async(e,n,t,r)=>Xe(n,t,r));y.ipcMain.handle("create-shortcut",async(e,n)=>{const t={...n,id:`${n.appId}-${n.themeId}-${Date.now()}`};return Tn(t)});y.ipcMain.handle("list-themes",async(e,n)=>re(n).map(t=>({id:t.id,name:t.name,author:t.author,hero:Gt(t.id)})));y.ipcMain.handle("update-themes",async()=>jn());y.ipcMain.handle("get-status",async(e,n,t)=>{var o;return await St(n)?{...await ln(n,t||((o=P(n))==null?void 0:o.defaultPort)||9339),running:!0}:{installed:!1,menu:!1,targets:0,running:!1}});y.ipcMain.handle("remove-skin",async(e,n,t)=>hn(n,t));y.ipcMain.handle("debug-targets",async(e,n)=>{try{const r=await(await fetch(`http://127.0.0.1:${n}/json/list`,{signal:AbortSignal.timeout(5e3)})).json();return{success:!0,count:r.length,raw:r,targets:r.map(o=>({id:o.id,type:o.type,url:o.url,title:o.title,webSocketDebuggerUrl:o.webSocketDebuggerUrl}))}}catch(t){return{success:!1,error:t.message}}});
