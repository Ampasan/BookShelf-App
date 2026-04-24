import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/HomeScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import SearchScreen from '../screens/SearchScreen';
import AboutScreen from '../screens/AboutScreen';

const Tab = createBottomTabNavigator();

function getTabBarIcon(routeName, focused) {
  const baseColor = focused ? '#00D564' : '#6b7280';

  switch (routeName) {
    case 'Home':
      return { name: focused ? 'home' : 'home-outline', color: baseColor };
    case 'Favorites':
      return { name: focused ? 'heart' : 'heart-outline', color: baseColor };
    case 'Search':
      return { name: focused ? 'search' : 'search-outline', color: baseColor };
    case 'About':
      return {
        name: focused ? 'information-circle' : 'information-circle-outline',
        color: baseColor,
      };
    default:
      return { name: 'ellipse-outline', color: baseColor };
  }
}

export default function TabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: true,
        headerTitle: 'BookShelf',
        tabBarShowLabel: true,
        tabBarActiveTintColor: '#00D564',
        tabBarInactiveTintColor: '#6b7280',
        tabBarIcon: ({ focused, size }) => {
          const { name, color } = getTabBarIcon(route.name, focused);
          return <Ionicons name={name} size={size ?? 22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Favorites" component={FavoritesScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="About" component={AboutScreen} />
    </Tab.Navigator>
  );
}

