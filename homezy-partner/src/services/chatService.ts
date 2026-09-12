import apiClient from './apiClient';

export interface ChatMessage {
  id: string;
  bookingId: string;
  senderId: string;
  senderRole: 'CUSTOMER' | 'PARTNER';
  message: string;
  createdAt: string;
}

export async function getChatMessages(bookingId: string): Promise<ChatMessage[]> {
  try {
    const { data } = await apiClient.get(`/chat/${bookingId}`);
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.warn('[chatService] getChatMessages error:', err);
    return [];
  }
}

export async function sendChatMessage(bookingId: string, message: string, senderRole?: 'CUSTOMER' | 'PARTNER'): Promise<ChatMessage> {
  const { data } = await apiClient.post(`/chat/${bookingId}`, { message, senderRole });
  return data;
}