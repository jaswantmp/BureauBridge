# CaseMind AI

**Intelligent Institution Complaint Monitoring and Cross-Bureau Coordination**

> “One institution. Connected cases. Smarter coordination.”

### SIH 2026 Problem Statement
**AICTE Integrated Institution Complaint Monitoring and Status Dashboard**

---

## Overview

**CaseMind AI** is an intelligent complaint monitoring, institutional registry, and cross-bureau coordination platform developed for Smart India Hackathon (SIH) 2026.

It provides regulatory bodies like AICTE with unified institutional visibility, detecting overlapping complaints across autonomous bureaus, preventing redundant document requests, and facilitating real-time inter-bureau coordination.

### Key Capabilities

1. **Executive Command Centre**: Unified multi-bureau telemetry, SLA health tracking, conflict heatmaps, and workload distribution.
2. **Institution Registry**: Deduplicated directory of AICTE-approved institutions with alias tracking and multi-bureau case histories.
3. **Complaint Management Portal**: Intelligent grievance intake, classification, officer queue allocation, and audit timelines.
4. **Conflict Intelligence Engine**: Rule-based detection of cross-bureau case overlaps, duplicate document demand alerts, and evidence investigation.
5. **Bureau Coordination Inbox**: Inter-bureau communication threads, action alignment, and joint resolution tracking.

---

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React, Recharts, Sonner
- **State & Persistence**: Context API + `useReducer` with browser `localStorage` persistence
- **Architecture**: Single-page application with mock demonstration dataset

---

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation & Local Development

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the local development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

---

## Demo Notice

This is an offline frontend demonstration built for Smart India Hackathon 2026. All institution records, grievance cases, officers, and statistics in the demonstration state are fictional and do not connect to live AICTE production servers.