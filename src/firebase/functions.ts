// src/firebase/functions.ts
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();

// Функция для модерации ресторана
export const moderateRestaurant = async (
    restaurantId: string,
    status: 'approved' | 'rejected',
    comments?: string
) => {
    try {
        const moderateRestaurantFunction = httpsCallable(functions, 'moderateRestaurant');
        const result = await moderateRestaurantFunction({
            restaurantId,
            status,
            comments
        });

        return result.data;
    } catch (error) {
        console.error('Ошибка при модерации ресторана:', error);
        throw error;
    }
};

// Функция для изменения роли пользователя
export const setUserRole = async (
    userId: string,
    newRole: 'registered' | 'owner' | 'moderator' | 'admin'
) => {
    try {
        const setUserRoleFunction = httpsCallable(functions, 'setUserRole');
        const result = await setUserRoleFunction({
            userId,
            newRole
        });

        return result.data;
    } catch (error) {
        console.error('Ошибка при изменении роли пользователя:', error);
        throw error;
    }
};