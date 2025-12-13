import { v4 as uuidv4 } from 'uuid';
import { User, UserRole, ProjectScript, IntegrationSlot, SKU, BidReservation, FinancingCommitment } from '@/types';

export const generateAndStoreDummyData = () => {
  // Check if dummy data already exists to prevent overwriting user data
  if (localStorage.getItem('users') && JSON.parse(localStorage.getItem('users') || '[]').length > 0) {
    console.log('Dummy data already exists. Skipping generation.');
    return;
  }

  console.log('Generating dummy data...');

  // --- Users ---
  const creatorUser: User = { id: uuidv4(), email: 'creator@example.com', name: 'Alice Creator', role: 'Creator' };
  const advertiserUser: User = { id: uuidv4(), email: 'advertiser@example.com', name: 'Bob Advertiser', role: 'Advertiser' };
  const merchantUser: User = { id: uuidv4(), email: 'merchant@example.com', name: 'Charlie Merchant', role: 'Merchant' };
  const operatorUser: User = { id: uuidv4(), email: 'operator@example.com', name: 'Dana Operator', role: 'Operator' };

  const users: User[] = [creatorUser, advertiserUser, merchantUser, operatorUser];
  localStorage.setItem('users', JSON.stringify(users));

  // --- Project Scripts (for Creator) ---
  const script1: ProjectScript = {
    id: uuidv4(),
    title: 'The Last Coffee Shop',
    creatorId: creatorUser.id,
    docLink: 'https://www.africau.edu/images/default/sample.pdf',
    productionWindow: 'Q1 2025 - Q2 2025',
    budgetTarget: 150000,
    createdDate: new Date().toISOString(),
    lastModifiedDate: new Date().toISOString(),
  };

  const script2: ProjectScript = {
    id: uuidv4(),
    title: 'Mystery of the Missing Widget',
    creatorId: creatorUser.id,
    docLink: 'https://www.africau.edu/images/default/sample.pdf',
    productionWindow: 'Q3 2025 - Q4 2025',
    budgetTarget: 200000,
    createdDate: new Date().toISOString(),
    lastModifiedDate: new Date().toISOString(),
  };

  const projectScripts: ProjectScript[] = [script1, script2];
  localStorage.setItem('projectScripts', JSON.stringify(projectScripts));

  // --- Integration Slots (for Creator's scripts) ---
  const slot1_script1: IntegrationSlot = {
    id: uuidv4(),
    projectId: script1.id,
    sceneRef: 'Opening Scene: Cafe Interior',
    description: 'Character orders a specific brand of artisanal coffee.',
    constraints: 'No alcohol, premium brands only',
    pricingFloor: 5000,
    modality: 'Private Auction',
    status: 'Available',
    createdDate: new Date().toISOString(),
    lastModifiedDate: new Date().toISOString(),
  };

  const slot2_script1: IntegrationSlot = {
    id: uuidv4(),
    projectId: script1.id,
    sceneRef: 'Climax: Rooftop Chase',
    description: 'Protagonist uses a high-tech gadget to escape.',
    constraints: 'Tech/gadget brands, no firearms',
    pricingFloor: 12000,
    modality: 'PG/Reservation',
    status: 'Available',
    createdDate: new Date().toISOString(),
    lastModifiedDate: new Date().toISOString(),
  };

  const slot3_script2: IntegrationSlot = {
    id: uuidv4(),
    projectId: script2.id,
    sceneRef: 'Lab Scene: Product Placement',
    description: 'Scientist uses a specific brand of lab equipment or skincare.',
    constraints: 'Ethical brands, science-backed products',
    pricingFloor: 8000,
    modality: 'Private Auction',
    status: 'Available',
    createdDate: new Date().toISOString(),
    lastModifiedDate: new Date().toISOString(),
  };

  const integrationSlots: IntegrationSlot[] = [slot1_script1, slot2_script1, slot3_script2];
  localStorage.setItem('integrationSlots', JSON.stringify(integrationSlots));

  // --- SKUs (for Merchant) ---
  const sku1: SKU = {
    id: uuidv4(),
    merchantId: merchantUser.id,
    title: 'Organic Coffee Blend',
    price: 15.99,
    margin: 40,
    tags: ['coffee', 'organic', 'beverage'],
    createdDate: new Date().toISOString(),
    lastModifiedDate: new Date().toISOString(),
  };

  const sku2: SKU = {
    id: uuidv4(),
    merchantId: merchantUser.id,
    title: 'Smartwatch X200',
    price: 299.99,
    margin: 25,
    tags: ['tech', 'wearable', 'gadget'],
    createdDate: new Date().toISOString(),
    lastModifiedDate: new Date().toISOString(),
  };

  const skus: SKU[] = [sku1, sku2];
  localStorage.setItem('skus', JSON.stringify(skus));

  // --- Bid Reservations ---
  const bid1_advertiser_slot1: BidReservation = {
    id: uuidv4(),
    counterpartyId: advertiserUser.id,
    slotId: slot1_script1.id,
    objective: 'Reach',
    pricingModel: 'Fixed',
    amountTerms: '$6000',
    flightWindow: 'Feb 2025',
    status: 'Pending',
    createdDate: new Date().toISOString(),
    lastModifiedDate: new Date().toISOString(),
  };

  const bid2_merchant_slot1: BidReservation = {
    id: uuidv4(),
    counterpartyId: merchantUser.id,
    slotId: slot1_script1.id,
    objective: 'Conversions',
    pricingModel: 'Hybrid',
    amountTerms: '$4000 + 5% GMV',
    flightWindow: 'Mar 2025',
    status: 'Pending',
    createdDate: new Date().toISOString(),
    lastModifiedDate: new Date().toISOString(),
  };

  const bid3_advertiser_slot2: BidReservation = {
    id: uuidv4(),
    counterpartyId: advertiserUser.id,
    slotId: slot2_script1.id,
    objective: 'Reach',
    pricingModel: 'Fixed',
    amountTerms: '$15000',
    flightWindow: 'Apr 2025',
    status: 'Accepted', // This one is accepted
    createdDate: new Date().toISOString(),
    lastModifiedDate: new Date().toISOString(),
  };

  const bid4_merchant_slot3: BidReservation = {
    id: uuidv4(),
    counterpartyId: merchantUser.id,
    slotId: slot3_script2.id,
    objective: 'Conversions',
    pricingModel: 'Rev-Share',
    amountTerms: '10% GMV',
    flightWindow: 'Oct 2025',
    status: 'Pending',
    createdDate: new Date().toISOString(),
    lastModifiedDate: new Date().toISOString(),
  };

  const bidReservations: BidReservation[] = [
    bid1_advertiser_slot1,
    bid2_merchant_slot1,
    bid3_advertiser_slot2,
    bid4_merchant_slot3,
  ];
  localStorage.setItem('bidReservations', JSON.stringify(bidReservations));

  // --- Financing Commitments (for accepted bids) ---
  const commitment1: FinancingCommitment = {
    id: uuidv4(),
    slotId: bid3_advertiser_slot2.slotId,
    bidId: bid3_advertiser_slot2.id,
    counterpartyId: bid3_advertiser_slot2.counterpartyId,
    committedAmount: 15000,
    paidDeposit: false,
    schedule: 'Upon deal memo signature',
    createdDate: new Date().toISOString(),
  };

  const financingCommitments: FinancingCommitment[] = [commitment1];
  localStorage.setItem('financingCommitments', JSON.stringify(financingCommitments));

  // --- Update slot status for accepted bids ---
  const updatedSlotsForCommitment = integrationSlots.map(slot => {
    if (slot.id === bid3_advertiser_slot2.slotId) {
      return { ...slot, status: 'Locked', lastModifiedDate: new Date().toISOString() };
    }
    return slot;
  });
  localStorage.setItem('integrationSlots', JSON.stringify(updatedSlotsForCommitment));


  console.log('Dummy data generation complete. You can now log in with:');
  users.forEach(u => console.log(`- Email: ${u.email}, Role: ${u.role}`));
};