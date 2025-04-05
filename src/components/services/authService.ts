// src/services/authService.ts
import { auth, db } from '../../firebase/config';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  updateEmail,
  updatePassword,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

// Сервис аутентификации
const authService = {
  // Регистрация нового пользователя по email и паролю
  async registerWithEmail(email: string, password: string, displayName: string): Promise<FirebaseUser> {
    try {
      // Создаем пользователя в Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Обновляем профиль пользователя
      await updateProfile(user, { displayName });
      
      // Создаем документ пользователя в Firestore
      await setDoc(doc(db, 'Users', user.uid), {
        email: user.email,
        displayName: displayName,
        photoURL: user.photoURL || '',
        role: 'user', // По умолчанию обычный пользователь
        timestamps: {
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        },
        favorites: [],
        settings: {}
      });
      
      return user;
    } catch (error) {
      throw error;
    }
  },
  
  // Вход по email и паролю
  async loginWithEmail(email: string, password: string): Promise<FirebaseUser> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  },
  
  // Вход через Google
  async loginWithGoogle(): Promise<FirebaseUser> {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;
      
      // Проверяем, существует ли уже документ пользователя
      const userDoc = await getDoc(doc(db, 'Users', user.uid));
      
      if (!userDoc.exists()) {
        // Если пользователь входит впервые, создаем его документ в Firestore
        await setDoc(doc(db, 'Users', user.uid), {
          email: user.email,
          displayName: user.displayName || '',
          photoURL: user.photoURL || '',
          role: 'user',
          timestamps: {
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          },
          favorites: [],
          settings: {}
        });
      }
      
      return user;
    } catch (error) {
      throw error;
    }
  },
  
  // Вход через Facebook
  async loginWithFacebook(): Promise<FirebaseUser> {
    try {
      const provider = new FacebookAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;
      
      // Проверяем, существует ли уже документ пользователя
      const userDoc = await getDoc(doc(db, 'Users', user.uid));
      
      if (!userDoc.exists()) {
        // Если пользователь входит впервые, создаем его документ в Firestore
        await setDoc(doc(db, 'Users', user.uid), {
          email: user.email,
          displayName: user.displayName || '',
          photoURL: user.photoURL || '',
          role: 'user',
          timestamps: {
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          },
          favorites: [],
          settings: {}
        });
      }
      
      return user;
    } catch (error) {
      throw error;
    }
  },
  
  // Выход из аккаунта
  async logout(): Promise<boolean> {
    try {
      await signOut(auth);
      return true;
    } catch (error) {
      throw error;
    }
  },
  
  // Сброс пароля
  async resetPassword(email: string): Promise<boolean> {
    try {
      await sendPasswordResetEmail(auth, email);
      return true;
    } catch (error) {
      throw error;
    }
  },
  
  // Обновление профиля пользователя
  async updateUserProfile(displayName: string, photoURL: string): Promise<boolean> {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Пользователь не авторизован');
      
      await updateProfile(user, { displayName, photoURL });
      
      // Обновляем информацию в Firestore
      await setDoc(doc(db, 'Users', user.uid), {
        displayName,
        photoURL,
        'timestamps.updatedAt': serverTimestamp()
      }, { merge: true });
      
      return true;
    } catch (error) {
      throw error;
    }
  },
  
  // Обновление email пользователя
  async updateUserEmail(newEmail: string): Promise<boolean> {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Пользователь не авторизован');
      
      await updateEmail(user, newEmail);
      
      // Обновляем информацию в Firestore
      await setDoc(doc(db, 'Users', user.uid), {
        email: newEmail,
        'timestamps.updatedAt': serverTimestamp()
      }, { merge: true });
      
      return true;
    } catch (error) {
      throw error;
    }
  },
  
  // Обновление пароля пользователя
  async updateUserPassword(newPassword: string): Promise<boolean> {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Пользователь не авторизован');
      
      await updatePassword(user, newPassword);
      return true;
    } catch (error) {
      throw error;
    }
  },
  
  // Получение текущего пользователя
  getCurrentUser(): FirebaseUser | null {
    return auth.currentUser;
  },
  
  // Проверка, является ли пользователь администратором
  async isAdmin(uid: string): Promise<boolean> {
    try {
      const userDoc = await getDoc(doc(db, 'Users', uid));
      if (!userDoc.exists()) return false;
      
      const userData = userDoc.data();
      return userData.role === 'admin';
    } catch (error) {
      throw error;
    }
  }
};

export default authService;