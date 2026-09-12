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
  ArrowLeft,
  CheckCircle2,
  Clock,
  IndianRupee,
  Share2,
  ShieldCheck,
  Sparkles,
  Star,
  XCircle,
  Zap,
  Camera,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery } from '@tanstack/react-query';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList } from '@/navigation/types';
import { getServiceById } from '@/services/catalogService';
import { useBookingDraftStore } from '@/store/bookingDraftStore';
import { colors, radius, shadows, spacing, typography } from '@/theme/theme';

type Props = NativeStackScreenProps<HomeStackParamList, 'ServiceDetail'>;

const { width } = Dimensions.get('window');

const HOW_IT_WORKS = [
  { step: '1', title: 'Choose Date & Slot', desc: 'Pick your preferred time. Verified pro assigned in seconds.' },
  { step: '2', title: 'Doorstep Service', desc: 'Partner arrives on time in uniform with sanitized professional tools.' },
  { step: '3', title: 'Pay After Satisfaction', desc: 'Inspect work, pay via UPI/Cash, covered by 30-day Homezy warranty.' },
];

const PHOTO_CAPTIONS = [
  'Equipment & Inspection: Certified pro diagnostic',
  'Execution in Progress: High-pressure deep treatment',
  'Finished Result: 100% Quality & sanitization checked',
];

