import type { Pedido } from "./tipos";

// O contrato: qualquer forma de guardar pedidos (memória, banco, API) precisa
// oferecer estas três operações. Quem usa depende do contrato, não da classe.
export interface ArmazenamentoDePedidos {
  salvar(pedido: Pedido): void;
  buscarPorId(id: number): Pedido | undefined;
  listar(): readonly Pedido[];
}

// "implements": a classe promete cumprir o contrato. Se faltar um método, o TS reclama.
export class RepositorioDePedidos implements ArmazenamentoDePedidos {
  // private: ninguém de fora mexe na coleção diretamente, só pelos métodos.
  // Map guarda por id: salvar de novo o mesmo id substitui a versão antiga.
  // Decisão: não usei "protected" porque nenhuma classe herda desta.
  private readonly pedidos = new Map<number, Pedido>();

  salvar(pedido: Pedido): void {
    this.pedidos.set(pedido.id, pedido);
  }

  buscarPorId(id: number): Pedido | undefined {
    return this.pedidos.get(id);
  }

  listar(): readonly Pedido[] {
    return [...this.pedidos.values()];
  }
}
