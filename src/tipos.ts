// Os moldes do domínio: o formato de cada informação de um pedido.

// União de literais: o status só pode ser um destes textos, como as opções de um dropdown.
export type StatusPedido = "pendente" | "pago" | "enviado" | "entregue" | "cancelado";

export type Regiao = "sul" | "sudeste" | "centroOeste" | "norte" | "nordeste";

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
