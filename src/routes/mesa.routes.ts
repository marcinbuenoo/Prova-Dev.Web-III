import { Router } from 'express';
import MesaController from '../controllers/MesaController';

const router = Router();

router.post('/', MesaController.create.bind(MesaController));
router.get('/', MesaController.list.bind(MesaController));

export default router;
