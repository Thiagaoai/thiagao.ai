'use client';

import { BRAND_NAME, BrandMark, BrandWordmark } from './BrandMark';

const links = [
  { label: 'Início', href: '#inicio' },
  { label: 'Sobre', href: '#sobre' },
  { label: 'Empresas', href: '#empresas' },
  { label: 'Contato', href: '#contato' },
];

export default function Footer() {
  const scrollTo = (href: string) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    // spacing: padding responsivo
    <footer className="py-12 md:py-16 px-6 border-t border-[#262626]" role="contentinfo">
      <div className="max-w-6xl mx-auto">
        {/* spacing: gap responsivo */}
        <div className="grid md:grid-cols-3 gap-8 md:gap-12 mb-8 md:mb-12">
          <div>
            <div className="mb-5 flex items-center gap-3">
              <BrandMark className="h-9 w-9" />
              <BrandWordmark className="text-xl font-semibold text-[#fafafa]" />
            </div>
            <h3 className="text-[#fafafa] font-semibold mb-4 text-sm uppercase tracking-wide">Links Rápidos</h3>
            {/* a11y: nav role */}
            <nav aria-label="Links do rodapé">
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    {/* UX: focus ring */}
                    <button
                      onClick={() => scrollTo(link.href)}
                      className="text-[#737373] hover:text-[#3b82f6] text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6] rounded-sm"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
          <div>
            <h3 className="text-[#fafafa] font-semibold mb-4 text-sm uppercase tracking-wide">Redes Sociais</h3>
            <div className="flex gap-4">
              {/* UX: focus ring + tamanho de toque adequado */}
              <a
                href="https://linkedin.com/in/thiagodocarmo"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#737373] hover:text-[#3b82f6] transition-colors p-1 -m-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6] rounded-md"
                aria-label="LinkedIn de Thiago do Carmo"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
              <a
                href="mailto:dockplus@dockplusai.com"
                className="text-[#737373] hover:text-[#3b82f6] transition-colors p-1 -m-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6] rounded-md"
                aria-label="Enviar email para Thiago do Carmo"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </a>
            </div>
          </div>
          {/* UX: coluna vazia removida, grid se ajusta automaticamente */}
        </div>
        <div className="border-t border-[#262626] pt-6 md:pt-8 text-center">
          <p className="text-[#737373] text-sm">
            © {new Date().getFullYear()} {BRAND_NAME} by Thiago do Carmo. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
