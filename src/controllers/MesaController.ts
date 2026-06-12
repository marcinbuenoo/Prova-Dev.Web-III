import { Request, Response } from 'express';
import Mesa from '../models/Mesa';

export class MesaController {
  // Criar uma nova mesa
  async create(req: Request, res: Response): Promise<void> {
    try {
      const { numero, capacidade, localizacao } = req.body;

      const mesaExiste = await Mesa.findOne({ numero });
      if (mesaExiste) {
        res.status(400).json({ error: 'Mesa já cadastrada com este número.' });
        return;
      }

      const mesa = new Mesa({ numero, capacidade, localizacao });
      await mesa.save();

      res.status(201).json({ message: 'Mesa criada com sucesso!', mesa });
    } catch (error) {
      console.error('Erro ao criar mesa:', error);
      res.status(500).json({ error: 'Erro interno ao criar a mesa.' });
    }
  }

  // Listar todas as mesas
  async list(req: Request, res: Response): Promise<void> {
    try {
      const mesas = await Mesa.find().sort({ numero: 1 });
      res.status(200).json(mesas);
    } catch (error) {
      console.error('Erro ao listar mesas:', error);
      res.status(500).json({ error: 'Erro interno ao listar mesas.' });
    }
  }
}

export default new MesaController();
