import React, { useState } from 'react';
import Card, { CardBody, CardHeader } from '../../components/ui/Card';

export default function AddFood() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Add Food Listing</h1>
      <Card>
        <CardBody>
          {success ? (
            <div className="bg-emerald-50 text-emerald-700 p-4 rounded-md">Food successfully listed!</div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Food Name</label>
                <input type="text" required className="mt-1 w-full border p-2 rounded-md" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">Category</label>
                  <select className="mt-1 w-full border p-2 rounded-md">
                    <option>Produce</option>
                    <option>Prepared Meals</option>
                    <option>Dairy</option>
                    <option>Baked Goods</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium">Quantity (kg)</label>
                  <input type="number" required className="mt-1 w-full border p-2 rounded-md" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium">Safe-use Deadline</label>
                <input type="datetime-local" required className="mt-1 w-full border p-2 rounded-md" />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-emerald-600 text-white p-2 rounded hover:bg-emerald-700">
                {loading ? 'Submitting...' : 'List Food'}
              </button>
            </form>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
