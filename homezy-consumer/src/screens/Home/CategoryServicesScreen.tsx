import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Wrench, Clock, Star, ChevronRight, Tag } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList } from '@/navigation/types';
import { getServicesByCategory } from '@/services/catalogService';
import { useBookingDraftStore } from '@/store/bookingDraftStore';
import SkeletonLoader from '@/components/SkeletonLoader';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';
import { radius, shadows, spacing } from '@/theme/theme';
import { Service } from '@/types/models';

type Props = NativeStackScreenProps<HomeStackParamList, 'CategoryServices'>;

const FILTERS = ['All', 'Most Popular', 'Price: Low to High', 'Highly Rated'];

// ── Urban Company / Snabbit-style compact horizontal card ──────────────────────
function ServiceListCard({ service, onPress }: { service: Service; onPress: () => void }) {
  const discount =
    service.originalPrice && service.originalPrice > service.price
      ? Math.round((1 - service.price / service.originalPrice) * 100)
      : null;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.88}>
      {/* ── Left: all text content ── */}
      <View style={styles.cardLeft}>
        {/* Badge row */}
        {service.badge ? (
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Tag size={9} color="#0F9D58" />
              <Text style={styles.badgeText}>{service.badge}</Text>
            </View>
          </View>
        ) : null}

        <Text style={styles.cardName} numberOfLines={2}>
          {service.name}
        </Text>

        {/* Rating + Duration row */}
        <View style={styles.metaRow}>
          <Star size={11} color="#F59E0B" fill="#F59E0B" />
          <Text style={styles.ratingText}>
            {service.rating ?? '4.88'}
          </Text>
          {service.reviews ? (
            <Text style={styles.reviewsText}>({service.reviews})</Text>
          ) : null}
          <View style={styles.metaDivider} />
          <Clock size={11} color="#9CA3AF" />
          <Text style={styles.durationText}>{service.estimatedDurationMinutes} mins</Text>
        </View>

        {/* Price row */}
        <View style={styles.priceRow}>
          <Text style={styles.priceText}>₹{service.price}</Text>
          {service.originalPrice && service.originalPrice > service.price ? (
            <Text style={styles.originalPriceText}>₹{service.originalPrice}</Text>
          ) : null}
          {discount ? (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{discount}% off</Text>
            </View>
          ) : null}
        </View>

        {/* Description */}
        <Text style={styles.descText} numberOfLines={2}>
          {service.description}
        </Text>
      </View>

      {/* ── Right: thumbnail + book button ── */}
      <View style={styles.cardRight}>
        <View style={styles.imageWrapper}>
          {service.imageUrl ? (
            <Image
              source={{ uri: service.imageUrl }}
              style={styles.servicePhoto}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.fallbackPhoto}>
              <Wrench size={22} color="#0F9D58" />
            </View>
          )}
        </View>
        <TouchableOpacity style={styles.bookBtn} onPress={onPress} activeOpacity={0.85}>
          <Text style={styles.bookBtnText}>Book</Text>
          <ChevronRight size={11} color="#fff" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

// ── Skeleton placeholder card ────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <View style={styles.skeletonCard}>
      <View style={{ flex: 1, marginRight: 12 }}>
        <SkeletonLoader height={14} width="65%" style={{ marginBottom: 8 }} />
        <SkeletonLoader height={11} width="45%" style={{ marginBottom: 8 }} />
        <SkeletonLoader height={16} width="30%" style={{ marginBottom: 8 }} />
        <SkeletonLoader height={11} width="90%" />
      </View>
      <View style={{ alignItems: 'center', gap: 8 }}>
        <SkeletonLoader width={80} height={80} borderRadius={12} />
        <SkeletonLoader width={70} height={28} borderRadius={20} />
      </View>
    </View>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────
export default function CategoryServicesScreen({ route, navigation }: Props) {
  const { categoryId, categoryName } = route.params;
  const [activeFilter, setActiveFilter] = useState('All');
  const setService = useBookingDraftStore((s) => s.setService);

  const { data: services, isLoading, isError, refetch } = useQuery({
    queryKey: ['services', categoryId],
    queryFn: () => getServicesByCategory(categoryId),
  });

  const filteredServices = useMemo(() => {
    if (!services) return [];
    const list = [...services];
    if (activeFilter === 'Price: Low to High') {
      list.sort((a, b) => a.price - b.price);
    } else if (activeFilter === 'Most Popular') {
      // sort by reviews count descending (use reviews as proxy for popularity)
      list.sort((a, b) => ((b as any).reviews ?? 0) - ((a as any).reviews ?? 0));
    } else if (activeFilter === 'Highly Rated') {
      list.sort((a, b) => ((b as any).rating ?? 4.5) - ((a as any).rating ?? 4.5));
    }
    return list;
  }, [services, activeFilter]);

  const handleBookService = (service: Service) => {
    setService(service);
    navigation.navigate('ServiceDetail', { serviceId: service.id });
  };

  if (isError) return <ErrorState onRetry={refetch} />;

  return (
    <View style={styles.container}>
      {/* ── Filter chips strip ── */}
      <View style={styles.filterStripWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}
          style={styles.filtersScroll}
        >
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterChip, activeFilter === f && styles.filterChipActive]}
              onPress={() => setActiveFilter(f)}
              activeOpacity={0.8}
            >
              <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ── Service list ── */}
      <FlatList
        data={isLoading ? [] : filteredServices}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          !isLoading ? (
            <Text style={styles.count}>
              {filteredServices.length} service{filteredServices.length !== 1 ? 's' : ''} available in {categoryName}
            </Text>
          ) : null
        }
        renderItem={({ item }) => (
          <ServiceListCard service={item} onPress={() => handleBookService(item)} />
        )}
        ListEmptyComponent={
          isLoading ? (
            <View>
              {[1, 2, 3, 4].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </View>
          ) : (
            <EmptyState
              title="No services found"
              subtitle={`No services found in ${categoryName}. Check back soon!`}
            />
          )
        }
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAF9' },

  // Filter strip
  filterStripWrapper: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F3F1',
  },
  filtersScroll: { flexGrow: 0 },
  filters: {
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    height: 32,
  },
  filterChipActive: {
    backgroundColor: '#0F9D58',
    borderColor: '#0F9D58',
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  filterTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // List
  count: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  list: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xl,
  },
  separator: {
    height: 10,
  },

  // ── Clean Compact Card ──────────────────────────────────────────────────────
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E8EDEB',
    ...shadows.sm,
    alignItems: 'flex-start',
  },

  // Left column
  cardLeft: {
    flex: 1,
    marginRight: 12,
  },
  badgeRow: {
    marginBottom: 4,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    alignSelf: 'flex-start',
    backgroundColor: '#E8F5EE',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0F9D58',
  },
  cardName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    lineHeight: 20,
    marginBottom: 5,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#111827',
  },
  reviewsText: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  metaDivider: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
  },
  durationText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 5,
  },
  priceText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  originalPriceText: {
    fontSize: 12,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  discountText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#16A34A',
  },
  descText: {
    fontSize: 11.5,
    color: '#6B7280',
    lineHeight: 16,
  },

  // Right column — image + book btn
  cardRight: {
    width: 80,
    alignItems: 'center',
    gap: 8,
  },
  imageWrapper: {
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },
  servicePhoto: {
    width: '100%',
    height: '100%',
  },
  fallbackPhoto: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F5EE',
  },
  bookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#0F9D58',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    shadowColor: '#0F9D58',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3,
    width: 80,
    justifyContent: 'center',
  },
  bookBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Skeleton
  skeletonCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E8EDEB',
  },
});
