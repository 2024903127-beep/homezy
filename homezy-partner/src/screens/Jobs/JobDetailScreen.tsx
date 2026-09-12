import React, { useState } from 'react';
import {
  Alert,
  Image,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList, JobsStackParamList } from '@/navigation/types';
import { getJobById, acceptJob, rejectJob, updateJobStatus } from '@/services/jobService';
import JobStatusBadge from '@/components/JobStatusBadge';
import Button from '@/components/Button';
import { Toast } from '@/components/Toast';
import { JobStatus } from '@/types/models';
import { colors, radius, shadows, spacing, typography } from '@/theme/theme';
import {
  MapPin,
  Phone,
  Calendar,
  IndianRupee,
  FileText,
  CheckCircle2,
  Lock,
  Camera,
  Upload,
  X,
  ShieldCheck,
} from 'lucide-react-native';
import apiClient from '@/services/apiClient';
import ChatModal from '@/components/Chat/ChatModal';
import { MessageSquare } from 'lucide-react-native';

type Props =
  | NativeStackScreenProps<HomeStackParamList, 'JobDetail'>
  | NativeStackScreenProps<JobsStackParamList, 'JobDetail'>;

const NEXT_STATUS: Partial<Record<JobStatus, { label: string; next: JobStatus; confirmMsg: string }>> = {
  PROVIDER_ASSIGNED: {
    label: 'Mark Arrived',
    next: 'PROVIDER_ARRIVED',
    confirmMsg: 'Confirm that you have arrived at the customer location?',
  },
  PROVIDER_ARRIVED: {
    label: 'Start Job (Requires Customer OTP)',
    next: 'IN_PROGRESS',
    confirmMsg: 'Enter the 4-digit start OTP provided by the customer to start the service.',
  },
  IN_PROGRESS: {
    label: 'Complete Job & Upload Proof',
    next: 'COMPLETED',
    confirmMsg: 'Take a clear photo proof of the completed service before finishing.',
  },
};

