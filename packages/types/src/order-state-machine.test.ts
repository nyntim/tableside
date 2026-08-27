import { describe, expect, it } from 'vitest';
import {
  actionRequiresReason,
  getAllowedActions,
  getNextStatus,
  getStatusLabel,
} from './order-state-machine.js';

describe('order state machine', () => {
  it('allows confirm from pending', () => {
    expect(getNextStatus('pending', 'confirm', 'pickup')).toBe('confirmed');
  });

  it('blocks dispatch for pickup orders', () => {
    expect(getNextStatus('ready', 'dispatch', 'pickup')).toBeNull();
    expect(getAllowedActions('ready', 'pickup')).not.toContain('dispatch');
  });

  it('requires delivery dispatch before complete', () => {
    expect(getNextStatus('ready', 'complete', 'delivery')).toBeNull();
    expect(getAllowedActions('ready', 'delivery')).toContain('dispatch');
    expect(getAllowedActions('ready', 'delivery')).not.toContain('complete');
  });

  it('completes delivery after dispatch', () => {
    expect(getNextStatus('out_for_delivery', 'complete', 'delivery')).toBe('completed');
  });

  it('marks terminal statuses with no actions', () => {
    expect(getAllowedActions('completed', 'pickup')).toEqual([]);
    expect(getAllowedActions('cancelled', 'delivery')).toEqual([]);
  });

  it('requires reason for cancel and reject', () => {
    expect(actionRequiresReason('cancel')).toBe(true);
    expect(actionRequiresReason('reject')).toBe(true);
    expect(actionRequiresReason('confirm')).toBe(false);
  });

  it('provides human-readable labels', () => {
    expect(getStatusLabel('out_for_delivery')).toBe('Out for delivery');
  });
});
