export type UserRole = "Creator" | "Advertiser" | "Merchant" | "Operator";

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
  creatorId: string;
  docLink: string;
  productionWindow: string;
  budgetTarget?: number;
  createdDate: string;
  lastModifiedDate: string;
}

export interface IntegrationSlot {
  id: string;
  projectId: string;
  sceneRef: string;
  description: string;
  constraints: string; // JSON string or comma-separated for simplicity
  pricingFloor: number;
  modality: "Private Auction" | "PG/Reservation";
  status: "Available" | "Locked" | "Completed";
  visibility: "Public" | "Private"; // Added for Operator Curation
  createdDate: string;
  lastModifiedDate: string;
}

export interface SKU {
  id: string;
  merchantId: string;
  title: string;
  price: number;
  margin: number; // 0-100
  tags: string[];
  imageUrl?: string;
  createdDate: string;
  lastModifiedDate: string;
}

export interface BidReservation {
  id: string;
  counterpartyId: string; // Advertiser or Merchant ID
  slotId: string;
  objective: "Reach" | "Conversions";
  pricingModel: "Fixed" | "Rev-Share" | "Hybrid";
  amountTerms: string; // JSON string for specific terms
  flightWindow: string; // text/date range
  status: "Pending" | "Accepted" | "Declined" | "Committed" | "Cancelled";
  createdDate: string;
  lastModifiedDate: string;
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