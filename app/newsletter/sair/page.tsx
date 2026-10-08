import Link from 'next/link';
import { BrandMark } from '../../components/BrandMark';
import { normalizeEmail } from '@/lib/briefing/unsubscribe';

type PageProps = {
  searchParams?: Promise<{
    email?: string;
    token?: string;
    state?: string;
  }>;
};

export const metadata = {
  title: 'Sair da newsletter - Thiagao Ai Daily',
  description: 'Cancelar o recebimento do Thiagao Ai Daily.',
  robots: { index: false, follow: false },
};

const pillClass =
  'inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-7 py-4 text-sm font-bold text-white transition-colors hover:border-cyan-300/40';

export default async function NewsletterSairPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const email = params?.email?.trim() ? normalizeEmail(params.email) : '';
  const token = params?.token?.trim() ?? '';
  const state = params?.state;

  const done = state === 'done';
  const invalid = !done && (state === 'invalid' || !email || !token);

  return (
    <main className="min-h-screen overflow-hidden bg-black text-white selection:bg-cyan-400/25">
      <section className="relative min-h-screen px-6 py-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(34,211,238,0.16),transparent_30%),radial-gradient(circle_at_84%_30%,rgba(245,158,11,0.11),transparent_34%)]" />
        <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col">
          <nav className="flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-3">
              <BrandMark className="h-10 w-10 rounded-2xl" />
              <span className="text-xl font-bold tracking-tight">Thiagao Ai</span>
            </Link>
            <Link
              href="/newsletter"
              className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-bold text-white transition-colors hover:border-cyan-300/40"
            >
              Voltar
            </Link>
          </nav>

          <div className="flex flex-1 items-center justify-center py-16">
            <div className="w-full max-w-xl rounded-[34px] border border-white/10 bg-zinc-950/75 p-7 shadow-[0_30px_90px_rgba(0,0,0,0.48)]">
              {done ? (
                <>
                  <h1 className="text-3xl font-semibold tracking-tight text-white">Pronto, você saiu da lista.</h1>
                  <p className="mt-4 text-base leading-relaxed text-zinc-300">
                    Mudou de ideia? Assine de novo quando quiser.
                  </p>
                  <div className="mt-8">
                    <Link href="/newsletter" className={pillClass}>
                      Voltar para a newsletter
                    </Link>
                  </div>
                </>
              ) : invalid ? (
                <>
                  <h1 className="text-3xl font-semibold tracking-tight text-white">Link inválido</h1>
                  <p className="mt-4 text-base leading-relaxed text-zinc-300">
                    Esse link de descadastro não é válido. Responda qualquer edição com SAIR que eu removo você.
                  </p>
                  <div className="mt-8">
                    <Link href="/newsletter" className={pillClass}>
                      Voltar para a newsletter
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <h1 className="text-3xl font-semibold tracking-tight text-white">Sair da newsletter</h1>
                  <p className="mt-4 text-base leading-relaxed text-zinc-300">
                    Quer parar de receber o Thiagao Ai Daily em <span className="font-bold text-white">{email}</span>?
                  </p>
                  <form method="post" action="/api/newsletter/unsubscribe" className="mt-8">
                    <input type="hidden" name="email" value={email} />
                    <input type="hidden" name="token" value={token} />
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center rounded-full bg-white px-7 py-4 text-sm font-extrabold text-black transition-transform hover:scale-[1.03]"
                    >
                      Confirmar descadastro
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
