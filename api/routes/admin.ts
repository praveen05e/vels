import { Router } from 'express';
import { supabaseAdmin } from '../index.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);
router.use(requireRole('admin', 'coordinator'));

router.get('/users', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('profiles').select('*');
    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.put('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    const { error } = await supabaseAdmin.from('profiles').update({ role }).eq('id', req.params.id);
    if (error) throw error;
    
    await supabaseAdmin.from('audit_logs').insert({
      action: 'update_user_role',
      user_id: (req as any).user!.id,
      details: { target_user_id: req.params.id, role }
    });
    
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: 'Role update failed' });
  }
});

router.put('/users/:id/verify', async (req, res) => {
  try {
    const { error } = await supabaseAdmin.from('profiles').update({ is_verified: true }).eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: 'Verification failed' });
  }
});

router.put('/users/:id/suspend', async (req, res) => {
  try {
    const { error } = await supabaseAdmin.from('profiles').update({ is_suspended: true }).eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: 'Suspension failed' });
  }
});

router.get('/organizations', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('organizations').select('*');
    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch organizations' });
  }
});

router.put('/organizations/:id/verify', async (req, res) => {
  try {
    const { error } = await supabaseAdmin.from('organizations').update({ verified: true }).eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: 'Verification failed' });
  }
});

router.get('/audit-logs', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(100);
    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

router.get('/system-config', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('system_config').select('*');
    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch system config' });
  }
});

router.put('/system-config/:key', async (req, res) => {
  try {
    const { value } = req.body;
    const { error } = await supabaseAdmin.from('system_config').update({ value }).eq('key', req.params.key);
    if (error) throw error;
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: 'Update failed' });
  }
});

router.get('/verification-queue', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('food_batches').select('*').eq('status', 'pending');
    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch queue' });
  }
});

router.get('/health', (req, res) => {
  res.json({ status: 'ok', admin_check: true });
});

export default router;
