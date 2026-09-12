import React, { useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LifeBuoy, Mail, Phone, MessageSquare, ChevronDown, ChevronUp, ChevronRight } from 'lucide-react-native';
import { colors, radius, shadows, spacing, typography } from '@/theme/theme';

const FAQS = [
  {
    q: 'How do I reschedule a booking?',
    a: 'Go to My Bookings, open the booking, and tap Cancel. Then rebook at your preferred slot. Reschedule in-place is coming soon.',
  },
  {
    q: 'What payment methods are supported?',
    a: 'We support Cash on Delivery (COD) and online payment via Razorpay (UPI, cards, net banking).',
  },
  {
    q: 'How do I cancel a booking?',
    a: 'Open the booking from My Bookings and tap Cancel. Cancellation is free if done more than 1 hour before the scheduled time.',
  },
  {
    q: 'Are your professionals verified?',
    a: 'Yes! Every Homezy professional is background-checked, trained, and carries a valid ID. You can view their profile and ratings before they arrive.',
  },
  {
    q: 'What if I am not satisfied with the service?',
    a: 'We offer a satisfaction guarantee. Contact support within 24 hours of service completion and we will make it right.',
  },
  {
    q: 'Can I track my provider in real time?',
    a: 'Yes! Once a provider is assigned, you can track their location live on the booking tracking screen.',
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <Pressable style={styles.faqCard} onPress={() => setOpen((o) => !o)}>
      <View style={styles.faqHeader}>
        <Text style={styles.faqQ} numberOfLines={open ? undefined : 2}>{q}</Text>
        {open ? <ChevronUp size={16} color="#0F9D58" /> : <ChevronDown size={16} color="#9CA3AF" />}
      </View>
      {open && <Text style={styles.faqA}>{a}</Text>}
    </Pressable>
  );
}

const CONTACT_ITEMS = [
  { icon: Mail, label: 'Email Support', link: 'mailto:support@homezy.example.com' },
  { icon: Phone, label: 'Call Support (+91 12345 67890)', link: 'tel:+911234567890' },
  { icon: MessageSquare, label: 'WhatsApp Chat', link: 'https://wa.me/911234567890' },
];

export default function SupportScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero */}
      <View style={styles.hero}>
        <View style={styles.heroIconBox}>
          <LifeBuoy size={44} color="#0F9D58" />
        </View>
        <Text style={styles.heroTitle}>How can we help?</Text>
        <Text style={styles.heroSub}>Browse FAQs or contact us directly</Text>
      </View>

      {/* FAQ */}
      <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
      {FAQS.map((item) => (
        <FaqItem key={item.q} q={item.q} a={item.a} />
      ))}

      {/* Contact */}
      <Text style={[styles.sectionTitle, { marginTop: spacing.lg }]}>Still need help?</Text>
      {CONTACT_ITEMS.map((item) => {
        const ContactIcon = item.icon;
        return (
          <Pressable key={item.label} style={styles.contactCard} onPress={() => Linking.openURL(item.link)}>
            <View style={styles.contactIconBox}>
              <ContactIcon size={20} color="#0F9D58" />
            </View>
            <Text style={styles.contactLabel}>{item.label}</Text>
            <ChevronRight size={18} color="#9CA3AF" />
          </Pressable>
        );
      })}

      <View style={{ height: spacing.xxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.md, backgroundColor: '#F8FAF9' },

  hero: { alignItems: 'center', paddingVertical: spacing.xl },
  heroIconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8F5EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    borderWidth: 1.5,
    borderColor: 'rgba(15,157,88,0.2)',
  },
  heroTitle: { ...typography.h2, color: colors.text },
  heroSub: { ...typography.body, color: colors.textMuted, marginTop: spacing.xs },

  sectionTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.md },

  faqCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  faqHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  faqQ: { ...typography.bodyBold, color: colors.text, flex: 1 },
  faqA: { ...typography.body, color: colors.textMuted, marginTop: spacing.sm, lineHeight: 22 },

  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.md,
    ...shadows.sm,
  },
  contactIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E8F5EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactLabel: { ...typography.body, color: colors.text, flex: 1, fontWeight: '600' },
});
