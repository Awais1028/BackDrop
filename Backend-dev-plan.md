# Backend Development Plan - BackDrop

## 1️⃣ Executive Summary
This document outlines the backend development strategy for **BackDrop**, a marketplace connecting content creators with advertisers and merchants.

We will build a **FastAPI (Python 3.13)** application backed by **MongoDB Atlas**. The system uses a **single-branch Git workflow (`main`)** and strictly avoids Docker or complex orchestration. Development is divided into **dynamic sprints**, each focused on delivering end-to-end functionality visible in the frontend.

**Key Constraints:**
*   **Runtime:** Python 3.13 + FastAPI (Async).
*   **Database:** MongoDB Atlas (accessed via `motor` + `pydantic` v2).
*   **Infrastructure:** No Docker, local execution, standard `.env` configuration.
*   **Quality:** Manual verification test steps required for **every** task.
*   **Versioning:** API prefixed with `/api/v1`.

---

## 2️⃣ In-Scope & Success Criteria

### In-Scope Features
*   **Authentication:** Email/Password (Argon2), JWT sessions, Role-based access (Creator, Advertiser, Merchant, Operator).
*   **Creator Workflow:** Script upload (PDF), Integration Slot tagging, Pricing/Constraint setting.
*   **Merchant Workflow:** SKU management (Single + Bulk CSV upload).
*   **Marketplace:** Slot discovery (Filtering), Bidding/Reservation management.
*   **Deal Flow:** Negotiation (Comments), Dual-side Approvals, Deal Memo generation (PDF Stub), Spend Commitment.
*   **Dashboards:** Financing views for Creators, System monitoring for Operators.

### Success Criteria
*   Backend serves all data required by the frontend logic defined in `dummyData.ts` and `types/index.ts`.
*   All frontend features function end-to-end with real persistent data.
*   `healthz` endpoint confirms database connectivity.
*   Code is pushed to `main` only after manual verification of each sprint.

---

## 3️⃣ API Design

**Global Standards:**
*   **Base URL:** `/api/v1`
*   **Auth Header:** `Authorization: Bearer <token>`
*   **Content-Type:** `application/json`
*   **Errors:** HTTP 4xx/5xx with body `{"detail": "Error message"}`
*   **Pagination:** None (List all) unless strictly required by UI controls (not present in current UI).

### Core Endpoints

| Method | Path | Purpose | Request/Response Shape |
| :--- | :--- | :--- | :--- |
| **GET** | `/healthz` | System health | `{} -> { "status": "ok", "db": "connected" }` |
| **POST** | `/auth/signup` | Register user | `{ email, password, role, name } -> { token, user }` |
| **POST** | `/auth/login` | Login | `{ email, password } -> { token, user }` |
| **GET** | `/projects` | List Creator Scripts | `Header -> [ { id, title, docLink... } ]` |
| **POST** | `/projects` | Upload Script | `Multipart Form (file, metadata) -> ProjectObj` |
| **GET** | `/slots` | Discovery/Inventory | `?genre=X&type=Y -> [ { id, sceneRef, pricingFloor... } ]` |
| **POST** | `/slots/{id}/bids` | Place Bid | `{ amount, objective... } -> BidObj` |
| **POST** | `/bids/{id}/comments` | Add Comment | `{ text } -> CommentObj` |
| **POST** | `/skus/bulk` | Bulk Import | `Multipart Form (csv) -> { count: 5 }` |

---

## 4️⃣ Data Model (MongoDB Atlas)

All models use **Pydantic V2**. `_id` is mapped to `id` (string) for frontend compatibility.

### Collections

**1. users**
*   `email` (str, unique)
*   `password_hash` (str)
*   `role` (enum: Creator, Advertiser, Merchant, Operator)
*   `merchant_profile` (embedded, optional: `{ minIntegrationFee, eligibilityRules }`)

**2. projects**
*   `creator_id` (str, ref: users)
*   `title` (str)
*   `doc_link` (str, url)
*   `budget_target` (float)
*   `production_window` (str)
*   `demographics` (embedded: `{ ageStart, ageEnd, gender }`)

**3. slots**
*   `project_id` (str, ref: projects)
*   `creator_id` (str, ref: users) - for quick queries
*   `scene_ref` (str)
*   `pricing_floor` (float)
*   `modality` (enum: Private Auction, PG/Reservation)
*   `status` (enum: Available, Locked, Completed)
*   `visibility` (enum: Public, Private)

