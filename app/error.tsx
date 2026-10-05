'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console or error reporting service
    console.error('Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h2 className="font-display text-3xl text-foreground mb-4">
          Algo deu errado!
        </h2>
        <p className="text-muted-foreground mb-6">
          Ocorreu um erro inesperado. Por favor, tente novamente.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="liquid-glass rounded-full px-6 py-3 text-foreground transition-transform hover:scale-[1.03]"
          >
            Tentar novamente
          </button>
          <Link
            href="/"
            className="rounded-full border border-white/10 px-6 py-3 text-foreground transition-colors hover:bg-white/5"
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}
