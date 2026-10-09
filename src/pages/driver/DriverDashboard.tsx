import React from 'react';
import Card, { CardBody, CardHeader } from '../../components/ui/Card';

export default function DriverDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Driver Dashboard</h1>
      <Card>
        <CardHeader><h2 className="text-lg font-medium">Current Assignment</h2></CardHeader>
        <CardBody>
          <p className="text-gray-500">No active deliveries at the moment.</p>
        </CardBody>
      </Card>
      <Card>
        <CardHeader><h2 className="text-lg font-medium">Today's Deliveries</h2></CardHeader>
        <CardBody>
          <p className="text-gray-500">List of completed and pending deliveries.</p>
        </CardBody>
      </Card>
    </div>
  );
}
