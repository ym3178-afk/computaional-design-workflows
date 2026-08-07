(() => {
  const host=document.createElement('div');
  host.style.cssText='position:fixed;left:16px;bottom:16px;z-index:2147483647';
  const root=host.attachShadow({mode:'open'});
  root.innerHTML=`<style>a{display:inline-flex;gap:8px;align-items:center;padding:10px 14px;border:1px solid rgba(82,99,91,.45);border-radius:999px;background:rgba(243,240,232,.92);color:#2f3632;text-decoration:none;font:400 13px Inter,-apple-system,"Segoe UI",sans-serif;letter-spacing:.08em;text-transform:uppercase;box-shadow:0 8px 28px rgba(47,54,50,.16);backdrop-filter:blur(10px)}a:hover{background:#52635b;color:#f3f0e8}</style><a href="../../index.html">← Structures of the Unseen</a>`;
  document.body.appendChild(host);
})();