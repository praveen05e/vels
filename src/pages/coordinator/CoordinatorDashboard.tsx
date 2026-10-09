import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Card, { CardBody, CardHeader } from '../../components/ui/Card';

export default function CoordinatorDashboard() {
  const { user } = useAuth();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Coordinator Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardBody><p className="text-sm text-gray-500">Total Supply</p><p className="text-2xl font-bold">450 kg</p></CardBody></Card>
        <Card><CardBody><p className="text-sm text-gray-500">Total Demand</p><p className="text-2xl font-bold">320 kg</p></CardBody></Card>
        <Card><CardBody><p className="text-sm text-gray-500">Pending Verification</p><p className="text-2xl font-bold">5</p></CardBody></Card>
        <Card><CardBody><p className="text-sm text-gray-500">Active Deliveries</p><p className="text-2xl font-bold">12</p></CardBody></Card>
      </div>
      <Card>
        <CardHeader><h2 className="text-lg font-medium">System Alerts</h2></CardHeader>
        <CardBody>
          <p className="text-red-500">Heavy rain predicted in North Zone. 3 routes may be affected.</p>
        </CardBody>
      </Card>
    </div>
  );
}
