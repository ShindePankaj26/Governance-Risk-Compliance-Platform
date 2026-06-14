 🛡 Integrated GRC Platform

> **Governance, Risk & Compliance — Enterprise Suite v1.0**
> Full-stack platform covering Risk Register, Vendor Assessment, Compliance Tracker, Audit Management, Policy Management, and AI Governance.

---

 📐 Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                      GRC Platform                       │
├──────────────┬──────────────┬──────────────┬────────────┤
│   Frontend   │   Backend    │  Database    │   Cache    │
│  React/Vite  │  FastAPI     │  PostgreSQL  │   Redis    │
│  TypeScript  │  Python 3.12 │  16-Alpine   │  7-Alpine  │
│  Tailwind    │  SQLAlchemy  │              │            │
│  nginx:80    │  :8000       │  :5432       │  :6379     │
└──────────────┴──────────────┴──────────────┴────────────┘
        All containers managed by Docker Compose
```

---

🗂 Project Structure

```
Governance-Risk-Comliance-platform/
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI app entry point
│   │   ├── core/
│   │   │   ├── config.py            # Settings (env vars)
│   │   │   └── security.py          # JWT auth, password hashing
│   │   ├── db/
│   │   │   └── database.py          # Async SQLAlchemy engine
│   │   ├── models/
│   │   │   └── models.py            # All ORM models
│   │   ├── schemas/
│   │   │   └── schemas.py           # Pydantic request/response schemas
│   │   └── api/routes/
│   │       ├── auth.py              # Login / register
│   │       ├── dashboard.py         # Aggregated metrics
│   │       ├── risks.py             # Risk Register CRUD
│   │       ├── vendors.py           # Vendor Assessment CRUD
│   │       ├── compliance.py        # Compliance frameworks & controls
│   │       ├── audits.py            # Audit management & findings
│   │       ├── policies.py          # Policy management
│   │       └── aigov.py             # AI system governance
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx                  # Router setup
│   │   ├── main.tsx                 # React entry point
│   │   ├── index.css                # Tailwind + custom theme
│   │   ├── hooks/
│   │   │   └── useAuth.ts           # Zustand auth store
│   │   ├── utils/
│   │   │   └── api.ts               # Axios API client + all endpoints
│   │   ├── components/shared/
│   │   │   └── Layout.tsx           # Sidebar navigation shell
│   │   └── pages/
│   │       ├── LoginPage.tsx
│   │       ├── DashboardPage.tsx
│   │       ├── RisksPage.tsx
│   │       ├── VendorsPage.tsx
│   │       ├── CompliancePage.tsx
│   │       ├── AuditsPage.tsx
│   │       ├── PoliciesPage.tsx
│   │       └── AIGovPage.tsx
│   ├── nginx.conf                   # SPA + API proxy config
│   ├── Dockerfile                   # Multi-stage build
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── scripts/
│   ├── deploy.sh                    # One-click Ubuntu deployment
│   ├── seed_data.py                 # Sample data seeder
│   └── init.sql                     # DB init (extensions)
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

🚀 Ubuntu Deployment (Recommended)

 Option A — One-Command Deploy

```bash
# 1. Clone the project
git clone https://github.com/ShindePankaj26/Governance-Risk-Comliance-platform.git
cd Governance-Risk-Comliance-platform

# 2. Run the automated deployment script
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

The script automatically:
- Updates Ubuntu packages
- Installs Docker & Docker Compose
- Configures UFW firewall (ports 80, 443, 8000)
- Generates a secure `.env` with random secrets
- Builds and starts all containers
- Seeds sample data
- Prints the access URLs

---

 Option B — Manual Step-by-Step

 Step 1 — Install Ubuntu Dependencies

```bash
sudo apt-get update && sudo apt-get upgrade -y
sudo apt-get install -y curl git python3 python3-pip ufw
```

 Step 2 — Install Docker

```bash
# Add Docker's official GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
    | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add Docker repository
echo "deb [arch=$(dpkg --print-architecture) \
    signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] \
    https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" \
    | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt-get update && sudo apt-get install -y docker-ce docker-ce-cli containerd.io
sudo systemctl enable --now docker
sudo usermod -aG docker $USER   # log out and back in after this
```

 Step 3 — Install Docker Compose

```bash
sudo curl -SL \
    "https://github.com/docker/compose/releases/download/v2.29.1/docker-compose-linux-$(uname -m)" \
    -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
