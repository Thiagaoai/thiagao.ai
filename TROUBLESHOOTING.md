# 🔧 Guia de Solução de Problemas - Conexão

## ✅ Status Atual
- ✅ Servidor configurado na porta **3002**
- ✅ Hostname configurado para **0.0.0.0** (aceita conexões de qualquer IP)
- ✅ Build funcionando corretamente
- ✅ Conexão testada e funcionando

## 🚀 Como Iniciar o Servidor

### Método 1: NPM Script (Recomendado)
```bash
npm run dev
```

### Método 2: Script Automático
```bash
./start-dev.sh
```

## 🔍 Verificar se o Servidor Está Rodando

```bash
# Verificar porta
lsof -i:3002

# Testar conexão
curl http://localhost:3002
```

## 🛠️ Solução de Problemas

### Problema: Porta 3002 já está em uso

**Solução:**
```bash
# Matar processo na porta 3002
lsof -ti:3002 | xargs kill -9

# Ou matar todos os processos Next.js
pkill -9 -f "next dev"
```

### Problema: Conexão recusada

**Solução:**
```bash
# Limpar cache
rm -rf .next

# Reinstalar dependências (se necessário)
rm -rf node_modules
npm install

# Iniciar novamente
npm run dev
```

### Problema: Browser não carrega a página

**Soluções:**
1. Verifique se o servidor está rodando:
   ```bash
   lsof -i:3002
   ```

2. Tente acessar:
   - http://localhost:3002
   - http://127.0.0.1:3002
   - http://0.0.0.0:3002

3. Limpe o cache do browser (Ctrl+Shift+R ou Cmd+Shift+R)

4. Verifique o console do browser para erros

### Problema: Erro de compilação

**Solução:**
```bash
# Limpar cache e rebuild
npm run clean
npm run build
npm run dev
```

## 📝 Informações Importantes

- **Porta:** 3002
- **Host:** 0.0.0.0 (aceita conexões de qualquer IP)
- **URL Local:** http://localhost:3002
- **URL Rede:** http://[SEU-IP]:3002

## ✅ Checklist de Verificação

Antes de reportar problemas, verifique:

- [ ] Servidor está rodando (`lsof -i:3002`)
- [ ] Porta 3002 está livre
- [ ] Não há erros no terminal
- [ ] Cache foi limpo (`.next` removido)
- [ ] Dependências instaladas (`npm install`)
- [ ] Browser não está em cache (hard refresh)

## 🆘 Se Nada Funcionar

1. Pare todos os processos:
   ```bash
   pkill -9 -f "next dev"
   lsof -ti:3002 | xargs kill -9
   ```

2. Limpe tudo:
   ```bash
   rm -rf .next node_modules/.cache
   ```

3. Reinstale e inicie:
   ```bash
   npm install
   npm run dev
   ```

4. Verifique os logs no terminal para erros específicos

