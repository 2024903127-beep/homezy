import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable, ActivityIndicator } from 'react-native';
import { Home, Building2, MapPin, Navigation, CheckCircle2 } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList } from '@/navigation/types';
import TextField from '@/components/TextField';
import Button from '@/components/Button';
import { saveAddress } from '@/services/bookingService';
import { getCurrentLocationAddress } from '@/services/locationService';
import { useToastStore } from '@/store/toastStore';
import { colors, radius, spacing, typography } from '@/theme/theme';

type Props = NativeStackScreenProps<HomeStackParamList, 'AddressForm'>;

type Label = 'Home' | 'Office' | 'Other';

const LABEL_ICONS: Record<Label, React.ElementType> = {
  Home: Home,
  Office: Building2,
  Other: MapPin,
};

function validate(fields: {
  line1: string;
  city: string;
  state: string;
  pincode: string;
}): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!fields.line1.trim()) errors.line1 = 'Address is required';
  if (!fields.city.trim()) errors.city = 'City is required';
  if (!fields.state.trim()) errors.state = 'State is required';
  if (!/^\d{6}$/.test(fields.pincode)) errors.pincode = 'Enter a valid 6-digit pincode';
  return errors;
}

export default function AddressFormScreen({ navigation }: Props) {
  const toast = useToastStore();
  const [label, setLabel] = useState<Label>('Home');
  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({ lat: 28.6139, lng: 77.2090 });
  const [detectedAddress, setDetectedAddress] = useState<string | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const handleDetectGPS = async () => {
    setIsDetecting(true);
    try {
      const res = await getCurrentLocationAddress();
      if (res) {
        if (res.line1) setLine1(res.line1);
        if (res.line2) setLine2(res.line2);
        setCity(res.city);
        setState(res.state);
        setPincode(res.pincode);
        setCoords({ lat: res.latitude, lng: res.longitude });
        setDetectedAddress(res.formattedAddress);
        setErrors({});
        toast.success('Location detected successfully!');
      } else {
        toast.error('Could not detect location. Please check GPS & permissions.');
      }
    } catch {
      toast.error('Location error. Please enter address manually.');
    } finally {
      setIsDetecting(false);
    }
  };

  const handleSave = async () => {
    const validationErrors = validate({ line1, city, state, pincode });
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      await saveAddress({
        label,
        line1,
        line2,
        city,
        state,
        pincode,
        latitude: coords.lat,
        longitude: coords.lng,
        isDefault: false,
      });
      toast.success('Address saved!');
      navigation.goBack();
    } catch {
      toast.error('Could not save address. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      {/* Label selector */}
      <Text style={styles.sectionLabel}>ADDRESS TYPE</Text>
      <View style={styles.labelRow}>
        {(['Home', 'Office', 'Other'] as Label[]).map((opt) => {
          const ChipIcon = LABEL_ICONS[opt];
          return (
            <Pressable
              key={opt}
              style={[styles.labelChip, label === opt && styles.labelChipActive]}
              onPress={() => setLabel(opt)}
            >
              <ChipIcon size={16} color={label === opt ? '#0F9D58' : colors.textMuted} />
              <Text style={[styles.labelText, label === opt && styles.labelTextActive]}>{opt}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* GPS Location Detection Card */}
      <View style={styles.gpsCard}>
        <View style={styles.gpsHeader}>
          <View style={styles.gpsIconBox}>
            <MapPin size={22} color="#0F9D58" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.gpsTitle}>
              {detectedAddress ? 'GPS Location Detected' : 'Use Current GPS Location'}
            </Text>
            <Text style={styles.gpsSub} numberOfLines={2}>
              {detectedAddress || 'Auto-fill house, area, city, and pincode using your device location.'}
            </Text>
          </View>
        </View>

        <Pressable
          style={[styles.detectBtn, isDetecting && styles.detectBtnDisabled]}
          onPress={handleDetectGPS}
          disabled={isDetecting}
        >
          {isDetecting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              {detectedAddress ? (
                <CheckCircle2 size={16} color="#FFFFFF" />
              ) : (
                <Navigation size={16} color="#FFFFFF" />
              )}
              <Text style={styles.detectBtnText}>
                {detectedAddress ? 'Re-detect Current Location' : 'Auto-detect Location'}
              </Text>
            </>
          )}
        </Pressable>
      </View>

      <Text style={styles.sectionLabel}>ADDRESS DETAILS</Text>
      <TextField
        label="House / Flat / Building *"
        placeholder="e.g. Flat 4B, Green Park Apartments"
        value={line1}
        onChangeText={(t) => { setLine1(t); setErrors((e) => ({ ...e, line1: '' })); }}
        error={errors.line1}
      />
      <TextField
        label="Street / Area (optional)"
        placeholder="e.g. Sector 18, Near Metro Station"
        value={line2}
        onChangeText={setLine2}
      />
      <View style={styles.row}>
        <View style={{ flex: 1, marginRight: spacing.sm }}>
          <TextField
            label="City *"
            placeholder="City"
            value={city}
            onChangeText={(t) => { setCity(t); setErrors((e) => ({ ...e, city: '' })); }}
            error={errors.city}
          />
        </View>
        <View style={{ flex: 1 }}>
          <TextField
            label="State *"
            placeholder="State"
            value={state}
            onChangeText={(t) => { setState(t); setErrors((e) => ({ ...e, state: '' })); }}
            error={errors.state}
          />
        </View>
      </View>
      <TextField
        label="Pincode *"
        placeholder="6-digit pincode"
        value={pincode}
        onChangeText={(t) => { setPincode(t.replace(/\D/g, '').slice(0, 6)); setErrors((e) => ({ ...e, pincode: '' })); }}
        keyboardType="number-pad"
        maxLength={6}
        error={errors.pincode}
      />

      <Button label="Save Address" onPress={handleSave} loading={saving} style={{ marginTop: spacing.lg }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, backgroundColor: '#F8FAF9' },
  sectionLabel: { ...typography.overline, color: colors.textMuted, marginBottom: spacing.sm },

  labelRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  labelChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.sm + 2,
    backgroundColor: colors.surface,
  },
  labelChipActive: { borderColor: '#0F9D58', backgroundColor: '#E8F5EE' },
  labelText: { ...typography.captionBold, color: colors.textMuted },
  labelTextActive: { color: '#0F9D58' },

  gpsCard: {
    borderRadius: radius.lg,
    backgroundColor: '#FFFFFF',
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1.5,
    borderColor: '#E8F5EE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  gpsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  gpsIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#E8F5EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gpsTitle: { ...typography.bodyBold, color: colors.text },
  gpsSub: { ...typography.small, color: colors.textMuted, marginTop: 2 },
  detectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0F9D58',
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.md,
  },
  detectBtnDisabled: {
    opacity: 0.7,
  },
  detectBtnText: {
    ...typography.captionBold,
    color: '#FFFFFF',
  },

  row: { flexDirection: 'row' },
});
