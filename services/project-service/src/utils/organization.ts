import { PrismaClient } from '@taskforge/database';

const prisma = new PrismaClient();

async function createDefaultOrganization(userId: string) {
    // Check if user already has an organization
    const existingMember = await prisma.organizationMember.findFirst({
        where: { userId },
        include: { organization: true },
    });

    if (existingMember) {
        return existingMember.organization;
    }

    // Create default organization
    const organization = await prisma.organization.create({
        data: {
            name: 'My Organization',
            slug: `org-${Date.now()}`,
            members: {
                create: {
                    userId,
                    role: 'OWNER',
                },
            },
        },
    });

    return organization;
}

export { createDefaultOrganization };
