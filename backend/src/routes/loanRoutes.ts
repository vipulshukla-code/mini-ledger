import { Router } from 'express';
import { addLoan, getLoans, markAsRepaid, getSummary } from '../controller/loanController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.post('/', addLoan);
router.get('/', getLoans);
router.patch('/:id/repay', markAsRepaid);
router.get('/summary', getSummary);

export default router;