export default function ServiceDetailScreen({ route, navigation }: Props) {
  const { serviceId } = route.params;
  const setService = useBookingDraftStore((s) => s.setService);
  const [activeTab, setActiveTab] = useState<'inclusions' | 'exclusions'>('inclusions');
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  const { data: service, isLoading } = useQuery({
    queryKey: ['service', serviceId],
    queryFn: () => getServiceById(serviceId),
  });

  if (isLoading || !service) {
    return (
      <View style={styles.center}>
        <StatusBar barStyle="dark-content" />
        <Text style={styles.loading}>Loading service details...</Text>
      </View>
    );
  }

  // Get gallery photos (up to 3 photos of the service)
  const galleryPhotos: string[] = service.images && service.images.length > 0
    ? service.images
    : service.imageUrl
    ? [service.imageUrl]
    : [
        'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80',
      ];

  const handleBookNow = () => {
    setService(service);
    navigation.navigate('AddressList', { selectMode: true });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* 3-Photo Showcase Slider */}
        <View style={styles.carouselContainer}>
          <FlatList
            data={galleryPhotos}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, i) => i.toString()}
            onMomentumScrollEnd={(e) => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / width);
              setActivePhotoIdx(idx);
            }}
            renderItem={({ item }) => (
              <View style={styles.photoSlide}>
                <Image source={{ uri: item }} style={styles.carouselImage} resizeMode="cover" />
                <LinearGradient
                  colors={['rgba(0,0,0,0.5)', 'transparent', 'rgba(0,0,0,0.7)']}
                  style={StyleSheet.absoluteFill}
                />
              </View>
            )}
          />

          {/* Top floating bar */}
          <View style={styles.floatingTopBar}>
            <TouchableOpacity
              style={styles.floatingIconBtn}
              onPress={() => navigation.goBack()}
              activeOpacity={0.8}
            >
              <ArrowLeft size={20} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.floatingIconBtn} activeOpacity={0.8}>
              <Share2 size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Photo Counter & Badge */}
          <View style={styles.photoBadgeRow}>
            <View style={styles.photoCountPill}>
              <Camera size={12} color="#FFFFFF" />
              <Text style={styles.photoCountText}>
                {activePhotoIdx + 1} of {galleryPhotos.length} Photos
              </Text>
            </View>

            {/* Pagination dots */}
            <View style={styles.dotsRow}>
              {galleryPhotos.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    i === activePhotoIdx ? styles.dotActive : styles.dotInactive,
                  ]}
                />
              ))}
            </View>
          </View>

          {/* Photo Caption Pill */}
          <View style={styles.captionBanner}>
            <Text style={styles.captionText} numberOfLines={1}>
              {PHOTO_CAPTIONS[activePhotoIdx] ?? 'Professional service demonstration'}
            </Text>
          </View>
        </View>

        {/* Service Header Info */}
        <View style={styles.headerInfoCard}>
          <View style={styles.proBadge}>
            <Sparkles size={12} color="#00B386" />
            <Text style={styles.proBadgeText}>HOMEZY ASSURED</Text>
          </View>

          <Text style={styles.title}>{service.name}</Text>

          <View style={styles.chipsRow}>
            <View style={styles.ratingChip}>
              <Star size={13} color="#F59E0B" fill="#F59E0B" />
              <Text style={styles.ratingText}>4.88 (14.2k bookings)</Text>
            </View>
            <View style={styles.durationChip}>
              <Clock size={13} color="#6B7280" />
              <Text style={styles.durationText}>{service.estimatedDurationMinutes} mins</Text>
            </View>
          </View>
        </View>

        {/* Homezy Promise Banner */}
        <View style={styles.promiseCard}>
          <LinearGradient
            colors={['#E8F5EE', '#F0FBF7']}
            style={styles.promiseGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.promiseIconBox}>
              <ShieldCheck size={26} color="#00B386" />
            </View>
            <View style={styles.promiseTextCol}>
              <Text style={styles.promiseTitle}>The Homezy Guarantee</Text>
              <Text style={styles.promiseDesc}>
                30-day rework warranty • ₹10,000 damage protection • Background-verified pros
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* Service Description */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeading}>About this Service</Text>
          <Text style={styles.description}>{service.description}</Text>
        </View>

        {/* Inclusions & Exclusions Tabs */}
        <View style={styles.sectionCard}>
          <View style={styles.tabHeader}>
            <Pressable
              style={[styles.tabBtn, activeTab === 'inclusions' && styles.tabBtnActive]}
              onPress={() => setActiveTab('inclusions')}
            >
              <CheckCircle2 size={16} color={activeTab === 'inclusions' ? '#00B386' : '#9CA3AF'} />
              <Text style={[styles.tabBtnText, activeTab === 'inclusions' && styles.tabBtnTextActive]}>
                What is included ({service.inclusions?.length ?? 0})
              </Text>
            </Pressable>
            <Pressable
              style={[styles.tabBtn, activeTab === 'exclusions' && styles.tabBtnActive]}
              onPress={() => setActiveTab('exclusions')}
            >
              <XCircle size={16} color={activeTab === 'exclusions' ? '#EF4444' : '#9CA3AF'} />
              <Text style={[styles.tabBtnText, activeTab === 'exclusions' && styles.tabBtnTextActive]}>
                Not included ({service.exclusions?.length ?? 0})
              </Text>
            </Pressable>
          </View>

          <View style={styles.tabContent}>
            {activeTab === 'inclusions' && (
              service.inclusions && service.inclusions.length > 0 ? (
                service.inclusions.map((item: string, idx: number) => (
                  <View key={idx} style={styles.itemRow}>
                    <View style={styles.checkCircle}>
                      <CheckCircle2 size={16} color="#00B386" />
                    </View>
                    <Text style={styles.itemText}>{item}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyNote}>Complete end-to-end service included.</Text>
              )
            )}

            {activeTab === 'exclusions' && (
              service.exclusions && service.exclusions.length > 0 ? (
                service.exclusions.map((item: string, idx: number) => (
                  <View key={idx} style={styles.itemRow}>
                    <View style={styles.crossCircle}>
                      <XCircle size={16} color="#EF4444" />
                    </View>
                    <Text style={styles.itemText}>{item}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyNote}>No extra exclusions. Transparent pricing.</Text>
              )
            )}
          </View>
        </View>

        {/* How It Works */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeading}>How Homezy Works</Text>
          <View style={styles.timeline}>
            {HOW_IT_WORKS.map((step, idx) => (
              <View key={idx} style={styles.timelineRow}>
                <View style={styles.stepCircle}>
                  <Text style={styles.stepNum}>{step.step}</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepDesc}>{step.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* Sticky Bottom Booking Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.priceCol}>
          <Text style={styles.totalPriceLabel}>Total Price</Text>
          <View style={styles.priceRow}>
            <IndianRupee size={20} color="#111827" />
            <Text style={styles.totalPrice}>{service.price}</Text>
          </View>
          <Text style={styles.inclusiveText}>Includes taxes & fees</Text>
        </View>

        <TouchableOpacity
          style={styles.bookBtn}
          onPress={handleBookNow}
          activeOpacity={0.88}
        >
          <LinearGradient
            colors={['#00C896', '#009E75']}
            style={styles.bookBtnGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Zap size={18} color="#FFFFFF" fill="#FFFFFF" />
            <Text style={styles.bookBtnText}>Select Slot</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  loading: { ...typography.body, color: colors.textMuted },
  scrollContent: { paddingBottom: 20 },

  carouselContainer: {
    width,
    height: 260,
    backgroundColor: '#000000',
    position: 'relative',
  },
  photoSlide: { width, height: 260 },
  carouselImage: { width: '100%', height: '100%' },

  floatingTopBar: {
    position: 'absolute',
    top: 50,
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  floatingIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  photoBadgeRow: {
    position: 'absolute',
    bottom: 34,
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  photoCountPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  photoCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  dot: { height: 6, borderRadius: 3 },
  dotActive: { width: 18, backgroundColor: '#FFFFFF' },
  dotInactive: { width: 6, backgroundColor: 'rgba(255,255,255,0.4)' },

  captionBanner: {
    position: 'absolute',
    bottom: 6,
    left: spacing.md,
    right: spacing.md,
  },
  captionText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },

  headerInfoCard: {
    backgroundColor: '#FFFFFF',
    padding: spacing.lg,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    ...shadows.sm,
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E8F5EE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
    marginBottom: spacing.xs,
  },
  proBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#00B386',
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.3,
    lineHeight: 28,
    marginBottom: spacing.sm,
  },
  chipsRow: { flexDirection: 'row', gap: spacing.sm },
  ratingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  ratingText: { fontSize: 12, fontWeight: '700', color: '#B45309' },
  durationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  durationText: { fontSize: 12, fontWeight: '600', color: '#4B5563' },

  promiseCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#D1FAE5',
    ...shadows.sm,
  },
  promiseGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  promiseIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  promiseTextCol: { flex: 1 },
  promiseTitle: { fontSize: 14, fontWeight: '700', color: '#065F46', marginBottom: 2 },
  promiseDesc: { fontSize: 11, color: '#047857', lineHeight: 15 },

  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...shadows.sm,
  },
  sectionHeading: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: spacing.sm },
  description: { fontSize: 13, color: '#4B5563', lineHeight: 20 },

  tabHeader: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: radius.lg,
    padding: 3,
    marginBottom: spacing.md,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: radius.md,
  },
  tabBtnActive: { backgroundColor: '#FFFFFF', ...shadows.sm },
  tabBtnText: { fontSize: 11, fontWeight: '600', color: '#6B7280' },
  tabBtnTextActive: { color: '#111827', fontWeight: '700' },
  tabContent: { gap: spacing.sm },
  itemRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, marginBottom: 4 },
  checkCircle: { marginTop: 2 },
  crossCircle: { marginTop: 2 },
  itemText: { fontSize: 13, color: '#374151', flex: 1, lineHeight: 19 },
  emptyNote: { fontSize: 12, color: '#9CA3AF', fontStyle: 'italic' },

  timeline: { gap: spacing.md, marginTop: spacing.xs },
  timelineRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  stepCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#E8F5EE',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#00B386',
  },
  stepNum: { fontSize: 12, fontWeight: '800', color: '#00B386' },
  stepContent: { flex: 1 },
  stepTitle: { fontSize: 13, fontWeight: '700', color: '#111827', marginBottom: 2 },
  stepDesc: { fontSize: 11, color: '#6B7280', lineHeight: 16 },

  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    paddingBottom: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shadows.lg,
  },
  priceCol: { justifyContent: 'center' },
  totalPriceLabel: {
    fontSize: 10,
    color: '#6B7280',
    textTransform: 'uppercase',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  priceRow: { flexDirection: 'row', alignItems: 'center', marginTop: 1 },
  totalPrice: { fontSize: 22, fontWeight: '800', color: '#111827', marginLeft: 1 },
  inclusiveText: { fontSize: 10, color: '#10B981', fontWeight: '600' },
  bookBtn: { borderRadius: radius.pill, overflow: 'hidden', ...shadows.md },
  bookBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: spacing.xl,
    paddingVertical: 13,
  },
  bookBtnText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF', letterSpacing: 0.2 },
});
