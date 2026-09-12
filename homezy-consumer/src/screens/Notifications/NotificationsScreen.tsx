import React, { useState, useCallback } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ClipboardList, Tag, Bell } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import EmptyState from '@/components/EmptyState';
import SkeletonLoader from '@/components/SkeletonLoader';
import { colors, radius, shadows, spacing, typography } from '@/theme/theme';
import apiClient from '@/services/apiClient';

interface InAppNotification {
  id: string;
  type: 'booking' | 'promo' | 'system';
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

const ICON_MAP: Record<string, React.ElementType> = {
  booking: ClipboardList,
  promo: Tag,
  system: Bell,
};

const TYPE_COLOR: Record<string, string> = {
  booking: '#0F9D58',
  promo: '#F59E0B',
  system: '#6366F1',
};

function NotificationCard({ item }: { item: InAppNotification }) {
  const IconComponent = ICON_MAP[item.type] ?? Bell;
  const iconColor = TYPE_COLOR[item.type] ?? '#0F9D58';
  const bgColor = item.type === 'promo' ? '#FEF3C7' : item.type === 'system' ? '#EEF2FF' : '#E8F5EE';

  return (
    <View style={[styles.card, !item.isRead && styles.cardUnread]}>
      <View style={[styles.iconBox, { backgroundColor: bgColor }]}>
        <IconComponent size={22} color={iconColor} />
      </View>
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
          {!item.isRead && <View style={styles.unreadDot} />}
        </View>
        <Text style={styles.body} numberOfLines={2}>{item.body}</Text>
        <Text style={styles.time}>
          {new Date(item.createdAt).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
          })}
        </Text>
      </View>
    </View>
  );
}

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const { data } = await apiClient.get('/users/me/notifications');
      setNotifications(Array.isArray(data) ? data : []);
    } catch {
      // On error keep existing data; don't crash
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Refresh every time the tab is focused
  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [])
  );

  if (loading && notifications.length === 0) {
    return (
      <View style={styles.container}>
        {[1, 2, 3].map((i) => (
          <SkeletonLoader key={i} height={80} style={styles.skeletonCard} />
        ))}
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.list}
      data={notifications}
      keyExtractor={(item) => item.id}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => fetchNotifications(true)}
          colors={['#0F9D58']}
        />
      }
      renderItem={({ item }) => <NotificationCard item={item} />}
      ListEmptyComponent={
        <EmptyState
          title="No notifications yet"
          subtitle="We'll show your booking updates and offers here."
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAF9' },
  list: { padding: spacing.md, paddingBottom: 32 },
  skeletonCard: { borderRadius: radius.lg, marginBottom: spacing.sm },

  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.md,
    ...shadows.sm,
  },
  cardUnread: { borderLeftWidth: 3, borderLeftColor: '#0F9D58' },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: 4 },
  title: { ...typography.bodyBold, color: colors.text, flex: 1 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#0F9D58' },
  body: { ...typography.caption, color: colors.textMuted, lineHeight: 18 },
  time: { ...typography.small, color: colors.textDisabled, marginTop: 4 },
});
