import React from 'react';
import { View, Text, Dimensions, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

const ChartLive = ({ data, title }) => {
    // data espera ser un array de objetos { fecha, temperatura, humedad }
    // Tomaremos los últimos 10 puntos para la gráfica en vivo
    const chartData = data.slice(-10);

    if (chartData.length === 0) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.noData}>Esperando datos...</Text>
            </View>
        );
    }

    const labels = chartData.map(d => {
        const date = new Date(d.fecha);
        return `${date.getHours()}:${date.getMinutes()}`;
    });

    const temps = chartData.map(d => d.temperatura);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{title}</Text>
            <LineChart
                data={{
                    labels: labels,
                    datasets: [
                        {
                            data: temps
                        }
                    ]
                }}
                width={screenWidth - 32} // padding
                height={220}
                yAxisSuffix="°C"
                yAxisInterval={1}
                chartConfig={{
                    backgroundColor: "#ffffff",
                    backgroundGradientFrom: "#ffffff",
                    backgroundGradientTo: "#ffffff",
                    decimalPlaces: 1,
                    color: (opacity = 1) => `rgba(255, 87, 34, ${opacity})`, // Naranja térmico
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
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        alignItems: 'center'
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
        alignSelf: 'flex-start'
    },
    noData: {
        fontStyle: 'italic',
        color: '#999',
        marginVertical: 20
    }
});

export default React.memo(ChartLive);
