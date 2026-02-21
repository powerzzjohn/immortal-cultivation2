import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import {
  calculateAndSaveBazi,
  getMyBazi,
  computeBaziOnly,
} from '../controllers/baziController.js';

const router = Router();

/**
 * @route   POST /api/v1/bazi/calculate
 * @desc    计算并保存八字
 * @access  Private
 * @body    { birthYear, birthMonth, birthDay, birthHour, birthMinute?, timezone? }
 */
router.post('/calculate', authMiddleware, calculateAndSaveBazi);

/**
 * @route   GET /api/v1/bazi/me
 * @desc    获取当前用户的八字信息
 * @access  Private
 */
router.get('/me', authMiddleware, getMyBazi);

/**
 * @route   POST /api/v1/bazi/compute
 * @desc    纯计算八字（不保存，不需要登录）
 * @access  Public
 * @body    { birthYear, birthMonth, birthDay, birthHour, birthMinute?, timezone? }
 */
router.post('/compute', computeBaziOnly);

export default router;
