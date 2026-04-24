'use client';

const skills = [
  {
    title: 'Automação Inteligente',
    items: ['Fluxos n8n', 'Automação de CRM', 'Integração de APIs', 'Google Sheets automatizado'],
  },
  {
    title: 'IA Aplicada',
    items: ['Chatbots inteligentes', 'Análise de dados com IA', 'Sistemas multiagente', 'Assistentes virtuais'],
  },
  {
    title: 'Landing Pages & Web',
    items: ['Sites otimizados', 'Design UX focado', 'Performance e SEO', 'Integração com automações'],
  },
];

export default function Skills() {
  const scrollTo = (id: string) => {
    const el = document.querySelector(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    // spacing: padding responsivo
    <section id="skills" className="py-24 md:py-32 px-6 bg-[#171717]">
      <div className="max-w-6xl mx-auto">
        {/* spacing: gap e margin responsivos */}
        <div className="grid md:grid-cols-3 gap-4 md:gap-6 lg:gap-8 mb-12 md:mb-16">
          {skills.map((skill, i) => (
            // UX: rounded-xl + hover refinado
            <article
              key={skill.title}
              className="p-5 md:p-6 bg-[#0a0a0a] border border-[#262626] rounded-xl hover:border-[#3b82f6]/30 transition-all duration-300 fade-in"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <h3 className="text-lg md:text-xl font-semibold text-[#fafafa] mb-4">{skill.title}</h3>
              <ul className="space-y-2.5 mb-6" role="list">
                {skill.items.map((item) => (
                  <li key={item} className="text-[#737373] text-sm flex items-start gap-2.5">
                    <span className="text-[#3b82f6] mt-0.5 flex-shrink-0">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              {/* UX: focus ring */}
              <button
                onClick={() => scrollTo('#contato')}
                className="text-[#3b82f6] hover:text-[#2563eb] text-sm font-medium flex items-center gap-2 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6] rounded-md"
              >
                Saiba mais
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </article>
          ))}
        </div>

        {/* UX: CTA box com padding responsivo + rounded-xl */}
        <div className="text-center p-8 md:p-12 bg-[#0a0a0a] border border-[#262626] rounded-xl fade-in">
          <h3 className="text-2xl md:text-3xl font-bold text-[#fafafa] mb-3 md:mb-4">
            Pronto para automatizar e escalar?
          </h3>
          <p className="text-[#737373] text-base md:text-lg mb-6 md:mb-8 max-w-2xl mx-auto">
            Vamos conversar sobre como IA e automação podem transformar seu negócio.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            {/* UX: focus rings + transições */}
            <button
              onClick={() => scrollTo('#contato')}
              className="px-6 py-3 bg-[#3b82f6] text-white rounded-lg hover:bg-[#2563eb] transition-all duration-200 font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a]"
            >
              Agendar consulta
            </button>
            <button
              onClick={() => scrollTo('#empresas')}
              className="px-6 py-3 border border-[#262626] text-[#fafafa] rounded-lg hover:bg-[#171717] hover:border-[#3b82f6]/30 transition-all duration-200 font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a]"
            >
              Ver casos de uso
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
