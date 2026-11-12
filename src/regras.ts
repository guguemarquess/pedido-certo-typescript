import type { Cliente, Cupom, ItemPedido, Pedido, Regiao, StatusPedido } from "./tipos";

// Frete por região, em reais. Record<Regiao, number> obriga a tabela a ter
// todas as regiões: se uma faltar, o TypeScript reclama.
const FRETE_POR_REGIAO: Record<Regiao, number> = {
  sul: 7.85,
  sudeste: 7.85,
  centroOeste: 12.5,
  norte: 20.83,
  nordeste: 15.98,
};

// Regra 1: todo pedido nasce "pendente".
// Parâmetros sempre anotados: sem anotação, eles virariam "any".
export function criarPedido(
  id: number,
  cliente: Cliente | null,
  itens: ItemPedido[],
  regiao: Regiao,
  cupom?: Cupom,
): Pedido {
  return { id, cliente, itens, regiao, frete: FRETE_POR_REGIAO[regiao], cupom, status: "pendente" };
}

// Regra 2: total = itens - desconto + frete, e nunca fica negativo.
// O retorno é anotado porque é o contrato da função. As variáveis de dentro
// ficam por inferência: o TypeScript já sabe que são números.
export function calcularTotal(pedido: Pedido): number {
  let subtotal = 0;
  for (const item of pedido.itens) {
    subtotal += item.precoUnitario * item.quantidade;
  }
  const desconto = pedido.cupom ? subtotal * (pedido.cupom.percentual / 100) : 0;
  const total = subtotal - desconto + pedido.frete;
  return total < 0 ? 0 : total;
}

// Regra 3: pendente -> pago -> enviado -> entregue. Cancelar só antes de "enviado".
export function pagar(pedido: Pedido): string {
  if (pedido.status !== "pendente") return "Só é possível pagar um pedido pendente";
  pedido.status = "pago"; // era o BUG A: "Pago", com maiúscula, não existe em StatusPedido
  return "Pagamento registrado";
}

export function enviar(pedido: Pedido): string {
  if (pedido.status !== "pago") return "Só é possível enviar um pedido pago";
  pedido.status = "enviado";
  return "Pedido enviado";
}

export function entregar(pedido: Pedido): string {
  if (pedido.status !== "enviado") return "Só é possível entregar um pedido enviado";
  pedido.status = "entregue";
  return "Pedido entregue";
}

export function cancelar(pedido: Pedido): string {
  if (pedido.status === "enviado" || pedido.status === "entregue") {
    return "Não é possível cancelar um pedido que já saiu para entrega";
  }
  pedido.status = "cancelado";
  return "Pedido cancelado";
}

export function rotuloStatus(status: StatusPedido): string {
  switch (status) {
    case "pendente":
      return "aguardando pagamento";
    case "pago":
      return "pago";
    case "enviado":
      return "a caminho";
    case "entregue":
      return "entregue";
    case "cancelado": // era o BUG C: sem este caso, a função podia devolver undefined
      return "cancelado";
  }
}

export function emReais(valor: number): string {
  return "R$ " + Math.round(valor * 100) / 100;
}

export function listarItens(pedido: Pedido): string {
  // era o BUG B: o campo se chama "produto", e não "nome"
  return pedido.itens.map((item) => `${item.produto} x${item.quantidade}`).join(", ");
}

export function resumo(pedido: Pedido): string {
  // era o BUG E: o cliente pode ser null. O "if" do ternário estreita o tipo
  // (narrowing): dentro do "sim", o TypeScript sabe que o cliente existe.
  const nomeDoCliente = pedido.cliente ? pedido.cliente.nome : "visitante";
  return `#${pedido.id} · ${nomeDoCliente} · ${listarItens(pedido)} · total ${emReais(calcularTotal(pedido))} · ${rotuloStatus(pedido.status)}`;
}
