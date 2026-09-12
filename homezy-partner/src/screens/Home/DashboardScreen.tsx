import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  Vibration,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Briefcase,
  CheckCircle,
  IndianRupee,
  ShieldCheck,
  Star,
  TrendingUp,
  Zap,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getActiveJobs, getIncomingJobs } from '@/services/jobService';
import { getEarningsSummary } from '@/services/earningsService';
import { setDutyStatus } from '@/services/locationService';
import { useAuthStore } from '@/store/authStore';
import JobCard, { JobCardSkeleton } from '@/components/JobCard';
import DutyToggle from '@/components/DutyToggle';
import { ToastProvider, Toast } from '@/components/Toast';
// Toast already imported as named
import { colors, radius, shadows, spacing, typography } from '@/theme/theme';

export default function DashboardScreen() {
  const navigation = useNavigation<any>();
  const { provider, setProvider } = useAuthStore();
  const queryClient = useQueryClient();
  const [togglingDuty, setTogglingDuty] = useState(false);
  const prevIncomingCount = useRef(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulse animation for live indicator
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.3, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  const { data: activeJobs, isLoading: loadingActive, refetch: refetchActive } = useQuery({
    queryKey: ['jobs', 'active'],
    queryFn: getActiveJobs,
    refetchInterval: 8000,
  });

  const { data: incomingJobs, isLoading: loadingIncoming, refetch: refetchIncoming } = useQuery({
    queryKey: ['jobs', 'incoming'],
    queryFn: getIncomingJobs,
    enabled: !!provider?.isOnDuty,
    refetchInterval: provider?.isOnDuty ? 8000 : false,
  });

  const { data: earnings } = useQuery({
    queryKey: ['earnings', 'summary'],
    queryFn: getEarningsSummary,
  });

  useEffect(() => {
    const currentCount = incomingJobs?.length ?? 0;
    if (provider?.isOnDuty && currentCount > prevIncomingCount.current && prevIncomingCount.current !== 0) {
      Vibration.vibrate([0, 500, 200, 500]);
      Toast.show({ message: '🔔 New job request arrived!', type: 'info' });
    }
    prevIncomingCount.current = currentCount;
  }, [incomingJobs, provider?.isOnDuty]);

  const handleToggleDuty = async (value: boolean) => {
    setTogglingDuty(true);
    try {
      await setDutyStatus(value);
      if (provider) {
        setProvider({ ...provider, isOnDuty: value });
      }
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      Toast.show({
        message: value ? "You're now Online ✅" : "You're now Offline",
        type: value ? 'success' : 'info',
      });
    } finally {
      setTogglingDuty(false);
    }
  };

  const handleRefresh = () => {
    refetchActive();
    refetchIncoming();
  };

  const isLoading = loadingActive || loadingIncoming;
  const hasActive = (activeJobs?.length ?? 0) > 0;
  const hasIncoming = (incomingJobs?.length ?? 0) > 0;

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ToastProvider />
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Header */}
      <LinearGradient
        colors={['#1A73E8', '#0F5BC4']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={[styles.hCircle, { width: 200, height: 200, top: -60, right: -50, opacity: 0.12 }]} />
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerGreet}>Welcome back 👋</Text>
            <Text style={styles.headerName}>{provider?.name ?? 'Partner'}</Text>
          </View>
          {/* Online status indicator */}
          <View style={styles.statusPill}>
            <Animated.View style={[styles.statusDot, { transform: [{ scale: pulseAnim }] }, provider?.isOnDuty ? styles.statusOnline : styles.statusOffline]} />
            <Text style={[styles.statusText, provider?.isOnDuty ? styles.statusTextOn : styles.statusTextOff]}>
              {provider?.isOnDuty ? 'Online' : 'Offline'}
            </Text>
          </View>
        </View>

        {/* Tier & earnings summary */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <IndianRupee size={14} color="#93C5FD" />
            <Text style={styles.summaryVal}>₹{earnings?.todayEarnings ?? 0}</Text>
            <Text style={styles.summaryLabel}>Today's Earnings</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryCard}>
            <CheckCircle size={14} color="#86EFAC" />
            <Text style={styles.summaryVal}>{earnings?.completedJobsToday ?? 0}</Text>
            <Text style={styles.summaryLabel}>Jobs Done</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryCard}>
            <Star size={14} color="#FCD34D" fill="#FCD34D" />
            <Text style={styles.summaryVal}>4.92</Text>
            <Text style={styles.summaryLabel}>Rating</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={handleRefresh} colors={[colors.primary]} />}
      >
        {/* Duty Toggle */}
        <View style={styles.toggleSection}>
          <DutyToggle
            isOnDuty={provider?.isOnDuty ?? false}
            onToggle={handleToggleDuty}
            loading={togglingDuty}
          />
        </View>

        {/* Tier / Bonus Strip */}
        <View style={styles.bonusCard}>
          <LinearGradient colors={['#FEF3C7', '#FDE68A']} style={styles.bonusGradient}>
            <View style={styles.tierRow}>
              <View style={styles.tierBadge}>
                <ShieldCheck size={14} color="#D97706" />
                <Text style={styles.tierText}>Gold Partner</Text>
              </View>
              <View style={styles.tierStars}>
                {[1,2,3,4,5].map(i => <Star key={i} size={10} color="#F59E0B" fill="#F59E0B" />)}
              </View>
            </View>
            <View style={styles.bonusRow}>
              <TrendingUp size={14} color="#92400E" />
              <Text style={styles.bonusText}>Complete 2 more jobs today to earn ₹200 bonus!</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: '60%' }]} />
            </View>
            <Text style={styles.progressLabel}>3/5 jobs today  ·  60% to bonus</Text>
          </LinearGradient>
        </View>

        {/* Active Jobs Section */}
        {hasActive && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconBox}>
                <Briefcase size={16} color="#FFFFFF" />
              </View>
              <Text style={styles.sectionTitle}>Active Jobs ({activeJobs!.length})</Text>
            </View>
            {activeJobs!.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onPress={() => navigation.navigate('JobDetail', { jobId: job.id, mode: 'active' })}
              />
            ))}
          </View>
        )}

        {/* Incoming Requests */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconBox, { backgroundColor: '#F59E0B' }]}>
              <Zap size={16} color="#FFFFFF" />
            </View>
            <Text style={styles.sectionTitle}>
              {provider?.isOnDuty ? `Incoming Requests${hasIncoming ? ` (${incomingJobs!.length})` : ''}` : 'Go Online to Receive Jobs'}
            </Text>
          </View>

          {!provider?.isOnDuty ? (
            <View style={styles.offlineCard}>
              <Text style={styles.offlineEmoji}>😴</Text>
              <Text style={styles.offlineTitle}>You're currently offline</Text>
              <Text style={styles.offlineSub}>
                Toggle your status to Online above to start receiving job requests from customers nearby.
              </Text>
            </View>
          ) : isLoading && !hasIncoming ? (
            <>
              <JobCardSkeleton />
              <JobCardSkeleton />
            </>
          ) : hasIncoming ? (
            incomingJobs!.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                isIncoming
                onExpire={() => refetchIncoming()}
                onPress={() => navigation.navigate('JobDetail', { jobId: job.id, mode: 'incoming' })}
              />
            ))
          ) : (
            <View style={styles.searchingCard}>
              <View style={styles.searchingIconWrap}>
                <Animated.View style={[styles.searchingPulse, { transform: [{ scale: pulseAnim }] }]} />
                <Zap size={24} color="#1A73E8" />
              </View>
              <Text style={styles.searchingTitle}>Searching for jobs nearby...</Text>
              <Text style={styles.searchingSub}>
                Stay online! New customer requests will appear here automatically.
              </Text>
            </View>
          )}
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F0F4FF' },

  // Header
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: 12,
    paddingBottom: spacing.lg,
    overflow: 'hidden',
  },
  hCircle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  headerGreet: { fontSize: 14, color: 'rgba(255,255,255,0.8)', fontWeight: '500' },
  headerName: { fontSize: 22, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.3 },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusOnline: { backgroundColor: '#34D399' },
  statusOffline: { backgroundColor: '#9CA3AF' },
  statusText: { fontSize: 13, fontWeight: '700' },
  statusTextOn: { color: '#34D399' },
  statusTextOff: { color: '#9CA3AF' },
  summaryRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  summaryCard: { flex: 1, alignItems: 'center', gap: 3 },
  summaryVal: { fontSize: 20, fontWeight: '800', color: '#FFFFFF' },
  summaryLabel: { fontSize: 11, color: 'rgba(255,255,255,0.8)', fontWeight: '500' },
  summaryDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)' },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.md, gap: spacing.md },

  // Toggle section
  toggleSection: {},

  // Bonus card
  bonusCard: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  bonusGradient: { padding: spacing.md },
  tierRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xs },
  tierBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  tierText: { fontSize: 14, fontWeight: '800', color: '#92400E' },
  tierStars: { flexDirection: 'row', gap: 2 },
  bonusRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.sm },
  bonusText: { fontSize: 13, fontWeight: '600', color: '#92400E', flex: 1 },
  progressTrack: {
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.12)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#F59E0B',
    borderRadius: 3,
  },
  progressLabel: { fontSize: 11, color: '#92400E', fontWeight: '600' },

  // Sections
  section: {},
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  sectionIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: '#111827', letterSpacing: -0.2 },

  // Offline
  offlineCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  offlineEmoji: { fontSize: 40, marginBottom: spacing.sm },
  offlineTitle: { fontSize: 16, fontWeight: '700', color: '#374151', marginBottom: 6 },
  offlineSub: { fontSize: 13, color: '#9CA3AF', textAlign: 'center', lineHeight: 20 },

  // Searching
  searchingCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  searchingIconWrap: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    position: 'relative',
  },
  searchingPulse: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#BFDBFE',
  },
  searchingTitle: { fontSize: 16, fontWeight: '700', color: '#1E40AF', marginBottom: 6 },
  searchingSub: { fontSize: 13, color: '#6B7280', textAlign: 'center', lineHeight: 20 },
});


