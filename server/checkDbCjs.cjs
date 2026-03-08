const mongoose = require('mongoose');

const run = async () => {
  try {
    const mongoUri = "mongodb+srv://mayankrajwarsi123:CodeVektor123@@ac-ln44v99-shard-00-01.nchhggm.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0";
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB.");

    const db = mongoose.connection.db;
    
    // Check old and new collection names
    const collections = await db.listCollections().toArray();
    console.log("Collections:", collections.map(c => c.name));

    const progress = await db.collection('userprogresses').find({}).sort({ updatedAt: -1 }).limit(5).toArray();
    console.log("\n--- LATEST USER PROGRESS ---");
    console.log(JSON.stringify(progress, null, 2));

  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
};

run();
