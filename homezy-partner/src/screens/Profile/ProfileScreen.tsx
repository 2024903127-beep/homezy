import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, Alert } from 'react-native';
import {
  User,
  FileText,
  Map,
  CreditCard,
  ChevronRight,
  LogOut,
  Wrench,
  ShieldCheck,
  ShieldAlert,
  Clock,
} from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '@/navigation/types';
import { useAuthStore } from '@/store/authStore';
import { colors, radius, shadows, spacing, typography } from '@/theme/theme';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Profile'>;

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; Icon: React.ElementType }> = {
  UNVERIFIED: { label: 'Complete KYC to receive jobs', color: '#D97706', bg: '#FEF3C7', Icon: Clock },
  PENDING: { label: 'KYC documents under review', color: '#D97706', bg: '#FEF3C7', Icon: Clock },
  VERIFIED: { label: 'Verified Professional', color: '#059669', bg: '#D1FAE5', Icon: ShieldCheck },
  REJECTED: { label: 'KYC rejected â€” resubmit documents', color: '#DC2626', bg: '#FEE2E2', Icon: ShieldAlert },
};

type MenuItem = { key: keyof ProfileStackParamList; label: string; icon: React.ElementType };

const MENU_ITEMS: MenuItem[] = [
  { key: 'EditProfile', label: 'Edit Profile', icon: User },
  { key: 'Kyc', label: 'KYC & Documents', icon: FileText },
  { key: 'ServiceAreas', label: 'Skills & Coverage Areas', icon: Map },
  { key: 'BankDetails', label: 'Bank & Payment Details', icon: CreditCard },
];

export default function ProfileScreen({ navigation }: Props) {
  const { provider, logout } = useAuthStore();
  const status = STATUS_CONFIG[provider?.verificationStatus ?? 'UNVERIFIED'];
  const StatusIcon = status.Icon;
  const initial = (provider?.name ?? 'P').charAt(0).toUpperCase();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarInitial}>{initial}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{provider?.name ?? 'Provider Name'}</Text>
          <Text style={styles.phone}>{provider?.phone ?? '+91 9876543210'}</Text>
        </View>
        <View style={styles.providerBadge}>
          <Wrench size={12} color={colors.primary} />
          <Text style={styles.providerBadgeText}>Pro</Text>
        </View>
      </View>

      {/* Status Banner */}
      <View style={[styles.statusBanner, { backgroundColor: status.bg, borderColor: status.color + '40' }]}>
        <StatusIcon size={18} color={status.color} />
        <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
      </View>

      {/* Menu */}
      <View style={styles.menuCard}>
        {MENU_ITEMS.map((item, i) => {
          const MenuIcon = item.icon;
          return (
            <View key={item.key}>
              <Pressable style={styles.menuRow} onPress={() => navigation.navigate(item.key as any)}>
                <View style={styles.menuIconBox}>
                  <MenuIcon size={18} color={colors.primary} />
                </View>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <ChevronRight size={18} color={colors.textMuted} />
              </Pressable>
              {i < MENU_ITEMS.length - 1 && <View style={styles.divider} />}
            </View>
          );
        })}
      </View>

      {/* Logout */}
      <Pressable style={styles.logoutBtn} onPress={handleLogout}>
        <View style={styles.logoutIconBox}>
          <LogOut size={18} color="#EF4444" />
        </View>
        <Text style={styles.logoutText}>Logout</Text>
      </Pressable>

      <Text style={styles.version}>Homezy Partner v0.1.0</Text>
      <View style={{ height: spacing.xxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAF9' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.lg,
    paddingTop: 52,
    gap: spacing.md,
    ...shadows.sm,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: { ...typography.h2, color: colors.white },
  name: { ...typography.h3, color: colors.text },
  phone: { ...typography.body, color: colors.textMuted, marginTop: 2 },
  providerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  providerBadgeText: { ...typography.small, color: colors.primary, fontWeight: '700' },

  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    margin: spacing.md,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
  },
  statusText: { ...typography.captionBold, flex: 1 },

  menuCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    marginHorizontal: spacing.md,
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
  menuIconBox: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: { ...typography.body, color: colors.text, flex: 1, fontWeight: '600' },
  divider: { height: 1, backgroundColor: colors.divider, marginLeft: 68 },

  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    padding: spacing.md,
    ...shadows.sm,
  },
  logoutIconBox: {
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

