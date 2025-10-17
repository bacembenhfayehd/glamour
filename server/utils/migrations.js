import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';
dotenv.config();



const migrateUsers = async () => {
  try {
    await mongoose.connect('mongodb+srv://hfaidhbacem2017:npVcO29OtN05CCLb@cluster0.j7uar52.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
    console.log('Connected to MongoDB');
    const result = await User.updateMany(
      {
        $or: [
          { phone: { $exists: false } },
          { address: { $exists: false } }
        ]
      },
      {
        $set: {
          phone: null,
          address: {
            line: null,
            city: null,
            municipality: null,
            postalCode: null
          }
        }
      }
    );

    console.log(`Migration completed: ${result.modifiedCount} users updated`);
    
    // Vérifier un utilisateur
    const user = await User.findOne({ email: 'jinen@gmail.com' });
    console.log('Sample user after migration:', user);

    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrateUsers();