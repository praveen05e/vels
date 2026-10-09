import { Router } from 'express';
import { supabaseAdmin } from '../index';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.post('/', requireRole('coordinator', 'admin'), async (req, res) => {
  try {
    const { allocation_id, driver_id } = req.body;
    
    const { data, error } = await supabaseAdmin.from('deliveries').insert({
      allocation_id,
      driver_id,
      status: 'pending'
    }).select().single();
    
    if (error) throw error;
    
    await supabaseAdmin.from('audit_logs').insert({
      action: 'create_delivery',
      user_id: req.user!.id,
      details: { delivery_id: data.id }
    });
    
    res.status(201).json(data);
  } catch (err: any) {
    res.status(400).json({ error: 'Failed to create delivery' });
  }
});

router.get('/', async (req, res) => {
  try {
    let query = supabaseAdmin.from('deliveries').select('*');
    if (req.user!.role === 'driver') {
      query = query.eq('driver_id', req.user!.id);
    }
    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch deliveries' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('deliveries').select('*').eq('id', req.params.id).single();
    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    res.status(404).json({ error: 'Delivery not found' });
  }
});

router.put('/:id/status', requireRole('driver', 'coordinator', 'admin'), async (req, res) => {
  try {
    const { status } = req.body;
    const { error } = await supabaseAdmin.from('deliveries').update({ status }).eq('id', req.params.id);
    if (error) throw error;
    
    await supabaseAdmin.from('audit_logs').insert({
      action: 'update_delivery_status',
      user_id: req.user!.id,
      details: { delivery_id: req.params.id, status }
    });
    
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: 'Status update failed' });
  }
});

router.post('/:id/confirm', requireRole('receiver'), async (req, res) => {
    try {
        const { quantity_received } = req.body;
        const { error } = await supabaseAdmin.from('deliveries').update({ status: 'completed' }).eq('id', req.params.id);
        if (error) throw error;
        
        await supabaseAdmin.from('audit_logs').insert({
            action: 'confirm_delivery',
            user_id: req.user!.id,
            details: { delivery_id: req.params.id, quantity_received }
        });
        
        res.json({ success: true });
    } catch (err: any) {
        res.status(400).json({ error: 'Confirmation failed' });
    }
});

router.post('/:id/fail', async (req, res) => {
    try {
        const { reason } = req.body;
        const { error } = await supabaseAdmin.from('deliveries').update({ status: 'failed', failure_reason: reason }).eq('id', req.params.id);
        if (error) throw error;
        
        await supabaseAdmin.from('audit_logs').insert({
            action: 'fail_delivery',
            user_id: req.user!.id,
            details: { delivery_id: req.params.id, reason }
        });
        
        res.json({ success: true });
    } catch (err: any) {
        res.status(400).json({ error: 'Mark as failed operation failed' });
    }
});

router.post('/:id/proof', async (req, res) => {
    // proof upload logic
    res.json({ success: true });
});

export default router;
