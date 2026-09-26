import { Request, Response } from 'express';
import { z } from 'zod';
import User from '../models/User';
import Achievement from '../models/Achievement';
import { generateToken } from '../utils/jwt';
import { AuthRequest } from '../middleware/auth';
import { BADGES, calculateLevel } from '../utils/xp';
import { createNotification } from '../utils/notification';

const registerSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(8),
  theme: z.enum(['feminine', 'masculine', 'neutral']).optional(),
  interests: z.array(z.string()).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: 'Validation failed', errors: parsed.error.errors });
      return;
    }
    const { name, email, password, theme, interests } = parsed.data;

    const existing = await User.findOne({ email });
    if (existing) {
      res.status(409).json({ success: false, message: 'Email already registered.' });
      return;
    }

    const user = await User.create({
      name,
      email,
      password,
      theme: theme || 'neutral',
      interests: interests || [],
    });

    const token = generateToken(user._id.toString());
    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        theme: user.theme,
        interests: user.interests,
        xp: user.xp,
        level: user.level,
        streak: user.streak,
        focusScore: user.focusScore,
        isOnboarded: user.isOnboarded,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: 'Invalid credentials format.' });
      return;
    }
    const { email, password } = parsed.data;

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    const token = generateToken(user._id.toString());
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        theme: user.theme,
        interests: user.interests,
        xp: user.xp,
        level: user.level,
        streak: user.streak,
        focusScore: user.focusScore,
        isOnboarded: user.isOnboarded,
        avatar: user.avatar,
        notificationPrefs: user.notificationPrefs,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

export const completeOnboarding = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { theme, interests, avatar } = req.body;
    const user = await User.findById(req.userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    if (theme) user.theme = theme;
    if (interests) user.interests = interests;
    if (avatar) user.avatar = { ...user.avatar, ...avatar };
    user.isOnboarded = true;
    await user.save();

    // Award first-time badge
    const existing = await Achievement.findOne({ userId: user._id, badgeId: 'first_commitment' });
    if (!existing) {
      const badge = BADGES.find((b) => b.badgeId === 'first_commitment');
      if (badge) {
        await Achievement.create({ userId: user._id, ...badge });
        user.xp += badge.xpReward;
        user.level = calculateLevel(user.xp);
        await user.save();
        await createNotification(
          user._id,
          'achievement_unlocked',
          '🎯 Achievement Unlocked!',
          `You earned the "${badge.name}" badge! +${badge.xpReward} XP`
        );
      }
    }

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, theme, avatar, interests, notificationPrefs } = req.body;
    const user = await User.findById(req.userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    if (name) user.name = name;
    if (theme) user.theme = theme;
    if (avatar) user.avatar = { ...user.avatar, ...avatar };
    if (interests) user.interests = interests;
    if (notificationPrefs) user.notificationPrefs = { ...user.notificationPrefs, ...notificationPrefs };
    await user.save();

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }
    if (!(await user.comparePassword(currentPassword))) {
      res.status(401).json({ success: false, message: 'Current password is incorrect.' });
      return;
    }
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password updated successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};
