import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-accent mb-4">404</h1>
        <h2 className="text-2xl font-bold text-foreground mb-4">
          Página não encontrada
        </h2>
        <p className="text-muted-foreground mb-6">
          A página que você está procurando não existe ou foi movida.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-accent text-background font-medium rounded-lg hover:bg-accent-hover transition-colors"
        >
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}

