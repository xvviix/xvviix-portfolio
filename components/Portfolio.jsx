'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import { Fragment, useEffect, useRef, useState, useCallback } from 'react';
import Lenis from 'lenis';
import Header from './Header';
import Loader from './Loader';
import WebGLBoundary from './WebGLBoundary';
import { faDigits } from '../lib/faDigits';

const SceneCanvas = dynamic(() => import('./scene'), { ssr: false });
// The timeline is entirely client-side (it follows the live Lenis/WebGL progress).
// Keeping it out of SSR also prevents stale HMR markup from causing hydration mismatches.
const Timeline = dynamic(() => import('./Timeline'), { ssr: false });
// Core Web Vitals logging for local profiling only — the import is statically
// eliminated from production builds by the environment check below.
const VitalsReporter = process.env.NODE_ENV !== 'production'
  ? dynamic(() => import('./VitalsReporter'), { ssr: false })
  : () => null;

const translations = {
  en: {
    nav: { work: 'Work', services: 'Expertise', about: 'About', contact: 'Start a project' },
    available: 'Available for selected projects',
    heroStories: [
      {
        pillar: 'PILLAR 01 · VISION',
        tag: '100% BESPOKE',
        title: 'Young mind. Serious craft.',
        copy: 'I’m Matin — a creative developer turning ambitious ideas into distinctive digital worlds with genuine character.',
      },
      {
        pillar: 'PILLAR 02 · ARCHITECTURE',
        tag: '60 FPS FLUIDITY',
        title: 'Clean code. Instant speed.',
        copy: 'Engineered from scratch with modern Next.js and pure WebGL. Zero templates, zero bloat, and sub-second load times.',
      },
      {
        pillar: 'PILLAR 03 · ORIGINALITY',
        tag: 'BESPOKE SOUL',
        title: 'Never from a template.',
        copy: 'Every visual system begins with your brand, your audience and one bold idea engineered to leave a permanent impression.',
      },
      {
        pillar: 'PILLAR 04 · REALTIME 3D',
        tag: 'WEBGL DEPTH',
        title: 'Design and code, together.',
        copy: 'One seamless process connecting art direction, custom shaders and real-time 3D physics from initial concept to launch.',
      },
      {
        pillar: 'PILLAR 05 · IMPACT',
        tag: 'MAX CONVERSION',
        title: 'Beauty has to perform.',
        copy: 'High aesthetic standards combined with relentless user experience clarity — turning fleeting attention into real action.',
      },
      {
        pillar: 'PILLAR 06 · COLLABORATION',
        tag: 'NEW HORIZON',
        title: 'Build the one they remember.',
        copy: 'Bring the ambitious idea. Together we will shape the identity, motion and architecture into something people cannot scroll past.',
      },
    ],
    serviceTag: 'Expertise / Build system',
    serviceTitle: 'Start with structure.<br/><em>Then make it sing.</em>',
    servicePhases: [
      { title: 'Base build', copy: 'Grid, hierarchy and a resilient responsive skeleton come together first.', meta: '01 / BUILDING' },
      { title: 'Color + design', copy: 'Color, type and motion give the structure its visual voice.', meta: '02 / DESIGNING' },
      { title: 'Go live', copy: 'The finished experience leaves the studio and meets the world.', meta: '03 / LIVE PREVIEW' },
    ],
    aboutTag: 'Behind XVVIIX',
    aboutTitle: 'Logic in the code.<br/><em>Instinct in the design.</em>',
    aboutLead: 'I’m Matin — an independent creative developer focused on digital work that looks exceptional and works in the real world.',
    aboutBody:
      'I design and build immersive websites and interactive products end-to-end, from the first art-direction sketch to the final line of production code. Every project is a custom piece of engineering — no templates, no page builders, no borrowed systems — with the kind of motion, depth and craft that only comes from writing every pixel yourself.',
    aboutSkills: [
      ['Next.js / React', 'Production-grade applications with SSR, streaming and sub-second TTI on modern Next.js and React 19.'],
      ['WebGL / Three.js', 'Custom shaders, post-processing and real-time 3D scenes through React Three Fiber — built to stay 60fps on real devices.'],
      ['Art direction', 'Typography-led visual systems, golden-age editorial composition and motion languages tailored to each brand.'],
      ['Bilingual / RTL', 'English and Persian (فارسی) shipped together — proper Vazirmatn typography, mirrored layouts, no letter-spacing bugs.'],
    ],
    aboutPhilosophy:
      'I believe a great website is a single, continuous feeling — not a stack of components. Every animation serves the story; every shadow has a reason; every interaction earns its place. The work is quiet where it should be quiet and bold where it should be bold, and it performs on real networks and real phones.',
    statProjects: 'Public projects', statSites: 'Live experiences', statLanguages: 'Languages',
    processTag: 'Process', processTitle: 'Clear path.<br/><em>Rare outcome.</em>',
    process: [
      ['Discover', 'We clarify the goal, audience, content and the emotion your brand needs to leave behind.', '01—02 DAYS'],
      ['Direct & build', 'Art direction, interaction and production code evolve as one connected system.', '01—03 WEEKS'],
      ['Polish & launch', 'Every screen is tested, every detail refined, and the final experience is shipped fast.', '02—03 DAYS'],
    ],
    contactTag: 'Now booking new projects',
    contactTitle: 'MAKE YOUR<br/>IDEA <em>REAL.</em>',
    contactCopy: 'Have something ambitious in mind? Tell me what you want to build. Let’s create the version people cannot scroll past.',
    contactCta: 'Send the brief',
  },
  fa: {
    nav: { work: 'پروژه‌ها', services: 'تخصص‌ها', about: 'درباره', contact: 'شروع همکاری' },
    available: 'آمادهٔ همکاری برای پروژه‌های منتخب',
    heroStories: [
      {
        pillar: 'ستون ۰۱ · چشم‌انداز',
        tag: 'کاملاً اختصاصی',
        title: 'ذهن جوان؛ اجرای جدی.',
        copy: 'من متینم؛ توسعه‌دهنده‌ای خلاق که ایده‌های بلندپروازانه را به دنیاهای دیجیتال متمایز و صاحب شخصیت تبدیل می‌کند.',
      },
      {
        pillar: 'ستون ۰۲ · معماری',
        tag: '۶۰ فریم پایدار',
        title: 'کد تمیز؛ سرعت فوق‌العاده.',
        copy: 'مهندسی‌شده از پایه با Next.js مدرن و WebGL خالص. بدون قالب‌های آماده، بدون کدهای اضافه و با پرفورمنس حداکثری.',
      },
      {
        pillar: 'ستون ۰۳ · اصالت',
        tag: 'هویت اصیل',
        title: 'هیچ‌وقت از یک قالب آماده.',
        copy: 'هر سیستم بصری از هویت برند شما، روانشناسی مخاطب و یک ایدهٔ ماندگار شکل می‌گیرد که در یادها ثبت شود.',
      },
      {
        pillar: 'ستون ۰۴ · سه‌بعدی بلادرنگ',
        tag: 'عمق و شیدرها',
        title: 'طراحی و کد، کنار هم.',
        copy: 'یک مسیر یکپارچه از کارگردانی هنری تا شیدرهای سفارشی و فیزیک سه‌بعدی بدون گم‌شدن ایده میان طراحی و اجرا.',
      },
      {
        pillar: 'ستون ۰۵ · کارایی و نتیجه',
        tag: 'حداکثر تبدیل',
        title: 'زیبایی باید موثر باشد.',
        copy: 'استانداردهای بصری پیشرفته در کنار شفافیت کامل تجربهٔ کاربر — تبدیل توجه مخاطب به اقدام و نتیجهٔ واقعی.',
      },
      {
        pillar: 'ستون ۰۶ · همکاری',
        tag: 'افق تازه',
        title: 'بیایید اثری ماندگار بسازیم.',
        copy: 'ایده‌ات را بیاور؛ با هم هویت، حرکت و معماری را به وب‌سایتی تبدیل می‌کنیم که کسی نتواند ساده از کنارش رد شود.',
      },
    ],
    serviceTag: 'تخصص‌ها / ساخت تجربه',
    serviceTitle: 'اول، ساختار.<br/><em>بعد، جان.</em>',
    servicePhases: [
      { title: 'ساخت پایه', copy: 'گرید، سلسله‌مراتب و اسکلت واکنش‌گرا ابتدا شکل می‌گیرد.', meta: '۰۱ / در حال ساخت' },
      { title: 'رنگ و طراحی', copy: 'رنگ، تایپوگرافی و حرکت به ساختار، شخصیت بصری می‌دهند.', meta: '۰۲ / در حال طراحی' },
      { title: 'آنلاین‌سازی', copy: 'تجربهٔ نهایی از استودیو خارج می‌شود و به جهان می‌رسد.', meta: '۰۳ / پیش‌نمایش آنلاین' },
    ],
    aboutTag: 'پشت XVVIIX',
    aboutTitle: 'منطق در کد؛<br/><em>غریزه در طراحی.</em>',
    aboutLead: 'من متینم؛ یک توسعه‌دهندهٔ خلاق مستقل که روی تجربه‌های دیجیتال زیبا، متفاوت و کاربردی تمرکز دارد.',
    aboutBody:
      'وب‌سایت‌های غوطه‌ور و محصولات تعاملی را از اول تا آخر — از اولین اسکیس کارگردانی هنری تا آخرین خط کد پروداکشن — خودم طراحی و می‌سازم. هر پروژه مهندسیِ سفارشی‌ست؛ بدون قالب آماده، بدون صفحه‌ساز، بدون سیستم قرض‌گرفته — با آن جنس حرکت، عمق و جزئیات که فقط وقتی پدید می‌آید که خودت تک‌تک پیکسل‌ها را بنویسی.',
    aboutSkills: [
      ['Next.js / React', 'اپلیکیشن‌های درجهٔ تولید با SSR، Streaming و TTI زیر یک ثانیه روی Next.js و React ۱۹ مدرن.'],
      ['WebGL / Three.js', 'شیدرهای سفارشی، Post-Processing و صحنه‌های سه‌بعدی بلادرنگ با React Three Fiber — طوری که روی دستگاه‌های واقعی ۶۰ فریم بماند.'],
      ['کارگردانی هنری', 'سیستم‌های بصری تایپوگرافی‌محور، کمپوزیسیون ادیتوریال طلایی و زبان حرکتی که فقط برازندهٔ همان برند است.'],
      ['دوزبانه / RTL', 'انگلیسی و فارسی کنار هم — با تایپوگرافی درست وزیرمتن، چیدمان آینه‌ای و بدون مشکل فاصلهٔ حروف.'],
    ],
    statProjects: 'پروژهٔ عمومی', statSites: 'تجربهٔ آنلاین', statLanguages: 'زبان',
    processTag: 'روند همکاری', processTitle: 'مسیر روشن؛<br/><em>نتیجهٔ کمیاب.</em>',
    process: [
      ['شناخت', 'هدف، مخاطب، محتوا و حسی را که برندتان باید در ذهن باقی بگذارد مشخص می‌کنیم.', '۱—۲ روز'],
      ['طراحی و ساخت', 'کارگردانی هنری، تعامل و کد نهایی به‌عنوان یک سیستم یکپارچه پیش می‌روند.', '۱—۳ هفته'],
      ['پرداخت و انتشار', 'تمام صفحه‌ها تست، جزئیات صیقل داده و تجربهٔ نهایی با سرعت منتشر می‌شود.', '۲—۳ روز'],
    ],
    contactTag: 'پذیرش پروژهٔ جدید',
    contactTitle: 'ایده‌ات را<br/><em>واقعی کن.</em>',
    contactCopy: 'یک ایدهٔ بلندپروازانه داری؟ از چیزی که می‌خواهی بسازی بگو. نسخه‌ای می‌سازیم که کسی نتواند ساده از کنارش رد شود.',
    contactCta: 'ارسال بریف',
  },
};

