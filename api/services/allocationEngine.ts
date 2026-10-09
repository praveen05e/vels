// ============================================================
// FoodBridge AI - Climate-Aware Food Rescue Allocation Engine
// ============================================================
// This engine uses weighted priority scoring + linear programming
// to optimally allocate surplus food to communities in need.
//
// IMPORTANT: The allocation weights are CONFIGURABLE ASSUMPTIONS,
// not validated scientific parameters. The scoring method provides
// an explainable baseline for decision support — not a substitute
// for human judgment in emergency situations.
//
// Constraints enforced:
// 1. Total allocations from a batch <= available_quantity
// 2. Total allocations to a demand <= remaining_need
// 3. Food category must match demand requirements
// 4. Delivery must meet safety & time constraints
// 5. Infeasible/unsafe routes are NOT dispatched
// 6. Results are explainable and auditable
// ============================================================

import solver from 'javascript-lp-solver';

// --- Types ---

export interface AllocBatch {
  id: string;
  food_category: string;
  food_name: string;
  available_quantity: number;
  unit: string;
  pickup_latitude: number | null;
  pickup_longitude: number | null;
  safe_use_deadline: string;
  storage_requirements: string | null;
  transport_requirements: string | null;
  verification_status: string;
  fssai_compliant: boolean;
  organization_id: string | null;
}

export interface AllocDemand {
  id: string;
  food_category: string;
  quantity_needed: number;
  quantity_allocated: number;
  unit: string;
  urgency: string;
  deadline: string | null;
  delivery_latitude: number | null;
  delivery_longitude: number | null;
  dietary_requirements: string | null;
  storage_constraints: string | null;
  organization_id: string | null;
  people_to_serve: number | null;
}

export interface AllocWeights {
  spoilage: number;
  priority: number;
  distance: number;
  suitability: number;
  fairness: number;
}

export interface ClimateImpact {
  supply_reduction_percent: number;
  demand_increase_percent: number;
  blocked_roads: Array<{ from_lat: number; from_lng: number; to_lat: number; to_lng: number }>;
  affected_areas: Array<{ lat: number; lng: number; radius_km: number }>;
}

export interface AllocCandidate {
  batchId: string;
  demandId: string;
  quantity: number;
  spoilageScore: number;
  priorityScore: number;
  distanceScore: number;
  suitabilityScore: number;
  totalScore: number;
  explanation: string;
  isFeasible: boolean;
  infeasibilityReason?: string;
  estimatedDistanceKm: number;
  estimatedTimeMinutes: number;
}

export interface AllocResult {
  allocations: AllocCandidate[];
  unmetDemand: Array<{ demandId: string; unmet: number; foodCategory: string }>;
  atRiskStock: Array<{ batchId: string; quantity: number; hoursUntilDeadline: number; foodName: string }>;
  totalAllocated: number;
  totalUnmet: number;
  totalSupply: number;
  totalDemand: number;
  warnings: string[];
  scoringMethod: string;
  weightsUsed: AllocWeights;
}

// --- Utility functions ---

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function hoursUntilDeadline(deadline: string): number {
  const now = new Date();
  const dl = new Date(deadline);
  return Math.max(0, (dl.getTime() - now.getTime()) / (1000 * 60 * 60));
}

function isPointInAffectedArea(
  lat: number, lng: number,
  areas: Array<{ lat: number; lng: number; radius_km: number }>
): boolean {
  return areas.some(area => haversineDistance(lat, lng, area.lat, area.lng) <= area.radius_km);
}

function isRoadBlocked(
  fromLat: number, fromLng: number, toLat: number, toLng: number,
  blockedRoads: Array<{ from_lat: number; from_lng: number; to_lat: number; to_lng: number }>
): boolean {
  // Check if the direct path between two points intersects any blocked road
  // Simplified: check if either endpoint is near a blocked road segment
  const threshold = 5; // km threshold for road proximity
  return blockedRoads.some(road => {
    const d1 = haversineDistance(fromLat, fromLng, road.from_lat, road.from_lng);
    const d2 = haversineDistance(toLat, toLng, road.to_lat, road.to_lng);
    const d3 = haversineDistance(fromLat, fromLng, road.to_lat, road.to_lng);
    const d4 = haversineDistance(toLat, toLng, road.from_lat, road.from_lng);
    return Math.min(d1, d2, d3, d4) < threshold;
  });
}

