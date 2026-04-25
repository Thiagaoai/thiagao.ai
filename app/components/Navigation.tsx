'use client';

import { useState, useEffect } from 'react';
import { BRAND_NAME, BrandMark, BrandWordmark } from './BrandMark';

const navItems = [
  { label: 'Início', href: '#inicio' },
  { label: 'Sobre', href: '#sobre' },
  { label: 'Empresas', href: '#empresas' },
  { label: 'Skills', href: '#skills' },
  { label: 'Contato', href: '#contato' },
];

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (href: string) => {
    setIsOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-[#0a0a0a]/90 backdrop-blur-md border-b border-[#262626]' : 'bg-transparent'
      }`}
      role="navigation" // a11y
      aria-label="Navegação principal" // a11y
    >
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* UX: focus ring adicionado */}
          <button
            onClick={() => scrollTo('#inicio')}
            aria-label={BRAND_NAME}
            className="flex items-center gap-3 text-[#fafafa] font-semibold text-lg hover:text-[#22d3ee] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a] rounded-md"
          >
            <BrandMark className="h-8 w-8" />
            <BrandWordmark />
          </button>

          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              // UX: focus states + hover underline
              <button
                key={item.href}
                onClick={() => scrollTo(item.href)}
                className="text-[#fafafa]/70 hover:text-[#3b82f6] text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a] rounded-md px-1 py-0.5"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* a11y: aria-expanded para estado do menu */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-[#fafafa] p-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6] rounded-md"
            aria-label={isOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={isOpen}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* UX: animação suave do menu mobile */}
        <div 
          className={`md:hidden overflow-hidden transition-all duration-300 ease-out ${
            isOpen ? 'max-h-64 opacity-100 mt-4' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="space-y-1 pb-2">
            {navItems.map((item) => (
              <button
                key={item.href}
                onClick={() => scrollTo(item.href)}
                className="block w-full text-left py-3 px-2 text-[#fafafa]/70 hover:text-[#3b82f6] hover:bg-[#171717] text-sm transition-colors rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6]"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