const projects = [
  { title: 'DASTIN', category: { en: 'BRAND EXPERIENCE / 2026', fa: 'تجربهٔ برند / ۲۰۲۶' }, image: '/projects/Dastin.jpg', alt: 'Dastin premium Persian food brand website', url: 'https://xvviix.github.io/Dastin/', tags: ['RTL', 'Art direction', 'Vanilla JS'], description: { en: 'A premium Persian food brand built through nature, story and quiet cinematic motion.', fa: 'یک برند غذایی پریمیوم ایرانی که با طبیعت، روایت و حرکت‌های سینمایی آرام شکل گرفته است.' } },
  { title: 'CHRONA', category: { en: 'HEALTH INTELLIGENCE / 2026', fa: 'هوش سلامت / ۲۰۲۶' }, image: '/projects/chrona-bio.jpg', alt: 'Chrona biological age platform', url: 'https://xvviix.github.io/chrona-bio/', tags: ['Data UI', 'Interactive', 'Health tech'], description: { en: 'Biological age intelligence translated into a precise, editorial clinical interface.', fa: 'هوش سن زیستی که به یک رابط بالینی دقیق، روایی و تعاملی تبدیل شده است.' } },
  { title: 'FORMA OS', category: { en: 'SOFTWARE PLATFORM / 2026', fa: 'پلتفرم نرم‌افزار / ۲۰۲۶' }, image: '/projects/forma-os.jpg', alt: 'Forma software platform website', url: 'https://xvviix.github.io/forma-os/', tags: ['SaaS', 'Product', 'Conversion'], description: { en: 'A sharp launch experience for ambitious software teams with product clarity at its core.', fa: 'یک تجربهٔ معرفی دقیق برای تیم‌های نرم‌افزاری بلندپرواز، با تمرکز اصلی روی وضوح محصول.' } },
  { title: 'LAJEVARD', category: { en: 'PERSIAN HOSPITALITY / 2026', fa: 'مهمان‌نوازی ایرانی / ۲۰۲۶' }, image: '/projects/lajevard-tea-house.jpg', alt: 'Lajevard Persian tea house website', url: 'https://xvviix.github.io/lajevard-tea-house/', tags: ['Editorial', 'RTL', 'Hospitality'], description: { en: 'An editorial digital home for a Tehran tea house, dressed in midnight blue and gold.', fa: 'خانه‌ای دیجیتال و روایی برای یک چایخانهٔ تهرانی، پوشیده در لاجورد و طلا.' } },
  { title: 'AETHER', category: { en: 'AI PLATFORM / 2026', fa: 'پلتفرم هوش مصنوعی / ۲۰۲۶' }, image: '/projects/aether.jpg', alt: 'Aether premium AI platform website', url: 'https://xvviix.github.io/aether/', tags: ['AI', 'Platform', 'Product'], description: { en: 'A premium AI platform experience shaped for elite developers and ambitious product teams.', fa: 'تجربه‌ای پریمیوم برای یک پلتفرم هوش مصنوعی، ویژهٔ توسعه‌دهندگان و تیم‌های محصول بلندپرواز.' } },
];

