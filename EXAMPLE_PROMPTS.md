# Example Prompts for Testing

Use these prompts to test Vibe DevOps GCP and see the agents in action!

## 🚀 Quick Start Prompts

### 1. Simple Web Server
```
Deploy a simple web server
```

**Expected:** Cloud Run deployment, ~10 seconds

### 2. Basic Application
```
I need to deploy a containerized application
```

**Expected:** Cloud Run with basic configuration

### 3. Minimal Database
```
Deploy a web app with a database
```

**Expected:** Cloud Run + Cloud SQL

---

## 💡 Detailed Prompts

### 4. FastAPI + PostgreSQL
```
Deploy a FastAPI application with a PostgreSQL database.
The API should be serverless and auto-scale.
I need it in us-central1 region.
```

**Expected:**
- Cloud Run (FastAPI container)
- Cloud SQL PostgreSQL
- VPC networking
- Estimated cost: ~$50/month

### 5. Budget-Conscious Deployment
```
I want to deploy a Python web application with database storage.
My budget is under $30 per month.
I need automatic backups and SSL.
```

**Expected:**
- Cost-optimized tiers (db-f1-micro)
- Cloud Run minimal config
- Backup configuration
- Cost estimate < $30

### 6. High-Traffic Application
```
Deploy a high-traffic web application that can handle 10,000 requests per minute.
I need a database, caching layer, and load balancing.
Must be in US region with auto-scaling.
```

**Expected:**
- Cloud Run with high max instances
- Cloud SQL with larger tier
- Memorystore Redis for caching
- Load balancer configuration
- Higher cost estimate

---

## 🎯 Specific Service Requests

### 7. Cloud Run Specific
```
I need a Cloud Run service with 1GB memory, 2 CPUs, and ability to scale from 1 to 50 instances
```

**Expected:** Detailed Cloud Run configuration

### 8. Cloud SQL Specific
```
Create a PostgreSQL database with 100GB storage, automatic backups, and high availability
```

**Expected:** Cloud SQL with HA config

### 9. Storage + Function
```
I need a cloud storage bucket and a function that processes uploaded files
```

**Expected:**
- Cloud Storage bucket
- Cloud Function trigger
- IAM permissions

---

## 🏗️ Complex Architecture Prompts

### 10. Microservices Architecture
```
Deploy a microservices architecture with:
- 3 API services (user service, product service, order service)
- Shared PostgreSQL database
- Redis cache
- Message queue for async processing
All services should be containerized and auto-scale
```

**Expected:**
- Multiple Cloud Run services
- Cloud SQL shared database
- Memorystore Redis
- Cloud Pub/Sub or Cloud Tasks
- VPC networking
- Complex architecture diagram

### 11. Full-Stack Application
```
I need to deploy a full-stack application:
- React frontend served via CDN
- Node.js backend API
- PostgreSQL database
- File storage for user uploads
- Email notifications

Budget: $75/month
Region: us-west1
```

**Expected:**
- Cloud Storage + Cloud CDN for frontend
- Cloud Run for backend
- Cloud SQL PostgreSQL
- Cloud Storage for uploads
- Cloud Tasks or Pub/Sub for emails
- Detailed cost breakdown

### 12. Data Pipeline
```
Create a data processing pipeline:
- Ingest data from Cloud Storage
- Process with Python
- Store results in BigQuery
- Schedule to run daily
```

**Expected:**
- Cloud Functions or Cloud Run Jobs
- BigQuery dataset
- Cloud Scheduler
- IAM roles for access

---

## 🔒 Security-Focused Prompts

### 13. Secure Application
```
Deploy a secure web application with:
- Private database (no public access)
- VPC isolation
- Encrypted storage
- IAM least privilege
- Audit logging
```

**Expected:**
- VPC with private subnets
- Cloud SQL private IP
- Encrypted Cloud Storage
- Detailed IAM roles
- Cloud Audit Logs

### 14. Compliance Requirements
```
I need a HIPAA-compliant application with:
- Healthcare data storage
- Encrypted at rest and in transit
- Audit trails
- Backup and disaster recovery
Region must be US-only
```

**Expected:**
- Cloud SQL with encryption
- Private networking
- Backup configuration
- Compliance-focused architecture

---

## 💰 Cost-Aware Prompts

### 15. Cost Optimization
```
Deploy a development environment for a web app with database.
Minimize costs as much as possible - this is just for testing.
```

**Expected:**
- Smallest Cloud Run config
- db-f1-micro Cloud SQL
- No redundancy
- Cost estimate < $20

