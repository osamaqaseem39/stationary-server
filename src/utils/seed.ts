import { connectDatabase, disconnectDatabase } from '../config/database';
import { RoleModel } from '../modules/auth/role.model';

export const seedRoles = async () => {
  try {
    await connectDatabase();

    const roles = [
      {
        name: 'customer' as const,
        permissions: ['read:products', 'read:categories', 'create:orders', 'read:own:orders']
      },
      {
        name: 'admin' as const,
        permissions: ['*'] // All permissions
      },
      {
        name: 'staff' as const,
        permissions: [
          'read:*',
          'update:*',
          'create:products',
          'create:categories',
          'update:orders',
          'update:inventory'
        ]
      }
    ];

    for (const role of roles) {
      await RoleModel.findOneAndUpdate(
        { name: role.name },
        role,
        { upsert: true, new: true }
      );
      console.log(`✅ Role '${role.name}' created/updated`);
    }

    console.log('✅ Database seeded successfully');
    await disconnectDatabase();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    await disconnectDatabase();
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  seedRoles();
}

