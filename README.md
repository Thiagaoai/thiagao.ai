# Thiago do Carmo - Portfolio Website

Um website minimalista e moderno desenvolvido com Next.js 16, TypeScript e Tailwind CSS.

## 🚀 Características

- ✅ **Design Minimalista**: Interface limpa e focada no conteúdo
- ✅ **Totalmente Responsivo**: Funciona perfeitamente em todos os dispositivos
- ✅ **Performance Otimizada**: Carregamento rápido e otimizações de SEO
- ✅ **Acessibilidade**: Seguindo as melhores práticas de acessibilidade web
- ✅ **Animações Suaves**: Transições e animações elegantes
- ✅ **Formulário Validado**: Validação completa do formulário de contato
- ✅ **Smooth Scrolling**: Navegação suave entre seções
- ✅ **Error Handling**: Tratamento de erros e estados de carregamento

## 🛠️ Tecnologias

- **Next.js 16** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS 4** - Estilização utilitária
- **React 19** - Biblioteca UI

## 🎃 Farmz3D + DockPlus (loja, painel e Jev)

```bash
npm ci
npm run farmz3d:local   # http://localhost:3002/farmz3d · painel: /admin/login (admin / farmz3d-local)
```

Documentação: `docs/farmz3d/` (PRD, SDD, plano de execução e setup).

## 📦 Instalação

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Executar em produção
npm start
```

O site estará disponível em `http://localhost:3002`

## 📁 Estrutura do Projeto

```
app/
├── page.tsx                     # Home (server component: busca posts e renderiza HomePage)
├── components/
│   ├── home/HomePage.tsx        # Seções da home (client component)
│   ├── home/LazyVideo.tsx       # Vídeos abaixo da dobra carregados sob demanda
│   ├── hands-hero/              # Hero com as mãos (WebGL) portado de vikod3/handstouch
│   └── BrandMark.tsx            # Logo e wordmark
├── briefing/                    # Newsletter (servida em /newsletter; /briefing é alias)
├── farmz3d/                     # Loja Farmz3D
├── reviews-machine/             # Produto DockPlus: Reviews Machine + Missed-Call Text-Back
├── admin/                       # Painéis (newsletter, Farmz3D)
├── api/                         # Rotas de API
├── globals.css                  # Estilos globais
└── layout.tsx                   # Layout, fontes (next/font) e metadata
lib/                             # Regras de negócio (briefing, dockplus, farmz3d, typesafe)
public/media/hands/              # Vídeo e poster do hero
docs/brand/                      # Fontes do logo (SVG e kit)
```

## 🎨 Personalização

### Marca

Nome e wordmark em `app/components/BrandMark.tsx` (`BRAND_NAME`) e `app/layout.tsx` (`brandName`).

### Fontes

Carregadas com `next/font` em `app/layout.tsx` (Inter, Instrument Serif) e `app/components/hands-hero/fonts.ts` (Outfit).
Não usar `@import` do Google Fonts: a CSP do site bloqueia.

### Conteúdo

Textos da home em `app/components/home/HomePage.tsx`. Os cards de "Novidades" vêm dos briefings publicados.

## 🔧 Configuração

### Imagens Externas

O projeto está configurado para usar imagens do Cloudinary. Para adicionar outros domínios, edite `next.config.ts`:

```typescript
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'res.cloudinary.com',
      pathname: '/**',
    },
  ],
}
```

### Newsletter

O formulário da home e da página de newsletter grava em `/api/newsletter/subscribe` (Supabase). Veja `docs/newsletter-briefing.md`.

## 📱 Responsividade

O site é totalmente responsivo com breakpoints:
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

## ♿ Acessibilidade

- Navegação por teclado completa
- ARIA labels em todos os elementos interativos
- Contraste de cores adequado
- Foco visível em todos os elementos
- Estrutura semântica HTML5

## 🚀 Deploy

### Vercel (Recomendado)

1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente se necessário
3. Deploy automático a cada push

### Outros Provedores

```bash
npm run build
npm start
```

## 📝 Licença

Todos os direitos reservados © 2024 Thiago do Carmo
