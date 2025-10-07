import { Request, Response } from "express";
import { ObjectId } from "bson";
import { db } from "../database/banco-mongo.js";

interface ItemCarrinho {
    produtoId: string;
    quantidade: number;
    precoUnitario: number;
    nome: string;
}

interface Carrinho {
    usuarioId: string;
    itens: ItemCarrinho[];
    dataAtualizacao: Date;
    total: number;
}

interface Produto {
    _id: ObjectId;
    nome: string;
    preco: number;
    descricao: string;
    urlfoto: string;
}

class CarrinhoController {
    async adicionarItem(req: Request, res: Response) {
        try {
            const { usuarioId, produtoId, quantidade } = req.body as {
                usuarioId: string;
                produtoId: string;
                quantidade: number;
            };
            console.log(usuarioId, produtoId, quantidade);

            if (!usuarioId || !produtoId || quantidade <= 0)
                return res.status(400).json({ mensagem: "Dados inválidos" });
            const produto = await db
                .collection<Produto>("produtos")
                .findOne({ _id: ObjectId.createFromHexString(produtoId) });
            if (!produto)
                return res.status(404).json({ mensagem: "Produto não encontrado" });

            const nomeProduto = produto.nome;
            const precoProduto = produto.preco;
            const carrinho = await db
                .collection<Carrinho>("carrinhos")
                .findOne({ usuarioId });

            if (!carrinho) {
                const novoCarrinho: Carrinho = {
                    usuarioId,
                    itens: [
                        {
                            produtoId,
                            quantidade,
                            precoUnitario: precoProduto,
                            nome: nomeProduto,
                        },
                    ],
                    dataAtualizacao: new Date(),
                    total: precoProduto * quantidade,
                };
                const resposta = await db
                    .collection<Carrinho>("carrinhos")
                    .insertOne(novoCarrinho);

                return res.status(201).json({
                    ...novoCarrinho,
                    _id: resposta.insertedId,
                });
            }
            const itemExistente = carrinho.itens.find(
                (item) => item.produtoId === produtoId
            );

            if (itemExistente) {
                itemExistente.quantidade += quantidade;
            } else {
                carrinho.itens.push({
                    produtoId,
                    quantidade,
                    precoUnitario: precoProduto,
                    nome: nomeProduto,
                });
            }

            carrinho.total += precoProduto * quantidade;
            carrinho.dataAtualizacao = new Date();

            await db.collection<Carrinho>("carrinhos").updateOne(
                { usuarioId },
                {
                    $set: {
                        itens: carrinho.itens,
                        total: carrinho.total,
                        dataAtualizacao: carrinho.dataAtualizacao,
                    },
                }
            );

            res.status(200).json(carrinho);
        } catch (error) {
            console.error(error);
            res.status(500).json({ mensagem: "Erro ao adicionar item" });
        }
    }
    async removerItem(req: Request, res: Response) {
        try {
            const { usuarioId, produtoId } = req.params;

            const carrinho = await db
                .collection<Carrinho>("carrinhos")
                .findOne({ usuarioId });
            if (!carrinho)
                return res.status(404).json({ mensagem: "Carrinho não encontrado" });

            const item = carrinho.itens.find(
                (i) => i.produtoId === produtoId
            );
            if (!item)
                return res
                    .status(404)
                    .json({ mensagem: "Produto não encontrado no carrinho" });
            carrinho.itens = carrinho.itens.filter(
                (i) => i.produtoId !== produtoId
            );
            carrinho.total = carrinho.itens.reduce(
                (acc, i) => acc + i.precoUnitario * i.quantidade,
                0
            );
            carrinho.dataAtualizacao = new Date();

            await db.collection<Carrinho>("carrinhos").updateOne(
                { usuarioId },
                { $set: carrinho }
            );

            res.status(200).json({ mensagem: "Item removido com sucesso", carrinho });
        } catch (error) {
            console.error(error);
            res.status(500).json({ mensagem: "Erro ao remover item" });
        }
    }
    async atualizarQuantidade(req: Request, res: Response) {
        try {
            const { usuarioId, produtoId, novaQuantidade } = req.body as {
                usuarioId: string;
                produtoId: string;
                novaQuantidade: number;
            };

            if (!usuarioId || !produtoId || novaQuantidade < 0)
                return res.status(400).json({ mensagem: "Dados inválidos" });

            const carrinho = await db
                .collection<Carrinho>("carrinhos")
                .findOne({ usuarioId });
            if (!carrinho)
                return res.status(404).json({ mensagem: "Carrinho não encontrado" });

            const item = carrinho.itens.find(
                (i) => i.produtoId === produtoId
            );
            if (!item)
                return res
                    .status(404)
                    .json({ mensagem: "Produto não encontrado no carrinho" });

            if (novaQuantidade === 0) {
                carrinho.itens = carrinho.itens.filter(
                    (i) => i.produtoId !== produtoId
                );
            } else {
                item.quantidade = novaQuantidade;
            }

            carrinho.total = carrinho.itens.reduce(
                (acc, i) => acc + i.precoUnitario * i.quantidade,
                0
            );
            carrinho.dataAtualizacao = new Date();

            await db.collection<Carrinho>("carrinhos").updateOne(
                { usuarioId },
                { $set: carrinho }
            );

            res.status(200).json(carrinho);
        } catch (error) {
            console.error(error);
            res.status(500).json({ mensagem: "Erro ao atualizar quantidade" });
        }
    }

    async listar(req: Request, res: Response) {
        try {
            const { usuarioId } = req.params;

            if (!usuarioId)
                return res.status(400).json({ mensagem: "Usuário inválido" });

            const carrinho = await db
                .collection<Carrinho>("carrinhos")
                .findOne({ usuarioId });

            if (!carrinho)
                return res
                    .status(404)
                    .json({ mensagem: "Carrinho não encontrado" });

            res.status(200).json(carrinho);
        } catch (error) {
            console.error(error);
            res.status(500).json({ mensagem: "Erro ao listar carrinho" });
        }
    }
    async remover(req: Request, res: Response) {
        try {
            const { usuarioId } = req.params;

            if (!usuarioId)
                return res.status(400).json({ mensagem: "Usuário inválido" });

            const resultado = await db
                .collection<Carrinho>("carrinhos")
                .deleteOne({ usuarioId });

            if (resultado.deletedCount === 0)
                return res
                    .status(404)
                    .json({ mensagem: "Carrinho não encontrado" });

            res.status(200).json({ mensagem: "Carrinho removido com sucesso" });
        } catch (error) {
            console.error(error);
            res.status(500).json({ mensagem: "Erro ao remover carrinho" });
        }
    }
}

export default new CarrinhoController();
