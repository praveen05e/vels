import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/Badge';
import { supabase } from '@/lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export default function FoodList() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      supabase.from('food_batches').select('*').eq('donor_id', user.id).then(({ data, error }) => {
        if (!error && data) setData(data);
        setLoading(false);
      });
    }
  }, [user]);

  const columns = [
    { header: 'Batch Code', accessor: 'batch_code' as keyof any },
    { header: 'Food Name', accessor: 'food_name' as keyof any },
    { header: 'Category', accessor: 'category' as keyof any },
    { header: 'Quantity', accessor: (r: any) => `${r.quantity} ${r.unit}` },
    { header: 'Deadline', accessor: (r: any) => new Date(r.safe_use_deadline).toLocaleString() },
    { header: 'Status', accessor: (r: any) => <Badge variant={r.verification_status === 'verified' ? 'success' : 'warning'}>{r.verification_status}</Badge> }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">My Food Listings</h1>
      </div>
      <DataTable columns={columns} data={data} loading={loading} onRowClick={(r) => navigate(`/donor/food/${r.id}`)} emptyMessage="No food batches found. Add one to get started." />
    </div>
  );
}
