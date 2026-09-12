import React, { useState } from 'react';
import {
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Search, X, Clock, IndianRupee, Sparkles, ArrowRight } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList } from '@/navigation/types';
import { getCategories, getServicesByCategory } from '@/services/catalogService';
import { useBookingDraftStore } from '@/store/bookingDraftStore';
import { Service } from '@/types/models';
import { colors, radius, shadows, spacing, typography } from '@/theme/theme';

type Props = NativeStackScreenProps<HomeStackParamList, 'Search'>;

export default function SearchScreen({ navigation }: Props) {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const setService = useBookingDraftStore((s) => s.setService);

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const { data: services, isLoading } = useQuery({
    queryKey: ['services', selectedCategory],
    queryFn: () => getServicesByCategory(selectedCategory),
  });

  const filteredServices = (services ?? []).filter((s) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q);
  });

  const handleSelectService = (svc: Service) => {
    setService(svc);
    navigation.navigate('ServiceDetail', { serviceId: svc.id });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Header Bar */}
      <View style={styles.searchHeader}>
        <View style={styles.inputContainer}>
          <Search size={18} color="#0F9D58" style={styles.searchIcon} />
          <TextInput
            autoFocus
            placeholder="Search AC, cleaning, plumbing, repairs..."
            placeholderTextColor="#9CA3AF"
            value={query}
            onChangeText={setQuery}
            style={styles.input}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} style={styles.clearBtn}>
              <X size={16} color="#6B7280" />
            </Pressable>
          )}
        </View>
      </View>

      {/* Category Filter Pills */}
      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[{ id: 'all', name: 'All Services' }, ...(categories ?? [])]}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: spacing.md, gap: 8 }}
          renderItem={({ item }) => {
            const isSelected = selectedCategory === item.id;
            return (
              <Pressable
                style={[styles.pill, isSelected && styles.pillActive]}
                onPress={() => setSelectedCategory(item.id)}
              >
                <Text style={[styles.pillText, isSelected && styles.pillTextActive]}>
                  {item.name}
                </Text>
              </Pressable>
            );
          }}
        />
      </View>

      {/* Services List */}
      <FlatList
        data={filteredServices}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [styles.serviceCard, pressed && styles.cardPressed]}
            onPress={() => handleSelectService(item)}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.serviceName}>{item.name}</Text>
              <Text style={styles.serviceDesc} numberOfLines={2}>
                {item.description}
              </Text>
              <View style={styles.metaRow}>
                <View style={styles.priceTag}>
                  <IndianRupee size={13} color="#0F9D58" />
                  <Text style={styles.priceValue}>{item.price}</Text>
                </View>
                <View style={styles.metaDivider} />
                <View style={styles.durationTag}>
                  <Clock size={12} color="#6B7280" />
                  <Text style={styles.durationText}>{item.estimatedDurationMinutes} mins</Text>
                </View>
              </View>
            </View>
            <View style={styles.arrowBox}>
              <ArrowRight size={16} color="#0F9D58" />
            </View>
          </Pressable>
        )}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyBox}>
              <Sparkles size={36} color="#0F9D58" style={{ marginBottom: 12 }} />
              <Text style={styles.emptyTitle}>No matching services found</Text>
              <Text style={styles.emptySub}>Try searching for "AC", "cleaning", "tap", or "wiring".</Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAF9' },
  searchHeader: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: '#FFFFFF',
    ...shadows.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: radius.pill,
    height: 46,
    paddingHorizontal: spacing.md,
  },
  searchIcon: { marginRight: spacing.xs },
  input: { flex: 1, fontSize: 14, color: '#111827', fontWeight: '500' },
  clearBtn: { padding: 4 },

  filterContainer: {
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: '#F3F4F6',
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillActive: {
    backgroundColor: '#0F9D58',
  },
  pillText: { fontSize: 12, fontWeight: '600', color: '#4B5563' },
  pillTextActive: { color: '#FFFFFF', fontWeight: '700' },

  listContent: { padding: spacing.md, gap: 10 },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    ...shadows.sm,
  },
  cardPressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
  serviceName: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 2 },
  serviceDesc: { fontSize: 12, color: '#6B7280', lineHeight: 17, marginBottom: 8 },
  metaRow: { flexDirection: 'row', alignItems: 'center' },
  priceTag: { flexDirection: 'row', alignItems: 'center', gap: 1 },
  priceValue: { fontSize: 14, fontWeight: '800', color: '#0F9D58' },
  metaDivider: { width: 1, height: 12, backgroundColor: '#E5E7EB', marginHorizontal: 8 },
  durationTag: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  durationText: { fontSize: 11, color: '#6B7280', fontWeight: '500' },

  arrowBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E8F5EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },

  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 4 },
  emptySub: { fontSize: 13, color: '#6B7280', textAlign: 'center' },
});
