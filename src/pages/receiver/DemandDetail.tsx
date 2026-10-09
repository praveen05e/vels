import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Card, { CardHeader, CardBody } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { supabase } from '@/lib/supabase';

export default function DemandDetail() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('demand_requests').select('*').eq('id', id).single().then(({ data, error }) => {
      if (!error && data) setData(data);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!data) return <div>Request not found.</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Request Details</h1>
      <Card><CardHeader><h2 className="text-lg font-medium">Basic Info</h2></CardHeader>
        <CardBody className="space-y-2">
          <p><strong>Category:</strong> {data.food_category}</p>
          <p><strong>Quantity Needed:</strong> {data.quantity_needed} {data.unit}</p>
          <p><strong>Urgency:</strong> <Badge>{data.urgency}</Badge></p>
          <p><strong>Status:</strong> <Badge>{data.status}</Badge></p>
          <p><strong>Deadline:</strong> {new Date(data.deadline).toLocaleString()}</p>
        </CardBody>
      </Card>
    </div>
  );
}
