import mongoose from 'mongoose';
import { PostModel } from '../Src/DB/Models/Post.model.js';
import dotenv from 'dotenv';

dotenv.config();

const migratePostVisibility = async () => {
  try {
  
    await mongoose.connect(process.env.DB_URL);
    console.log('Connected to MongoDB');

    const postsToUpdate = await PostModel.find({
      $or: [
        { privacy: { $exists: true } },
        { visibility: { $exists: false } }
      ]
    });

    console.log(`Found ${postsToUpdate.length} posts to migrate`);

    for (const post of postsToUpdate) {
      let newVisibility = 'Public';
      
      if (post.privacy) {
        switch (post.privacy) {
          case 'public':
            newVisibility = 'Public';
            break;
          case 'private':
            newVisibility = 'Private';
            break;
          case 'friends':
            newVisibility = 'FriendsOnly';
            break;
          default:
            newVisibility = 'Public';
        }
      }

      await PostModel.findByIdAndUpdate(post._id, {
        $set: {
          visibility: newVisibility,
          specificUsers: []
        },
        $unset: {
          privacy: 1
        }
      });

      console.log(`Updated post ${post._id}: ${post.privacy || 'undefined'} -> ${newVisibility}`);
    }

    console.log('Migration completed successfully');
    
    const remainingOldPosts = await PostModel.find({
      $or: [
        { privacy: { $exists: true } },
        { visibility: { $exists: false } }
      ]
    });

    if (remainingOldPosts.length === 0) {
      console.log(' All posts have been successfully migrated');
    } else {
      console.log(`  ${remainingOldPosts.length} posts still need migration`);
    }

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

if (import.meta.url === `file://${process.argv[1]}`) {
  migratePostVisibility();
}

export { migratePostVisibility }; 