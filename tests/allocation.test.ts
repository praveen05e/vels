import { describe, it, expect } from 'vitest';
import { runAllocationEngine } from '../api/services/allocationEngine.js';

describe('Allocation Engine Core Constraints', () => {
  const defaultWeights = { spoilage: 0.3, priority: 0.25, distance: 0.2, suitability: 0.15, fairness: 0.1 };

  it('The same food stock cannot be allocated twice (exceed available_quantity)', () => {
    // 100 kg available, but two demands of 60 kg each
    const batches = [{
      id: 'batch-1', food_category: 'grains', food_name: 'Rice',
      available_quantity: 100, unit: 'kg', pickup_latitude: null, pickup_longitude: null,
      safe_use_deadline: new Date(Date.now() + 86400000).toISOString(),
      storage_requirements: null, transport_requirements: null,
      verification_status: 'verified', fssai_compliant: true, organization_id: 'org-1'
    }];
    
    const demands = [
      { id: 'demand-1', food_category: 'grains', quantity_needed: 60, quantity_allocated: 0, unit: 'kg', urgency: 'high', deadline: null, delivery_latitude: null, delivery_longitude: null, dietary_requirements: null, storage_constraints: null, organization_id: 'org-2', people_to_serve: null },
      { id: 'demand-2', food_category: 'grains', quantity_needed: 60, quantity_allocated: 0, unit: 'kg', urgency: 'high', deadline: null, delivery_latitude: null, delivery_longitude: null, dietary_requirements: null, storage_constraints: null, organization_id: 'org-3', people_to_serve: null }
    ];

    const result = runAllocationEngine(batches, demands, defaultWeights);
    const totalAllocated = result.allocations.reduce((sum, a) => sum + a.quantity, 0);
    
    // Constraints check
    expect(totalAllocated).toBeLessThanOrEqual(100);
    expect(result.unmetDemand.reduce((sum, u) => sum + u.unmet, 0)).toBe(20);
  });

  it('Expired food cannot be dispatched', () => {
    const expiredDeadline = new Date(Date.now() - 3600000).toISOString();
    const batches = [{
      id: 'batch-expired', food_category: 'vegetables', food_name: 'Tomatoes',
      available_quantity: 50, unit: 'kg', pickup_latitude: null, pickup_longitude: null,
      safe_use_deadline: expiredDeadline,
      storage_requirements: null, transport_requirements: null,
      verification_status: 'verified', fssai_compliant: true, organization_id: 'org-1'
    }];
    
    const demands = [{ id: 'demand-1', food_category: 'vegetables', quantity_needed: 50, quantity_allocated: 0, unit: 'kg', urgency: 'critical', deadline: null, delivery_latitude: null, delivery_longitude: null, dietary_requirements: null, storage_constraints: null, organization_id: 'org-2', people_to_serve: null }];

    const result = runAllocationEngine(batches, demands, defaultWeights);
    expect(result.allocations.length).toBe(0);
    expect(result.totalAllocated).toBe(0);
    expect(result.warnings.some(w => w.includes('expired'))).toBe(true);
  });

  it('Unverified food cannot be dispatched', () => {
    const batches = [{
      id: 'batch-unverified', food_category: 'vegetables', food_name: 'Tomatoes',
      available_quantity: 50, unit: 'kg', pickup_latitude: null, pickup_longitude: null,
      safe_use_deadline: new Date(Date.now() + 86400000).toISOString(),
      storage_requirements: null, transport_requirements: null,
      verification_status: 'pending', fssai_compliant: true, organization_id: 'org-1'
    }];
    
    const demands = [{ id: 'demand-1', food_category: 'vegetables', quantity_needed: 50, quantity_allocated: 0, unit: 'kg', urgency: 'critical', deadline: null, delivery_latitude: null, delivery_longitude: null, dietary_requirements: null, storage_constraints: null, organization_id: 'org-2', people_to_serve: null }];

    const result = runAllocationEngine(batches, demands, defaultWeights);
    expect(result.totalAllocated).toBe(0);
    expect(result.warnings.some(w => w.includes('not verified'))).toBe(true);
  });

  it('Blocked route produces clear warning (infeasible)', () => {
    const batches = [{
      id: 'batch-1', food_category: 'grains', food_name: 'Rice',
      available_quantity: 100, unit: 'kg', pickup_latitude: 13.0827, pickup_longitude: 80.2707, // Chennai
      safe_use_deadline: new Date(Date.now() + 86400000).toISOString(),
      storage_requirements: null, transport_requirements: null,
      verification_status: 'verified', fssai_compliant: true, organization_id: 'org-1'
    }];
    
    const demands = [{ 
      id: 'demand-1', food_category: 'grains', quantity_needed: 100, quantity_allocated: 0, unit: 'kg', urgency: 'normal', deadline: null, 
      delivery_latitude: 13.0012, delivery_longitude: 80.2565, // Adyar
      dietary_requirements: null, storage_constraints: null, organization_id: 'org-2', people_to_serve: null 
    }];

    // Simulate blocked route near Chennai
    const climateImpact = {
      supply_reduction_percent: 0, demand_increase_percent: 0,
      blocked_roads: [{ from_lat: 13.08, from_lng: 80.27, to_lat: 13.00, to_lng: 80.25 }],
      affected_areas: []
    };

    const result = runAllocationEngine(batches, demands, defaultWeights, climateImpact);
    const candidate = result.allocations.find(a => !a.isFeasible);
    
    expect(candidate).toBeDefined();
    expect(candidate?.infeasibilityReason).toContain('Route blocked');
    expect(candidate?.quantity).toBe(0); // Cannot be allocated
  });
});
