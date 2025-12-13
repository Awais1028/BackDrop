import { v4 as uuidv4 } from 'uuid';
import { User, ProjectScript, IntegrationSlot, SKU, BidReservation, FinancingCommitment } from '@/types';
import { toast } from 'sonner';

export const generateAndStoreDummyData = () => {
  const DUMMY_DATA_VERSION = '1.2'; // Increment this version to force regeneration
  const storedVersion = localStorage.getItem('dummyDataVersion');

  if (storedVersion === DUMMY_DATA_VERSION) {
    console.log('generateAndStoreDummyData: Dummy data is up to date. Skipping generation.');
    return;
  }

  console.log(`generateAndStoreDummyData: Stale or missing dummy data. Regenerating for version ${DUMMY_DATA_VERSION}.`);

  // Clear old data
  localStorage.removeItem('users');
  localStorage.removeItem('projectScripts');
  localStorage.removeItem('integrationSlots');
  localStorage.removeItem('skus');
  localStorage.removeItem('bidReservations');
  localStorage.removeItem('financingCommitments');
  localStorage.removeItem('currentUser');

  // --- Users ---
  const creatorUser: User = { id: uuidv4(), email: 'creator@example.com', name: 'Alice Creator', role: 'Creator' };
  const advertiserUser: User = { id: uuidv4(), email: 'advertiser@example.com', name: 'Bob Advertiser', role: 'Advertiser' };
  const merchantUser: User = { 
    id: uuidv4(), 
    email: 'merchant@example.com', 
    name: 'Charlie Merchant', 
    role: 'Merchant',
    minIntegrationFee: 1000,
    eligibilityRules: '{"categories": ["skincare", "electronics"], "min_margin": 20}',
    suitabilityRules: '{"exclude_genres": ["horror", "violence"]}',
  };
  const operatorUser: User = { id: uuidv4(), email: 'operator@example.com', name: 'Dana Operator', role: 'Operator' };
  const users: User[] = [creatorUser, advertiserUser, merchantUser, operatorUser];
  localStorage.setItem('users', JSON.stringify(users));

  // --- Project Scripts (for Creator) ---
  const script1: ProjectScript = { id: uuidv4(), title: 'The Last Coffee Shop', creatorId: creatorUser.id, docLink: 'https://example.com/script1.pdf', productionWindow: 'Q1 2025', budgetTarget: 150000, createdDate: new Date().toISOString(), lastModifiedDate: new Date().toISOString() };
  const script2: ProjectScript = { id: uuidv4(), title: 'Mystery of the Missing Widget', creatorId: creatorUser.id, docLink: 'https://example.com/script2.pdf', productionWindow: 'Q3 2025', budgetTarget: 200000, createdDate: new Date().toISOString(), lastModifiedDate: new Date().toISOString() };
  const script3: ProjectScript = { id: uuidv4(), title: 'Untitled Sci-Fi Project', creatorId: creatorUser.id, docLink: 'https://example.com/script3.pdf', productionWindow: 'Q4 2025', budgetTarget: 500000, createdDate: new Date().toISOString(), lastModifiedDate: new Date().toISOString() };
  const projectScripts: ProjectScript[] = [script1, script2, script3];
  localStorage.setItem('projectScripts', JSON.stringify(projectScripts));

  // --- Integration Slots ---
  const slot1: IntegrationSlot = { id: uuidv4(), projectId: script1.id, sceneRef: 'Opening Scene: Cafe', description: 'Character orders artisanal coffee.', constraints: 'Premium brands only', pricingFloor: 5000, modality: 'Private Auction', status: 'Available', createdDate: new Date().toISOString(), lastModifiedDate: new Date().toISOString() };
  const slot2: IntegrationSlot = { id: uuidv4(), projectId: script1.id, sceneRef: 'Climax: Rooftop Chase', description: 'Protagonist uses a high-tech gadget.', constraints: 'Tech brands, no firearms', pricingFloor: 12000, modality: 'PG/Reservation', status: 'Locked', createdDate: new Date().toISOString(), lastModifiedDate: new Date().toISOString() };
  const slot3: IntegrationSlot = { id: uuidv4(), projectId: script2.id, sceneRef: 'Lab Scene: Product Placement', description: 'Scientist uses lab equipment.', constraints: 'Ethical brands', pricingFloor: 8000, modality: 'Private Auction', status: 'Available', createdDate: new Date().toISOString(), lastModifiedDate: new Date().toISOString() };
  const slot4: IntegrationSlot = { id: uuidv4(), projectId: script2.id, sceneRef: 'Detective Office', description: 'Character drinks a specific energy drink.', constraints: 'No alcohol', pricingFloor: 7500, modality: 'PG/Reservation', status: 'Completed', createdDate: new Date().toISOString(), lastModifiedDate: new Date().toISOString() };
  const integrationSlots: IntegrationSlot[] = [slot1, slot2, slot3, slot4];
  localStorage.setItem('integrationSlots', JSON.stringify(integrationSlots));

  // --- SKUs (for Merchant) ---
  const skus: SKU[] = [
    { id: uuidv4(), merchantId: merchantUser.id, title: 'Organic Coffee Blend', price: 15.99, margin: 40, tags: ['coffee', 'organic'], createdDate: new Date().toISOString(), lastModifiedDate: new Date().toISOString() },
    { id: uuidv4(), merchantId: merchantUser.id, title: 'Smartwatch X200', price: 299.99, margin: 25, tags: ['tech', 'wearable'], createdDate: new Date().toISOString(), lastModifiedDate: new Date().toISOString() },
    { id: uuidv4(), merchantId: merchantUser.id, title: 'Hydrating Face Serum', price: 45.00, margin: 60, tags: ['skincare', 'beauty'], createdDate: new Date().toISOString(), lastModifiedDate: new Date().toISOString() },
    { id: uuidv4(), merchantId: merchantUser.id, title: 'Noise-Cancelling Headphones', price: 199.50, margin: 30, tags: ['tech', 'audio'], createdDate: new Date().toISOString(), lastModifiedDate: new Date().toISOString() },
  ];
  localStorage.setItem('skus', JSON.stringify(skus));

  // --- Bid Reservations ---
  const bid1 = { id: uuidv4(), counterpartyId: advertiserUser.id, slotId: slot1.id, objective: 'Reach', pricingModel: 'Fixed', amountTerms: '$6000', flightWindow: 'Feb 2025', status: 'Pending', createdDate: new Date().toISOString(), lastModifiedDate: new Date().toISOString() };
  const bid2 = { id: uuidv4(), counterpartyId: merchantUser.id, slotId: slot1.id, objective: 'Conversions', pricingModel: 'Hybrid', amountTerms: '$4000 + 5% GMV', flightWindow: 'Mar 2025', status: 'Pending', createdDate: new Date().toISOString(), lastModifiedDate: new Date().toISOString() };
  const bid3 = { id: uuidv4(), counterpartyId: advertiserUser.id, slotId: slot2.id, objective: 'Reach', pricingModel: 'Fixed', amountTerms: '$15000', flightWindow: 'Apr 2025', status: 'Accepted', createdDate: new Date().toISOString(), lastModifiedDate: new Date().toISOString() };
  const bid4 = { id: uuidv4(), counterpartyId: merchantUser.id, slotId: slot3.id, objective: 'Conversions', pricingModel: 'Rev-Share', amountTerms: '10% GMV', flightWindow: 'Oct 2025', status: 'Declined', createdDate: new Date().toISOString(), lastModifiedDate: new Date().toISOString() };
  const bid5 = { id: uuidv4(), counterpartyId: advertiserUser.id, slotId: slot4.id, objective: 'Reach', pricingModel: 'Fixed', amountTerms: '$9000', flightWindow: 'Nov 2025', status: 'Committed', createdDate: new Date().toISOString(), lastModifiedDate: new Date().toISOString() };
  const bidReservations: BidReservation[] = [bid1, bid2, bid3, bid4, bid5];
  localStorage.setItem('bidReservations', JSON.stringify(bidReservations));

  // --- Financing Commitments (for accepted/committed bids) ---
  const commitments: FinancingCommitment[] = [
    { id: uuidv4(), slotId: bid3.slotId, bidId: bid3.id, counterpartyId: bid3.counterpartyId, committedAmount: 15000, paidDeposit: false, schedule: 'Upon deal memo signature', createdDate: new Date().toISOString() },
    { id: uuidv4(), slotId: bid5.slotId, bidId: bid5.id, counterpartyId: bid5.counterpartyId, committedAmount: 9000, paidDeposit: true, schedule: 'Net 30', createdDate: new Date().toISOString() },
  ];
  localStorage.setItem('financingCommitments', JSON.stringify(commitments));

  // --- Final Toast Notification ---
  toast.success('Expanded dummy data has been generated!');
  
  // --- Set Version ---
  localStorage.setItem('dummyDataVersion', DUMMY_DATA_VERSION);
};