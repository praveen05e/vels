import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Card, { CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); setSent(true); }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <Card className="max-w-md w-full">
        <CardBody>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 mb-8">Reset Password</h2>
          {sent ? (
            <div className="text-center space-y-4">
              <p className="text-sm text-green-600 bg-green-50 p-3 rounded">Check your email for a password reset link.</p>
              <Link to="/login" className="text-emerald-600 hover:text-emerald-500 text-sm">Return to Login</Link>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email address</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
              </div>
              <Button type="submit" loading={loading} className="w-full">Send Reset Link</Button>
              <div className="mt-4 text-center">
                <Link to="/login" className="text-emerald-600 hover:text-emerald-500 text-sm">Remembered your password? Log in</Link>
              </div>
            </form>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
