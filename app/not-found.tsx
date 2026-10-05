import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="font-display text-7xl text-foreground mb-4">404</h1>
        <h2 className="font-display text-3xl text-foreground mb-4">
          Página não encontrada
        </h2>
        <p className="text-muted-foreground mb-6">
          A página que você está procurando não existe ou foi movida.
        </p>
        <Link
          href="/"
          className="liquid-glass inline-block rounded-full px-6 py-3 text-foreground transition-transform hover:scale-[1.03]"
        >
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}

