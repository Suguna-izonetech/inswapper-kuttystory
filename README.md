# 🦄 Personalized AI Children's Storybook Platform

A production-grade prototype for creating heirloom-quality personalized children's picture books. Inspired by the customer journey of **KuttyStory** and the soft editorial luxury aesthetics of **Diffrun**.

---

## 📖 What This Project Does

This platform takes an authoritative storybook PDF (like the included 26-page **"The Girl and the Magical Unicorn"**), extracts and preserves the artwork, and lets a parent customize the story:
1. The parent enters the child's name (e.g., *Mia*).
2. The parent uploads a single authorized photo of the child with legal guardian consent.
3. The AI engine generates personalized illustrations featuring the child's recognizable likeness throughout the narrative beats.
4. The parent previews the generated book in an interactive spread viewer.
5. The system produces a downloadable, print-ready 210 × 210 mm PDF with sharp vector typography composed deterministically with ReportLab.

---

## 🔄 Simple End-to-End Workflow

```mermaid
sequenceDiagram
    autonumber
    actor Parent as Parent / Guardian
    participant UI as Next.js Web App
    participant API as FastAPI Backend
    participant Importer as PyMuPDF Slicer
    participant AI as AI Engine (Gemini + Diffusers)
    participant PDF as ReportLab PDF Engine

    Note over API,Importer: 1. Story Ingestion (Automatic on Startup)
    API->>Importer: Parse "unicorn Story.pdf"
    Importer-->>API: 26 Square Pages sliced to 150 DPI PNGs + Narrative Beats

    Note over Parent,UI: 2. Customer Personalization
    Parent->>UI: Enters child's name (e.g. Mia) & uploads photo
    Parent->>UI: Grants legal guardian consent
    UI->>API: POST /api/v1/personalization (FormData)

    Note over API,AI: 3. Character Consistency AI
    API->>AI: Normalize photo (512x512 face focus)
    API->>AI: Condition prompts with child likeness for representative scenes
    AI-->>API: Generated personalized artwork

    Note over API,PDF: 4. Deterministic Book Composition
    API->>PDF: Compose 210x210 mm PDF with vector story text
    PDF-->>API: Validated preview PDF with preflight check

    Note over Parent,UI: 5. Interactive Preview & Download
    API-->>UI: Real-time progress updates & completed preview
    Parent->>UI: Flip through interactive book viewer
    Parent->>UI: Download personalized preview PDF
```

---

## 🌟 Key Features

### 1. Customer Journey
- **Editorial Luxury Homepage**: Soft warm ivory (`#FAF7F2`), dusty rose (`#C98A84`), and deep plum typography inspired by high-end story ateliers.
- **Guided Personalization Wizard**: Drag-and-drop child photo upload, parent/guardian consent confirmation, and instant validation.
- **Interactive Book Viewer**: Full-screen spread navigation with page-by-page progress, prompt inspection, and single-page regeneration if a page needs a redo.
- **Secure PDF Download**: Immediate download of the personalized PDF with preflight-validated resolution.

### 2. Admin Atelier Studio
- **Story Template Library**: Manage story title, price, age category, and published/draft status.
- **Page-by-Page Editor**: View original page thumbnails, edit story narrative text, tweak scene descriptions, and customize AI prompt templates.
- **AI Provider Switcher**: Toggle between Hugging Face Diffusers (hosted serverless), local GPU diffusers, or deterministic mock generation with budget limits.
- **Generation Monitoring**: Real-time job status tracking, completed page counters, and retry controls for failed pages.

---

## 🚀 How to Run the Application

Both backend and frontend can be started with simple commands:

### 1. Start the FastAPI Backend
```powershell
cd backend
pip install -r requirements.txt
alembic upgrade head
python seed.py           # Seeds admin accounts and story catalog
# Options:
# python seed.py --admin    (Admin accounts only)
# python seed.py --stories  (Story catalog only)
# python seed.py --list     (List existing admins)
uvicorn app.main:app --reload
```
- API Health Check: `http://127.0.0.1:8000/api/health`
- Interactive API Docs (Swagger): `http://127.0.0.1:8000/docs`
- Configuration: Controlled via `backend/.env` (and template `backend/.env.example`)

