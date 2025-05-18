/**
 * Validates if a string is a valid UUID v4
 * @param id The string to validate
 * @returns True if the string is a valid UUID, false otherwise
 */
export function isValidUUID(id: string): boolean {
  // UUID v4 regex pattern
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidPattern.test(id);
}
