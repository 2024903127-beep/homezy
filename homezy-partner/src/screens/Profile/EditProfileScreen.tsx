import React, { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '@/navigation/types';
import TextField from '@/components/TextField';
import Button from '@/components/Button';
import { Toast } from '@/components/Toast';
import { useAuthStore } from '@/store/authStore';
import { updateProfile } from '@/services/authService';
import { colors, radius, shadows, spacing, typography } from '@/theme/theme';
import { Camera } from 'lucide-react-native';

type Props = NativeStackScreenProps<ProfileStackParamList, 'EditProfile'>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function EditProfileScreen({ navigation }: Props) {
  const { provider, setProvider } = useAuthStore();
  const [name, setName] = useState(provider?.name ?? '');
  const [email, setEmail] = useState(provider?.email ?? '');
  const [photoUrl, setPhotoUrl] = useState(provider?.photoUrl ?? '');
  const [emailError, setEmailError] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);

  const handlePickPhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Toast.show({ message: 'Permission needed to access photos', type: 'error' });
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled && result.assets?.[0]) {
      setPhotoUrl(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (email && !EMAIL_REGEX.test(email)) {
      setEmailError('Enter a valid email address');
      return;
    }
    setEmailError(undefined);
    setSaving(true);
    try {
      const updated = await updateProfile({ name, email, photoUrl });
      setProvider(updated);
      Toast.show({ message: 'Profile updated successfully!', type: 'success' });
      navigation.goBack();
    } catch {
      Toast.show({ message: 'Failed to update profile', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const initial = (name || 'P').charAt(0).toUpperCase();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Avatar Picker */}
      <View style={styles.avatarSection}>
        <Pressable onPress={handlePickPhoto} style={styles.avatarBox}>
          {photoUrl ? (
            <Image source={{ uri: photoUrl }} style={styles.avatarImg} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitial}>{initial}</Text>
            </View>
          )}
          <View style={styles.cameraIconBox}>
            <Camera size={14} color={colors.white} />
          </View>
        </Pressable>
        <Text style={styles.avatarHint}>Tap to change photo</Text>
      </View>

      <TextField label="Full Name" value={name} onChangeText={setName} />
      <TextField
        label="Email Address"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        error={emailError}
      />
      <TextField label="Mobile Number" value={provider?.phone} editable={false} />

      <Button label="Save Changes" onPress={handleSave} loading={saving} style={{ marginTop: spacing.md }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, backgroundColor: '#F8FAF9' },
  avatarSection: { alignItems: 'center', marginBottom: spacing.xl },
  avatarBox: { width: 90, height: 90, borderRadius: 45, position: 'relative' },
  avatarImg: { width: 90, height: 90, borderRadius: 45 },
  avatarPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: { ...typography.h1, color: colors.white },
  cameraIconBox: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  avatarHint: { ...typography.caption, color: colors.textMuted, marginTop: spacing.xs },
});