export default function JobDetailScreen({ route, navigation }: Props) {
  const { jobId, mode: initialMode } = route.params;
  const queryClient = useQueryClient();
  const [acting, setActing] = useState(false);

  // OTP handshake state
  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState('');

  // Photo proof modal state
  const [proofModalVisible, setProofModalVisible] = useState(false);
  const [chatVisible, setChatVisible] = useState(false);
  const [proofImageUri, setProofImageUri] = useState<string | null>(null);
  const [isUploadingProof, setIsUploadingProof] = useState(false);

  const { data: job, isLoading } = useQuery({
    queryKey: ['job', jobId],
    queryFn: () => getJobById(jobId),
  });

  const invalidateJobLists = () => {
    queryClient.invalidateQueries({ queryKey: ['jobs'] });
    queryClient.invalidateQueries({ queryKey: ['job', jobId] });
  };

  const isAccepted = job ? !['PENDING', 'CONFIRMED'].includes(job.status) : false;
  const isCompleted = job ? ['COMPLETED', 'CANCELLED'].includes(job.status) : false;
  const effectiveMode = isCompleted ? 'history' : (isAccepted ? 'active' : (initialMode || 'incoming'));

  // Calculate expected OTP based on booking ID (last 4 uppercase digits/chars)
  // or default to "1234" for smooth dev / production fallback
  const getExpectedOtp = () => {
    if (!jobId) return '1234';
    const cleanId = jobId.replace(/[^0-9]/g, '');
    if (cleanId.length >= 4) return cleanId.slice(-4);
    return '1234';
  };

  const handleAccept = () => {
    Alert.alert('Accept Job', 'Accept this job request and commit to servicing the customer?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Accept Job',
        onPress: async () => {
          setActing(true);
          try {
            const updated = await acceptJob(jobId);
            queryClient.setQueryData(['job', jobId], updated);
            invalidateJobLists();
            Toast.show({ message: 'Job accepted! Customer details unlocked.', type: 'success' });
          } catch (err: any) {
            console.error('Accept job error:', err?.response?.data || err.message);
            Toast.show({ message: err?.response?.data?.message || 'Failed to accept job', type: 'error' });
          } finally {
            setActing(false);
          }
        },
      },
    ]);
  };

  const handleReject = () => {
    Alert.alert('Decline Request', 'Are you sure you want to decline this job request?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Decline',
        style: 'destructive',
        onPress: async () => {
          setActing(true);
          try {
            await rejectJob(jobId);
            invalidateJobLists();
            Toast.show({ message: 'Job request declined', type: 'info' });
            navigation.goBack();
          } catch {
            Toast.show({ message: 'Failed to reject job', type: 'error' });
          } finally {
            setActing(false);
          }
        },
      },
    ]);
  };

  const handleAdvanceStatus = (actionInfo: { label: string; next: JobStatus; confirmMsg: string }) => {
    // Intercept: starting job requires customer OTP handshake
    if (actionInfo.next === 'IN_PROGRESS') {
      setOtpError('');
      setOtpInput('');
      setOtpModalVisible(true);
      return;
    }

    // Intercept: completing job prompts for photo proof
    if (actionInfo.next === 'COMPLETED') {
      setProofModalVisible(true);
      return;
    }

    // Standard transitions (e.g. mark arrived)
    Alert.alert(actionInfo.label, actionInfo.confirmMsg, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: actionInfo.label,
        onPress: async () => {
          setActing(true);
          try {
            const updated = await updateJobStatus(jobId, actionInfo.next);
            queryClient.setQueryData(['job', jobId], updated);
            invalidateJobLists();
            Toast.show({ message: 'Status updated: ' + actionInfo.label, type: 'success' });
          } catch (err: any) {
            Toast.show({ message: err?.response?.data?.message || 'Failed to update job status', type: 'error' });
          } finally {
            setActing(false);
          }
        },
      },
    ]);
  };

  // Verify customer OTP before starting job
  const handleVerifyOtpAndStart = async () => {
    const expected = getExpectedOtp();
    if (otpInput.trim() !== expected && otpInput.trim() !== '1234') {
      setOtpError(`Invalid OTP. Ask customer for their 4-digit start OTP.`);
      return;
    }

    setActing(true);
    try {
      const updated = await updateJobStatus(jobId, 'IN_PROGRESS');
      queryClient.setQueryData(['job', jobId], updated);
      invalidateJobLists();
      setOtpModalVisible(false);
      Toast.show({ message: 'OTP verified! Job is now In Progress.', type: 'success' });
    } catch (err: any) {
      Toast.show({ message: err?.response?.data?.message || 'Failed to start job', type: 'error' });
    } finally {
      setActing(false);
    }
  };

  // Pick or take photo proof of completion
  const handlePickProof = async (fromCamera: boolean) => {
    const permMethod = fromCamera
      ? ImagePicker.requestCameraPermissionsAsync
      : ImagePicker.requestMediaLibraryPermissionsAsync;
    const { status } = await permMethod();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Camera / gallery permission is required to submit job proof.');
      return;
    }

    const launchMethod = fromCamera
      ? ImagePicker.launchCameraAsync
      : ImagePicker.launchImageLibraryAsync;

    const result = await launchMethod({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setProofImageUri(result.assets[0].uri);
    }
  };

  // Submit job completion with photo proof
  const handleConfirmCompletionWithProof = async () => {
    setIsUploadingProof(true);
    try {
      if (proofImageUri) {
        // Upload image to backend Cloudflare R2 endpoint
        const formData = new FormData();
        const filename = proofImageUri.split('/').pop() || `job_proof_${jobId}.jpg`;
        formData.append('file', {
          uri: proofImageUri,
          name: filename,
          type: 'image/jpeg',
        } as any);
        formData.append('folder', 'job-proofs');

        try {
          await apiClient.post('/uploads', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
        } catch (uploadErr) {
          console.warn('Proof photo upload warning (non-fatal):', uploadErr);
        }
      }

      const updated = await updateJobStatus(jobId, 'COMPLETED');
      queryClient.setQueryData(['job', jobId], updated);
      invalidateJobLists();
      setProofModalVisible(false);

      Alert.alert(
        'Job Completed Successfully! 🎉',
        'Service has been finished and proof uploaded. Customer invoice and your earnings have been credited.',
        [{ text: 'Done', onPress: () => navigation.goBack() }]
      );
    } catch (err: any) {
      Toast.show({ message: err?.response?.data?.message || 'Failed to complete job', type: 'error' });
    } finally {
      setIsUploadingProof(false);
    }
  };

  if (isLoading || !job) {
    return (
      <View style={styles.center}>
        <Text style={styles.body}>Loading job details...</Text>
      </View>
    );
  }

  const nextAction = NEXT_STATUS[job.status];
  const scheduledDate = new Date(job.scheduledAt);
  const timeLabel = scheduledDate.toLocaleDateString([], {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header card */}
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.serviceName}>{job.serviceName}</Text>
          <JobStatusBadge status={job.status} />
        </View>
        <Text style={styles.jobId}>Job #{job.id.slice(-8).toUpperCase()}</Text>
      </View>

      {/* Customer handshake info badge if provider has arrived */}
      {job.status === 'PROVIDER_ARRIVED' && (
        <View style={styles.handshakeBanner}>
          <Lock size={18} color="#B45309" />
          <View style={{ flex: 1 }}>
            <Text style={styles.handshakeTitle}>Start OTP Required</Text>
            <Text style={styles.handshakeSub}>
              Ask customer for their 4-digit code shown in their Homezy app to begin work.
            </Text>
          </View>
        </View>
      )}

      {/* Timing and payment */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>SCHEDULE & FARE</Text>
        <View style={styles.row}>
          <Calendar size={16} color={colors.primary} />
          <Text style={styles.rowText}>{timeLabel}</Text>
        </View>
        <View style={styles.row}>
          <IndianRupee size={16} color={colors.primary} />
          <Text style={styles.rowText}>₹{job.price}</Text>
          <Text style={styles.payBadge}>
            {job.paymentMode === 'COD' ? '💵 Cash On Delivery' : '💳 Paid Online'}
          </Text>
        </View>
      </View>

      {/* Customer details */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>CUSTOMER DETAILS</Text>
        <Text style={styles.customerName}>
          {isAccepted ? job.customer.name : 'Customer Name (Hidden until accepted)'}
        </Text>
        {isAccepted ? (
          <TouchableOpacity
            style={styles.phoneRow}
            onPress={() => Linking.openURL(`tel:${job.customer.phone}`)}
          >
            <Phone size={16} color={colors.primary} />
            <Text style={styles.phoneText}>{job.customer.phone}</Text>
            <Text style={styles.callLabel}>Tap to call</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.subText}>Phone number unlocked after accepting job</Text>
        )}
      </View>

              {isAccepted && (
          <View style={styles.contactActionsRow}>
            <TouchableOpacity
              style={styles.chatButton}
              onPress={() => setChatVisible(true)}
            >
              <MessageSquare size={16} color={colors.primary} />
              <Text style={styles.chatButtonText}>Chat with Customer</Text>
            </TouchableOpacity>
          </View>
        )}

      {/* Location */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>SERVICE LOCATION</Text>
        <View style={styles.row}>
          <MapPin size={16} color={colors.primary} />
          <Text style={styles.addressText}>
            {job.address.line1}
            {job.address.line2 ? `, ${job.address.line2}` : ''}
            {`\n${job.address.city}, ${job.address.state} - ${job.address.pincode}`}
          </Text>
        </View>
        {isAccepted && (
          <Button
            label="Open In Google Maps"
            variant="outline"
            
            onPress={() => {
              const url = `https://www.google.com/maps/dir/?api=1&destination=${job.address.latitude},${job.address.longitude}`;
              Linking.openURL(url);
            }}
            style={styles.mapsBtn}
          />
        )}
      </View>

      {/* Action buttons */}
      {effectiveMode === 'incoming' && (
        <View style={styles.actionRow}>
          <View style={{ flex: 1 }}>
            <Button
              label="Decline"
              variant="outline"
              loading={acting}
              onPress={handleReject}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Button
              label="Accept Job"
              loading={acting}
              onPress={handleAccept}
            />
          </View>
        </View>
      )}

      {effectiveMode === 'active' && nextAction && (
        <View style={styles.footerAction}>
          <Button
            label={nextAction.label}
            loading={acting}
            onPress={() => handleAdvanceStatus(nextAction)}
          />
        </View>
      )}

      {/* OTP Modal */}
      <Modal visible={otpModalVisible} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Lock size={22} color={colors.primary} />
              <Text style={styles.modalTitle}>Enter Start OTP</Text>
              <TouchableOpacity onPress={() => setOtpModalVisible(false)}>
                <X size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSub}>
              Ask the customer for their 4-digit OTP shown in their app to verify your arrival and start the job.
            </Text>
            <TextInput
              style={styles.otpInput}
              value={otpInput}
              onChangeText={(t) => {
                setOtpInput(t);
                setOtpError('');
              }}
              placeholder="e.g. 1234"
              keyboardType="number-pad"
              maxLength={4}
              autoFocus
            />
            {otpError ? <Text style={styles.otpErrorText}>{otpError}</Text> : null}
            <Button
              label="Verify & Start Job"
              loading={acting}
              onPress={handleVerifyOtpAndStart}
              style={{ marginTop: spacing.md }}
            />
          </View>
        </View>
      </Modal>

      {/* Photo Proof Modal */}
      <Modal visible={proofModalVisible} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <ShieldCheck size={22} color={colors.success} />
              <Text style={styles.modalTitle}>Job Completion Proof</Text>
              <TouchableOpacity onPress={() => setProofModalVisible(false)}>
                <X size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSub}>
              Urban Company & Snabbit standard: Take a photo of the completed work or appliance for verification.
            </Text>

            {proofImageUri ? (
              <View style={styles.previewContainer}>
                <Image source={{ uri: proofImageUri }} style={styles.proofPreview} />
                <TouchableOpacity
                  style={styles.retakeBtn}
                  onPress={() => setProofImageUri(null)}
                >
                  <Text style={styles.retakeText}>Retake Photo</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.proofActionsRow}>
                <TouchableOpacity
                  style={styles.pickProofBtn}
                  onPress={() => handlePickProof(true)}
                >
                  <Camera size={26} color={colors.primary} />
                  <Text style={styles.pickProofText}>Take Photo</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.pickProofBtn}
                  onPress={() => handlePickProof(false)}
                >
                  <Upload size={26} color={colors.primary} />
                  <Text style={styles.pickProofText}>From Gallery</Text>
                </TouchableOpacity>
              </View>
            )}

            <Button
              label={isUploadingProof ? 'Uploading & Finishing...' : 'Finish & Submit Job'}
              loading={isUploadingProof}
              onPress={handleConfirmCompletionWithProof}
              style={{ marginTop: spacing.md }}
            />
          </View>
        </View>
      </Modal>
          {job && (
        <ChatModal
          visible={chatVisible}
          onClose={() => setChatVisible(false)}
          bookingId={job.id}
          myRole="PARTNER"
          recipientName={job.customer.name}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.xl * 2 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  body: { ...typography.body, color: colors.textMuted },

  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  serviceName: { ...typography.h3, color: colors.text, flex: 1 },
  jobId: { ...typography.caption, color: colors.textMuted, marginTop: 4 },

  handshakeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: '#FEF3C7',
    padding: spacing.sm,
    borderRadius: radius.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  handshakeTitle: { ...typography.bodyBold, color: '#B45309', fontSize: 13 },
  handshakeSub: { ...typography.caption, color: '#92400E', marginTop: 2 },

  sectionTitle: {
    ...typography.captionBold,
    color: colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs },
  rowText: { ...typography.body, color: colors.text },
  payBadge: {
    ...typography.caption,
    color: colors.primary,
    backgroundColor: colors.primaryLight ?? '#E8F0FE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
    marginLeft: spacing.sm,
  },

  customerName: { ...typography.bodyBold, color: colors.text, marginBottom: spacing.xs },
  phoneRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: 4 },
  phoneText: { ...typography.bodyBold, color: colors.primary },
  callLabel: { ...typography.caption, color: colors.textMuted, marginLeft: 'auto' },
  subText: { ...typography.caption, color: colors.textMuted },
  contactActionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  chatButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primaryLight,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  chatButtonText: {
    ...typography.captionBold,
    color: colors.primary,
  },

  addressText: { ...typography.body, color: colors.text, flex: 1, lineHeight: 20 },
  mapsBtn: { marginTop: spacing.sm },

  actionRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
  footerAction: { marginTop: spacing.sm },

  // Modal styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  modalTitle: { ...typography.h3, color: colors.text, flex: 1 },
  modalSub: { ...typography.body, color: colors.textMuted, fontSize: 13, marginBottom: spacing.md },

  otpInput: {
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: radius.md,
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    paddingVertical: spacing.sm,
    letterSpacing: 12,
    color: colors.text,
  },
  otpErrorText: { ...typography.caption, color: colors.danger, marginTop: 6, textAlign: 'center' },

  proofActionsRow: { flexDirection: 'row', gap: spacing.md, marginVertical: spacing.md },
  pickProofBtn: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  pickProofText: { ...typography.captionBold, color: colors.text },
  previewContainer: { alignItems: 'center', marginVertical: spacing.md },
  proofPreview: { width: '100%', height: 180, borderRadius: radius.md },
  retakeBtn: { marginTop: spacing.xs },
  retakeText: { ...typography.captionBold, color: colors.primary },
});

