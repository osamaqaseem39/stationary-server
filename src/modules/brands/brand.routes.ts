import { Router } from 'express';
import {
  getBrands,
  getBrand,
  createBrand,
  updateBrand,
  deleteBrand
} from './brand.controller';
import { authenticate, requireRole } from '../../middleware/auth';

const router = Router();

// Public routes
router.get('/', getBrands);
router.get('/:id', getBrand);

// Protected routes (admin/staff only)
router.post('/', authenticate, requireRole('admin', 'staff'), createBrand);
router.put('/:id', authenticate, requireRole('admin', 'staff'), updateBrand);
router.delete('/:id', authenticate, requireRole('admin', 'staff'), deleteBrand);

export default router;

