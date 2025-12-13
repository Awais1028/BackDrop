---
title: Product Requirements Document
app: quick-otter-bounce
created: 2025-12-13T10:00:44.529Z
version: 1
source: Deep Mode PRD Generation
---

# PRODUCT REQUIREMENTS DOCUMENT

**EXECUTIVE SUMMARY**

*   **Product Vision:** To create a lightweight, programmatic-like marketplace that connects creators with advertisers and merchants, enabling predictable, upfront revenue for pre-production content sponsorships and efficient demand capture for brands.
*   **Core Purpose:** The platform solves the problem of creators lacking predictable pre-production revenue by allowing them to expose integration slots from scripts, and provides advertisers/merchants an efficient way to buy in-content sponsorships at scale, streamlining approvals and financing views.
*   **Target Users:**
    *   **Creators:** Scripted, long-form content producers seeking pre-production financing.
    *   **Advertisers:** Brands focused on upper-funnel reach, seeking scalable in-content sponsorships.
    *   **Merchants:** E-commerce businesses (lower-funnel) seeking native reach and affiliate upside for their products.
    *   **Operators:** Internal platform administrators managing inventory, workflows, and liquidity.
*   **Key Features:**
    *   Script Upload & Slot Tagging (User-Generated Content)
    *   Merchant SKU Bulk Upload (User-Generated Content)
    *   Discovery & Bidding for Sponsorship Slots (User-Generated Content)
    *   Approvals Workflow & Deal Memo Generation (System/Communication)
    *   Financing Dashboard (Financial Record)
    *   Evidence Pack Export (System/Reporting)
