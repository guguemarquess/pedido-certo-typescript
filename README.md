# Pedido Certo

**Pedido Certo** é um sistema de pedidos escrito em TypeScript. O nome resume a ideia do projeto: usar o sistema de tipos para que um pedido **não saia errado**. Se o status estiver escrito errado, se faltar um campo ou se o dado de fora vier estranho, o erro aparece enquanto o código é escrito, e não na mão do cliente.

Projeto da disciplina **TypeScript para Desenvolvimento Front-end** do MBA em Engenharia Front-end e Desenvolvimento Mobile com IA (Instituto Infnet).

## O que é

Um **módulo de regras de negócio** para os pedidos de uma loja. O foco é **modelar os dados e as regras com o sistema de tipos**. Não tem interface visual: o resultado aparece no console.

1. **Criar um pedido** com cliente (ou visitante), itens, região de entrega e cupom opcional. Todo pedido nasce `pendente`.
2. **Calcular o total**: itens − desconto + frete. O cupom pode ser percentual ou de valor fixo, o frete é **grátis a partir de R$ 200** e o total **nunca fica negativo**.
3. **Mudar o status**: `pendente` → `pago` → `enviado` → `entregue`. Só é possível **cancelar antes de `enviado`**. O pagamento pode ser Pix, cartão ou boleto.
4. **Receber pedidos de fora** (uma API simulada): os dados chegam como `unknown` e só entram depois de conferidos campo a campo.
5. **Guardar e buscar** pedidos e clientes num repositório genérico, com um painel de pedidos por status.

## Como rodar

Pré-requisito: **Node 20 ou mais recente**.

```bash
npm install
npm start
```

O `npm start` compila o TypeScript (`src/` → `dist/`) e roda o roteiro de demonstração (`src/main.ts`).

| Comando | O que faz |
|---|---|
| `npm run check` | Confere os tipos sem gerar arquivos (`tsc --noEmit`) |
| `npm run build` | Compila `src/` para `dist/`, com os source maps |
| `npm start` | Compila e roda o roteiro, com `--enable-source-maps` |
| `npm run legado` | Roda a versão JavaScript original, com os bugs |
| `npm run demo:sem-source-map` | Provoca um erro e mostra a pilha apontando para o `.js` |
| `npm run demo:com-source-map` | O mesmo erro, com a pilha apontando para o `.ts` |

## Estrutura

```
legado/pedidos.js      versão JavaScript inicial (o "antes"), com 5 bugs plantados
src/tipos.ts           os moldes do domínio: Pedido, Cliente, Cupom, Pagamento, StatusPedido...
src/frete.ts           tabela de frete, tipo Regiao e a classe Frete (membros static)
src/regras.ts          criar, calcular, mudar status, painel e textos
src/validacao.ts       confere o que vem da API (unknown → Resultado<Pedido>)
src/repositorio.ts     Repositorio<T> genérico e o contrato Armazenamento<T>
src/utilitarios.ts     Resultado<T> e garantirExaustividade (genéricos, sem regra de negócio)
src/main.ts            roteiro de demonstração
src/demo-source-map.ts demonstração dos source maps
evidencias/            a saída do compilador em cada etapa (o antes e o depois)
```

## A evolução: um commit por etapa

O projeto começou em JavaScript e foi migrado para TypeScript aos poucos. Cada etapa é um commit, e a pasta `evidencias/` guarda o que o compilador encontrou em cada uma.

| Etapa | Commit | O que mudou | Evidência |
|---|---|---|---|
| v0 | `v0: versão em JavaScript` | As 5 regras em JavaScript puro, com 5 bugs típicos plantados (A a E) | saída no `REGISTRO-IA.md` |
| 1 | `etapa 1: primeiros tipos` | Tradução para TypeScript com `strict`. O compilador achou os bugs A, B, C e E, e mais um que não tinha sido plantado | `etapa-1-erros-do-typescript.txt` |
| 2 | `etapa 2: contratos e classes` | Uniões discriminadas, interseção, tipo de função, `readonly` + spread, rest, tupla, classes | `etapa-2-refatoracao-obrigada-pelos-tipos.txt` |
| 3 | `etapa 3: dados de fora com segurança` | `unknown` + validação (corrige o bug D), `keyof typeof`, `as const` | `etapa-3-any-escondia-o-bug-d.txt` |
| 4 | `etapa 4: abstrações` | Generics, mapped type, exaustividade com `never` | `etapa-4-exaustividade.txt` |
| 5 | `etapa 5: ambiente` | `tsconfig` final, `@types/node`, source maps, JavaScript moderno | `etapa-5-ambiente-e-source-maps.txt` |

Os 5 bugs plantados na v0:

| Bug | O que era | Quem achou |
|---|---|---|
| A | status `"Pago"`, com maiúscula: o pedido pago não podia ser enviado | o compilador, na etapa 1 (união de literais) |
| B | `item.nome` quando o campo é `produto`: aparecia `undefined x2` | o compilador, na etapa 1 (interface) |
| C | o `switch` esquecia `"cancelado"`: o rótulo virava `undefined` | o compilador, na etapa 1 (retorno anotado); e, desde a etapa 4, o `never` |
| D | frete `"12.5"` vindo da API: o total virava R$ 3012,50 | ninguém, até a etapa 3: o `any` do `JSON.parse` escondia; o `unknown` mostrou |
| E | pedido sem cliente (`null`): o programa quebrava | o compilador, na etapa 1 (`strictNullChecks`) |

