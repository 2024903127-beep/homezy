import React, { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getKycDocuments, uploadKycDocument } from '@/services/kycService';
import { KycDocType } from '@/types/models';
import Button from '@/components/Button';
import { Toast } from '@/components/Toast';
import { colors, radius, shadows, spacing, typography } from '@/theme/theme';
import { CheckCircle, Clock, AlertCircle, Camera, Image as ImageIcon } from 'lucide-react-native';

const DOC_TYPES: { type: KycDocType; label: string; description: string }[] = [
  { type: 'ID_PROOF', label: 'ID Proof', description: 'Aadhaar, PAN, or Voter ID' },
  { type: 'ADDRESS_PROOF', label: 'Address Proof', description: 'Utility bill or rental agreement' },
  { type: 'CERTIFICATION', label: 'Trade Certification (optional)', description: 'Professional license or certificate' },
  { type: 'PHOTO', label: 'Profile Photo', description: 'Clear photo of your face' },
];

const STATUS_CONFIG: Record<string, { color: string; bg: string; Icon: React.ElementType; label: string }> = {
  VERIFIED: { color: '#059669', bg: '#D1FAE5', Icon: CheckCircle, label: 'Verified' },
  PENDING: { color: '#D97706', bg: '#FEF3C7', Icon: Clock, label: 'Under Review' },
  REJECTED: { color: '#DC2626', bg: '#FEE2E2', Icon: AlertCircle, label: 'Rejected' },
};

export default function KycScreen() {
  const queryClient = useQueryClient();
  const { data: documents } = useQuery({ queryKey: ['kyc'], queryFn: getKycDocuments });
  const [uploadingType, setUploadingType] = useState<KycDocType | null>(null);

  const docFor = (type: KycDocType) => documents?.find((d) => d.type === type);

  const pickImage = async (type: KycDocType, useCamera: boolean) => {
    const perm = useCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!perm.granted) {
      Toast.show({ message: 'Permission required to upload photos', type: 'error' });
      return;
    }

    const result = useCamera
      ? await ImagePicker.launchCameraAsync({ quality: 0.7 })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.7,
        });

    if (result.canceled || !result.assets?.[0]) return;

    setUploadingType(type);
    try {
      await uploadKycDocument(type, result.assets[0].uri);
      queryClient.invalidateQueries({ queryKey: ['kyc'] });
      Toast.show({ message: 'Document uploaded successfully!', type: 'success' });
    } catch {
      Toast.show({ message: 'Upload failed. Please try again.', type: 'error' });
    } finally {
      setUploadingType(null);
    }
  };

  const handleChooseSource = (type: KycDocType) => {
    Alert.alert('Upload Document', 'Select source', [
      { text: 'Take Photo', onPress: () => pickImage(type, true) },
      { text: 'Choose from Gallery', onPress: () => pickImage(type, false) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.intro}>
        Upload clear photos of the required documents below. Your profile will be reviewed within 24-48 hours.
      </Text>

      {DOC_TYPES.map((docItem) => {
        const docRecord = docFor(docItem.type);
        const statusCfg = docRecord ? STATUS_CONFIG[docRecord.status] : null;
        const StatusIcon = statusCfg?.Icon;

        return (
          <View key={docItem.type} style={styles.card}>
            <View style={styles.docHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>{docItem.label}</Text>
                <Text style={styles.description}>{docItem.description}</Text>
              </View>
              {statusCfg && StatusIcon && (
                <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
                  <StatusIcon size={14} color={statusCfg.color} />
                  <Text style={[styles.statusText, { color: statusCfg.color }]}>{statusCfg.label}</Text>
                </View>
              )}
            </View>

            {docRecord?.fileUrl ? (
              <View style={styles.previewRow}>
                <Image source={{ uri: docRecord.fileUrl }} style={styles.previewImage} />
                <Text style={styles.uploadedMeta}>
                  Uploaded {new Date(docRecord.uploadedAt).toLocaleDateString()}
                </Text>
              </View>
            ) : null}

            <Button
              label={docRecord ? 'Replace Document' : 'Upload Document'}
              variant={docRecord ? 'outline' : 'primary'}
              onPress={() => handleChooseSource(docItem.type)}
              loading={uploadingType === docItem.type}
              style={{ marginTop: spacing.sm }}
            />
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, backgroundColor: '#F8FAF9' },
  intro: { ...typography.body, color: colors.textMuted, marginBottom: spacing.lg },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  docHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  label: { ...typography.bodyBold, color: colors.text },
  description: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  statusText: { ...typography.smallBold },
  previewRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.sm },
  previewImage: { width: 60, height: 60, borderRadius: radius.md, backgroundColor: '#F3F4F6' },
  uploadedMeta: { ...typography.caption, color: colors.textMuted },
});
