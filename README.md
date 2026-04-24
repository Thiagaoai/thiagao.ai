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
├── components/          # Componentes React
│   ├── Navigation.tsx   # Navegação principal
│   ├── Hero.tsx         # Seção hero
│   ├── About.tsx        # Seção sobre
│   ├── Businesses.tsx   # Seção empresas
│   ├── Skills.tsx       # Seção habilidades
│   ├── FaithPurpose.tsx # Seção fé e propósito
│   ├── Contact.tsx      # Formulário de contato
│   └── Footer.tsx       # Rodapé
├── globals.css          # Estilos globais
├── layout.tsx          # Layout principal
├── page.tsx             # Página inicial
├── loading.tsx          # Estado de carregamento
├── error.tsx            # Tratamento de erros
└── not-found.tsx        # Página 404
```

## 🎨 Personalização

### Cores

As cores podem ser personalizadas em `app/globals.css`:

```css
:root {
  --background: #0a0a0a;
  --foreground: #ededed;
  --accent: #d4a574;
  --accent-hover: #c49564;
  --muted: #1a1a1a;
  --muted-foreground: #a0a0a0;
  --border: #2a2a2a;
}
```

### Conteúdo

O conteúdo pode ser editado diretamente nos componentes em `app/components/`.

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

### Formulário de Contato

O formulário de contato atualmente simula o envio. Para integrar com um backend real:

1. Crie uma API route em `app/api/contact/route.ts`
2. Atualize a função `handleSubmit` em `app/components/Contact.tsx`

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
