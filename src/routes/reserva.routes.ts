import { Router } from 'express';
import ReservaController from '../controllers/ReservaController';

const router = Router();

router.post('/', ReservaController.create.bind(ReservaController));
router.get('/', ReservaController.list.bind(ReservaController));
router.put('/:id', ReservaController.update.bind(ReservaController));
router.delete('/:id', ReservaController.delete.bind(ReservaController));
router.post('/sync', ReservaController.syncStatus.bind(ReservaController));

export default router;
