let puppeteer;
try {
  ({ default: puppeteer } = await import('puppeteer'));
} catch {
  console.error('visual-audit requires Puppeteer. Install it temporarily with: npm install --no-save puppeteer');
  process.exit(1);
}

const AUDIT_URL = process.env.AUDIT_URL ?? 'http://localhost:3000';

const browser = await puppeteer.launch({
  headless: 'new',
  args: ['--no-sandbox', '--disable-gpu', '--use-gl=swiftshader', ...(process.env.CI ? ['--enable-unsafe-swiftshader', '--use-angle=swiftshader'] : [])],
});

const AUDIT_JS = (label) => {
  const fa = /[\u0600-\u06FF]/;
  const issues = [];
  const lum = (r,g,b) => { const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)}; return .2126*f(r)+.7152*f(g)+.0722*f(b); };
  const parseC = (s) => { const m = s.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/); return m ? [+m[1],+m[2],+m[3], m[4]===undefined?1:+m[4]] : null; };
  const effBg = (el) => {
    let node = el;
    while (node && node !== document.documentElement) {
      const c = parseC(getComputedStyle(node).backgroundColor);
      if (c && c[3] > 0.85) return c;
      node = node.parentElement;
    }
    return [7,6,4,1];
  };
  const visible = (el) => {
    if (!el.offsetParent && el.tagName !== 'BODY' && getComputedStyle(el).position !== 'fixed') return false;
    const cs = getComputedStyle(el);
    if (parseFloat(cs.opacity) < 0.15 || cs.visibility === 'hidden' || cs.display === 'none') return false;
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return false;
    if (r.bottom < 0 || r.top > innerHeight || r.right < 0 || r.left > innerWidth) return false;
    return true;
  };
  document.querySelectorAll('body *').forEach(el => {
    if (!visible(el)) return;
    const cs = getComputedStyle(el);
    const ownText = [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent.trim()).join(' ');
    if (!ownText) return;
    const isFa = fa.test(ownText);
    // 1) letter-spacing روی متن فارسی
    if (isFa && parseFloat(cs.letterSpacing) > 0.3) {
      issues.push(`FA-SPACING: "${ownText.slice(0,26)}" ls=${cs.letterSpacing} <${(el.className||el.tagName).toString().slice(0,34)}>`);
    }
    // 2) ارقام لاتین در متن فارسی
    if (isFa && /[0-9]/.test(ownText) && !/^\d+$/.test(ownText.trim())) {
      const latinDigits = ownText.match(/[0-9]+/g);
      if (latinDigits) issues.push(`MIXED-DIGITS: "${ownText.slice(0,32)}" ← ${latinDigits.slice(0,4).join(',')} <${(el.className||el.tagName).toString().slice(0,30)}>`);
    }
    // 3) ایتالیک روی فارسی
    if (isFa && cs.fontStyle === 'italic' && !el.matches('em')) {
      issues.push(`FA-ITALIC: "${ownText.slice(0,24)}" <${(el.className||el.tagName).toString().slice(0,30)}>`);
    }
    // 4) کنتراست
    const fg = parseC(cs.color);
    if (fg) {
      const bg = effBg(el);
      const L1 = lum(fg[0],fg[1],fg[2]), L2 = lum(bg[0],bg[1],bg[2]);
      const ratio = (Math.max(L1,L2)+.05)/(Math.min(L1,L2)+.05);
      const px = parseFloat(cs.fontSize);
      const bold = parseInt(cs.fontWeight) >= 600;
      const need = (px >= 24 || (px >= 18.66 && bold)) ? 3.0 : 4.5;
      if (ratio < need - 0.05 && parseFloat(cs.opacity) > 0.5) {
        issues.push(`CONTRAST ${ratio.toFixed(2)}:<${need} "${ownText.slice(0,22)}" ${px}px ${cs.color} on rgb(${bg.slice(0,3)}) <${(el.className||el.tagName).toString().slice(0,26)}>`);
      }
    }
    // 5) متن سرریز/کلیپ‌شده
    if (el.scrollWidth > el.clientWidth + 3 && cs.overflowX !== 'visible' && cs.whiteSpace === 'nowrap') {
      issues.push(`CLIPPED: "${ownText.slice(0,26)}" scrollW=${el.scrollWidth} clientW=${el.clientWidth} <${(el.className||el.tagName).toString().slice(0,30)}>`);
    }
  });
  // 6) سرریز افقی صفحه
  if (document.documentElement.scrollWidth > innerWidth + 2) {
    issues.push(`PAGE-OVERFLOW: ${document.documentElement.scrollWidth} > ${innerWidth}`);
  }
  return { label, issues: [...new Set(issues)] };
};

const run = async (page, label) => { const r = await page.evaluate(AUDIT_JS, label); if (r.issues.length) { console.log(`\n=== ${label} ===`); r.issues.slice(0, 30).forEach(i => console.log('  ', i)); } else console.log(`\n=== ${label} === CLEAN ✓`); return r; };

const mk = async (w, h, mobile) => {
  const p = await browser.newPage();
  await p.setViewport({ width: w, height: h, isMobile: !!mobile, hasTouch: !!mobile, deviceScaleFactor: mobile ? 2 : 1 });
  return p;
};

const go = (page, pr) => page.evaluate((pr) => { const max = document.querySelector('.hero').offsetHeight - innerHeight; window.__xvLenis?.scrollTo(pr*max,{immediate:true,force:true}); window.scrollTo(0,pr*max); }, pr);
const settle = (ms = 1500) => new Promise(r => setTimeout(r, ms));

// --- دسکتاپ EN
let p = await mk(1440, 900);
await p.goto(AUDIT_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
await settle(3500);
await run(p, 'EN desktop · hero');
for (const [pr, name] of [[0.26,'work'],[0.55,'skills'],[0.70,'services'],[0.97,'contact+FAQ']]) { await go(p, pr); await settle(); await run(p, `EN desktop · ${name}`); }
await p.close();

// --- دسکتاپ FA
p = await mk(1440, 900);
await p.goto(AUDIT_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
await settle(3000);
await p.click('.language'); await settle(900);
await run(p, 'FA desktop · hero');
for (const [pr, name] of [[0.26,'work'],[0.55,'skills'],[0.70,'services'],[0.92,'about'],[0.97,'contact+FAQ']]) { await go(p, pr); await settle(); await run(p, `FA desktop · ${name}`); }
// مودال FA
await go(p, 0.30); await settle();
await p.click('.journey-project--0 .journey-actions button'); await settle(600);
await run(p, 'FA desktop · modal');
await p.keyboard.press('Escape');
await p.close();

// --- موبایل FA
p = await mk(390, 844, true);
await p.goto(AUDIT_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
await settle(3500);
await p.click('.language'); await settle(900);
await run(p, 'FA mobile · hero');
await go(p, 0.97); await settle(1800);
await run(p, 'FA mobile · contact');
// منوی باز FA
await p.click('.menu-toggle'); await settle(800);
await run(p, 'FA mobile · menu open');
await p.close();

// --- ۴۰۴
p = await mk(1440, 900);
await p.goto(`${AUDIT_URL}/xyz-not-here`, { waitUntil: 'domcontentloaded', timeout: 60000 });
await settle(500);
await run(p, '404');
await p.close();

await browser.close();
console.log('\nAUDIT DONE');
