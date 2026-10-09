import { Router } from 'express';
import { supabaseAdmin } from '../index';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.post('/sync', async (req, res) => {
  try {
    const { operations } = req.body;
    const results = [];
    
    for (const op of operations) {
      // 1. Check for duplicates in a processed_operations table
      const { data: existing } = await supabaseAdmin
        .from('offline_sync_logs')
        .select('*')
        .eq('operation_id', op.operation_id)
        .single();
        
      if (existing) {
        results.push({ operation_id: op.operation_id, status: 'skipped', reason: 'duplicate' });
        continue;
      }
      
      // Process based on type
      let status = 'processed';
      let error = null;
      
      try {
        if (op.operation_type === 'CREATE_DEMAND') {
            await supabaseAdmin.from('demands').insert(op.payload);
        } else if (op.operation_type === 'UPDATE_DELIVERY_STATUS') {
            await supabaseAdmin.from('deliveries').update({ status: op.payload.status }).eq('id', op.payload.id);
        }
        
        // Log it
        await supabaseAdmin.from('offline_sync_logs').insert({
            operation_id: op.operation_id,
            user_id: req.user!.id,
            operation_type: op.operation_type,
            status: 'success'
        });
      } catch (err: any) {
        status = 'failed';
        error = err.message;
      }
      
      results.push({ operation_id: op.operation_id, status, error });
    }
    
    res.json({ results });
  } catch (err: any) {
    res.status(500).json({ error: 'Sync failed' });
  }
});

export default router;
