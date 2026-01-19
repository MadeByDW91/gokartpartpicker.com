/**
 * API response types for server actions
 * Following conventions from CONVENTIONS.md
 */

/**
 * Standard action result type
 * All server actions return this shape for consistent error handling
 */
export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

/**
 * Paginated response type for list queries
 */
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/**
 * Action result with pagination
 */
export type PaginatedActionResult<T> =
  | { success: true; data: PaginatedResult<T> }
  | { success: false; error: string };

/**
 * Create a success result
 */
export function success<T>(data: T): ActionResult<T> {
  return { success: true, data };
}

/**
 * Create an error result
 */
export function error<T>(
  message: string,
  fieldErrors?: Record<string, string[]>
): ActionResult<T> {
  return { success: false, error: message, fieldErrors };
}

/**
 * Handle unknown errors consistently with user-friendly messages
 * Use handleErrorWithContext from ./errors for resource-specific errors
 */
export function handleError<T>(err: unknown, context: string, resourceName?: string): ActionResult<T> {
  console.error(`[${context}] Error:`, {
    error: err,
    context,
    resourceName,
    timestamp: new Date().toISOString(),
  });
  
  // Import getUserFriendlyError dynamically to avoid circular dependency
  const { getUserFriendlyError } = require('./errors');
  const userMessage = getUserFriendlyError(err, resourceName);
  
  return error(userMessage);
}
