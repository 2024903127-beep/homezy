import React, { useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { JobsStackParamList } from '@/navigation/types';
import { getActiveJobs, getJobHistory } from '@/services/jobService';
import JobCard from '@/components/JobCard';
import TextField from '@/components/TextField';
import { JobCardSkeleton } from '@/components/SkeletonLoader';
import { colors, radius, spacing, typography } from '@/theme/theme';
import { Briefcase, CheckCircle2 } from 'lucide-react-native';

type Props = NativeStackScreenProps<JobsStackParamList, 'JobHistory'>;

export default function JobHistoryScreen({ navigation }: Props) {
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [search, setSearch] = useState('');

  const {
    data: activeJobs,
    isLoading: loadingActive,
    refetch: refetchActive,
  } = useQuery({
    queryKey: ['jobs', 'active'],
    queryFn: getActiveJobs,
    refetchInterval: 10000,
  });

  const {
    data: historyJobs,
    isLoading: loadingHistory,
    refetch: refetchHistory,
  } = useQuery({
    queryKey: ['jobs', 'history'],
    queryFn: getJobHistory,
  });

  const currentList = activeTab === 'active' ? (activeJobs ?? []) : (historyJobs ?? []);
  const isLoading = activeTab === 'active' ? loadingActive : loadingHistory;

  const filteredJobs = currentList.filter((j) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (j.serviceName && j.serviceName.toLowerCase().includes(q)) ||
      (j.customer?.name && j.customer.name.toLowerCase().includes(q)) ||
      (j.address?.city && j.address.city.toLowerCase().includes(q))
    );
  });

  const handleRefresh = () => {
    refetchActive();
    refetchHistory();
  };

  return (
    <View style={styles.container}>
      {/* Segmented Filter Tabs */}
      <View style={styles.tabContainer}>
        <Pressable
          style={[styles.tabButton, activeTab === 'active' && styles.tabButtonActive]}
          onPress={() => setActiveTab('active')}
        >
          <Briefcase size={16} color={activeTab === 'active' ? colors.primary : colors.textMuted} />
          <Text style={[styles.tabText, activeTab === 'active' && styles.tabTextActive]}>
            Active Jobs ({activeJobs?.length ?? 0})
          </Text>
        </Pressable>

        <Pressable
          style={[styles.tabButton, activeTab === 'history' && styles.tabButtonActive]}
          onPress={() => setActiveTab('history')}
        >
          <CheckCircle2 size={16} color={activeTab === 'history' ? colors.primary : colors.textMuted} />
          <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>
            Completed History ({historyJobs?.length ?? 0})
          </Text>
        </Pressable>
      </View>

      <FlatList
        data={filteredJobs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <TextField
              placeholder={activeTab === 'active' ? 'Search active jobs...' : 'Search completed history...'}
              value={search}
              onChangeText={setSearch}
            />
          </View>
        }
        renderItem={({ item }) => (
          <JobCard
            job={item}
            onPress={(job) =>
              navigation.navigate('JobDetail', {
                jobId: job.id,
                mode: activeTab === 'active' ? 'active' : 'history',
              })
            }
          />
        )}
        ListEmptyComponent={
          isLoading ? (
            <>
              <JobCardSkeleton />
              <JobCardSkeleton />
            </>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>
                {activeTab === 'active'
                  ? 'No active jobs in progress'
                  : 'No completed jobs match your search'}
              </Text>
              <Text style={styles.emptySub}>
                {activeTab === 'active'
                  ? 'Accepted bookings and jobs currently in progress will show up here.'
                  : 'Past completed work and invoice receipts will be stored here.'}
              </Text>
            </View>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAF9' },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    padding: spacing.xs,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  tabButtonActive: {
    backgroundColor: colors.primaryLight,
  },
  tabText: {
    ...typography.captionBold,
    color: colors.textMuted,
  },
  tabTextActive: {
    color: colors.primary,
  },
  list: { padding: spacing.lg },
  header: { marginBottom: spacing.md },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xxl,
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    ...typography.bodyBold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  emptySub: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
});