**4. skus**
*   `merchant_id` (str, ref: users)
*   `title` (str)
*   `price` (float)
*   `margin` (float)
*   `tags` (list[str])

**5. bids**
*   `slot_id` (str, ref: slots)
*   `counterparty_id` (str, ref: users)
*   `status` (enum: Pending, AwaitingFinalApproval, Accepted, Committed, Declined)
*   `amount_terms` (str)
*   `comments` (list[embedded]: `{ author_id, text, timestamp }`)
*   `approvals` (embedded: `{ creator: bool, buyer: bool }`)

**6. commitments**
*   `bid_id` (str)
*   `slot_id` (str)
*   `amount` (float)
*   `status` (str)

---

## 5️⃣ Frontend Audit & Feature Map

| Page/Component | Data Needed | Backend Requirement | Auth |
| :--- | :--- | :--- | :--- |
| **AuthPage** | Login/Signup Form | `POST /auth/login`, `POST /auth/signup` | Public |
| **MyScriptsPage** | List of Scripts | `GET /projects` (filtered by current user) | Creator |
| **ScriptDetailPage** | Script details + Slots | `GET /projects/{id}`, `GET /slots?projectId={id}` | Creator |
| **DiscoverOpportunities** | All public Slots | `GET /slots` (with filters) | Buyer |
| **MyBidsReservations** | Bids + Status | `GET /bids` (filtered by current user) | Buyer |
| **MyProductsPage** | SKUs List | `GET /skus` | Merchant |
| **DealApprovalPage** | Bid details + Comments | `GET /bids/{id}`, `POST /bids/{id}/approve` | Auth |
| **FinancingDashboard** | Aggregated $ stats | `GET /commitments/stats` | Creator/Op |

---

## 6️⃣ Configuration & ENV Vars

*   `APP_ENV`: `development`
*   `PORT`: `8000`
*   `MONGODB_URI`: `mongodb+srv://...` (Atlas connection)
*   `JWT_SECRET`: (Generated secure string)
*   `JWT_EXPIRES_IN`: `86400` (1 day)
*   `CORS_ORIGINS`: `http://localhost:5173` (Vite default)
*   `UPLOAD_DIR`: `static/uploads` (For script/CSV storage simulation)

---

## 7️⃣ Testing Strategy (Manual via Frontend)

Since we are "Handover Agent" providing plans for VS Code implementation:
1.  **Validation:** Every task requires a manual UI check.
2.  **Process:**
    *   Implement Backend Endpoint.
    *   Update Frontend `api.ts` or fetch calls to point to local backend.
    *   **Execute Test Step:** Perform action in UI (e.g., Click "Login").
    *   **Verify:** Check UI state update + Network tab response + DB entry (if applicable).
    *   **Push:** Only push to `main` if test passes.

---

## 🔟 Dynamic Sprint Plan (S0 → S6)

## 🧱 S0 – Environment Setup & Foundation

**Objectives:**
*   Initialize FastAPI project structure.
*   Connect to MongoDB Atlas.
*   Configure CORS and Static Files (for simple uploads).
*   Create Git repo and push initial skeleton.

**Tasks:**
1.  **Project Init:** Create `requirements.txt` (fastapi, uvicorn, motor, pydantic, python-jose, passlib, python-multipart) and install.
    *   *Test:* `pip list` shows packages.
2.  **Database Connection:** Implement `database.py` with `motor`.
    *   *Test:* Run a script to ping DB.
3.  **App Skeleton:** Create `main.py` with `CORSMiddleware` and `/healthz`.
    *   *Manual Test Step:* Run `uvicorn main:app`, go to `http://localhost:8000/healthz`.
    *   *User Test Prompt:* "Check if accessing /healthz returns status: ok."
4.  **Git Setup:** Initialize repo, add `.gitignore`, push `main`.

**Definition of Done:**
*   Backend running locally on port 8000.
*   Connected to cloud DB.
*   `/healthz` returns 200.

---

## 🧩 S1 – Authentication (The Gatekeeper)

**Objectives:**
*   Secure user management.
*   Support all 4 roles.

**Tasks:**
1.  **User Model & Repo:** Create `User` Pydantic model and DB helper functions (create, get_by_email).
2.  **Signup Endpoint:** `POST /auth/signup`. Hashes password.
    *   *Manual Test Step:* Use Postman/Curl to create user, check MongoDB Atlas collection.
    *   *User Test Prompt:* "Create a user via API tool and confirm entry in Atlas."
