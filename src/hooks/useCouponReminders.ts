import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuthStore } from '../store/useAuthStore';
import { UserCoupon } from '../types';

export function useCouponReminders() {
  const { profile } = useAuthStore();
  
  useEffect(() => {
    // This effect acts as a simulator for our cron job.
    // In a real application, this logic would live in a Cloud Function
    // that runs hourly or daily. We simulate it here on the client for the prototype.
    const checkCoupons = async () => {
      if (!profile) return;
      
      try {
        const qCoupons = query(
          collection(db, 'userCoupons'),
          where('userId', '==', profile.id),
          where('status', '==', 'active')
        );
        
        const snapshot = await getDocs(qCoupons);
        const coupons = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserCoupon));
        
        const nowMs = Date.now();
        const ONE_HOUR = 60 * 60 * 1000;
        const TWELVE_HOURS = 12 * ONE_HOUR;
        const ONE_DAY = 24 * ONE_HOUR;
        
        // Check previously sent messages to prevent spamming
        // Since we are doing it client side, without a proper tracking field on the coupon (e.g. reminderSent1h),
        // we'll query recent messages. We just check if a reminder exists for this coupon code.
        const qMessages = query(
          collection(db, 'messages'),
          where('userId', '==', profile.id),
          where('type', '==', 'reminder')
        );
        const msgSnapshot = await getDocs(qMessages);
        const existingMessages = msgSnapshot.docs.map(doc => doc.data());
        const existingContent = new Set(existingMessages.map(m => m.content as string));
        
        for (const coupon of coupons) {
          const expMs = coupon.expiresAt?.toMillis ? coupon.expiresAt.toMillis() : 0;
          const timeRemaining = expMs - nowMs;
          
          if (timeRemaining <= 0) continue; // Already expired
          
          let alertTrigger = '';
          let alertMessage = '';
          
          if (timeRemaining <= ONE_HOUR) {
             alertTrigger = `1hr_${coupon.id}`;
             alertMessage = `Your coupon ${coupon.name} (${coupon.code}) is expiring in less than 1 hour! Use it before it's gone!`;
          } else if (timeRemaining <= TWELVE_HOURS) {
             alertTrigger = `12hr_${coupon.id}`;
             alertMessage = `Your coupon ${coupon.name} (${coupon.code}) is expiring in less than 12 hours. Don't forget to redeem it!`;
          } else if (timeRemaining <= ONE_DAY) {
             alertTrigger = `1day_${coupon.id}`;
             alertMessage = `Your coupon ${coupon.name} (${coupon.code}) is expiring tomorrow. Redeem it soon!`;
          }
          
          if (alertTrigger && !existingContent.has(alertMessage)) {
             // Create reminder message
             await addDoc(collection(db, 'messages'), {
               userId: profile.id,
               title: 'Coupon Expiry Reminder',
               content: alertMessage,
               type: 'reminder',
               read: false,
               createdAt: serverTimestamp(),
               updatedAt: serverTimestamp()
             });
          }
        }

      } catch (error) {
        console.error("Failed to check coupon reminders", error);
      }
    };
    
    // Check shortly after load
    const timer = setTimeout(() => {
      checkCoupons();
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [profile]);
}
