'use client';

import { useEffect, useState } from 'react';
import { ArrowUpRight, Check, Code2, Copy, Sparkles, X } from 'lucide-react';

type ToolBriefing = {
  title: string;
  label: string;
  text: string;
  briefing: string;
  bestUse: string;
  prompt: string;
};

const tools: ToolBriefing[] = [
  {
    title: 'ChatGPT',
    label: 'Produto + pesquisa',
    text: 'Bom para estruturar ideias, gerar specs, revisar copy, transformar reuniao em plano e acelerar pesquisa inicial.',
    briefing:
      'Use como parceiro de estruturacao. Ele e forte para transformar ideias soltas em plano, criar matriz de decisao, organizar conteudo e acelerar a primeira versao de qualquer documento.',
    bestUse:
      'Comece com contexto, objetivo, publico, restricoes e formato de saida. O ganho vem quando voce pede criterios, tradeoffs e proximos passos, nao apenas texto bonito.',
    prompt:
      'Aja como meu estrategista de produto e automacao. Contexto: [explique o projeto]. Objetivo: [resultado desejado]. Restricoes: [tempo, stack, budget]. Me entregue: 1) resumo do problema, 2) plano em etapas, 3) riscos, 4) primeira acao executavel hoje, 5) perguntas que eu preciso responder antes de construir.',
  },
  {
    title: 'Claude',
    label: 'Codigo + raciocinio',
    text: 'Uso para refactor, leitura de codebase, prompts longos, arquitetura e trabalho com contexto grande.',
    briefing:
      'Use quando a tarefa exige raciocinio longo, leitura de repo, arquitetura, refactor ou escrita com mais criterio. Ele funciona muito bem como dev senior revisando decisoes.',
    bestUse:
      'Cole contexto suficiente, peca para ele primeiro mapear o problema e so depois editar. Para codigo, exija plano, arquivos afetados, verificacao e riscos.',
    prompt:
      'Aja como um frontend/backend architect senior. Analise este contexto antes de propor codigo: [cole arquivos, erro ou objetivo]. Quero que voce: 1) identifique causa raiz, 2) proponha a menor mudanca segura, 3) liste arquivos afetados, 4) implemente com foco em manutencao, 5) diga como testar.',
  },
  {
    title: 'Manus',
    label: 'Execucao agentic',
    text: 'Acompanho como referencia de agente que navega, pesquisa, organiza tarefas e entrega artefatos.',
    briefing:
      'Use como referencia de agente executor: pesquisar, navegar, comparar opcoes, organizar informacao e devolver artefatos. O valor esta em delegar uma missao com criterio claro.',
    bestUse:
      'Diga qual entrega final voce quer e quais fontes/canais ele pode usar. Evite pedido vago. Defina formato, deadline, criterio de qualidade e o que ele nao deve fazer.',
    prompt:
      'Voce e meu agente executor. Missao: [resultado final]. Fontes permitidas: [sites, docs, repos, emails]. Entrega esperada: [tabela, plano, markdown, checklist]. Criterio de qualidade: cite fontes, compare alternativas, destaque riscos e finalize com recomendacao objetiva.',
  },
  {
    title: 'Gemini',
    label: 'Google stack',
    text: 'Forte para contexto multimodal, pesquisa conectada ao ecossistema Google e workflows com Workspace.',
    briefing:
      'Use para tarefas multimodais, analise de material visual, documentos longos e workflows ligados ao Google Workspace. Bom para juntar pesquisa, imagem, planilha e texto.',
    bestUse:
      'Passe artefatos concretos: screenshot, doc, planilha, video ou briefing. Peca saida em estrutura operacional para virar tarefa, email, doc ou automacao.',
    prompt:
      'Analise este material como consultor tecnico de IA aplicada: [cole contexto/anexe material]. Extraia: 1) pontos importantes, 2) oportunidades de automacao, 3) tarefas para executar, 4) riscos ou lacunas, 5) uma versao curta para compartilhar com time/cliente.',
  },
  {
    title: 'Mistral',
    label: 'Europa + open weight',
    text: 'Importante para modelos eficientes, alternativas fora do eixo US e casos em que custo/controle importam.',
    briefing:
      'Use como radar para modelos eficientes e opcoes com mais controle. E relevante quando custo, latencia, privacidade ou independencia de fornecedor importam.',
    bestUse:
      'Compare contra modelos fechados em tarefas especificas. Nao escolha por hype. Teste resumo, classificacao, extracao, suporte e automacoes repetitivas.',
    prompt:
      'Compare Mistral/open-weight com modelos fechados para este caso: [descreva a tarefa]. Avalie custo, qualidade, privacidade, latencia, facilidade de deploy e risco de manutencao. Termine com uma recomendacao: usar agora, testar em paralelo ou ignorar.',
  },
  {
    title: 'Grok',
    label: 'Realtime + cultura',
    text: 'Interessante para sinais rapidos, internet culture, X/Twitter e leitura de narrativas emergentes.',
    briefing:
      'Use para leitura de sinais rapidos, cultura de internet, conversas emergentes e narrativa de mercado. Serve mais como radar do que como fonte final.',
    bestUse:
      'Transforme sinais em hipoteses. Depois valide com fontes fortes. Bom para conteudo, social listening, trends e temas de newsletter.',
    prompt:
      'Mapeie os sinais emergentes sobre [tema] nas ultimas conversas online. Separe hype de oportunidade real. Entregue: 1) principais narrativas, 2) quem esta falando, 3) riscos de interpretacao, 4) ideias de conteudo, 5) uma tese curta para testar.',
  },
  {
    title: 'MiniMax',
    label: 'Audio + multimodal',
    text: 'Ferramenta para observar geracao multimodal, voz, video, agentes criativos e interfaces mais expressivas.',
    briefing:
      'Use como laboratorio de multimodal: voz, video, personagens, experiencias criativas e conteudo que precisa sair do texto puro.',
    bestUse:
      'Entre com briefing visual e objetivo de conversao. Peca variações curtas para testar roteiro, angulo, tom e CTA antes de produzir algo maior.',
    prompt:
      'Crie um conceito multimodal para [produto/tema]. Entregue: 1) ideia central, 2) roteiro de 30 segundos, 3) direcao visual, 4) tom de voz, 5) CTA, 6) tres variacoes para testar em social/video.',
  },
  {
    title: 'Z.ai',
    label: 'Modelos globais',
    text: 'Entro como radar de modelos internacionais, agentes e alternativas que podem virar vantagem de stack.',
    briefing:
      'Use como radar de modelos e ferramentas fora do mainstream. O valor e descobrir alternativas antes de todo mundo usar a mesma stack.',
    bestUse:
      'Avalie por capacidade real e integracao. Se nao melhora custo, velocidade, controle ou qualidade, vira apenas curiosidade.',
    prompt:
      'Analise esta ferramenta/modelo internacional: [nome/link]. Quero um briefing de builder: o que faz, diferencial real, casos de uso, limitacoes, como eu testaria em 1 hora e se vale entrar no meu stack agora.',
  },
  {
    title: 'Kimi',
    label: 'Long context',
    text: 'Bom para observar contexto longo, leitura extensa, documentos grandes e pesquisa com material pesado.',
    briefing:
      'Use para long context, leitura extensa, documentos grandes, pesquisa pesada e comparacao de material. O ganho esta em condensar sem perder detalhes.',
    bestUse:
      'Peça mapa do documento antes do resumo. Depois extraia decisoes, riscos, contradicoes e proximos passos.',
    prompt:
      'Leia este material longo e trabalhe em camadas. Primeiro crie um mapa do conteudo. Depois extraia: 1) pontos essenciais, 2) decisoes implicitas, 3) riscos, 4) contradicoes, 5) tarefas acionaveis, 6) resumo executivo em 10 linhas.',
  },
  {
    title: 'Open source',
    label: 'Controle + custo',
    text: 'Onde entram local models, fine-tune, RAG, VPS, ComfyUI, Pinokio e stacks que nao dependem 100% de SaaS.',
    briefing:
      'Use quando controle, custo, privacidade, customizacao ou deploy proprio forem parte da estrategia. Inclui local models, RAG, fine-tune, ComfyUI, Pinokio e VPS.',
    bestUse:
      'Comece pequeno: um caso claro, um benchmark simples e uma metrica objetiva. Nao monte infra complexa antes de provar utilidade.',
    prompt:
      'Monte um plano open source para [caso de uso]. Considere local model, RAG, fine-tune, VPS, custos, seguranca e manutencao. Entregue: arquitetura simples, ferramentas recomendadas, primeiro teste em 2 horas e criterios para decidir se continuo ou volto para SaaS.',
  },
];

