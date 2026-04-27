import type { BriefingPost } from './types';

export const fallbackBriefings: BriefingPost[] = [
  {
    id: 'fallback-agentic-ops',
    slug: 'agentic-ops-briefing',
    status: 'published',
    title: 'Claude + LangGraph: quando usar para construir agente de verdade',
    dek: 'Meu start: Claude para pensar/codar, LangGraph para transformar a ideia em fluxo com estado.',
    brief:
      'Se o trabalho e so responder texto, um chat basta. Se precisa executar etapas, usar tools, lembrar estado, pausar para revisao e continuar depois, eu colocaria LangGraph no centro e usaria Claude para acelerar arquitetura e codigo.',
    takeaway:
      'Start rapido: desenhe o fluxo em 4 blocos: entrada, decisao, ferramenta e checkpoint humano.',
    category: 'Agents',
    tags: ['Claude', 'LangGraph', 'LangSmith', 'MCP'],
    sources: [
      {
        title: 'LangGraph docs',
        url: 'https://langchain-ai.github.io/langgraph/',
        publisher: 'LangChain',
      },
      {
        title: 'Model Context Protocol',
        url: 'https://modelcontextprotocol.io/',
        publisher: 'MCP',
      },
    ],
    relevanceScore: 94,
    readingMinutes: 4,
    publishedAt: '2026-04-24T21:00:00.000Z',
    createdAt: '2026-04-24T21:00:00.000Z',
  },
  {
    id: 'fallback-automation-crm',
    slug: 'n8n-crm-whatsapp-automation',
    status: 'published',
    title: 'ChatGPT + n8n: a primeira automacao que eu montaria para um negocio',
    dek: 'Capturar lead, resumir contexto, criar tarefa e mandar follow-up ainda vence muita IA bonita.',
    brief:
      'Eu usaria ChatGPT para classificar e resumir mensagens, n8n para orquestrar o fluxo e CRM/WhatsApp para garantir que o lead tenha dono, prioridade e proxima acao.',
    takeaway:
      'Start rapido: comece com formulario -> classificacao IA -> CRM -> WhatsApp/Telegram -> lembrete.',
    category: 'Automacao',
    tags: ['ChatGPT', 'n8n', 'GHL', 'WhatsApp'],
    sources: [
      {
        title: 'n8n blog',
        url: 'https://blog.n8n.io/',
        publisher: 'n8n',
      },
    ],
    relevanceScore: 89,
    readingMinutes: 3,
    publishedAt: '2026-04-23T21:00:00.000Z',
    createdAt: '2026-04-23T21:00:00.000Z',
  },
  {
    id: 'fallback-devtools',
    slug: 'devtools-ai-builders',
    status: 'published',
    title: 'Gemini, Grok, Kimi e open source: onde eu colocaria cada um',
    dek: 'Nem toda ferramenta precisa ser principal. Algumas entram como radar, outras como motor de produto.',
    brief:
      'Gemini faz sentido quando o ecossistema Google pesa. Grok entra como leitura de internet e cultura. Kimi chama atencao para contexto longo. Open source entra quando custo, controle, privacidade ou fine-tune importam.',
    takeaway:
      'Start rapido: nao escolha modelo por hype; escolha por tarefa, custo, contexto e integracao.',
    category: 'AI',
    tags: ['Gemini', 'Grok', 'Kimi', 'Open source'],
    sources: [
      {
        title: 'Next.js docs',
        url: 'https://nextjs.org/docs',
        publisher: 'Vercel',
      },
    ],
    relevanceScore: 84,
    readingMinutes: 5,
    publishedAt: '2026-04-22T21:00:00.000Z',
    createdAt: '2026-04-22T21:00:00.000Z',
  },
];
