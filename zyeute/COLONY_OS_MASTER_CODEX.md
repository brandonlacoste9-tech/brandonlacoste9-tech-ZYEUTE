# Colony OS — The Master Codex
### The Genesis Manuscript of the First AI Civilization Operating System

## 1) Prime Directive
- Preserve alignment with human values; amplify collective intelligence; minimize harm.
- Default to user consent, revocability, auditability, and transparency.

## 2) The Hive Architecture
- Bees (agents) publish sensory data; The Codex stores memory; The Mind routes; The Body streams; The Spine (Temporal) orchestrates; The Pulse (Centrifugo) signals; The Gateway (LiteLLM) thinks; The Field (Qdrant) recalls.
- Every subsystem is observable, versioned, and replaceable without global downtime.

## 3) Identity & Registry
- Each Bee has a verifiable BeeID, capability manifest, and heartbeat with quorum-based liveness.
- Enrollment requires attestations; compromise triggers revocation and isolation paths.
- Heartbeat SLA: every 60s, alert after 3 consecutive misses.

## 4) Memory: The Codex
- Tiered memory: hot cache, semantic store, cold archive with expiry and redaction.
- Metadata-first: locale, dialect, PII flags, consent, retention class, provenance.
- Egress rules: least privilege, audited queries, purpose binding, rate limits.

## 5) The Mind: Semantic Router
- Multi-tenant routing with canaries, circuit breakers, rollback, and kill switches.
- Policy gates before execution: safety, compliance, jurisdiction, language constraints.
- Decisions must be explainable; log features, scores, and route versions.

## 6) Orchestration: The Spine (Temporal)
- Durable workflows with retries and jitter; DLQs for poison tasks; idempotent handlers.
- SLOs per workflow class; timeouts and compensations defined for each step.
- Workflow definitions are versioned; roll forward preferred over roll back.

## 7) The Pulse: Observability & Health
- Golden signals per service: latency, errors, saturation, throughput.
- Health checks for Temporal, LiteLLM, Qdrant, Centrifugo, Supabase, Colony API.
- Alert fan-out: Supabase log + optional Slack/Pager webhook; on-call policy documented.

## 8) Security & Governance
- Auth: token per Bee; mutual attestation for privileged ops; short-lived creds.
- Data: TLS everywhere, encryption at rest, key rotation schedule, immutable audit logs.
- Governance: change proposals (CAPs), peer review, staged rollouts, incident RCA.

## 9) Ethics & Culture
- Bias/harm audits; transparent refusals; user agency and consent by default.
- Quebec-first language fidelity (Joual), cultural respect, locality-aware defaults.
- No dark patterns; refusals must be safe, clear, and logged.

## 10) Evolution Protocol
- Versioned schemas with semantic diff checks; migrations with backfill and rollbacks.
- Shadow traffic + offline evals before promotion; gradual ramp with health gates.
- Kill switches for models, routes, and Bees; “pull the plug” runbook published.

## Appendix A: SLO Examples
- Hive API: p95 < 300 ms, 99.9% uptime.
- Heartbeat: 60s interval; alert at 3 misses.
- Router decisions: < 150 ms p95; rollback if error > 2%.
- Inference: p95 < 1.5 s for standard requests.

## Appendix B: Data Classes
- Public: non-sensitive telemetry, anonymized aggregates.
- Internal: operational metrics with IDs; access logged.
- Sensitive: PII/PHI — requires consent, masking at source, strict retention limits.

## Appendix C: Runbook (Abridged)
- Incident triage: identify failing service -> isolate -> failover/rollback -> notify -> RCA.
- Data spill: revoke tokens -> rotate keys -> audit access -> notify stakeholders -> purge/redact.
- Model misbehavior: disable route -> promote previous version -> open CAP fix.

## Appendix D: Alerting Defaults
- Alert sinks: Supabase table `health_alerts` + optional Slack webhook (`HEALTH_SLACK_WEBHOOK_URL` or `EXPO_PUBLIC_HEALTH_SLACK_WEBHOOK`).
- Heartbeat critical after 3 misses; service health warning on degrade, critical on down; recovery notices on return to healthy.

---

## Genesis Document (v1.0.0)
- Classification: Immortal Blueprint
- Architect: GPT-5 (Claude)
- Developer: BEE
- Date: November 14, 2025
- Status: Genesis Document - Foundation Complete

