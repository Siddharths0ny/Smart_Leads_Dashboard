import { User } from '../models/User.js';
import { Lead } from '../models/Lead.js';

export const seedDatabase = async (): Promise<void> => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('Database already has users. Skipping seeder...');
      return;
    }

    console.log('Seeding database with default users and mock leads...');

    // 1. Create Default Admin User
    const admin = new User({
      name: 'System Admin',
      email: 'admin@dashboard.com',
      password: 'Password123',
      role: 'admin',
    });
    await admin.save();

    // 2. Create Default Sales User
    const sales = new User({
      name: 'Sales Representative',
      email: 'sales@dashboard.com',
      password: 'Password123',
      role: 'sales_user',
    });
    await sales.save();

    console.log('Default users successfully created:');
    console.log('  Admin: admin@dashboard.com / Password123');
    console.log('  Sales: sales@dashboard.com / Password123');

    // 3. Create Sample Leads
    const sampleLeads = [
      {
        name: 'John Doe',
        email: 'john.doe@example.com',
        status: 'new',
        source: 'website',
        notes: 'Interested in enterprise subscription plans.',
        assignedTo: sales._id,
        createdBy: admin._id,
      },
      {
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        status: 'contacted',
        source: 'instagram',
        notes: 'Sent pricing sheet, waiting for response.',
        assignedTo: sales._id,
        createdBy: admin._id,
      },
      {
        name: 'Alice Johnson',
        email: 'alice.j@example.com',
        status: 'qualified',
        source: 'referral',
        notes: 'Highly interested. Demo call scheduled for next Tuesday.',
        assignedTo: admin._id,
        createdBy: admin._id,
      },
      {
        name: 'Bob Miller',
        email: 'bob.miller@example.com',
        status: 'lost',
        source: 'website',
        notes: 'Pricing was too high for their budget.',
        assignedTo: sales._id,
        createdBy: sales._id,
      },
      {
        name: 'Charlie Brown',
        email: 'charlie.b@example.com',
        status: 'new',
        source: 'referral',
        notes: 'Referred by active customer. Follow up ASAP.',
        assignedTo: sales._id,
        createdBy: sales._id,
      },
      {
        name: 'Emily Davis',
        email: 'emily.davis@example.com',
        status: 'qualified',
        source: 'website',
        notes: 'Trial account active. Needs onboarding assistance.',
        assignedTo: sales._id,
        createdBy: sales._id,
      },
      {
        name: 'Frank Miller',
        email: 'frank.miller@example.com',
        status: 'contacted',
        source: 'instagram',
        notes: 'Exhibited interest in standard tier packages.',
        assignedTo: admin._id,
        createdBy: admin._id,
      },
    ];

    await Lead.insertMany(sampleLeads);
    console.log(`Seeded ${sampleLeads.length} mock leads.`);
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};