### 16. Budget Comparison
```
Show me the cost difference between deploying my app in:
1. Development mode (minimal cost)
2. Production mode (high availability)
```

**Expected:**
- Two architecture options
- Cost comparison
- Tradeoffs explained

---

## 🌍 Multi-Region Prompts

### 17. Global Deployment
```
I need a globally distributed web application:
- Serve users in US, Europe, and Asia
- Low latency everywhere
- Database replication
- Automatic failover
```

**Expected:**
- Multi-region Cloud Run
- Cloud SQL with read replicas
- Cloud CDN
- Global load balancing

---

## 🔄 Update/Modify Prompts

### 18. Scale Existing
```
I have a Cloud Run service that's getting more traffic.
Increase the max instances to 100 and add Redis caching.
```

**Expected:**
- Updated Cloud Run config
- Memorystore Redis addition
- Cost delta

### 19. Add Monitoring
```
Add comprehensive monitoring and alerting to my existing application
```

**Expected:**
- Cloud Monitoring setup
- Alert policies
- Dashboard configuration

---

## 🧪 Testing Prompts

### 20. Error Handling
```
Deploy a [intentionally vague request]
```

**Expected:** Requirements agent asks clarifying questions

### 21. Invalid Request
```
Deploy a quantum computer on GCP
```

**Expected:** Agent explains GCP doesn't offer this, suggests alternatives

### 22. Overcomplicated
```
Deploy a machine learning model training pipeline with distributed GPU clusters,
data preprocessing, model versioning, A/B testing, real-time inference API,
monitoring dashboard, and automated retraining
```

**Expected:**
- Complex architecture with multiple services
- Vertex AI integration
- Cloud Run for inference
- Detailed plan

---

## 📊 Expected Response Format

For each prompt, you should see:

### 1. Requirements Analysis (5-10 sec)
```
✓ Requirements Analysis Complete

Services needed: Cloud Run, Cloud SQL
Constraints: us-central1, budget: low
Dependencies: API → Database
Security: HTTPS, VPC, IAM
```

### 2. Architecture Design (10-15 sec)
```
✓ Architecture Design Complete

Designed optimal GCP architecture:
- Cloud Run: 512MB, 1 CPU, 1-10 instances
- Cloud SQL: db-f1-micro, 10GB storage
- VPC: Custom VPC with private connectivity

Estimated Monthly Cost: $45.20
```

### 3. IaC Generation (5-10 sec)
```
✓ Terraform Configuration Generated

Deployment ID: deploy-a3f7b2c1
Generated 4 Terraform files:
- main.tf
- variables.tf
- outputs.tf
- provider.tf
```

### 4. Deployment (30-60 sec with GCP)
```
🚀 Starting Deployment

Initializing Terraform workspace...
Creating deployment plan...
Plan: 3 to add, 0 to change, 0 to destroy

Applying infrastructure changes...
✓ Created: google_cloud_run_service.api_service
✓ Created: google_sql_database_instance.postgres_db
✓ Created: google_vpc.custom_vpc

✅ Deployment Complete!
Your infrastructure is now live on GCP.
```

---

## 🎯 Prompt Tips

### Good Prompts
✅ Specify services (web app, database, cache)
✅ Include constraints (region, budget, scale)
✅ Mention requirements (auto-scale, backups, SSL)
✅ Be specific about traffic/load expectations

### Avoid
❌ Too vague: "deploy something"
❌ Impossible requests: "deploy AWS services on GCP"
❌ Missing context: "I need a thing"

### Pro Tips
💡 Start simple, then add complexity
💡 Mention budget to get cost-optimized solutions
💡 Specify region for relevant recommendations
💡 Include scale requirements for proper sizing

---

## 🧪 Testing Workflow

1. **Start with Simple** - Test basic functionality
2. **Add Complexity** - Try detailed prompts
3. **Test Variations** - Different services, constraints
4. **Edge Cases** - Vague or complex requests
5. **Evaluate Responses** - Check quality of agent outputs

---

## 📈 Success Indicators

Good response includes:
- ✅ Specific GCP services
- ✅ Configuration details
- ✅ Cost estimate
- ✅ Deployment order
- ✅ Security considerations
- ✅ Networking setup

---

## 🎬 Demo Script

For presentations:

1. **Start simple**: "Deploy a web server"
2. **Show speed**: Agent completes in seconds
3. **Add complexity**: "Deploy a web app with database"
4. **Show intelligence**: Agents design proper VPC, security
5. **Show cost**: Estimate displayed before deployment
6. **Show Terraform**: View generated code
7. **Show architecture**: Visual representation

---

Copy any prompt above, paste into the chat, and watch the agents work! 🚀
