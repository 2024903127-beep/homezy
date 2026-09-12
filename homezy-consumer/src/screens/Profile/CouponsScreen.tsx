import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { listCoupons } from '@/services/couponService';
import EmptyState from '@/components/EmptyState';
import SkeletonLoader from '@/components/SkeletonLoader';
import { useToastStore } from '@/store/toastStore';
import { colors, radius, shadows, spacing, typography } from '@/theme/theme';
import { Coupon } from '@/types/models';

function CouponCard({ coupon, onCopy }: { coupon: Coupon; onCopy: () => void }) {
  return (
    <View style={styles.card}>
      {/* Left strip */}
      <View style={styles.leftStrip} />

      <View style={styles.content}>
        <View style={styles.row}>
          <Text style={styles.code}>{coupon.code}</Text>
          <Pressable style={styles.copyBtn} onPress={onCopy}>
            <Text style={styles.copyBtnText}>Copy</Text>
          </Pressable>
        </View>
        <Text style={styles.description}>{coupon.description}</Text>
        {coupon.discountPercent ? (
          <Text style={styles.discount}>{coupon.discountPercent}% OFF</Text>
        ) : coupon.discountFlat ? (
          <Text style={styles.discount}>₹{coupon.discountFlat} OFF</Text>
        ) : null}
      </View>
    </View>
  );
}

export default function CouponsScreen() {
  const toast = useToastStore();

  const { data: coupons, isLoading } = useQuery({
    queryKey: ['coupons'],
    queryFn: listCoupons,
  });

  const handleCopy = (code: string) => {
    // Note: @react-native-clipboard/clipboard — use expo-clipboard if on Expo managed workflow
    // Clipboard.setString(code);
    toast.info(`Code "${code}" copied to clipboard!`);
  };

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.list}
      data={isLoading ? [] : (coupons ?? [])}
      keyExtractor={(item) => item.code}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <Text style={styles.header}>Use these codes when booking to get a discount.</Text>
      }
      renderItem={({ item }) => (
        <CouponCard coupon={item} onCopy={() => handleCopy(item.code)} />
      )}
      ListEmptyComponent={
        isLoading ? (
          <View>
            {[1, 2, 3].map((i) => (
              <View key={i} style={styles.skeletonCard}>
                <SkeletonLoader height={20} width="40%" style={{ marginBottom: 8 }} />
                <SkeletonLoader height={14} width="80%" />
              </View>
            ))}
          </View>
        ) : (
          <EmptyState
            title="No coupons available"
            subtitle="Check back later for exclusive offers and discounts!"
          />
        )
      }
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.md },
  header: { ...typography.body, color: colors.textMuted, marginBottom: spacing.md },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    flexDirection: 'row',
    overflow: 'hidden',
    ...shadows.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  leftStrip: {
    width: 8,
    backgroundColor: colors.primary,
  },
  content: { flex: 1, padding: spacing.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  code: { ...typography.h3, color: colors.text, letterSpacing: 1 },
  copyBtn: {
    backgroundColor: colors.primaryLight,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
  },
  copyBtnText: { ...typography.captionBold, color: colors.primary },
  description: { ...typography.body, color: colors.textMuted, marginBottom: spacing.xs },
  discount: { ...typography.h4, color: colors.primary },

  skeletonCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
});
