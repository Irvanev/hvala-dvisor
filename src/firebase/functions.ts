// src/firebase/functions.ts
import { doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { firestore } from './config'; // Make sure this path is correct for your project

// Moderate a restaurant (approve or reject)
export const moderateRestaurant = async (
  restaurantId: string,
  status: 'approved' | 'rejected',
  comment?: string
): Promise<void> => {
  const restaurantRef = doc(firestore, 'restaurants', restaurantId);
  await updateDoc(restaurantRef, {
    'moderation.status': status,
    'moderation.reviewedAt': serverTimestamp(),
    'moderation.rejectionReason': status === 'rejected' ? (comment || '') : null
  });
};

// Archive/unarchive a restaurant (hide/show on site)
export const toggleRestaurantArchive = async (
  restaurantId: string,
  isArchived: boolean
): Promise<void> => {
  const restaurantRef = doc(firestore, 'restaurants', restaurantId);
  await updateDoc(restaurantRef, {
    isArchived: isArchived,
    updatedAt: serverTimestamp()
  });
};

// Delete a restaurant completely from the database
export const deleteRestaurant = async (
  restaurantId: string
): Promise<void> => {
  const restaurantRef = doc(firestore, 'restaurants', restaurantId);
  await deleteDoc(restaurantRef);
  // Note: In a production environment, you might want to:
  // 1. Delete associated images from Storage
  // 2. Delete associated reviews
  // 3. Update any related data in other collections
};

// Update specific restaurant fields
export const updateRestaurantFields = async (
  restaurantId: string,
  updatedFields: Record<string, any>
): Promise<void> => {
  const restaurantRef = doc(firestore, 'restaurants', restaurantId);
  await updateDoc(restaurantRef, {
    ...updatedFields,
    updatedAt: serverTimestamp()
  });
};


export const fixRestaurantModerationStatus = async (
    restaurantId: string,
    status: 'pending' | 'approved' | 'rejected'
  ): Promise<void> => {
    const restaurantRef = doc(firestore, 'restaurants', restaurantId);
    await updateDoc(restaurantRef, {
      'moderation.status': status,
      'moderation.reviewedAt': serverTimestamp()
    });
  };
  
