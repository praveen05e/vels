import React from 'react';
import Card, { CardHeader, CardBody } from '../../components/ui/Card';
import { DataTable } from '../../components/ui/DataTable';

export default function RouteManager() {
  const data = [
    { id: 'R-1', driver: 'John Doe', status: 'active', stops: 4 }
  ];

  const columns = [
    { header: 'Route ID', accessor: 'id' as keyof any },
    { header: 'Driver', accessor: 'driver' as keyof any },
    { header: 'Status', accessor: 'status' as keyof any },
    { header: 'Stops', accessor: 'stops' as keyof any }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Route Manager</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader><h2 className="text-lg font-medium">Live Map</h2></CardHeader>
          <CardBody className="h-96 bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500">Leaflet Route Map Placeholder</span>
          </CardBody>
        </Card>
        <Card>
          <CardHeader><h2 className="text-lg font-medium">Active Routes</h2></CardHeader>
          <CardBody className="p-0">
            <DataTable columns={columns} data={data} emptyMessage="No active routes." />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
