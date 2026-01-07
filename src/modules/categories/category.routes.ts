import { Router } from 'express';
import {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
} from './category.controller';
import { authenticate, requireRole } from '../../middleware/auth';

const router = Router();

// Public routes
router.get('/', getCategories);
router.get('/:id', getCategory);

// Protected routes (admin/staff only)
router.post('/', authenticate, requireRole('admin', 'staff'), createCategory);
router.put('/:id', authenticate, requireRole('admin', 'staff'), updateCategory);
router.delete('/:id', authenticate, requireRole('admin', 'staff'), deleteCategory);

export default router;