const projectTypes = {
  en: ['Portfolio', 'Brand Website', 'Landing Page', 'Web Application', 'E-commerce', 'Interactive / WebGL', 'Redesign', 'Other'],
  fa: ['پورتفولیو', 'وب‌سایت برند', 'لندینگ پیج', 'وب‌اپلیکیشن', 'فروشگاه آنلاین', 'تجربه تعاملی / وب‌جی‌اسال', 'ری‌دیزاین', 'سایر'],
};
const budgetTiers = {
  en: ['Starter', 'Professional', 'Premium'],
  fa: ['استارتر', 'حرفه‌ای', 'پریمیوم'],
};
const timelineTiers = {
  en: ['As soon as possible', 'Within a month', 'Flexible'],
  fa: ['عجله دارم', 'حداکثر تا یک ماه', 'انعطاف‌پذیرم'],
};
const EMAIL_ADDRESS = 'matinhabibi688@gmail.com';

// The brief as a single formatted message — shared by the Telegram share link,
// the mailto link and the submit flow, so every channel carries the same data.
const buildInquiryText = (v, isFa) => isFa
  ? `✨ *درخواست همکاری جدید — XVVIIX*\n\n👤 *نام:* ${v.name}\n🎯 *نوع پروژه:* ${v.type}\n⏱ *زمان‌بندی:* ${v.timeline}\n💎 *بودجه:* ${v.budget}\n📝 *توضیحات:* ${v.brief}`
  : `✨ *New Project Inquiry — XVVIIX*\n\n👤 *Name:* ${v.name}\n🎯 *Project Type:* ${v.type}\n⏱ *Timeline:* ${v.timeline}\n💎 *Budget:* ${v.budget}\n📝 *Brief:* ${v.brief}`;

