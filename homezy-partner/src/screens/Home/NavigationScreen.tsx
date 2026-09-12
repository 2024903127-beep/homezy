import React from 'react';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList } from '@/navigation/types';
import { getJobById, updateJobStatus } from '@/services/jobService';
import Button from '@/components/Button';
import { Toast } from '@/components/Toast';
import { colors, radius, shadows, spacing, typography } from '@/theme/theme';
import { MapPin, Phone, Navigation as NavIcon, ArrowLeft } from 'lucide-react-native';

type Props = NativeStackScreenProps<HomeStackParamList, 'Navigation'>;

export default function NavigationScreen({ route, navigation }: Props) {
  const { jobId } = route.params;

  const { data: job, isLoading } = useQuery({
    queryKey: ['job', jobId],
    queryFn: () => getJobById(jobId),
  });

  const handleOpenMaps = () => {
    if (!job) return;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${job.address.latitude},${job.address.longitude}`;
    Linking.openURL(url);
  };

  const handleCall = () => {
    if (!job) return;
    Linking.openURL(`tel:${job.customer.phone}`);
  };

  const handleArrived = async () => {
    try {
      await updateJobStatus(jobId, 'PROVIDER_ARRIVED');
      Toast.show({ message: 'Marked as Arrived at customer location!', type: 'success' });
      navigation.goBack();
    } catch {
      Toast.show({ message: 'Failed to update status', type: 'error' });
    }
  };

  if (isLoading || !job) {
    return (
      <View style={styles.center}>
        <Text style={styles.body}>Loading address…</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <Button label="Back" variant="ghost" onPress={() => navigation.goBack()} />
        <Text style={styles.headerTitle}>Navigation</Text>
      </View>

      {/* Map simulation card */}
      <View style={styles.mapSimCard}>
        <NavIcon size={48} color={colors.primary} />
        <Text style={styles.mapSimText}>GPS Navigation Mode</Text>
        <Text style={styles.mapCoords}>
          Lat: {job.address.latitude} · Lng: {job.address.longitude}
        </Text>
        <Button
          label="Open in Google Maps"
          onPress={handleOpenMaps}
          style={{ marginTop: spacing.md, width: '100%' }}
        />
      </View>

      {/* Address Details */}
      <View style={styles.card}>
        <View style={styles.cardTitleRow}>
          <MapPin size={18} color={colors.primary} />
          <Text style={styles.cardTitle}>Customer Address</Text>
        </View>
        <Text style={styles.addressLine}>{job.address.line1}</Text>
        {job.address.line2 ? <Text style={styles.addressLine}>{job.address.line2}</Text> : null}
        <Text style={styles.addressMuted}>
          {job.address.city}, {job.address.state} - {job.address.pincode}
        </Text>
      </View>

      {/* Customer Contact */}
      <View style={styles.card}>
        <View style={styles.cardTitleRow}>
          <Phone size={18} color={colors.primary} />
          <Text style={styles.cardTitle}>Customer Contact</Text>
        </View>
        <Text style={styles.customerName}>{job.customer.name}</Text>
        <Text style={styles.customerPhone}>+91 {job.customer.phone}</Text>
        <Button
          label={`Call ${job.customer.name.split(' ')[0]}`}
          variant="outline"
          onPress={handleCall}
          style={{ marginTop: spacing.md }}
        />
      </View>

      {/* Action */}
      {job.status === 'PROVIDER_ASSIGNED' && (
        <Button label="I Have Arrived" onPress={handleArrived} style={{ marginTop: spacing.md }} />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, backgroundColor: '#F8FAF9' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  body: { ...typography.body, color: colors.textMuted },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  headerTitle: { ...typography.h3, color: colors.text, marginLeft: spacing.sm },

  mapSimCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  mapSimText: { ...typography.h3, color: colors.primary, marginTop: spacing.sm },
  mapCoords: { ...typography.caption, color: colors.textMuted, marginTop: 2 },

  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  cardTitle: { ...typography.bodyBold, color: colors.text },
  addressLine: { ...typography.body, color: colors.text },
  addressMuted: { ...typography.caption, color: colors.textMuted, marginTop: 4 },
  customerName: { ...typography.bodyBold, color: colors.text },
  customerPhone: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
});
