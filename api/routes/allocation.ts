import { Router } from 'express';
import { supabaseAdmin } from '../index';
import { authenticate, requireRole } from '../middleware/auth';
import { runAllocationEngine } from '../services/allocationEngine';

const router = Router();
router.use(authenticate);

router.post('/run', requireRole('coordinator', 'admin'), async (req, res) => {
  try {
    const result = await runAllocationEngine();
    
    await supabaseAdmin.from('audit_logs').insert({
      action: 'run_allocation_engine',
      user_id: req.user!.id,
      details: { result }
    });
    
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Allocation engine failed' });
  }
});

router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('allocations').select('*');
    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch allocations' });
  }
});

router.post('/:id/dispatch', requireRole('coordinator', 'admin'), async (req, res) => {
  try {
    const { error } = await supabaseAdmin.from('allocations').update({ status: 'dispatched' }).eq('id', req.params.id);
    if (error) throw error;
    
    await supabaseAdmin.from('audit_logs').insert({
      action: 'dispatch_allocation',
      user_id: req.user!.id,
      details: { allocation_id: req.params.id }
    });
    
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: 'Dispatch failed' });
  }
});

export default router;
