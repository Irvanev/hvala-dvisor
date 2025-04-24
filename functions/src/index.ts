// functions/src/index.ts
import {onCall, onRequest} from "firebase-functions/v2/https";
import {onDocumentUpdated} from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";

admin.initializeApp();

type UserRole = "guest" | "registered" | "owner" | "moderator" | "admin";

interface ModerationActionData {
  restaurantId: string;
  status: "approved" | "rejected" | "pending";
  comments?: string;
}

interface UserRoleData {
  userId: string;
  newRole: UserRole;
}

interface Restaurant {
  id: string;
  ownerId: string;
  title: string;
  moderation: {
    status: "pending" | "approved" | "rejected";
    moderatorId?: string;
    reviewedAt?: admin.firestore.Timestamp;
    rejectionReason?: string;
    contactPerson?: {
      name: string;
      email: string;
      phone: string;
      isOwner: boolean;
    };
  };
}

// Функция для установки роли пользователя (только для администраторов)
export const setUserRole = onCall(
  {
    timeoutSeconds: 60,
    region: "us-central1",
  },
  async (request) => {
    const data = request.data as UserRoleData;
    const auth = request.auth;

    // Проверяем, авторизован ли вызывающий пользователь
    if (!auth) {
      throw new Error("Необходимо авторизоваться для выполнения этой операции");
    }

    // Получаем ID пользователя, вызвавшего функцию
    const callerId = auth.uid;

    // Получаем данные пользователя из Firestore
    const callerRef = admin.firestore().collection("users").doc(callerId);
    const callerDoc = await callerRef.get();

    // Проверяем, является ли пользователь администратором
    if (!callerDoc.exists || callerDoc.data()?.role !== "admin") {
      throw new Error(
        "Только администраторы могут изменять роли пользователей",
      );
    }

    // Проверяем входные данные
    const {userId, newRole} = data;
    if (!userId || !newRole) {
      throw new Error("Необходимо указать ID пользователя и новую роль");
    }

    // Проверяем валидность роли
    const validRoles: UserRole[] = [
      "registered",
      "owner",
      "moderator",
      "admin",
    ];
    if (!validRoles.includes(newRole)) {
      throw new Error("Указана некорректная роль");
    }

    try {
      // Получаем ссылку на пользователя
      const userRef = admin.firestore().collection("users").doc(userId);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        throw new Error("Пользователь не найден");
      }

      // Обновляем роль в Firestore
      await userRef.update({
        role: newRole,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Обновляем custom claims пользователя
      await admin.auth().setCustomUserClaims(userId, {role: newRole});

      return {
        success: true,
        message: `Роль пользователя изменена на ${newRole}`,
      };
    } catch (error) {
      console.error("Ошибка при изменении роли пользователя:", error);
      throw new Error("Ошибка при изменении роли пользователя");
    }
  },
);

// Функция для модерации ресторана
export const moderateRestaurant = onCall(
  {
    timeoutSeconds: 60,
    region: "us-central1",
  },
  async (request) => {
    const data = request.data as ModerationActionData;
    const auth = request.auth;

    // Проверяем авторизацию
    if (!auth) {
      throw new Error("Необходимо авторизоваться для выполнения этой операции");
    }

    // Получаем ID пользователя, вызвавшего функцию
    const callerId = auth.uid;

    // Получаем данные пользователя из Firestore
    const callerRef = admin.firestore().collection("users").doc(callerId);
    const callerDoc = await callerRef.get();

    // Проверяем права на модерацию
    if (
      !callerDoc.exists ||
      (callerDoc.data()?.role !== "moderator" &&
        callerDoc.data()?.role !== "admin")
    ) {
      throw new Error(
        "Только модераторы и администраторы могут модерировать рестораны",
      );
    }

    // Проверяем входные данные
    const {restaurantId, status, comments} = data;
    if (!restaurantId || !status) {
      throw new Error("Необходимо указать ID ресторана и статус модерации");
    }

    // Проверяем валидность статуса
    const validStatuses = ["approved", "rejected", "pending"];
    if (!validStatuses.includes(status)) {
      throw new Error("Указан некорректный статус модерации");
    }

    try {
      // Получаем ссылку на ресторан
      const restaurantRef = admin
        .firestore()
        .collection("restaurants")
        .doc(restaurantId);
      const restaurantDoc = await restaurantRef.get();

      if (!restaurantDoc.exists) {
        throw new Error("Ресторан не найден");
      }

      // Получаем текущие данные ресторана
      const restaurantData = restaurantDoc.data() as Restaurant;

      // Обновляем информацию о модерации
      await restaurantRef.update({
        "moderation.status": status,
        "moderation.rejectionReason": comments || "",
        "moderation.moderatorId": callerId,
        "moderation.reviewedAt": admin.firestore.FieldValue.serverTimestamp(),
        "updatedAt": admin.firestore.FieldValue.serverTimestamp(),
      });

      // Если ресторан одобрен и у него есть владелец, обновляем его роль
      if (
        status === "approved" &&
        restaurantData?.ownerId &&
        restaurantData.ownerId !== "guest"
      ) {
        const ownerRef = admin
          .firestore()
          .collection("users")
          .doc(restaurantData.ownerId);
        const ownerDoc = await ownerRef.get();

        if (ownerDoc.exists) {
          const ownerData = ownerDoc.data();

          // Если пользователь еще не является владельцем ресторана, обновляем его роль
          if (ownerData?.role === "registered") {
            // Обновляем роль в Firestore
            await ownerRef.update({
              role: "owner",
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });

            // Обновляем custom claims
            await admin
              .auth()
              .setCustomUserClaims(restaurantData.ownerId, {role: "owner"});
          }
        }
      }

      // Отправляем
      //  уведомление
      //  контактному лицу
      if (restaurantData.moderation?.contactPerson?.email) {
        // Здесь можно реализовать отправку уведомления по email
        console.log(`Статус ресторана ${restaurantId} изменен на ${status}`);
        console.log(
          `Необходимо отправить уведомление на email: ${restaurantData.moderation.contactPerson.email}`,
        );
      }

      return {
        success: true,
        message: `Статус ресторана изменен на ${status}`,
      };
    } catch (error) {
      console.error("Ошибка при модерации ресторана:", error);
      throw new Error("Ошибка при модерации ресторана");
    }
  },
);

// Функция для создания первого администратора (запускается один раз при настройке системы)
export const createInitialAdmin = onRequest(
  {
    region: "us-central1",
  },
  async (req, res) => {
    // Проверка секретного ключа для безопасности
    const secretKey = req.query.key;
    const expectedKey = process.env.ADMIN_SECRET_KEY || "default-secret-key";

    if (secretKey !== expectedKey) {
      res.status(403).send("Доступ запрещен. Неверный ключ.");
      return;
    }

    // Получаем email пользователя, которого нужно сделать администратором
    const email = req.query.email;
    if (!email) {
      res.status(400).send("Необходимо указать email пользователя");
      return;
    }

    try {
      // Проверяем, есть ли уже администраторы в системе
      const adminQuery = await admin
        .firestore()
        .collection("users")
        .where("role", "==", "admin")
        .limit(1)
        .get();

      if (!adminQuery.empty) {
        res
          .status(400)
          .send(
            "Администратор уже существует. Используйте панель администратора для создания новых администраторов.",
          );
        return;
      }

      // Ищем пользователя по email
      const userRecord = await admin.auth().getUserByEmail(email as string);

      // Обновляем custom claims
      await admin.auth().setCustomUserClaims(userRecord.uid, {role: "admin"});

      // Обновляем документ пользователя в Firestore
      await admin.firestore().collection("users").doc(userRecord.uid).update({
        role: "admin",
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      res.status(200).send(`Пользователь ${email} назначен администратором`);
    } catch (error) {
      console.error("Ошибка при создании администратора:", error);
      res.status(500).send(`Ошибка: ${error}`);
    }
  },
);

// Триггер для отправки уведомлений при изменении статуса ресторана
// Триггер для отправки уведомлений при изменении статуса ресторана
export const restaurantStatusChanged = onDocumentUpdated(
  {
    document: "restaurants/{restaurantId}",
    region: "us-central1",
  },
  async (event) => {
    // Проверяем, что данные существуют
    if (!event.data) {
      console.log("Нет данных события");
      return null;
    }

    const newData = event.data.after.data() as Restaurant;
    const oldData = event.data.before.data() as Restaurant;
    const restaurantId = event.params.restaurantId;

    // Проверяем, изменился ли статус модерации
    if (
      newData.moderation?.status !== oldData.moderation?.status &&
      newData.moderation?.status !== "pending"
    ) {
      // Получаем контактный email
      const contactEmail = newData.moderation?.contactPerson?.email;

      if (contactEmail) {
        // Здесь можно реализовать отправку email уведомления
        // Или использовать Firebase Cloud Messaging для push-уведомлений

        console.log(
          `Статус ресторана ${restaurantId} изменен на ${newData.moderation.status}`,
        );
        console.log(
          `Необходимо отправить уведомление на email: ${contactEmail}`,
        );

        // Пример кода для создания уведомления в Firestore
        try {
          // Если есть ownerId, создаем уведомление для владельца
          if (newData.ownerId && newData.ownerId !== "guest") {
            await admin
              .firestore()
              .collection("notifications")
              .add({
                userId: newData.ownerId,
                title:
                  newData.moderation.status === "approved" ?
                    "Ваш ресторан одобрен" :
                    "Ваш ресторан отклонен",
                message:
                  newData.moderation.status === "approved" ?
                    `Ресторан "${newData.title}" был успешно одобрен и теперь отображается на сайте.` :
                    `Ресторан "${newData.title}" был отклонен. Причина: ${newData.moderation.rejectionReason || "Не указана"}`,
                type:
                  newData.moderation.status === "approved" ?
                    "restaurant_approved" :
                    "restaurant_rejected",
                relatedEntityId: restaurantId,
                isRead: false,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
              });
          }
        } catch (error) {
          console.error("Ошибка при создании уведомления:", error);
        }
      }
    }

    return null;
  },
);
