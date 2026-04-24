'use client';

export default function FaithPurpose() {
  return (
    // spacing: padding responsivo
    <section id="fe-proposito" className="py-24 md:py-32 px-6 bg-[#171717]">
      <div className="max-w-4xl mx-auto fade-in">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#fafafa] mb-8 md:mb-12 text-center">
          Fé & Propósito
        </h2>
        {/* UX: texto responsivo */}
        <div className="space-y-5 md:space-y-6 text-[#737373] text-base md:text-lg leading-relaxed">
          <p>
            Minha fé e propósito são os pilares que guiam cada decisão e cada projeto. Acredito que negócios bem-sucedidos são aqueles que servem a um propósito maior, criando valor real para as pessoas e comunidades.
          </p>
          <p>
            Cada empresa que fundei nasceu não apenas de uma oportunidade de mercado, mas de uma visão de como podemos fazer a diferença através da excelência, integridade e inovação.
          </p>
          <p>
            A tecnologia e a automação são ferramentas poderosas, mas são os valores humanos — compaixão, honestidade e dedicação — que transformam essas ferramentas em soluções que realmente importam.
          </p>
          {/* UX: blockquote semântico + destaque visual refinado */}
          <blockquote className="text-[#3b82f6] font-medium text-lg md:text-xl text-center pt-4 md:pt-6 border-l-0 italic">
            &ldquo;Construindo excelência através de propósito, fé e automação inteligente.&rdquo;
          </blockquote>
        </div>
      </div>
    </section>
  );
}
