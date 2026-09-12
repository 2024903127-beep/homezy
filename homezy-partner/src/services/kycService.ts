import apiClient from './apiClient';
import { KycDocument, KycDocType, BankDetails } from '@/types/models';

export async function getKycDocuments(): Promise<KycDocument[]> {
  try {
    const { data } = await apiClient.get('/provider/me/kyc');
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.warn('[kycService] getKycDocuments error:', err);
    return [];
  }
}

export async function uploadKycDocument(type: KycDocType, fileUri: string): Promise<KycDocument> {
  const form = new FormData();
  form.append('type', type);
  form.append('file', { uri: fileUri, name: `${type.toLowerCase()}.jpg`, type: 'image/jpeg' } as unknown as Blob);
  const { data } = await apiClient.post('/provider/me/kyc', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function getBankDetails(): Promise<BankDetails | null> {
  try {
    const { data } = await apiClient.get('/provider/me/bank-details');
    return data || null;
  } catch (err) {
    console.warn('[kycService] getBankDetails error:', err);
    return null;
  }
}

export async function saveBankDetails(details: BankDetails): Promise<BankDetails> {
  const { data } = await apiClient.put('/provider/me/bank-details', details);
  return data;
}