## Decisões técnicas

- **Pedido de visitante.** `cliente: Cliente | null` em vez de inventar um cliente vazio. O `null` obriga todo código que lê o cliente a tratar o caso.
- **Pedido imutável.** Todos os campos são `readonly`, e cada mudança devolve um pedido novo (spread). Ninguém altera um pedido "pelas costas" de quem já o tinha guardado.
- **Frete cotado na criação.** O frete é calculado ao criar o pedido (e de novo ao adicionar itens) e fica gravado, como numa cotação de checkout.
- **`Resultado<T>` em vez de `throw`.** Na etapa 2, as mudanças de status lançavam erro, e o tipo não avisava que elas podiam falhar. Desde a etapa 4, elas devolvem `Resultado<Pedido>`, e o compilador obriga a tratar a falha.
- **Dados de fora são `unknown`.** Nada de `any` nem de `as Pedido`. A validação junta todos os erros antes de responder, para quem integra a API corrigir tudo de uma vez.
- **Número em forma de texto é aceito, mas convertido.** `"12.5"` passa por `Number()` e é conferido (número finito e maior ou igual a zero). Um `as number` só fingiria.
- **Uma fonte de verdade.** `StatusPedido` sai de uma lista `as const` e `Regiao` sai da tabela de frete (`keyof typeof`). O tipo e a validação nunca ficam diferentes.
- **União de literais em vez de `enum`.** O `enum` gera código JavaScript extra e não funciona quando o Node roda TypeScript direto, sem compilar. A união some na compilação e dá a mesma proteção.
- **Sem tipos condicionais.** Não apareceu um uso natural no domínio, e forçar um só aumentaria a complexidade.
- **Sem `protected`.** Nenhuma classe herda de outra. O encapsulamento usa `private` e o escopo do módulo (a tabela de frete e a função `mudarStatus` não são exportadas).
- **Um único `as` no código** (`validacao.ts`). Ele só alarga a lista de status para o `includes` aceitar um texto ainda não conferido, e não esconde nenhuma incompatibilidade.

## Onde está cada critério de avaliação

| # | Critério | Onde está |
|---|---|---|
| 1 | Primitivos, uniões e literais | `tipos.ts`: `StatusPedido`, `Cupom`, `Pagamento` · `frete.ts`: `Regiao` |
| 2 | Inferência × anotação explícita | parâmetros e retornos anotados (contratos); variáveis internas inferidas, como em `detalharTotal` |
| 3 | Objetos tipados e funções coerentes | interfaces em `tipos.ts`; funções em `regras.ts` |
| 4 | Uniões, literais e funções combinados | `regraDoCupom` (união discriminada → tipo de função) e `pagar` (`Pagamento` + `Resultado`) |
| 5 | Interfaces | `Cliente`, `ItemPedido`, `Pedido` (`tipos.ts`) · `Armazenamento<T>` (`repositorio.ts`) |
| 6 | Arrays, tuplas e spread/rest | `adicionarItens` (rest + spread) · `detalharTotal` (tupla com rótulos) · `Repositorio.listar` |
| 7 | Classes, visibilidade e `static` | `Frete` (`static readonly` e método `static`) · `Repositorio` (`private`, `get`, `implements`) |
| 8 | Interfaces, uniões, interseções, tipos de função e classes articulados | `ItemDetalhado` (`&`) · `RegraDeDesconto` · `Repositorio implements Armazenamento` |
| 9 | Sem `any` indevido; `unknown` tratado | `validacao.ts` (type guards e conversões) · `demo-source-map.ts` (erro do `catch`) |
| 10 | `keyof`, `typeof` e asserções sem esconder erros | `frete.ts` (`keyof typeof`) · `tipos.ts` (`typeof STATUS_PEDIDO[number]`, `as const`) · `validacao.ts` (o único `as`) |
| 11 | Generics | `Resultado<T>`, `sucesso<T>` · `Repositorio<T extends { id }>`, `Armazenamento<T>` · `PorStatus<Valor>` · `exigir<T>` (`main.ts`) |
| 12 | Mapped types, condicionais e exaustividade | `PorStatus` (`PROXIMOS_STATUS`, `contarPorStatus`) · `garantirExaustividade` em 3 switches · condicionais: não usados (ver Decisões) |
| 13 | `tsconfig` e compilador demonstrados | `tsconfig.json` comentado · `npm run check` / `build` · `evidencias/etapa-5` |
| 14 | Dependências de tipos e source maps | `@types/node` · `sourceMap` + `--enable-source-maps` · `npm run demo:*` |
| 15 | ECMAScript moderno, `enum` e correções de tipagem | ES2022, `Object.hasOwn`, `Map`, `Intl.NumberFormat`, `?.` e `??` · `enum`: ver Decisões · correções: `evidencias/etapa-1` a `etapa-3` |
| 16 | Refatoração, decisões e avaliação da IA | `legado/` → `src/`, histórico de commits, `evidencias/`, esta seção e o `REGISTRO-IA.md` |

## Uso de IA

O projeto foi desenvolvido com apoio de IA (Claude, da Anthropic). Cada uso está registrado, com a avaliação crítica, em [`REGISTRO-IA.md`](REGISTRO-IA.md).
