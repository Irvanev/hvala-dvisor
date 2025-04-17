// src/firebase/storageService.ts
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, storage } from './config'; // Импортируем напрямую из config

/**
 * Загружает файл изображения в Firebase Storage
 * @param file Файл для загрузки
 * @param path Путь в хранилище (напр. 'avatars/userId')
 * @returns URL загруженного файла
 */
export const uploadImage = async (file: File, path: string): Promise<string> => {
  try {
    // Создаем уникальное имя файла с меткой времени
    const timestamp = new Date().getTime();
    const fileExtension = file.name.split('.').pop();
    const fileName = `${timestamp}.${fileExtension}`;
    const fullPath = `${path}/${fileName}`;
    
    // Создаем ссылку на место в Storage
    const storageRef = ref(storage, fullPath);
    
    // Загружаем файл
    const snapshot = await uploadBytes(storageRef, file);
    
    // Получаем URL загруженного файла
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error('Ошибка при загрузке изображения:', error);
    throw error;
  }
};

// Экспортируем storage напрямую, если это необходимо
export { storage };