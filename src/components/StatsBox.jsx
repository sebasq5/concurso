import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const StatsBox = ({ stats }) => {
    if (!stats) return null;

    const { efficiency, inertia, avgTemp, minTemp, maxTemp, avgHum } = stats;

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Estadísticas</Text>

            <View style={styles.row}>
                <View style={styles.statItem}>
                    <Text style={styles.label}>Eficiencia Térmica</Text>
                    <Text style={styles.value}>{efficiency}%</Text>
                    <Text style={styles.subtext}>(18-26°C)</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.label}>Inercia Térmica</Text>
                    <Text style={styles.value}>{inertia}</Text>
                    <Text style={styles.subtext}>Cambio °C/h</Text>
                </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.grid}>
                <View style={styles.gridItem}>
                    <Text style={styles.gridLabel}>Promedio</Text>
                    <Text style={styles.gridValue}>{avgTemp}°C</Text>
                </View>
                <View style={styles.gridItem}>
                    <Text style={styles.gridLabel}>Mínimo</Text>
                    <Text style={styles.gridValue}>{minTemp}°C</Text>
                </View>
                <View style={styles.gridItem}>
                    <Text style={styles.gridLabel}>Máximo</Text>
                    <Text style={styles.gridValue}>{maxTemp}°C</Text>
                </View>
                <View style={styles.gridItem}>
                    <Text style={styles.gridLabel}>Humedad</Text>
                    <Text style={styles.gridValue}>{avgHum}%</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
    },
    header: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
        color: '#333',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        padding: 10,
        borderRadius: 8,
        marginHorizontal: 4,
    },
    label: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
    },
    value: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2196F3',
        marginVertical: 4,
    },
    subtext: {
        fontSize: 10,
        color: '#999',
    },
    divider: {
        height: 1,
        backgroundColor: '#eee',
        marginVertical: 12,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    gridItem: {
        width: '48%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    gridLabel: {
        fontSize: 14,
        color: '#666',
    },
    gridValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
    },
});

export default StatsBox;
