import React from 'react';
import Card, { CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export default function DeliveryDetail() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Delivery Details</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><h2 className="text-lg font-medium">Map</h2></CardHeader>
          <CardBody className="h-64 bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500">Leaflet Map Placeholder</span>
          </CardBody>
        </Card>
        <Card>
          <CardHeader><h2 className="text-lg font-medium">Actions</h2></CardHeader>
          <CardBody className="space-y-4">
            <Button className="w-full" variant="outline">Mark Picked Up</Button>
            <Button className="w-full" variant="outline">Mark In Transit</Button>
            <Button className="w-full" variant="primary">Mark Delivered</Button>
            <Button className="w-full" variant="danger">Report Failure</Button>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
