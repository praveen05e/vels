import React, { useState } from 'react';
import Card, { CardBody, CardHeader } from '../../components/ui/Card';

export default function SimulationDashboard() {
  const [supplyReduction, setSupplyReduction] = useState(0);
  const [demandIncrease, setDemandIncrease] = useState(0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Climate Simulation</h1>
        <span className="bg-orange-100 text-orange-800 text-xs font-semibold px-2.5 py-0.5 rounded">SIMULATED DATA</span>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader><h2 className="text-lg font-medium">Parameters</h2></CardHeader>
          <CardBody className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Supply Reduction (%)</label>
              <input type="range" min="0" max="100" value={supplyReduction} onChange={(e) => setSupplyReduction(parseInt(e.target.value))} className="w-full" />
              <div className="text-right text-sm">{supplyReduction}%</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Demand Increase (%)</label>
              <input type="range" min="0" max="100" value={demandIncrease} onChange={(e) => setDemandIncrease(parseInt(e.target.value))} className="w-full" />
              <div className="text-right text-sm">{demandIncrease}%</div>
            </div>
            <button className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700">Run Simulation</button>
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><h2 className="text-lg font-medium">Simulation Results</h2></CardHeader>
          <CardBody>
            <p className="text-gray-500">Run a simulation to see projected impacts on food allocation and logistics during climate events.</p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
