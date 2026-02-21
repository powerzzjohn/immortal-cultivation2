import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { generateDaoName } from '../services/baziService.js';

const router = Router();
const prisma = new PrismaClient();

// 注册
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // 检查用户是否存在
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: '用户已存在' });
    }
    
    // 生成道号
    let daoName = generateDaoName();
    while (await prisma.user.findUnique({ where: { daoName } })) {
      daoName = generateDaoName();
    }
    
    // 加密密码
    const passwordHash = await bcrypt.hash(password, 10);
    
    // 创建用户
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        daoName,
        lastLoginAt: new Date(),
      },
    });
    
    // 创建修炼记录
    await prisma.cultivation.create({
      data: {
        userId: user.id,
        realmName: '炼气',
      },
    });
    
    // 创建资源记录
    await prisma.resources.create({
      data: {
        userId: user.id,
        spiritStones: 100, // 初始灵石
      },
    });
    
    // 生成JWT
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );
    
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        daoName: user.daoName,
      },
    });
  } catch (error) {
    console.error('注册失败:', error);
    res.status(500).json({ error: '注册失败' });
  }
});

// 登录
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: '用户不存在' });
    }
    
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(400).json({ error: '密码错误' });
    }
    
    // 更新登录时间
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });
    
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );
    
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        daoName: user.daoName,
      },
    });
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({ error: '登录失败' });
  }
});

export default router;
