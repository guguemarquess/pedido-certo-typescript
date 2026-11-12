import { adicionarItens, cancelar, contarPorStatus, criarPedido, enviar, pagar, resumo, rotuloStatus } from "./regras";
import { Repositorio } from "./repositorio";
import type { Cliente, Pedido } from "./tipos";
import type { Resultado } from "./utilitarios";
import { lerPedidoDaApi } from "./validacao";

// Roteiro de demonstração: roda as regras de negócio e mostra tudo no console.

// Só para o roteiro: se algo que deveria dar certo der errado, para tudo e mostra o motivo.
function exigir<T>(resultado: Resultado<T>): T {
  if (resultado.ok) return resultado.valor;
  throw new Error(resultado.erros.join("; "));
}

// A MESMA classe genérica guarda pedidos e clientes.
const pedidos = new Repositorio<Pedido>();
const clientes = new Repositorio<Cliente>();
// new Repositorio<string>() não compila: um texto não tem "id".

console.log("== 1. Pedido da Ana: cupom de 10%, pago com Pix e enviado ==");
const ana: Cliente = { id: 1, nome: "Ana", email: "ana@email.com" };
clientes.salvar(ana);
let pedidoDaAna = criarPedido(1, ana, [{ produto: "Camiseta", precoUnitario: 49.9, quantidade: 2 }], "sul", {
  tipo: "percentual",
  codigo: "BEMVINDO10",
  percentual: 10,
});
pedidoDaAna = exigir(pagar(pedidoDaAna, { tipo: "pix", chave: "ana@email.com" }));
pedidoDaAna = exigir(enviar(pedidoDaAna));
pedidos.salvar(pedidoDaAna);
console.log(resumo(pedidoDaAna));

console.log("\n== 2. Regra: não dá para cancelar depois do envio ==");
const tentativa = cancelar(pedidoDaAna);
// O tipo Resultado obriga a olhar o "ok" antes de usar o valor ou os erros.
console.log(tentativa.ok ? "Cancelado" : `Bloqueado: ${tentativa.erros.join("; ")}`);

console.log("\n== 3. Pedido do Caio: itens adicionados depois, e o frete fica grátis ==");
const caio: Cliente = { id: 3, nome: "Caio", email: "caio@email.com" };
clientes.salvar(caio);
let pedidoDoCaio = criarPedido(3, caio, [{ produto: "Tênis", precoUnitario: 159.9, quantidade: 1 }], "norte", {
  tipo: "valorFixo",
  codigo: "VOLTA20",
  valor: 20,
});
console.log(resumo(pedidoDoCaio));
pedidoDoCaio = exigir(
  adicionarItens(
    pedidoDoCaio,
    { produto: "Meia", precoUnitario: 19.9, quantidade: 2 },
    { produto: "Boné", precoUnitario: 39.9, quantidade: 1 },
  ),
);
pedidoDoCaio = exigir(pagar(pedidoDoCaio, { tipo: "cartao", final: "4242", parcelas: 3 }));
pedidos.salvar(pedidoDoCaio);
console.log(resumo(pedidoDoCaio));

console.log("\n== 4. Pedido de visitante, pago com boleto e depois cancelado ==");
let pedidoDeVisitante = criarPedido(4, null, [{ produto: "Caneca", precoUnitario: 35, quantidade: 1 }], "nordeste");
pedidoDeVisitante = exigir(pagar(pedidoDeVisitante, { tipo: "boleto", vencimento: "20/11/2026" }));
pedidoDeVisitante = exigir(cancelar(pedidoDeVisitante));
pedidos.salvar(pedidoDeVisitante);
console.log(resumo(pedidoDeVisitante));

console.log("\n== 5. Pedidos vindos da API: só entram depois de conferidos ==");

function importarDaApi(json: string): void {
  const resposta = lerPedidoDaApi(json);
  // União discriminada pelo campo "ok": no if, o TS sabe que existe "valor";
  // no else, sabe que existe "erros".
  if (resposta.ok) {
    pedidos.salvar(resposta.valor);
    console.log(resumo(resposta.valor));
  } else {
    console.log("Recusado:");
    for (const erro of resposta.erros) console.log(`   - ${erro}`);
  }
}

// O pedido do antigo BUG D: o frete chega como texto ("12.5") e agora é convertido.
importarDaApi(
  '{"id":2,"cliente":{"id":2,"nome":"Bia","email":"bia@email.com"},"itens":[{"produto":"Caneca","precoUnitario":30,"quantidade":1}],"regiao":"sudeste","frete":"12.5","status":"pendente"}',
);
// Um pedido com vários problemas: todos aparecem de uma vez.
importarDaApi(
  '{"id":5,"cliente":{"id":5,"nome":"Duda"},"itens":[{"produto":"Caneca","precoUnitario":30,"quantidade":"dois"}],"regiao":"centro-oeste","frete":12.5,"status":"Pago"}',
);

console.log("\n== 6. Painel: pedidos por status ==");
const contagem = contarPorStatus(pedidos.listar());
for (const [status, quantidade] of Object.entries(contagem)) {
  console.log(`   ${status}: ${quantidade}`);
}

console.log("\n== 7. Repositórios ==");
console.log(`Pedidos salvos: ${pedidos.quantidade} · Clientes salvos: ${clientes.quantidade}`);
// buscarPorId pode não achar nada (Pedido | undefined): o TypeScript obriga a tratar.
const encontrado = pedidos.buscarPorId(1);
console.log(encontrado ? `Pedido 1: ${rotuloStatus(encontrado.status)}` : "Pedido 1 não encontrado");
