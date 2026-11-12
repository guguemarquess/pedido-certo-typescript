import type { Pedido } from "./tipos";

const pedidosSalvos: Pedido[] = [];

export function salvar(pedido: Pedido): void {
  pedidosSalvos.push(pedido);
}

// O retorno avisa que a busca pode não achar nada: Pedido | undefined.
export function buscarPorId(id: number): Pedido | undefined {
  return pedidosSalvos.find((pedido) => pedido.id === id);
}
