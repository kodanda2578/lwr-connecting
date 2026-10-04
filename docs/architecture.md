# LAUGHS WITH RAMESH CONNECTING — System Architecture & Specification

Tagline: **“One Platform. Complete B.Tech Guidance.”**

---

## 1. System Vision & Overview

**LAUGHS WITH RAMESH CONNECTING** is a complete, production-grade EdTech and student guidance platform built specifically for Intermediate (Class 11 & 12) students preparing for **JEE (Main & Advanced)** and **AP EAPCET (EAMCET)**, combining entrance exam preparation, online mock tests, rank estimation, cutoff analysis, LWR AI guidance, **human mentor escalation to Ramesh**, **in-app real-time notification center**, and **transactional email broadcasts**.

---

## 2. High-Level Architecture

```mermaid
graph TD
    Client[React + Vite + React Router SPA]
    
    subgraph Frontend Architecture
        Client --> UIComp[UI Component Library & Design System]
        Client --> StateMgmt[Auth & Notification State]
        Client --> Router[Protected & Admin Routes]
    end
    
    subgraph Backend Layer (REST API)
        Router --> API[Spring Boot REST Controllers]
        API --> Security[Spring Security & JWT Module]
        API --> ExamEngine[Mock Test Engine]
        API --> RankPredictor[Rank & Cutoff Matcher]
        API --> AIService[LWR AI Assistant Layer]
        API --> MentorService[Mentor Request & Escalation System]
        API --> EmailService[Configurable Transactional Email Service]
    end
    
    subgraph Data & Storage Layer
        API --> DB[(PostgreSQL Database)]
        EmailService --> EmailEvents[EmailEvent Audit & Idempotency Table]
    end
```

---

## 3. Technology Stack

### Frontend
- **Framework**: React 18+ (Vite)
- **Routing**: React Router DOM v6
- **Styling**: Modern Custom CSS Design System + Tailwind CSS, Glassmorphism, CSS Variables, Responsive layouts
- **Icons**: Lucide React Icons
- **HTTP Client**: Axios / Fetch with interceptors for JWT injection

### Backend
- **Framework**: Java Spring Boot 3.2+
- **Security**: Spring Security / JWT (JSON Web Tokens), BCrypt Password Hashing
- **Data Access**: Spring Data JPA / Hibernate
- **Email Architecture**: Transactional `EmailService` abstraction (SMTP / Resend / Log mode) with idempotency tracking

### Database
- **Database Engine**: PostgreSQL 15+
- **Entities**: users, roles, student_profiles, colleges, cutoff_records, questions, mock_tests, study_materials, videos, mentor_requests, notifications, email_preferences, email_events, messages, community_posts.

---

## 4. Implementation & Upgrade Status

- **Phase 1-20**: QA Audit passed cleanly (0 Critical/High defects).
- **AI + Mentor Upgrade**: LWR AI → Connect with Ramesh escalation modal, AI Summary with verification disclaimers, Mentor Inbox in Admin Dashboard, Notification Composer, In-App Notification Center, Email Preference Settings, and Email Delivery Idempotency.
