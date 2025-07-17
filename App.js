import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PlaylistDetailScreen from './screens/PlaylistDetailScreen';

import { AppProvider } from './AppContext';
import SearchScreen from './screens/SearchScreen';
import MyDJsScreen from './screens/MyDJsScreen';
import NewSetsScreen from './screens/NewSetsScreen';
import DJDetailScreen from './screens/DJDetailScreen';
import DJLibraryScreen from './screens/DJLibraryScreen';
import MyLeaksScreen from './screens/MyLeaksScreen';
import ClipScreen from './screens/ClipScreen';
import ClipPlayerScreen from './screens/ClipPlayerScreen';
import MiniPlayer from './components/MiniPlayer';


const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="My DJs" component={MyDJsScreen} />
      <Tab.Screen name="New Sets" component={NewSetsScreen} />
      <Tab.Screen name="My Leaks" component={MyLeaksScreen} />
      <Tab.Screen name="Libaray" component={DJLibraryScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <AppProvider>
  <NavigationContainer>
    <>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={MainTabs} options={{ headerShown: false }} />
        <Stack.Screen name="DJDetail" component={DJDetailScreen} />
        <Stack.Screen name="Clip" component={ClipScreen} />
        <Stack.Screen name="PlaylistDetail" component={PlaylistDetailScreen} />
        <Stack.Screen name="ClipPlayer" component={ClipPlayerScreen} />
      </Stack.Navigator>
      <MiniPlayer />
    </>
  </NavigationContainer>
</AppProvider>

  );
}
