import { describe, it, expect, beforeEach } from 'vitest';

// Mock implementation for testing Clarity contracts
// In a real scenario, you would use a Clarity testing framework

// Mock state
let mockState = {
  lastDesignId: 0,
  designs: new Map(),
  blockHeight: 100
};

// Mock contract functions
const designRegistration = {
  registerDesign: (sender, title, description, hash) => {
    // Validate hash length (32 bytes)
    if (hash.length !== 32) {
      return { err: 1 };
    }
    
    const newId = mockState.lastDesignId + 1;
    
    mockState.designs.set(newId, {
      designer: sender,
      title,
      description,
      'creation-date': mockState.blockHeight,
      hash
    });
    
    mockState.lastDesignId = newId;
    return { ok: newId };
  },
  
  getDesign: (designId) => {
    const design = mockState.designs.get(designId);
    return design ? design : null;
  },
  
  getDesignCount: () => {
    return mockState.lastDesignId;
  }
};

// Tests
describe('Design Registration Contract', () => {
  beforeEach(() => {
    // Reset mock state before each test
    mockState = {
      lastDesignId: 0,
      designs: new Map(),
      blockHeight: 100
    };
  });
  
  it('should register a new design', () => {
    const sender = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
    const title = 'Forest Scene';
    const description = 'A detailed forest backdrop with animated elements';
    const hash = new Uint8Array(32).fill(1); // Mock 32-byte hash
    
    const result = designRegistration.registerDesign(sender, title, description, hash);
    
    expect(result).toHaveProperty('ok');
    expect(result.ok).toBe(1);
    expect(mockState.lastDesignId).toBe(1);
    
    const storedDesign = designRegistration.getDesign(1);
    expect(storedDesign).not.toBeNull();
    expect(storedDesign.designer).toBe(sender);
    expect(storedDesign.title).toBe(title);
    expect(storedDesign.description).toBe(description);
    expect(storedDesign['creation-date']).toBe(mockState.blockHeight);
  });
  
  it('should reject a design with invalid hash length', () => {
    const sender = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
    const title = 'Forest Scene';
    const description = 'A detailed forest backdrop with animated elements';
    const hash = new Uint8Array(16).fill(1); // Invalid hash length (16 bytes)
    
    const result = designRegistration.registerDesign(sender, title, description, hash);
    
    expect(result).toHaveProperty('err');
    expect(result.err).toBe(1);
    expect(mockState.lastDesignId).toBe(0);
  });
  
  it('should return the correct design count', () => {
    const sender = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
    const title = 'Forest Scene';
    const description = 'A detailed forest backdrop with animated elements';
    const hash = new Uint8Array(32).fill(1);
    
    designRegistration.registerDesign(sender, title, description, hash);
    designRegistration.registerDesign(sender, 'City Skyline', 'Urban landscape with skyscrapers', hash);
    
    expect(designRegistration.getDesignCount()).toBe(2);
  });
});
