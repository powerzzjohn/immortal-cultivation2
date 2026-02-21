import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

// 获取对话历史
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId!;
    const limit = parseInt(req.query.limit as string) || 50;
    
    const messages = await prisma.chatMessage.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      take: limit,
    });
    
    res.json({ messages });
  } catch (error) {
    console.error('获取对话历史失败:', error);
    res.status(500).json({ error: '获取失败' });
  }
});

// 发送消息（简化版，实际应集成Kimi API）
router.post('/send', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId!;
    const { message } = req.body;
    
    // 保存用户消息
    await prisma.chatMessage.create({
      data: {
        userId,
        role: 'user',
        content: message,
      },
    });
    
    // TODO: 集成Kimi API生成回复
    // 这里先返回一个模拟回复
    const npcResponse = `道友所言甚是。修炼之道，贵在坚持。今日天气如何？可曾感受到丹田之气流转？`;
    
    // 保存NPC回复
    const npcMessage = await prisma.chatMessage.create({
      data: {
        userId,
        role: 'npc',
        content: npcResponse,
      },
    });
    
    res.json({ message: npcMessage });
  } catch (error) {
    console.error('发送消息失败:', error);
    res.status(500).json({ error: '发送失败' });
  }
});

export default router;
