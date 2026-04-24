'use client';

const businesses = [
  {
    title: 'DockPlus AI Solutions',
    tagline: 'Automação inteligente para negócios que querem escalar',
    description: 'Soluções de IA, automação de marketing, CRM inteligente e sistemas multiagente.',
  },
  {
    title: 'Roberts Landscape',
    tagline: 'Rooted in Excellence',
    description: 'Paisagismo de alto padrão, hardscape, pátios e design de jardins em Cape Cod.',
  },
  {
    title: 'Cheesebread Bakery Café',
    tagline: 'Sabor brasileiro, coração acolhedor',
    description: 'Padaria-café artesanal com pão de queijo, esfirras, pizzas e catering em Hyannis, MA.',
  },
  {
    title: 'Cape Codder Home Improvement',
    tagline: 'Transformando casas com excelência',
    description: 'Reformas residenciais, carpintaria, pintura e construção com padrão premium.',
  },
  {
    title: 'Bread & Roses Bookstore Café',
    tagline: 'Onde café encontra cultura',
    description: 'Livraria-café cultural com brunch, eventos e espaço para boas conversas.',
  },
  {
    title: 'All Granite & Stone',
    tagline: 'Elegância em cada superfície',
    description: 'Especialistas em mármore, granito e quartzo para cozinhas e banheiros premium.',
  },
];

export default function Businesses() {
  return (
    // spacing: padding responsivo
    <section id="empresas" className="py-24 md:py-32 px-6">
      <div className="max-w-6xl mx-auto">
        {/* spacing: margin responsivo */}
        <div className="text-center mb-12 md:mb-16 fade-in">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#fafafa] mb-4">
            Minhas Empresas
          </h2>
          <p className="text-[#737373] text-base md:text-lg max-w-2xl mx-auto">
            Seis marcas unidas pela visão DockPlus Enterprise — excelência, inovação e propósito
          </p>
        </div>

        {/* UX: gap responsivo */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {businesses.map((business, i) => (
            // UX: rounded-xl + hover refinado + shadow sutil
            <article
              key={business.title}
              className="p-5 md:p-6 bg-[#171717] border border-[#262626] rounded-xl hover:border-[#3b82f6]/40 hover:shadow-lg hover:shadow-[#3b82f6]/5 transition-all duration-300 fade-in group"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              {/* SEO: h3 semântico */}
              <h3 className="text-lg md:text-xl font-semibold text-[#fafafa] mb-2 group-hover:text-[#3b82f6] transition-colors duration-300">{business.title}</h3>
              <p className="text-[#3b82f6] text-xs md:text-sm font-medium mb-3">{business.tagline}</p>
              <p className="text-[#737373] text-sm leading-relaxed">{business.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
