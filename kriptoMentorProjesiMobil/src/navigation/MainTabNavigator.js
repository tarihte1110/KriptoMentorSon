// src/navigation/MainTabNavigator.js

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import HomeScreen from '../screens/HomeScreen';
import MarketScreen from '../screens/MarketScreen';
import NewsScreen from '../screens/NewsScreen';
import ProfileStack from './ProfileStackNavigator';

import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          switch (route.name) {
            case 'AnaEkran':
              return <Ionicons name="home" size={size} color={color} />;
            case 'Piyasa':
              return <MaterialCommunityIcons name="trending-up" size={size} color={color} />;
            case 'Haberler':
              return <MaterialCommunityIcons name="newspaper" size={size} color={color} />;
            case 'Profil':
              return <Ionicons name="person" size={size} color={color} />;
          }
        },
        tabBarActiveTintColor: '#007BFF',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen
        name="AnaEkran"
        component={HomeScreen}
        options={{ title: 'Ana Ekran' }}
      />
      <Tab.Screen
        name="Piyasa"
        component={MarketScreen}
        options={{ title: 'Piyasa' }}
      />
      <Tab.Screen
        name="Haberler"
        component={NewsScreen}
        options={{ title: 'Haberler' }}
      />
      <Tab.Screen
        name="Profil"
        component={ProfileStack}
        options={{ title: 'Profil' }}
      />
    </Tab.Navigator>
  );
}
