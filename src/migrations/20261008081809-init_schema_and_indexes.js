module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db) {
    // 1. Users collection indexes
    await db.collection('usermodels').createIndex({ email: 1 }, { unique: true });

    // 2. Doctors collection indexes
    await db.collection('doctormodels').createIndex({ email: 1 }, { unique: true });
    await db.collection('doctormodels').createIndex({ speciality: 1 });
    await db.collection('doctormodels').createIndex({ available: 1 });

    // 3. Appointments collection indexes
    await db.collection('appointmentmodels').createIndex({ userId: 1 });
    await db.collection('appointmentmodels').createIndex({ docId: 1 });
    await db.collection('appointmentmodels').createIndex({ slotDate: 1, slotTime: 1 });
  },

  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async down(db) {
    try {
      await db.collection('usermodels').dropIndex('email_1');
    } catch {
      // Ignore if index doesn't exist
    }

    try {
      await db.collection('doctormodels').dropIndex('email_1');
      await db.collection('doctormodels').dropIndex('speciality_1');
      await db.collection('doctormodels').dropIndex('available_1');
    } catch {
      // Ignore if index doesn't exist
    }

    try {
      await db.collection('appointmentmodels').dropIndex('userId_1');
      await db.collection('appointmentmodels').dropIndex('docId_1');
      await db.collection('appointmentmodels').dropIndex('slotDate_1_slotTime_1');
    } catch {
      // Ignore if index doesn't exist
    }
  },
};
