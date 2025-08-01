import express from 'express';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Get notifications for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    // For now return empty array since we don't have notifications table yet
    res.json({
      notifications: [],
      total: 0,
      currentPage: 1,
      totalPages: 0
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// Mark notification as read
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    // For now just return success
    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

export default router;
