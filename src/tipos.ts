// Os moldes do domínio: o formato de cada informação de um pedido.

import type { Regiao } from "./frete";

// A região vem da tabela de frete (keyof typeof). É reexportada aqui para
// quem quiser todos os tipos do domínio num lugar só.
export type { Regiao };

// Decisão: união de literais + "as const" no lugar de enum. O enum gera código
// JavaScript extra e não funciona quando o Node roda TypeScript direto (sem
// compilar); a união some na compilação e já dá a mesma proteção.
// "as const": a lista vira uma lista fixa de textos exatos. Dela saem o tipo
// StatusPedido (usado pelo TypeScript) e a lista usada na validação (em execução).
// Uma fonte de verdade só: as duas nunca ficam diferentes.
export const STATUS_PEDIDO = ["pendente", "pago", "enviado", "entregue", "cancelado"] as const;

// União de literais: "pendente" | "pago" | "enviado" | "entregue" | "cancelado".
export type StatusPedido = (typeof STATUS_PEDIDO)[number];

// Mapped type genérico: um objeto com UMA chave para CADA status, todas com o
// mesmo tipo de valor. Ex.: PorStatus<number> = { pendente: number; pago: number; ... }.
// Se um status novo entrar em STATUS_PEDIDO, todo objeto PorStatus passa a exigir essa chave.
export type PorStatus<Valor> = { [Status in StatusPedido]: Valor };

export interface Cliente {
  readonly id: number;
  nome: string;
  email: string;
}

export interface ItemPedido {
  produto: string;
  precoUnitario: number;
  quantidade: number;
}

// Interseção (&): um item detalhado é um ItemPedido E também tem o subtotal calculado.
export type ItemDetalhado = ItemPedido & { subtotal: number };

// União discriminada: o campo "tipo" diz qual dos formatos o cupom tem.
// Cupom percentual tem "percentual"; cupom de valor fixo tem "valor".
export type Cupom =
  | { tipo: "percentual"; codigo: string; percentual: number }
  | { tipo: "valorFixo"; codigo: string; valor: number };

// Mesma ideia para o pagamento: cada forma tem os seus próprios campos.
export type Pagamento =
  | { tipo: "pix"; chave: string }
  | { tipo: "cartao"; final: string; parcelas: number }
  | { tipo: "boleto"; vencimento: string };

// Tipo de função: toda regra de desconto recebe o subtotal e devolve o valor do desconto.
export type RegraDeDesconto = (subtotal: number) => number;

// Todos os campos são readonly: um pedido nunca é alterado no lugar.
// Cada mudança gera um pedido novo (com spread), e o anterior continua intacto.
export interface Pedido {
  readonly id: number;
  // Decisão: um pedido pode ser de visitante, sem cadastro. O "| null" obriga
  // todo código que lê o cliente a tratar esse caso (era o bug E do JavaScript).
  readonly cliente: Cliente | null;
  readonly itens: readonly ItemPedido[];
  readonly regiao: Regiao;
  // Decisão: o frete é cotado quando o pedido é criado e fica gravado, como no checkout.
  readonly frete: number;
  readonly cupom?: Cupom; // opcional: nem todo pedido tem cupom
  readonly pagamento?: Pagamento; // só existe depois de pago
  readonly status: StatusPedido;
}