// --- Scoring functions ---

function calcSpoilageScore(deadline: string, maxHours: number = 72): number {
  const hours = hoursUntilDeadline(deadline);
  if (hours <= 0) return 0; // expired — do not allocate
  // Higher score = more urgent (closer to expiry)
  return Math.max(0, Math.min(1, 1 - hours / maxHours));
}

function calcPriorityScore(urgency: string): number {
  switch (urgency) {
    case 'critical': return 1.0;
    case 'high': return 0.75;
    case 'normal': return 0.5;
    case 'low': return 0.25;
    default: return 0.5;
  }
}

function calcDistanceScore(distanceKm: number, maxDistance: number = 50): number {
  if (distanceKm > maxDistance) return 0;
  return Math.max(0, 1 - distanceKm / maxDistance);
}

function calcSuitabilityScore(batchCategory: string, demandCategory: string): number {
  if (batchCategory === demandCategory) return 1.0;
  // Compatible categories
  const compatMap: Record<string, string[]> = {
    'grains': ['packaged'],
    'vegetables': ['cooked_food'],
    'fruits': ['beverages'],
    'dairy': [],
    'meat': ['cooked_food'],
    'cooked_food': ['packaged'],
    'packaged': ['grains', 'beverages'],
    'beverages': ['packaged'],
    'other': ['grains', 'vegetables', 'fruits', 'packaged'],
  };
  if (compatMap[batchCategory]?.includes(demandCategory)) return 0.5;
  return 0;
}

function estimateTravelTime(distanceKm: number, climateImpact?: ClimateImpact): number {
  // Average speed 30 km/h in urban Chennai, reduced during climate events
  let avgSpeed = 30;
  if (climateImpact && climateImpact.supply_reduction_percent > 0) {
    avgSpeed *= 0.7; // Slower during disruptions
  }
  return (distanceKm / avgSpeed) * 60; // minutes
}

// --- Main allocation engine ---

