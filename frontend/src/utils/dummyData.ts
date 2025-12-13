import { v4 as uuidv4 } from 'uuid';
import { User, ProjectScript, IntegrationSlot, SKU, BidReservation, FinancingCommitment, Comment } from '@/types';
import { toast } from 'sonner';

export const generateAndStoreDummyData = () => {
  const DUMMY_DATA_VERSION = '1.9'; // Increment this version to force regeneration
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

  const defaultPassword = 'password123';

  // --- Users ---
  const creatorUser: User = { id: uuidv4(), email: 'creator@example.com', name: 'Alice Creator', role: 'Creator', password: defaultPassword };
  const advertiserUser: User = { id: uuidv4(), email: 'advertiser@example.com', name: 'Bob Advertiser', role: 'Advertiser', password: defaultPassword };
  const merchantUser: User = { 
    id: uuidv4(), 
    email: 'merchant@example.com', 
    name: 'Charlie Merchant', 
    role: 'Merchant',
    password: defaultPassword,
    minIntegrationFee: 1000,
    eligibilityRules: '{"categories": ["skincare", "electronics"], "min_margin": 20}',
    suitabilityRules: '{"exclude_genres": ["horror", "violence"]}',
  };
  const operatorUser: User = { id: uuidv4(), email: 'operator@example.com', name: 'Dana Operator', role: 'Operator', password: defaultPassword };
  const users: User[] = [creatorUser, advertiserUser, merchantUser, operatorUser];
  localStorage.setItem('users', JSON.stringify(users));

  // --- Project Scripts & Slots (condensed) ---
  const script1: ProjectScript = { id: uuidv4(), title: 'The Last Coffee Shop', creatorId: creatorUser.id, docLink: 'https://example.com/script1.pdf', productionWindow: 'Q1 2025', budgetTarget: 150000, genre: 'Comedy', demographics: '18-34 All', createdDate: new Date().toISOString(), lastModifiedDate: new Date().toISOString() };
  const script2: ProjectScript = { id: uuidv4(), title: 'Mystery of the Missing Widget', creatorId: creatorUser.id, docLink: 'https://example.com/script2.pdf', productionWindow: 'Q3 2025', budgetTarget: 200000, genre: 'Thriller', demographics: '25-49 Female', createdDate: new Date().toISOString(), lastModifiedDate: new Date().toISOString() };
  localStorage.setItem('projectScripts', JSON.stringify([script1, script2]));

  const slot1: IntegrationSlot = { id: uuidv4(), projectId: script1.id, sceneRef: 'Opening Scene: Cafe', description: 'Character orders artisanal coffee.', constraints: 'Premium brands only', pricingFloor: 5000, modality: 'Private Auction', status: 'Available', visibility: 'Public', createdDate: new Date().toISOString(), lastModifiedDate: new Date().toISOString() };
  const slot2: IntegrationSlot = { id: uuidv4(), projectId: script1.id, sceneRef: 'Climax: Rooftop Chase', description: 'Protagonist uses a high-tech gadget.', constraints: 'Tech brands, no firearms', pricingFloor: 12000, modality: 'PG/Reservation', status: 'Locked', visibility: 'Public', createdDate: new Date().toISOString(), lastModifiedDate: new Date().toISOString() };
  const slot3: IntegrationSlot = { id: uuidv4(), projectId: script2.id, sceneRef: 'Lab Scene: Product Placement', description: 'Scientist uses lab equipment.', constraints: 'Ethical brands', pricingFloor: 8000, modality: 'Private Auction', status: 'Available', visibility: 'Private', createdDate: new Date().toISOString(), lastModifiedDate: new Date().toISOString() };
  localStorage.setItem('integrationSlots', JSON.stringify([slot1, slot2, slot3]));

  // --- SKUs (for Merchant) ---
  const skus: SKU[] = [
    { id: uuidv4(), merchantId: merchantUser.id, title: 'Organic Coffee Blend', price: 15.99, margin: 40, tags: ['coffee', 'organic'], imageUrl: 'https://placehold.co/600x400/5a3a2a/white?text=Coffee', createdDate: new Date().toISOString(), lastModifiedDate: new Date().toISOString() },
    { id: uuidv4(), merchantId: merchantUser.id, title: 'Smartwatch X200', price: 299.99, margin: 25, tags: ['tech', 'wearable'], imageUrl: 'https://placehold.co/600x400/333333/white?text=Smartwatch', createdDate: new Date().toISOString(), lastModifiedDate: new Date().toISOString() },
  ];
  localStorage.setItem('skus', JSON.stringify(skus));

  // --- Bid Reservations with Comments ---
  const bid1: BidReservation = { id: uuidv4(), counterpartyId: advertiserUser.id, slotId: slot1.id, objective: 'Reach', pricingModel: 'Fixed', amountTerms: '$6000', flightWindow: 'Feb 2025', status: 'Pending', comments: [], creatorFinalApproval: false, buyerFinalApproval: false, createdDate: new Date().toISOString(), lastModifiedDate: new Date().toISOString() };
  
  const bid2Comments: Comment[] = [
    { id: uuidv4(), authorId: creatorUser.id, text: "Deal accepted! Let's finalize the integration details here.", timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
    { id: uuidv4(), authorId: advertiserUser.id, text: "Great! Can we ensure the gadget has a prominent close-up shot?", timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString() },
  ];
  const bid2: BidReservation = { id: uuidv4(), counterpartyId: advertiserUser.id, slotId: slot2.id, objective: 'Reach', pricingModel: 'Fixed', amountTerms: '$15000', flightWindow: 'Apr 2025', status: 'AwaitingFinalApproval', comments: bid2Comments, creatorFinalApproval: false, buyerFinalApproval: false, createdDate: new Date().toISOString(), lastModifiedDate: new Date().toISOString() };
  
  const bid3: BidReservation = { id: uuidv4(), counterpartyId: merchantUser.id, slotId: slot3.id, objective: 'Conversions', pricingModel: 'Rev-Share', amountTerms: '10% GMV', flightWindow: 'Oct 2025', status: 'Declined', comments: [], creatorFinalApproval: false, buyerFinalApproval: false, createdDate: new Date().toISOString(), lastModifiedDate: new Date().toISOString() };
  
  localStorage.setItem('bidReservations', JSON.stringify([bid1, bid2, bid3]));

  // --- Financing Commitments ---
  const commitments: FinancingCommitment[] = [
    { id: uuidv4(), slotId: bid2.slotId, bidId: bid2.id, counterpartyId: bid2.counterpartyId, committedAmount: 15000, paidDeposit: false, schedule: 'Upon final approval', createdDate: new Date().toISOString() },
  ];
  localStorage.setItem('financingCommitments', JSON.stringify(commitments));

  toast.info('Dummy data has been regenerated for two-way deal approval.');
  localStorage.setItem('dummyDataVersion', DUMMY_DATA_VERSION);
};