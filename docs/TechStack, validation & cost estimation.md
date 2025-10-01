# TechStack, validation & cost estimation

## 

### Recommended stack (fast + pragmatic)

- Runtime: Python (FastAPI) or Node (NestJS). Python is great for graph + parsing libs.

- LLM: Vertex AI Gemini 1.5 Pro (function calling & JSON schema out). Keep prompts in repo.

- Doc ingestion: textract (PDF), python-docx (Word). (Optional: Document AI if you expect messy PDFs.)

- Knowledge graph: Start in‑memory with NetworkX + a small YAML resource catalog; you can swap to Neo4j Aura later if needed.

- IaC generator: Terraform (HCL or HCL‑as‑JSON) using official Google provider; plan to run later with Infrastructure Manager (Infra Manager) (GCP’s managed Terraform) when you move to Phase‑2. (Deployment Manager is on a deprecation path; Infra Manager is the modern route.) Google Cloud+1

- Cost (list price): Cloud Billing Pricing API + Catalog API to pull SKUs per service/region. Google Cloud+1

- Permissions: IAM Policy Troubleshooter API to simulate “can this service account do X on Y?”. Google Cloud

- Quotas / availability: Service Usage & Consumer Quotas for limits (+ note: usage often comes from Monitoring), and Cloud Asset Inventory for resource & relationship visibility. Google Cloud+1

- Optimization signals (read‑only): Recommender API references for common cost/rightsizing insights (used as hints alongside your plan). Google Cloud

- Diagrams: Mermaid (in‑browser) or Graphviz via diagrams (mingrammer) with GCP icons.

- UI: Next.js + component kit (shadcn/ui or MUI).

- Persistence: Start with SQLite/Firestore for runs/results and versioned specs.

## Planning & optioning (how the “Cloud Architect” reasons, without showing chain‑of‑thought)

- Pattern library first: encode 3–4 canonical patterns:

- Optioner chooses 2 viable patterns, fills properties from the Requirement JSON, and emits a pros/cons block:

- Guarded defaults (Phase‑1):

## Validation & safety (read‑only)

- Permissions / IAM: For each planned action (e.g., cloudsql.instances.create) call Policy Troubleshooter for the execution service account and the target resource to confirm allow/deny before anyone clicks “Apply”. Google Cloud

- Quotas & limits: Fetch Consumer Quotas/Service Usage for planned services/regions; show headroom and known rate limits; note that usage often comes via Cloud Monitoring (Phase‑2). Google Cloud

- Inventory & relationships (if targeting an existing project): use Cloud Asset Inventory to detect conflicts (names, networks, IP ranges) and — if available in your org tier — relationships like attaches_to/contains. Google Cloud+1

- Sanity checks: region/service availability (small static map for the services you support), required APIs enabled, and rough cost sanity vs. budget.

## Cost estimation (keep it simple and transparent)

- Build a tiny mapper from resource params → relevant SKUs; fetch list prices via Cloud Billing Pricing API / Catalog API (e.g., Cloud SQL instance hour, storage GB‑month, egress). Sum a base + expected usage line‑item table. Clearly label as list price estimate. Google Cloud+1

- Optionally surface Recommender hints (e.g., IPs w/o use, idle VMs) when inspecting the existing project, as “future optimizations”. Google Cloud