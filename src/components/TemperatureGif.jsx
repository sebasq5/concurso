import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

// Import local assets
const coldGif = require('../../loops/frio.gif');
const normalGif = require('../../loops/normal.gif');
const hotGif = require('../../loops/calor.gif');

const TemperatureGif = ({ temperature, size = 80 }) => {
    let currentGif = normalGif;

    // Determine GIF based on temperature ranges
    if (temperature < 18) {
        currentGif = coldGif;
    } else if (temperature > 26) {
        currentGif = hotGif;
    } else {
        currentGif = normalGif;
    }

    return (
        <View style={[styles.gifContainer, { width: size, height: size, borderRadius: size / 2 }]}>
            <Image
                source={currentGif}
                style={styles.weatherGif}
                resizeMode="cover"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    gifContainer: {
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: '#eee',
    },
    weatherGif: {
        width: '100%',
        height: '100%',
    },
});

export default React.memo(TemperatureGif);
