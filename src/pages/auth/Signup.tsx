import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Card, { CardBody } from '../../components/ui/Card';
import { supabase } from '@/lib/supabase';

export default function Signup() {
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '', role: 'donor' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: { data: { full_name: formData.fullName, role: formData.role } }
      });
      if (signUpError) throw signUpError;
      navigate('/login');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <Card className="max-w-md w-full">
        <CardBody>
          <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-6">Create an Account</h2>
          {error && <div className="text-red-500 bg-red-50 p-3 rounded text-sm mb-4">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" placeholder="Full Name" required className="w-full border p-2 rounded" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
            <input type="email" placeholder="Email" required className="w-full border p-2 rounded" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            <input type="password" placeholder="Password" required className="w-full border p-2 rounded" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
            <select className="w-full border p-2 rounded" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
              <option value="donor">Donor (Restaurant, Supermarket)</option>
              <option value="receiver">Receiver (NGO, Shelter)</option>
              <option value="driver">Driver (Logistics)</option>
            </select>
            <button type="submit" disabled={loading} className="w-full bg-emerald-600 text-white p-2 rounded hover:bg-emerald-700">{loading ? 'Signing up...' : 'Sign Up'}</button>
          </form>
          <div className="mt-4 text-center">
            <Link to="/login" className="text-emerald-600 text-sm">Already have an account? Log in</Link>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
