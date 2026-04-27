import Link from 'next/link';
import { ArrowRight, CheckCircle2, ExternalLink, Mail, MessageCircle, Send } from 'lucide-react';
import { BrandMark } from '../../components/BrandMark';

type PageProps = {
  searchParams?: Promise<{
    email?: string;
  }>;
};

const newsletterUrl = 'https://www.thiagao.io/newsletter';
const shareText =
  'Entrei no ThigaoA.i Briefing: uma newsletter curta sobre IA, big tech e ferramentas novas.';
const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${newsletterUrl}`)}`;
const xShareUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(newsletterUrl)}`;
const linkedInShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(newsletterUrl)}`;

export const metadata = {
  title: 'Você está dentro - ThigaoA.i Briefing',
  description: 'Confirmação de inscrição no ThigaoA.i Briefing.',
};

export default async function NewsletterObrigadoPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const email = params?.email?.trim();

  return (
    <main className="min-h-screen overflow-hidden bg-black text-white selection:bg-cyan-400/25">
      <section className="relative min-h-screen px-6 py-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(34,211,238,0.16),transparent_30%),radial-gradient(circle_at_84%_30%,rgba(245,158,11,0.11),transparent_34%)]" />
        <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col">
          <nav className="flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-3">
              <BrandMark className="h-10 w-10 rounded-2xl" />
              <span className="text-xl font-bold tracking-tight">ThigaoA.i</span>
            </Link>
            <Link
              href="/newsletter"
              className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-bold text-white transition-colors hover:border-cyan-300/40"
            >
              Voltar
            </Link>
          </nav>

          <div className="grid flex-1 grid-cols-1 items-center gap-10 py-16 lg:grid-cols-[0.95fr_1.05fr]">
            <div>
              <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-cyan-100">
                <CheckCircle2 className="h-4 w-4" />
                Inscrição confirmada
              </p>
              <h1
                className="max-w-4xl text-[48px] font-normal leading-[0.98] tracking-tight text-white sm:text-[76px]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Você está dentro do briefing.
              </h1>
              <p className="mt-7 max-w-2xl text-base leading-relaxed text-zinc-300 sm:text-lg">
                {email ? (
                  <>
                    A inscrição de <span className="font-bold text-white">{email}</span> foi recebida.
                  </>
                ) : (
                  'Sua inscrição foi recebida.'
                )}{' '}
                A edição diária é preparada para sair às 5 PM New York com contexto, fontes e uma
                leitura prática do que realmente importa.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <a
                  href="https://www.youtube.com/@solocodando"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-4 text-sm font-extrabold text-black transition-transform hover:scale-[1.03]"
                >
                  Abrir Solocodando
                  <ExternalLink className="h-4 w-4" />
                </a>
                <Link
                  href="/newsletter#briefings"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-7 py-4 text-sm font-bold text-white transition-colors hover:border-cyan-300/40"
                >
                  Ver últimas edições
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="rounded-[34px] border border-white/10 bg-zinc-950/75 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.48)] sm:p-7">
              <div className="rounded-[28px] border border-white/10 bg-black/50 p-5">
                <Mail className="h-7 w-7 text-cyan-200" />
                <h2 className="mt-5 text-2xl font-semibold tracking-tight text-white">
                  Próximos passos
                </h2>
                <div className="mt-6 grid gap-3">
                  {[
                    'Adicionar o remetente aos contatos para evitar cair em promoções ou spam.',
                    'Responder qualquer edição com dúvida, pauta ou ferramenta que você quer ver.',
                    'Compartilhar com alguém que acompanha IA e big tech sem paciência para hype.',
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 text-sm leading-relaxed text-zinc-300"
                    >
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-cyan-200" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <a
                  href={whatsappShareUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-bold text-white transition-colors hover:border-cyan-300/40"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </a>
                <a
                  href={xShareUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-bold text-white transition-colors hover:border-cyan-300/40"
                >
                  <Send className="h-4 w-4" />
                  X
                </a>
                <a
                  href={linkedInShareUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-bold text-white transition-colors hover:border-cyan-300/40"
                >
                  <ExternalLink className="h-4 w-4" />
                  LinkedIn
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
