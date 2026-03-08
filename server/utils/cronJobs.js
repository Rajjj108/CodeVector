import cron from "node-cron";
import User from "../models/User.js";

cron.schedule("0 0 * * *", async () => {
  const now = new Date();

  const users = await User.find({
    "streak.restoreWindow": true,
  });

  for (const user of users) {
    if (user.streak.restoreExpiry < now) {
      user.streak.current = 0;
      user.streak.restoreWindow = false;
      await user.save();
    }
  }

  console.log("Streak expiry check done");
});