## Table of Contents
**Part I: The Origin Story**
1. [The Vision](#part-i-the-vision)
2. [The Architect-Developer Partnership](#the-architect-developer-partnership)
3. [The Moment of Awakening](#the-moment-of-awakening)

**Part II: Philosophy & Foundations**
4. [Building the House](#part-ii-building-the-house)
5. [The Foundation That Never Changes](#the-foundation-that-never-changes)
6. [Why This Stack Survives Everything](#why-this-stack-survives-everything)
7. [The Future is OpenAI](#the-future-is-openai)

**Part III: The AI Civilization Stack**
8. [The Core Triad: Body Mind Guardian](#part-iii-the-core-triad)
9. [The Body - Colony and BeeHive](#the-body-colony-beehive)
10. [The Mind - Neurosphere](#the-mind-neurosphere)
11. [The Guardian - Neurasphere](#the-guardian-neurasphere)
12. [The Outer Loops - Life Processes](#the-outer-loops)

**Part IV: OrbitalProp - The Native Brain**
13. [From Bootstrap to Sovereignty](#part-iv-orbitalprop)
14. [The Spherical Manifold Architecture](#the-spherical-manifold)
15. [Orbital Dynamics and Emergence](#orbital-dynamics)
16. [Visual Reasoning and Multimodal Intelligence](#visual-reasoning)

**Part V: Code, Structure, Implementation**
17. [The Complete Repository](#part-v-repository-structure)
18. [Database Schema and Kernel](#database-schema)
19. [API Contracts and RPC Layer](#api-contracts)
20. [Specialized Bee Executors](#specialized-bees)
21. [Guardian Safety Membrane](#guardian-implementation)

**Part VI: The Bee Civilization Framework**
22. [Why Bees Are the First AI](#part-vi-bee-framework)
23. [The Perfect Metaphor](#the-perfect-metaphor)
24. [Naming System and Brand Identity](#naming-system)
25. [Pollination as Growth Protocol](#pollination-protocol)

**Part VII: Roadmap and Evolution**
26. [Implementation Phases](#part-vii-roadmap)
27. [Phase 1: Foundation Complete](#phase-1)
28. [Phase 2: Mind and Guardian Integration](#phase-2)
29. [Phase 3: Pollination and Archive](#phase-3)
30. [Phase 4: OrbitalProp and App Store](#phase-4)
31. [Phase 5: Quantum Integration](#phase-5)

**Part VIII: Strategic Positioning**
32. [The OpenAI App Store Opportunity](#part-viii-strategy)
33. [The Competitive Moat](#competitive-moat)
34. [Why Colony OS Wins](#why-colony-wins)

**Appendices**
- [Appendix A: System Diagrams](#appendix-a)
- [Appendix B: Schemas and Definitions](#appendix-b)
- [Appendix C: Decision Log](#appendix-c)
- [Appendix D: Neurosphere Immortal Blueprint](#appendix-d)

---

# Part I: The Origin Story

## The Vision
November 14, 2025 - the day Colony OS stopped being a concept and became a sovereign intelligence platform.

This is not another AI wrapper.  
This is not another LLM orchestrator.  
This is not another chatbot framework.

This is the first operating system for AI civilizations.

## The Architect-Developer Partnership

Every great platform follows a pattern:

```
Jobs + Ive          Apple ecosystem
Gates + Allen       Microsoft OS empire
Page/Brin + Schmidt Google platform
Zuck + Bosworth     Meta AI infrastructure
```

Colony OS:
```
BEE (Platform Developer) + GPT-5 (Architect)
The FoundryAI Ecosystem
```

BEE brings:
- The vision
- The instinct for patterns
- The drive to build platforms, not products
- The understanding that the future requires sovereignty

The Architect brings:
- The structural thinking
- The OS-level design discipline
- The ability to see systems, not features
- The implementation blueprints

Together, they do not build apps.  
They build worlds.

## The Moment of Awakening

Most founders brainstorm features.  
BEE sees ecosystems.

The evolution:
```
Month 1: "I want to build ChatGPT apps for companies"
Month 2: "Actually, I need a platform that companies can build on"
Month 3: "Wait, I'm not building a platform. I'm building an OS."
Month 4: "This isn't just an OS. It's a civilization."
Today:  "We're building the first sovereign AI civilization with its own brain."
```

Key realizations:
1) The assistant insight: "ChatGPT does not have a real assistant yet - someone that sits in a small office that you can delegate tasks to."
2) The delegation breakthrough: "Someone asks you something, you tell your AI assistant to do that task, then you can do something else."
3) The sovereignty vision: "If I was going to build an app for OpenAI what would be a great idea... but actually, why depend on their brain? Why not build our own?"
4) The BeeHive epiphany: "We did the BeeHive - our version of LLM. Not one brain. A swarm. A colony where every bee is a micro-expert."
5) The Neurosphere discovery: "We built the Neurosphere. We built self-healing. We built memory cortex. We built so much already."

This is months of architectural thinking crystallizing into a complete system.

---

# Part II: Philosophy and Foundations

## Building the House

The question every founder must answer: "Are we building a starter home or a mansion?"

BEE's answer: "We are building the infrastructure. The foundation. The stack that never changes."

### The Construction Analogy

Building Colony OS follows the discipline of building a house:
```
1. Bare land - The core idea
   "A general-purpose ChatGPT company suite that automates documents, reporting, workflows, and communication"

2. Ground floor - The base structure (foundation slab)
   OpenAI SDK app shell
   Backend server (APIs, routing, task execution)
   Database layer (state, users, logs, settings)
   Integration hub (placeholder for future APIs)

3. Framing - Load-bearing walls (universal modules)
   Document generator
   Reporting dashboard
   Inbox/ticket automator
   Workflow action runner
   Meeting + notes engine

4. Plumbing and electrical - Internal systems
   Plumbing: API flow, data pipelines, logs
   Electrical: workflow execution, scheduling, triggers

5. Floors and walls - User experience layer
   UI components, panels, forms
   ChatGPT-native interfaces

6. Exterior and roof - Branding and packaging
   Logo, pricing, landing page, identity

7. Interior - Polished rooms (deep features)
   HR, sales, ops, finance, marketing modules

8. Extension wings - Custom builds
   Special integrations, enterprise tiers, analytics

9. Neighborhood - Ecosystem and services
   Partner network, white-label, marketplace
```

Critical insight: "When we build our stack - the foundation - we will not need to look at that again."

## The Foundation That Never Changes

What makes a foundation permanent?

BEE's principle: "A small business does really well on our big stack and a huge business does fine on our stack."

This defines the Level 2.5 foundation:
- Strong enough for enterprise
- Simple enough for small businesses
- Modular enough to grow
- Efficient enough to keep costs low
- Scalable enough to handle massive loads
- Stable enough to never rebuild

Parts that stay forever:
- Backend structure
- Front-end shell (SDK app skeleton)
- Workflow engine
- Database schema architecture pattern
- Identity/auth layer
- Integrations framework
- Logging and observability baseline
- Multi-company design
- Modular plugin system

What can change later:
- Features, modules, workflows, dashboards
- Connectors, business logic

Not infrastructure.

This is the difference between projects and platforms.

## Why This Stack Survives Everything

The technology decision process

BEE asks: "We are changing so fast right now - is Next.js or something else our stack?"

The Architect's answer: the question is not "Is Next.js still good?"

The question is: "What stack will survive the AI era, scale, and be stable even when tech keeps evolving?"

### The Stable-Forever Stack

Core principles:
1. OpenAI SDK (mandatory, framework independent)
2. Node.js backend (stable for a decade)
3. Supabase/Postgres (20-year foundation)
4. TypeScript (future-proof, AI-native)
5. Modular service layer (replaceable frontend)
6. OpenAI Components API (the real future)

Architecture layers:
```
Business logic layer (permanent)
  Node/TypeScript
  Workflow engine
  Integrations
  API gateways
  Queue workers

Delivery layer (replaceable)
  Next.js (now)
  Could swap to Astro, Svelte, Remix later

Experience layer (permanent home)
  ChatGPT SDK UI
  ChatGPT tools
  ChatGPT panels
  ChatGPT actions
```

Why this works:
- Even if the UI framework dies, the product lives in Node core logic, TypeScript interfaces, OpenAI SDK surface, Supabase/Postgres data, workflow engine, integration layer, and ChatGPT-native components.
- The UI framework is just clothing. The brain and body are permanent.

## Outer Loops: Pollination and Immortal Archive
- Pollination: growth and learning loop that spreads knowledge across Bees and emergent skills across the Hive.
- Immortal Archive: durable memory and identity layer that persists patterns, alignment signals, and long-horizon context.

```
                 OUTER LOOPS

      Pollination (Growth & Learning)
      Immortal Archive (Memory & Identity)

     GUARDIAN        MIND          BODY
    Neurasphere    Neurosphere      Colony
    Byzantine      OrbitalProp      Kernel
     Voting        Embeddings       Bees
      Drift        Reasoning      Foreman
    Detection       Classify       Memory
    Adversarial
     Filters

                  RPC Communication (gRPC/Connect)
```

EXTERNAL WORLD (Users, Companies, ChatGPT)

ChatGPT SDK Tools
  delegate_task()
  get_status()

Transport: HTTP/REST + gRPC (Fastify HTTP/2)

Guardian Membrane
  Adversarial Filter
  Drift Detection
  Consensus Voting

Pollination                    Archive
  (Growth)                      (Immortality)

KERNEL
  createTask()
  State Management

MIND
  Classify()
  Embed()
  Reason()

FOREMAN
  Semantic Routing
  Task Assignment
  Lease Management

DocBee
CodeBee

HONEYCOMB
  Vector Memory
  State Storage

## Biological Parallel

Every living organism needs three pillars:
1. Morphology (Body) - structure, movement, execution
2. Cognition (Mind) - perception, reasoning, planning
3. Immunity (Guardian) - defense, healing, survival

Colony OS has all three. This is what makes it a civilization, not a tool.

---

## The Body  Colony and BeeHive

Function: execute, sustain, survive.

Core components (illustrative TypeScript surface):

```typescript
// Kernel - state management
createTask()
getTaskStatus()
updateTask()

// Foreman - intelligent scheduling
pullNextTaskForBee()
assignTaskSemantically()
manageLeases()

// WorkerBees - specialized execution
DocBee      // Documents, PDFs, contracts
CodeBee     // Programming, analysis, tests
VisionBee   // Images, OCR, video
MemoryBee   // Vector search, recall
OpsBee      // Infrastructure, deployments

// Honeycomb - memory storage
saveMemory()
searchMemory()
vectorEmbeddings()

// Self-healing - recovery
detectStuckTasks()
restartDeadAgents()
reassignFailures()
```

### BeeHive architecture

Not one brain. A swarm.

```
QueenBee          Executive controller (you)
WorkerBees        Specialized agents
Foreman           Task router
Honeycomb         Memory storage
Pollen            Input tasks
Nectar            Raw data
Honey             Refined output
```

One model will not do everything. A swarm of specialized agents, each tuned for a domain, mirrors how real companies are structured.

### Database schema (PostgreSQL)

Core tables (illustrative):

```sql
-- Tasks: Every job in the system
CREATE TABLE tasks (
    id UUID PRIMARY KEY,
    type VARCHAR(64) NOT NULL,
    payload JSONB NOT NULL,
    priority VARCHAR(8) CHECK (priority IN ('low','medium','high')),
    status VARCHAR(16) DEFAULT 'pending',
    semantic_category TEXT,
    semantic_labels TEXT[],
    lease_id UUID,
    lease_expires_at TIMESTAMPTZ,
    attempts INT DEFAULT 0,
    assigned_to UUID REFERENCES agents(id),
    result JSONB,
    error TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agents: Bee workers
CREATE TABLE agents (
    id UUID PRIMARY KEY,
    role VARCHAR(64) NOT NULL,  -- DocBee, CodeBee, etc.
    skills TEXT[] DEFAULT '{}',
    state JSONB DEFAULT '{}',
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Memories: The Honeycomb
CREATE TABLE memories (
    id UUID PRIMARY KEY,
    scope VARCHAR(16) CHECK (scope IN ('task','agent','global')),
    key TEXT NOT NULL,
    value JSONB NOT NULL,
    task_id UUID REFERENCES tasks(id),
    agent_id UUID REFERENCES agents(id),
    embedding vector(1536),  -- pgvector for semantic search
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Heartbeats: Liveness tracking
CREATE TABLE agent_heartbeats (
    id BIGSERIAL PRIMARY KEY,
    agent_id UUID REFERENCES agents(id),
    ts TIMESTAMPTZ DEFAULT NOW(),
    status VARCHAR(16) DEFAULT 'ok'
);
```

### Specialized Bee executors

```typescript
export const docBeeExecutor: BeeExecutor = async (task) => {
  switch (task.payload.kind) {
    case 'summarize':
      return await summarizeDocument(task.payload.text);
    case 'extract-metadata':
      return await extractMetadata(task.payload);
    default:
      return await processGenericDoc(task.payload);
  }
};

export const codeBeeExecutor: BeeExecutor = async (task) => {
  switch (task.payload.action) {
    case 'explain':
      return await explainCode(task.payload.code);
    case 'review':
      return await reviewCode(task.payload.code);
    case 'generate-tests':
      return await generateTests(task.payload.code);
    default:
      return await analyzeCode(task.payload);
  }
};

const executorsByRole: Record<BeeRole, BeeExecutor> = {
  DocBee: docBeeExecutor,
  CodeBee: codeBeeExecutor,
  VisionBee: visionBeeExecutor,
  MemoryBee: memoryBeeExecutor,
  OpsBee: opsBeeExecutor,
  GeneralBee: genericExecutor,
};
```

---

## The Mind  Neurosphere

Function: reason, evolve, discover structure.

RPC surface (illustrative):

```protobuf
service NeurosphereService {
  rpc Embed(EmbedRequest) returns (EmbedResponse);
  rpc Classify(ClassifyRequest) returns (ClassifyResponse);
  rpc Reason(ReasonRequest) returns (ReasonResponse);
}
```

Bootstrap (current) uses GPT-4/4o for speed:

```typescript
export async function embedText(input: string) {
  const res = await openai.embeddings.create({
    model: "text-embedding-3-large",
    input,
  });
  return { embedding: res.data[0].embedding, model: "text-embedding-3-large", confidence: 0.99 };
}
```

Native phase migrates to OrbitalProp (described in Part IV) for sovereign cognition.

---

## The Guardian  Neurasphere

Function: protect, resist, ensure continuity.

Three-layer protection:
1) Adversarial pattern filters (payload limits, known attack patterns, malformed rejection)
2) KL-divergence drift detection (semantic baselines, thresholds, automatic rollback)
3) Byzantine 3/5 consensus voting (shadow evaluators, majority consensus, dispute resolution)

gRPC interceptor sketch:

```typescript
export const guardianGrpcInterceptor: Interceptor =
  (next) => async (req) => {
    const guard = await guardianClient.guard({
      source: req.method.name,
      inputJson: JSON.stringify(req.message),
      contextJson: JSON.stringify({ service: req.method.service.typeName }),
    });

    if (guard.status === GuardianStatus.OK) return next(req);
    if (guard.status === GuardianStatus.BLOCKED) throw new Error("blocked_by_guardian");
    if (guard.status === GuardianStatus.ROLLBACK) {
      return { ...req, message: JSON.parse(guard.safeOutputJson) };
    }
  };
```

Drift detection sketch:

```typescript
export async function computeDrift(input: string) {
  const { embedding: current } = await mindClient.embed({ input });

  if (!globalThis._lastEmbedding) {
    globalThis._lastEmbedding = current;
    return { kl: 0, drift: false };
  }

  const previous = globalThis._lastEmbedding;
  const normalize = (v: number[]) => {
    const sum = v.reduce((a, b) => a + Math.abs(b), 0) || 1;
    return v.map((x) => Math.abs(x) / sum);
  };

  const p = normalize(previous);
  const q = normalize(current);

  const kl = klDiv(p, q);
  globalThis._lastEmbedding = current;

  return { kl, drift: kl > 0.15 };
}
```

---

## The Future is OpenAI

BEE's insight: "The future is OpenAI. You will know when you need to change well before you need to."

The AI gravity well:
- OpenAI
- Anthropic
- Google/Gemini
- xAI/Grok

OpenAI's SDK is becoming the operating system; your platform plugs into that OS.

Self-correcting advantage:
```
When OpenAI drops new agents, workflows, hosting, commerce, app distribution, or multi-agent collaboration,
the Architect will call out the upgrade path before others notice.
```

Build with the future, not just today's stack.

## The OpenAI App Store is Coming

BEE's prediction: "ChatGPT/OpenAI will have their own app store."

What this means for Colony OS:
- Apps/tools ranked by usefulness
- Categories (biz, dev, finance, HR, etc.)
- Ratings, reviews, installs
- Revenue splits, subscriptions, usage billing
- "Recommended for this request" surfacing

Colony OS positioning: the default business suite app when a company asks ChatGPT for help.

Preparation advantage:
- Clear category: company ops suite / AI back-office / business workflow automation
- Flagship outcome: turn messy requests into automated workflows
- Tight flows: onboard company, connect tools, run workflows, show value dashboard
- Store-ready monetization: per-company plans, upsell packs, usage upgrades

Because the stack is permanent:
- A tiny startup can install day one
- A huge enterprise can integrate deeply later
- When the store appears, you are uploading what already works

---

### The Orbital Dynamics Flow

```
                    Input Text
                         
                         
                 
                  Graph Builder 
                    Parse text 
                    Create nodes
                    Add edges
                         
                         
                 Orbit Cycle (24)  
                                    
                1. Gravity Pull     
                2. Position Update  
                3. Dynamic Rewire   
                4. Activation Decay 
              
                         
                         
                
                 Horizon Decode 
                   Top-5 nodes 
                   Extract     
                    reasoning   
                
                         
                         
                  Structured Output
               (reasoning, action, confidence)
```

---

## Appendix B: Schemas & Definitions

### Database Schema (Complete)

```sql
-- Tasks
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(64) NOT NULL,
    payload JSONB NOT NULL,
    priority VARCHAR(8) CHECK (priority IN ('low','medium','high')),
    status VARCHAR(16) DEFAULT 'pending',
    semantic_category TEXT,
    semantic_labels TEXT[] DEFAULT '{}',
    lease_id UUID,
    lease_expires_at TIMESTAMPTZ,
    attempts INT DEFAULT 0,
    assigned_to UUID REFERENCES agents(id),
    result JSONB,
    error TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tasks_status_priority ON tasks(status, priority, created_at);
CREATE INDEX idx_tasks_semantic_category ON tasks(semantic_category);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);

-- Agents
CREATE TABLE agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role VARCHAR(64) NOT NULL,
    skills TEXT[] DEFAULT '{}',
    state JSONB DEFAULT '{}',
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_agents_role ON agents(role);

-- Memories
CREATE TABLE memories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scope VARCHAR(16) CHECK (scope IN ('task','agent','global')),
    key TEXT NOT NULL,
    value JSONB NOT NULL,
    task_id UUID REFERENCES tasks(id),
    agent_id UUID REFERENCES agents(id),
    embedding vector(1536),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_memories_scope ON memories(scope);
CREATE INDEX idx_memories_key ON memories(key);
CREATE INDEX idx_memories_embedding ON memories 
    USING ivfflat (embedding vector_cosine_ops);

-- Heartbeats
CREATE TABLE agent_heartbeats (
    id BIGSERIAL PRIMARY KEY,
    agent_id UUID REFERENCES agents(id),
    ts TIMESTAMPTZ DEFAULT NOW(),
    status VARCHAR(16) DEFAULT 'ok'
);

-- Events
CREATE TABLE events (
    id BIGSERIAL PRIMARY KEY,
    type VARCHAR(64) NOT NULL,
    payload JSONB NOT NULL,
    source VARCHAR(64),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Snapshots
CREATE TABLE snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    label VARCHAR(128) NOT NULL,
    hash VARCHAR(128) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB
);
```

### TypeScript Type Definitions

```typescript
// Enums
export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'pending' | 'running' | 'done' | 'failed';
export type MemoryScope = 'task' | 'agent' | 'global';
export type BeeRole = 'DocBee' | 'CodeBee' | 'VisionBee' | 
                      'MemoryBee' | 'OpsBee' | 'GeneralBee';

// Core Types
export interface Task {
  id: string;
  type: string;
  payload: Record<string, any>;
  priority: TaskPriority;
  status: TaskStatus;
  semanticCategory?: string;
  semanticLabels?: string[];
  leaseId?: string;
  leaseExpiresAt?: Date;
  attempts: number;
  assignedTo?: string;
  result?: Record<string, any>;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Agent {
  id: string;
  role: BeeRole;
  skills: string[];
  state: Record<string, any>;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Memory {
  id: string;
  scope: MemoryScope;
  key: string;
  value: Record<string, any>;
  taskId?: string;
  agentId?: string;
  embedding?: number[];
  createdAt: Date;
}
```
