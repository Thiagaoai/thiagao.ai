'use client';

import Image from 'next/image';

export default function Hero() {
  const scrollTo = (id: string) => {
    const el = document.querySelector(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    // UX: padding ajustado para mobile
    <section id="inicio" className="min-h-screen flex items-center justify-center px-6 pt-24 pb-12 md:pt-20 md:pb-0">
      <div className="max-w-6xl mx-auto w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="space-y-6 md:space-y-8 fade-in order-2 lg:order-1">
            <div>
              {/* SEO: span ao invés de p para intro text */}
              <span className="text-[#3b82f6] text-sm font-medium mb-3 block tracking-wide">Olá, eu sou</span>
              {/* SEO: H1 único mantido */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-[#fafafa] leading-tight mb-4">
                Thiago do Carmo
              </h1>
              <p className="text-[#737373] text-base md:text-lg">39 anos • Cape Cod, MA</p>
            </div>
            
            {/* UX: tamanho responsivo */}
            <p className="text-[#fafafa]/90 text-lg md:text-xl leading-relaxed max-w-xl">
              Empresário, Líder de Tecnologia e Inovação. Construindo excelência através de propósito, fé e automação inteligente.
            </p>

            {/* UX: gap responsivo */}
            <div className="flex flex-wrap gap-2 md:gap-3">
              <span className="px-3 md:px-4 py-1.5 md:py-2 bg-[#171717] border border-[#262626] rounded-full text-xs md:text-sm text-[#fafafa]/80">
                21 anos nos EUA
              </span>
              <span className="px-3 md:px-4 py-1.5 md:py-2 bg-[#171717] border border-[#262626] rounded-full text-xs md:text-sm text-[#fafafa]/80">
                6 Empresas
              </span>
              <span className="px-3 md:px-4 py-1.5 md:py-2 bg-[#171717] border border-[#262626] rounded-full text-xs md:text-sm text-[#fafafa]/80">
                DockPlus AI Solutions
              </span>
            </div>

            {/* UX: botões com focus ring + flex responsivo */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 md:pt-4">
              <button
                onClick={() => scrollTo('#empresas')}
                className="px-6 py-3 bg-[#3b82f6] text-white rounded-lg hover:bg-[#2563eb] transition-all duration-200 font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a]"
              >
                Conheça meu ecossistema
              </button>
              <button
                onClick={() => scrollTo('#contato')}
                className="px-6 py-3 border border-[#262626] text-[#fafafa] rounded-lg hover:bg-[#171717] hover:border-[#3b82f6]/30 transition-all duration-200 font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a]"
              >
                Vamos conversar
              </button>
            </div>
          </div>

          {/* UX: ordem invertida em mobile para foto primeiro */}
          <div className="flex justify-center lg:justify-end fade-in order-1 lg:order-2">
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96">
              <div className="absolute inset-0 rounded-full border-2 border-[#3b82f6]/20" />
              <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-[#3b82f6]">
                <Image
                  src="https://res.cloudinary.com/dhrxy4yo0/image/upload/c_scale,w_800,f_auto,q_auto/v1762310575/a24b1631-6cee-450f-9d43-496e74ef6845_ua0n8s.jpg"
                  alt="Thiago do Carmo - Empresário e Líder de Tecnologia em Cape Cod, MA" // SEO: alt descritivo
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 640px) 256px, (max-width: 768px) 320px, 384px"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
