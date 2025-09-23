import { Request, Response } from "express";
import { db } from "../database/banco-mongo.js";
class UsuarioController {
    async adicionar(req: Request, res: Response) {
        const estudante = req.body
        const resultado = await db.collection('estudantes')
            .insertOne(estudante)
        res.status(201).json({ ...estudante, _id: resultado.insertedId })
    }
    async listar(req: Request, res: Response) {
        const estudantes = await db.collection('estudantes').find().toArray();
        res.status(200).json(estudantes);
    }
}
export default new UsuarioController();