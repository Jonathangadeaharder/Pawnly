/**
 * Play Stack Navigator
 * Stack navigator for Play and GameAnalysis screens
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Colors } from '../constants/theme';
import type { PlayStackParamList } from '../types';

// Re-export for convenience
export type { PlayStackParamList };

// Import screens
import PlayScreen from '../screens/Play/PlayScreen';
import GameAnalysisScreen from '../screens/Play/GameAnalysisScreen';

const Stack = createNativeStackNavigator<PlayStackParamList>();

export default function PlayStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.background,
        },
        headerTitleStyle: {
          fontSize: 20,
          fontWeight: '600',
          color: Colors.text,
        },
        headerTintColor: Colors.text,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="PlayHome"
        component={PlayScreen}
        options={{
          title: 'Play',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="GameAnalysis"
        component={GameAnalysisScreen}
        options={{
          title: 'Game Analysis',
        }}
      />
    </Stack.Navigator>
  );
}
