import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BookingsStackParamList } from '@/navigation/types';
import TextField from '@/components/TextField';
import Button from '@/components/Button';
import StarRating from '@/components/StarRating';
import { submitRating } from '@/services/bookingService';
import { useToastStore } from '@/store/toastStore';
import { colors, radius, shadows, spacing, typography } from '@/theme/theme';

type Props = NativeStackScreenProps<BookingsStackParamList, 'RateBooking'>;

const QUICK_TAGS = ['Professional', 'On time', 'Clean work', 'Great attitude', 'Would rebook'];

const STAR_LABELS = ['', 'Terrible', 'Bad', 'Okay', 'Good', 'Excellent!'];

export default function RateBookingScreen({ route, navigation }: Props) {
  const { bookingId } = route.params;
  const toast = useToastStore();
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    if (stars === 0) {
      toast.error('Please select a star rating first');
      return;
    }
    setSubmitting(true);
    try {
      const fullComment = [
        selectedTags.length ? selectedTags.join(', ') : '',
        comment.trim(),
      ]
        .filter(Boolean)
        .join(' · ');
      await submitRating({ bookingId, stars, comment: fullComment });
      toast.success('Thank you for your feedback!');
      navigation.goBack();
    } catch {
      toast.error('Could not submit rating. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Hero */}
      <View style={styles.hero}>
        <View style={styles.heroIconBox}>
          <Sparkles size={48} color="#0F9D58" />
        </View>
        <Text style={styles.heroTitle}>Service Completed!</Text>
        <Text style={styles.heroSub}>How was your experience?</Text>
      </View>

      {/* Star rating */}
      <View style={styles.card}>
        <StarRating value={stars} onChange={setStars} size={40} style={styles.stars} />
        {stars > 0 && (
          <Text style={styles.starLabel}>{STAR_LABELS[stars]}</Text>
        )}
      </View>

      {/* Quick tags */}
      {stars >= 4 && (
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>What did you like?</Text>
          <View style={styles.tagsRow}>
            {QUICK_TAGS.map((tag) => (
              <View
                key={tag}
                style={[styles.tag, selectedTags.includes(tag) && styles.tagActive]}
              >
                <Text
                  style={[styles.tagText, selectedTags.includes(tag) && styles.tagTextActive]}
                  onPress={() => toggleTag(tag)}
                >
                  {tag}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Comment */}
      <View style={styles.card}>
        <Text style={styles.sectionLabel}>Add a comment (optional)</Text>
        <TextField
          placeholder="Tell us about your experience…"
          value={comment}
          onChangeText={setComment}
          multiline
          style={{ minHeight: 80 }}
        />
      </View>

      <Button
        label={stars === 0 ? 'Select a rating first' : 'Submit Review'}
        onPress={handleSubmit}
        loading={submitting}
        disabled={stars === 0}
        style={styles.submitBtn}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAF9', padding: spacing.md },

  hero: { alignItems: 'center', paddingVertical: spacing.xl },
  heroIconBox: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#E8F5EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    borderWidth: 1.5,
    borderColor: 'rgba(15,157,88,0.2)',
  },
  heroTitle: { ...typography.h2, color: colors.text, marginBottom: spacing.xs },
  heroSub: { ...typography.body, color: colors.textMuted },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  sectionLabel: { ...typography.captionBold, color: colors.textMuted, marginBottom: spacing.sm },

  stars: { justifyContent: 'center', marginBottom: spacing.xs },
  starLabel: { ...typography.h3, color: colors.warning, textAlign: 'center', marginTop: spacing.xs },

  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  tag: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  tagActive: { borderColor: '#0F9D58', backgroundColor: '#E8F5EE' },
  tagText: { ...typography.caption, color: colors.textMuted },
  tagTextActive: { color: '#0F9D58', fontWeight: '600' },

  submitBtn: { marginTop: spacing.sm, backgroundColor: '#0F9D58' },
});
