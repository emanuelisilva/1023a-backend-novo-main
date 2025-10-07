import usuarioController from "./usuarios/usuario.controller.js";
import produtoController from "./produtos/produto.controller.js";

import { Router } from "express";
import carrinhoController from "./carrinho/carrinho.controller.js";

const rotas = Router();

//Criando rotas para os usuários
rotas.post("/usuarios", usuarioController.adicionar);
rotas.get("/usuarios", usuarioController.listar);


//rotas para produtos
rotas.post("/produtos", produtoController.adicionar);
rotas.get("/produtos", produtoController.listar);


//Ainda vamos ter que criar as rotas para carrinho e produtos
rotas.post("/adicionarItem", carrinhoController.adicionarItem);
//Tarefa para casa :)

export default rotas;