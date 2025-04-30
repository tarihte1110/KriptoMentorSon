// src/navigation/ProfileStackNavigator.js

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ProfileScreen from '../screens/ProfileScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import ShareSignalScreen from '../screens/ShareSignalScreen';

const Stack = createNativeStackNavigator();

export default function ProfileStack() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="ProfileHome" component={ProfileScreen} />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ headerShown: true, title: 'Profili Düzenle' }}
      />
      <Stack.Screen
        name="ShareSignal"
        component={ShareSignalScreen}
        options={{ headerShown: true, title: 'Sinyal Paylaş' }}
      />
    </Stack.Navigator>
  );
}
