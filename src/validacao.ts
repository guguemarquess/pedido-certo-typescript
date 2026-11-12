import type { Pedido } from "./tipos";

// Ainda confia cegamente no que chega. O JSON.parse devolve "any", e o any
// desliga a checagem: por isso o BUG D continua passando nesta etapa.
// A correção vem na etapa 3.
export function lerPedidoDaApi(json: string): Pedido {
  return JSON.parse(json);
}
