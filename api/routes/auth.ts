import { Router } from 'express';
import { z } from 'zod';
import { supabaseAdmin } from '../index.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['donor', 'receiver', 'driver', 'coordinator', 'admin']),
  full_name: z.string().min(1),
  organization_id: z.string().optional()
});

router.post('/signup', async (req, res) => {
  try {
    const data = signupSchema.parse(req.body);
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true
    });

    if (authError) throw authError;

    const { error: profileError } = await supabaseAdmin.from('profiles').insert({
      id: authData.user.id,
      email: data.email,
      role: data.role,
      full_name: data.full_name,
      organization_id: data.organization_id,
      is_verified: false,
      is_suspended: false
    });

    if (profileError) throw profileError;
    
    await supabaseAdmin.from('audit_logs').insert({
        action: 'user_signup',
        user_id: authData.user.id,
        details: { role: data.role }
    });

    res.status(201).json({ user: authData.user });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Signup failed' });
  }
});

router.post('/login', async (req, res) => {
  // Login should be handled client-side via Supabase JS to get the session/token.
  // This endpoint is just a placeholder or can be used if doing server-side auth.
  res.status(400).json({ error: 'Use Supabase client-side auth for login' });
});

router.post('/logout', async (req, res) => {
  res.status(200).json({ success: true });
});

router.get('/profile', authenticate, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('profiles').select('*').eq('id', (req as any).user!.id).single();
    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    res.status(400).json({ error: 'Failed to fetch profile' });
  }
});

router.put('/profile', authenticate, async (req, res) => {
  try {
    const { full_name, organization_id } = req.body;
    const { error } = await supabaseAdmin.from('profiles').update({ full_name, organization_id }).eq('id', (req as any).user!.id);
    if (error) throw error;
    
    await supabaseAdmin.from('audit_logs').insert({
        action: 'update_profile',
        user_id: (req as any).user!.id,
        details: { full_name, organization_id }
    });
    
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: 'Failed to update profile' });
  }
});

export default router;
