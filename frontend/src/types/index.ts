export type UserRole = "Creator" | "Advertiser" | "Merchant" | "Operator" | "operator";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  // NOTE: Storing plain text passwords in a real app is a major security risk.
  // This is done here only for the purpose of this frontend-only prototype.
  password?: string; 
  // Merchant-specific fields
  minIntegrationFee?: number;
  eligibilityRules?: string; // JSON string or text for rules
  suitabilityRules?: string; // JSON string or text for rules
}

export interface ProjectScript {
  id: string;
  title: string;
  creator_id?: string; // Backend field name
  creatorId?: string;  // Frontend mapped field name (optional to handle both)
  doc_link?: string;   // Backend field name
  docLink?: string;    // Frontend mapped field name
  production_window?: string; // Backend field name
  productionWindow?: string;  // Frontend mapped field name
  budget_target?: number; // Backend field name
  budgetTarget?: number;  // Frontend mapped field name
  genre?: 'Comedy' | 'Sci-Fi' | 'Drama' | 'Thriller' | 'Action';
  demographics?: {
    ageStart: number;
    ageEnd: number;
    gender: 'Male' | 'Female' | 'All';
  };
  demographicsAgeStart?: number;
  demographicsAgeEnd?: number;
  demographicsGender?: 'Male' | 'Female' | 'All';
  createdDate?: string;
  created_date?: string;
  lastModifiedDate?: string;
  last_modified_date?: string;
}

export interface IntegrationSlot {
  id: string;
  project_id?: string; // Backend field name
  projectId?: string; // Frontend mapped field name
  scene_ref?: string; // Backend field name
  sceneRef?: string;  // Frontend mapped field name
  description?: string; // Optional in backend response if not set?
  constraints?: string;
  pricing_floor?: number; // Backend field name
  pricingFloor?: number;  // Frontend mapped field name
  modality: "Private Auction" | "PG/Reservation";
  status: "Available" | "Locked" | "Completed";
  visibility: "Public" | "Private";
  createdDate?: string;
  lastModifiedDate?: string;
}

export interface SKU {
  id: string;
  merchantId?: string;
  merchant_id?: string;
  title: string;
  price: number;
  margin: number; // 0-100
  tags: string[];
  imageUrl?: string;
  createdDate?: string;
  created_date?: string;
  lastModifiedDate?: string;
  last_modified_date?: string;
}

export interface Comment {
  id: string;
  authorId?: string;
  author_id?: string;
  text: string;
  timestamp: string;
}

export interface BidReservation {
  id: string;
  counterpartyId?: string; // Advertiser or Merchant ID
  counterparty_id?: string;
  slotId?: string;
  slot_id?: string;
  objective: "Reach" | "Conversions";
  pricingModel?: "Fixed" | "Rev-Share" | "Hybrid";
  pricing_model?: "Fixed" | "Rev-Share" | "Hybrid";
  amountTerms?: string; // JSON string for specific terms
  amount_terms?: string;
  flightWindow?: string; // text/date range
  flight_window?: string;
  status: "Pending" | "Accepted" | "AwaitingFinalApproval" | "Declined" | "Committed" | "Cancelled";
  comments?: Comment[];
  creatorFinalApproval?: boolean;
  creator_final_approval?: boolean;
  buyerFinalApproval?: boolean;
  buyer_final_approval?: boolean;
  createdDate?: string;
  created_date?: string;
  lastModifiedDate?: string;
  last_modified_date?: string;
}

export interface Approval {
  id: string;
  slotId: string;
  bidId: string;
  reviewerId: string;
  stage: "Guideline Compliance" | "Integration Plan";
  decision: "Approved" | "Declined";
  comments?: string;
  timestamp: string;
}

export interface DealMemo {
  id: string;
  slotId: string;
  bidId: string;
  pricingDetails: string; // JSON string
  termsDetails: string; // JSON string
  pdfLink: string; // URL to generated PDF
  createdDate: string;
}

export interface FinancingCommitment {
  id: string;
  slotId: string;
  bidId: string;
  counterpartyId: string;
  committedAmount: number;
  paidDeposit: boolean;
  schedule: string;
  createdDate: string;
}

export interface AuditLog {
  id: string;
  userId?: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string; // JSON string
  timestamp: string;
}