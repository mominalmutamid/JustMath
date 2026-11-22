/* Change the version number below whenever you upload new files, so phones and PCs refresh their saved copy. */
const V='justmath-v3';
const FILES=['./', 'index.html', 'base.css', 'shelf.css', 'editor.css', 'state.js', 'canvas.js', 'input.js', 'ui.js', 'shelf.js', 'pwa.js','images.js','clip.js','pdf.js','color.js', 'font.woff2', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'icon-maskable.png', 'apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(hit=>{
    const net=fetch(e.request).then(r=>{if(r.ok&&new URL(e.request.url).origin===location.origin){const c=r.clone();caches.open(V).then(x=>x.put(e.request,c))}return r}).catch(()=>hit);
    e.waitUntil(net.catch(()=>{}));
    return hit||net}))});