export default function ToolBriefingCards() {
  const [selectedTool, setSelectedTool] = useState<ToolBriefing | null>(null);
  const [copiedTool, setCopiedTool] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedTool) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedTool(null);
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [selectedTool]);

  async function copyPrompt(tool: ToolBriefing) {
    try {
      await navigator.clipboard.writeText(tool.prompt);
      setCopiedTool(tool.title);
      window.setTimeout(() => setCopiedTool(null), 1800);
    } catch {
      setCopiedTool(null);
    }
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {tools.map((item) => (
          <button
            key={item.title}
            type="button"
            onClick={() => setSelectedTool(item)}
            className="group relative min-h-[220px] overflow-hidden rounded-[28px] border border-zinc-800 bg-zinc-950/70 p-5 text-left transition-all duration-500 hover:-translate-y-1 hover:border-cyan-300/35 focus:outline-none focus:ring-2 focus:ring-cyan-300/50"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-300/10 via-transparent to-amber-300/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <div className="relative z-10">
              <div className="mb-7 flex items-center justify-between gap-4">
                <Code2 className="h-5 w-5 text-cyan-200" />
                <span className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500">
                  {item.label}
                </span>
              </div>
              <h3 className="text-2xl font-semibold tracking-tight text-white">{item.title}</h3>
              <p className="mt-4 text-sm leading-relaxed text-zinc-400">{item.text}</p>
              <span className="mt-8 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-cyan-200 opacity-0 transition-opacity group-hover:opacity-100">
                Abrir briefing <ArrowUpRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </button>
        ))}
      </div>

      {selectedTool ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-4 py-8 backdrop-blur-xl"
          role="dialog"
          aria-modal="true"
          aria-labelledby="tool-briefing-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedTool(null);
            }
          }}
        >
          <div className="animate-fade-rise relative max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-[36px] border border-white/10 bg-zinc-950 p-6 shadow-[0_30px_100px_rgba(0,0,0,0.75)] md:p-9">
            <div className="absolute inset-0 rounded-[36px] bg-[radial-gradient(circle_at_14%_0%,rgba(34,211,238,0.16),transparent_32%),radial-gradient(circle_at_90%_10%,rgba(245,158,11,0.12),transparent_28%)]" />
            <div className="relative z-10">
              <div className="mb-8 flex items-start justify-between gap-5">
                <div>
                  <p className="mb-4 inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-cyan-100">
                    {selectedTool.label}
                  </p>
                  <h3 id="tool-briefing-title" className="text-5xl font-semibold tracking-tight text-white md:text-7xl">
                    {selectedTool.title}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedTool(null)}
                  className="rounded-full border border-white/10 bg-white/5 p-3 text-zinc-300 transition-colors hover:text-white"
                  aria-label="Fechar briefing"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-5 lg:grid-cols-[0.92fr_1.08fr]">
                <div className="rounded-[28px] border border-zinc-800 bg-black/45 p-6">
                  <Sparkles className="h-6 w-6 text-cyan-200" />
                  <p className="mt-7 text-xs font-bold uppercase tracking-[0.22em] text-zinc-500">
                    Briefing
                  </p>
                  <p className="mt-4 text-lg leading-relaxed text-zinc-200">{selectedTool.briefing}</p>

                  <p className="mt-8 text-xs font-bold uppercase tracking-[0.22em] text-zinc-500">
                    Melhor uso
                  </p>
                  <p className="mt-4 text-base leading-relaxed text-zinc-400">{selectedTool.bestUse}</p>
                </div>

                <div className="rounded-[28px] border border-cyan-300/20 bg-cyan-300/[0.04] p-6">
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-200">
                        Prompt pronto
                      </p>
                      <p className="mt-2 text-sm text-zinc-500">Use como ponto de partida e personalize os colchetes.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyPrompt(selectedTool)}
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-white/10"
                    >
                      {copiedTool === selectedTool.title ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      {copiedTool === selectedTool.title ? 'Copiado' : 'Copiar'}
                    </button>
                  </div>

                  <pre className="mt-6 whitespace-pre-wrap rounded-[22px] border border-zinc-800 bg-black/70 p-5 text-sm leading-relaxed text-zinc-200">
                    {selectedTool.prompt}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
