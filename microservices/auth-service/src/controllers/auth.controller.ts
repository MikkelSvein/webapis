import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../index';
import { registerSchema, loginSchema, changePasswordSchema } from '../utils/validations';
import { generateCURVCode } from '../utils/curv';
import { AuthRequest } from '../middleware/auth.middleware';

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const data = registerSchema.parse(req.body);

      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser) {
        return res.status(400).json({ error: 'El email ya está registrado' });
      }

      const passwordHash = await bcrypt.hash(data.password, 12);
      let curvCode = generateCURVCode();

      let unique = false;
      while (!unique) {
        const existing = await prisma.user.findUnique({ where: { curv_code: curvCode } });
        if (!existing) unique = true;
        else curvCode = generateCURVCode();
      }

      const user = await prisma.user.create({
        data: {
          email: data.email,
          name: data.name,
          password_hash: passwordHash,
          curv_code: curvCode,
        },
      });

      if (data.referralCode) {
        const referrer = await prisma.user.findUnique({
          where: { curv_code: data.referralCode },
        });
        if (referrer && referrer.id !== user.id) {
          const commissionRate = referrer.role === 'PREMIUM' || referrer.role === 'ADMIN' ? 10.00 : 8.00;
          await prisma.referral.create({
            data: {
              referrer_id: referrer.id,
              referred_id: user.id,
              commission_rate: commissionRate,
            },
          });
        }
      }

      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
        expiresIn: '15m',
      });

      const refreshToken = jwt.sign({ userId: user.id }, process.env.JWT_REFRESH_SECRET!, {
        expiresIn: '7d',
      });

      return res.status(201).json({
        data: {
          token,
          refreshToken,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            curvCode: user.curv_code,
            totalSpent: Number(user.total_spent),
            twoFactorEnabled: user.two_factor_enabled,
            createdAt: user.created_at.toISOString(),
          },
        },
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: error.errors[0].message });
      }
      console.error('Register error:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const data = loginSchema.parse(req.body);

      const user = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (!user) {
        return res.status(401).json({ error: 'Email o contraseña incorrectos' });
      }

      const validPassword = await bcrypt.compare(data.password, user.password_hash);
      if (!validPassword) {
        return res.status(401).json({ error: 'Email o contraseña incorrectos' });
      }

      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
        expiresIn: '15m',
      });

      const refreshToken = jwt.sign({ userId: user.id }, process.env.JWT_REFRESH_SECRET!, {
        expiresIn: '7d',
      });

      return res.json({
        data: {
          token,
          refreshToken,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            curvCode: user.curv_code,
            totalSpent: Number(user.total_spent),
            twoFactorEnabled: user.two_factor_enabled,
            createdAt: user.created_at.toISOString(),
          },
        },
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: error.errors[0].message });
      }
      console.error('Login error:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  async getProfile(req: AuthRequest, res: Response) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.userId },
      });

      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      return res.json({
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          curvCode: user.curv_code,
          totalSpent: Number(user.total_spent),
          twoFactorEnabled: user.two_factor_enabled,
          createdAt: user.created_at.toISOString(),
        },
      });
    } catch (error) {
      console.error('Get profile error:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  async updateProfile(req: AuthRequest, res: Response) {
    try {
      const { name, email } = req.body;

      const user = await prisma.user.findUnique({
        where: { id: req.userId },
      });

      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      if (email && email !== user.email) {
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
          return res.status(400).json({ error: 'El email ya está en uso' });
        }
      }

      const updated = await prisma.user.update({
        where: { id: req.userId },
        data: {
          ...(name && { name }),
          ...(email && { email }),
        },
      });

      return res.json({
        data: {
          id: updated.id,
          email: updated.email,
          name: updated.name,
          role: updated.role,
          curvCode: updated.curv_code,
          totalSpent: Number(updated.total_spent),
          twoFactorEnabled: updated.two_factor_enabled,
          createdAt: updated.created_at.toISOString(),
        },
      });
    } catch (error) {
      console.error('Update profile error:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  async changePassword(req: AuthRequest, res: Response) {
    try {
      const data = changePasswordSchema.parse(req.body);

      const user = await prisma.user.findUnique({
        where: { id: req.userId },
      });

      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      const validPassword = await bcrypt.compare(data.currentPassword, user.password_hash);
      if (!validPassword) {
        return res.status(401).json({ error: 'La contraseña actual es incorrecta' });
      }

      const newPasswordHash = await bcrypt.hash(data.newPassword, 12);

      await prisma.user.update({
        where: { id: req.userId },
        data: { password_hash: newPasswordHash },
      });

      return res.json({ message: 'Contraseña actualizada correctamente' });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: error.errors[0].message });
      }
      console.error('Change password error:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
}
