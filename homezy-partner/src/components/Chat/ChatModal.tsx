import React, { useState, useEffect, useRef } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { X, Send, MessageSquare } from 'lucide-react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getChatMessages, sendChatMessage, ChatMessage } from '@/services/chatService';
import { colors, radius, shadows, spacing, typography } from '@/theme/theme';

interface ChatModalProps {
  visible: boolean;
  onClose: () => void;
  bookingId: string;
  myRole: 'CUSTOMER' | 'PARTNER';
  recipientName: string;
}

const QUICK_CHIPS = [
  'I am waiting outside',
  'Please call my intercom',
  'Will be there in 5 mins',
  'Which floor is your flat?',
  'Where can I park?',
];

export default function ChatModal({
  visible,
  onClose,
  bookingId,
  myRole,
  recipientName,
}: ChatModalProps) {
  const [inputText, setInputText] = useState('');
  const queryClient = useQueryClient();
  const flatListRef = useRef<FlatList>(null);

  const { data: messages = [] } = useQuery({
    queryKey: ['chat', bookingId],
    queryFn: () => getChatMessages(bookingId),
    enabled: visible && !!bookingId,
    refetchInterval: 3000, // Poll every 3 seconds for active conversation
  });

  const sendMutation = useMutation({
    mutationFn: (text: string) => sendChatMessage(bookingId, text, myRole),
    onSuccess: (newMsg) => {
      queryClient.setQueryData<ChatMessage[]>(['chat', bookingId], (old = []) => [...old, newMsg]);
      setInputText('');
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    },
  });

  const handleSend = () => {
    if (!inputText.trim() || sendMutation.isPending) return;
    sendMutation.mutate(inputText.trim());
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerInfo}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{recipientName.charAt(0).toUpperCase()}</Text>
              </View>
              <View>
                <Text style={styles.title}>{recipientName}</Text>
                <Text style={styles.subtitle}>Direct In-App Messages</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Messages list */}
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messagesList}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            renderItem={({ item }) => {
              const isMine = item.senderRole === myRole;
              return (
                <View
                  style={[
                    styles.bubble,
                    isMine ? styles.myBubble : styles.theirBubble,
                  ]}
                >
                  <Text style={[styles.messageText, isMine ? styles.myText : styles.theirText]}>
                    {item.message}
                  </Text>
                  <Text style={[styles.timeText, isMine ? styles.myTime : styles.theirTime]}>
                    {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              );
            }}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <MessageSquare size={32} color={colors.textMuted} />
                <Text style={styles.emptyText}>No messages yet. Send a quick update!</Text>
              </View>
            }
          />

          {/* Quick reply chips */}
          <View style={styles.chipsRow}>
            {QUICK_CHIPS.slice(0, 3).map((chip) => (
              <Pressable
                key={chip}
                style={styles.chip}
                onPress={() => sendMutation.mutate(chip)}
              >
                <Text style={styles.chipText}>{chip}</Text>
              </Pressable>
            ))}
          </View>

          {/* Input Row */}
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Type message..."
              placeholderTextColor={colors.textMuted}
              returnKeyType="send"
              onSubmitEditing={handleSend}
            />
            <TouchableOpacity
              style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
              onPress={handleSend}
              disabled={!inputText.trim() || sendMutation.isPending}
            >
              <Send size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    height: '75%',
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    overflow: 'hidden',
    display: 'flex',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    backgroundColor: '#F9FAFB',
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  title: {
    ...typography.h4,
    color: colors.text,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textMuted,
  },
  closeBtn: {
    padding: spacing.xs,
  },
  messagesList: {
    padding: spacing.md,
    flexGrow: 1,
  },
  bubble: {
    maxWidth: '78%',
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.xs,
  },
  myBubble: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
    borderBottomRightRadius: 2,
  },
  theirBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#F3F4F6',
    borderBottomLeftRadius: 2,
  },
  messageText: {
    ...typography.body,
    fontSize: 14,
  },
  myText: {
    color: '#FFFFFF',
  },
  theirText: {
    color: colors.text,
  },
  timeText: {
    fontSize: 10,
    marginTop: 3,
    alignSelf: 'flex-end',
  },
  myTime: {
    color: 'rgba(255,255,255,0.75)',
  },
  theirTime: {
    color: colors.textMuted,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: '#F9FAFB',
  },
  chip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  chipText: {
    ...typography.caption,
    color: colors.text,
    fontSize: 11,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: '#FFFFFF',
  },
  input: {
    flex: 1,
    height: 42,
    backgroundColor: '#F3F4F6',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    ...typography.body,
    color: colors.text,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
});