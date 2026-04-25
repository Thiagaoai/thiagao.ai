'use client';

export default function About() {
  return (
    // spacing: padding responsivo
    <section id="sobre" className="py-24 md:py-32 px-6">
      <div className="max-w-4xl mx-auto fade-in">
        {/* SEO: H2 semântico mantido */}
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#fafafa] mb-8 md:mb-12 text-center">
          Sobre Mim
        </h2>
        {/* UX: tamanho de texto responsivo */}
        <div className="space-y-5 md:space-y-6 text-[#737373] text-base md:text-lg leading-relaxed">
          <p>
            Com mais de 21 anos de experiência nos Estados Unidos, construí um ecossistema de seis empresas unidas pela visão de excelência, inovação e propósito.
          </p>
          <p>
            Minha jornada começou com a paixão por tecnologia e automação, evoluindo para criar soluções que transformam negócios através de inteligência artificial e processos inteligentes.
          </p>
          <p>
            Acreditando que propósito e fé são fundamentais para construir algo duradouro, cada empresa que fundei carrega valores sólidos e um compromisso com a excelência.
          </p>
          <p>
            Hoje, lidero a <strong className="text-[#fafafa] font-medium">DockPlus AI Solutions</strong>, onde desenvolvemos sistemas de automação inteligente, CRM avançado e soluções de IA que ajudam empresas a escalar de forma eficiente e sustentável.
          </p>
        </div>
      </div>
    </section>
  );
}
