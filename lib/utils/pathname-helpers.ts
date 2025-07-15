// Helper function to safely check if a pathname starts with a specific string
export function pathnameStartsWith(pathname: string | null, prefix: string): boolean {
  if (!pathname) return false;
  return pathname.startsWith(prefix);
}

// Helper function to safely check if a pathname equals a specific string
export function pathnameEquals(pathname: string | null, value: string): boolean {
  if (!pathname) return false;
  return pathname === value;
}
