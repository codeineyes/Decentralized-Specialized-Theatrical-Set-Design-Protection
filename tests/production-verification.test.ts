import { describe, it, expect, beforeEach } from 'vitest';

// Mock state
let mockState = {
  lastProductionId: 0,
  productions: new Map()
};

// Mock contract functions
const productionVerification = {
  registerProduction: (sender, designId, productionName, venue, startDate, endDate) => {
    // Ensure end date is after start date
    if (endDate < startDate) {
      return { err: 1 };
    }
    
    const newId = mockState.lastProductionId + 1;
    
    mockState.productions.set(newId, {
      producer: sender,
      'design-id': designId,
      'production-name': productionName,
      venue,
      'start-date': startDate,
      'end-date': endDate
    });
    
    mockState.lastProductionId = newId;
    return { ok: newId };
  },
  
  getProduction: (productionId) => {
    const production = mockState.productions.get(productionId);
    return production ? production : null;
  },
  
  getProductionCount: () => {
    return mockState.lastProductionId;
  }
};

// Tests
describe('Production Verification Contract', () => {
  beforeEach(() => {
    // Reset mock state before each test
    mockState = {
      lastProductionId: 0,
      productions: new Map()
    };
  });
  
  it('should register a new production', () => {
    const sender = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
    const designId = 1;
    const productionName = 'A Midsummer Night\'s Dream';
    const venue = 'City Theater';
    const startDate = 1000;
    const endDate = 2000;
    
    const result = productionVerification.registerProduction(
        sender, designId, productionName, venue, startDate, endDate
    );
    
    expect(result).toHaveProperty('ok');
    expect(result.ok).toBe(1);
    expect(mockState.lastProductionId).toBe(1);
    
    const storedProduction = productionVerification.getProduction(1);
    expect(storedProduction).not.toBeNull();
    expect(storedProduction.producer).toBe(sender);
    expect(storedProduction['design-id']).toBe(designId);
    expect(storedProduction['production-name']).toBe(productionName);
    expect(storedProduction.venue).toBe(venue);
    expect(storedProduction['start-date']).toBe(startDate);
    expect(storedProduction['end-date']).toBe(endDate);
  });
  
  it('should reject a production with invalid dates', () => {
    const sender = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
    const designId = 1;
    const productionName = 'A Midsummer Night\'s Dream';
    const venue = 'City Theater';
    const startDate = 2000; // Start date after end date
    const endDate = 1000;
    
    const result = productionVerification.registerProduction(
        sender, designId, productionName, venue, startDate, endDate
    );
    
    expect(result).toHaveProperty('err');
    expect(result.err).toBe(1);
    expect(mockState.lastProductionId).toBe(0);
  });
  
  it('should return the correct production count', () => {
    const sender = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
    const designId = 1;
    
    productionVerification.registerProduction(
        sender, designId, 'Hamlet', 'Globe Theater', 1000, 2000
    );
    
    productionVerification.registerProduction(
        sender, designId, 'Macbeth', 'Royal Theater', 3000, 4000
    );
    
    expect(productionVerification.getProductionCount()).toBe(2);
  });
});
