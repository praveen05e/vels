import React from 'react';
import Card, { CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export default function SystemConfig() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900">System Configuration</h1>
      <Card>
        <CardHeader><h2 className="text-lg font-medium">Allocation Weights</h2></CardHeader>
        <CardBody className="space-y-4">
          <p className="text-sm text-gray-500 mb-4">These weights are configurable assumptions, not validated scientific parameters. They must sum to 1.0.</p>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm">Spoilage Risk</label><input type="number" step="0.1" defaultValue="0.3" className="mt-1 w-full border rounded p-2" /></div>
            <div><label className="block text-sm">Priority Need</label><input type="number" step="0.1" defaultValue="0.3" className="mt-1 w-full border rounded p-2" /></div>
            <div><label className="block text-sm">Distance</label><input type="number" step="0.1" defaultValue="0.2" className="mt-1 w-full border rounded p-2" /></div>
            <div><label className="block text-sm">Suitability</label><input type="number" step="0.1" defaultValue="0.1" className="mt-1 w-full border rounded p-2" /></div>
            <div><label className="block text-sm">Fairness</label><input type="number" step="0.1" defaultValue="0.1" className="mt-1 w-full border rounded p-2" /></div>
          </div>
        </CardBody>
      </Card>
      <Card>
        <CardHeader><h2 className="text-lg font-medium">Operational Constraints</h2></CardHeader>
        <CardBody className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm">Max Delivery Distance (km)</label><input type="number" defaultValue="50" className="mt-1 w-full border rounded p-2" /></div>
            <div><label className="block text-sm">Min Food Safety Hours</label><input type="number" defaultValue="4" className="mt-1 w-full border rounded p-2" /></div>
          </div>
          <div className="pt-4"><Button variant="primary">Save Configuration</Button></div>
        </CardBody>
      </Card>
    </div>
  );
}
