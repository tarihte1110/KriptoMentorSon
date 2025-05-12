// src/navigation/AppNavigator.js

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import MainTabNavigator from './MainTabNavigator';
import CommentsScreen from '../screens/CommentsScreen';
import PublicProfileScreen   from '../screens/PublicProfileScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator({ session }) {
  const isAuthenticated = !!session;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        </>
      ) : (
        <>
          {/* Ana tab navigatörü */}
          <Stack.Screen name="Main" component={MainTabNavigator} />

          {/* HomeScreen'den navigate('Comments', { signalId }) ile geçiş */}
          <Stack.Screen name="Comments" component={CommentsScreen} />

          <Stack.Screen name="PublicProfile"   component={PublicProfileScreen} />

        </>
      )}
    </Stack.Navigator>
  );
}
