import type { Regiao } from "./tipos";

// Classe só com membros static: a regra de frete pertence à loja, e não a um
// pedido específico. Por isso não se cria instância (new): usa-se Frete.calcular(...).
export class Frete {
  // Regra de negócio: frete grátis a partir deste subtotal, em reais.
  static readonly GRATIS_A_PARTIR_DE = 200;

  // private: a tabela só é lida aqui dentro. Quem está fora usa Frete.calcular.
  private static readonly TABELA: Record<Regiao, number> = {
    sul: 7.85,
    sudeste: 7.85,
    centroOeste: 12.5,
    norte: 20.83,
    nordeste: 15.98,
  };

  static calcular(regiao: Regiao, subtotal: number): number {
    return subtotal >= Frete.GRATIS_A_PARTIR_DE ? 0 : Frete.TABELA[regiao];
  }
}
