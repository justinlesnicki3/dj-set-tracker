import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { AppProvider } from './AppContext';
import SearchScreen from './screens/SearchScreen';
import MyDJsScreen from './screens/MyDJsScreen';
import NewSetsScreen from './screens/NewSetsScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <AppProvider>
      <NavigationContainer>
        <Tab.Navigator initialRouteName="Search">
          <Tab.Screen name="Search" component={SearchScreen} />
          <Tab.Screen name="My DJs" component={MyDJsScreen} />
          <Tab.Screen name="New Sets" component={NewSetsScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </AppProvider>
  );
}