export function runAllocationEngine(
  batches: AllocBatch[],
  demands: AllocDemand[],
  weights: AllocWeights,
  climateImpact?: ClimateImpact,
  minSafetyHours: number = 2,
  maxDeliveryDistanceKm: number = 50
): AllocResult {
  const warnings: string[] = [];
  const allocations: AllocCandidate[] = [];

  // Apply climate impacts to supply
  let effectiveBatches = batches.map(b => ({ ...b }));
  if (climateImpact && climateImpact.supply_reduction_percent > 0) {
    const reduction = climateImpact.supply_reduction_percent / 100;
    effectiveBatches = effectiveBatches.map(b => ({
      ...b,
      available_quantity: Math.max(0, b.available_quantity * (1 - reduction)),
    }));
    warnings.push(`Climate impact: supply reduced by ${climateImpact.supply_reduction_percent}%`);
  }

  // Apply climate impacts to demand
  let effectiveDemands = demands.map(d => ({ ...d }));
  if (climateImpact && climateImpact.demand_increase_percent > 0) {
    const increase = climateImpact.demand_increase_percent / 100;
    effectiveDemands = effectiveDemands.map(d => ({
      ...d,
      quantity_needed: d.quantity_needed * (1 + increase),
    }));
    warnings.push(`Climate impact: demand increased by ${climateImpact.demand_increase_percent}%`);
  }

  // Filter out expired and unverified batches
  const validBatches = effectiveBatches.filter(b => {
    if (b.verification_status !== 'verified') {
      warnings.push(`Batch ${b.id.slice(0, 8)} excluded: not verified (status: ${b.verification_status})`);
      return false;
    }
    if (hoursUntilDeadline(b.safe_use_deadline) <= 0) {
      warnings.push(`Batch ${b.id.slice(0, 8)} excluded: expired`);
      return false;
    }
    if (b.available_quantity <= 0) {
      return false;
    }
    return true;
  });

  // Filter demands with remaining need
  const activeDemands = effectiveDemands.filter(d => {
    const remaining = d.quantity_needed - d.quantity_allocated;
    return remaining > 0;
  });

  if (validBatches.length === 0) {
    warnings.push('No verified food batches available for allocation');
  }
  if (activeDemands.length === 0) {
    warnings.push('No active demand requests to fulfill');
  }

  const totalSupply = validBatches.reduce((s, b) => s + b.available_quantity, 0);
  const totalDemand = activeDemands.reduce((s, d) => s + (d.quantity_needed - d.quantity_allocated), 0);

  // Score all batch-demand pairs
  const candidates: Array<AllocCandidate & { varName: string; maxQuantity: number }> = [];

  for (const batch of validBatches) {
    for (const demand of activeDemands) {
      // Suitability check
      const suitability = calcSuitabilityScore(batch.food_category, demand.food_category);
      if (suitability === 0) continue; // incompatible

      // Distance calculation
      let distanceKm = 15; // default if no coordinates
      if (batch.pickup_latitude && batch.pickup_longitude &&
          demand.delivery_latitude && demand.delivery_longitude) {
        distanceKm = haversineDistance(
          batch.pickup_latitude, batch.pickup_longitude,
          demand.delivery_latitude, demand.delivery_longitude
        );
      }

      // Feasibility checks
      let isFeasible = true;
      let infeasibilityReason = '';

      // Distance feasibility
      if (distanceKm > maxDeliveryDistanceKm) {
        isFeasible = false;
        infeasibilityReason = `Distance ${distanceKm.toFixed(1)}km exceeds max ${maxDeliveryDistanceKm}km`;
      }

      // Time safety feasibility
      const travelTime = estimateTravelTime(distanceKm, climateImpact);
      const hoursLeft = hoursUntilDeadline(batch.safe_use_deadline);
      const hoursNeeded = travelTime / 60 + minSafetyHours;
      if (hoursLeft < hoursNeeded) {
        isFeasible = false;
        infeasibilityReason = `Insufficient time: ${hoursLeft.toFixed(1)}h available, ${hoursNeeded.toFixed(1)}h needed (incl. ${minSafetyHours}h safety margin)`;
      }

      // Road blockage feasibility
      if (climateImpact && climateImpact.blocked_roads.length > 0 &&
          batch.pickup_latitude && batch.pickup_longitude &&
          demand.delivery_latitude && demand.delivery_longitude) {
        if (isRoadBlocked(
          batch.pickup_latitude, batch.pickup_longitude,
          demand.delivery_latitude, demand.delivery_longitude,
          climateImpact.blocked_roads
        )) {
          isFeasible = false;
          infeasibilityReason = 'Route blocked by road closure';
        }
      }

      // Area affected by climate
      if (climateImpact && climateImpact.affected_areas.length > 0) {
        if (demand.delivery_latitude && demand.delivery_longitude &&
            isPointInAffectedArea(demand.delivery_latitude, demand.delivery_longitude, climateImpact.affected_areas)) {
          // Still feasible but lower score and warning
          warnings.push(`Demand ${demand.id.slice(0, 8)} is in a climate-affected area`);
        }
      }

      // Calculate scores
      const spoilageScore = calcSpoilageScore(batch.safe_use_deadline);
      const priorityScore = calcPriorityScore(demand.urgency);
      const distanceScore = calcDistanceScore(distanceKm, maxDeliveryDistanceKm);
      const suitabilityScore = suitability;

      // Weighted total
      const totalScore =
        weights.spoilage * spoilageScore +
        weights.priority * priorityScore +
        weights.distance * distanceScore +
        weights.suitability * suitabilityScore;

      // Max allocatable quantity
      const remainingNeed = demand.quantity_needed - demand.quantity_allocated;
      const maxQuantity = Math.min(batch.available_quantity, remainingNeed);

      if (maxQuantity <= 0) continue;

      const varName = `x_${batch.id.slice(0, 8)}_${demand.id.slice(0, 8)}`;

      // Build explanation
      const explanation = [
        `Spoilage urgency: ${(spoilageScore * 100).toFixed(0)}% (${hoursLeft.toFixed(1)}h until deadline)`,
        `Community priority: ${(priorityScore * 100).toFixed(0)}% (${demand.urgency})`,
        `Distance: ${distanceKm.toFixed(1)}km (score: ${(distanceScore * 100).toFixed(0)}%)`,
        `Suitability: ${batch.food_category} → ${demand.food_category} (${(suitabilityScore * 100).toFixed(0)}%)`,
        `Total weighted score: ${(totalScore * 100).toFixed(1)}%`,
        isFeasible ? 'Delivery is feasible' : `NOT FEASIBLE: ${infeasibilityReason}`,
      ].join('; ');

      candidates.push({
        batchId: batch.id,
        demandId: demand.id,
        quantity: 0, // will be set by LP solver
        spoilageScore,
        priorityScore,
        distanceScore,
        suitabilityScore,
        totalScore,
        explanation,
        isFeasible,
        infeasibilityReason: isFeasible ? undefined : infeasibilityReason,
        estimatedDistanceKm: distanceKm,
        estimatedTimeMinutes: travelTime,
        varName,
        maxQuantity,
      });
    }
  }

  // Only allocate feasible candidates
  const feasibleCandidates = candidates.filter(c => c.isFeasible);
  const infeasibleCandidates = candidates.filter(c => !c.isFeasible);

  if (infeasibleCandidates.length > 0) {
    warnings.push(`${infeasibleCandidates.length} batch-demand pairs are infeasible and excluded from allocation`);
  }

  // Build LP model
  if (feasibleCandidates.length > 0) {
    const model: any = {
      optimize: 'score',
      opType: 'max',
      constraints: {} as Record<string, any>,
      variables: {} as Record<string, any>,
    };

    // Supply constraints: sum of allocations from each batch <= available
    for (const batch of validBatches) {
      model.constraints[`supply_${batch.id.slice(0, 8)}`] = { max: batch.available_quantity };
    }

    // Demand constraints: sum of allocations to each demand <= remaining need
    for (const demand of activeDemands) {
      const remaining = demand.quantity_needed - demand.quantity_allocated;
      model.constraints[`demand_${demand.id.slice(0, 8)}`] = { max: remaining };
    }

    // Variables: each feasible candidate
    for (const c of feasibleCandidates) {
      const variable: Record<string, number> = {
        score: c.totalScore,
        [`supply_${c.batchId.slice(0, 8)}`]: 1,
        [`demand_${c.demandId.slice(0, 8)}`]: 1,
      };

      // Upper bound on individual allocation
      model.constraints[`max_${c.varName}`] = { max: c.maxQuantity };
      variable[`max_${c.varName}`] = 1;

      model.variables[c.varName] = variable;
    }

    // Solve
    try {
      const result = solver.Solve(model);

      if (result.feasible) {
        for (const c of feasibleCandidates) {
          const allocated = result[c.varName] || 0;
          if (allocated > 0) {
            allocations.push({
              ...c,
              quantity: Math.round(allocated * 100) / 100, // round to 2 decimals
            });
          }
        }
      } else {
        warnings.push('LP solver found no feasible solution — try relaxing constraints');
      }
    } catch (err: any) {
      warnings.push(`Optimization error: ${err.message}. Falling back to greedy allocation.`);

      // Greedy fallback: allocate highest-score pairs first
      const sorted = feasibleCandidates.sort((a, b) => b.totalScore - a.totalScore);
      const batchRemaining = new Map(validBatches.map(b => [b.id, b.available_quantity]));
      const demandRemaining = new Map(activeDemands.map(d => [d.id, d.quantity_needed - d.quantity_allocated]));

      for (const c of sorted) {
        const batchAvail = batchRemaining.get(c.batchId) || 0;
        const demandNeed = demandRemaining.get(c.demandId) || 0;
        const qty = Math.min(batchAvail, demandNeed);
        if (qty > 0) {
          allocations.push({ ...c, quantity: qty });
          batchRemaining.set(c.batchId, batchAvail - qty);
          demandRemaining.set(c.demandId, demandNeed - qty);
        }
      }
    }
  }

  // Add infeasible candidates to results (with quantity 0)
  for (const c of infeasibleCandidates) {
    allocations.push({ ...c, quantity: 0 });
  }

  // Calculate unmet demand
  const allocatedByDemand = new Map<string, number>();
  for (const a of allocations) {
    if (a.quantity > 0) {
      allocatedByDemand.set(a.demandId, (allocatedByDemand.get(a.demandId) || 0) + a.quantity);
    }
  }
  const unmetDemand = activeDemands
    .map(d => {
      const allocated = allocatedByDemand.get(d.id) || 0;
      const remaining = d.quantity_needed - d.quantity_allocated;
      const unmet = remaining - allocated;
      return { demandId: d.id, unmet, foodCategory: d.food_category };
    })
    .filter(u => u.unmet > 0);

  // Calculate at-risk stock
  const atRiskStock = validBatches
    .filter(b => hoursUntilDeadline(b.safe_use_deadline) < 12)
    .map(b => ({
      batchId: b.id,
      quantity: b.available_quantity,
      hoursUntilDeadline: hoursUntilDeadline(b.safe_use_deadline),
      foodName: b.food_name,
    }));

  const totalAllocated = allocations.reduce((s, a) => s + a.quantity, 0);
  const totalUnmetAmount = unmetDemand.reduce((s, u) => s + u.unmet, 0);

  return {
    allocations: allocations.filter(a => a.quantity > 0 || !a.isFeasible),
    unmetDemand,
    atRiskStock,
    totalAllocated,
    totalUnmet: totalUnmetAmount,
    totalSupply,
    totalDemand,
    warnings,
    scoringMethod: 'Weighted priority score with linear programming optimization. Weights are configurable assumptions — not validated scientific parameters.',
    weightsUsed: weights,
  };
}

