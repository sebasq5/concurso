import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { getSensorHistory } from '../services/firebaseService';

const HistoryScreen = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sensorFilter, setSensorFilter] = useState('sensor1'); // sensor1, sensor2, both
    const [dateFilter, setDateFilter] = useState('today'); // today, week, month

    useEffect(() => {
        loadHistory();
    }, [sensorFilter, dateFilter]);

    const loadHistory = async () => {
        setLoading(true);
        try {
            let data = [];
            if (sensorFilter === 'both') {
                const [h1, h2] = await Promise.all([
                    getSensorHistory('sensor1', dateFilter),
                    getSensorHistory('sensor2', dateFilter)
                ]);
                // Combinar y ordenar
                // Añadimos propiedad 'sensor' para distinguir
                const d1 = h1.map(i => ({ ...i, sensor: 'Sensor 1' }));
                const d2 = h2.map(i => ({ ...i, sensor: 'Sensor 2' }));
                data = [...d1, ...d2].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
            } else {
                const res = await getSensorHistory(sensorFilter, dateFilter);
                data = res.map(i => ({ ...i, sensor: sensorFilter === 'sensor1' ? 'Sensor 1' : 'Sensor 2' }));
            }
            setHistory(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.row}>
            <View style={styles.cellDate}>
                <Text style={styles.dateText}>{item.fecha}</Text>
                <Text style={styles.sensorText}>{item.sensor}</Text>
            </View>
            <View style={styles.cellData}>
                <Text style={styles.tempText}>{item.temperatura}°C</Text>
                <Text style={styles.humText}>{item.humedad}%</Text>
            </View>
        </View>
    );

    const FilterButton = ({ label, value, current, onPress }) => (
        <TouchableOpacity
            style={[styles.filterBtn, current === value && styles.filterBtnActive]}
            onPress={() => onPress(value)}
        >
            <Text style={[styles.filterText, current === value && styles.filterTextActive]}>{label}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.filters}>
                <Text style={styles.filterLabel}>Sensor:</Text>
                <View style={styles.filterGroup}>
                    <FilterButton label="S1" value="sensor1" current={sensorFilter} onPress={setSensorFilter} />
                    <FilterButton label="S2" value="sensor2" current={sensorFilter} onPress={setSensorFilter} />
                    <FilterButton label="Ambos" value="both" current={sensorFilter} onPress={setSensorFilter} />
                </View>

                <Text style={styles.filterLabel}>Fecha:</Text>
                <View style={styles.filterGroup}>
                    <FilterButton label="Hoy" value="today" current={dateFilter} onPress={setDateFilter} />
                    <FilterButton label="Semana" value="week" current={dateFilter} onPress={setDateFilter} />
                    <FilterButton label="Mes" value="month" current={dateFilter} onPress={setDateFilter} />
                </View>
            </View>

            <View style={styles.headerRow}>
                <Text style={styles.headerText}>Fecha / Sensor</Text>
                <Text style={styles.headerText}>Datos</Text>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#2196F3" style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={history}
                    renderItem={renderItem}
                    keyExtractor={(item, index) => item.id || index.toString()}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={<Text style={styles.empty}>No hay datos</Text>}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 16,
    },
    filters: {
        backgroundColor: 'white',
        padding: 12,
        borderRadius: 12,
        marginBottom: 16,
        elevation: 2,
    },
    filterLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 8,
        fontWeight: 'bold',
    },
    filterGroup: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    filterBtn: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        backgroundColor: '#eee',
        marginRight: 8,
    },
    filterBtnActive: {
        backgroundColor: '#2196F3',
    },
    filterText: {
        color: '#666',
        fontSize: 12,
    },
    filterTextActive: {
        color: 'white',
        fontWeight: 'bold',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginBottom: 8,
    },
    headerText: {
        fontWeight: 'bold',
        color: '#666',
    },
    list: {
        paddingBottom: 20,
    },
    row: {
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 8,
        marginBottom: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        elevation: 1,
    },
    cellDate: {
        flex: 1,
    },
    dateText: {
        fontSize: 14,
        color: '#333',
        fontWeight: 'bold',
    },
    sensorText: {
        fontSize: 12,
        color: '#999',
    },
    cellData: {
        alignItems: 'flex-end',
    },
    tempText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2196F3',
    },
    humText: {
        fontSize: 12,
        color: '#666',
    },
    empty: {
        textAlign: 'center',
        marginTop: 40,
        color: '#999',
    },
});

export default HistoryScreen;
