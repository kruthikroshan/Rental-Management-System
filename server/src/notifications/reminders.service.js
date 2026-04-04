import mongoose from 'mongoose';
import NotificationsService from './notifications.service.js';

export const startRemindersCron = () => {
  console.log('⏰ [Reminders Cron] Starting daily reminder checker...');

  // Run immediately on boot, then every 24 hours
  checkAndSendReminders();
  const ONE_DAY = 24 * 60 * 60 * 1000;
  setInterval(checkAndSendReminders, ONE_DAY);
};

const checkAndSendReminders = async () => {
  try {
    console.log('🔄 [Reminders Cron] Running check for upcoming returns...');
    const Rental = mongoose.model('Rental');
    
    // Default setting: N = 2 days before return
    const NOTIFICATION_LEAD_DAYS = process.env.NOTIFICATION_LEAD_DAYS || 2;
    
    const today = new Date();
    const targetDate = new Date();
    targetDate.setDate(today.getDate() + parseInt(NOTIFICATION_LEAD_DAYS));
    
    // Normalize to start and end of that target day
    const startOfTargetDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfTargetDay = new Date(targetDate.setHours(23, 59, 59, 999));

    // Find all rentals that are CONFIRMED or PICKED_UP and end on target date
    const upcomingReturns = await Rental.find({
      status: { $in: ['CONFIRMED', 'PICKED_UP'] },
      endDate: {
        $gte: startOfTargetDay,
        $lte: endOfTargetDay
      }
    });

    console.log(`📊 [Reminders Cron] Found ${upcomingReturns.length} rentals ending in ${NOTIFICATION_LEAD_DAYS} days.`);

    for (const rental of upcomingReturns) {
      if (!rental.userEmail) {
        console.warn(`[Reminders Cron] Missing email for rental ${rental._id}`);
        continue;
      }

      await NotificationsService.sendReturnReminder(rental.userEmail, {
        productName: rental.productName,
        returnDate: rental.endDate.toLocaleDateString(),
        orderId: rental._id
      });
      console.log(`✅ [Reminders Cron] Sent reminder for rental ${rental._id} to ${rental.userEmail}`);
    }

  } catch (error) {
    console.error('❌ [Reminders Cron] Error checking reminders:', error.message);
  }
};
