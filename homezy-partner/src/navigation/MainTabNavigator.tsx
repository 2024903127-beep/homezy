import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Briefcase, Wallet, User } from 'lucide-react-native';
import { MainTabParamList } from './types';
import HomeNavigator from './HomeNavigator';
import JobsNavigator from './JobsNavigator';
import EarningsNavigator from './EarningsNavigator';
import ProfileNavigator from './ProfileNavigator';
import { colors } from '@/theme/theme';

const Tab = createBottomTabNavigator<MainTabParamList>();

type TabIconProps = {
  Icon: typeof Home;
  label: string;
  color: string;
  focused: boolean;
};

function TabIcon({ Icon, label, color, focused }: TabIconProps) {
  return (
    <View style={styles.tabIconContainer}>
      {focused && <View style={styles.tabActiveIndicator} />}
      <View style={[styles.tabIconWrap, focused && styles.tabIconWrapActive]}>
        <Icon size={22} color={focused ? '#FFFFFF' : color} strokeWidth={focused ? 2.5 : 2} />
      </View>
      <Text style={[styles.tabLabel, { color: focused ? colors.primary : color }]}>{label}</Text>
    </View>
  );
}

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeNavigator}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon Icon={Home} label="Dashboard" color={color} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="JobsTab"
        component={JobsNavigator}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon Icon={Briefcase} label="My Jobs" color={color} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="EarningsTab"
        component={EarningsNavigator}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon Icon={Wallet} label="Earnings" color={color} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileNavigator}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon Icon={User} label="Profile" color={color} focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0,
    height: Platform.OS === 'ios' ? 88 : 68,
    paddingBottom: Platform.OS === 'ios' ? 28 : 8,
    paddingTop: 8,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 16,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 4,
    width: 70,
  },
  tabActiveIndicator: {
    position: 'absolute',
    top: -8,
    width: 36,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  tabIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  tabIconWrapActive: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
