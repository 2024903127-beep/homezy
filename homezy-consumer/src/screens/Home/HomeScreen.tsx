import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Bell,
  MapPin,
  Search,
  CheckCircle2,
  Star,
  ShieldCheck,
  Clock,
  Sparkles,
  ChevronDown,
  ArrowRight,
  Award,
} from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList } from '@/navigation/types';
import { getCategories, getServicesByCategory } from '@/services/catalogService';
import CategoryTile from '@/components/CategoryTile';
import SkeletonLoader, { SkeletonCategoryTile } from '@/components/SkeletonLoader';
import ErrorState from '@/components/ErrorState';
import { colors, radius, shadows, spacing, typography } from '@/theme/theme';
import { useAuthStore } from '@/store/authStore';
import { useBookingDraftStore } from '@/store/bookingDraftStore';
import { useLocationStore } from '@/store/locationStore';
import { useToastStore } from '@/store/toastStore';
import { Category, Service } from '@/types/models';

type Props = NativeStackScreenProps<HomeStackParamList, 'Home'>;

const { width } = Dimensions.get('window');
const BANNER_WIDTH = width - spacing.md * 2;

const PROMO_BANNERS = [
  {
    id: 'b1',
    headline: 'Get 20% OFF',
    subline: 'On your first verified home booking',
    code: 'FIRSTHOME',
    bg: '#0A4D34',
    accent: '#0F9D58',
  },
  {
    id: 'b2',
    headline: 'AC Service & Repair',
    subline: '2x faster cooling with foam jet technology',
    code: 'SUMMERAC',
    bg: '#0F2942',
    accent: '#0284C7',
  },
  {
    id: 'b3',
    headline: 'Full Home Deep Clean',
    subline: '30-day rework warranty & damage protection',
    code: 'CLEAN30',
    bg: '#1E1B4B',
    accent: '#6366F1',
  },
];

