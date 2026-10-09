import { Router } from 'express';
import { z } from 'zod';
import { supabaseAdmin } from '../index';
import { authenticate, requireRole } from '../middleware/auth';
import crypto from 'crypto';

const router = Router();
router.use(authenticate);

const foodBatchSchema = z.object({
  category: z.string(),
  description: z.string(),
  total_quantity: z.number().positive(),
  unit: z.string(),
  safe_use_deadline: z.string().datetime(),
  latitude: z.number(),
  longitude: z.number(),
  temperature_requirement: z.string().optional()
});

router.post('/', requireRole('donor'), async (req, res) => {
  try {
    const data = foodBatchSchema.parse(req.body);
    const batch_code = 'FB-' + crypto.randomBytes(4).toString('hex').toUpperCase();

    const { data: batch, error } = await supabaseAdmin.from('food_batches').insert({
      ...data,
      donor_id: req.user!.id,
      batch_code,
      available_quantity: data.total_quantity,
      status: 'pending'
    }).select().single();

    if (error) throw error;

    await supabaseAdmin.from('inventory_transactions').insert({
      batch_id: batch.id,
      transaction_type: 'creation',
      quantity: data.total_quantity,
      user_id: req.user!.id
    });

    await supabaseAdmin.from('audit_logs').insert({
      action: 'create_food_batch',
      user_id: req.user!.id,
      details: { batch_id: batch.id }
    });

    res.status(201).json(batch);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Invalid data' });
  }
});

router.get('/', async (req, res) => {
  try {
    let query = supabaseAdmin.from('food_batches').select('*');
    
    if (req.user!.role === 'donor') {
      query = query.eq('donor_id', req.user!.id);
    } else if (req.user!.role === 'receiver') {
      query = query.eq('status', 'verified');
    }

    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch batches' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('food_batches').select('*').eq('id', req.params.id).single();
    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    res.status(404).json({ error: 'Batch not found' });
  }
});

router.post('/:id/verify', requireRole('coordinator', 'admin'), async (req, res) => {
  try {
    const { error } = await supabaseAdmin.from('food_batches').update({
      status: 'verified',
      verified_by: req.user!.id,
      verified_at: new Date().toISOString()
    }).eq('id', req.params.id);
    
    if (error) throw error;
    
    await supabaseAdmin.from('audit_logs').insert({
      action: 'verify_food_batch',
      user_id: req.user!.id,
      details: { batch_id: req.params.id }
    });
    
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: 'Verification failed' });
  }
});

export default router;
