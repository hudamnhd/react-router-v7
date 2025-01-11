function u(){return u=Object.assign?Object.assign.bind():function(e){for(var t=1;t<arguments.length;t++){var r=arguments[t];for(var a in r)Object.prototype.hasOwnProperty.call(r,a)&&(e[a]=r[a])}return e},u.apply(this,arguments)}var p;(function(e){e.Pop="POP",e.Push="PUSH",e.Replace="REPLACE"})(p||(p={}));var m;(function(e){e.data="data",e.deferred="deferred",e.redirect="redirect",e.error="error"})(m||(m={}));var y=function(t,r){r===void 0&&(r={});let a=typeof r=="number"?{status:r}:r,i=new Headers(a.headers);return i.has("Content-Type")||i.set("Content-Type","application/json; charset=utf-8"),new Response(JSON.stringify(t),u({},a,{headers:i}))};var g=["post","put","patch","delete"],O=new Set(g),x=["get",...g],N=new Set(x);var I=Symbol("deferred");var c=(e,t={})=>y(e,t);var L=["/build/","/icons/"],v="asset-cache",w="data-cache",b="document-cache";function n(...e){}async function M(e){n("Service worker installed")}async function C(e){n("Service worker activated")}async function T(e){let t=new Map;if(e.data.type==="REMIX_NAVIGATION"){let{isMount:r,location:a,matches:i,manifest:S}=e.data,o=a.pathname+a.search+a.hash,[R,D,E]=await Promise.all([caches.open(w),caches.open(b),caches.match(o)]);if((!E||!r)&&(n("Caching document for",o),t.set(o,D.add(o).catch(s=>{n(`Failed to cache document for ${o}:`,s)}))),r){for(let s of i)if(S.routes[s.id].hasLoader){let h=new URLSearchParams(a.search);h.set("_data",s.id);let d=h.toString();d=d?`?${d}`:"";let l=a.pathname+d+a.hash;t.has(l)||(n("Caching data for",l),t.set(l,R.add(l).catch(P=>{n(`Failed to cache data for ${l}:`,P)})))}}}await Promise.all(t.values())}async function F(e){let t=new URL(e.request.url);if(_(e.request)){let r=await caches.match(e.request,{cacheName:v,ignoreVary:!0,ignoreSearch:!0});if(r)return n("Serving asset from cache",t.pathname),r;n("Serving asset from network",t.pathname);let a=await fetch(e.request);return a.status===200&&await(await caches.open(v)).put(e.request,a.clone()),a}if(j(e.request))try{n("Serving data from network",t.pathname+t.search);let r=await fetch(e.request.clone());return await(await caches.open(w)).put(e.request,r.clone()),r}catch{n("Serving data from network failed, falling back to cache",t.pathname+t.search);let a=await caches.match(e.request);return a?(a.headers.set("X-Remix-Worker","yes"),a):c({message:"Network Error"},{status:500,headers:{"X-Remix-Catch":"yes","X-Remix-Worker":"yes"}})}if(U(e.request))try{n("Serving document from network",t.pathname);let r=await fetch(e.request);return await(await caches.open(b)).put(e.request,r.clone()),r}catch(r){n("Serving document from network failed, falling back to cache",t.pathname);let a=await caches.match(e.request);if(a)return a;throw r}return fetch(e.request.clone())}function f(e,t){return t.includes(e.method.toLowerCase())}function _(e){return f(e,["get"])&&L.some(t=>e.url.startsWith(t))}function j(e){let t=new URL(e.url);return f(e,["get"])&&t.searchParams.get("_data")}function U(e){return f(e,["get"])&&e.mode==="navigate"}self.addEventListener("install",e=>{e.waitUntil(M(e).then(()=>self.skipWaiting()))});self.addEventListener("activate",e=>{e.waitUntil(C(e).then(()=>self.clients.claim()))});self.addEventListener("message",e=>{e.waitUntil(T(e))});self.addEventListener("fetch",e=>{e.respondWith((async()=>{let t={};try{t.response=await F(e)}catch(r){t.error=r}return A(e,t)})())});async function A(e,{error:t,response:r}){return r}
/*! Bundled license information:

@remix-run/router/dist/router.js:
  (**
   * @remix-run/router v1.21.0
   *
   * Copyright (c) Remix Software Inc.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE.md file in the root directory of this source tree.
   *
   * @license MIT
   *)

@remix-run/server-runtime/dist/esm/responses.js:
  (**
   * @remix-run/server-runtime v2.15.1
   *
   * Copyright (c) Remix Software Inc.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE.md file in the root directory of this source tree.
   *
   * @license MIT
   *)

@remix-run/server-runtime/dist/esm/index.js:
  (**
   * @remix-run/server-runtime v2.15.1
   *
   * Copyright (c) Remix Software Inc.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE.md file in the root directory of this source tree.
   *
   * @license MIT
   *)
*/
