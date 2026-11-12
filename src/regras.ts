import { Frete } from "./frete";
import type {
  Cliente,
  Cupom,
  ItemDetalhado,
  ItemPedido,
  Pagamento,
  Pedido,
  Regiao,
  RegraDeDesconto,
  StatusPedido,
} from "./tipos";

function somarItens(itens: readonly ItemPedido[]): number {
  return itens.reduce((soma, item) => soma + item.precoUnitario * item.quantidade, 0);
}

// Regra 1: todo pedido nasce "pendente", com o frete já cotado.
// Parâmetros sempre anotados: sem anotação, eles virariam "any".
export function criarPedido(
  id: number,
  cliente: Cliente | null,
  itens: readonly ItemPedido[],
  regiao: Regiao,
  cupom?: Cupom,
): Pedido {
  return { id, cliente, itens, regiao, frete: Frete.calcular(regiao, somarItens(itens)), cupom, status: "pendente" };
}

// Rest (...novosItens): recebe quantos itens vierem, já reunidos numa lista.
// Spread ([...a, ...b] e {...pedido}): monta uma lista e um pedido novos, sem alterar os originais.
// O frete é cotado de novo, porque o subtotal mudou (pode virar frete grátis).
export function adicionarItens(pedido: Pedido, ...novosItens: ItemPedido[]): Pedido {
  if (pedido.status !== "pendente") throw new Error("Só é possível adicionar itens a um pedido pendente");
  const itens = [...pedido.itens, ...novosItens];
  return { ...pedido, itens, frete: Frete.calcular(pedido.regiao, somarItens(itens)) };
}

// Regra 2: total = itens - desconto + frete, e nunca fica negativo.
// Cada formato de cupom vira uma RegraDeDesconto (uma função). Quem calcula o
// total não precisa saber que tipo de cupom é: só chama a regra.
export function regraDoCupom(cupom: Cupom | undefined): RegraDeDesconto {
  if (!cupom) return () => 0;
  switch (cupom.tipo) {
    case "percentual":
      return (subtotal) => subtotal * (cupom.percentual / 100);
    case "valorFixo":
      // O desconto nunca passa do subtotal: um cupom de R$ 50 num pedido de R$ 30 desconta R$ 30.
      return (subtotal) => Math.min(cupom.valor, subtotal);
  }
}

// Tupla com rótulos: sempre 4 números, sempre nesta ordem.
export function detalharTotal(pedido: Pedido): [subtotal: number, desconto: number, frete: number, total: number] {
  const subtotal = somarItens(pedido.itens);
  const desconto = regraDoCupom(pedido.cupom)(subtotal);
  const total = Math.max(0, subtotal - desconto + pedido.frete);
  return [subtotal, desconto, pedido.frete, total];
}

export function calcularTotal(pedido: Pedido): number {
  return detalharTotal(pedido)[3]; // posição 3 da tupla = total
}

// Regra 3: pendente -> pago -> enviado -> entregue. Cancelar só antes de "enviado".
// As funções não alteram o pedido recebido: devolvem um pedido NOVO (spread),
// e lançam um erro quando a mudança de status não é permitida.
export function pagar(pedido: Pedido, pagamento: Pagamento): Pedido {
  if (pedido.status !== "pendente") throw new Error("Só é possível pagar um pedido pendente");
  return { ...pedido, pagamento, status: "pago" };
}

export function enviar(pedido: Pedido): Pedido {
  if (pedido.status !== "pago") throw new Error("Só é possível enviar um pedido pago");
  return { ...pedido, status: "enviado" };
}

export function entregar(pedido: Pedido): Pedido {
  if (pedido.status !== "enviado") throw new Error("Só é possível entregar um pedido enviado");
  return { ...pedido, status: "entregue" };
}

export function cancelar(pedido: Pedido): Pedido {
  if (pedido.status === "enviado" || pedido.status === "entregue") {
    throw new Error("Não é possível cancelar um pedido que já saiu para entrega");
  }
  return { ...pedido, status: "cancelado" };
}

// Textos para o console

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
    case "cancelado":
      return "cancelado";
  }
}

export function descreverPagamento(pagamento: Pagamento | undefined): string {
  if (!pagamento) return "ainda não pago";
  switch (pagamento.tipo) {
    case "pix":
      return `Pix (${pagamento.chave})`;
    case "cartao":
      return `cartão final ${pagamento.final} em ${pagamento.parcelas}x`;
    case "boleto":
      return `boleto com vencimento em ${pagamento.vencimento}`;
  }
}

export function emReais(valor: number): string {
  return "R$ " + Math.round(valor * 100) / 100;
}

export function detalharItens(pedido: Pedido): ItemDetalhado[] {
  return pedido.itens.map((item) => ({ ...item, subtotal: item.precoUnitario * item.quantidade }));
}

export function listarItens(pedido: Pedido): string {
  return detalharItens(pedido)
    .map((item) => `${item.produto} x${item.quantidade} (${emReais(item.subtotal)})`)
    .join(", ");
}

export function resumo(pedido: Pedido): string {
  // O cliente pode ser null. O ternário estreita o tipo (narrowing): no "sim",
  // o TypeScript sabe que o cliente existe.
  const nomeDoCliente = pedido.cliente ? pedido.cliente.nome : "visitante";
  // Desestruturação da tupla: cada posição ganha um nome.
  const [subtotal, desconto, frete, total] = detalharTotal(pedido);
  return [
    `#${pedido.id} · ${nomeDoCliente} · ${rotuloStatus(pedido.status)}`,
    `   itens: ${listarItens(pedido)}`,
    `   subtotal ${emReais(subtotal)} - desconto ${emReais(desconto)} + frete ${emReais(frete)} = total ${emReais(total)}`,
    `   pagamento: ${descreverPagamento(pedido.pagamento)}`,
  ].join("\n");
}
