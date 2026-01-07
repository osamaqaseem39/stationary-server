import { Router } from 'express';
import {
  getVariants,
  getVariant,
  createVariant,
  updateVariant,
  deleteVariant
} from './productVariant.controller';
import { authenticate, requireRole } from '../../middleware/auth';

const router = Router();

// Public routes
router.get('/', getVariants);
router.get('/:id', getVariant);

// Protected routes (admin/staff only)
router.post('/', authenticate, requireRole('admin', 'staff'), createVariant);
router.put('/:id', authenticate, requireRole('admin', 'staff'), updateVariant);
router.delete('/:id', authenticate, requireRole('admin', 'staff'), deleteVariant);

export default router;

