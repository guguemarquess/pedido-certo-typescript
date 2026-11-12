// Demonstração dos source maps.
// Provoca um erro de propósito e imprime a pilha de chamadas (stack trace), a
// lista de "onde" o erro aconteceu. Rode as duas versões e compare:
//   npm run demo:sem-source-map  -> a pilha aponta para dist/demo-source-map.js
//   npm run demo:com-source-map  -> a pilha aponta para src/demo-source-map.ts

import { criarPedido } from "./regras";
import type { Pedido } from "./tipos";

function conferirLote(pedidos: readonly Pedido[]): void {
  if (pedidos.length < 2) {
    throw new Error("Lote incompleto: esperava pelo menos 2 pedidos");
  }
}

try {
  conferirLote([criarPedido(1, null, [{ produto: "Caneca", precoUnitario: 35, quantidade: 1 }], "sul")]);
} catch (erro) {
  console.log(erro instanceof Error ? erro.stack : erro);
}
