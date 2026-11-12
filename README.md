# Pedido Certo

**Pedido Certo** é um sistema de pedidos escrito em TypeScript. O nome resume a ideia do projeto: usar o sistema de tipos para que um pedido **não saia errado**. Se o status estiver escrito errado, se faltar um campo ou se o dado de fora vier estranho, o erro aparece enquanto o código é escrito, e não na mão do cliente.

Projeto da disciplina **TypeScript para Desenvolvimento Front-end** do MBA em Engenharia Front-end e Desenvolvimento Mobile com IA (Instituto Infnet).

> **Em construção.** Entrega prevista: 16/11/2026.

## O que é

Um **módulo de regras de negócio** para os pedidos de uma loja. O foco é **modelar os dados e as regras com o sistema de tipos** do TypeScript. Não tem interface visual: o resultado aparece no console.

O módulo cobre cinco regras:

1. **Criar um pedido** com cliente, itens, região de entrega e cupom opcional. Todo pedido nasce `pendente`.
2. **Calcular o total**: itens + frete da região − desconto. O total **nunca fica negativo**.
3. **Mudar o status**: `pendente` → `pago` → `enviado` → `entregue`. Só é possível **cancelar antes de `enviado`**.
4. **Receber pedidos de fora** (uma API simulada): os dados chegam como `unknown` e só são usados depois de conferidos.
5. **Guardar e buscar pedidos** num repositório genérico.

## Como rodar

> Será preenchido na Etapa 6 (configuração do ambiente).

## A evolução: um commit por etapa

O projeto começa em JavaScript e é migrado para TypeScript aos poucos. O histórico de commits mostra o antes e o depois de cada etapa.

| Etapa | O que muda | Status |
|---|---|---|
| v0 | Versão em JavaScript (`legado/pedidos.js`), com 5 bugs típicos plantados de propósito | Feito |
| 1 | Primeiros tipos: primitivos, uniões, literais, interfaces e funções tipadas | A fazer |
| 2 | Contratos e classes: união discriminada, interseção, tuplas, spread/rest, `private` e `static` | A fazer |
| 3 | Dados de fora com segurança: `unknown`, `keyof`, `typeof`, `as const` | A fazer |
| 4 | Abstrações: generics, mapped types e exaustividade com `never` | A fazer |
| 5 | Ambiente: `tsconfig`, source maps, `@types` e `enum` | A fazer |
| 6 | Documentação: este README e o registro de IA | A fazer |

## Onde está cada critério de avaliação

> Será preenchido no fim do projeto, com uma linha por rubrica.

## Uso de IA

Todo uso de IA está registrado, com avaliação crítica, em [`REGISTRO-IA.md`](REGISTRO-IA.md).
