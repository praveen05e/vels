import React, { useState } from 'react';
import { DataTable } from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/Badge';

export default function UserManagement() {
  const [data] = useState([
    { id: 1, name: 'Alice Smith', email: 'alice@example.com', role: 'donor', verified: true, suspended: false },
    { id: 2, name: 'Bob Jones', email: 'bob@example.com', role: 'receiver', verified: false, suspended: false }
  ]);

  const columns = [
    { header: 'Name', accessor: 'name' as keyof any },
    { header: 'Email', accessor: 'email' as keyof any },
    { header: 'Role', accessor: 'role' as keyof any },
    { header: 'Status', accessor: (r: any) => <Badge variant={r.verified ? 'success' : 'warning'}>{r.verified ? 'Verified' : 'Pending'}</Badge> },
    { header: 'Actions', accessor: () => <button className="text-emerald-600 hover:underline">Edit</button> }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
      <DataTable columns={columns} data={data} />
    </div>
  );
}
