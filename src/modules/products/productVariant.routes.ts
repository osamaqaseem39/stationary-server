import { Router } from 'express';
import {
  getVariants,
  createVariant,
  updateVariant
} from './productVariant.controller';
import { authenticate, requireRole } from '../../middleware/auth';

const router = Router();

// Public routes
router.get('/', getVariants);

// Protected routes (admin/staff only)
router.post('/', authenticate, requireRole('admin', 'staff'), createVariant);
router.put('/:id', authenticate, requireRole('admin', 'staff'), updateVariant);

export default router;