*   **Complexity Assessment:** Moderate
    *   **State Management:** Local (within the application's database).
    *   **External Integrations:** 1 (AI API for script analysis).
    *   **Business Logic:** Moderate (pricing engine, auction logic, multi-stage approval workflow, financing calculations).
    *   **Data Synchronization:** None (standard database operations).
*   **MVP Success Metrics:**
    *   Users can complete the core workflow from script upload to deal memo generation and financing view.
    *   All defined entity lifecycles (Create, View, Edit, Delete/Archive) function correctly.
    *   The system handles basic user interactions and data processing without errors.

**1. USERS & PERSONAS**

*   **Primary Persona: Creator (Line Producer)**
    *   **Context:** A line producer for scripted, long-form content, assessing budgets during script review. They need to predict revenue to ensure profitability for digital distribution.
    *   **Goals:** Secure predictable pre-production funding, preserve creative integrity, simplify approvals, and gain transparent demand for integration slots.
    *   **Needs:** A platform to easily expose integration opportunities from scripts, set pricing floors, review offers, and track financing impact.
*   **Secondary Persona: Advertiser (Brand Manager)**
    *   **Context:** A brand manager looking for scalable reach across validated creator genres for upper-funnel marketing objectives.
    *   **Goals:** Discover relevant pre-production opportunities, place bids/reservations with predictable pricing, and ensure suitability controls.
    *   **Needs:** A discovery interface, bidding/reservation tools, and an approval mechanism for proposed integrations.
*   **Secondary Persona: Merchant (E-commerce Manager)**
    *   **Context:** An e-commerce manager for a "torso" brand, seeking native reach and affiliate upside for products.
    *   **Goals:** Bulk upload product catalogs, set pricing guardrails, apply eligibility rules, and commit to in-content integrations with minimal overhead.
    *   **Needs:** SKU bulk upload, rule-setting for placements, and a clear commitment process.
*   **Secondary Persona: Operator (Platform Administrator)**
    *   **Context:** An internal administrator responsible for the health and growth of the marketplace.
    *   **Goals:** Ensure liquidity, maintain quality/suitability governance, track margins, and audit activity.
    *   **Needs:** Tools to curate inventory, monitor workflows, track commitments, and export data for reporting.

**2. FUNCTIONAL REQUIREMENTS**

**2.1 User-Requested Features (All are Priority 0 - Core MVP)**

*   **FR-001: Script/Treatment Upload & Management**
    *   **Description:** Creators can upload their scripts or treatments to the platform, which serve as the basis for identifying integration slots.
    *   **Entity Type:** User-Generated Content (Project/Script)
    *   **User Benefit:** Enables creators to bring their content into the marketplace and begin monetizing pre-production.
    *   **Primary User:** Creator
    *   **Lifecycle Operations:**
        *   **Create:** User uploads a script file (e.g., PDF, DOCX).
        *   **View:** User can view a list of their uploaded scripts and access details for each.
        *   **Edit:** User can update script metadata (e.g., title, production window, budget target).
        *   **Delete:** User can remove an uploaded script.
        *   **List/Search:** Users can view a list of their scripts.
    *   **Acceptance Criteria:**
        *   - [ ] Given a Creator, when they upload a script, then the script is stored and associated with their account.
        *   - [ ] Given a Creator, when they view their scripts, then they see a list of all their uploaded scripts.
        *   - [ ] Given an existing script, when a Creator edits its metadata, then the changes are saved.
        *   - [ ] Given an existing script, when a Creator deletes it, then the script and all associated slots are removed (with confirmation).

*   **FR-002: Integration Slot Tagging (Manual + AI Assist)**
    *   **Description:** Creators can identify and tag specific "integration slots" within their uploaded scripts, either manually or with AI-generated suggestions for commercial nouns and conducive environments.
    *   **Entity Type:** User-Generated Content (Integration Slot)
    *   **User Benefit:** Allows creators to define specific monetization opportunities within their content.
    *   **Primary User:** Creator
    *   **Lifecycle Operations:**
        *   **Create:** User manually tags a slot or accepts an AI suggestion, providing a description and scene reference.
        *   **View:** User can view a list of tagged slots for a script and their details.
        *   **Edit:** User can modify slot descriptions, scene references, or other details.
        *   **Delete:** User can remove a tagged slot.
        *   **List/Search:** Users can view and filter their slots by script.
    *   **Acceptance Criteria:**
        *   - [ ] Given an uploaded script, when a Creator manually tags a slot, then the slot is created with provided details.
        *   - [ ] Given an uploaded script, when a Creator requests AI suggestions, then the system provides relevant commercial noun/environment suggestions.
        *   - [ ] Given AI suggestions, when a Creator accepts one, then a new slot is created based on the suggestion.
        *   - [ ] Given an existing slot, when a Creator edits its details, then the changes are saved.
        *   - [ ] Given an existing slot, when a Creator deletes it, then the slot is removed.

*   **FR-003: Slot Constraints & Pricing Floors**
    *   **Description:** Creators can define constraints (e.g., brand suitability, product categories) and set a minimum pricing floor for each integration slot.
    *   **Entity Type:** User-Generated Content (Integration Slot attributes)
    *   **User Benefit:** Gives creators control over who can sponsor their content and ensures fair compensation.
    *   **Primary User:** Creator
    *   **Lifecycle Operations:**
        *   **Create:** User sets constraints and pricing floor during slot creation or editing.
        *   **View:** User can view the set constraints and pricing floor for a slot.
        *   **Edit:** User can modify constraints and pricing floor.
    *   **Acceptance Criteria:**
        *   - [ ] Given a slot, when a Creator sets a pricing floor, then the system enforces this minimum during bidding.
        *   - [ ] Given a slot, when a Creator defines constraints, then these are visible to potential buyers.

*   **FR-004: Slot Modality Selection**
    *   **Description:** Creators can select the monetization modality for each slot (e.g., Private Auction, Programmatic Guaranteed/Reservation).
    *   **Entity Type:** User-Generated Content (Integration Slot attributes)
    *   **User Benefit:** Allows creators to choose the best sales strategy for their inventory.
    *   **Primary User:** Creator
    *   **Lifecycle Operations:**
        *   **Create:** User selects modality during slot creation or editing.
        *   **View:** User can view the selected modality for a slot.
        *   **Edit:** User can change the modality (if no active bids/reservations).
    *   **Acceptance Criteria:**
        *   - [ ] Given a slot, when a Creator selects a modality, then the system applies the corresponding bidding/reservation logic.

*   **FR-005: Review Bids & Requirements**
    *   **Description:** Creators can review incoming bids or reservation requests for their slots, including details about the advertiser/merchant and their proposed terms.
    *   **Entity Type:** Communication (Bid/Reservation, Advertiser, Merchant)
    *   **User Benefit:** Enables creators to evaluate potential sponsorships and make informed decisions.
    *   **Primary User:** Creator
    *   **Lifecycle Operations:**
        *   **View:** User can view a list of bids/reservations for their slots and drill down into details.
    *   **Acceptance Criteria:**
        *   - [ ] Given a slot with bids/reservations, when a Creator views the slot, then they see a list of all associated bids/reservations.
        *   - [ ] Given a bid/reservation, when a Creator views its details, then they see the counterparty, proposed terms, and status.

*   **FR-006: Approve/Decline Bids & Generate Deal Memo**
    *   **Description:** Creators can approve or decline bids/reservations. Upon approval, the system locks the slot and generates a deal memo.
    *   **Entity Type:** System/Communication (Approval, Deal Memo)
    *   **User Benefit:** Formalizes the sponsorship agreement and moves the deal forward.
    *   **Primary User:** Creator
    *   **Lifecycle Operations:**
        *   **Create:** User makes an approval/decline decision. System generates Deal Memo upon approval.
        *   **View:** User can view the status of their approvals and access generated deal memos.
    *   **Acceptance Criteria:**
        *   - [ ] Given a bid/reservation, when a Creator approves it, then the slot status updates to "locked," and a deal memo is generated.
        *   - [ ] Given a bid/reservation, when a Creator declines it, then the bid/reservation status updates to "declined."
        *   - [ ] Given an approved deal, when a Creator accesses the deal memo, then they can view/download the PDF.

*   **FR-007: Financing Dashboard**
    *   **Description:** Creators can view a dashboard showing the financial impact of their commitments, including the percentage of their project budget covered by pre-sold integrations.
    *   **Entity Type:** Financial Record (Financing Commitment)
    *   **User Benefit:** Provides creators with a clear overview of their pre-production funding status.
    *   **Primary User:** Creator
    *   **Lifecycle Operations:**
        *   **View:** User can view the dashboard with aggregated commitment data.
    *   **Acceptance Criteria:**
        *   - [ ] Given a Creator with commitments, when they access the financing dashboard, then they see the total committed amount and the percentage of their budget covered.

*   **FR-008: Discover Pre-Production Opportunities**
    *   **Description:** Advertisers and Merchants can browse and filter available integration slots by criteria such as genre, audience demographics, and integration type.
    *   **Entity Type:** User-Generated Content (Integration Slot)
    *   **User Benefit:** Enables buyers to efficiently find relevant sponsorship opportunities.
    *   **Primary User:** Advertiser, Merchant
    *   **Lifecycle Operations:**
        *   **View:** User can view a list of available slots.
        *   **List/Search:** Users can filter slots by genre, demo, and integration type.
    *   **Acceptance Criteria:**
        *   - [ ] Given an Advertiser/Merchant, when they access the marketplace, then they see a list of available integration slots.
        *   - [ ] Users can filter the slot list by genre, demographic, and integration type.

*   **FR-009: Place Bids/Reservations**
    *   **Description:** Advertisers and Merchants can place bids for private auctions or make reservation requests for specific slots, specifying their objective (e.g., Reach) and proposing a flight window.
    *   **Entity Type:** User-Generated Content/Financial (Bid/Reservation)
    *   **User Benefit:** Allows buyers to express interest and commit to sponsorship opportunities.
    *   **Primary User:** Advertiser, Merchant
    *   **Lifecycle Operations:**
        *   **Create:** User submits a bid or reservation request with terms.
        *   **View:** User can view a list of their submitted bids/reservations and their status.
        *   **Edit:** User can modify an unaccepted bid/reservation.
        *   **Delete:** User can cancel an unaccepted bid/reservation.
    *   **Acceptance Criteria:**
        *   - [ ] Given an available slot, when an Advertiser/Merchant places a bid/reservation, then it is recorded and visible to the Creator.
        *   - [ ] Users can specify their objective and proposed flight window when placing a bid/reservation.
        *   - [ ] Users can view the status of their submitted bids/reservations.

*   **FR-010: Comment/Approve Proposed Integrations (Buyer Side)**
    *   **Description:** Advertisers and Merchants can provide comments and approve the final proposed integration plan for deals they have committed to.
    *   **Entity Type:** Communication (Approval)
    *   **User Benefit:** Ensures buyers have oversight and sign-off on how their brand/product will be integrated.
    *   **Primary User:** Advertiser, Merchant
    *   **Lifecycle Operations:**
        *   **Create:** User submits comments and an approval decision.
        *   **View:** User can view the status of their approvals.
    *   **Acceptance Criteria:**
        *   - [ ] Given a committed deal, when an Advertiser/Merchant reviews the integration plan, then they can submit comments and an approval decision.

*   **FR-011: Commit Spend**
    *   **Description:** Advertisers and Merchants can formally commit their spend for accepted sponsorship deals.
    *   **Entity Type:** Financial Record (Financing Commitment)
    *   **User Benefit:** Solidifies the financial agreement and contributes to the creator's financing view.
    *   **Primary User:** Advertiser, Merchant
    *   **Lifecycle Operations:**
        *   **Create:** User confirms commitment for an accepted deal.
        *   **View:** User can view a list of their financial commitments.
    *   **Acceptance Criteria:**
        *   - [ ] Given an accepted deal, when an Advertiser/Merchant commits spend, then a financing commitment record is created.
        *   - [ ] Users can view their list of committed deals and associated amounts.

*   **FR-012: Merchant Bulk SKU Upload (CSV)**
    *   **Description:** Merchants can upload their product catalogs in bulk via a CSV file. The system will normalize the SKU data to a common schema.
    *   **Entity Type:** User-Generated Content (SKU)
    *   **User Benefit:** Allows merchants to quickly onboard their product inventory for potential sponsorships.
    *   **Primary User:** Merchant
    *   **Lifecycle Operations:**
        *   **Create:** User uploads a CSV file, and the system processes it to create/update SKUs.
        *   **View:** User can view a list of their uploaded SKUs.
        *   **Edit:** User can edit individual SKU details.
        *   **Delete:** User can delete individual SKUs.
        *   **List/Search:** Users can view and filter their SKUs.
    *   **Acceptance Criteria:**
        *   - [ ] Given a Merchant, when they upload a CSV with SKU data, then the system parses and creates/updates SKU records.
        *   - [ ] The system normalizes uploaded SKU data to a predefined schema.
        *   - [ ] Users can view a list of their uploaded SKUs.

*   **FR-013: Merchant Minimum Integration Fee**
    *   **Description:** Merchants can set a minimum integration fee that they are willing to pay for sponsorships.
    *   **Entity Type:** Configuration (Merchant attributes)
    *   **User Benefit:** Provides merchants with control over their spending and ensures a baseline value for integrations.
    *   **Primary User:** Merchant
    *   **Lifecycle Operations:**
        *   **Create:** User sets the minimum fee in their profile/settings.
        *   **View:** User can view their current minimum fee.
        *   **Edit:** User can adjust their minimum fee.
    *   **Acceptance Criteria:**
        *   - [ ] Given a Merchant, when they set a minimum integration fee, then the system applies this rule to their bids/reservations.

*   **FR-014: Merchant Optimization Mode/Pricing Model**
    *   **Description:** Merchants can choose their optimization mode (Reach vs. Conversions) or a hybrid pricing model (minimum fee + revenue share) when making bids/reservations.
    *   **Entity Type:** User-Generated Content (Bid/Reservation attributes)
    *   **User Benefit:** Allows merchants to align sponsorship terms with their business objectives.
    *   **Primary User:** Merchant
    *   **Lifecycle Operations:**
        *   **Create:** User selects optimization mode/pricing model when placing a bid/reservation.
        *   **View:** User can view the selected mode/model for their bids/reservations.
        *   **Edit:** User can modify the mode/model for unaccepted bids/reservations.
    *   **Acceptance Criteria:**
        *   - [ ] Given a Merchant placing a bid/reservation, when they select an optimization mode or hybrid pricing, then the system records this choice.

*   **FR-015: Merchant Eligibility & Suitability Rules**
    *   **Description:** Merchants can apply eligibility and suitability rules at the catalog or collection level to define which of their SKUs are suitable for certain integrations.
    *   **Entity Type:** Configuration (Merchant attributes/rules)
    *   **User Benefit:** Ensures brand safety and relevance for merchant product placements.
    *   **Primary User:** Merchant
    *   **Lifecycle Operations:**
        *   **Create:** User defines and applies rules.
        *   **View:** User can view their active rules.
        *   **Edit:** User can modify their rules.
        *   **Delete:** User can remove rules.
    *   **Acceptance Criteria:**
        *   - [ ] Given a Merchant, when they define eligibility/suitability rules, then the system applies these rules when matching SKUs to slots.

*   **FR-016: Operator Inventory Curation & Visibility**
    *   **Description:** Operators can view all integration slots and manage their visibility (e.g., open to all buyers, private to specific buyers).
    *   **Entity Type:** User-Generated Content (Integration Slot)
    *   **User Benefit:** Allows operators to manage marketplace liquidity and control access to inventory.
    *   **Primary User:** Operator
    *   **Lifecycle Operations:**
        *   **View:** Operator can view all slots and their current visibility settings.
        *   **Edit:** Operator can adjust the visibility of a slot.
    *   **Acceptance Criteria:**
        *   - [ ] Given an Operator, when they view the inventory, then they see all listed slots and their visibility status.
        *   - [ ] Given a slot, when an Operator changes its visibility, then the change is applied.

*   **FR-017: Operator Workflow Monitoring (Auction/Reservation/Approvals)**
    *   **Description:** Operators can monitor the status and progress of auction/reservation workflows and the multi-stage approval process.
    *   **Entity Type:** System/Communication (Bid/Reservation, Approval)
    *   **User Benefit:** Provides operators with oversight to ensure smooth marketplace operations.
    *   **Primary User:** Operator
    *   **Lifecycle Operations:**
        *   **View:** Operator can view the status of all bids, reservations, and approval stages.
    *   **Acceptance Criteria:**
        *   - [ ] Given an Operator, when they access the console, then they can see the current status of all active bids/reservations.
        *   - [ ] Operators can view the progress of each approval workflow.

*   **FR-018: Operator Financing & Margin View**
    *   **Description:** Operators can track all financing commitments across projects and view aggregated margin data.
    *   **Entity Type:** Financial Record (Financing Commitment)
    *   **User Benefit:** Enables operators to monitor marketplace financial health and profitability.
    *   **Primary User:** Operator
    *   **Lifecycle Operations:**
        *   **View:** Operator can view a dashboard of total commitments and margin insights.
    *   **Acceptance Criteria:**
        *   - [ ] Given an Operator, when they access the financing view, then they see total commitments and margin data.

*   **FR-019: Evidence Pack Export**
    *   **Description:** Operators can generate a one-click bundle of relevant deal information (slot excerpt, bid/terms, approvals timeline, deal memo, financing snapshot) for a specific campaign.
    *   **Entity Type:** System/Reporting (Derived from multiple entities)
    *   **User Benefit:** Provides a comprehensive record for auditing and reporting purposes.
    *   **Primary User:** Operator
    *   **Lifecycle Operations:**
        *   **Create:** User triggers the export of an evidence pack.
        *   **View:** User can download the generated pack.
    *   **Acceptance Criteria:**
        *   - [ ] Given a campaign, when an Operator requests an evidence pack, then a downloadable bundle containing all specified information is generated.

**2.2 Essential Market Features**

*   **FR-XXX: User Authentication**
    *   **Description:** Secure user login and session management for Creators, Advertisers, Merchants, and Operators.
    *   **Entity Type:** Configuration/System
    *   **User Benefit:** Protects user data and personalizes experience for each persona.
    *   **Primary User:** All personas
    *   **Lifecycle Operations:**
        *   **Create:** Register new account (for Creator, Advertiser, Merchant). Operator accounts are provisioned.
        *   **View:** View profile information.
        *   **Edit:** Update profile and preferences.
        *   **Delete:** Account deletion option (with data export).
        *   **Additional:** Password reset, session management.
    *   **Acceptance Criteria:**
        *   - [ ] Given valid credentials, when user logs in, then access is granted to their respective console.
        *   - [ ] Given invalid credentials, when user attempts login, then access is denied with clear error.
        *   - [ ] Users can reset forgotten passwords.
        *   - [ ] Users can update their profile information.
        *   - [ ] Users can delete their account (with confirmation and data export option).

*   **FR-XXX: Pricing Engine v0**
    *   **Description:** The system enforces pricing floors set by creators and minimums set by merchants. It supports Fixed, Revenue-Share % GMV, and Hybrid pricing models.
    *   **Entity Type:** System/Configuration
    *   **User Benefit:** Automates pricing logic and ensures fair deal terms.
    *   **Primary User:** System (impacts all personas)
    *   **Lifecycle Operations:** N/A (system logic)
    *   **Acceptance Criteria:**
        *   - [ ] Given a bid, when the system evaluates it, then it ensures the bid meets the creator's pricing floor and merchant's minimums.
        *   - [ ] The system correctly calculates deal values based on Fixed, Rev-Share, and Hybrid models.

*   **FR-XXX: Private Auction Logic**
    *   **Description:** The system manages sealed-bid private auctions, selecting the best fit against creator rules and pricing floor.
    *   **Entity Type:** System/Configuration
    *   **User Benefit:** Facilitates competitive bidding for private inventory.
    *   **Primary User:** System (impacts Creator, Advertiser)
    *   **Lifecycle Operations:** N/A (system logic)
    *   **Acceptance Criteria:**
        *   - [ ] Given multiple bids for a private auction slot, when the auction closes, then the system identifies the winning bid based on creator rules and pricing floor.

*   **FR-XXX: Reservation Logic**
    *   **Description:** The system handles direct acceptance of reservation requests at fixed terms.
    *   **Entity Type:** System/Configuration
    *   **User Benefit:** Provides a straightforward way for buyers to secure inventory.
    *   **Primary User:** System (impacts Creator, Merchant)
    *   **Lifecycle Operations:** N/A (system logic)
    *   **Acceptance Criteria:**
        *   - [ ] Given a reservation request, when a Creator accepts it, then the system locks the slot at the agreed terms.

*   **FR-XXX: Approvals Workflow**
    *   **Description:** A two-stage approval workflow: initial guideline compliance review, followed by final integration plan approval (pre-shoot). All decisions are timestamped and gate deal memo generation.
    *   **Entity Type:** System/Communication
    *   **User Benefit:** Ensures all parties agree on the integration details and compliance.
    *   **Primary User:** System (impacts Creator, Advertiser, Merchant, Operator)
    *   **Lifecycle Operations:** N/A (system logic)
    *   **Acceptance Criteria:**
        *   - [ ] Given a deal, when the first stage of approval is completed, then the deal progresses to the second stage.
        *   - [ ] All approval decisions are timestamped and recorded.
        *   - [ ] A deal memo can only be generated after all required approval stages are complete.

*   **FR-XXX: Deal Memo Generation**
    *   **Description:** The system generates a templated PDF deal memo upon final approval of a sponsorship.
    *   **Entity Type:** System/Financial
    *   **User Benefit:** Provides a formal, legally-binding document for the agreement.
    *   **Primary User:** System (impacts Creator, Advertiser, Merchant)
    *   **Lifecycle Operations:** N/A (system logic)
    *   **Acceptance Criteria:**
        *   - [ ] Given a fully approved deal, when a deal memo is requested, then a PDF document is generated with all relevant terms and details.

*   **FR-XXX: AI Assistance for Script Tagging**
    *   **Description:** The system uses an LLM prompt to identify commercial nouns and conducive environments from an uploaded script, providing suggestions for integration slots. This is a human-in-the-loop process.
    *   **Entity Type:** System/AI
    *   **User Benefit:** Accelerates the slot identification process for creators.
    *   **Primary User:** System (assists Creator)
    *   **Lifecycle Operations:** N/A (system logic)
    *   **Acceptance Criteria:**
        *   - [ ] Given an uploaded script, when a Creator requests AI suggestions, then the system returns a list of potential commercial nouns/environments.
        *   - [ ] The AI suggestions are presented in a way that allows the Creator to easily accept or reject them.

**3. USER WORKFLOWS**

**3.1 Primary Workflow: Creator PG Reservation**

*   **Trigger:** Creator wants to monetize a script.
*   **Outcome:** Creator secures a reservation for an integration slot, and the financing dashboard updates.
*   **Steps:**
    1.  **Creator** uploads a script (FR-001).
    2.  **Creator** tags "Kitchen Scene #2" as an integration slot, manually or with AI assist (FR-002).
    3.  **Creator** sets a pricing floor and selects "Reservation" modality for the slot (FR-003, FR-004).
    4.  **Merchant** bulk-uploads their skincare catalog via CSV (FR-012).
    5.  **Merchant** sets a minimum integration fee and chooses a hybrid pricing model (min fee + rev-share) (FR-013, FR-014).
    6.  **Merchant** discovers the "Kitchen Scene #2" slot (FR-008).
    7.  **Merchant** reserves the slot, applying eligibility rules from their catalog (FR-009, FR-015).
    8.  **Creator** reviews the reservation request (FR-005).
    9.  **Creator** approves the reservation (FR-006).
    10. **Merchant** provides final approval for the integration plan (FR-010).
    11. **Merchant** commits spend for the reservation (FR-011).
    12. System generates a deal memo (FR-006).
    13. **Creator** views the updated financing dashboard, showing the commitment (FR-007).
*   **Alternative Paths:**
    *   If Creator declines reservation, the slot remains available.
    *   If Merchant fails to commit spend, the deal is cancelled.

**3.2 Entity Management Workflows**

*   **Project/Script Management Workflow**
    *   **Create Project/Script:**
        1.  Creator navigates to "My Scripts."
        2.  Creator clicks "Upload New Script."
        3.  Creator uploads file and fills in title, production window, budget target.
        4.  Creator saves script.
        5.  System confirms creation and displays script in list.
    *   **Edit Project/Script:**
        1.  Creator locates existing script in "My Scripts" list.
        2.  Creator clicks "Edit" option.
        3.  Creator modifies title, production window, or budget target.
        4.  Creator saves changes.
        5.  System confirms update.
    *   **Delete Project/Script:**
        1.  Creator locates script to delete.
        2.  Creator clicks "Delete" option.
        3.  System asks for confirmation, warning that all associated slots will also be deleted.
        4.  Creator confirms deletion.
        5.  System removes script and associated slots, confirming removal.
    *   **Search/Filter Projects/Scripts:**
        1.  Creator navigates to "My Scripts" list.
        2.  User can sort results by title or creation date.

*   **Integration Slot Management Workflow**
    *   **Create Integration Slot:**
        1.  Creator navigates to a specific script's detail page.
        2.  Creator clicks "Tag New Slot" or "Get AI Suggestions."
        3.  If manual, Creator fills in scene reference, description, constraints, pricing floor, and modality.
        4.  If AI, Creator reviews suggestions and accepts one, then refines details.
        5.  Creator saves slot.
        6.  System confirms creation and displays slot in script's slot list.
    *   **Edit Integration Slot:**
        1.  Creator locates existing slot from a script's detail page.
        2.  Creator clicks "Edit" option.
        3.  Creator modifies description, constraints, pricing floor, or modality.
        4.  Creator saves changes.
        5.  System confirms update.
    *   **Delete Integration Slot:**
        1.  Creator locates slot to delete.
        2.  Creator clicks "Delete" option.
        3.  System asks for confirmation, warning about active bids/reservations.
        4.  Creator confirms deletion.
        5.  System removes slot and confirms.
    *   **Search/Filter Integration Slots:**
        1.  Advertiser/Merchant navigates to "Discover Opportunities" list.
        2.  User enters search criteria or applies filters by genre, demo, integration type.
        3.  System displays matching results.
        4.  User can sort results by pricing or creation date.

*   **SKU Management Workflow (Merchant)**
    *   **Bulk Upload SKUs:**
        1.  Merchant navigates to "My Products."
        2.  Merchant clicks "Bulk Upload SKUs (CSV)."
        3.  Merchant uploads CSV file.
        4.  System processes file, normalizes data, and displays import results.
        5.  System confirms creation/update of SKUs.
    *   **Edit SKU:**
        1.  Merchant locates existing SKU in "My Products" list.
        2.  Merchant clicks "Edit" option.
        3.  Merchant modifies title, price, margin, or tags.
        4.  Merchant saves changes.
        5.  System confirms update.
    *   **Delete SKU:**
        1.  Merchant locates SKU to delete.
        2.  Merchant clicks "Delete" option.
        3.  System asks for confirmation.
        4.  Merchant confirms deletion.
        5.  System removes SKU and confirms.
    *   **Search/Filter SKUs:**
        1.  Merchant navigates to "My Products" list.
        2.  User enters search criteria or applies filters by tags or price range.
        3.  System displays matching results.

**3.5 CONVERSATION SIMULATIONS (AI Assistance for Script Tagging)**

*   **Simulation 1: Primary Use Case - Happy Path (Creator tagging a scene)**
    *   **Context:** Creator has uploaded a script titled "The Coffee Shop Heist" and wants to identify sponsorship opportunities.
    *   **User:** "Analyze 'The Coffee Shop Heist' script for commercial opportunities."
    *   **AI Assistant:** "I'd be happy to help you with that! I'm analyzing 'The Coffee Shop Heist' script now. This might take a moment. Once complete, I'll highlight potential commercial nouns and conducive environments for integration slots. You'll then be able to review and tag them. Please wait..."
    *   **(After processing)**
    *   **AI Assistant:** "Analysis complete! Here are some potential integration slots I've identified from 'The Coffee Shop Heist':
        *   **Scene:** 'Morning Rush at Joe's Cafe' (Page 12)
            *   **Suggested Nouns:** 'Espresso Machine', 'Coffee Beans', 'Pastry Display'
            *   **Conducive Environment:** 'Busy Cafe Interior'
        *   **Scene:** 'Car Chase Through Downtown' (Page 45)
            *   **Suggested Nouns:** 'Luxury Sedan', 'Smartphone', 'Energy Drink'
            *   **Conducive Environment:** 'Urban Streetscape'
        *   ... (more suggestions)
        You can now review these suggestions and click 'Tag Slot' to add them to your project, or manually tag new ones."
    *   **User:** "Tag 'Espresso Machine' from 'Morning Rush at Joe's Cafe'."
    *   **AI Assistant:** "Great! I've created a new integration slot for 'Espresso Machine' in 'Morning Rush at Joe's Cafe'. You can now add details like pricing floor and modality."

*   **Simulation 2: Error/Confusion Handling (Unclear request)**
    *   **Context:** Creator has uploaded a script and is trying to use the AI assistant.
    *   **User:** "Find stuff."
    *   **AI Assistant:** "I want to make sure I understand correctly. Are you looking to:
        *   Identify potential integration slots in your uploaded script?
        *   Search for existing bids or reservations?
        *   Something else?
        Please provide more context, and I'll do my best to assist you!"
    *   **User:** "Yes, find integration slots in my script."
    *   **AI Assistant:** "Understood! Which script would you like me to analyze for integration slots? Please specify the script title."

**4. BUSINESS RULES**

*   **Entity Lifecycle Rules:**
    *   **User:** Full CRUD. Account deletion requires confirmation and offers data export.
    *   **Project/Script:** Full CRUD. Only the Creator who uploaded the script can view, edit, or delete it. Deleting a script cascades to delete all associated Integration Slots.
    *   **Integration Slot:** Full CRUD. Only the Creator who owns the script can view, edit, or delete its slots. A slot cannot be deleted if it has an active (approved/committed) bid/reservation.
    *   **Advertiser/Merchant:** Full CRUD. Only the associated User can view/edit their profile. Account deletion requires confirmation.
    *   **SKU:** Full CRUD. Only the associated Merchant can view, edit, or delete their SKUs.
    *   **Bid/Reservation:** Create, View, Edit (if unaccepted), Delete (if unaccepted). Only the Advertiser/Merchant who placed the bid/reservation can view, edit, or delete it. Creators can view all bids/reservations for their slots.
    *   **Approval:** Create, View. Approvals are immutable once made (no edit/delete). New decisions override previous ones in the workflow. All approvals are timestamped.
    *   **Deal Memo:** Create, View. Deal memos are generated upon final approval and are immutable (no edit/delete). Access is restricted to the Creator, Advertiser, and Merchant involved in the deal.
    *   **Financing Commitment:** Create, View. Commitments are immutable once recorded (no edit/delete). Access is restricted to the Creator, Advertiser, and Merchant involved, and Operators.
    *   **Audit Log:** Create (system-generated), View (Operator only). Immutable.
*   **Access Control:**
    *   **Creator:** Can manage their own scripts, slots, review bids, and manage approvals for their slots. Can view their financing dashboard.
    *   **Advertiser/Merchant:** Can discover slots, place bids/reservations, manage their own profiles/SKUs (for merchants), and approve integration plans for their deals. Can view their commitments.
    *   **Operator:** Has full view access to all marketplace data (scripts, slots, bids, approvals, commitments, audit logs). Can manage slot visibility.
*   **Data Rules:**
    *   **Project/Script:** `title` (required, unique per creator), `doc_link` (required), `budget_target` (optional, numeric).
    *   **Integration Slot:** `project_id` (required, foreign key), `scene_ref` (required), `description` (required), `pricing_floor` (required, numeric, >=0), `modality` (required, enum: Private Auction, PG/Reservation).
    *   **SKU:** `merchant_id` (required, foreign key), `title` (required), `price` (required, numeric, >0), `margin` (required, numeric, 0-100).
    *   **Bid/Reservation:** `counterparty_id` (required, foreign key), `slot_id` (required, foreign key), `objective` (required, enum: Reach, Conversions), `pricing_model` (required, enum: Fixed, Rev-Share, Hybrid), `amount/terms` (required, depends on model), `status` (enum: Pending, Accepted, Declined, Committed, Cancelled).
    *   **Approval:** `slot_id` (required), `counterparty_id` (required), `decision` (enum: Approved, Declined), `timestamp` (required).
    *   **Deal Memo:** `slot_id` (required), `pdf_link` (required).
    *   **Financing Commitment:** `slot_id` (required), `counterparty_id` (required), `committed_amount` (required, numeric, >0).
*   **Process Rules:**
    *   A bid/reservation must meet the creator's `pricing_floor` to be considered "qualified."
    *   A deal memo can only be generated after both Creator and Advertiser/Merchant have completed their respective approval stages.
    *   A slot's modality cannot be changed if there are active (pending or accepted) bids/reservations.
    *   Merchant SKU bulk upload must adhere to a predefined CSV format.

**5. DATA REQUIREMENTS**

*   **User**
    *   **Type:** System/Configuration
    *   **Attributes:** `id` (PK), `email` (unique, required), `password_hash`, `name`, `role` (enum: Creator, Advertiser, Merchant, Operator), `created_date`, `last_modified_date`.
    *   **Relationships:** Has many Projects/Scripts (if Creator), has one Advertiser profile (if Advertiser), has one Merchant profile (if Merchant).
    *   **Lifecycle:** Full CRUD with account deletion option.
    *   **Retention:** User-initiated deletion with data export.
*   **Project/Script**
    *   **Type:** User-Generated Content
    *   **Attributes:** `id` (PK), `title` (required), `creator_id` (FK to User), `doc_link` (URL to uploaded script), `production_window` (text/date range), `budget_target` (numeric, optional), `created_date`, `last_modified_date`.
    *   **Relationships:** Belongs to User (Creator), has many Integration Slots.
    *   **Lifecycle:** Full CRUD.
    *   **Retention:** User-initiated deletion.
*   **Integration Slot**
    *   **Type:** User-Generated Content
    *   **Attributes:** `id` (PK), `project_id` (FK to Project/Script), `scene_ref` (text), `description` (text), `constraints` (text/JSON for rules), `pricing_floor` (numeric), `modality` (enum: Private Auction, PG/Reservation), `status` (enum: Available, Locked, Completed), `created_date`, `last_modified_date`.
    *   **Relationships:** Belongs to Project/Script, has many Bids/Reservations.
    *   **Lifecycle:** Full CRUD.
    *   **Retention:** User-initiated deletion.
*   **Advertiser**
    *   **Type:** Configuration/System
    *   **Attributes:** `id` (PK), `user_id` (FK to User), `brand_name` (required), `category` (text), `created_date`, `last_modified_date`.
    *   **Relationships:** Belongs to User.
    *   **Lifecycle:** Full CRUD.
    *   **Retention:** User-initiated deletion.
*   **Merchant**
    *   **Type:** Configuration/System
    *   **Attributes:** `id` (PK), `user_id` (FK to User), `platform` (text, e.g., Shopify, Amazon - for future, not MVP), `min_integration_fee` (numeric), `eligibility_rules` (text/JSON for rules), `suitability_rules` (text/JSON for rules), `created_date`, `last_modified_date`.
    *   **Relationships:** Belongs to User, has many SKUs.
    *   **Lifecycle:** Full CRUD.
    *   **Retention:** User-initiated deletion.
*   **SKU**
    *   **Type:** User-Generated Content
    *   **Attributes:** `id` (PK), `merchant_id` (FK to Merchant), `title` (required), `price` (numeric), `margin` (numeric), `tags` (text/array), `created_date`, `last_modified_date`.
    *   **Relationships:** Belongs to Merchant.
    *   **Lifecycle:** Full CRUD.
    *   **Retention:** User-initiated deletion.
*   **Bid/Reservation**
    *   **Type:** User-Generated Content/Financial
    *   **Attributes:** `id` (PK), `counterparty_id` (FK to Advertiser/Merchant), `slot_id` (FK to Integration Slot), `objective` (enum: Reach, Conversions), `pricing_model` (enum: Fixed, Rev-Share, Hybrid), `amount_terms` (text/JSON for specific terms), `flight_window` (text/date range), `status` (enum: Pending, Accepted, Declined, Committed, Cancelled), `created_date`, `last_modified_date`.
    *   **Relationships:** Belongs to Advertiser/Merchant, belongs to Integration Slot.
    *   **Lifecycle:** Create, View, Edit (if unaccepted), Delete (if unaccepted).
    *   **Retention:** Retain for audit purposes even if cancelled/declined.
*   **Approval**
    *   **Type:** System/Communication
    *   **Attributes:** `id` (PK), `slot_id` (FK to Integration Slot), `bid_id` (FK to Bid/Reservation), `reviewer_id` (FK to User), `stage` (enum: Guideline Compliance, Integration Plan), `decision` (enum: Approved, Declined), `comments` (text), `timestamp`.
    *   **Relationships:** Belongs to Integration Slot, belongs to Bid/Reservation.
    *   **Lifecycle:** Create, View.
    *   **Retention:** Indefinite for audit trail.
*   **Deal Memo**
    *   **Type:** System/Financial
    *   **Attributes:** `id` (PK), `slot_id` (FK to Integration Slot), `bid_id` (FK to Bid/Reservation), `pricing_details` (text/JSON), `terms_details` (text/JSON), `pdf_link` (URL to generated PDF), `created_date`.
    *   **Relationships:** Belongs to Integration Slot, belongs to Bid/Reservation.
    *   **Lifecycle:** Create, View.
    *   **Retention:** Indefinite for audit trail.
*   **Financing Commitment**
    *   **Type:** Financial Record
    *   **Attributes:** `id` (PK), `slot_id` (FK to Integration Slot), `bid_id` (FK to Bid/Reservation), `counterparty_id` (FK to Advertiser/Merchant), `committed_amount` (numeric), `paid_deposit` (boolean, stub for MVP), `schedule` (text, stub for MVP), `created_date`.
    *   **Relationships:** Belongs to Integration Slot, belongs to Bid/Reservation.
    *   **Lifecycle:** Create, View.
    *   **Retention:** Indefinite for financial records.
*   **Audit Log**
    *   **Type:** System Data
    *   **Attributes:** `id` (PK), `user_id` (FK to User, optional for system actions), `action` (text), `entity_type` (text), `entity_id` (text), `details` (text/JSON), `timestamp`.
    *   **Relationships:** N/A.
    *   **Lifecycle:** Create (system generates), View (Operator only).
    *   **Retention:** Indefinite.

**6. INTEGRATION REQUIREMENTS**

*   **External Systems:**
    *   **AI Language Model (e.g., OpenAI API):**
        *   **Purpose:** To assist Creators in identifying commercial nouns and conducive environments within scripts for integration slot tagging.
        *   **Data Exchange:** Script text (input), suggested commercial terms/environments (output).
        *   **Frequency:** On-demand by Creator.
    *   **PDF Generation Library:**
        *   **Purpose:** To generate templated PDF deal memos.
        *   **Data Exchange:** Deal details (input), PDF file (output).
        *   **Frequency:** On-demand upon deal approval.

**7. FUNCTIONAL VIEWS/AREAS**

*   **Creator Console:**
    *   **My Scripts View:** List of uploaded scripts, with options to upload new, view details, edit, or delete.
    *   **Script Detail View:** Displays script content (or link), list of tagged integration slots, and options to tag new slots (manual/AI assist), edit, or delete existing slots.
    *   **Slot Detail View:** Displays slot description, constraints, pricing floor, modality, and a list of associated bids/reservations with their status. Options to approve/decline bids.
    *   **Financing Dashboard:** Overview of total commitments, % of budget covered, and drill-downs to slot-level status.
*   **Advertiser Console:**
    *   **Discover Opportunities View:** List of available integration slots with filtering/search options.
    *   **Slot Detail View:** Displays slot details, creator info, and option to place a bid/reservation.
    *   **My Bids/Reservations View:** List of submitted bids/reservations with their status, and options to edit/cancel unaccepted ones.
    *   **My Deals View:** List of accepted/committed deals, with options to provide final approval for integration plans and commit spend.
*   **Merchant Console:**
    *   **My Products View:** List of uploaded SKUs, with options for bulk CSV upload, edit, or delete individual SKUs.
    *   **My Rules View:** Interface to define and manage eligibility and suitability rules for SKUs.
    *   **Discover Opportunities View:** (Same as Advertiser Console)
    *   **Slot Detail View:** (Same as Advertiser Console)
    *   **My Bids/Reservations View:** (Same as Advertiser Console)
    *   **My Deals View:** (Same as Advertiser Console)
*   **Operator Console:**
    *   **Inventory View:** List of all scripts and integration slots, with visibility management options.
    *   **Workflow Monitoring View:** Overview of all active bids/reservations and approval statuses across the marketplace.
    *   **Financing & Margin View:** Aggregated view of all commitments and margin data.
    *   **Audit Log View:** Display of system and user actions.
    *   **Evidence Pack Export:** Interface to select a campaign and trigger export.
*   **Authentication Views:**
    *   Login Page
    *   Registration Page (for Creator, Advertiser, Merchant)
    *   Forgot Password / Reset Password Pages
    *   User Profile / Settings Page (for all users to update basic info)
*   **Modal/Overlay Needs:**
    *   Confirmation dialogs for deletions (scripts, slots, SKUs, accounts).
    *   Bid/Reservation submission forms.
    *   Approval decision forms (with comment fields).
    *   CSV upload status/error messages.
*   **Navigation Structure:**
    *   **Persistent access to:** Dashboard/Home, My Profile/Settings.
    *   **Default landing:** After login, users land on their respective console's main view (e.g., Creator lands on "My Scripts," Advertiser on "Discover Opportunities").
    *   **Entity management:** Clear navigation paths between list views (e.g., "My Scripts") and detail views (e.g., "Script Detail").

**8. MVP SCOPE & CONSTRAINTS**

*   **MVP Success Definition:**
    *   The core workflow (script upload → slot tagging → demand capture via bid/reservation → approvals → deal memo generation → financing view) can be completed end-to-end by a new user for each persona.
    *   All features defined in Section 2.1 are fully functional and accessible to their respective personas.
    *   The system can handle a small number of concurrent users (e.g., 10-20) and a reasonable volume of data for a prototype.
    *   Core features work reliably without critical errors.
*   **Technical Constraints for MVP:**
    *   **Expected concurrent users:** Up to 20.
    *   **Data volume limits:** Sufficient for a few dozen creators, hundreds of slots, and thousands of SKUs.
    *   **Performance:** Good enough for a prototype; not optimized for high-volume traffic.
*   **Explicitly Excluded from MVP:**
    *   **Full talent CRM:** Not essential for the core transaction loop.
    *   **Complex contracting:** Deal memos are templated PDFs; no dynamic contract generation or negotiation.
    *   **Dynamic ad serving:** Placements are non-dynamic, pre-production integrations.
    *   **Privacy/identity systems:** Basic user authentication only; no advanced identity management.
    *   **Post-production analytics:** Focus is on pre-production commitments and financing.
    *   **Rights/clearances automation:** Manual process for now.
    *   **Real money movement:** Commitments are tracked, but actual financial transactions are out of scope.
    *   **Affiliate link generation & click tracking stub:** Not part of the core pre-production financing loop.
    *   **Basic logistics (product sample shipping, compliance checklist):** Adds secondary value and complexity.
    *   **Role-based external access (limited) and templated contracts:** Beyond basic user roles and deal memo generation.

**9. MVP SCOPE & DEFERRED FEATURES**

**9.1 MVP Success Definition**
The core workflow from script upload to deal memo generation and financing view can be completed end-to-end by a new user. All features defined in Section 2.1 are fully functional.

**9.2 In Scope for MVP**
*   FR-001: Script/Treatment Upload & Management
*   FR-002: Integration Slot Tagging (Manual + AI Assist)
*   FR-003: Slot Constraints & Pricing Floors
*   FR-004: Slot Modality Selection
*   FR-005: Review Bids & Requirements
*   FR-006: Approve/Decline Bids & Generate Deal Memo
*   FR-007: Financing Dashboard (Creator)
*   FR-008: Discover Pre-Production Opportunities
*   FR-009: Place Bids/Reservations
*   FR-010: Comment/Approve Proposed Integrations (Buyer Side)
*   FR-011: Commit Spend
*   FR-012: Merchant Bulk SKU Upload (CSV)
*   FR-013: Merchant Minimum Integration Fee
*   FR-014: Merchant Optimization Mode/Pricing Model
*   FR-015: Merchant Eligibility & Suitability Rules
*   FR-016: Operator Inventory Curation & Visibility
*   FR-017: Operator Workflow Monitoring (Auction/Reservation/Approvals)
*   FR-018: Operator Financing & Margin View
*   FR-019: Evidence Pack Export
*   FR-XXX: User Authentication
*   FR-XXX: Pricing Engine v0
*   FR-XXX: Private Auction Logic
*   FR-XXX: Reservation Logic
*   FR-XXX: Approvals Workflow
*   FR-XXX: Deal Memo Generation
*   FR-XXX: AI Assistance for Script Tagging

**9.3 Deferred Features (Post-MVP Roadmap)**

*   **DF-001: Full Talent CRM**
    *   **Description:** Comprehensive customer relationship management features for talent.
    *   **Reason for Deferral:** Not essential for the core transaction loop of the marketplace; adds significant complexity for managing talent profiles and relationships beyond basic user accounts.
*   **DF-002: Complex Contracting**
    *   **Description:** Dynamic contract generation, negotiation tools, and advanced legal templating.
    *   **Reason for Deferral:** The MVP focuses on a templated deal memo; complex contracting adds significant legal and technical overhead not critical for initial validation.
*   **DF-003: Dynamic Ad Serving**
    *   **Description:** Features for serving ads dynamically within content.
    *   **Reason for Deferral:** The product explicitly focuses on non-dynamic, in-content sponsorships during pre-production; dynamic ad serving is a different product capability.
*   **DF-004: Privacy/Identity Systems**
    *   **Description:** Advanced privacy controls, identity verification, and data protection features.
    *   **Reason for Deferral:** Basic user authentication is sufficient for MVP; advanced privacy/identity systems add significant compliance and technical complexity.
*   **DF-005: Post-Production Analytics**
    *   **Description:** Tracking and reporting on performance metrics after content publication.
    *   **Reason for Deferral:** The MVP's scope is strictly pre-production financing and deal completion; post-production analytics are a separate phase of the content lifecycle.
*   **DF-006: Rights/Clearances Automation**
    *   **Description:** Automated management of content rights and clearances.
    *   **Reason for Deferral:** Adds significant legal and workflow complexity not critical for the core marketplace transaction.
*   **DF-007: Real Money Movement**
    *   **Description:** Direct processing of payments, deposits, and financial transfers within the platform.
    *   **Reason for Deferral:** The MVP tracks commitments; integrating real money movement adds significant regulatory, security, and technical complexity (e.g., PCI compliance, escrow services).
*   **DF-008: Open Auction Across Multiple Creators with Pacing/Forecast Cards**
    *   **Description:** An auction mechanism where multiple creators' slots are pooled for bidding, with tools for pacing and forecasting.
    *   **Reason for Deferral:** The MVP focuses on private auctions and reservations for individual slots; open auctions add complexity in matching, bidding logic, and UI for aggregated inventory.
*   **DF-009: Recommendation Engine v0.5**
    *   **Description:** Rule-based matching across genre, audience, SKU category, margin threshold, and creator constraints to suggest relevant slots/buyers.
    *   **Reason for Deferral:** While valuable, a recommendation engine is an enhancement to discovery, not essential for the core transaction loop. The MVP focuses on basic filtering.
*   **DF-010: Basic Logistics (Product Sample Shipping & Compliance Checklists)**
    *   **Description:** Features to manage the shipping of product samples and track compliance requirements.
    *   **Reason for Deferral:** These are operational "nice-to-haves" that add workflow and data management complexity beyond the core deal-making process.
*   **DF-011: Affiliate Link Generation & Click Tracking Stub**
    *   **Description:** System for generating unique affiliate links and tracking clicks.
    *   **Reason for Deferral:** This is a post-deal, performance-tracking feature, not part of the pre-production financing and deal commitment MVP.
*   **DF-012: Share Excerpts/Storyboards (Creator)**
    *   **Description:** Creators can share specific excerpts or storyboards related to their slots with potential buyers.
    *   **Reason for Deferral:** While useful for creators, it adds complexity for content hosting and sharing permissions, and is not critical for the core transaction loop in MVP. Buyers can communicate needs via comments.
*   **DF-013: Upload Brand Guidelines (Advertiser)**
    *   **Description:** Advertisers can upload their brand guidelines for creators to review.
    *   **Reason for Deferral:** For MVP, brand guidelines can be communicated via comments in the approval workflow or as part of the bid/reservation terms. Dedicated upload adds content management complexity.
*   **DF-014: Provide Creative Packs/Compliance Notes (Merchant)**
    *   **Description:** Merchants can upload creative assets and compliance notes for their products.
    *   **Reason for Deferral:** Similar to brand guidelines, this can be handled via comments or external links for MVP. Dedicated upload adds content management complexity.

**10. ASSUMPTIONS & DECISIONS**

*   **Business Model:** The platform operates as a marketplace, facilitating connections and transactions between creators and buyers, likely taking a commission on successful deals (though real money movement is deferred).
*   **Access Model:** Individual user accounts for Creators, Advertisers, and Merchants. Operator accounts are internal.
*   **Entity Lifecycle Decisions:**
    *   **Project/Script:** Full CRUD. Deletion cascades to associated slots to maintain data integrity.
    *   **Integration Slot:** Full CRUD. Deletion is restricted if active bids/commitments exist to prevent breaking active deals.
    *   **Bid/Reservation:** Create, View, Edit/Delete only if `status` is 'Pending'. Once 'Accepted' or 'Committed', it becomes immutable for audit.
    *   **Approval:** Create, View only. Decisions are immutable for audit trail.
    *   **Deal Memo:** Create, View only. Immutable for legal/audit trail.
    *   **Financing Commitment:** Create, View only. Immutable for financial record integrity.
    *   **Audit Log:** System-generated, View only for Operators. Immutable.
*   **From User's Product Idea:**
    *   **Product:** A Sponsorship & Commerce Marketplace (SSP/DSP) for pre-production in-content sponsorships.
    *   **Technical Level:** The user mentioned "no/low-code tools" for the prototype, indicating a preference for functional demonstration over complex custom development for the initial version. This PRD abstracts away specific low-code tools but maintains the focus on core functionality.
*   **Key Assumptions Made:**
    *   The "AI assist" for script tagging will be implemented via an external API (e.g., OpenAI) and will not involve building a custom LLM.
    *   "Deal memo (templated PDF)" implies using a standard PDF generation library, not a complex document management system.
    *   "Financing dashboard" will display aggregated commitment data and percentage of budget covered, without complex financial modeling or accounting integrations for MVP.
    *   "Shopify/Amazon compatibility" for bulk SKU upload in MVP means CSV import that can handle data exported from these platforms, not direct API integration.
    *   The "Operator" persona represents internal platform administrators, not external users.
    *   The marketplace will initially focus on a single type of "scripted asset" as defined by the user.

PRD Complete - Ready for development