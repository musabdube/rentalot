export type RentalRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';

export interface RentalRequestTenant {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  verificationStatus?: boolean;
}

export interface RentalRequestProperty {
  id: string;
  title: string;
  city: string;
  suburb?: string;
  street?: string;
  type: string;
  rentAmount: number;
  currency: string;
  images?: Array<{ url: string; isMain: boolean }>;
}

export interface RentalRequest {
  id: string;
  propertyId: string;
  property: RentalRequestProperty;
  tenantId: string;
  tenant: RentalRequestTenant;
  landlordId: string;
  status: RentalRequestStatus;
  requestDate: string;
  moveInDate: string;
  moveOutDate?: string;
  // Tenant Submitted Information
  tenantPhone?: string | null;
  tenantEmail?: string | null;
  tenantOccupation?: string | null;
  tenantIncome?: string | null;
  tenantEmployer?: string | null;
  tenantReferences?: string | null;
  tenantNotes?: string | null;
  createdAt: string;
  updatedAt: string;
  messages?: RentalMessage[];
}

export interface RentalMessage {
  id: string;
  rentalRequestId: string;
  senderId: string;
  sender: { name: string; avatar?: string };
  receiverId: string;
  content: string;
  createdAt: string;
  readAt?: string;
}

export interface CreateRentalRequestPayload {
  propertyId: string;
  moveInDate: string;
  moveOutDate?: string;
  notes?: string;
}

export interface UpdateRentalRequestPayload {
  status: RentalRequestStatus;
  note?: string;
}
