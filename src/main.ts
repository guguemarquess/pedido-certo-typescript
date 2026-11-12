import { cancelar, criarPedido, enviar, pagar, resumo } from "./regras";
import { buscarPorId, salvar } from "./repositorio";
import type { Cliente } from "./tipos";
import { lerPedidoDaApi } from "./validacao";

const ana: Cliente = { id: 1, nome: "Ana", email: "ana@email.com" };
const pedido1 = criarPedido(1, ana, [{ produto: "Camiseta", precoUnitario: 49.9, quantidade: 2 }], "sul", {
  codigo: "BEMVINDO10",
  percentual: 10,
});
salvar(pedido1);

console.log("1)", resumo(pedido1));
console.log("2)", pagar(pedido1));
console.log("3)", enviar(pedido1));
console.log("4)", resumo(pedido1));
console.log("5)", cancelar(pedido1));
// buscarPorId pode não achar nada (Pedido | undefined): o TypeScript obriga a tratar.
const encontrado = buscarPorId(1);
console.log("6)", encontrado ? resumo(encontrado) : "Pedido 1 não encontrado");

const pedido2 = lerPedidoDaApi(
  '{"id":2,"cliente":{"id":2,"nome":"Bia","email":"bia@email.com"},"itens":[{"produto":"Caneca","precoUnitario":30,"quantidade":1}],"regiao":"sudeste","frete":"12.5","status":"pendente"}',
);
salvar(pedido2);
console.log("7)", resumo(pedido2)); // BUG D ainda passa: o any esconde. Corrigido na etapa 3.

const pedido3 = criarPedido(3, null, [{ produto: "Boné", precoUnitario: 39.9, quantidade: 1 }], "norte");
salvar(pedido3);
console.log("8)", resumo(pedido3));
