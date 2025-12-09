import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import MonitorScreen from './src/screens/MonitorScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import StatsScreen from './src/screens/StatsScreen';
import CompareScreen from './src/screens/CompareScreen';
import CompareDayScreen from './src/screens/CompareDayScreen';
import QueryScreen from './src/screens/QueryScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Monitor') {
              iconName = focused ? 'thermometer' : 'thermometer-outline';
            } else if (route.name === 'Historial') {
              iconName = focused ? 'time' : 'time-outline';
            } else if (route.name === 'Estadísticas') {
              iconName = focused ? 'bar-chart' : 'bar-chart-outline';
            } else if (route.name === 'Comparar') {
              iconName = focused ? 'swap-horizontal' : 'swap-horizontal-outline';
            } else if (route.name === 'Días') {
              iconName = focused ? 'calendar' : 'calendar-outline';
            } else if (route.name === 'Consulta') {
              iconName = focused ? 'search' : 'search-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#2196F3',
          tabBarInactiveTintColor: 'gray',
        })}
      >
        <Tab.Screen name="Monitor" component={MonitorScreen} />
        <Tab.Screen name="Historial" component={HistoryScreen} />
        <Tab.Screen name="Estadísticas" component={StatsScreen} />
        <Tab.Screen name="Comparar" component={CompareScreen} />
        <Tab.Screen name="Días" component={CompareDayScreen} />
        <Tab.Screen name="Consulta" component={QueryScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
