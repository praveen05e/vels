import React, { useState } from 'react';
import Card, { CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';

export default function SubmitDemand() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('Demand request submitted successfully!');
    }, 1000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Submit Demand Request</h1>
      <Card>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">Food Category</label>
                <select className="mt-1 w-full border p-2 rounded-md"><option>Produce</option><option>Prepared Meals</option></select>
              </div>
              <div>
                <label className="block text-sm font-medium">Quantity Needed (kg)</label>
                <input type="number" required className="mt-1 w-full border p-2 rounded-md" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">Urgency Level</label>
                <select className="mt-1 w-full border p-2 rounded-md"><option>Low</option><option>Medium</option><option>High</option><option>Critical</option></select>
              </div>
              <div>
                <label className="block text-sm font-medium">Deadline</label>
                <input type="datetime-local" required className="mt-1 w-full border p-2 rounded-md" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium">Delivery Address</label>
              <input type="text" required className="mt-1 w-full border p-2 rounded-md" />
            </div>
            <Button type="submit" loading={loading} className="w-full">Submit Request</Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
