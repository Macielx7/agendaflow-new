import { getSuperSession } from './superAuth';
import { unauthorizedResponse } from './api';

export async function requireSuperAdmin() {
  const session = await getSuperSession();
  if (!session) return { error: unauthorizedResponse() };
  return { session, superAdminId: session.superAdminId };
}
