import React, { useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  FileText,
  IndianRupee,
  MapPin,
  Percent,
  ShieldCheck,
  Tag,
  Truck,
  Wrench,
  Zap,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList } from '@/navigation/types';
import { useBookingDraftStore } from '@/store/bookingDraftStore';
import { useAuthStore } from '@/store/authStore';
import { createBooking } from '@/services/bookingService';
import TextField from '@/components/TextField';
import { colors, radius, shadows, spacing, typography } from '@/theme/theme';

type Props = NativeStackScreenProps<HomeStackParamList, 'BookingConfirm'>;

function getUpcomingSlots(): Date[] {
  const slots: Date[] = [];
  const now = new Date();
  for (let d = 0; d < 4; d++) {
    const day = new Date(now);
    day.setDate(day.getDate() + d);
    for (const h of [10, 14, 17]) {
      const slot = new Date(day);
      slot.setHours(h, 0, 0, 0);
      if (slot > now) slots.push(slot);
    }
  }
  return slots.slice(0, 8);
}

function formatSlot(d: Date): { day: string; time: string; isToday: boolean } {
  const isToday = new Date().toDateString() === d.toDateString();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow = tomorrow.toDateString() === d.toDateString();

  const dayStr = isToday ? 'Today' : isTomorrow ? 'Tomorrow' : d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return { day: dayStr, time: timeStr, isToday };
}

const AVAILABLE_COUPONS = [
  { code: 'HOMEZY50', discount: 50, desc: '₹50 flat off on all bookings' },
  { code: 'FIRSTHOME', discount: 100, desc: '₹100 off on your first service' },
];

