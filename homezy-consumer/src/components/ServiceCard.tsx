import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Service } from '@/types/models';
import { colors, radius, spacing, typography } from '@/theme/theme';

interface ServiceCardProps {
  service: Service;
  onPress: (service: Service) => void;
}

export default function ServiceCard({ service, onPress }: ServiceCardProps) {
  return (
    <Pressable style={styles.card} onPress={() => onPress(service)}>
      <Image
        source={service.imageUrl ? { uri: service.imageUrl } : undefined}
        style={styles.image}
      />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {service.name}
        </Text>
        <Text style={styles.duration}>{service.estimatedDurationMinutes} mins</Text>
        <Text style={styles.price}>₹{service.price}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    alignItems: 'center',
  },
  image: {
    width: 64,
    height: 64,
    borderRadius: radius.sm,
    backgroundColor: colors.border,
  },
  info: { marginLeft: spacing.md, flex: 1 },
  name: { ...typography.bodyBold, color: colors.text },
  duration: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  price: { ...typography.bodyBold, color: colors.primary, marginTop: 4 },
});