export default function HomeScreen({ navigation }: Props) {
  const user = useAuthStore((s) => s.user);
  const setService = useBookingDraftStore((s) => s.setService);
  const { city, area: currentArea, isDetecting, detectLocation } = useLocationStore();
  const toast = useToastStore();

  const [activeBanner, setActiveBanner] = useState(0);
  const bannerScrollX = useRef(new Animated.Value(0)).current;

  const handleLocationPress = async () => {
    const loc = await detectLocation();
    if (loc) {
      toast.success('Location set to ' + (loc.line1 || loc.city));
    } else {
      toast.error('Could not detect location. Please check GPS & permissions.');
    }
  };

  const {
    data: categories,
    isLoading: loadingCategories,
    isError: errorCategories,
    refetch: refetchCategories,
  } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const { data: popularServices, isLoading: loadingServices } = useQuery({
    queryKey: ['services', 'popular'],
    queryFn: () => getServicesByCategory('all'),
  });

  const handleSelectService = (svc: Service) => {
    setService(svc);
    navigation.navigate('ServiceDetail', { serviceId: svc.id });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <ScrollView showsVerticalScrollIndicator={false} stickyHeaderIndices={[0]}>
        {/* Header Bar */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.locationContainer}>
              <Text style={styles.brandTitle}>Homezy</Text>
              <TouchableOpacity
                style={styles.locationPill}
                onPress={handleLocationPress}
                activeOpacity={0.8}
              >
                <MapPin size={12} color="#0F9D58" />
                <Text style={styles.locationText} numberOfLines={1}>
                  {isDetecting ? 'Detecting GPS...' : (currentArea || city || 'Select Location')}
                </Text>
                <ChevronDown size={12} color="#0F9D58" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.notifBtn}
              onPress={() => (navigation.getParent() as any)?.navigate('ProfileTab', { screen: 'Notifications' })}
              activeOpacity={0.8}
            >
              <Bell size={20} color="#0F9D58" />
            </TouchableOpacity>
          </View>

          {/* User Greeting */}
          <View style={styles.greetingBox}>
            <Text style={styles.greetingText}>
              Hi, {user?.name?.split(' ')[0] ?? 'Rahul'}
            </Text>
            <Text style={styles.subGreeting}>What service do you need today?</Text>
          </View>

          {/* Search Bar Button */}
          <TouchableOpacity
            style={styles.searchBarContainer}
            onPress={() => navigation.navigate('Search')}
            activeOpacity={0.9}
          >
            <Search size={18} color="#0F9D58" style={{ marginLeft: spacing.sm }} />
            <Text style={styles.searchPlaceholder}>Search for AC repair, cleaning, plumbing...</Text>
            <View style={styles.searchButton}>
              <ArrowRight size={16} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Promotional Banner Carousel */}
        <View style={styles.bannerWrapper}>
          <FlatList
            data={PROMO_BANNERS}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            snapToInterval={BANNER_WIDTH + spacing.md}
            decelerationRate="fast"
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.bannerList}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: bannerScrollX } } }],
              { useNativeDriver: false }
            )}
            onMomentumScrollEnd={(e) => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / BANNER_WIDTH);
              setActiveBanner(idx);
            }}
            renderItem={({ item }) => (
              <View style={[styles.bannerCard, { backgroundColor: item.bg, width: BANNER_WIDTH }]}>
                <View style={{ flex: 1 }}>
                  <View style={[styles.promoCodeBadge, { backgroundColor: item.accent }]}>
                    <Text style={styles.promoCodeText}>USE {item.code}</Text>
                  </View>
                  <Text style={styles.bannerHeadline}>{item.headline}</Text>
                  <Text style={styles.bannerSubline}>{item.subline}</Text>
                  <TouchableOpacity
                    style={[styles.bannerBtn, { backgroundColor: item.accent }]}
                    onPress={() => {
                      const defaultSvc = popularServices?.[0];
                      if (defaultSvc) handleSelectService(defaultSvc);
                      else navigation.navigate('Search');
                    }}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.bannerBtnText}>Explore & Book</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.bannerGraphicBox}>
                  <ShieldCheck size={44} color="rgba(255,255,255,0.85)" />
                </View>
              </View>
            )}
          />

          {/* Banner Dots */}
          <View style={styles.dotsRow}>
            {PROMO_BANNERS.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  i === activeBanner ? styles.dotActive : styles.dotInactive,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Categories Section (Photo Cards) */}
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <View>
              <Text style={styles.sectionTitle}>All Services</Text>
              <Text style={styles.sectionSubtitle}>Verified home maintenance & repairs</Text>
            </View>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{categories?.length ?? 12} Categories</Text>
            </View>
          </View>

          {loadingCategories ? (
            <View style={styles.grid}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <SkeletonCategoryTile key={i} />
              ))}
            </View>
          ) : errorCategories ? (
            <ErrorState onRetry={refetchCategories} />
          ) : (
            <View style={styles.grid}>
              {categories?.map((cat) => (
                <CategoryTile
                  key={cat.id}
                  category={cat}
                  onPress={() =>
                    navigation.navigate('CategoryServices', {
                      categoryId: cat.id,
                      categoryName: cat.name,
                    })
                  }
                />
              ))}
            </View>
          )}
        </View>

        {/* Popular / Most Booked Services (Photo Cards) */}
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Most Booked Services</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Search')}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.popularScroll}
          >
            {popularServices?.slice(0, 6).map((svc) => (
              <TouchableOpacity
                key={svc.id}
                style={styles.popularCard}
                onPress={() => handleSelectService(svc)}
                activeOpacity={0.88}
              >
                {svc.imageUrl ? (
                  <Image
                    source={{ uri: svc.imageUrl }}
                    style={styles.popularImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.popularFallbackImage}>
                    <Sparkles size={24} color="#0F9D58" />
                  </View>
                )}

                <View style={styles.popularCardBody}>
                  <Text style={styles.popularName} numberOfLines={2}>{svc.name}</Text>
                  
                  <View style={styles.popularMetaRow}>
                    <Clock size={11} color="#6B7280" />
                    <Text style={styles.popularMetaText}>{svc.estimatedDurationMinutes}m</Text>
                    <Text style={styles.metaDot}>•</Text>
                    <Star size={11} color="#F59E0B" fill="#F59E0B" />
                    <Text style={styles.popularMetaText}>4.8</Text>
                  </View>

                  <View style={styles.popularBottomRow}>
                    <Text style={styles.popularPrice}>₹{svc.price}</Text>
                    <View style={styles.addPill}>
                      <Text style={styles.addPillText}>Book</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Trust & Assurance Strip */}
        <View style={styles.trustBar}>
          <View style={styles.trustItem}>
            <ShieldCheck size={18} color="#0F9D58" />
            <Text style={styles.trustLabel}>100% Verified</Text>
          </View>
          <View style={styles.trustDivider} />
          <View style={styles.trustItem}>
            <CheckCircle2 size={18} color="#0F9D58" />
            <Text style={styles.trustLabel}>Upfront Pricing</Text>
          </View>
          <View style={styles.trustDivider} />
          <View style={styles.trustItem}>
            <Award size={18} color="#0F9D58" />
            <Text style={styles.trustLabel}>30-Day Guarantee</Text>
          </View>
        </View>

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAF9' },

  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: spacing.md,
    paddingTop: 52,
    paddingBottom: spacing.md,
    ...shadows.sm,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  locationContainer: { flex: 1 },
  brandTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F9D58',
    letterSpacing: -0.5,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
    backgroundColor: '#E8F5EE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  locationText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F9D58',
    maxWidth: 180,
  },
  notifBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5EE',
    alignItems: 'center',
    justifyContent: 'center',
  },

  greetingBox: { marginBottom: spacing.md },
  greetingText: { fontSize: 20, fontWeight: '700', color: '#111827' },
  subGreeting: { fontSize: 13, color: '#6B7280', marginTop: 2 },

  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: radius.pill,
    height: 48,
    paddingLeft: spacing.xs,
    paddingRight: 4,
  },
  searchPlaceholder: {
    flex: 1,
    color: '#9CA3AF',
    fontSize: 13,
    marginLeft: spacing.xs,
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0F9D58',
    alignItems: 'center',
    justifyContent: 'center',
  },

  bannerWrapper: { marginTop: spacing.md },
  bannerList: { paddingHorizontal: spacing.md, gap: spacing.md },
  bannerCard: {
    flexDirection: 'row',
    borderRadius: 20,
    padding: spacing.lg,
    alignItems: 'center',
    overflow: 'hidden',
  },
  promoCodeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.xs,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  promoCodeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  bannerHeadline: {
    fontSize: 19,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  bannerSubline: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: spacing.md,
    lineHeight: 16,
  },
  bannerBtn: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
  },
  bannerBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bannerGraphicBox: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  dot: { height: 6, borderRadius: 3 },
  dotActive: { width: 18, backgroundColor: '#0F9D58' },
  dotInactive: { width: 6, backgroundColor: '#D1D5DB' },

  section: { paddingHorizontal: spacing.md, marginTop: spacing.lg },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm + 2,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  countBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  seeAll: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F9D58',
  },

  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },

  popularScroll: { paddingVertical: 4, gap: 12 },
  popularCard: {
    width: 155,
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...shadows.sm,
  },
  popularImage: {
    width: '100%',
    height: 95,
  },
  popularFallbackImage: {
    width: '100%',
    height: 95,
    backgroundColor: '#E8F5EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  popularCardBody: {
    padding: spacing.sm + 2,
  },
  popularName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
    height: 36,
  },
  popularMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginBottom: spacing.sm,
  },
  popularMetaText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  metaDot: { fontSize: 10, color: '#9CA3AF' },

  popularBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  popularPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F9D58',
  },
  addPill: {
    backgroundColor: '#E8F5EE',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(15, 157, 88, 0.2)',
  },
  addPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F9D58',
  },

  trustBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: spacing.md,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    marginTop: spacing.xl,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...shadows.sm,
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  trustLabel: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '600',
  },
  trustDivider: {
    width: 1,
    height: 18,
    backgroundColor: '#E5E7EB',
  },
});
