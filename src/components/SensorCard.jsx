import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import TemperatureGif from './TemperatureGif';

const SensorCard = ({ title, temperature, humidity }) => {
    // Determinar color basado en temperatura
    // 🟢 18–26°C
    // 🟡 advertencia (fuera de rango pero cerca? El prompt dice "advertencia" y "peligro" sin especificar rango exacto de advertencia vs peligro, 
    // pero dice "18-26" es verde. Asumiremos <18 o >26 es amarillo, y extremos rojo.
    // Vamos a definir: 
    // Verde: 18-26
    // Amarillo: 15-18 o 26-30
    // Rojo: <15 o >30

    let statusColor = '#4CAF50'; // Verde
    let statusText = 'Normal';

    if (temperature < 18 || temperature > 26) {
        if (temperature < 15 || temperature > 30) {
            statusColor = '#F44336'; // Rojo
            statusText = 'Peligro';
        } else {
            statusColor = '#FFC107'; // Amarillo
            statusText = 'Advertencia';
        }
    }

    return (
        <View style={[styles.card, { borderLeftColor: statusColor }]}>
            <View style={styles.header}>
                <Text style={styles.title}>{title}</Text>
                <View style={[styles.badge, { backgroundColor: statusColor }]}>
                    <Text style={styles.badgeText}>{statusText}</Text>
                </View>
            </View>

            <View style={styles.contentContainer}>
                <View style={styles.gifContainer}>
                    <TemperatureGif temperature={temperature} size={80} />
                </View>

                <View style={styles.dataContainer}>
                    <View style={styles.dataItem}>
                        <Text style={styles.label}>Temperatura</Text>
                        <Text style={[styles.value, { color: statusColor }]}>
                            {temperature !== undefined ? `${temperature}°C` : '--'}
                        </Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.dataItem}>
                        <Text style={styles.label}>Humedad</Text>
                        <Text style={styles.value}>
                            {humidity !== undefined ? `${humidity}%` : '--'}
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        borderLeftWidth: 6,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    contentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    gifContainer: {
        marginRight: 16,
    },
    dataContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    dataItem: {
        alignItems: 'center',
    },
    label: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    value: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    divider: {
        width: 1,
        height: '80%',
        backgroundColor: '#eee',
    },
});

export default SensorCard;
