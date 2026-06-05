#!/usr/bin/env python3
"""
GRC Platform — Seed Script
Run after backend is up: python3 scripts/seed_data.py
"""
import asyncio
import httpx

BASE_URL = "http://localhost:8000/api/v1"
TOKEN = None


async def get_token(client: httpx.AsyncClient):
    global TOKEN
    r = await client.post(
        f"{BASE_URL}/auth/login",
        data={"username": "admin", "password": "admin123"},
    )
    TOKEN = r.json()["access_token"]
    print(f"✅ Logged in as admin")


def headers():
    return {"Authorization": f"Bearer {TOKEN}"}


async def seed_users(client: httpx.AsyncClient):
    users = [
        {"username": "admin",     "email": "admin@example.com",    "full_name": "Admin User",        "password": "admin123",   "role": "admin"},
        {"username": "arjun.cro", "email": "arjun@example.com",    "full_name": "Arjun Kulkarni",    "password": "Pass123!",   "role": "cro",     "department": "Risk Management"},
        {"username": "vivek.ciso","email": "vivek@example.com",    "full_name": "Vivek Singh",       "password": "Pass123!",   "role": "ciso",    "department": "Information Security"},
        {"username": "rahul.dpo", "email": "rahul@example.com",    "full_name": "Rahul Mehta",       "password": "Pass123!",   "role": "dpo",     "department": "Legal & Compliance"},
        {"username": "priya.aud", "email": "priya@example.com",    "full_name": "Priya Sharma",      "password": "Pass123!",   "role": "auditor", "department": "Internal Audit"},
    ]
    for u in users:
        r = await client.post(f"{BASE_URL}/auth/register", json=u)
        if r.status_code == 201:
            print(f"  ✅ User: {u['username']}")
        else:
            print(f"  ⚠️  User {u['username']}: {r.text[:60]}")


async def seed_risks(client: httpx.AsyncClient):
    risks = [
        {"title": "Ransomware attack on core infrastructure",        "category": "Cybersecurity", "likelihood": "Likely",        "impact": "Catastrophic", "treatment": "Mitigate",  "owner": "Vivek Singh"},
        {"title": "DPDP Act 2023 non-compliance penalty",            "category": "Regulatory",    "likelihood": "Possible",      "impact": "Major",        "treatment": "Transfer",  "owner": "Rahul Mehta"},
        {"title": "Third-party vendor data leakage",                  "category": "Vendor",        "likelihood": "Likely",        "impact": "Major",        "treatment": "Mitigate",  "owner": "Priya Sharma"},
        {"title": "Cloud misconfiguration exposure",                  "category": "Cybersecurity", "likelihood": "Possible",      "impact": "Major",        "treatment": "Mitigate",  "owner": "Vivek Singh"},
        {"title": "Insider threat - privileged access abuse",         "category": "Operational",   "likelihood": "Unlikely",      "impact": "Catastrophic", "treatment": "Accept",    "owner": "Arjun Kulkarni"},
        {"title": "AI model hallucination in financial decisions",    "category": "AI Risk",       "likelihood": "Possible",      "impact": "Major",        "treatment": "Mitigate",  "owner": "Arjun Kulkarni"},
        {"title": "Business continuity plan gaps",                    "category": "Operational",   "likelihood": "Unlikely",      "impact": "Moderate",     "treatment": "Mitigate",  "owner": "Arjun Kulkarni"},
        {"title": "Supply chain compromise via vendor",               "category": "Vendor",        "likelihood": "Likely",        "impact": "Catastrophic", "treatment": "Transfer",  "owner": "Priya Sharma"},
        {"title": "Social engineering and phishing campaigns",        "category": "Cybersecurity", "likelihood": "Almost Certain","impact": "Moderate",     "treatment": "Mitigate",  "owner": "Vivek Singh"},
        {"title": "Data residency violation - EU customers",          "category": "Regulatory",    "likelihood": "Possible",      "impact": "Major",        "treatment": "Mitigate",  "owner": "Rahul Mehta"},
    ]
    for r in risks:
        resp = await client.post(f"{BASE_URL}/risks", json=r, headers=headers())
        if resp.status_code == 201:
            print(f"  ✅ Risk: {r['title'][:50]}")
        else:
            print(f"  ⚠️  Risk error: {resp.text[:60]}")


async def seed_vendors(client: httpx.AsyncClient):
    vendors = [
        {"name": "CloudVault Inc.",     "tier": "Tier 1", "data_sensitivity": "Critical", "iso_certified": False, "soc2_certified": False, "pen_test_done": False},
        {"name": "DataSafe Analytics",  "tier": "Tier 1", "data_sensitivity": "High",     "iso_certified": True,  "soc2_certified": False, "pen_test_done": True},
        {"name": "SecurePay Gateway",   "tier": "Tier 1", "data_sensitivity": "Critical", "iso_certified": True,  "soc2_certified": True,  "pen_test_done": True},
        {"name": "HRConnect HRMS",      "tier": "Tier 2", "data_sensitivity": "High",     "iso_certified": True,  "soc2_certified": False, "pen_test_done": True},
        {"name": "OmniLogistics Ltd.",  "tier": "Tier 2", "data_sensitivity": "Medium",   "iso_certified": False, "soc2_certified": False, "pen_test_done": False},
        {"name": "TechNova Cloud",      "tier": "Tier 3", "data_sensitivity": "Low",      "iso_certified": True,  "soc2_certified": True,  "pen_test_done": True},
    ]
    for v in vendors:
        resp = await client.post(f"{BASE_URL}/vendors", json=v, headers=headers())
        if resp.status_code == 201:
            print(f"  ✅ Vendor: {v['name']}")
        else:
            print(f"  ⚠️  Vendor error: {resp.text[:60]}")


