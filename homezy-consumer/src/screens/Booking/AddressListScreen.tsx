import React, { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Home, Building2, MapPin, Check, Trash2, Plus } from 'lucide-react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { getAddresses, deleteAddress } from '@/services/bookingService';
import Button from '@/components/Button';
import EmptyState from '@/components/EmptyState';
import SkeletonLoader from '@/components/SkeletonLoader';
import { useBookingDraftStore } from '@/store/bookingDraftStore';
import { useToastStore } from '@/store/toastStore';
import { colors, radius, shadows, spacing, typography } from '@/theme/theme';
import { Address } from '@/types/models';

type Props = NativeStackScreenProps<any>;

const LABEL_ICONS: Record<string, React.ElementType> = {
  Home: Home,
  Office: Building2,
  Other: MapPin,
};

export default function AddressListScreen({ route, navigation }: Props) {
  const selectMode = route.params?.selectMode ?? false;
  const setAddress = useBookingDraftStore((s) => s.setAddress);
  const toast = useToastStore();
  const qc = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: addresses, isLoading } = useQuery({ queryKey: ['addresses'], queryFn: getAddresses });

  const deleteMutation = useMutation({
    mutationFn: deleteAddress,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['addresses'] });
      toast.success('Address removed');
    },
    onError: () => toast.error('Could not delete address'),
  });

  const handleSelect = (address: Address) => {
    setSelectedId(address.id);
    if (selectMode) {
      setAddress(address);
      navigation.navigate('BookingConfirm');
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={addresses ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const LabelIcon = LABEL_ICONS[item.label] ?? MapPin;
          return (
            <Pressable
              style={[styles.card, selectedId === item.id && styles.cardSelected]}
              onPress={() => handleSelect(item)}
            >
              <View style={styles.cardHeader}>
                <View style={styles.labelBadge}>
                  <View style={styles.labelIconBox}>
                    <LabelIcon size={16} color="#0F9D58" />
                  </View>
                  <Text style={styles.labelText}>{item.label}</Text>
                </View>
                {item.isDefault && (
                  <View style={styles.defaultBadge}>
                    <Text style={styles.defaultText}>Default</Text>
                  </View>
                )}
                {selectMode && selectedId === item.id && (
                  <Check size={20} color="#0F9D58" />
                )}
              </View>
              <Text style={styles.addressLine}>{item.line1}</Text>
              {item.line2 ? <Text style={styles.addressMuted}>{item.line2}</Text> : null}
              <Text style={styles.addressMuted}>
                {item.city}, {item.state} — {item.pincode}
              </Text>
              {!selectMode && (
                <Pressable
                  style={styles.deleteBtn}
                  onPress={() => deleteMutation.mutate(item.id)}
                >
                  <Trash2 size={14} color={colors.danger} />
                  <Text style={styles.deleteBtnText}>Remove</Text>
                </Pressable>
              )}
            </Pressable>
          );
        }}
        ListEmptyComponent={
          isLoading ? (
            <View>
              {[1, 2].map((i) => (
                <View key={i} style={styles.skeletonCard}>
                  <SkeletonLoader height={16} width="40%" style={{ marginBottom: 8 }} />
                  <SkeletonLoader height={14} width="80%" style={{ marginBottom: 6 }} />
                  <SkeletonLoader height={12} width="60%" />
                </View>
              ))}
            </View>
          ) : (
            <EmptyState
              title="No saved addresses"
              subtitle="Add your home or work address to book services quickly."
              ctaLabel="Add Address"
              onCta={() => navigation.navigate('AddressForm', {})}
            />
          )
        }
        ListFooterComponent={
          (addresses?.length ?? 0) > 0 ? (
            <Button
              label="Add New Address"
              variant="outline"
              onPress={() => navigation.navigate('AddressForm', {})}
              style={styles.addBtn}
            />
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAF9' },
  list: { padding: spacing.md },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
    ...shadows.sm,
  },
  cardSelected: { borderColor: '#0F9D58', backgroundColor: '#E8F5EE' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  labelBadge: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flex: 1 },
  labelIconBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E8F5EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelText: { ...typography.bodyBold, color: colors.text },
  defaultBadge: {
    backgroundColor: '#E8F5EE',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    marginLeft: spacing.sm,
  },
  defaultText: { ...typography.small, color: '#0F9D58', fontWeight: '700' },

  addressLine: { ...typography.body, color: colors.text, marginBottom: 2 },
  addressMuted: { ...typography.caption, color: colors.textMuted, marginBottom: 2 },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: spacing.sm, alignSelf: 'flex-start' },
  deleteBtnText: { ...typography.caption, color: colors.danger },

  addBtn: { marginTop: spacing.xs },
  skeletonCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
});
