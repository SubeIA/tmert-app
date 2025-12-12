import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

interface CreateUserData {
  email: string;
  password: string;
  name: string;
  role?: 'admin' | 'evaluator' | 'viewer';
  companyIds?: string[];
}

interface UpdateUserData {
  userId: string;
  name?: string;
  role?: 'admin' | 'evaluator' | 'viewer';
  companyIds?: string[];
}

export const createUser = functions.https.onCall(
  async (data: CreateUserData, context: functions.https.CallableContext) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'Debes estar autenticado para crear usuarios'
      );
    }

    const callerDoc = await admin.firestore().collection('users').doc(context.auth.uid).get();

    const callerRole = callerDoc.data()?.role;
    if (callerRole !== 'admin') {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Solo administradores pueden crear usuarios'
      );
    }

    if (!data.email || !data.password || !data.name) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Email, contraseña y nombre son requeridos'
      );
    }

    try {
      const userRecord = await admin.auth().createUser({
        email: data.email,
        password: data.password,
        displayName: data.name,
      });

      await admin
        .firestore()
        .collection('users')
        .doc(userRecord.uid)
        .set({
          id: userRecord.uid,
          email: data.email,
          name: data.name,
          role: data.role || 'evaluator',
          companyIds: data.companyIds || [],
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

      await admin.auth().setCustomUserClaims(userRecord.uid, {
        role: data.role || 'evaluator',
      });

      if (data.companyIds && data.companyIds.length > 0) {
        const batch = admin.firestore().batch();

        data.companyIds.forEach(companyId => {
          const companyRef = admin.firestore().collection('companies').doc(companyId);
          batch.update(companyRef, {
            evaluatorIds: admin.firestore.FieldValue.arrayUnion(userRecord.uid),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        });

        await batch.commit();
      }

      return {
        success: true,
        userId: userRecord.uid,
        message: 'Usuario creado exitosamente',
      };
    } catch (error: any) {
      console.error('Error creating user:', error);
      throw new functions.https.HttpsError('internal', error.message || 'Error al crear usuario');
    }
  }
);

export const updateUser = functions.https.onCall(
  async (data: UpdateUserData, context: functions.https.CallableContext) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'Debes estar autenticado para actualizar usuarios'
      );
    }

    const callerDoc = await admin.firestore().collection('users').doc(context.auth.uid).get();

    const callerRole = callerDoc.data()?.role;
    if (callerRole !== 'admin') {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Solo administradores pueden actualizar usuarios'
      );
    }

    if (!data.userId) {
      throw new functions.https.HttpsError('invalid-argument', 'ID de usuario es requerido');
    }

    try {
      const updates: any = {
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      if (data.name) {
        updates.name = data.name;
        await admin.auth().updateUser(data.userId, {
          displayName: data.name,
        });
      }

      if (data.role) {
        updates.role = data.role;
        await admin.auth().setCustomUserClaims(data.userId, {
          role: data.role,
        });
      }

      if (data.companyIds !== undefined) {
        updates.companyIds = data.companyIds;
      }

      await admin.firestore().collection('users').doc(data.userId).update(updates);

      return {
        success: true,
        message: 'Usuario actualizado exitosamente',
      };
    } catch (error: any) {
      console.error('Error updating user:', error);
      throw new functions.https.HttpsError(
        'internal',
        error.message || 'Error al actualizar usuario'
      );
    }
  }
);

export const deleteUser = functions.https.onCall(
  async (data: { userId: string }, context: functions.https.CallableContext) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'Debes estar autenticado para eliminar usuarios'
      );
    }

    const callerDoc = await admin.firestore().collection('users').doc(context.auth.uid).get();

    const callerRole = callerDoc.data()?.role;
    if (callerRole !== 'admin') {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Solo administradores pueden eliminar usuarios'
      );
    }

    if (data.userId === context.auth.uid) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'No puedes eliminar tu propia cuenta'
      );
    }

    try {
      const userDoc = await admin.firestore().collection('users').doc(data.userId).get();

      const userData = userDoc.data();

      if (userData?.companyIds && userData.companyIds.length > 0) {
        const batch = admin.firestore().batch();

        userData.companyIds.forEach((companyId: string) => {
          const companyRef = admin.firestore().collection('companies').doc(companyId);
          batch.update(companyRef, {
            evaluatorIds: admin.firestore.FieldValue.arrayRemove(data.userId),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        });

        await batch.commit();
      }

      await admin.firestore().collection('users').doc(data.userId).delete();

      await admin.auth().deleteUser(data.userId);

      return {
        success: true,
        message: 'Usuario eliminado exitosamente',
      };
    } catch (error: any) {
      console.error('Error deleting user:', error);
      throw new functions.https.HttpsError(
        'internal',
        error.message || 'Error al eliminar usuario'
      );
    }
  }
);
