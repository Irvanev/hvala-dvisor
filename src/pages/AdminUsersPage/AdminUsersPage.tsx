// src/pages/AdminUsersPage/AdminUsersPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../../components/NavBar';
import Footer from '../../components/Footer/Footer';
import { useAuth } from '../../contexts/AuthContext';
import { 
  collection, 
  query, 
  getDocs, 
  doc, 
  getDoc
} from 'firebase/firestore';
import { firestore } from '../../firebase/config';
import { getFunctions, httpsCallable } from 'firebase/functions';
import styles from './AdminUsersPage.module.css';
import { UserRole } from '../../contexts/AuthContext';

interface UserData {
  id: string;
  uid: string;
  name?: string;
  email: string;
  role?: UserRole;
  createdAt?: any;
  updatedAt?: any;
  lastLoginAt?: any;
  reviewsCount?: number;
  likesCount?: number;
}

const AdminUsersPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<UserData[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [newRole, setNewRole] = useState<UserRole>('registered');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const functions = getFunctions();

  // Проверяем, имеет ли пользователь доступ к странице администратора
  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
    }
  }, [isAdmin, navigate]);

  // Загружаем список пользователей
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        
        const usersQuery = query(collection(firestore, 'users'));
        const querySnapshot = await getDocs(usersQuery);
        const usersData: UserData[] = [];
        
        querySnapshot.forEach((doc) => {
          usersData.push({
            id: doc.id,
            uid: doc.id,
            ...doc.data()
          } as UserData);
        });
        
        setUsers(usersData);
        setFilteredUsers(usersData);
        setError(null);
      } catch (err) {
        console.error('Ошибка при загрузке пользователей:', err);
        setError('Не удалось загрузить список пользователей. Пожалуйста, попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, []);

  // Фильтрация пользователей при изменении поискового запроса
  useEffect(() => {
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      const filtered = users.filter(user => 
        user.email.toLowerCase().includes(lowerCaseSearchTerm) ||
        (user.name && user.name.toLowerCase().includes(lowerCaseSearchTerm))
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchTerm, users]);

  // Функция выбора пользователя для редактирования
  const handleSelectUser = (user: UserData) => {
    setSelectedUser(user);
    setNewRole(user.role || 'registered');
  };

  // Функция изменения роли пользователя
  const handleChangeRole = async () => {
    if (!selectedUser) return;
    
    try {
      setIsSubmitting(true);
      
      // Вызываем Cloud Function для изменения роли пользователя
      const setUserRoleFunction = httpsCallable(functions, 'setUserRole');
      
      await setUserRoleFunction({
        userId: selectedUser.uid,
        newRole: newRole
      });
      
      // Обновляем локальный список пользователей
      const updatedUsers = users.map(user => 
        user.uid === selectedUser.uid ? { ...user, role: newRole } : user
      );
      
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers.filter(user => 
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase()))
      ));
      
      // Закрываем модальное окно
      setSelectedUser(null);
      
      // Показываем сообщение об успешном изменении роли
      alert(`Роль пользователя ${selectedUser.email} изменена на ${newRole}`);
    } catch (error) {
      console.error('Ошибка при изменении роли пользователя:', error);
      setError('Не удалось изменить роль пользователя. Пожалуйста, попробуйте позже.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Функция форматирования даты
  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Нет данных';
    
    let date;
    if (timestamp.seconds) {
      // Firebase Timestamp
      date = new Date(timestamp.seconds * 1000);
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else {
      return 'Некорректная дата';
    }
    
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Функция для отображения названия роли на русском
  const getRoleName = (role?: UserRole) => {
    switch (role) {
      case 'admin':
        return 'Администратор';
      case 'moderator':
        return 'Модератор';
      case 'owner':
        return 'Владелец ресторана';
      case 'registered':
        return 'Пользователь';
      case 'guest':
        return 'Гость';
      default:
        return 'Не определена';
    }
  };

  return (
    <div className={styles.adminPage}>
      <NavBar
        onSearch={(query) => console.log(`Поиск: ${query}`)}
        // onLanguageChange={(language) => console.log(`Язык: ${language}`)}
        // currentLanguage="ru"
        logoText="HvalaDviser"
        onWelcomeClick={() => console.log('Клик на Welcome')}
        isStatic={true}
      />

      <main className={styles.mainContent}>
        <div className={styles.container}>
          <h1 className={styles.pageTitle}>Управление пользователями</h1>
          
          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}

          {/* Поиск пользователей */}
          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="Поиск по email или имени"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          {/* Таблица пользователей */}
          <div className={styles.tableContainer}>
            {loading ? (
              <div className={styles.loadingSpinner}>Загрузка...</div>
            ) : filteredUsers.length === 0 ? (
              <p className={styles.emptyMessage}>Пользователи не найдены</p>
            ) : (
              <table className={styles.usersTable}>
                <thead>
                  <tr>
                    <th>Имя</th>
                    <th>Email</th>
                    <th>Роль</th>
                    <th>Дата регистрации</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.uid}>
                      <td>{user.name || 'Не указано'}</td>
                      <td>{user.email}</td>
                      <td className={styles.roleCell}>
                        <span className={`${styles.roleTag} ${styles[user.role || 'registered']}`}>
                          {getRoleName(user.role)}
                        </span>
                      </td>
                      <td>{formatDate(user.createdAt)}</td>
                      <td>
                        <button
                          className={styles.editButton}
                          onClick={() => handleSelectUser(user)}
                        >
                          Изменить роль
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      {/* Модальное окно изменения роли */}
      {selectedUser && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Изменение роли пользователя</h2>
              <button
                className={styles.closeButton}
                onClick={() => setSelectedUser(null)}
              >
                ✕
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.userInfo}>
                <p><strong>Имя:</strong> {selectedUser.name || 'Не указано'}</p>
                <p><strong>Email:</strong> {selectedUser.email}</p>
                <p><strong>Текущая роль:</strong> {getRoleName(selectedUser.role)}</p>
              </div>
              
              <div className={styles.roleSelection}>
                <label htmlFor="role-select">Выберите новую роль:</label>
                <select
                  id="role-select"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserRole)}
                  className={styles.roleSelect}
                >
                  <option value="registered">Пользователь</option>
                  <option value="owner">Владелец ресторана</option>
                  <option value="moderator">Модератор</option>
                  <option value="admin">Администратор</option>
                </select>
              </div>
              
              <div className={styles.warning}>
                <p>
                  <strong>Внимание!</strong> Изменение роли пользователя влияет на его права в системе.
                  Назначение роли "Администратор" предоставляет полный доступ ко всем функциям системы.
                </p>
              </div>
              
              <div className={styles.modalActions}>
                <button
                  className={styles.cancelButton}
                  onClick={() => setSelectedUser(null)}
                >
                  Отмена
                </button>
                <button
                  className={styles.saveButton}
                  onClick={handleChangeRole}
                  disabled={isSubmitting || selectedUser.role === newRole}
                >
                  {isSubmitting ? 'Сохранение...' : 'Сохранить'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default AdminUsersPage;