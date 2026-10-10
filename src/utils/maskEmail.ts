/**
 * Email Privacy Masking Utility
 * Masks email display (e.g., "srao79614@gmail.com" -> "s*****@gmail.com", "lurlbusiness7@gmail.com" -> "l*****@gmail.com")
 * Keeps full email available for internal authentication and session persistence.
 */
export function maskEmail(email: string | null | undefined): string {
  if (!email) return '';
  const trimmed = email.trim();
  const atIndex = trimmed.indexOf('@');
  if (atIndex <= 0) return trimmed;

  const domain = trimmed.slice(atIndex); // includes "@domain.com"
  return `••••••${domain}`;
}

/**
 * Check if an email has VIP / Administrative authority
 */
export function isPrivilegedAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return (
    normalized === 'lurlbusiness7@gmail.com' ||
    normalized === 'srao79614@gmail.com'
  );
}

export const MASTER_VIP_PASSWORD = '1029384756';
