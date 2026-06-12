import { Request, Response } from 'express';
import Reserva from '../models/Reserva';
import Mesa from '../models/Mesa';

export class ReservaController {
  // Criar Reserva
  async create(req: Request, res: Response): Promise<void> {
    try {
      const { nomeCliente, contatoCliente, numeroMesa, quantidadePessoas, dataHora, observacoes } = req.body;

      // 1. Validar existência e capacidade da mesa
      const mesa = await Mesa.findOne({ numero: numeroMesa });
      if (!mesa) {
        res.status(404).json({ error: 'Mesa não encontrada.' });
        return;
      }
      if (quantidadePessoas > mesa.capacidade) {
        res.status(400).json({ error: `A mesa ${numeroMesa} comporta apenas ${mesa.capacidade} pessoas.` });
        return;
      }

      // 2. Validar antecedência mínima de 1 hora
      const dataReserva = new Date(dataHora);
      const agora = new Date();
      const difHoras = (dataReserva.getTime() - agora.getTime()) / (1000 * 60 * 60);
      
      if (difHoras < 1) {
        res.status(400).json({ error: 'Reservas devem ser feitas com antecedência mínima de 1 hora.' });
        return;
      }

      // 3. Validar choque de horário (Duração padrão 1h30 = 90 minutos)
      const dataFimEstimada = new Date(dataReserva.getTime() + 90 * 60000);
      const dataInicioEstimada = new Date(dataReserva.getTime() - 90 * 60000);

      const conflito = await Reserva.findOne({
        numeroMesa,
        status: { $in: ['reservado', 'ocupado'] },
        dataHora: {
          $gte: dataInicioEstimada,
          $lt: dataFimEstimada
        }
      });

      if (conflito) {
        res.status(400).json({ error: 'Já existe uma reserva para esta mesa neste horário.' });
        return;
      }

      const novaReserva = new Reserva({
        nomeCliente,
        contatoCliente,
        numeroMesa,
        quantidadePessoas,
        dataHora: dataReserva,
        observacoes,
        status: 'reservado'
      });

      await novaReserva.save();
      console.log(`[LOG] Reserva criada para ${nomeCliente} na mesa ${numeroMesa}`);

      res.status(201).json({ message: 'Reserva criada com sucesso!', reserva: novaReserva });
    } catch (error) {
      console.error('Erro ao criar reserva:', error);
      res.status(500).json({ error: 'Erro interno ao criar a reserva.' });
    }
  }

  // Ler/Listar Reservas
  async list(req: Request, res: Response): Promise<void> {
    try {
      const { cliente, mesa, status, data } = req.query;
      let filtro: any = {};

      if (cliente) filtro.nomeCliente = { $regex: cliente, $options: 'i' };
      if (mesa) filtro.numeroMesa = Number(mesa);
      if (status) filtro.status = status;
      if (data) {
        const dataBusca = new Date(data as string);
        const dataSeguinte = new Date(dataBusca);
        dataSeguinte.setDate(dataSeguinte.getDate() + 1);
        filtro.dataHora = { $gte: dataBusca, $lt: dataSeguinte };
      }

      const reservas = await Reserva.find(filtro).sort({ dataHora: 1 });
      res.status(200).json(reservas);
    } catch (error) {
      console.error('Erro ao listar reservas:', error);
      res.status(500).json({ error: 'Erro interno ao listar reservas.' });
    }
  }

  // Atualizar Reserva (Pode mudar status ou detalhes)
  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const atualizacoes = req.body;

      const reserva = await Reserva.findByIdAndUpdate(id, atualizacoes, { new: true });
      if (!reserva) {
        res.status(404).json({ error: 'Reserva não encontrada.' });
        return;
      }

      console.log(`[LOG] Reserva ${id} atualizada.`);
      res.status(200).json({ message: 'Reserva atualizada com sucesso!', reserva });
    } catch (error) {
      console.error('Erro ao atualizar reserva:', error);
      res.status(500).json({ error: 'Erro interno ao atualizar a reserva.' });
    }
  }

  // Excluir (Cancelar Reserva)
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const reserva = await Reserva.findByIdAndUpdate(id, { status: 'cancelado' }, { new: true });
      
      if (!reserva) {
        res.status(404).json({ error: 'Reserva não encontrada.' });
        return;
      }

      console.log(`[LOG] Reserva ${id} cancelada.`);
      res.status(200).json({ message: 'Reserva cancelada com sucesso!', reserva });
    } catch (error) {
      console.error('Erro ao cancelar reserva:', error);
      res.status(500).json({ error: 'Erro interno ao cancelar a reserva.' });
    }
  }

  // Atualizar status pelo tempo (Pode ser chamado periodicamente ou a cada listagem)
  async syncStatus(req: Request, res: Response): Promise<void> {
    try {
      const agora = new Date();
      
      // Passou do horário e não estava finalizado/cancelado, com tolerância de 1h30
      const tempoExpirado = new Date(agora.getTime() - 90 * 60000);
      
      // Atualiza para 'finalizado' se já passou 1h30 da reserva
      await Reserva.updateMany(
        { dataHora: { $lt: tempoExpirado }, status: { $in: ['reservado', 'ocupado'] } },
        { $set: { status: 'finalizado' } }
      );

      // Atualiza para 'ocupado' se for a hora atual (margem de 15 min antes e 1h30 depois)
      // Como simplificação: se passou da hora de início e ainda não acabou (90 min), está ocupado
      await Reserva.updateMany(
        { 
          dataHora: { $lte: agora, $gt: tempoExpirado }, 
          status: 'reservado' 
        },
        { $set: { status: 'ocupado' } }
      );

      res.status(200).json({ message: 'Sincronização de status realizada com sucesso!' });
    } catch (error) {
      console.error('Erro na sincronização:', error);
      res.status(500).json({ error: 'Erro ao sincronizar os status.' });
    }
  }
}

export default new ReservaController();
