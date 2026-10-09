import { Router } from 'express';
import { supabaseAdmin } from '../index';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('notifications')
      .select('*')
      .eq('user_id', req.user!.id)
      .order('created_at', { ascending: false })
      .limit(50);
      
    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

router.put('/:id/read', async (req, res) => {
  try {
    const { error } = await supabaseAdmin
      .from('notifications')
      .update({ read: true })
      .eq('id', req.params.id)
      .eq('user_id', req.user!.id);
      
    if (error) throw error;
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: 'Failed to update notification' });
  }
});

router.put('/read-all', async (req, res) => {
  try {
    const { error } = await supabaseAdmin
      .from('notifications')
      .update({ read: true })
      .eq('user_id', req.user!.id);
      
    if (error) throw error;
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: 'Failed to update notifications' });
  }
});

router.get('/unread-count', async (req, res) => {
  try {
    const { count, error } = await supabaseAdmin
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', req.user!.id)
      .eq('read', false);
      
    if (error) throw error;
    res.json({ count });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
});

export default router;
