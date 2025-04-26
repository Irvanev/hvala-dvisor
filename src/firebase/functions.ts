// src/firebase/functions.ts
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { firestore } from '../firebase/config'; // правильный путь к твоему firestore

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