3.  **Login Endpoint:** `POST /auth/login`. Returns JWT.
    *   *Manual Test Step:* Login with previous user, decode returned JWT to check claims.
    *   *User Test Prompt:* "Login and verify you get a token back."
4.  **Frontend Integration:** Replace dummy auth in `AuthContext.tsx` with real API calls.
    *   *Manual Test Step:* Open App -> Sign Up -> Log Out -> Log In.
    *   *User Test Prompt:* "Perform a full signup/login cycle in the browser."

**Definition of Done:**
*   Users can register and login via the UI.
*   Token stored in frontend (localStorage/cookie) is valid.

---

## 🧩 S2 – Creator Core (Scripts & Slots)

**Objectives:**
*   Allow creators to upload scripts and define inventory.

**Tasks:**
1.  **Script Management API:** `CRUD` for `/projects`.
    *   *Manual Test Step:* Go to "My Scripts" -> Upload New -> Verify list updates.
    *   *User Test Prompt:* "Upload a dummy PDF script and verify it appears in the list."
2.  **Slot Management API:** `CRUD` for `/slots`.
    *   *Manual Test Step:* Open Script Detail -> "Tag New Slot" -> Save -> Verify slot appears.
    *   *User Test Prompt:* "Create an integration slot and ensure it saves."
3.  **Frontend Hookup:** Connect `MyScriptsPage` and `ScriptDetailPage` to API.

**Definition of Done:**
*   Creator can populate the marketplace with inventory.

---

## 🧩 S3 – Merchant Core (Products)

**Objectives:**
*   Enable merchants to add products for matching.

**Tasks:**
1.  **SKU API:** `CRUD` for `/skus`.
    *   *Manual Test Step:* "My Products" -> Add Product -> Save.
2.  **Bulk Upload API:** `POST /skus/bulk` (Parses CSV).
    *   *Manual Test Step:* Upload a sample CSV (headers: title, price, margin).
    *   *User Test Prompt:* "Upload a CSV of products and verify they populate the table."

**Definition of Done:**
*   Merchants can manage their catalog.

---

## 🧩 S4 – Marketplace Discovery & Bidding

**Objectives:**
*   Connect Buyers to Inventory.

**Tasks:**
1.  **Discovery API:** `GET /slots` with query params (genre, type).
    *   *Manual Test Step:* "Discover Opportunities" -> Filter by "Comedy" -> Verify results.
2.  **Bidding API:** `POST /slots/{id}/bid`. Creates `BidReservation` doc.
    *   *Manual Test Step:* Click "Place Bid" on a slot -> Submit -> Verify success toast.
    *   *User Test Prompt:* "Place a bid on a slot and check that the modal closes with success."
3.  **My Bids API:** `GET /bids`.
    *   *Manual Test Step:* Go to "My Bids" -> Verify the just-placed bid is listed.

**Definition of Done:**
*   Full transaction initiation loop (Find -> Bid).

---

## 🧩 S5 – Deal Flow & Approvals

**Objectives:**
*   Complex state management for closing deals.

**Tasks:**
1.  **Commenting API:** `POST /bids/{id}/comments`.
    *   *Manual Test Step:* Open Bid Detail -> Add Comment -> Verify it appears in chat list.
2.  **Approval Logic:** `POST /bids/{id}/approve` (updates flags).
    *   *Manual Test Step:* Login as Creator -> Approve Bid -> Login as Merchant -> Verify status update.
    *   *User Test Prompt:* "Approve a bid from the Creator side and verify status changes."
3.  **Deal Memo/Commitment:** `POST /bids/{id}/commit`. Generates `FinancingCommitment`.
    *   *Manual Test Step:* Click "Commit Spend" -> Verify status becomes "Committed".

**Definition of Done:**
*   Deals can move from Pending to Committed.

---

## 🧩 S6 – Dashboards & Financing

**Objectives:**
*   Visibility into money and metrics.

**Tasks:**
1.  **Financing Stats:** Endpoint to aggregate `committed_amount` by User/Project.
    *   *Manual Test Step:* Open "Financing Dashboard" -> Verify numbers match committed deals.
    *   *User Test Prompt:* "Check that the financing dashboard reflects the sum of committed deals."
2.  **Operator View:** Endpoint exposing all platform activity (admin only).
    *   *Manual Test Step:* Login as Operator -> View "Workflow Monitoring".

**Definition of Done:**
*   Accurate reporting of platform activity.