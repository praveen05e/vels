import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/Badge';

export default function DeliveryList() {
  const navigate = useNavigate();
  // Mock data for deliveries
  const data = [
    { id: '1', pickup: '123 Donor St', delivery: '456 Shelter Ave', status: 'pending', scheduled: '2023-10-15T10:00:00Z' }
  ];

  const columns = [
    { header: 'Pickup', accessor: 'pickup' as keyof any },
    { header: 'Delivery', accessor: 'delivery' as keyof any },
    { header: 'Status', accessor: (r: any) => <Badge>{r.status}</Badge> },
    { header: 'Scheduled', accessor: (r: any) => new Date(r.scheduled).toLocaleString() }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Deliveries</h1>
      <DataTable columns={columns} data={data} onRowClick={(r) => navigate(`/driver/delivery/${r.id}`)} />
    </div>
  );
}
