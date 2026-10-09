import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/Badge';
import { supabase } from '@/lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export default function DemandList() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      supabase.from('demand_requests').select('*').eq('receiver_id', user.id).then(({ data, error }) => {
        if (!error && data) setData(data);
        setLoading(false);
      });
    }
  }, [user]);

  const columns = [
    { header: 'Category', accessor: 'food_category' as keyof any },
    { header: 'Quantity Needed', accessor: (r: any) => `${r.quantity_needed} ${r.unit}` },
    { header: 'Urgency', accessor: (r: any) => <Badge variant={r.urgency === 'high' ? 'danger' : 'default'}>{r.urgency}</Badge> },
    { header: 'Status', accessor: 'status' as keyof any },
    { header: 'Deadline', accessor: (r: any) => new Date(r.deadline).toLocaleDateString() },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">My Requests</h1>
      </div>
      <DataTable columns={columns} data={data} loading={loading} onRowClick={(r) => navigate(`/receiver/demand/${r.id}`)} emptyMessage="No requests found." />
    </div>
  );
}
