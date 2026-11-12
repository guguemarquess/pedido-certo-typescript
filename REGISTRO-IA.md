# Registro do uso de IA

O enunciado permite usar IA com **sinal amarelo**: cada sugestão precisa ser **avaliada, ajustada e justificada**, e a ferramenta precisa ser **citada como fonte**. Este arquivo guarda cada uso, do primeiro ao último.

## Modelo de entrada

Copie este bloco a cada novo uso:

```
### Entrada N · DD/MM · Etapa X
- **Ferramenta:** qual IA e onde (ex.: Claude, no Claude Code)
- **O que eu pedi:** o pedido, com as minhas palavras
- **O que a IA sugeriu:** um resumo ou o trecho principal
- **Avaliação crítica:** estava certo? Tinha `any` indevido, tipo errado ou complexidade desnecessária? Como eu conferi?
- **O que eu mudei e por quê:** o ajuste e a justificativa (se não mudei nada, por que aceitei)
- **Evidência:** o commit, o diff ou o print
```

> **O que o professor quer ver aqui:** não é a quantidade de uso, é o **olhar crítico**. Uma entrada que diz "a IA sugeriu `as Pedido`, mas isso esconde um erro, então troquei por uma validação" vale muito mais do que dez entradas dizendo "aceitei".

---

## Entradas

### Entrada 1 · 11/11 · Etapa 0 (planejamento)
- **Ferramenta:** Claude (Anthropic), no Claude Code, usado como professor nos meus estudos.
- **O que eu pedi:** organizar o projeto a partir das transcrições das aulas e do repositório do professor no GitHub.
- **O que a IA sugeriu:** o domínio **Sistema de Pedidos**, um plano em 7 etapas (começar em JavaScript e migrar para TypeScript, com um commit por etapa), a estrutura de pastas e um calendário até 16/11.
  - Ela também testou o repositório do professor e apontou dois comentários que não batem com o comportamento real do TypeScript (em `estaticos.ts` e `generics-type-interface.ts`).
- **Avaliação crítica:** **[A PREENCHER: o escopo está pequeno o bastante para o prazo? Você conferiu os dois comentários apontados, por exemplo no Playground?]**
- **O que eu mudei e por quê:** confirmei o domínio Sistema de Pedidos porque ele reaproveita o Painel de Pedidos das aulas 02 a 04 e tem regras de negócio que eu conheço bem, por vir de Produto. **[A PREENCHER: acrescente o que mais você ajustou no plano]**
- **Evidência:** o arquivo `PLANO-DO-PROJETO.md` na minha pasta de estudos.

### Entrada 2 · 11/11 · Etapa v0 (versão em JavaScript)
- **Ferramenta:** Claude (Anthropic), no Claude Code.
- **O que eu pedi:** a versão em JavaScript do módulo, com as 5 regras de negócio e **alguns bugs típicos de JavaScript plantados de propósito**, para o TypeScript encontrar nas próximas etapas. Também pedi ideias de nome para o sistema.
- **O que a IA sugeriu:** o arquivo `legado/pedidos.js`, com 5 bugs marcados com `BUG` nos comentários:
  - **A:** o status `"Pago"` com maiúscula, e o pedido pago não consegue ser enviado.
  - **B:** `item.nome` quando o campo se chama `produto`, e o resumo mostra `undefined x2`.
  - **C:** o `switch` dos rótulos esquece o status `"cancelado"`, e o rótulo vira `undefined`.
  - **D:** um pedido da "API" com o frete em texto (`"12.5"`), e o total vira **R$ 3012.5** em vez de R$ 42.50.
  - **E:** um pedido sem cliente (`null`), que **quebra** o programa no resumo.
  - Para o nome, a IA sugeriu "Pedido Certo", "Comanda" e "Carrinho Tipado".
- **Avaliação crítica:** rodei com `node legado/pedidos.js`. Os bugs A a D passaram **calados**: o JavaScript não reclamou de nada e mostrou resultados errados. Só o E apareceu, e só **na hora de rodar** (`TypeError`). **[A PREENCHER: algum desses bugs você já viu acontecer num produto real? Qual seria o impacto para o cliente?]**
- **O que eu mudei e por quê:** escolhi o nome **Pedido Certo**, porque ele explica o valor do TypeScript em linguagem de Produto: um pedido que não sai errado. Também renomeei o repositório para `pedido-certo-typescript`. **[A PREENCHER: acrescente se mudou algo no código]**
- **Evidência:** o commit `v0: versão em JavaScript` e a saída do console abaixo.

```
1) #1 · Ana · undefined x2 · total R$ 97.67 · aguardando pagamento
2) Pagamento registrado
3) Só é possível enviar um pedido pago
4) #1 · Ana · undefined x2 · total R$ 97.67 · undefined
5) Pedido cancelado
6) #1 · Ana · undefined x2 · total R$ 97.67 · undefined
7) #2 · Bia · undefined x1 · total R$ 3012.5 · aguardando pagamento
TypeError: Cannot read properties of null (reading 'nome')
```

### Entrada 3 · 11/11 · Etapas 1 a 5 e documentação
- **Ferramenta:** Claude (Anthropic, modelo Claude Opus 5.5), no Claude Code.
- **O que eu pedi:** que a IA fizesse o restante do projeto, etapa por etapa, explicando cada decisão, e que só enviasse ao GitHub depois de eu validar o README.
- **O que a IA fez:** a migração de `legado/pedidos.js` para `src/` em 5 commits. Em cada etapa, ela rodou o compilador **antes** de corrigir e guardou a saída em `evidencias/`:
  - **Etapa 1:** o compilador achou os bugs A, B, C e E e mais um que não tinha sido plantado: `buscarPorId` podia devolver `undefined`, e o JavaScript nunca tratava esse caso.
  - **Etapa 2:** os tipos novos (cupom e pagamento como uniões discriminadas, pedido `readonly`) obrigaram a refatorar 6 pontos do código.
  - **Etapa 3:** trocar o `any` do `JSON.parse` por `unknown` revelou o bug D, que tinha passado calado pelas etapas 1 e 2.
  - **Etapa 4:** a IA fez um experimento: acrescentou um status `"devolvido"` e mostrou que o compilador aponta os 3 lugares que ficariam desatualizados. Depois desfez.
  - **Etapa 5:** source maps conferidos na prática (o erro aponta para `src/...ts` em vez de `dist/...js`).
- **Pontos que eu mesmo corrigi na IA:** na v0, a IA colocou emojis no README e no código, e um título que eu não tinha validado. Pedi para tirar tudo, porque emoji deixa o texto com cara de gerado por IA. Também conferi o nome do sistema e do repositório antes de publicar.
- **Avaliação crítica:** **[A PREENCHER: escolha 2 ou 3 decisões abaixo e diga se concorda, discorda ou mudaria, e por quê]**
  - Aceitar número em forma de texto vindo da API (`"12.5"`), convertendo com `Number()`, em vez de recusar.
  - Gravar o frete no pedido (cotação) em vez de recalcular sempre.
  - Trocar o `throw` por `Resultado<T>` na etapa 4: o código ficou mais seguro, mas o `main.ts` precisou de uma função auxiliar (`exigir`).
  - Não usar `enum` nem tipos condicionais, e justificar a escolha.
  - O `PorStatus` e o `garantirExaustividade` valem a complexidade extra para um módulo pequeno?
- **O que eu mudei e por quê:** **[A PREENCHER: o que você mudou no código ou no README depois de revisar, ou por que aceitou como estava]**
- **Evidência:** os commits `etapa 1` a `etapa 5` e `docs: README e registro de IA`, e os arquivos em `evidencias/`.
