export type AuthStackParamList = {
  Welcome: undefined;
  OtpLogin: undefined;
  OtpVerify: { phone: string; email?: string };
  PasswordLogin: undefined;
};

export type MainTabParamList = {
  HomeTab: undefined;
  JobsTab: undefined;
  EarningsTab: undefined;
  ProfileTab: undefined;
};

export type HomeStackParamList = {
  Dashboard: undefined;
  JobDetail: { jobId: string; mode: 'incoming' | 'active' };
  Navigation: { jobId: string };
};

export type JobsStackParamList = {
  JobHistory: undefined;
  JobDetail: { jobId: string; mode: 'incoming' | 'active' | 'history' };
};

export type EarningsStackParamList = {
  Earnings: undefined;
};

export type ProfileStackParamList = {
  Profile: undefined;
  EditProfile: undefined;
  Kyc: undefined;
  BankDetails: undefined;
  ServiceAreas: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};
