// Importar funciones del SDK modular de Firebase
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, query, orderByChild, startAt, endAt, get, limitToLast } from "firebase/database";

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDWJY-3KwB2RmNY0u6_eVbGLUTT4vKC-Eo",
    authDomain: "esp32-firebase-5fbc9.firebaseapp.com",
    databaseURL: "https://esp32-firebase-5fbc9-default-rtdb.firebaseio.com",
    projectId: "esp32-firebase-5fbc9",
    storageBucket: "esp32-firebase-5fbc9.firebasestorage.app",
    messagingSenderId: "646475352577",
    appId: "1:646475352577:web:18153dfd83b743403c0e00"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { app, database, ref, onValue, query, orderByChild, startAt, endAt, get, limitToLast };
