import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import Card, { CardHeader, CardBody } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/Modal';
import { useToast } from '../../components/ui/Toast';

export default function FoodDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  useEffect(() => {
    supabase.from('food_batches').select('*').eq('id', id).single().then(({ data, error }) => {
      if (!error && data) setData(data);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!data) return <div>Batch not found.</div>;

  const handleWithdraw = () => {
    setWithdrawOpen(false);
    toast.success('Batch withdrawn successfully');
    navigate('/donor/food-list');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Batch {data.batch_code}</h1>
        <div className="space-x-2">
          {data.verification_status === 'pending' && <Button variant="outline">Edit</Button>}
          <Button variant="danger" onClick={() => setWithdrawOpen(true)}>Withdraw</Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card><CardHeader><h2 className="text-lg font-medium">Basic Info</h2></CardHeader>
          <CardBody className="space-y-2">
            <p><strong>Food:</strong> {data.food_name}</p>
            <p><strong>Category:</strong> {data.category}</p>
            <p><strong>Deadline:</strong> {new Date(data.safe_use_deadline).toLocaleString()}</p>
            <p><strong>Status:</strong> <Badge>{data.verification_status}</Badge></p>
          </CardBody>
        </Card>
        <Card><CardHeader><h2 className="text-lg font-medium">Quantity Breakdown</h2></CardHeader>
          <CardBody className="space-y-2">
            <p><strong>Total:</strong> {data.quantity} {data.unit}</p>
            <p><strong>Available:</strong> {data.quantity} {data.unit}</p>
          </CardBody>
        </Card>
      </div>
      <ConfirmDialog isOpen={withdrawOpen} onClose={() => setWithdrawOpen(false)} onConfirm={handleWithdraw} title="Withdraw Batch" message="Are you sure you want to withdraw this food batch? This cannot be undone." isDestructive />
    </div>
  );
}
