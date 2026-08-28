'use client';

import { useEffect, useState } from 'react';
import { faDigits } from '../lib/faDigits';

const chapters = [
  { id: 'hero', progress: 0, jump: 0.012, label: { en: 'Hero', fa: 'سرآغاز' }, num: '01' },
  { id: 'work', progress: 0.225, jump: 0.242, label: { en: 'Work', fa: 'پروژه‌ها' }, num: '02' },
  { id: 'skills', progress: 0.50, jump: 0.525, label: { en: 'Skills', fa: 'مهارت‌ها' }, num: '03' },
  { id: 'services', progress: 0.64, jump: 0.665, label: { en: 'Expertise', fa: 'تخصص‌ها' }, num: '04' },
  { id: 'about', progress: 0.87, jump: 0.888, label: { en: 'About', fa: 'درباره' }, num: '05' },
  { id: 'contact', progress: 0.945, jump: 0.958, label: { en: 'Contact', fa: 'همکاری' }, num: '06' },
];

export default function Timeline({ lang, onScrollTo }) {
  const [activeChapter, setActiveChapter] = useState(0);
  const num = (value) => (lang === 'fa' ? faDigits(value) : value);

  useEffect(() => {
    let frame;
    let lastActive = 0;
    const check = () => {
      const p = window.__xvJourney || 0;

      let active = 0;
      for (let i = chapters.length - 1; i >= 0; i--) {
        if (p >= chapters[i].progress) {
          active = i;
          break;
        }
      }
      if (active !== lastActive) {
        lastActive = active;
        setActiveChapter(active);
      }
      frame = requestAnimationFrame(check);
    };
    frame = requestAnimationFrame(check);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <nav className="chapter-timeline-top" aria-label="Journey chapters">
      <div className="chapter-timeline-top__steps">
        {chapters.map((ch, idx) => {
          const isActive = idx === activeChapter;
          return (
            <button
              key={ch.id}
              type="button"
              className={`chapter-timeline-top__item ${isActive ? 'is-active' : ''}`}
              onClick={() => onScrollTo(ch.jump)}
              aria-label={`Jump to ${ch.label[lang]}`}
            >
              <i className="chapter-timeline-top__pip" />
              <span className="chapter-timeline-top__copy">
                <span className="chapter-timeline-top__num">{num(ch.num)}</span>
                <span className="chapter-timeline-top__label">{ch.label[lang]}</span>
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
