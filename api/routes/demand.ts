import { Router } from 'express';
import { z } from 'zod';
import { supabaseAdmin } from '../index';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();
router.use(authenticate);

const demandSchema = z.object({
  category: z.string(),
  quantity_needed: z.number().positive(),
  urgency_level: z.enum(['low', 'normal', 'high', 'critical']),
  latitude: z.number(),
  longitude: z.number(),
  description: z.string().optional()
});

router.post('/', requireRole('receiver'), async (req, res) => {
  try {
    const data = demandSchema.parse(req.body);
    
    const { data: demand, error } = await supabaseAdmin.from('demands').insert({
      ...data,
      receiver_id: req.user!.id,
      status: 'pending',
      quantity_allocated: 0
    }).select().single();

    if (error) throw error;

    await supabaseAdmin.from('audit_logs').insert({
      action: 'create_demand',
      user_id: req.user!.id,
      details: { demand_id: demand.id }
    });

    res.status(201).json(demand);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Invalid data' });
  }
});

router.get('/', async (req, res) => {
  try {
    let query = supabaseAdmin.from('demands').select('*');
    if (req.user!.role === 'receiver') {
      query = query.eq('receiver_id', req.user!.id);
    }
    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch demands' });
  }
});

router.post('/:id/approve', requireRole('coordinator', 'admin'), async (req, res) => {
  try {
    const { error } = await supabaseAdmin.from('demands').update({ status: 'approved' }).eq('id', req.params.id);
    if (error) throw error;
    
    await supabaseAdmin.from('audit_logs').insert({
      action: 'approve_demand',
      user_id: req.user!.id,
      details: { demand_id: req.params.id }
    });
    
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: 'Approval failed' });
  }
});

export default router;