export default function BookingConfirmScreen({ navigation }: Props) {
  const draft = useBookingDraftStore();
  const { user } = useAuthStore();
  const [selectedSlot, setSelectedSlot] = useState<Date>(
    () => draft.scheduledAt ? new Date(draft.scheduledAt) : getUpcomingSlots()[0]
  );
  const [placing, setPlacing] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [couponApplied, setCouponApplied] = useState<{ code: string; discount: number } | null>(null);
  const [showCouponField, setShowCouponField] = useState(false);

  if (!draft.service || !draft.address) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>Incomplete booking information.</Text>
        <TouchableOpacity style={styles.backHomeBtn} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.backHomeBtnText}>Go Back Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const basePrice = draft.service.price;
  const discountAmount = couponApplied ? couponApplied.discount : 0;
  const convenienceFee = 29;
  const finalPrice = Math.max(0, basePrice - discountAmount + convenienceFee);
  const slots = getUpcomingSlots();

  const handleApplyCoupon = () => {
    const match = AVAILABLE_COUPONS.find(c => c.code.toUpperCase() === couponInput.trim().toUpperCase());
    if (match) {
      setCouponApplied(match);
      setCouponInput('');
      Alert.alert('Coupon Applied! 🎉', `You saved ₹${match.discount}`);
    } else {
      Alert.alert('Invalid Coupon', 'Try using HOMEZY50 or FIRSTHOME');
    }
  };

  const handleConfirm = async () => {
    setPlacing(true);
    try {
      const booking = await createBooking({
        serviceId: draft.service!.id,
        addressId: draft.address!.id,
        scheduledAt: selectedSlot.toISOString(),
        paymentMode: draft.paymentMode,
        notes: draft.notes || undefined,
        customerEmail: user?.email,
        customerName: user?.name,
        // Pass coupon so backend validates + records it
        couponCode: couponApplied?.code || undefined,
        // Pass final price (base - discount + convenience fee) to backend
        servicePrice: finalPrice,
      });
      draft.reset();
      navigation.replace('BookingSuccess', { bookingId: booking.id });
    } catch (e: any) {
      Alert.alert('Booking Failed', e?.response?.data?.message || 'Could not place booking. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Service Summary Card */}
        <View style={styles.card}>
          <View style={styles.serviceRow}>
            <View style={styles.serviceIconBox}>
              <Wrench size={24} color="#00B386" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.serviceName}>{draft.service.name}</Text>
              <View style={styles.metaRow}>
                <Clock size={13} color="#6B7280" />
                <Text style={styles.serviceMeta}> {draft.service.estimatedDurationMinutes} mins</Text>
                <Text style={styles.metaDot}> • </Text>
                <Text style={styles.serviceMetaPrice}>₹{draft.service.price}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Slot Selector */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Calendar size={18} color="#00B386" />
            <Text style={styles.cardTitle}>Select Preferred Slot</Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.slotsScroll}>
            <View style={styles.slotsRow}>
              {slots.map((s, i) => {
                const isSelected = selectedSlot.getTime() === s.getTime();
                const info = formatSlot(s);
                return (
                  <TouchableOpacity
                    key={i}
                    style={[styles.slotCard, isSelected && styles.slotCardActive]}
                    onPress={() => setSelectedSlot(s)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.slotDay, isSelected && styles.slotDayActive]}>{info.day}</Text>
                    <Text style={[styles.slotTime, isSelected && styles.slotTimeActive]}>{info.time}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* Address Card */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <MapPin size={18} color="#00B386" />
            <Text style={styles.cardTitle}>Service Address</Text>
          </View>
          <View style={styles.addressBox}>
            <Text style={styles.addressLine}>{draft.address.line1}</Text>
            {draft.address.line2 ? <Text style={styles.addressMuted}>{draft.address.line2}</Text> : null}
            <Text style={styles.addressMuted}>
              {draft.address.city}, {draft.address.state} — {draft.address.pincode}
            </Text>
          </View>
        </View>

        {/* Payment Mode Selection */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <CreditCard size={18} color="#00B386" />
            <Text style={styles.cardTitle}>Payment Method</Text>
          </View>

          <View style={styles.paymentOptions}>
            {[
              { mode: 'COD', title: 'Cash / UPI on Service', desc: 'Pay after job completion' },
              { mode: 'ONLINE', title: 'Pay Online Now', desc: 'Instant confirmation via UPI/Cards' },
            ].map((opt) => {
              const active = draft.paymentMode === opt.mode;
              return (
                <TouchableOpacity
                  key={opt.mode}
                  style={[styles.paymentOption, active && styles.paymentOptionActive]}
                  onPress={() => draft.setPaymentMode(opt.mode as 'COD' | 'ONLINE')}
                  activeOpacity={0.8}
                >
                  <View style={[styles.radioCircle, active && styles.radioCircleActive]}>
                    {active && <View style={styles.radioDot} />}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.payTitle, active && styles.payTitleActive]}>{opt.title}</Text>
                    <Text style={styles.payDesc}>{opt.desc}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Coupon Section */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Tag size={18} color="#00B386" />
            <Text style={styles.cardTitle}>Coupons & Offers</Text>
          </View>

          {couponApplied ? (
            <View style={styles.appliedCouponBox}>
              <View style={{ flex: 1 }}>
                <Text style={styles.appliedCode}>'{couponApplied.code}' applied</Text>
                <Text style={styles.appliedDesc}>You saved ₹{couponApplied.discount} on this booking</Text>
              </View>
              <TouchableOpacity onPress={() => setCouponApplied(null)}>
                <Text style={styles.removeCouponText}>Remove</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.couponRow}>
              <TextField
                placeholder="Enter coupon (e.g. HOMEZY50)"
                value={couponInput}
                onChangeText={setCouponInput}
                style={{ flex: 1, marginBottom: 0 }}
                autoCapitalize="characters"
              />
              <TouchableOpacity style={styles.applyBtn} onPress={handleApplyCoupon}>
                <Text style={styles.applyBtnText}>Apply</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Bill Breakdown */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Bill Summary</Text>
          
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Item Total</Text>
            <Text style={styles.billValue}>₹{basePrice}</Text>
          </View>

          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Taxes & Convenience fee</Text>
            <Text style={styles.billValue}>₹{convenienceFee}</Text>
          </View>

          {discountAmount > 0 && (
            <View style={styles.billRow}>
              <Text style={[styles.billLabel, { color: '#059669' }]}>Coupon Discount</Text>
              <Text style={[styles.billValue, { color: '#059669' }]}>- ₹{discountAmount}</Text>
            </View>
          )}

          <View style={styles.billDivider} />

          <View style={styles.totalRow}>
            <View>
              <Text style={styles.totalText}>To Pay</Text>
              <Text style={styles.taxSubText}>Inclusive of all taxes</Text>
            </View>
            <View style={styles.totalPriceWrapper}>
              <IndianRupee size={18} color="#00B386" />
              <Text style={styles.totalPrice}>{finalPrice}</Text>
            </View>
          </View>
        </View>

        {/* Cancellation policy note */}
        <View style={styles.guaranteeBox}>
          <ShieldCheck size={20} color="#00B386" />
          <Text style={styles.guaranteeText}>
            Free cancellation up to 2 hours before scheduled slot. 100% verified professionals.
          </Text>
        </View>

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* Sticky Bottom Bar */}
      <View style={styles.footerBar}>
        <View>
          <Text style={styles.footerLabel}>Grand Total</Text>
          <View style={styles.footerPriceRow}>
            <IndianRupee size={20} color="#111827" />
            <Text style={styles.footerPrice}>{finalPrice}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.confirmBtn}
          onPress={handleConfirm}
          disabled={placing}
          activeOpacity={0.88}
        >
          <LinearGradient
            colors={['#00C896', '#009E75']}
            style={styles.confirmGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Zap size={18} color="#FFFFFF" fill="#FFFFFF" />
            <Text style={styles.confirmBtnText}>
              {placing ? 'Booking...' : 'Confirm & Schedule'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { padding: spacing.md, paddingTop: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  emptyText: { fontSize: 16, color: '#6B7280', marginBottom: spacing.md },
  backHomeBtn: {
    backgroundColor: '#00B386',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.pill,
  },
  backHomeBtnText: { color: '#FFFFFF', fontWeight: '700' },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    padding: spacing.md,
    marginBottom: spacing.sm + 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...shadows.sm,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: spacing.sm + 2,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },

  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  serviceIconBox: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: '#E8F5EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center' },
  serviceMeta: { fontSize: 13, color: '#6B7280' },
  metaDot: { color: '#9CA3AF' },
  serviceMetaPrice: { fontSize: 14, fontWeight: '700', color: '#00B386' },

  slotsScroll: { marginHorizontal: -spacing.md, paddingHorizontal: spacing.md },
  slotsRow: { flexDirection: 'row', gap: 10, paddingVertical: 4 },
  slotCard: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.lg,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  slotCardActive: {
    backgroundColor: '#E8F5EE',
    borderColor: '#00B386',
  },
  slotDay: { fontSize: 12, fontWeight: '600', color: '#4B5563', marginBottom: 2 },
  slotDayActive: { color: '#00B386', fontWeight: '700' },
  slotTime: { fontSize: 13, fontWeight: '700', color: '#111827' },
  slotTimeActive: { color: '#007A5A' },

  addressBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: radius.md,
    padding: spacing.sm + 2,
  },
  addressLine: { fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 2 },
  addressMuted: { fontSize: 12, color: '#6B7280', lineHeight: 18 },

  paymentOptions: { gap: 8 },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: spacing.sm + 4,
    borderRadius: radius.lg,
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  paymentOptionActive: {
    backgroundColor: '#F0FBF7',
    borderColor: '#00B386',
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleActive: { borderColor: '#00B386' },
  radioDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#00B386',
  },
  payTitle: { fontSize: 14, fontWeight: '600', color: '#374151' },
  payTitleActive: { color: '#111827', fontWeight: '700' },
  payDesc: { fontSize: 12, color: '#6B7280' },

  couponRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  applyBtn: {
    backgroundColor: '#111827',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: radius.md,
  },
  applyBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  appliedCouponBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ECFDF5',
    padding: spacing.sm + 2,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  appliedCode: { fontSize: 14, fontWeight: '700', color: '#065F46' },
  appliedDesc: { fontSize: 12, color: '#047857' },
  removeCouponText: { fontSize: 12, fontWeight: '700', color: '#EF4444' },

  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  billLabel: { fontSize: 14, color: '#6B7280' },
  billValue: { fontSize: 14, fontWeight: '600', color: '#111827' },
  billDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: spacing.sm,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalText: { fontSize: 15, fontWeight: '800', color: '#111827' },
  taxSubText: { fontSize: 11, color: '#9CA3AF' },
  totalPriceWrapper: { flexDirection: 'row', alignItems: 'center' },
  totalPrice: { fontSize: 20, fontWeight: '800', color: '#00B386', marginLeft: 2 },

  guaranteeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#E8F5EE',
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  guaranteeText: {
    flex: 1,
    fontSize: 12,
    color: '#065F46',
    lineHeight: 18,
  },

  footerBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    paddingBottom: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shadows.lg,
  },
  footerLabel: { fontSize: 11, color: '#6B7280', textTransform: 'uppercase', fontWeight: '600' },
  footerPriceRow: { flexDirection: 'row', alignItems: 'center' },
  footerPrice: { fontSize: 22, fontWeight: '800', color: '#111827', marginLeft: 2 },
  confirmBtn: {
    borderRadius: radius.pill,
    overflow: 'hidden',
    ...shadows.md,
  },
  confirmGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: spacing.xl,
    paddingVertical: 14,
  },
  confirmBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
});

