#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════
#  GRC Platform — Ubuntu 22.04/24.04 Deployment Script
#  Run as a non-root user with sudo privileges:
#    chmod +x scripts/deploy.sh && ./scripts/deploy.sh
# ═══════════════════════════════════════════════════════════════════
set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; RESET='\033[0m'

info()    { echo -e "${CYAN}[INFO]${RESET}  $*"; }
success() { echo -e "${GREEN}[OK]${RESET}    $*"; }
warn()    { echo -e "${YELLOW}[WARN]${RESET}  $*"; }
error()   { echo -e "${RED}[ERROR]${RESET} $*"; exit 1; }
banner()  { echo -e "\n${BOLD}${CYAN}══════════════════════════════════════${RESET}"; echo -e "${BOLD}${CYAN}  $*${RESET}"; echo -e "${BOLD}${CYAN}══════════════════════════════════════${RESET}\n"; }

# ─── 1. System Update ────────────────────────────────────────────
banner "Step 1 — System Update"
sudo apt-get update -y && sudo apt-get upgrade -y
sudo apt-get install -y curl wget git gnupg2 ca-certificates \
    apt-transport-https software-properties-common lsb-release \
    python3 python3-pip ufw
success "System updated"

# ─── 2. Install Docker ───────────────────────────────────────────
banner "Step 2 — Install Docker"
if command -v docker &>/dev/null; then
    warn "Docker already installed: $(docker --version)"
else
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
        | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] \
        https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" \
        | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt-get update -y
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io
    sudo systemctl enable --now docker
    sudo usermod -aG docker "$USER"
    success "Docker installed"
fi

# ─── 3. Install Docker Compose ───────────────────────────────────
banner "Step 3 — Install Docker Compose"
if command -v docker-compose &>/dev/null; then
    warn "Docker Compose already installed: $(docker-compose --version)"
else
    COMPOSE_VERSION="v2.29.1"
    sudo curl -SL "https://github.com/docker/compose/releases/download/${COMPOSE_VERSION}/docker-compose-linux-$(uname -m)" \
        -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    success "Docker Compose installed"
fi

# ─── 4. Firewall Setup ───────────────────────────────────────────
banner "Step 4 — Configure UFW Firewall"
sudo ufw --force enable
sudo ufw allow ssh
sudo ufw allow 80/tcp      # Frontend (HTTP)
sudo ufw allow 443/tcp     # HTTPS (future)
sudo ufw allow 8000/tcp    # Backend API (optional, restrict in production)
sudo ufw allow 5050/tcp    # pgAdmin (optional)
sudo ufw reload
success "Firewall configured"

# ─── 5. Generate .env ────────────────────────────────────────────
banner "Step 5 — Generate Environment File"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

if [ -f "$PROJECT_DIR/.env" ]; then
    warn ".env already exists — skipping generation"
else
    SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_hex(32))")
    DB_PASSWORD=$(python3 -c "import secrets; print(secrets.token_urlsafe(20))")

    cat > "$PROJECT_DIR/.env" <<EOF
POSTGRES_DB=grcdb
POSTGRES_USER=grcuser
POSTGRES_PASSWORD=${DB_PASSWORD}
SECRET_KEY=${SECRET_KEY}
DEBUG=false
PGADMIN_EMAIL=admin@grc.local
PGADMIN_PASSWORD=GRCAdmin@2025!
EOF
    success ".env file generated with secure secrets"
fi

# ─── 6. Build & Start Containers ─────────────────────────────────
banner "Step 6 — Build & Start Docker Containers"
cd "$PROJECT_DIR"

# Use 'docker compose' (v2 plugin) or fallback to docker-compose
DC="docker compose"
command -v docker-compose &>/dev/null && DC="docker-compose"

$DC down --remove-orphans 2>/dev/null || true
$DC build --no-cache
$DC up -d

success "Containers started"

# ─── 7. Wait for Backend Health ──────────────────────────────────
banner "Step 7 — Wait for Services to be Healthy"
info "Waiting for backend API (up to 90 seconds)…"
RETRIES=18
until curl -sf http://localhost:8000/health >/dev/null 2>&1 || [ $RETRIES -eq 0 ]; do
    sleep 5
    RETRIES=$((RETRIES - 1))
    echo -n "."
done
echo ""

if [ $RETRIES -eq 0 ]; then
    warn "Backend health check timed out. Check logs: docker compose logs backend"
else
    success "Backend is healthy"
fi

# ─── 8. Seed Database ────────────────────────────────────────────
banner "Step 8 — Seed Sample Data"
pip3 install httpx --quiet 2>/dev/null || true

info "Running seed script…"
python3 "$PROJECT_DIR/scripts/seed_data.py" && success "Database seeded" || warn "Seeding failed (may already be seeded)"

# ─── 9. Show Summary ─────────────────────────────────────────────
banner "✅ Deployment Complete!"
SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}')

echo -e "${BOLD}Access URLs:${RESET}"
echo -e "  🌐 Frontend:   ${GREEN}http://${SERVER_IP}${RESET}"
echo -e "  🔌 API Docs:   ${GREEN}http://${SERVER_IP}:8000/docs${RESET}"
echo -e "  📊 pgAdmin:    ${GREEN}http://${SERVER_IP}:5050${RESET}  (start with: docker compose --profile tools up -d)"
echo ""
echo -e "${BOLD}Default Credentials:${RESET}"
echo -e "  Username: ${CYAN}admin${RESET}   Password: ${CYAN}admin123${RESET}"
echo ""
echo -e "${BOLD}Useful Commands:${RESET}"
echo -e "  View logs:    ${CYAN}docker compose logs -f${RESET}"
echo -e "  Stop:         ${CYAN}docker compose down${RESET}"
echo -e "  Restart:      ${CYAN}docker compose restart${RESET}"
echo -e "  DB shell:     ${CYAN}docker compose exec db psql -U grcuser -d grcdb${RESET}"
