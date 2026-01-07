import { Router } from 'express';
import {
  createOrder,
  getOrders,
  getOrder,
  updateOrderStatus
} from './order.controller';
import { authenticate, requireRole } from '../../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.post('/', createOrder);
router.get('/', getOrders);
router.get('/:id', getOrder);
router.put('/:id/status', requireRole('admin', 'staff'), updateOrderStatus);

export default router;

