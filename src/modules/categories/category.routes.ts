import { Router } from 'express';
import {
  getCategories,
  getCategory,
  createCategory,
  updateCategory
} from './category.controller';
import { authenticate, requireRole } from '../../middleware/auth';

const router = Router();

// Public routes
router.get('/', getCategories);
router.get('/:id', getCategory);

// Protected routes (admin/staff only)
router.post('/', authenticate, requireRole('admin', 'staff'), createCategory);
router.put('/:id', authenticate, requireRole('admin', 'staff'), updateCategory);

export default router;

