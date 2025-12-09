import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const screenWidth = Dimensions.get('window').width;

const WeatherPrediction = ({ data }) => {
    if (!data || data.length === 0) {
        return (
            <View style={styles.card}>
                <Text style={styles.title}>Tendencia Climática (3 Días)</Text>
                <Text style={styles.noData}>Recopilando datos históricos...</Text>
            </View>
        );
    }

    const processBlock = (startHour, endHour, label, icon) => {
        const blockData = data.filter(item => {
            const hour = parseInt(item.fecha.split(' ')[1].substring(0, 2), 10);
            const minute = parseInt(item.fecha.split(' ')[1].substring(3, 5), 10);
            const time = hour + minute / 60;
            return time >= startHour && time < endHour;
        });

        if (blockData.length === 0) return { label, icon, status: "Sin datos", color: "#999", details: null };

        const temps = blockData.map(d => d.temperatura);
        const avg = temps.reduce((a, b) => a + b, 0) / temps.length;

        // Count occurrences
        let cold = 0, comfort = 0, hot = 0;
        temps.forEach(t => {
            if (t < 18) cold++;
            else if (t <= 26) comfort++;
            else hot++;
        });

        const total = temps.length;
        const pCold = Math.round((cold / total) * 100);
        const pComfort = Math.round((comfort / total) * 100);
        const pHot = Math.round((hot / total) * 100);

        // Determine dominant
        let status = "Confortable";
        let color = "#4CAF50"; // Green
        let mainIcon = "happy-outline";

        if (pCold > pComfort && pCold > pHot) {
            status = "Frío";
            color = "#2196F3"; // Blue
            mainIcon = "snow-outline";
        } else if (pHot > pComfort && pHot > pCold) {
            status = "Caluroso";
            color = "#FF5722"; // Orange
            mainIcon = "sunny-outline";
        }

        return {
            label,
            icon,
            status,
            color,
            mainIcon,
            avg: avg.toFixed(1),
            details: { pCold, pComfort, pHot }
        };
    };

    // Blocks: 5am-11am (Morning), 12pm-6:30pm (Afternoon), 6:30pm-End (Night)
    // Using decimal hours: 5, 11, 12, 18.5
    // Note: User said "5am a 11am", "12 a 6:30", "luego en la noche"
    // Gap between 11 and 12? I'll assume 11-12 is part of morning or just ignore? 
    // Let's cover the gaps to be safe or strictly follow. 
    // Strict: 5-11, 12-18.5, 18.5-24. 

    const morning = processBlock(5, 11, "Mañana (5-11am)", "partly-sunny");
    const afternoon = processBlock(12, 18.5, "Tarde (12-6:30pm)", "sunny");
    const night = processBlock(18.5, 24, "Noche (6:30pm+)", "moon");

    const PredictionRow = ({ item }) => (
        <View style={styles.row}>
            <View style={styles.header}>
                <Ionicons name={item.icon} size={24} color="#555" />
                <Text style={styles.blockLabel}>{item.label}</Text>
            </View>

            <View style={styles.statusContainer}>
                {item.status === "Sin datos" ? (
                    <Text style={styles.noDataText}>Sin información</Text>
                ) : (
                    <View style={styles.predictionContent}>
                        <View style={styles.mainStatus}>
                            <Ionicons name={item.mainIcon} size={28} color={item.color} />
                            <View>
                                <Text style={[styles.statusText, { color: item.color }]}>{item.status}</Text>
                                <Text style={styles.avgText}>{item.avg}°C Prom.</Text>
                            </View>
                        </View>
                        <View style={styles.percentages}>
                            {item.details.pCold > 0 && <Text style={styles.pTextBlue}>{item.details.pCold}% Frío</Text>}
                            {item.details.pComfort > 0 && <Text style={styles.pTextGreen}>{item.details.pComfort}% Confort</Text>}
                            {item.details.pHot > 0 && <Text style={styles.pTextOrange}>{item.details.pHot}% Calor</Text>}
                        </View>
                    </View>
                )}
            </View>
        </View>
    );

    return (
        <View style={styles.card}>
            <Text style={styles.title}>Tendencia Climática (3 Días)</Text>
            <Text style={styles.subtitle}>Basado en comportamiento reciente</Text>
            <PredictionRow item={morning} />
            <View style={styles.divider} />
            <PredictionRow item={afternoon} />
            <View style={styles.divider} />
            <PredictionRow item={night} />
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
        textAlign: 'center',
    },
    noData: {
        textAlign: 'center',
        color: '#999',
        fontStyle: 'italic',
    },
    row: {
        marginBottom: 12,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    blockLabel: {
        marginLeft: 8,
        fontSize: 16,
        fontWeight: '600',
        color: '#444',
    },
    statusContainer: {
        paddingLeft: 32,
    },
    noDataText: {
        color: '#999',
        fontStyle: 'italic',
        fontSize: 14,
    },
    predictionContent: {

    },
    mainStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    statusText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    avgText: {
        fontSize: 12,
        color: '#777',
        marginLeft: 8,
    },
    percentages: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    pTextBlue: { color: '#2196F3', fontSize: 12, fontWeight: '500' },
    pTextGreen: { color: '#4CAF50', fontSize: 12, fontWeight: '500' },
    pTextOrange: { color: '#FF5722', fontSize: 12, fontWeight: '500' },
    divider: {
        height: 1,
        backgroundColor: '#eee',
        marginVertical: 12,
        marginLeft: 32,
    },
    subtitle: {
        textAlign: 'center',
        fontSize: 12,
        color: '#888',
        marginBottom: 12,
        fontStyle: 'italic'
    }
});

export default WeatherPrediction;
