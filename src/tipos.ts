// Os moldes do domínio: o formato de cada informação de um pedido.

// União de literais: o status só pode ser um destes textos, como as opções de um dropdown.
export type StatusPedido = "pendente" | "pago" | "enviado" | "entregue" | "cancelado";

export type Regiao = "sul" | "sudeste" | "centroOeste" | "norte" | "nordeste";

export interface Cliente {
  id: number;
  nome: string;
  email: string;
}

export interface ItemPedido {
  produto: string;
  precoUnitario: number;
  quantidade: number;
}

export interface Cupom {
  codigo: string;
  percentual: number;
}

export interface Pedido {
  id: number;
  // Decisão: um pedido pode ser de visitante, sem cadastro. O "| null" obriga
  // todo código que lê o cliente a tratar esse caso (era o bug E do JavaScript).
  cliente: Cliente | null;
  itens: ItemPedido[];
  regiao: Regiao;
  frete: number;
  cupom?: Cupom; // opcional: nem todo pedido tem cupom
  status: StatusPedido;
}
