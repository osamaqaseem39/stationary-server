import { Router } from 'express';
import { register, login, refresh, getProfile } from './auth.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.get('/profile', authenticate, getProfile);

export default router;

