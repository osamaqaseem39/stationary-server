import { Router } from 'express';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct
} from './product.controller';
import { authenticate, requireRole } from '../../middleware/auth';

const router = Router();

// Public routes
router.get('/', getProducts);
router.get('/:id', getProduct);

// Protected routes (admin/staff only)
router.post('/', authenticate, requireRole('admin', 'staff'), createProduct);
router.put('/:id', authenticate, requireRole('admin', 'staff'), updateProduct);
router.delete('/:id', authenticate, requireRole('admin', 'staff'), deleteProduct);

export default router;