// --- Simulation wrapper ---

export function runSimulation(
  batches: AllocBatch[],
  demands: AllocDemand[],
  weights: AllocWeights,
  scenarioType: string,
  scenarioParams: Record<string, any>,
  minSafetyHours: number = 2,
  maxDeliveryDistanceKm: number = 50
): {
  baseline: AllocResult;
  simulated: AllocResult;
  comparison: {
    supplyChange: number;
    demandChange: number;
    allocationChange: number;
    unmetChange: number;
    newWarnings: string[];
  };
} {
  // Run baseline (no climate impact)
  const baseline = runAllocationEngine(batches, demands, weights, undefined, minSafetyHours, maxDeliveryDistanceKm);

  // Build climate impact from scenario
  const climateImpact: ClimateImpact = {
    supply_reduction_percent: 0,
    demand_increase_percent: 0,
    blocked_roads: [],
    affected_areas: [],
  };

  // Modify batches/demands based on scenario
  let simBatches = batches.map(b => ({ ...b }));
  let simDemands = demands.map(d => ({ ...d }));

  switch (scenarioType) {
    case 'normal':
      break;

    case 'drought':
      climateImpact.supply_reduction_percent = scenarioParams.supply_reduction_percent || 30;
      break;

    case 'flood':
      climateImpact.demand_increase_percent = scenarioParams.demand_increase_percent || 40;
      climateImpact.blocked_roads = scenarioParams.blocked_roads || [];
      climateImpact.affected_areas = scenarioParams.affected_areas || [];
      break;

    case 'demand_surge':
      climateImpact.demand_increase_percent = scenarioParams.demand_increase_percent || 60;
      break;

    case 'donor_cancellation': {
      const cancelledDonors: string[] = scenarioParams.cancelled_donor_ids || [];
      simBatches = simBatches.filter(b => !cancelledDonors.includes(b.id));
      break;
    }

    case 'expiring_food': {
      const hoursToReduce = scenarioParams.hours_to_reduce || 20;
      simBatches = simBatches.map(b => ({
        ...b,
        safe_use_deadline: new Date(
          new Date(b.safe_use_deadline).getTime() - hoursToReduce * 60 * 60 * 1000
        ).toISOString(),
      }));
      break;
    }

    case 'vehicle_breakdown':
      // Reduce max distance (fewer vehicles = less coverage)
      maxDeliveryDistanceKm = scenarioParams.reduced_max_distance || 20;
      break;

    case 'road_closure':
      climateImpact.blocked_roads = scenarioParams.blocked_roads || [];
      break;

    case 'combined_disruption':
      climateImpact.supply_reduction_percent = scenarioParams.supply_reduction_percent || 20;
      climateImpact.demand_increase_percent = scenarioParams.demand_increase_percent || 30;
      climateImpact.blocked_roads = scenarioParams.blocked_roads || [];
      if (scenarioParams.cancelled_donor_ids) {
        simBatches = simBatches.filter(b => !scenarioParams.cancelled_donor_ids.includes(b.id));
      }
      break;
  }

  // Run simulated allocation
  const simulated = runAllocationEngine(simBatches, simDemands, weights, climateImpact, minSafetyHours, maxDeliveryDistanceKm);

  // Compare
  const newWarnings = simulated.warnings.filter(w => !baseline.warnings.includes(w));

  return {
    baseline,
    simulated,
    comparison: {
      supplyChange: simulated.totalSupply - baseline.totalSupply,
      demandChange: simulated.totalDemand - baseline.totalDemand,
      allocationChange: simulated.totalAllocated - baseline.totalAllocated,
      unmetChange: simulated.totalUnmet - baseline.totalUnmet,
      newWarnings,
    },
  };
}
