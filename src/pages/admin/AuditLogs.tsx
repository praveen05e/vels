import React, { useState } from 'react';
import { DataTable } from '../../components/ui/DataTable';

export default function AuditLogs() {
  const [data] = useState([
    { id: 1, actor: 'admin@system.local', action: 'CREATE', resource: 'user', time: '2023-10-10 10:00 AM' }
  ]);

  const columns = [
    { header: 'Actor', accessor: 'actor' as keyof any },
    { header: 'Action', accessor: 'action' as keyof any },
    { header: 'Resource', accessor: 'resource' as keyof any },
    { header: 'Time', accessor: 'time' as keyof any }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
        <button className="text-emerald-600 hover:underline">Export CSV</button>
      </div>
      <DataTable columns={columns} data={data} />
    </div>
  );
}