const readInquiryValues = (form) => {
  const fd = new FormData(form);
  return {
    name: fd.get('name') || '',
    type: fd.get('type') || '',
    timeline: fd.get('timeline') || '',
    budget: fd.get('budget') || '',
    brief: fd.get('brief') || '',
  };
};

function SafeMarkup({ html }) {
  // Only the small, local translation strings need inline line-break/emphasis
  // markup. Parse that tiny allowlist instead of injecting raw HTML.
  return String(html).split(/(<br\s*\/?>|<em>.*?<\/em>)/g).filter(Boolean).map((part, index) => {
    if (/^<br\s*\/?>$/i.test(part)) return <br key={`br-${index}`} />;
    const emphasized = part.match(/^<em>(.*?)<\/em>$/i);
    if (emphasized) return <em key={`em-${index}`}>{emphasized[1]}</em>;
    return <Fragment key={`text-${index}`}>{part}</Fragment>;
  });
}

export default function Portfolio() {
  const [lang, setLang] = useState('en');
  const [selectedCase, setSelectedCase] = useState(null);
  const [toast, setToast] = useState(null);
  const [inquiry, setInquiry] = useState(null); // { text, subject } once any field is filled
  const root = useRef(null);
  const lenisRef = useRef(null);
  const toastTimer = useRef(null);
  const formRef = useRef(null);
  const copy = translations[lang];

  useEffect(() => {
    const stored = localStorage.getItem('xvviix-lang');
    if (stored === 'fa') setLang('fa');
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
    localStorage.setItem('xvviix-lang', lang);
    document.title = lang === 'fa' ? 'XVVIIX — توسعه‌دهندهٔ خلاق' : 'XVVIIX — Creative Developer';
  }, [lang]);

  const handleScrollToProgress = useCallback((targetProgress) => {
    const journey = document.querySelector('.hero');
    const maxScroll = journey ? Math.max(journey.offsetHeight - window.innerHeight, 1) : window.innerHeight * 48;
    const targetY = targetProgress * maxScroll;
    if (lenisRef.current) {
      lenisRef.current.scrollTo(targetY, {
        immediate: true,
        force: true,
      });
    } else {
      window.scrollTo({ top: targetY, behavior: 'auto' });
    }
  }, []);

  useEffect(() => {
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const lenis = new Lenis({
      duration: reducedMotion ? 0.01 : 1.15,
      smoothWheel: !reducedMotion,
      wheelMultiplier: reducedMotion ? 1 : 0.88,
      touchMultiplier: 1.15,
    });
    lenisRef.current = lenis;
    window.__xvLenis = lenis;

    let rafId;
    const raf = (time) => {
      lenis.raf(time);
      window.__xvScroll = lenis.animatedScroll;
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
      window.__xvLenis = null;
    };
  }, []);

  // Handle case study modal open/close lock
  useEffect(() => {
    if (selectedCase !== null) {
      if (lenisRef.current) lenisRef.current.stop();
      document.body.style.overflow = 'hidden';
      const onKeyDown = (e) => {
        if (e.key === 'Escape') {
          setSelectedCase(null);
          return;
        }
        if (e.key === 'Tab') {
          const modal = document.querySelector('.case-modal');
          if (!modal) return;
          const focusables = modal.querySelectorAll('a[href], button:not([disabled])');
          if (!focusables.length) return;
          const first = focusables[0];
          const last = focusables[focusables.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      };
      window.addEventListener('keydown', onKeyDown);
      const focusTimer = window.setTimeout(() => {
        document.querySelector('.case-modal__close')?.focus();
      }, 60);
      return () => {
        window.removeEventListener('keydown', onKeyDown);
        window.clearTimeout(focusTimer);
        if (lenisRef.current) lenisRef.current.start();
        document.body.style.overflow = '';
      };
    }
    return undefined;
  }, [selectedCase]);

  // Cursor trail & dust
  useEffect(() => {
    if (!matchMedia('(pointer: fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    document.documentElement.classList.add('xv-cursor');
    const cursor = document.querySelector('.cursor-dot');
    const trail = document.querySelector('.cursor-trail');
    const context = trail.getContext('2d');
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const points = [];
    const sparkDust = [];
    const lifetime = 115;
    let frame;
    let dpr = 1;

    const resize = () => {
      dpr = Math.min(devicePixelRatio || 1, 1.25);
      trail.width = Math.round(innerWidth * dpr);
      trail.height = Math.round(innerHeight * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const move = (event) => {
      cursor.style.opacity = '1';
      cursor.style.transform = `translate3d(${event.clientX}px,${event.clientY}px,0)`;
      window.__xvPointer = {
        x: (event.clientX / innerWidth) * 2 - 1,
        y: -((event.clientY / innerHeight) * 2 - 1),
      };
      window.__xvPointerTime = performance.now();
      cursor.classList.toggle(
        'is-active',
        Boolean(event.target.closest('a,button,.project-card,[role="button"],input,textarea,select,summary'))
      );
      if (!reducedMotion) {
        const previous = points[points.length - 1];
        if (!previous || Math.hypot(event.clientX - previous.x, event.clientY - previous.y) > 2) {
          const now = performance.now();
          points.push({ x: event.clientX, y: event.clientY, time: now });
          if (points.length > 28) points.shift();
          if (Math.random() < 0.72) {
            const amount = Math.random() < 0.28 ? 2 : 1;
            for (let index = 0; index < amount; index += 1) {
              sparkDust.push({
                x: event.clientX + (Math.random() - 0.5) * 7,
                y: event.clientY + (Math.random() - 0.5) * 7,
                vx: (Math.random() - 0.5) * 0.022,
                vy: (Math.random() - 0.55) * 0.025,
                born: now,
                life: 150 + Math.random() * 110,
                size: 0.45 + Math.random() * 1.05,
              });
            }
            if (sparkDust.length > 48) sparkDust.splice(0, sparkDust.length - 48);
          }
          if (!frame) frame = requestAnimationFrame(renderTrail);
        }
      }
    };

    const renderTrail = (now) => {
      context.clearRect(0, 0, innerWidth, innerHeight);
      while (points.length && now - points[0].time > lifetime) points.shift();
      context.lineCap = 'round';
      context.lineJoin = 'round';
      for (let index = 1; index < points.length; index += 1) {
        const previous = points[index - 1];
        const point = points[index];
        const life = Math.max(0, 1 - (now - point.time) / lifetime);
        if (life <= 0) continue;

        context.beginPath();
        context.moveTo(previous.x, previous.y);
        context.lineTo(point.x, point.y);
        context.strokeStyle = `rgba(225,160,46,${life * 0.2})`;
        context.lineWidth = 4.2 * life;
        context.shadowColor = `rgba(255,207,94,${life * 0.75})`;
        context.shadowBlur = 9 * life;
        context.stroke();

        context.beginPath();
        context.moveTo(previous.x, previous.y);
        context.lineTo(point.x, point.y);
        context.strokeStyle = `rgba(255,226,139,${life * 0.78})`;
        context.lineWidth = 0.7 + life * 0.75;
        context.shadowBlur = 4 * life;
        context.stroke();
      }
      for (let index = sparkDust.length - 1; index >= 0; index -= 1) {
        const particle = sparkDust[index];
        const age = now - particle.born;
        if (age >= particle.life) {
          sparkDust.splice(index, 1);
          continue;
        }
        const life = 1 - age / particle.life;
        const x = particle.x + particle.vx * age;
        const y = particle.y + particle.vy * age + age * age * 0.000018;
        context.beginPath();
        context.arc(x, y, particle.size * (0.55 + life * 0.45), 0, Math.PI * 2);
        context.fillStyle = `rgba(255,205,95,${life * 0.26})`;
        context.shadowColor = `rgba(255,190,63,${life * 0.34})`;
        context.shadowBlur = 5 * life;
        context.fill();
      }
      context.shadowBlur = 0;
      if (points.length || sparkDust.length) frame = requestAnimationFrame(renderTrail);
      else frame = undefined;
    };

    const hide = () => {
      cursor.style.opacity = '0';
      cursor.classList.remove('is-active');
      points.length = 0;
      sparkDust.length = 0;
      if (frame) cancelAnimationFrame(frame);
      frame = undefined;
      context.clearRect(0, 0, innerWidth, innerHeight);
    };

    resize();
    addEventListener('resize', resize);
    addEventListener('pointermove', move);
    document.addEventListener('mouseleave', hide);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      document.documentElement.classList.remove('xv-cursor');
      removeEventListener('resize', resize);
      removeEventListener('pointermove', move);
      document.removeEventListener('mouseleave', hide);
      context.clearRect(0, 0, innerWidth, innerHeight);
    };
  }, []);

  const showToast = useCallback((message, tone) => {
    setToast({ message, tone });
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 5200);
  }, []);

  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  // Rebuild the formatted brief whenever a field changes, so the Telegram /
  // email links below always carry the visitor's current data.
  const rebuildInquiry = useCallback((form) => {
    if (!form) return;
    const values = readInquiryValues(form);
    if (!values.name && !values.type && !values.timeline && !values.budget && !values.brief) {
      setInquiry(null);
      return;
    }
    const isFa = lang === 'fa';
    setInquiry({
      subject: isFa ? 'درخواست همکاری جدید — XVVIIX' : 'New Project Inquiry — XVVIIX',
      text: buildInquiryText(values, isFa),
    });
  }, [lang]);

  useEffect(() => {
    // Rebuild in the new language when the visitor switches EN/FA mid-form.
    rebuildInquiry(formRef.current);
  }, [rebuildInquiry]);

  // Last-resort copy for browsers where the async clipboard API is unavailable.
  const fallbackCopy = (text) => {
    try {
      const helper = document.createElement('textarea');
      helper.value = text;
      helper.setAttribute('readonly', '');
      helper.style.position = 'fixed';
      helper.style.opacity = '0';
      document.body.appendChild(helper);
      helper.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(helper);
      return ok;
    } catch {
      return false;
    }
  };

  const copyWithToast = (text, okMsg, failMsg) => {
    const finish = (copied) => showToast(copied ? okMsg : failMsg, copied ? 'ok' : 'warn');
    if (navigator.clipboard?.writeText) {
      // Guard against implementations that leave the promise pending.
      Promise.race([
        navigator.clipboard.writeText(text).then(() => true).catch(() => false),
        new Promise((resolve) => setTimeout(() => resolve(false), 800)),
      ]).then((ok) => finish(ok || fallbackCopy(text)));
    } else {
      finish(fallbackCopy(text));
    }
  };

  // Telegram can't prefill a message in a chat deep link, so the visitor lands
  // on the profile with the brief already on their clipboard — one paste away.
  const openTelegramWithBrief = (text) => {
    // Open synchronously from the click gesture so popup blockers allow it.
    const popup = window.open('https://t.me/xvviix', '_blank');
    if (!popup) window.location.href = 'https://t.me/xvviix';
    copyWithToast(
      text,
      lang === 'fa'
        ? 'بریف کپی شد ✅ — توی چت فقط Paste (Ctrl+V) کنید.'
        : 'Brief copied ✅ — just paste it in the chat (Ctrl+V).',
      lang === 'fa'
        ? 'پروفایل باز شد — لطفاً بریف را با دست در چت بنویسید.'
        : 'Profile opened — please write the brief in the chat.',
    );
  };

  // Primary CTA: straight to the profile with the brief copied.
  const handleContactSubmit = (event) => {
    event.preventDefault();
    const text = buildInquiryText(readInquiryValues(event.currentTarget), lang === 'fa');
    openTelegramWithBrief(text);
  };

  // Bottom Telegram pill: same flow (profile + copied brief) when the form has
  // data; otherwise it's just a plain link to the profile.
  const handleTelegramLinkClick = (event) => {
    if (!inquiry) return;
    event.preventDefault();
    openTelegramWithBrief(inquiry.text);
  };

  // Copy option: the whole brief on the clipboard, for pasting anywhere.
  const handleCopyClick = () => {
    if (!inquiry) return;
    copyWithToast(
      inquiry.text,
      lang === 'fa' ? 'درخواست کپی شد ✅ — هر جا خواستی Paste کن.' : 'Brief copied ✅ — paste it anywhere.',
      lang === 'fa' ? 'کپی ممکن نبود — لطفاً دستی کپی کنید.' : 'Copy failed — please copy it manually.',
    );
  };

  // Direct links: Telegram goes to the profile (brief copied when the form has
  // data). Gmail opens a prefilled compose window in the browser via
  // mail.google.com — no local mail client required.
  const telegramHref = 'https://t.me/xvviix';
  const emailHref = inquiry
    ? `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(EMAIL_ADDRESS)}&su=${encodeURIComponent(inquiry.subject)}&body=${encodeURIComponent(inquiry.text)}`
    : `mailto:${EMAIL_ADDRESS}`;

  return (
    <div ref={root} className="site" id="top">
      <a className="skip-link" href="#main">
        {lang === 'fa' ? 'پرش به محتوا' : 'Skip to content'}
      </a>
      <VitalsReporter />
      <Loader />
      <WebGLBoundary>
        <SceneCanvas stories={copy.heroStories} lang={lang} />
      </WebGLBoundary>
      <div className="scene-tint" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />
      <canvas className="cursor-trail" aria-hidden="true" />
      <div className="cursor-dot" aria-hidden="true" />
      <Header lang={lang} setLang={setLang} copy={copy} onScrollTo={handleScrollToProgress} />
      <Timeline lang={lang} onScrollTo={handleScrollToProgress} />

      <main id="main" tabIndex={-1} style={{ outline: 'none' }}>
        <section className="hero journey" id="experience">
          <div className="hero__sticky journey__stage">
            <h1 className="hero__name" aria-label="XVVIIX">
              <span>X</span><span>V</span><span>V</span><span>I</span><span>I</span><span>X</span>
            </h1>

            <div className="journey__ui">
              {projects.map((project, index) => (
                <article
                  className={`journey-project journey-project--${index}${index === 0 ? ' journey-project--anchor' : ''}`}
                  key={project.title}
                  id={index === 0 ? 'work' : undefined}
                >
                  <span className="journey-kicker">
                    {lang === 'fa' ? faDigits(`0${index + 1} / 05`) : `0${index + 1} / 05`}&nbsp;&nbsp;·&nbsp;&nbsp;{project.category[lang]}
                  </span>
                  <h2>{project.title}</h2>
                  <p>{project.description[lang]}</p>
                  <ul>{project.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul>
                  <div className="journey-actions">
                    <button
                      type="button"
                      onClick={() => setSelectedCase(index)}
                    >
                      {lang === 'fa' ? 'مشاهدهٔ مطالعهٔ موردی' : 'View case study'}
                    </button>
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {lang === 'fa' ? 'بازکردن سایت' : 'Open live website'} ↗
                    </a>
                  </div>
                </article>
              ))}

              <section className="journey-chapter journey-chapter--skills" id="skills">
                <h2>{lang === 'fa' ? 'هر لایه، یک فرآیند.' : 'Every layer. One process.'}</h2>
                <p>
                  {lang === 'fa'
                    ? 'از ساختار و رابط تا موشن و سه‌بعدی؛ تمام تجربه با یک نگاه یکپارچه طراحی و اجرا می‌شود.'
                    : 'From structure and interface to motion and real-time 3D, every part of the experience is designed and built as one system.'}
                </p>
              </section>

              <section className="journey-chapter journey-chapter--services" id="services">
                <span className="journey-kicker">{lang === 'fa' ? '۰۴ / ۰۶' : '04 / 06'}&nbsp;&nbsp;·&nbsp;&nbsp;{copy.serviceTag}</span>
                <h2><SafeMarkup html={copy.serviceTitle} /></h2>
                <div className="journey-phase-list">
                  {copy.servicePhases.map((phase, index) => (
                    <div className={`journey-phase ${index === 0 ? 'is-active' : ''}`} key={phase.title}>
                      <b>{lang === 'fa' ? faDigits(`0${index + 1}`) : `0${index + 1}`}</b>
                      <div>
                        <span>{phase.title}</span>
                        <small>{phase.copy}</small>
                      </div>
                      <em>{phase.meta}</em>
                    </div>
                  ))}
                </div>
              </section>

              <section
                className="journey-chapter journey-chapter--process journey-chapter--matin"
                id="about"
                aria-label={lang === 'fa' ? 'درباره متین و شیوه کار' : 'About Matin and the work'}
              >
                <span className="journey-kicker matin-kicker">{lang === 'fa' ? '۰۵ / ۰۶' : '05 / 06'}&nbsp;&nbsp;·&nbsp;&nbsp;{copy.aboutTag}</span>
                <p className="matin-lead">{copy.aboutLead}</p>
                <div className="matin-intro">
                  <h2 className="matin-title"><SafeMarkup html={copy.aboutTitle} /></h2>
                  <p className="matin-body">{copy.aboutBody}</p>
                </div>

                <ul className="matin-skills" aria-label={lang === 'fa' ? 'تخصص‌ها' : 'Capabilities'}>
                  {copy.aboutSkills.map(([skill, skillCopy]) => (
                    <li key={skill}>
                      <b>{skill}</b>
                      <small>{skillCopy}</small>
                    </li>
                  ))}
                </ul>

                <div className="matin-cta">
                  <button
                    type="button"
                    className="matin-cta-primary"
                    onClick={() => handleScrollToProgress(0.958)}
                  >
                    {lang === 'fa' ? 'شروع یک پروژه' : 'Start a project'} <span>↗</span>
                  </button>
                  <a href="https://github.com/xvviix" target="_blank" rel="noreferrer">
                    GitHub ↗
                  </a>
                </div>
              </section>

      <section className="journey-contact" id="contact">
        <span className="journey-kicker">{lang === 'fa' ? '۰۶ / ۰۶' : '06 / 06'}&nbsp;&nbsp;·&nbsp;&nbsp;{copy.contactTag}</span>
        <h2><SafeMarkup html={copy.contactTitle} /></h2>
        <p>{copy.contactCopy}</p>

        <form
          className="brief-card"
          ref={formRef}
          onInput={(event) => rebuildInquiry(event.currentTarget)}
          onSubmit={handleContactSubmit}
        >
          <span className="brief-card__label">{lang === 'fa' ? 'بریف پروژه' : 'The Brief'}</span>
          <div className="brief-row">
            <input
              name="name"
              required
              maxLength={80}
              placeholder={lang === 'fa' ? 'نام شما' : 'Your name'}
              aria-label={lang === 'fa' ? 'نام شما' : 'Your name'}
            />
            <select name="type" required defaultValue="" aria-label={lang === 'fa' ? 'نوع پروژه' : 'Project type'}>
              <option value="" disabled>{lang === 'fa' ? 'نوع پروژه' : 'Project type'}</option>
              {projectTypes[lang].map((option) => <option key={option}>{option}</option>)}
            </select>
          </div>
          <div className="brief-tiers" role="radiogroup" aria-label={lang === 'fa' ? 'زمان‌بندی' : 'Timeline'}>
            {timelineTiers[lang].map((tier, index) => (
              <label key={tier} className="brief-tier">
                <input type="radio" name="timeline" value={tier} required={index === 0} />
                <span>{tier}</span>
              </label>
            ))}
          </div>
          <div className="brief-tiers" role="radiogroup" aria-label={lang === 'fa' ? 'بودجهٔ تقریبی' : 'Approximate budget'}>
            {budgetTiers[lang].map((tier, index) => (
              <label key={tier} className="brief-tier">
                <input type="radio" name="budget" value={tier} required={index === 0} />
                <span>{tier}</span>
              </label>
            ))}
          </div>
          <textarea
            name="brief"
            rows={3}
            required
            maxLength={1200}
            placeholder={lang === 'fa' ? 'کمی دربارهٔ ایده‌ات بگو' : 'Tell me briefly about the idea'}
          />
          <button type="submit">
            {copy.contactCta} <span aria-hidden="true">↗</span>
          </button>
        </form>

        <div className="contact-links">
          <a className="contact-direct" href={telegramHref} target="_blank" rel="noreferrer" onClick={handleTelegramLinkClick}>
            <i aria-hidden="true" />
            t.me/xvviix
            <span>
              {inquiry
                ? (lang === 'fa' ? 'کپی بریف + باز کردن چت' : 'Copy brief & open chat')
                : (lang === 'fa' ? 'خط مستقیم تلگرام' : 'Direct Telegram line')}
            </span>
          </a>
          <a className="contact-direct" href={emailHref} target="_blank" rel="noreferrer">
            <i aria-hidden="true" />
            <span className="contact-direct__mail">{EMAIL_ADDRESS}</span>
            <span>
              {inquiry
                ? (lang === 'fa' ? 'باز کردن Gmail با بریف' : 'Open Gmail with brief')
                : (lang === 'fa' ? 'ایمیل' : 'Email')}
            </span>
          </a>
          <button type="button" className="contact-direct" onClick={handleCopyClick} disabled={!inquiry}>
            <i aria-hidden="true" />
            {lang === 'fa' ? 'کپی درخواست' : 'Copy the brief'}
            <span>{lang === 'fa' ? 'برای چسباندن در هر جا' : 'Paste it anywhere'}</span>
          </button>
        </div>
      </section>
            </div>
          </div>
        </section>
      </main>

      {selectedCase !== null && (
        <div
          className="case-modal"
          role="dialog"
          aria-modal="true"
          aria-label={`${projects[selectedCase].title} case study`}
        >
          <button
            className="case-modal__backdrop"
            type="button"
            aria-label="Close case study"
            onClick={() => setSelectedCase(null)}
          />
          <article>
            <button
              className="case-modal__close"
              type="button"
              onClick={() => setSelectedCase(null)}
            >
              ×
            </button>
            <Image
              src={projects[selectedCase].image}
              alt={projects[selectedCase].alt}
              width={900}
              height={633}
              sizes="(max-width: 760px) 92vw, 640px"
              style={{ width: '100%', height: 'auto', maxHeight: '48vh', objectFit: 'cover' }}
            />
            <span>{projects[selectedCase].category[lang]}</span>
            <h2>{projects[selectedCase].title}</h2>
            <p>{projects[selectedCase].description[lang]}</p>
            <ul>{projects[selectedCase].tags.map((tag) => <li key={tag}>{tag}</li>)}</ul>
            <a
              href={projects[selectedCase].url}
              target="_blank"
              rel="noreferrer"
            >
              {lang === 'fa' ? 'مشاهدهٔ نسخهٔ آنلاین' : 'Open live website'} ↗
            </a>
          </article>
        </div>
      )}

      {toast && (
        <div className={`form-toast form-toast--${toast.tone}`} role="status" aria-live="polite">
          {toast.message}
        </div>
      )}
    </div>
  );
}
