// Firebase configuration and helper for Firestore order saving and shared data
const firebaseConfig = {
  apiKey: "AIzaSyCPtYHWnHBCaiTo2JQ9q6JSTjhu6c8keR4",
  authDomain: "web-viejito-john-20260720-01.firebaseapp.com",
  projectId: "web-viejito-john-20260720-01",
  storageBucket: "web-viejito-john-20260720-01.appspot.com",
  messagingSenderId: "283865432886",
  appId: "1:283865432886:web:1f6588bd489fb229be2997"
};

let db = null;

try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    console.log('Firebase inicializado correctamente.');
} catch (error) {
    console.warn('No se pudo inicializar Firebase:', error);
}

window.saveOrder = function(order) {
    if (!db) {
        console.warn('Firestore no está disponible. Pedido no guardado en la base de datos.');
        return Promise.resolve(null);
    }
    return db.collection('orders').add(order);
};

window.loadCollection = async function(collectionName) {
    if (!db) {
        console.warn('Firestore no está disponible. No se pueden cargar datos de', collectionName);
        return [];
    }

    try {
        const snapshot = await db.collection(collectionName).get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.warn('Error cargando colección', collectionName, error);
        return [];
    }
};

window.saveCollectionDocs = async function(collectionName, items) {
    if (!db) {
        console.warn('Firestore no está disponible. No se pueden guardar datos en', collectionName);
        return Promise.resolve(null);
    }

    const batch = db.batch();
    items.forEach(item => {
        if (!item.id) return;
        const docRef = db.collection(collectionName).doc(item.id);
        batch.set(docRef, item, { merge: true });
    });

    try {
        return batch.commit();
    } catch (error) {
        console.warn('Error guardando colección', collectionName, error);
        return null;
    }
};

window.isFirebaseReady = function() {
    return !!db;
};


