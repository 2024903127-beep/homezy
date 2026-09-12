export type AuthStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  OtpVerify: { phone: string; email?: string };
};

export type MainTabParamList = {
  HomeTab: undefined;
  BookingsTab: undefined;
  ProfileTab: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
  Search: undefined;
  CategoryServices: { categoryId: string; categoryName: string };
  ServiceDetail: { serviceId: string };
  AddressList: { selectMode?: boolean };
  AddressForm: { addressId?: string };
  BookingConfirm: undefined;
  BookingSuccess: { bookingId: string };
};

export type BookingsStackParamList = {
  BookingHistory: undefined;
  BookingTracking: { bookingId: string };
  RateBooking: { bookingId: string };
};

export type ProfileStackParamList = {
  Profile: undefined;
  EditProfile: undefined;
  Addresses: undefined;
  Support: undefined;
  Coupons: undefined;
  Notifications: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};
