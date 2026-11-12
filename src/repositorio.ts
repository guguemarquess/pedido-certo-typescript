// O contrato: qualquer forma de guardar itens (memória, banco, API) precisa
// oferecer estas operações. Quem usa depende do contrato, não da classe.
export interface Armazenamento<T> {
  salvar(item: T): void;
  buscarPorId(id: number): T | undefined;
  listar(): readonly T[];
}

// Classe genérica com restrição: T pode ser qualquer tipo, DESDE QUE tenha um id
// numérico. É a restrição ("extends { readonly id: number }") que permite usar
// item.id aqui dentro. Na etapa 2, a classe servia só para pedidos; agora a
// mesma classe guarda pedidos, clientes ou o que tiver id.
export class Repositorio<T extends { readonly id: number }> implements Armazenamento<T> {
  // private: ninguém de fora mexe na coleção diretamente, só pelos métodos.
  // Map guarda por id: salvar de novo o mesmo id substitui a versão antiga.
  // Decisão: não usei "protected" porque nenhuma classe herda desta.
  private readonly itens = new Map<number, T>();

  salvar(item: T): void {
    this.itens.set(item.id, item);
  }

  buscarPorId(id: number): T | undefined {
    return this.itens.get(id);
  }

  listar(): readonly T[] {
    return [...this.itens.values()];
  }

  // get: lido como propriedade (repositorio.quantidade), mas calculado na hora.
  get quantidade(): number {
    return this.itens.size;
  }
}