#### 🔐 Default Admin Logins
| Email | Password | Name | Role |
| :--- | :--- | :--- | :--- |
| **`admin@kuttystory.com`** | `Admin@123` | Admin Master | admin |
| **`suguna.izonetech@gmail.com`** | `Suguna@123` | Suguna | admin |

*To seed a custom admin:*
```powershell
python seed.py --email custom@admin.com --password YourPassword123 --name "Custom Admin"
```
*To list all existing admin users in database:*
```powershell
python seed.py --list
```

#### 🪣 MinIO Object Storage Setup
The platform uses MinIO object storage for all assets instead of local folders:
```powershell
# Start local MinIO server (if running locally):
C:\minio\minio.exe server C:\minio\data --console-address :9001

# Sync or verify all assets in MinIO:
python sync_to_minio.py
python sync_to_minio.py --list
```
Configured in `backend/.env`:
- `STORAGE_BACKEND=minio`
- `MINIO_ENDPOINT=127.0.0.1:9000`
- `MINIO_ACCESS_KEY=minioadmin`
- `MINIO_SECRET_KEY=minioadmin`
- `MINIO_BUCKET=kuttystory`
- `MINIO_SECURE=false`


### 2. Start the Frontend
```powershell
cd frontend
npm run dev
```
- Runs automatically on port **`5173`**
- Web Application: `http://localhost:5173`
- Admin Login: `http://localhost:5173/admin_login`
- Configuration: Controlled via `frontend/.env` (and template `frontend/.env.example`)

### 3. Run the Automated Backend Test Suite
```powershell
cd backend
python test_insightface_swap.py
```
*Validates InsightFace Buffalo_L detection, INSwapper-128 ONNX neural face swap, anchor matching, error handling, async execution, and PDF assembly.*

#### 🎭 InsightFace INSwapper-128 Setup (CPU / GPU)
1. **Model Weights Location**:
   The model is located at `backend/models/inswapper_128.onnx`.
   Download from verified sources (e.g. Hugging Face ModelsLab or DeepInsight release):
   ```powershell
   # Using Python huggingface_hub
   python -c "from huggingface_hub import hf_hub_download; hf_hub_download(repo_id='ModelsLab/inswapper', filename='inswapper_128.onnx', local_dir='models')"
   ```
   *License Notice: InsightFace models are intended for academic research and authorized non-commercial evaluation.*

2. **CPU Execution (Default)**:
   - Configured in `.env`:
     `FACE_SWAP_PROVIDER=insightface`
     `INSWAPPER_MODEL_PATH=models/inswapper_128.onnx`
     `FACE_SWAP_EXECUTION_PROVIDER=CPUExecutionProvider`
     `FACE_SWAP_DET_SIZE=640`
     `FACE_SWAP_ENHANCE=true`
   - Installed package: `onnxruntime`

3. **High-Definition Image Detail Enhancement & Storage Separation**:
   - **Original Image Preservation**: The raw AI-generated illustrations and base plates are automatically saved in `storage/raw_generated/` (and MinIO `raw_generated` category) **before** face swapping or enhancement.
   - **Strict Asset Separation**: Original and processed images are maintained in distinct directories (`raw_generated/` vs `generated_assets/`) ensuring originals are never overwritten and can be directly compared side-by-side.
   - **Sharpness & Realism Pipeline**:
     - *LAB Color Space CLAHE*: Micro-contrast on the Lightness channel brings out 3D facial depth without shifting artistic palette or lighting.
     - *Multi-Scale Unsharp Masking*: Fine-frequency Gaussian filtering enhances eyes, eyelashes, lips, and facial hair contours.
     - *Edge-Preserving Bilateral Smoothing*: Gently smooths skin transitions while locking sharp facial edges.
     - *Lanczos-4 Reconstruction*: Crisp interpolation preserving high-resolution canvas detail (1241x1241 standard).

4. **Running the Automated Test Suite**:
   ```powershell
   cd backend
   .\venv\Scripts\python.exe test_insightface_swap.py
   ```
   Executes 15 comprehensive tests validating model loading, formats, error handling, anchor matching, asynchronous non-blocking inference, raw image storage isolation, detail enhancement, and ReportLab PDF composition.

