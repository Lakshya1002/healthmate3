import express from 'express';
import { 
    register, 
    login, 
    getMe, 
    googleLogin,
    forgotPassword,
    resetPassword
} from '../controllers/authController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.get('/me', protect, getMe);

// ✅ ADD THESE TWO ROUTES
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;