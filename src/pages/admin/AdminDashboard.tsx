import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Card, { CardBody, CardHeader } from '../../components/ui/Card';

export default function AdminDashboard() {
  const { user } = useAuth();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardBody><p className="text-sm text-gray-500">Total Users</p><p className="text-2xl font-bold">1,245</p></CardBody></Card>
        <Card><CardBody><p className="text-sm text-gray-500">Active Organizations</p><p className="text-2xl font-bold">45</p></CardBody></Card>
        <Card><CardBody><p className="text-sm text-gray-500">Pending Approvals</p><p className="text-2xl font-bold">12</p></CardBody></Card>
        <Card><CardBody><p className="text-sm text-gray-500">System Health</p><p className="text-2xl font-bold text-emerald-600">Optimal</p></CardBody></Card>
      </div>
      <Card>
        <CardHeader><h2 className="text-lg font-medium">Recent Audit Logs</h2></CardHeader>
        <CardBody>
          <p className="text-gray-500">Logs will be displayed here.</p>
        </CardBody>
      </Card>
    </div>
  );
}
