import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { getSensorHistory } from '../services/firebaseService';
import StatsBox from '../components/StatsBox';

const StatsScreen = () => {
    const [statsS1, setStatsS1] = useState(null);
    const [statsS2, setStatsS2] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        calculateStats();
    }, []);

    const calculateStats = async () => {
        setLoading(true);
        try {
            // Analizar datos de hoy
            const [h1, h2] = await Promise.all([
                getSensorHistory('sensor1', 'today'),
                getSensorHistory('sensor2', 'today')
            ]);

            setStatsS1(processData(h1));
            setStatsS2(processData(h2));
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const processData = (data) => {
        if (!data || data.length === 0) return null;

        const temps = data.map(d => d.temperatura);
        const hums = data.map(d => d.humedad);

        // Min/Max/Avg
        const minTemp = Math.min(...temps);
        const maxTemp = Math.max(...temps);
        const avgTemp = (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1);
        const avgHum = (hums.reduce((a, b) => a + b, 0) / hums.length).toFixed(1);

        // Eficiencia (18-26)
        const efficientCount = temps.filter(t => t >= 18 && t <= 26).length;
        const efficiency = ((efficientCount / temps.length) * 100).toFixed(0);

        // Inercia Térmica (Cambio promedio por hora)
        // Simplificado: (TempFinal - TempInicial) / HorasTotales
        // O promedio de cambios absolutos entre lecturas.
        // Vamos a usar promedio de cambios absolutos para ver volatilidad.
        let totalChange = 0;
        for (let i = 1; i < temps.length; i++) {
            totalChange += Math.abs(temps[i] - temps[i - 1]);
        }
        // Asumiendo lecturas regulares, esto es una medida de volatilidad.
        // Para "qué tan rápido cambia", mejor usar (Max - Min) / Tiempo?
        // El prompt dice "qué tan rápido cambia".
        // Vamos a dejarlo como un índice de volatilidad simple.
        const inertia = (totalChange / temps.length).toFixed(2);

        return {
            efficiency,
            inertia,
            avgTemp,
            minTemp,
            maxTemp,
            avgHum
        };
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Estadísticas de Hoy</Text>

            {loading ? (
                <ActivityIndicator size="large" color="#2196F3" />
            ) : (
                <>
                    <View style={styles.section}>
                        <Text style={styles.sensorTitle}>Sensor 1</Text>
                        {statsS1 ? <StatsBox stats={statsS1} /> : <Text>Sin datos hoy</Text>}
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sensorTitle}>Sensor 2</Text>
                        {statsS2 ? <StatsBox stats={statsS2} /> : <Text>Sin datos hoy</Text>}
                    </View>
                </>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 16,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
        textAlign: 'center',
    },
    section: {
        marginBottom: 24,
    },
    sensorTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#666',
        marginLeft: 4,
    },
});

export default StatsScreen;
