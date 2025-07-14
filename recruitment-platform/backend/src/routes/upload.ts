import { Router } from 'express';

const router = Router();

// Placeholder routes
router.post('/', (req, res) => {
  res.json({ success: true, message: 'Upload route' });
});

export default router;
