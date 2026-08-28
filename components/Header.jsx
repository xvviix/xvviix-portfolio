'use client';

import { useEffect, useRef, useState } from 'react';
import { faDigits } from '../lib/faDigits';

export default function Header({ lang, setLang, copy, onScrollTo }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef(null);
  const menuToggleRef = useRef(null);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 30);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusFirstItem = window.setTimeout(() => {
      menuRef.current?.querySelector('a, button:not([disabled])')?.focus();
    }, 0);

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
        return;
      }
      if (event.key !== 'Tab') return;

      const focusables = menuRef.current?.querySelectorAll('a[href], button:not([disabled])');
      if (!focusables?.length) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.clearTimeout(focusFirstItem);
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      menuToggleRef.current?.focus();
    };
  }, [open]);

  const num = (value) => (lang === 'fa' ? faDigits(value) : value);

  const handleNavClick = (e, progress) => {
    e.preventDefault();
    if (onScrollTo) onScrollTo(progress);
    setOpen(false);
  };

  return (
    <>
      <header className={`header ${scrolled ? 'header--scrolled' : ''}`}>
        <a
          className="logo magnetic"
          href="#top"
          onClick={(e) => handleNavClick(e, 0)}
          aria-label="XVVIIX home"
        >
          X<span>/</span>VII<span>/</span>X
        </a>

        <nav className="header__nav" aria-label="Main navigation">
          <a
            href="#work"
            onClick={(e) => handleNavClick(e, 0.242)}
          >
            {copy.nav.work}<sup>{num('05')}</sup>
          </a>
          <a
            href="#services"
            onClick={(e) => handleNavClick(e, 0.665)}
          >
            {copy.nav.services}<sup>{num('03')}</sup>
          </a>
          <a
            href="#about"
            onClick={(e) => handleNavClick(e, 0.888)}
          >
            {copy.nav.about}
          </a>
        </nav>

        <div className="header__actions">
          <button
            className="language"
            onClick={() => setLang(lang === 'en' ? 'fa' : 'en')}
            aria-label="Switch language"
            type="button"
          >
            <span className={lang === 'en' ? 'active' : ''}>EN</span>
            <i />
            <span className={lang === 'fa' ? 'active' : ''}>FA</span>
          </button>

          <a
            className="header__contact magnetic"
            href="#contact"
            onClick={(e) => handleNavClick(e, 0.958)}
          >
            {copy.nav.contact}
            <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 15L15 5M7 5h8v8" /></svg>
          </a>

          <button
            ref={menuToggleRef}
            className={`menu-toggle ${open ? 'open' : ''}`}
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label="Toggle menu"
            type="button"
          >
            <i /><i />
          </button>
        </div>
      </header>

      <div
        ref={menuRef}
        id="mobile-menu"
        className={`menu ${open ? 'menu--open' : ''}`}
        aria-hidden={!open}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
      >
        <nav>
          <a href="#work" onClick={(e) => handleNavClick(e, 0.242)}>
            <small>{num('01')}</small><span>{copy.nav.work}</span>
          </a>
          <a href="#services" onClick={(e) => handleNavClick(e, 0.665)}>
            <small>{num('02')}</small><span>{copy.nav.services}</span>
          </a>
          <a href="#about" onClick={(e) => handleNavClick(e, 0.888)}>
            <small>{num('03')}</small><span>{copy.nav.about}</span>
          </a>
          <a href="#contact" onClick={(e) => handleNavClick(e, 0.958)}>
            <small>{num('04')}</small><span>{copy.nav.contact}</span>
          </a>
        </nav>
        <div className="menu__foot">
          <a href="https://github.com/xvviix" target="_blank" rel="noreferrer">GitHub ↗</a>
          <a href="https://t.me/xvviix" target="_blank" rel="noreferrer">Telegram ↗</a>
        </div>
      </div>
    </>
  );
}