async def seed_audits(client: httpx.AsyncClient):
    audits = [
        {"title": "ISO 27001 Surveillance Audit 2025", "audit_type": "External", "framework": "ISO 27001", "auditor": "Ernst & Young", "owner": "Arjun Kulkarni"},
        {"title": "PCI DSS QSA Assessment 2025",       "audit_type": "External", "framework": "PCI DSS",   "auditor": "Verizon QSA",  "owner": "Vivek Singh"},
        {"title": "IT General Controls Review Q2",     "audit_type": "Internal", "framework": "Internal",  "auditor": "Internal Audit","owner": "Priya Sharma"},
        {"title": "GDPR Article 32 Technical Review",  "audit_type": "Internal", "framework": "GDPR",      "auditor": "DPO Team",     "owner": "Rahul Mehta"},
    ]
    for a in audits:
        resp = await client.post(f"{BASE_URL}/audits", json=a, headers=headers())
        if resp.status_code == 201:
            print(f"  ✅ Audit: {a['title']}")


async def seed_policies(client: httpx.AsyncClient):
    policies = [
        {"title": "Information Security Policy",         "owner": "CISO",    "version": "v4.2", "mapped_frameworks": "ISO 27001,SOC 2,GDPR"},
        {"title": "Data Classification & Handling",      "owner": "DPO",     "version": "v2.1", "mapped_frameworks": "GDPR,DPDP 2023"},
        {"title": "Acceptable Use Policy",               "owner": "IT Head", "version": "v3.0", "mapped_frameworks": "ISO 27001,SOC 2"},
        {"title": "Third-Party Risk Management Policy",  "owner": "CRO",     "version": "v1.5", "mapped_frameworks": "ISO 27001,PCI DSS"},
        {"title": "AI Ethics & Governance Policy",       "owner": "CDO",     "version": "v1.0", "mapped_frameworks": "EU AI Act,Internal"},
        {"title": "Incident Response Policy",            "owner": "CISO",    "version": "v5.1", "mapped_frameworks": "ISO 27001,SOC 2,GDPR"},
    ]
    for p in policies:
        resp = await client.post(f"{BASE_URL}/policies", json=p, headers=headers())
        if resp.status_code == 201:
            print(f"  ✅ Policy: {p['title']}")


async def seed_ai_systems(client: httpx.AsyncClient):
    systems = [
        {"name": "Credit Scoring AI",        "department": "Finance",        "risk_level": "High",    "bias_status": "Detected",  "explainability": "Medium", "data_type": "PII/Financial", "framework": "EU AI Act Art.9",   "owner": "Deepa Nair"},
        {"name": "HR Recruitment Bot",       "department": "Human Resources","risk_level": "High",    "bias_status": "Monitoring","explainability": "High",   "data_type": "PII/Sensitive", "framework": "EEOC / DPDP",       "owner": "Anita Rao"},
        {"name": "Customer Chatbot",         "department": "Support",        "risk_level": "Limited", "bias_status": "None",      "explainability": "High",   "data_type": "General",       "framework": "EU AI Act Art.52",  "owner": "Rahul Mehta"},
        {"name": "Fraud Detection ML",       "department": "Operations",     "risk_level": "High",    "bias_status": "None",      "explainability": "Low",    "data_type": "Financial",     "framework": "RBI ML Guidelines", "owner": "Vivek Singh"},
        {"name": "LMS Recommendation Engine","department": "L&D",            "risk_level": "Medium",  "bias_status": "Detected",  "explainability": "Medium", "data_type": "Behavioral",    "framework": "Internal Policy",   "owner": "Priya Sharma"},
        {"name": "Predictive Maintenance AI","department": "Infrastructure", "risk_level": "Low",     "bias_status": "None",      "explainability": "High",   "data_type": "Operational",   "framework": "ISO 42001",         "owner": "Aditya Kumar"},
    ]
    for s in systems:
        resp = await client.post(f"{BASE_URL}/aigov", json=s, headers=headers())
        if resp.status_code == 201:
            print(f"  ✅ AI System: {s['name']}")


async def main():
    print("\n🛡  GRC Platform — Seeding Database\n" + "─" * 40)
    async with httpx.AsyncClient(timeout=30) as client:
        print("\n👤 Creating users…")
        await seed_users(client)
        await get_token(client)
        print("\n⚠️  Seeding risks…")
        await seed_risks(client)
        print("\n🏢 Seeding vendors…")
        await seed_vendors(client)
        print("\n📋 Seeding audits…")
        await seed_audits(client)
        print("\n📄 Seeding policies…")
        await seed_policies(client)
        print("\n🤖 Seeding AI systems…")
        await seed_ai_systems(client)
    print("\n✅ Seed complete! Visit http://localhost to access the platform.\n")


if __name__ == "__main__":
    asyncio.run(main())
