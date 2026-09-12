import React, { useRef } from 'react';
import { Animated, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Star } from 'lucide-react-native';
import { Category } from '@/types/models';
import { shadows } from '@/theme/theme';

// Exact brand icons from Vishakha's design
const BRAND_ICONS: Record<string, any> = {
  'plumbing': require('@/assets/categories/plumbing.png'),
  'electrician': require('@/assets/categories/electrician.png'),
  'carpentry': require('@/assets/categories/carpentry.png'),
  'ac-repair': require('@/assets/categories/ac_repair.png'),
  'home-cleaning': require('@/assets/categories/home_cleaning.png'),
  'painting': require('@/assets/categories/painting.png'),
  'pest-control': require('@/assets/categories/pest_control.png'),
  'appliance-repair': require('@/assets/categories/appliance_repair.png'),
  'gardening': require('@/assets/categories/gardening.png'),
  'locksmith': require('@/assets/categories/locksmith.png'),
  'water-tank-cleaning': require('@/assets/categories/water_tank_cleaning.png'),
  'general-home-repairs': require('@/assets/categories/general_home_repairs.png'),
};

const BRAND_ICONS_BY_NAME: Record<string, any> = {
  'Plumbing': require('@/assets/categories/plumbing.png'),
  'Plumber': require('@/assets/categories/plumbing.png'),
  'Electrician': require('@/assets/categories/electrician.png'),
  'Electrical': require('@/assets/categories/electrician.png'),
  'Carpentry': require('@/assets/categories/carpentry.png'),
  'Carpenter': require('@/assets/categories/carpentry.png'),
  'AC Repair': require('@/assets/categories/ac_repair.png'),
  'AC Maintenance': require('@/assets/categories/ac_repair.png'),
  'AC Service': require('@/assets/categories/ac_repair.png'),
  'Home Cleaning': require('@/assets/categories/home_cleaning.png'),
  'Cleaning': require('@/assets/categories/home_cleaning.png'),
  'Painting': require('@/assets/categories/painting.png'),
  'Painter': require('@/assets/categories/painting.png'),
  'Pest Control': require('@/assets/categories/pest_control.png'),
  'Appliance Repair': require('@/assets/categories/appliance_repair.png'),
  'Appliance': require('@/assets/categories/appliance_repair.png'),
  'KITCHEN': require('@/assets/categories/appliance_repair.png'),
  'Kitchen': require('@/assets/categories/appliance_repair.png'),
  'Gardening': require('@/assets/categories/gardening.png'),
  'Locksmith': require('@/assets/categories/locksmith.png'),
  'Water Tank Cleaning': require('@/assets/categories/water_tank_cleaning.png'),
  'General Home Repairs': require('@/assets/categories/general_home_repairs.png'),
  'General Repairs': require('@/assets/categories/general_home_repairs.png'),
};

const STARTING_PRICES: Record<string, string> = {
  'Plumbing': 'From ₹299',
  'Electrician': 'From ₹199',
  'Electrical': 'From ₹199',
  'Carpentry': 'From ₹349',
  'AC Repair': 'From ₹499',
  'AC Maintenance': 'From ₹499',
  'Home Cleaning': 'From ₹499',
  'Cleaning': 'From ₹499',
  'Painting': 'From ₹899',
  'Pest Control': 'From ₹699',
  'Appliance Repair': 'From ₹399',
  'Appliance': 'From ₹399',
  'KITCHEN': 'From ₹399',
  'Gardening': 'From ₹399',
  'Locksmith': 'From ₹499',
  'Water Tank Cleaning': 'From ₹799',
  'General Home Repairs': 'From ₹299',
};

interface CategoryTileProps {
  category: Category;
  onPress: (category: Category) => void;
  index?: number;
}

export default function CategoryTile({ category, onPress }: CategoryTileProps) {
  const scale = useRef(new Animated.Value(1)).current;

  // Resolve thumbnail: check local brand asset first for ultra-sharp rendering
  const brandAsset =
    BRAND_ICONS[category.id] ||
    BRAND_ICONS_BY_NAME[category.name] ||
    BRAND_ICONS_BY_NAME[category.name.trim()];

  const startingPrice = STARTING_PRICES[category.name] || 'From ₹299';

  const onPressIn = () => {
    Animated.spring(scale, { toValue: 0.94, useNativeDriver: true, tension: 150, friction: 9 }).start();
  };
  const onPressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 150, friction: 9 }).start();
  };

  return (
    <Pressable
      style={styles.tileWrapper}
      onPress={() => onPress(category)}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
    >
      <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
        <View style={styles.topRow}>
          {brandAsset ? (
            <Image source={brandAsset} style={styles.brandIcon} resizeMode="contain" />
          ) : category.iconUrl || category.imageUrl ? (
            <Image
              source={{ uri: category.iconUrl || category.imageUrl }}
              style={styles.brandIcon}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.fallbackIcon} />
          )}

          <View style={styles.ratingBadge}>
            <Star size={10} color="#F59E0B" fill="#F59E0B" />
            <Text style={styles.ratingText}>4.8</Text>
          </View>
        </View>

        <Text style={styles.name} numberOfLines={2}>
          {category.name}
        </Text>

        <View style={styles.pricePill}>
          <Text style={styles.priceText}>{startingPrice}</Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tileWrapper: {
    width: '48.2%',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 13,
    borderWidth: 1,
    borderColor: '#E8EDEB',
    ...shadows.sm,
    justifyContent: 'space-between',
    minHeight: 142,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  brandIcon: {
    width: 62,
    height: 62,
    borderRadius: 16,
  },
  fallbackIcon: {
    width: 62,
    height: 62,
    borderRadius: 16,
    backgroundColor: '#064E3B',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
  },
  ratingText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#92400E',
  },
  name: {
    color: '#1E293B',
    fontSize: 13.5,
    lineHeight: 18,
    fontWeight: '700',
    marginTop: 8,
  },
  pricePill: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  priceText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
});
