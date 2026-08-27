import { ApiError } from '@tableside/types';

export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'AppError';
  }

  toResponse(): ApiError {
    return {
      error: {
        code: this.code,
        message: this.message,
        details: this.details,
      },
    };
  }
}

export const notFound = (resource: string) =>
  new AppError('NOT_FOUND', `${resource} not found`, 404);

export const validationError = (message: string, details?: Record<string, unknown>) =>
  new AppError('VALIDATION_ERROR', message, 422, details);

export const conflictError = (message: string, details?: Record<string, unknown>) =>
  new AppError('CONFLICT', message, 409, details);

export const storeClosedError = () =>
  new AppError('STORE_CLOSED', 'The restaurant is not accepting orders right now', 503);

export const unavailableItemError = (items: string[]) =>
  new AppError('UNAVAILABLE_ITEMS', 'Some menu items are unavailable', 422, {
    items,
  });

export const invalidTransitionError = (
  allowedActions: string[],
  action: string,
) =>
  new AppError('INVALID_TRANSITION', `Cannot perform action "${action}"`, 409, {
    allowedActions,
  });

export const totalMismatchError = (expected: number, actual: number) =>
  new AppError('TOTAL_MISMATCH', 'Order total does not match server calculation', 422, {
    expectedTotalCents: expected,
    actualTotalCents: actual,
  });

export const minOrderError = (minOrderCents: number) =>
  new AppError('MIN_ORDER_NOT_MET', 'Order subtotal is below the minimum', 422, {
    minOrderCents,
  });
