import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '@/navigation/types';
import TextField from '@/components/TextField';
import Button from '@/components/Button';
import { getProfile, updateProfile } from '@/services/authService';
import { useAuthStore } from '@/store/authStore';
import { useToastStore } from '@/store/toastStore';
import { colors, radius, spacing, typography } from '@/theme/theme';

type Props = NativeStackScreenProps<ProfileStackParamList, 'EditProfile'>;

function validate(name: string, email: string): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!name.trim()) errors.name = 'Name is required';
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Enter a valid email address';
  return errors;
}

export default function EditProfileScreen({ navigation }: Props) {
  const { user, setUser } = useAuthStore();
  const toast = useToastStore();
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const fresh = await getProfile();
        if (fresh) {
          setUser(fresh);
          setName(fresh.name || '');
          setEmail(fresh.email || '');
        }
      } catch {}
    })();
  }, []);

  useEffect(() => {
    if (user) {
      if (!name && user.name) setName(user.name);
      if (!email && user.email) setEmail(user.email);
    }
  }, [user]);

  const handleSave = async () => {
    const validationErrors = validate(name, email);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      const updated = await updateProfile({ name: name.trim(), email: email.trim() || undefined });
      setUser(updated);
      toast.success('Profile updated!');
      navigation.goBack();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Could not update profile. Try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      {/* Avatar */}
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarInitial}>
            {name.charAt(0).toUpperCase() || user?.name?.charAt(0).toUpperCase() || '?'}
          </Text>
        </View>
        <Text style={styles.avatarHint}>Profile photo coming soon</Text>
      </View>

      <View style={styles.form}>
        <TextField
          label="Full Name *"
          placeholder="Your full name"
          value={name}
          onChangeText={(t) => { setName(t); setErrors((e) => ({ ...e, name: '' })); }}
          error={errors.name}
        />
        <TextField
          label="Email Address (optional)"
          placeholder="you@example.com"
          value={email}
          onChangeText={(t) => { setEmail(t); setErrors((e) => ({ ...e, email: '' })); }}
          keyboardType="email-address"
          autoCapitalize="none"
          error={errors.email}
        />
        <TextField
          label="Mobile Number"
          value={user?.phone ?? ''}
          editable={false}
          style={{ opacity: 0.6 }}
        />
        <Text style={styles.phoneHint}>
          Mobile number cannot be changed. Contact support if needed.
        </Text>
      </View>

      <Button label="Save Changes" onPress={handleSave} loading={saving} style={styles.btn} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, backgroundColor: colors.background },

  avatarSection: { alignItems: 'center', marginBottom: spacing.xl },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  avatarInitial: { ...typography.h1, color: colors.white },
  avatarHint: { ...typography.caption, color: colors.textMuted },

  form: {},
  phoneHint: { ...typography.small, color: colors.textMuted, marginTop: -spacing.sm, marginBottom: spacing.md },
  btn: { marginTop: spacing.lg },
});
