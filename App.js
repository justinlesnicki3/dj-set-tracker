import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from './screens/HomeScreen';
import DJLibraryScreen from './screens/DJLibraryScreen';
import MyLeaksScreen from './screens/MyLeaksScreen';
import { AppProvider } from './AppContext';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <AppProvider>
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Library" component={DJLibraryScreen} />
        <Stack.Screen name="MyLeaks" component={MyLeaksScreen} />
      </Stack.Navigator>
    </NavigationContainer>
    </AppProvider>

  );
}