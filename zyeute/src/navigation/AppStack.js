import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet, Text } from 'react-native';
import FeedScreen from '../screens/FeedScreen';
import UploadScreen from '../screens/UploadScreen';
import ProfileScreen from '../screens/ProfileScreen';
import CommentsScreen from '../screens/CommentsScreen';
import HealthScreen from '../screens/HealthScreen';
import TIGuyScreen from '../screens/TIGuyScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#F5C842', // Gold
        tabBarInactiveTintColor: '#8B7355', // Muted leather
        headerStyle: styles.header,
        headerTintColor: '#F5C842',
        headerTitleStyle: styles.headerTitle,
      }}
    >
      <Tab.Screen
        name="Feed"
        component={FeedScreen}
        options={{
          title: '🔥 Zyeuté',
          tabBarLabel: 'Feed',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>🏠</Text>
        }}
      />
      <Tab.Screen
        name="Upload"
        component={UploadScreen}
        options={{
          title: 'Publier',
          tabBarLabel: 'Publier',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>➕</Text>
        }}
      />
      <Tab.Screen
        name="MyProfile"
        component={ProfileScreen}
        options={{
          title: 'Profil',
          tabBarLabel: 'Profil',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>👤</Text>
        }}
      />
      <Tab.Screen
        name="TIGuy"
        component={TIGuyScreen}
        options={{
          title: 'TI-Guy',
          tabBarLabel: 'TI-Guy',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🐝</Text>
        }}
      />
      <Tab.Screen
        name="Health"
        component={HealthScreen}
        options={{
          title: 'Health',
          tabBarLabel: 'Health',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>H</Text>
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MainTabs"
        component={TabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Comments"
        component={CommentsScreen}
        options={{
          headerShown: true,
          headerTitle: '💬 Commentaires',
          headerStyle: styles.header,
          headerTintColor: '#F5C842',
          headerTitleStyle: styles.headerTitle,
        }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          headerShown: true,
          headerTitle: 'Profil',
          headerStyle: styles.header,
          headerTintColor: '#F5C842',
          headerTitleStyle: styles.headerTitle,
        }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#2A1F16', // Dark leather
    borderTopColor: '#F5C842', // Gold border
    borderTopWidth: 1,
    height: 60,
    paddingBottom: 8,
    paddingTop: 8,
  },
  header: {
    backgroundColor: '#2A1F16', // Dark leather
    borderBottomColor: '#F5C842',
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontWeight: 'bold',
    fontSize: 20,
  },
});

