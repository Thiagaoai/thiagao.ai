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
        <h2 className="text-2xl font-bold text-foreground mb-4">
          Algo deu errado!
        </h2>
        <p className="text-muted-foreground mb-6">
          Ocorreu um erro inesperado. Por favor, tente novamente.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-accent text-background font-medium rounded-lg hover:bg-accent-hover transition-colors"
          >
            Tentar novamente
          </button>
          <Link
            href="/"
            className="px-6 py-3 border border-border text-foreground font-medium rounded-lg hover:bg-muted transition-colors"
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}
