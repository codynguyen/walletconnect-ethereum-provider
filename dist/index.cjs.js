"use strict";Object.defineProperty(exports,"__esModule",{value:!0});var M=require("events"),p=require("@walletconnect/utils"),P=require("@walletconnect/universal-provider");function A(n){if(n&&n.__esModule)return n;var t=Object.create(null);return n&&Object.keys(n).forEach(function(e){if(e!=="default"){var s=Object.getOwnPropertyDescriptor(n,e);Object.defineProperty(t,e,s.get?s:{enumerable:!0,get:function(){return n[e]}})}}),t.default=n,Object.freeze(t)}const T="wc",R="ethereum_provider",S=`${T}@2:${R}:`,j="https://rpc.walletconnect.com/v1/",g=["eth_sendTransaction","personal_sign"],w=["eth_accounts","eth_requestAccounts","eth_sendRawTransaction","eth_sign","eth_signTransaction","eth_signTypedData","eth_signTypedData_v3","eth_signTypedData_v4","wallet_switchEthereumChain","wallet_addEthereumChain","wallet_getPermissions","wallet_requestPermissions","wallet_registerOnboarding","wallet_watchAsset","wallet_scanQRCode"],m=["chainChanged","accountsChanged"],_=["message","disconnect","connect"];var N=Object.defineProperty,q=Object.defineProperties,D=Object.getOwnPropertyDescriptors,O=Object.getOwnPropertySymbols,$=Object.prototype.hasOwnProperty,U=Object.prototype.propertyIsEnumerable,y=(n,t,e)=>t in n?N(n,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):n[t]=e,u=(n,t)=>{for(var e in t||(t={}))$.call(t,e)&&y(n,e,t[e]);if(O)for(var e of O(t))U.call(t,e)&&y(n,e,t[e]);return n},b=(n,t)=>q(n,D(t));function v(n){return Number(n[0].split(":")[1])}function f(n){return`0x${n.toString(16)}`}function Q(n){const{chains:t,optionalChains:e,methods:s,optionalMethods:i,events:a,optionalEvents:c,rpcMap:h}=n;if(!p.isValidArray(t))throw new Error("Invalid chains");const o={chains:t,methods:s||g,events:a||m,rpcMap:u({},t.length?{[v(t)]:h[v(t)]}:{})},r=a?.filter(l=>!m.includes(l)),d=s?.filter(l=>!g.includes(l));if(!e&&!c&&!i&&!(r!=null&&r.length)&&!(d!=null&&d.length))return{required:t.length?o:void 0};const C=r?.length&&d?.length||!e,E={chains:[...new Set(C?o.chains.concat(e||[]):e)],methods:[...new Set(o.methods.concat(i!=null&&i.length?i:w))],events:[...new Set(o.events.concat(c||_))],rpcMap:h};return{required:t.length?o:void 0,optional:e.length?E:void 0}}class I{constructor(){this.events=new M.EventEmitter,this.namespace="eip155",this.accounts=[],this.chainId=1,this.STORAGE_KEY=S,this.on=(t,e)=>(this.events.on(t,e),this),this.once=(t,e)=>(this.events.once(t,e),this),this.removeListener=(t,e)=>(this.events.removeListener(t,e),this),this.off=(t,e)=>(this.events.off(t,e),this),this.parseAccount=t=>this.isCompatibleChainId(t)?this.parseAccountId(t).address:t,this.signer={},this.rpc={}}static async init(t){const e=new I;return await e.initialize(t),e}async request(t){return await this.signer.request(t,this.formatChainId(this.chainId))}sendAsync(t,e){this.signer.sendAsync(t,e,this.formatChainId(this.chainId))}get connected(){return this.signer.client?this.signer.client.core.relayer.connected:!1}get connecting(){return this.signer.client?this.signer.client.core.relayer.connecting:!1}async enable(){return this.session||await this.connect(),await this.request({method:"eth_requestAccounts"})}async connect(t){if(!this.signer.client)throw new Error("Provider not initialized. Call init() first");this.loadConnectOpts(t);const{required:e,optional:s}=Q(this.rpc);try{const i=await new Promise(async(c,h)=>{var o;this.rpc.showQrModal&&((o=this.modal)==null||o.subscribeModal(r=>{!r.open&&!this.signer.session&&(this.signer.abortPairingAttempt(),h(new Error("Connection request reset. Please try again.")))})),await this.signer.connect(b(u({namespaces:u({},e&&{[this.namespace]:e})},s&&{optionalNamespaces:{[this.namespace]:s}}),{pairingTopic:t?.pairingTopic})).then(r=>{c(r)}).catch(r=>{h(new Error(r.message))})});if(!i)return;const a=p.getAccountsFromNamespaces(i.namespaces,[this.namespace]);this.setChainIds(this.rpc.chains.length?this.rpc.chains:a),this.setAccounts(a),this.events.emit("connect",{chainId:f(this.chainId)})}catch(i){throw this.signer.logger.error(i),i}finally{this.modal&&this.modal.closeModal()}}async disconnect(){this.session&&await this.signer.disconnect(),this.reset()}get isWalletConnect(){return!0}get session(){return this.signer.session}registerEventListeners(){this.signer.on("session_event",t=>{const{params:e}=t,{event:s}=e;s.name==="accountsChanged"?(this.accounts=this.parseAccounts(s.data),this.events.emit("accountsChanged",this.accounts)):s.name==="chainChanged"?this.setChainId(this.formatChainId(s.data)):this.events.emit(s.name,s.data),this.events.emit("session_event",t)}),this.signer.on("chainChanged",t=>{const e=parseInt(t);this.chainId=e,this.events.emit("chainChanged",f(this.chainId)),this.persist()}),this.signer.on("session_update",t=>{this.events.emit("session_update",t)}),this.signer.on("session_delete",t=>{this.reset(),this.events.emit("session_delete",t),this.events.emit("disconnect",b(u({},p.getSdkError("USER_DISCONNECTED")),{data:t.topic,name:"USER_DISCONNECTED"}))}),this.signer.on("display_uri",t=>{var e,s;this.rpc.showQrModal&&((e=this.modal)==null||e.closeModal(),(s=this.modal)==null||s.openModal({uri:t})),this.events.emit("display_uri",t)})}switchEthereumChain(t){this.request({method:"wallet_switchEthereumChain",params:[{chainId:t.toString(16)}]})}isCompatibleChainId(t){return typeof t=="string"?t.startsWith(`${this.namespace}:`):!1}formatChainId(t){return`${this.namespace}:${t}`}parseChainId(t){return Number(t.split(":")[1])}setChainIds(t){const e=t.filter(s=>this.isCompatibleChainId(s)).map(s=>this.parseChainId(s));e.length&&(this.chainId=e[0],this.events.emit("chainChanged",f(this.chainId)),this.persist())}setChainId(t){if(this.isCompatibleChainId(t)){const e=this.parseChainId(t);this.chainId=e,this.switchEthereumChain(e)}}parseAccountId(t){const[e,s,i]=t.split(":");return{chainId:`${e}:${s}`,address:i}}setAccounts(t){this.accounts=t.filter(e=>this.parseChainId(this.parseAccountId(e).chainId)===this.chainId).map(e=>this.parseAccountId(e).address),this.events.emit("accountsChanged",this.accounts)}getRpcConfig(t){var e,s;const i=(e=t?.chains)!=null?e:[],a=(s=t?.optionalChains)!=null?s:[],c=i.concat(a);if(!c.length)throw new Error("No chains specified in either `chains` or `optionalChains`");const h=i.length?t?.methods||g:[],o=i.length?t?.events||m:[],r=t?.optionalMethods||[],d=t?.optionalEvents||[],C=t?.rpcMap||this.buildRpcMap(c,t.projectId),E=t?.qrModalOptions||void 0;return{chains:i?.map(l=>this.formatChainId(l)),optionalChains:a.map(l=>this.formatChainId(l)),methods:h,events:o,optionalMethods:r,optionalEvents:d,rpcMap:C,showQrModal:!!(t!=null&&t.showQrModal),qrModalOptions:E,projectId:t.projectId,metadata:t.metadata}}buildRpcMap(t,e){const s={};return t.forEach(i=>{s[i]=this.getRpcUrl(i,e)}),s}async initialize(t){if(this.rpc=this.getRpcConfig(t),this.chainId=this.rpc.chains.length?v(this.rpc.chains):v(this.rpc.optionalChains),this.signer=await P.UniversalProvider.init({projectId:this.rpc.projectId,metadata:this.rpc.metadata,disableProviderPing:t.disableProviderPing,relayUrl:t.relayUrl,storageOptions:t.storageOptions}),this.registerEventListeners(),await this.loadPersistedSession(),this.rpc.showQrModal){let e;try{const{WalletConnectModal:s}=await Promise.resolve().then(function(){return A(require("@walletconnect/modal"))});e=s}catch{throw new Error("To use QR modal, please install @walletconnect/modal package")}if(e)try{this.modal=new e(u({projectId:this.rpc.projectId},this.rpc.qrModalOptions))}catch(s){throw this.signer.logger.error(s),new Error("Could not generate WalletConnectModal Instance")}}}loadConnectOpts(t){if(!t)return;const{chains:e,optionalChains:s,rpcMap:i}=t;e&&p.isValidArray(e)&&(this.rpc.chains=e.map(a=>this.formatChainId(a)),e.forEach(a=>{this.rpc.rpcMap[a]=i?.[a]||this.getRpcUrl(a)})),s&&p.isValidArray(s)&&(this.rpc.optionalChains=[],this.rpc.optionalChains=s?.map(a=>this.formatChainId(a)),s.forEach(a=>{this.rpc.rpcMap[a]=i?.[a]||this.getRpcUrl(a)}))}getRpcUrl(t,e){var s;return((s=this.rpc.rpcMap)==null?void 0:s[t])||`${j}?chainId=eip155:${t}&projectId=${e||this.rpc.projectId}`}async loadPersistedSession(){if(!this.session)return;const t=await this.signer.client.core.storage.getItem(`${this.STORAGE_KEY}/chainId`),e=this.session.namespaces[`${this.namespace}:${t}`]?this.session.namespaces[`${this.namespace}:${t}`]:this.session.namespaces[this.namespace];this.setChainIds(t?[this.formatChainId(t)]:e?.accounts),this.setAccounts(e?.accounts)}reset(){this.chainId=1,this.accounts=[]}persist(){this.session&&this.signer.client.core.storage.setItem(`${this.STORAGE_KEY}/chainId`,this.chainId)}parseAccounts(t){return typeof t=="string"||t instanceof String?[this.parseAccount(t)]:t.map(e=>this.parseAccount(e))}}const L=I;exports.EthereumProvider=L,exports.OPTIONAL_EVENTS=_,exports.OPTIONAL_METHODS=w,exports.REQUIRED_EVENTS=m,exports.REQUIRED_METHODS=g,exports.default=I;
//# sourceMappingURL=index.cjs.js.map
