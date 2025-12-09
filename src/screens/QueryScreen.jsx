import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Platform, Dimensions } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getDataByTimeRange } from '../services/firebaseService';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

const QueryScreen = () => {
    const [date, setDate] = useState(new Date());
    const [startTime, setStartTime] = useState(new Date(new Date().setHours(8, 0, 0, 0)));
    const [endTime, setEndTime] = useState(new Date(new Date().setHours(18, 0, 0, 0)));

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showStartTimePicker, setShowStartTimePicker] = useState(false);
    const [showEndTimePicker, setShowEndTimePicker] = useState(false);

    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);

    const onDateChange = (event, selectedDate) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate) setDate(selectedDate);
    };

    const onStartTimeChange = (event, selectedDate) => {
        setShowStartTimePicker(Platform.OS === 'ios');
        if (selectedDate) setStartTime(selectedDate);
    };

    const onEndTimeChange = (event, selectedDate) => {
        setShowEndTimePicker(Platform.OS === 'ios');
        if (selectedDate) setEndTime(selectedDate);
    };

    const formatDate = (date) => {
        return date.toISOString().split('T')[0];
    };

    const formatTime = (date) => {
        return date.toTimeString().split(' ')[0].substring(0, 5);
    };

    const handleConsultar = async () => {
        setLoading(true);
        try {
            const dateStr = formatDate(date);
            const startStr = formatTime(startTime);
            const endStr = formatTime(endTime);

            if (startStr > endStr) {
                Alert.alert("Error", "La hora de inicio debe ser menor a la hora fin");
                setLoading(false);
                return;
            }

            const data = await getDataByTimeRange(dateStr, startStr, endStr);
            processResults(data);
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "No se pudieron obtener los datos");
        } finally {
            setLoading(false);
        }
    };

    const processResults = (data) => {
        const processSensor = (sensorData) => {
            if (!sensorData || sensorData.length === 0) return null;

            const totalTemp = sensorData.reduce((sum, item) => sum + item.temperatura, 0);
            const totalHum = sensorData.reduce((sum, item) => sum + item.humedad, 0);
            const count = sensorData.length;

            // Agrupar por hora
            const hourlyGroups = {};
            sensorData.forEach(item => {
                const hour = item.fecha.split(' ')[1].substring(0, 2); // "HH"
                if (!hourlyGroups[hour]) hourlyGroups[hour] = { temps: [], hums: [] };
                hourlyGroups[hour].temps.push(item.temperatura);
                hourlyGroups[hour].hums.push(item.humedad);
            });

            const hourly = Object.keys(hourlyGroups).sort().map(hour => {
                const temps = hourlyGroups[hour].temps;
                const hums = hourlyGroups[hour].hums;
                return {
                    hour: `${hour}:00`,
                    avgTemp: (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1),
                    avgHum: (hums.reduce((a, b) => a + b, 0) / hums.length).toFixed(1),
                    count: temps.length
                };
            });

            return {
                avgTemp: (totalTemp / count).toFixed(1),
                avgHum: (totalHum / count).toFixed(1),
                hourly
            };
        };

        setResults({
            sensor1: processSensor(data.sensor1),
            sensor2: processSensor(data.sensor2)
        });
    };

    const renderSensorResults = (sensorName, data) => {
        if (!data) return (
            <View style={styles.card}>
                <Text style={styles.cardTitle}>{sensorName}</Text>
                <Text style={styles.noData}>Sin datos en este rango</Text>
            </View>
        );

        const chartData = {
            labels: data.hourly.map(h => h.hour),
            datasets: [
                {
                    data: data.hourly.map(h => parseFloat(h.avgTemp)),
                    color: (opacity = 1) => `rgba(255, 87, 34, ${opacity})`, // Temp color
                    strokeWidth: 2
                },
                {
                    data: data.hourly.map(h => parseFloat(h.avgHum)),
                    color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`, // Hum color
                    strokeWidth: 2
                }
            ],
            legend: ["Temp (°C)", "Hum (%)"]
        };

        return (
            <View style={styles.card}>
                <Text style={styles.cardTitle}>{sensorName}</Text>
                <View style={styles.summaryRow}>
                    <View style={styles.summaryItem}>
                        <Ionicons name="thermometer" size={20} color="#FF5722" />
                        <Text style={styles.summaryValue}>{data.avgTemp}°C</Text>
                        <Text style={styles.summaryLabel}>Prom. Temp</Text>
                    </View>
                    <View style={styles.summaryItem}>
                        <Ionicons name="water" size={20} color="#2196F3" />
                        <Text style={styles.summaryValue}>{data.avgHum}%</Text>
                        <Text style={styles.summaryLabel}>Prom. Hum</Text>
                    </View>
                </View>

                <LineChart
                    data={chartData}
                    width={screenWidth - 64} // Card padding
                    height={220}
                    chartConfig={{
                        backgroundColor: "#ffffff",
                        backgroundGradientFrom: "#ffffff",
                        backgroundGradientTo: "#ffffff",
                        decimalPlaces: 1,
                        color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                        style: {
                            borderRadius: 16
                        },
                        propsForDots: {
                            r: "4",
                            strokeWidth: "2",
                            stroke: "#ffa726"
                        }
                    }}
                    bezier
                    style={{
                        marginVertical: 8,
                        borderRadius: 16
                    }}
                />

                <Text style={styles.hourlyTitle}>Detalle por Hora</Text>
                <View style={styles.tableHeader}>
                    <Text style={styles.colHour}>Hora</Text>
                    <Text style={styles.colVal}>Temp</Text>
                    <Text style={styles.colVal}>Hum</Text>
                </View>
                {data.hourly.map((item, index) => (
                    <View key={index} style={styles.tableRow}>
                        <Text style={styles.colHour}>{item.hour}</Text>
                        <Text style={styles.colVal}>{item.avgTemp}°C</Text>
                        <Text style={styles.colVal}>{item.avgHum}%</Text>
                    </View>
                ))}
            </View>
        );
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Consulta Detallada</Text>

            <View style={styles.filterCard}>
                <Text style={styles.label}>Fecha:</Text>
                <TouchableOpacity style={styles.pickerBtn} onPress={() => setShowDatePicker(true)}>
                    <Ionicons name="calendar-outline" size={20} color="#333" />
                    <Text style={styles.pickerText}>{formatDate(date)}</Text>
                </TouchableOpacity>
                {showDatePicker && (
                    <DateTimePicker
                        value={date}
                        mode="date"
                        display="default"
                        onChange={onDateChange}
                    />
                )}

                <View style={styles.row}>
                    <View style={styles.half}>
                        <Text style={styles.label}>Desde:</Text>
                        <TouchableOpacity style={styles.pickerBtn} onPress={() => setShowStartTimePicker(true)}>
                            <Ionicons name="time-outline" size={20} color="#333" />
                            <Text style={styles.pickerText}>{formatTime(startTime)}</Text>
                        </TouchableOpacity>
                        {showStartTimePicker && (
                            <DateTimePicker
                                value={startTime}
                                mode="time"
                                is24Hour={true}
                                display="default"
                                onChange={onStartTimeChange}
                            />
                        )}
                    </View>
                    <View style={styles.half}>
                        <Text style={styles.label}>Hasta:</Text>
                        <TouchableOpacity style={styles.pickerBtn} onPress={() => setShowEndTimePicker(true)}>
                            <Ionicons name="time-outline" size={20} color="#333" />
                            <Text style={styles.pickerText}>{formatTime(endTime)}</Text>
                        </TouchableOpacity>
                        {showEndTimePicker && (
                            <DateTimePicker
                                value={endTime}
                                mode="time"
                                is24Hour={true}
                                display="default"
                                onChange={onEndTimeChange}
                            />
                        )}
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.consultBtn, loading && styles.disabledBtn]}
                    onPress={handleConsultar}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={styles.consultBtnText}>Consultar</Text>
                    )}
                </TouchableOpacity>
            </View>

            {results && (
                <View style={styles.resultsContainer}>
                    {renderSensorResults('Sensor 1', results.sensor1)}
                    {renderSensorResults('Sensor 2', results.sensor2)}
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
    label: {
        fontSize: 14,
        color: '#666',
        marginBottom: 6,
        fontWeight: 'bold',
    },
    pickerBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
    },
    pickerText: {
        marginLeft: 8,
        fontSize: 16,
        color: '#333',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    half: {
        width: '48%',
    },
    consultBtn: {
        backgroundColor: '#2196F3',
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 8,
    },
    disabledBtn: {
        backgroundColor: '#90CAF9',
    },
    consultBtnText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    resultsContainer: {
        paddingBottom: 20,
    },
    card: {
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 12,
        elevation: 2,
        marginBottom: 16,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 8,
    },
    noData: {
        color: '#999',
        fontStyle: 'italic',
        textAlign: 'center',
        padding: 10,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 16,
    },
    summaryItem: {
        alignItems: 'center',
    },
    summaryValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 4,
    },
    summaryLabel: {
        fontSize: 12,
        color: '#666',
    },
    hourlyTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#555',
        marginBottom: 8,
        marginTop: 8,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#f9f9f9',
        padding: 8,
        borderRadius: 4,
        marginBottom: 4,
    },
    tableRow: {
        flexDirection: 'row',
        padding: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    colHour: {
        flex: 1,
        fontWeight: 'bold',
        color: '#555',
    },
    colVal: {
        flex: 1,
        textAlign: 'center',
        color: '#333',
    },
});

export default QueryScreen;