docker-compose --version  # verify
```

Step 4 — Configure Firewall

```bash
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80/tcp      # Frontend
sudo ufw allow 8000/tcp    # Backend API
sudo ufw allow 5050/tcp    # pgAdmin (optional)
sudo ufw reload
```

Step 5 — Set Up Environment

```bash
cd grc-platform
cp .env.example .env
nano .env    # Edit POSTGRES_PASSWORD and SECRET_KEY
```

Generate a secure SECRET_KEY:
```bash
python3 -c "import secrets; print(secrets.token_hex(32))"
```

 Step 6 — Build and Start

```bash
docker compose build
docker compose up -d
docker compose ps      # verify all containers are "healthy"
```

 Step 7 — Seed Sample Data

```bash
# Wait ~30 seconds for backend to start, then:
pip3 install httpx
python3 scripts/seed_data.py
```

---

 🌐 Access the Platform

| Service     | URL                               | Credentials           |
|-------------|-----------------------------------|-----------------------|
| Frontend    | http://YOUR_SERVER_IP             | admin / admin123      |
| API Docs    | http://YOUR_SERVER_IP:8000/docs   | (interactive Swagger) |
| ReDoc       | http://YOUR_SERVER_IP:8000/redoc  |                       |
| pgAdmin     | http://YOUR_SERVER_IP:5050        | admin@grc.local / ... |

Start pgAdmin with:
```bash
docker compose --profile tools up -d
```

---

 🔧 Local Development (without Docker)

 Backend

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set environment variable
export DATABASE_URL="postgresql+asyncpg://grcuser:grcpassword@localhost:5432/grcdb"
export SECRET_KEY="dev-secret-key-change-in-prod"

# Start PostgreSQL separately (or use Docker just for DB)
docker run -d --name grc_db -e POSTGRES_DB=grcdb \
    -e POSTGRES_USER=grcuser -e POSTGRES_PASSWORD=grcpassword \
    -p 5432:5432 postgres:16-alpine

# Run backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

 Frontend

```bash
cd frontend
npm install
npm run dev     # starts on http://localhost:3000
```

---

 📡 API Reference

 Authentication
 
| Method | Endpoint               | Description            |
|--------|------------------------|------------------------|
| POST   | /api/v1/auth/register  | Register new user      |
| POST   | /api/v1/auth/login     | Login (returns JWT)    |

 Risk Register
 
| Method | Endpoint              | Description            |
|--------|-----------------------|------------------------|
| GET    | /api/v1/risks         | List all risks         |
| POST   | /api/v1/risks         | Create risk            |
| GET    | /api/v1/risks/{id}    | Get risk by ID         |
| PUT    | /api/v1/risks/{id}    | Update risk            |
| DELETE | /api/v1/risks/{id}    | Delete risk            |
| GET    | /api/v1/risks/stats/heatmap | Risk heatmap data |

 Vendors, Compliance, Audits, Policies, AI Governance
All follow the same RESTful pattern — see `/docs` for full schema.

---

 🐳 Docker Operations

```bash
# View all container logs
docker compose logs -f

# View specific service logs
docker compose logs -f backend
docker compose logs -f frontend

# Restart a service
docker compose restart backend

# Stop everything
docker compose down

# Stop and remove volumes (⚠️ deletes all data)
docker compose down -v

# Connect to PostgreSQL
docker compose exec db psql -U grcuser -d grcdb

# Connect to Redis
docker compose exec redis redis-cli

# Shell into backend
docker compose exec backend bash

# Rebuild and restart
docker compose build backend && docker compose up -d backend
```

---

 🔐 User Roles

| Role     | Access Level                                        |
|----------|-----------------------------------------------------|
| admin    | Full access — all modules, user management          |
| cro      | Chief Risk Officer — risks, vendors, dashboard      |
| ciso     | Security — risks, audits, policies                  |
| dpo      | Data Protection — compliance, GDPR, policies        |
| auditor  | Read/write on audits, read on risks & compliance    |
| viewer   | Read-only on all modules                            |

---

 🛠 Technology Stack

| Layer       | Technology              | Version  |
|-------------|-------------------------|----------|
| Frontend    | React + TypeScript      | 18 / 5   |
| UI          | Tailwind CSS            | 3.x      |
| HTTP Client | Axios + React Query     | latest   |
| State       | Zustand                 | 5.x      |
| Backend     | FastAPI (Python)        | 0.115    |
| ORM         | SQLAlchemy (async)      | 2.x      |
| Database    | PostgreSQL              | 16       |
| Cache       | Redis                   | 7        |
| Auth        | JWT (python-jose)       | 3.x      |
| Container   | Docker + Compose        | latest   |
| Web Server  | nginx                   | alpine   |

---

 📈 Roadmap

- [ ] Power BI Embedded dashboard integration
- [ ] Email notifications (SendGrid/SMTP)
- [ ] LDAP / Active Directory SSO
- [ ] Automated compliance evidence collection
- [ ] REST webhooks for SIEM integration
- [ ] Mobile responsive improvements
- [ ] PDF report generation
- [ ] Two-factor authentication (TOTP)