5. **Optional NVIDIA GPU Acceleration**:
   - If an NVIDIA CUDA GPU is available, install `onnxruntime-gpu` (uninstall standard `onnxruntime` first to avoid library collision):
     ```powershell
     pip uninstall -y onnxruntime
     pip install onnxruntime-gpu
     ```
   - In `.env`, set:
     `FACE_SWAP_EXECUTION_PROVIDER=CUDAExecutionProvider`

---

## 🌐 Application URLs

| Route | Description |
| :--- | :--- |
| **`http://localhost:5173`** | Customer Homepage (Story showcase, atelier process, trust charter) |
| **`http://localhost:5173/personalize/unicorn-story`** | Guided Personalization Wizard & Interactive Book Viewer |
| **`http://localhost:5173/admin_login`** | Atelier Admin Authentication (Login, Register, Password Reset) |
| **`http://localhost:5173/admin`** | Admin Studio (Overview KPIs, Page Editor, AI Settings, Job Monitor) |
| **`http://localhost:8000/docs`** | FastAPI Swagger Interactive Documentation |

---

## 📁 Directory Structure

```text
Baby story/
├── README.md                      # This simple workflow guide
├── sample-assets/
│   └── unicorn Story.pdf          # Original 26-page authoritative source PDF (Untouched)
├── backend/
│   ├── alembic/                   # Alembic database schema migrations
│   ├── requirements.txt           # Python dependencies
│   ├── storage/                   # Private secured file storage
│   │   ├── original_pdfs/         # Private copy of original PDF
│   │   ├── source_pages/          # Sliced 150 DPI PNG page illustrations (Pages 1-26)
│   │   ├── child_photos/          # Protected, normalized parent-uploaded photos
│   │   ├── raw_generated/         # Pristine original AI illustrations (pre-swap, pre-enhancement)
│   │   ├── generated_assets/      # Versioned AI-generated & face-swapped illustrations
│   │   ├── previews/              # ReportLab composed preview PDFs
│   │   └── final_books/           # Print-ready final PDFs
│   └── app/
│       ├── main.py                # FastAPI app with auto-import lifespan
│       ├── config.py              # Environment settings & budgets
│       ├── database.py            # SQLAlchemy setup
│       ├── models/                # Database models (User, Story, Page, Job, Asset, Book)
│       ├── schemas/               # Pydantic request/response schemas
│       ├── routers/               # API endpoints (stories, personalization, books, admin, ai)
│       └── services/
│           ├── storage.py         # File storage adapter
│           ├── pdf_importer.py    # PyMuPDF PDF parser & page slicer
│           ├── pdf_composer.py    # ReportLab deterministic 210x210 mm PDF composer
│           ├── job_runner.py      # Background generation & single-page retry worker
│           └── ai/
│               ├── gemini_provider.py      # Google Gemini for scene planning
│               ├── diffusers_provider.py   # Hugging Face Diffusers with hardware checks
│               ├── consistency_engine.py   # Face normalization engine
│               └── mock_provider.py        # Deterministic simulation for offline tests
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── page.tsx                    # Customer Homepage
    │   │   ├── layout.tsx                  # Luxury editorial header & footer
    │   │   ├── globals.css                 # Soft editorial luxury design tokens
    │   │   ├── personalize/[slug]/page.tsx # Guided Wizard & Book Viewer
    │   │   └── admin/page.tsx              # Admin Studio & Story Page Editor
    │   └── lib/
    │       └── api.ts                      # Typed TypeScript API client
    └── next.config.ts                      # Reverse proxy rewrites to FastAPI (:8000)
```

---

## 🔒 Child Privacy & Data Safety Charter

1. **Parental Consent Mandatory**: No photograph is processed without explicit legal guardian consent.
2. **Private File Storage**: Child photos and generated books are stored in isolated private directories, never exposed to public buckets.
3. **Deterministic Separation**: Story text is typeset via ReportLab's vector engine, preventing AI models from hallucinating or distorting words.
4. **No Training on Children**: Photos are never used to train public machine learning models.
