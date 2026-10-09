import React, { useState } from 'react';
import Card, { CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { DataTable } from '../../components/ui/DataTable';

export default function AllocationManager() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);

  const handleRun = () => {
    setLoading(true);
    setTimeout(() => {
      setData([{ id: 1, batch: 'B-123', demand: 'REQ-45', quantity: '50 kg', score: '0.92', status: 'proposed' }]);
      setLoading(false);
    }, 1500);
  };

  const columns = [
    { header: 'Batch', accessor: 'batch' as keyof any },
    { header: 'Demand', accessor: 'demand' as keyof any },
    { header: 'Quantity', accessor: 'quantity' as keyof any },
    { header: 'Score', accessor: 'score' as keyof any },
    { header: 'Actions', accessor: (r: any) => (
      <div className="space-x-2">
        <Button size="sm" variant="primary">Approve</Button>
      </div>
    )}
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Allocation Engine</h1>
        <Button onClick={handleRun} loading={loading}>Run Allocation</Button>
      </div>
      <Card>
        <CardHeader><h2 className="text-lg font-medium">Proposed Allocations</h2></CardHeader>
        <CardBody className="p-0">
          <DataTable columns={columns} data={data} loading={loading} emptyMessage="No proposed allocations. Run the engine to generate." />
        </CardBody>
      </Card>
    </div>
  );
}
