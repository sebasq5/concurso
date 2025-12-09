import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, Platform, Dimensions } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getComparisonData } from '../services/firebaseService';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import TemperatureGif from '../components/TemperatureGif';

const screenWidth = Dimensions.get('window').width;

const CompareDayScreen = () => {
    const [date1, setDate1] = useState(new Date());
    const [date2, setDate2] = useState(new Date(new Date().setDate(new Date().getDate() - 1)));

    const [showDate1Picker, setShowDate1Picker] = useState(false);
    const [showDate2Picker, setShowDate2Picker] = useState(false);

    const [comparison, setComparison] = useState(null);
    const [loading, setLoading] = useState(false);

    const formatDate = (date) => date.toISOString().split('T')[0];

    const handleCompare = async () => {
        setLoading(true);
        try {
            const d1Str = formatDate(date1);
            const d2Str = formatDate(date2);
            // Use full day range
            const startStr = '00:00';
            const endStr = '23:59';

            const data = await getComparisonData(d1Str, d2Str, startStr, endStr);
            setComparison(processComparison(data));
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "No se pudieron cargar los datos");
        } finally {
            setLoading(false);
        }
    };

    const processComparison = (data) => {
        const processDay = (dayData) => {
            if (!dayData || dayData.length === 0) return { avg: 0, max: 0, min: 0, count: 0, temps: [] };
            const temps = dayData.map(d => d.temperatura);
            return {
                avg: (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1),
                max: Math.max(...temps),
                min: Math.min(...temps),
                count: temps.length,
                temps: temps
            };
        };

        return {
            d1s1: processDay(data.date1.sensor1),
            d1s2: processDay(data.date1.sensor2),
            d2s1: processDay(data.date2.sensor1),
            d2s2: processDay(data.date2.sensor2),
        };
    };

    const StatRow = ({ label, v1, v2 }) => (
        <View style={styles.row}>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.value}>{v1}</Text>
            <Text style={styles.value}>{v2}</Text>
        </View>
    );

    const DatePickerBtn = ({ label, date, onPress }) => (
        <TouchableOpacity style={styles.pickerBtn} onPress={onPress}>
            <Text style={styles.pickerLabel}>{label}</Text>
            <View style={styles.pickerValueContainer}>
                <Ionicons name="calendar-outline" size={18} color="#555" />
                <Text style={styles.pickerValue}>{formatDate(date)}</Text>
            </View>
        </TouchableOpacity>
    );

    const getChartData = (data1, data2, label1, label2) => {
        const normalize = (arr) => {
            if (!arr || arr.length === 0) return [0, 0, 0, 0, 0];
            if (arr.length <= 10) return arr;
            const step = Math.floor(arr.length / 10);
            return arr.filter((_, i) => i % step === 0).slice(0, 10);
        };

        const d1 = normalize(data1.temps);
        const d2 = normalize(data2.temps);

        return {
            labels: Array.from({ length: Math.max(d1.length, d2.length) }, (_, i) => i + 1),
            datasets: [
                { data: d1, color: (opacity = 1) => `rgba(255, 87, 34, ${opacity})`, strokeWidth: 2 },
                { data: d2, color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`, strokeWidth: 2 }
            ],
            legend: [label1, label2]
        };
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Comparar Días Completos</Text>

            <View style={styles.filterCard}>
                <View style={styles.rowContainer}>
                    <DatePickerBtn label="Día 1" date={date1} onPress={() => setShowDate1Picker(true)} />
                    <DatePickerBtn label="Día 2" date={date2} onPress={() => setShowDate2Picker(true)} />
                </View>

                {showDate1Picker && <DateTimePicker value={date1} mode="date" onChange={(e, d) => { setShowDate1Picker(Platform.OS === 'ios'); if (d) setDate1(d); }} />}
                {showDate2Picker && <DateTimePicker value={date2} mode="date" onChange={(e, d) => { setShowDate2Picker(Platform.OS === 'ios'); if (d) setDate2(d); }} />}

                <TouchableOpacity
                    style={[styles.compareBtn, loading && styles.disabledBtn]}
                    onPress={handleCompare}
                    disabled={loading}
                >
                    <Text style={styles.compareBtnText}>{loading ? "Cargando..." : "Comparar Días"}</Text>
                </TouchableOpacity>
            </View>

            {comparison && (
                <View style={styles.results}>
                    <View style={styles.sensorHeader}>
                        <Text style={styles.subtitle}>Sensor 1: {formatDate(date1)} vs {formatDate(date2)}</Text>
                        <TemperatureGif temperature={parseFloat(comparison.d1s1.avg)} size={40} />
                    </View>

                    <LineChart
                        data={getChartData(comparison.d1s1, comparison.d2s1, formatDate(date1), formatDate(date2))}
                        width={screenWidth - 64}
                        height={200}
                        chartConfig={{
                            backgroundColor: "#ffffff",
                            backgroundGradientFrom: "#ffffff",
                            backgroundGradientTo: "#ffffff",
                            decimalPlaces: 1,
                            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                            propsForDots: { r: "3" }
                        }}
                        bezier
                        style={{ marginVertical: 8, borderRadius: 16 }}
                    />

                    <View style={styles.tableHeader}>
                        <Text style={styles.label}>Métrica</Text>
                        <Text style={styles.value}>{formatDate(date1)}</Text>
                        <Text style={styles.value}>{formatDate(date2)}</Text>
                    </View>
                    <StatRow label="Promedio" v1={comparison.d1s1.avg} v2={comparison.d2s1.avg} />
                    <StatRow label="Máximo" v1={comparison.d1s1.max} v2={comparison.d2s1.max} />
                    <StatRow label="Mínimo" v1={comparison.d1s1.min} v2={comparison.d2s1.min} />
                    <StatRow label="Registros" v1={comparison.d1s1.count} v2={comparison.d2s1.count} />

                    <View style={[styles.sensorHeader, { marginTop: 20 }]}>
                        <Text style={styles.subtitle}>Sensor 2: {formatDate(date1)} vs {formatDate(date2)}</Text>
                        <TemperatureGif temperature={parseFloat(comparison.d1s2.avg)} size={40} />
                    </View>

                    <LineChart
                        data={getChartData(comparison.d1s2, comparison.d2s2, formatDate(date1), formatDate(date2))}
                        width={screenWidth - 64}
                        height={200}
                        chartConfig={{
                            backgroundColor: "#ffffff",
                            backgroundGradientFrom: "#ffffff",
                            backgroundGradientTo: "#ffffff",
                            decimalPlaces: 1,
                            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                            propsForDots: { r: "3" }
                        }}
                        bezier
                        style={{ marginVertical: 8, borderRadius: 16 }}
                    />

                    <View style={styles.tableHeader}>
                        <Text style={styles.label}>Métrica</Text>
                        <Text style={styles.value}>{formatDate(date1)}</Text>
                        <Text style={styles.value}>{formatDate(date2)}</Text>
                    </View>
                    <StatRow label="Promedio" v1={comparison.d1s2.avg} v2={comparison.d2s2.avg} />
                    <StatRow label="Máximo" v1={comparison.d1s2.max} v2={comparison.d2s2.max} />
                    <StatRow label="Mínimo" v1={comparison.d1s2.min} v2={comparison.d2s2.min} />
                    <StatRow label="Registros" v1={comparison.d1s2.count} v2={comparison.d2s2.count} />
                </View>
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
    filterCard: {
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 12,
        elevation: 2,
        marginBottom: 20,
    },
    rowContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    pickerBtn: {
        width: '48%',
        backgroundColor: '#f9f9f9',
        padding: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#eee',
    },
    pickerLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
    pickerValueContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    pickerValue: {
        marginLeft: 6,
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
    },
    compareBtn: {
        backgroundColor: '#673AB7', // Different color for distinction
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 8,
    },
    disabledBtn: {
        backgroundColor: '#B39DDB',
    },
    compareBtnText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    results: {
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 12,
        elevation: 2,
        marginBottom: 20,
    },
    subtitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 12,
        color: '#673AB7',
    },
    tableHeader: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 8,
        marginBottom: 8,
    },
    row: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    label: {
        flex: 1,
        color: '#666',
    },
    value: {
        flex: 1,
        fontWeight: 'bold',
        textAlign: 'right',
        color: '#333',
    },
    sensorHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
});

export default CompareDayScreen;
