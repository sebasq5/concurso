import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Vibration, Alert, ActivityIndicator } from 'react-native';
import { listenToSensor, getDataByTimeRange } from '../services/firebaseService';
import SensorCard from '../components/SensorCard';
import ChartLive from '../components/ChartLive';
import WeatherPrediction from '../components/WeatherPrediction';

const MonitorScreen = () => {
    const [sensor1Data, setSensor1Data] = useState({ temperatura: 0, humedad: 0 });
    const [sensor2Data, setSensor2Data] = useState({ temperatura: 0, humedad: 0 });
    const [sensor1History, setSensor1History] = useState([]);
    const [sensor2History, setSensor2History] = useState([]);

    // Full history for prediction (today)
    const [predictionData, setPredictionData] = useState([]);
    const [loadingPrediction, setLoadingPrediction] = useState(true);

    // Alert state to prevent continuous vibration
    const [alertActive, setAlertActive] = useState(false);


    useEffect(() => {
        const handleData = (sensorId, data) => {
            const timestamp = new Date().toISOString();
            const point = { ...data, fecha: timestamp };

            if (sensorId === 'sensor1') {
                setSensor1Data(data);
                setSensor1History(prev => {
                    const newHistory = [...prev, point];
                    return newHistory.length > 20 ? newHistory.slice(-20) : newHistory;
                });
                checkAlert(data.temperatura, 'Sensor 1');
            } else {
                setSensor2Data(data);
                setSensor2History(prev => {
                    const newHistory = [...prev, point];
                    return newHistory.length > 20 ? newHistory.slice(-20) : newHistory;
                });
                checkAlert(data.temperatura, 'Sensor 2');
            }
        };

        const unsub1 = listenToSensor('sensor1', (data) => handleData('sensor1', data));
        const unsub2 = listenToSensor('sensor2', (data) => handleData('sensor2', data));

        // Fetch today's data for prediction (Sensor 1 as reference or both?)
        // Let's use Sensor 1 (Sala) as the main reference for "Weather"
        fetchPredictionData();

        return () => {
            unsub1();
            unsub2();
        };
    }, []);

    const fetchPredictionData = async () => {
        try {
            // Fetch last 3 days for better trend prediction
            const daysToFetch = 3;
            const promises = [];
            const today = new Date();

            for (let i = 0; i < daysToFetch; i++) {
                const d = new Date(today);
                d.setDate(today.getDate() - i);
                const dateStr = d.toISOString().split('T')[0];
                console.log("Fetching prediction data for:", dateStr); // Debug
                promises.push(getDataByTimeRange(dateStr, '00:00', '23:59'));
            }

            const results = await Promise.all(promises);
            // Combine all sensor1 data from the results
            const combinedData = results.flatMap(res => res.sensor1 || []);
            console.log("Total prediction points:", combinedData.length); // Debug
            setPredictionData(combinedData);
        } catch (error) {
            console.error("Error fetching prediction data:", error);
        } finally {
            setLoadingPrediction(false);
        }
    };

    const checkAlert = (temp, sensorName) => {
        // Rango seguro: 15-30
        // Peligro: <15 o >30 (Vibración)

        const isCritical = temp < 15 || temp > 30;

        if (isCritical) {
            if (!alertActive) {
                // First time entering critical zone
                // Vibrate for 5 seconds (5000ms)
                // Pattern: wait 0ms, vibrate 5000ms
                // Android accepts an array [0, 5000], iOS ignores duration in simple pattern
                Vibration.vibrate([0, 5000], false);
                setAlertActive(true);
            }
        } else {
            // Temperature back to normal
            if (alertActive) {
                setAlertActive(false);
                Vibration.cancel(); // Stop any ongoing vibration
            }
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.section}>
                {loadingPrediction ? (
                    <ActivityIndicator size="small" color="#2196F3" />
                ) : (
                    <WeatherPrediction data={predictionData} />
                )}
            </View>

            <View style={styles.section}>
                <SensorCard
                    title="Sensor 1 - Sala"
                    temperature={sensor1Data.temperatura}
                    humidity={sensor1Data.humedad}
                />
                <ChartLive data={sensor1History} title="Historial en Vivo - Sensor 1" />
            </View>

            <View style={styles.section}>
                <SensorCard
                    title="Sensor 2 - Habitación"
                    temperature={sensor2Data.temperatura}
                    humidity={sensor2Data.humedad}
                />
                <ChartLive data={sensor2History} title="Historial en Vivo - Sensor 2" />
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 16,
    },
    section: {
        marginBottom: 24,
    },
});

export default MonitorScreen;
