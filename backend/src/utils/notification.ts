import Notification, { NotificationType } from '../models/Notification';
import mongoose from 'mongoose';

export const createNotification = async (
  userId: string | mongoose.Types.ObjectId,
  type: NotificationType,
  title: string,
  message: string,
  metadata?: Record<string, unknown>
): Promise<void> => {
  try {
    await Notification.create({ userId, type, title, message, metadata });
  } catch (err) {
    console.error('Failed to create notification:', err);
  }
};
