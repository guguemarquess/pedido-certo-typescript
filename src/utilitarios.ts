// Ferramentas genéricas: não sabem nada de pedidos e serviriam para qualquer domínio.

// Generic: Resultado<T> é o "deu certo / deu errado" para QUALQUER tipo de valor.
// Resultado<Pedido>, Resultado<Cliente>... um molde só, sem duplicar código.
// (Na etapa 3, a validação tinha um tipo só dela, RespostaDaValidacao.)
export type Sucesso<T> = { ok: true; valor: T };
export type Falha = { ok: false; erros: string[] };
export type Resultado<T> = Sucesso<T> | Falha;

// O T é descoberto na chamada: sucesso(pedido) devolve Sucesso<Pedido>.
export function sucesso<T>(valor: T): Sucesso<T> {
  return { ok: true, valor };
}

export function falha(...erros: string[]): Falha {
  return { ok: false, erros };
}

// Exaustividade: esta função só aceita um valor do tipo "never", ou seja, ela
// só compila quando TODOS os casos de uma união já foram tratados antes dela.
// Se alguém acrescentar um caso novo (um status, uma forma de pagamento) e
// esquecer de tratá-lo, o código para de compilar exatamente no switch esquecido.
// O throw só roda se um dado inválido escapar da validação em tempo de execução.
export function garantirExaustividade(valor: never): never {
  throw new Error(`Caso não tratado: ${JSON.stringify(valor)}`);
}
