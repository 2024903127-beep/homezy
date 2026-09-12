import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { colors, radius, shadows, spacing, typography } from '@/theme/theme';
import { Wrench, MapPin, Shield } from 'lucide-react-native';

const CATEGORY_NAMES: Record<string, string> = {
  'ac-maintenance': 'AC Service & Maintenance',
  'electrical': 'Electrical Services',
  'plumbing': 'Plumbing Services',
  'home-cleaning': 'Home Cleaning & Hygiene',
  'carpentry': 'Carpentry & Furniture Repair',
};

export default function ServiceAreasScreen() {
  const provider = useAuthStore((s) => s.provider);

  const categories = provider?.categories ?? ['ac-maintenance', 'electrical'];
  const areas = provider?.coverageAreas ?? ['Delhi NCR', 'Pincode 110016', 'Pincode 110070'];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Category Section */}
      <View style={styles.sectionHeader}>
        <Wrench size={18} color={colors.primary} />
        <Text style={styles.sectionTitle}>Assigned Skills & Categories</Text>
      </View>
      <View style={styles.card}>
        {categories.length ? (
          <View style={styles.chipContainer}>
            {categories.map((catId) => (
              <View key={catId} style={styles.chip}>
                <Text style={styles.chipText}>{CATEGORY_NAMES[catId] ?? catId}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.empty}>No skills assigned yet. Complete KYC verification first.</Text>
        )}
      </View>

      {/* Coverage Section */}
      <View style={styles.sectionHeader}>
        <MapPin size={18} color={colors.primary} />
        <Text style={styles.sectionTitle}>Service Coverage Areas</Text>
      </View>
      <View style={styles.card}>
        {areas.length ? (
          <View style={styles.chipContainer}>
            {areas.map((area) => (
              <View key={area} style={styles.areaChip}>
                <Text style={styles.areaChipText}>{area}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.empty}>No coverage areas assigned yet.</Text>
        )}
      </View>

      {/* Note */}
      <View style={styles.noteBox}>
        <Shield size={16} color={colors.textMuted} />
        <Text style={styles.note}>
          Skills and service areas are assigned by the Homezy team based on your KYC verification and certifications.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, backgroundColor: '#F8FAF9' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.md, marginBottom: spacing.sm },
  sectionTitle: { ...typography.h4, color: colors.text },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    backgroundColor: '#EFF6FF',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  chipText: { ...typography.bodyBold, color: colors.primary, fontSize: 13 },
  areaChip: {
    backgroundColor: '#F3F4F6',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
  },
  areaChipText: { ...typography.body, color: colors.textSecondary, fontSize: 13 },
  empty: { ...typography.body, color: colors.textMuted },
  noteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  note: { ...typography.caption, color: colors.textMuted, flex: 1 },
});
