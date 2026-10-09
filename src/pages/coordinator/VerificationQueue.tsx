import React, { useState, useEffect } from 'react';
import { DataTable } from '../../components/ui/DataTable';
import { Button } from '../../components/ui/Button';
import { supabase } from '@/lib/supabase';

export default function VerificationQueue() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('food_batches').select('*').eq('verification_status', 'pending').then(({ data, error }) => {
      if (!error && data) setData(data);
      setLoading(false);
    });
  }, []);

  const columns = [
    { header: 'Batch Code', accessor: 'batch_code' as keyof any },
    { header: 'Food Name', accessor: 'food_name' as keyof any },
    { header: 'Category', accessor: 'category' as keyof any },
    { header: 'Quantity', accessor: (r: any) => `${r.quantity} ${r.unit}` },
    { header: 'Actions', accessor: (r: any) => (
      <div className="space-x-2">
        <Button size="sm" variant="success" as="button">Verify</Button>
        <Button size="sm" variant="danger" as="button">Reject</Button>
      </div>
    )}
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Verification Queue</h1>
      <DataTable columns={columns} data={data} loading={loading} emptyMessage="No pending verifications." />
    </div>
  );
}
