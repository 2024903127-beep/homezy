import React, { useState, useCallback } from 'react';
import { Pressable, StyleSheet, Text, View, ScrollView, Alert, RefreshControl } from 'react-native';
import {
  User,
  MapPin,
  Bell,
  Tag,
  HelpCircle,
  LogOut,
  ChevronRight,
  Mail,
} from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { ProfileStackParamList } from '@/navigation/types';
import { useAuthStore } from '@/store/authStore';
import { getProfile } from '@/services/authService';
import { colors, radius, shadows, spacing, typography } from '@/theme/theme';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Profile'>;

type MenuItem = {
  key: keyof ProfileStackParamList;
  label: string;
  icon: React.ElementType;
  badge?: string;
};

const MENU_ITEMS: MenuItem[] = [
  { key: 'EditProfile', label: 'Edit Profile', icon: User },
  { key: 'Addresses', label: 'Saved Addresses', icon: MapPin },
  { key: 'Notifications', label: 'Notifications', icon: Bell },
  { key: 'Coupons', label: 'My Coupons', icon: Tag, badge: 'NEW' },
  { key: 'Support', label: 'Help & Support', icon: HelpCircle },
];

function MenuRow({ item, onPress }: { item: MenuItem; onPress: () => void }) {
  const IconComponent = item.icon;
  return (
    <Pressable style={styles.menuRow} onPress={onPress}>
      <View style={styles.menuIcon}>
        <IconComponent size={20} color="#0F9D58" />
      </View>
      <Text style={styles.menuLabel}>{item.label}</Text>
      {item.badge && (
        <View style={styles.menuBadge}>
          <Text style={styles.menuBadgeText}>{item.badge}</Text>
        </View>
      )}
      <ChevronRight size={18} color="#9CA3AF" />
    </Pressable>
  );
}

export default function ProfileScreen({ navigation }: Props) {
  const { user, logout, setUser } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);

  // Auto-fetch fresh profile from backend whenever user opens or navigates back to Profile tab
  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      (async () => {
        try {
          const freshUser = await getProfile();
          if (isMounted && freshUser) {
            setUser(freshUser);
          }
        } catch {}
      })();
      return () => {
        isMounted = false;
      };
    }, [setUser])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const fresh = await getProfile();
      if (fresh) setUser(fresh);
    } catch {}
    finally {
      setRefreshing(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  const initial = (user?.name ?? 'U').charAt(0).toUpperCase();

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0F9D58']} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarInitial}>{initial}</Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user?.name ?? 'User Name'}</Text>
          <Text style={styles.userPhone}>+91 {user?.phone?.replace(/\D/g, '') || '9876543210'}</Text>
          {user?.email ? (
            <View style={styles.userEmailRow}>
              <Mail size={12} color="#0F9D58" />
              <Text style={styles.userEmail} numberOfLines={1}>{user.email}</Text>
            </View>
          ) : (
            <Text style={styles.userEmailMissing}>Tap Edit Profile to set email</Text>
          )}
        </View>
      </View>

      {/* Menu */}
      <View style={styles.menuCard}>
        {MENU_ITEMS.map((item, i) => (
          <View key={item.key}>
            <MenuRow item={item} onPress={() => navigation.navigate(item.key as any)} />
            {i < MENU_ITEMS.length - 1 && <View style={styles.divider} />}
          </View>
        ))}
      </View>

      {/* Logout */}
      <Pressable style={styles.logoutBtn} onPress={handleLogout}>
        <View style={styles.logoutIcon}>
          <LogOut size={18} color="#EF4444" />
        </View>
        <Text style={styles.logoutText}>Logout</Text>
      </Pressable>

      <Text style={styles.version}>Homezy v0.1.0</Text>
      <View style={{ height: spacing.xxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAF9' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: spacing.lg,
    paddingTop: 52,
    gap: spacing.md,
    ...shadows.sm,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0F9D58',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: { ...typography.h2, color: '#FFFFFF' },
  userInfo: { flex: 1 },
  userName: { ...typography.h3, color: colors.text },
  userPhone: { ...typography.body, color: colors.textMuted, marginTop: 1 },
  userEmailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    backgroundColor: '#E8F5EE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  userEmail: { ...typography.small, color: '#0F9D58', fontWeight: '600' },
  userEmailMissing: { ...typography.caption, color: colors.textDisabled, marginTop: 4, fontStyle: 'italic' },

  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    overflow: 'hidden',
    ...shadows.sm,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md + 2,
    gap: spacing.md,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: '#E8F5EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: { ...typography.body, color: colors.text, flex: 1, fontWeight: '500' },
  menuBadge: {
    backgroundColor: '#E8F5EE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
    marginRight: spacing.xs,
  },
  menuBadgeText: { ...typography.small, color: '#0F9D58', fontWeight: '700' },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginLeft: 68 },

  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    padding: spacing.md,
    ...shadows.sm,
  },
  logoutIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: { ...typography.bodyBold, color: '#EF4444' },

  version: {
    ...typography.small,
    color: colors.textDisabled,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
