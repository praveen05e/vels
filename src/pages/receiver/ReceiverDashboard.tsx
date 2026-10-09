import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Card, { CardBody, CardHeader } from '../../components/ui/Card';

export default function ReceiverDashboard() {
  const { user } = useAuth();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Receiver Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardBody><p className="text-sm text-gray-500">Active Requests</p><p className="text-2xl font-bold">3</p></CardBody></Card>
        <Card><CardBody><p className="text-sm text-gray-500">Allocated</p><p className="text-2xl font-bold">2</p></CardBody></Card>
        <Card><CardBody><p className="text-sm text-gray-500">Received</p><p className="text-2xl font-bold">15</p></CardBody></Card>
        <Card><CardBody><p className="text-sm text-gray-500">Fulfillment Rate</p><p className="text-2xl font-bold">85%</p></CardBody></Card>
      </div>
      <Card>
        <CardHeader><h2 className="text-lg font-medium">Recent Allocations</h2></CardHeader>
        <CardBody>
          <p className="text-gray-500">List of recent allocations will appear here.</p>
        </CardBody>
      </Card>
    </div>
  );
}
