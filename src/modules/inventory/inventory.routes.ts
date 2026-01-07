import { Router } from 'express';
import { getInventory, updateInventory } from './inventory.controller';
import { authenticate, requireRole } from '../../middleware/auth';

const router = Router();

router.get('/', authenticate, getInventory);
router.put('/', authenticate, requireRole('admin', 'staff'), updateInventory);

export default router;

