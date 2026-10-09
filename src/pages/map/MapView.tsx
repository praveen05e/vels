import React from 'react';
import Card, { CardBody, CardHeader } from '../../components/ui/Card';

export default function MapView() {
  return (
    <div className="space-y-4 h-[calc(100vh-100px)] flex flex-col">
      <h1 className="text-2xl font-bold text-gray-900">System Map</h1>
      <Card className="flex-1 flex flex-col">
        <CardBody className="flex-1 p-0 relative bg-gray-200 flex items-center justify-center">
          <div className="text-gray-500 text-center">
            <p>Leaflet Map Visualization</p>
            <p className="text-sm">(Requires react-leaflet and leaflet CSS to render tiles)</p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
