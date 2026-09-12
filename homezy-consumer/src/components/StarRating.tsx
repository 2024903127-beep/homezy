import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, spacing } from '@/theme/theme';

interface Props {
  value: number; // 0–5
  onChange?: (stars: number) => void;
  size?: number;
  style?: ViewStyle;
  readonly?: boolean;
}

export default function StarRating({ value, onChange, size = 32, style, readonly = false }: Props) {
  return (
    <View style={[styles.row, style]}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Pressable
          key={star}
          onPress={() => !readonly && onChange?.(star)}
          style={{ marginHorizontal: 2 }}
          disabled={readonly}
          hitSlop={8}
        >
          <Text style={{ fontSize: size, color: star <= value ? colors.warning : colors.border }}>
            ★
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
