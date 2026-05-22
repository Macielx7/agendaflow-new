import prisma from './prisma';

export async function logSystem({ superAdminId, tenantId, action, details, ip }) {
  try {
    await prisma.systemLog.create({
      data: { superAdminId, tenantId, action, details, ip },
    });
  } catch (e) {
    console.error('Log error:', e);
  }
}
