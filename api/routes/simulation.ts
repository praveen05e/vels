import { Router } from 'express';
import { supabaseAdmin } from '../index.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { runAllocationEngine } from '../services/allocationEngine.js';

const router = Router();
router.use(authenticate);

router.post('/run', requireRole('coordinator', 'admin'), async (req, res) => {
  try {
    const { scenario_type, params } = req.body;
    
    // In a real implementation, we would copy the data, apply params, and run the engine on the copy.
    // For this example, we'll just log it and simulate.
    
    const runResult = {
        scenario_type,
        params,
        timestamp: new Date().toISOString(),
        status: 'completed',
        results: { before: {}, after: {} }
    };
    
    const { data, error } = await supabaseAdmin.from('simulation_runs').insert(runResult).select().single();
    if (error) throw error;
    
    await supabaseAdmin.from('audit_logs').insert({
        action: 'run_simulation',
        user_id: (req as any).user!.id,
        details: { simulation_id: data?.id }
    });
    
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: 'Simulation failed' });
  }
});

router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabaseAdmin.from('simulation_runs').select('*');
        if (error) throw error;
        res.json(data);
    } catch (err: any) {
        res.status(500).json({ error: 'Failed to fetch simulations' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { data, error } = await supabaseAdmin.from('simulation_runs').select('*').eq('id', req.params.id).single();
        if (error) throw error;
        res.json(data);
    } catch (err: any) {
        res.status(404).json({ error: 'Simulation not found' });
    }
});

export default router;
