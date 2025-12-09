import { database, ref, onValue, query, orderByChild, startAt, endAt, get, limitToLast } from '../config/firebaseConfig';

// Referencias base
const SENSOR1_REF = 'casa_concurso/sensor1';
const SENSOR2_REF = 'casa_concurso/sensor2';

/**
 * Escucha cambios en tiempo real para un sensor
 * @param {string} sensorId 'sensor1' o 'sensor2'
 * @param {function} callback Función que recibe los datos { temperatura, humedad }
 * @returns {function} Función para desuscribirse
 */
export const listenToSensor = (sensorId, callback) => {
    const path = `casa_concurso/${sensorId}/actual`;
    const sensorRef = ref(database, path);

    const unsubscribe = onValue(sensorRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            callback(data);
        }
    });

    return unsubscribe;
};

/**
 * Obtiene el historial de un sensor con filtros
 * NOTA: Se ha modificado para filtrar en el cliente y evitar el error "Index not defined".
 * En producción con muchos datos, se DEBE agregar la regla ".indexOn": "fecha" en Firebase
 * y volver a usar orderByChild.
 * @param {string} sensorId 'sensor1' o 'sensor2'
 * @param {string} filter 'today', 'week', 'month'
 * @returns {Promise<Array>} Lista de registros ordenada por fecha descendente
 */
export const getSensorHistory = async (sensorId, filter = 'today') => {
    const path = `casa_concurso/${sensorId}/historial`;
    const historyRef = ref(database, path);

    // SOLUCIÓN TEMPORAL: Traer últimos 500 registros y filtrar en cliente
    // Esto evita el error de índice sin configurar Firebase Console
    const q = query(historyRef, limitToLast(500));

    try {
        const snapshot = await get(q);
        if (snapshot.exists()) {
            const data = snapshot.val();
            let list = Object.keys(data).map(key => ({
                id: key,
                ...data[key]
            }));

            // Filtrado Cliente
            const now = new Date();
            let startDate = new Date();
            if (filter === 'today') startDate.setHours(0, 0, 0, 0);
            else if (filter === 'week') startDate.setDate(now.getDate() - 7);
            else if (filter === 'month') startDate.setMonth(now.getMonth() - 1);

            list = list.filter(item => new Date(item.fecha) >= startDate);

            // Ordenar descendente
            return list.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        }
        return [];
    } catch (error) {
        console.error("Error fetching history:", error);
        return [];
    }
};

/**
 * Obtiene datos para comparar dos fechas con rango de hora
 * @param {string} date1 YYYY-MM-DD
 * @param {string} date2 YYYY-MM-DD
 * @param {string} startTime HH:mm
 * @param {string} endTime HH:mm
 * @returns {Promise<Object>} Datos de ambos días para ambos sensores
 */
export const getComparisonData = async (date1, date2, startTime = '00:00', endTime = '23:59') => {
    const fetchDay = async (sensorId, dateStr) => {
        const path = `casa_concurso/${sensorId}/historial`;
        const historyRef = ref(database, path);

        // Aumentamos el límite para intentar capturar más datos
        const q = query(historyRef, limitToLast(2000));

        const snapshot = await get(q);
        if (snapshot.exists()) {
            const data = snapshot.val();
            const list = Object.values(data);
            // Filtrar por el día y hora específicos
            return list.filter(item => {
                if (!item.fecha) return false;
                const [itemDate, itemTime] = item.fecha.split(' ');
                if (itemDate !== dateStr) return false;

                if (!itemTime) return false;
                const time = itemTime.substring(0, 5);
                return time >= startTime && time <= endTime;
            });
        }
        return [];
    };

    const [s1d1, s1d2, s2d1, s2d2] = await Promise.all([
        fetchDay('sensor1', date1),
        fetchDay('sensor1', date2),
        fetchDay('sensor2', date1),
        fetchDay('sensor2', date2)
    ]);

    return {
        date1: { sensor1: s1d1, sensor2: s2d1 },
        date2: { sensor1: s1d2, sensor2: s2d2 }
    };
};

/**
 * Obtiene datos de ambos sensores filtrados por fecha y rango de hora
 * @param {string} dateStr YYYY-MM-DD
 * @param {string} startTime HH:mm
 * @param {string} endTime HH:mm
 * @returns {Promise<Object>} Datos filtrados { sensor1: [], sensor2: [] }
 */
export const getDataByTimeRange = async (dateStr, startTime, endTime) => {
    const fetchDay = async (sensorId) => {
        const path = `casa_concurso/${sensorId}/historial`;
        const historyRef = ref(database, path);
        // Traemos un lote grande para asegurar que encontramos los datos
        const q = query(historyRef, limitToLast(2000));

        const snapshot = await get(q);
        if (snapshot.exists()) {
            const data = snapshot.val();
            const list = Object.values(data);

            // Filtrar por fecha y hora
            return list.filter(item => {
                if (!item.fecha) return false;
                // item.fecha formato esperado: "YYYY-MM-DD HH:mm:ss"
                const [itemDate, itemTime] = item.fecha.split(' ');
                if (itemDate !== dateStr) return false;

                // Comparar horas
                // itemTime es HH:mm:ss, startTime/endTime son HH:mm
                if (!itemTime) return false;
                const time = itemTime.substring(0, 5);
                return time >= startTime && time <= endTime;
            });
        }
        return [];
    };

    const [s1, s2] = await Promise.all([
        fetchDay('sensor1'),
        fetchDay('sensor2')
    ]);

    return { sensor1: s1, sensor2: s2 };
};
