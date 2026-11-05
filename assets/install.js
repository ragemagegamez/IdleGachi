/* "Install app" button for the home screen. Chrome/Edge/Android: uses the browser's install prompt.
   iPhone/iPad Safari has no prompt, so it shows the Share > Add to Home Screen steps instead.
   Hidden once installed, or after the player taps "Not now". */
(() => {
  const KEY = 'ig_install_hide', standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  if (standalone) return;
  try { if (localStorage.getItem(KEY)) return } catch (e) {}
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform == 'MacIntel' && navigator.maxTouchPoints > 1);
  let deferred = null, box = null;
  const css = document.createElement('style');
  css.textContent = `.igi{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(14px + env(safe-area-inset-bottom,0px));z-index:9999;width:min(420px,calc(100% - 24px));
    background:#000;color:#f4f4ff;border:4px solid #fff;border-radius:12px;box-shadow:0 0 0 4px #000,0 0 0 6px #4a5aa0,0 8px 0 6px rgba(0,0,0,.5);
    padding:12px 14px;font:20px/1.2 VT323,'Courier New',monospace;display:flex;gap:12px;align-items:center}
  .igi img{width:44px;height:44px;border-radius:8px;image-rendering:pixelated;flex:none}
  .igi b{display:block;font:10px/1.5 'Press Start 2P',monospace;color:#ffd23f}
  .igi .t{flex:1;min-width:0}.igi .a{display:flex;flex-direction:column;gap:6px}
  .igi button{font:9px 'Press Start 2P',monospace;color:#fff;background:#ff4a4a;border:3px solid #fff;border-radius:8px;padding:9px 10px;box-shadow:0 4px 0 #6a0f1a;cursor:pointer}
  .igi button.no{background:#2348c8;box-shadow:0 4px 0 #0a1a5a}
  .igi button:active{transform:translateY(3px);box-shadow:0 1px 0 #000}`;
  function hide(forever) { if (box) box.remove(); box = null; if (forever) try { localStorage.setItem(KEY, '1') } catch (e) {} }
  function show(body, primary) {
    if (box) return; document.head.appendChild(css);
    box = document.createElement('div'); box.className = 'igi'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', 'Install IdleGachi');
    box.innerHTML = `<img src="/icons/icon-192.png" alt=""><div class="t"><b>Install IdleGachi</b>${body}</div><div class="a">${primary ? '<button class="go">Install</button>' : ''}<button class="no">Not now</button></div>`;
    box.querySelector('.no').onclick = () => hide(true);
    const go = box.querySelector('.go');
    if (go) go.onclick = async () => { hide(false); deferred.prompt(); const r = await deferred.userChoice; deferred = null; if (r.outcome == 'accepted') hide(true) };
    document.body.appendChild(box);
  }
  addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferred = e; show('Add it to your home screen and play like an app.', true) });
  addEventListener('appinstalled', () => hide(true));
  if (ios) setTimeout(() => show('Tap <span aria-label="Share">Share ⬆</span> at the bottom of Safari, then <b style="display:inline;font:inherit;color:#ffd23f">Add to Home Screen</b>.', false), 2500);
})();
