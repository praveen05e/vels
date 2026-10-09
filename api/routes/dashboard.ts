import { Router } from 'express';
import { supabaseAdmin } from '../index';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/donor', async (req, res) => {
  try {
    // Basic aggregation for donor
    const { data: batches, error } = await supabaseAdmin
      .from('food_batches')
      .select('status, available_quantity, total_quantity')
      .eq('donor_id', req.user!.id);
      
    if (error) throw error;
    
    res.json({ 
      metrics: {
        total_listed: batches.length,
        total_verified: batches.filter(b => b.status === 'verified').length,
      } 
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

router.get('/receiver', async (req, res) => {
    try {
        res.json({ metrics: { total_requested: 0 } });
    } catch (err: any) {
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
});

router.get('/driver', async (req, res) => {
    try {
        res.json({ metrics: { total_delivered: 0 } });
    } catch (err: any) {
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
});

router.get('/coordinator', async (req, res) => {
    try {
        res.json({ metrics: { total_supply: 0, total_demand: 0 } });
    } catch (err: any) {
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
});

router.get('/admin', async (req, res) => {
    try {
        res.json({ metrics: { total_users: 0 } });
    } catch (err: any) {
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
});

export default router;
