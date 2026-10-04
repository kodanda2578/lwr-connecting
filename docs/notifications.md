# LAUGHS WITH RAMESH CONNECTING — AI + Mentor + Notification Architecture

---

## 1. Overview & System Design

The **Laughs With Ramesh Connecting** notification and guidance upgrade combines **LWR AI assistance**, **escalation to Ramesh (human mentor)**, **in-app real-time notification bells**, and **configurable transactional HTML email delivery**.

```mermaid
graph TD
    Student[Student Chatting in LWR AI] --> EscalationCheck{Escalation Needed?}
    EscalationCheck -- Yes --> AI_Summary[Generate AI Conversation Summary]
    AI_Summary --> MentorRequest[Create MentorRequest Record (Status: OPEN)]
    
    MentorRequest --> AdminNotif[Create In-App Admin Notification 🔔]
    MentorRequest --> MentorEmail[Send Ramesh Notification Email 📧]
    
    Admin[Ramesh Admin Dashboard] --> MentorInbox[Mentor Inbox View]
    MentorInbox --> ReplyAction[Ramesh Replies to Student]
    
    ReplyAction --> StudentNotif[Create In-App Student Notification 🔔]
    ReplyAction --> StudentEmail[Send Student Mentor Reply Email 📧]
```

---

## 2. AI Escalation & Mentor Request Flow

1. **Trigger Criteria**:
   - Explicit student request (*"I want to talk to Ramesh"*, *"I need human mentor help"*).
   - Answer insufficiency (*"This AI response was not helpful"*).
   - Complex individualized guidance query (e.g. rank choice filling strategy).
2. **AI Summary Generation**:
   - Aggregates student's target exam, rank, preferred branch, location, and latest question.
   - Appends warning label: `AI-generated summary — verify before relying on it.`
3. **MentorRequest Entity**:
   - `id`, `student` (User relationship), `category`, `studentMessage`, `aiConversationSummary`, `priority`, `status` (`OPEN`, `IN_PROGRESS`, `WAITING_FOR_STUDENT`, `RESOLVED`, `CLOSED`), `assignedMentorId`, `createdAt`, `updatedAt`, `resolvedAt`.

---

## 3. Ramesh Mentor Inbox & Messaging System

- **Location**: Admin Dashboard → **Mentor Inbox** tab.
- **Features**: Filter requests by status, view AI summary & original question, send direct response as Ramesh.
- **Messaging API**: `GET /api/messages` and `POST /api/messages` store conversation history between student and Ramesh with `isRead` tracking.

---

## 4. Transactional Email Service & Idempotency

- **Abstraction**: `EmailService` interface + `EmailServiceImpl` supporting configurable provider via environment variables (`EMAIL_PROVIDER`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`, `MENTOR_NOTIFICATION_EMAIL`).
- **Idempotency Protection**: Every broadcast email checks `EmailEvent` database table for existing `idempotencyKey` before dispatching. Prevents duplicate emails from page refreshes or API retries.
- **Fault Tolerance**: Email provider failures run asynchronously and do not block main application database operations or user actions.

---

## 5. Notification Types & Email Preferences

| Event Type | Subject / Notification Title | In-App Bell | Default Email Preference |
|---|---|---|---|
| Welcome Registration | Welcome to Laughs With Ramesh Connecting 🎓 | Yes | Essential (Always On) |
| New Mock Test | New Mock Test Available 📝 | Yes | ☑ Opt-out available |
| New Study Material | New Study Material Available 📚 | Yes | ☑ Opt-out available |
| New Video | New Learning Video Available 🎥 | Yes | ☑ Opt-out available |
| Announcement | Important Announcement | Yes | ☑ Opt-out available |
| Ramesh Reply | Ramesh replied to your doubt 💬 | Yes | ☑ Opt-out available |
| Doubt Session Scheduled | Your Doubt Session is Scheduled 📅 | Yes | ☑ Opt-out available |

---

## 6. Security & Privacy Considerations

- **Access Controls**: Students can only query their own mentor requests (`/api/mentor-requests`), notifications (`/api/notifications`), and messaging threads (`/api/messages`).
- **Admin Authorization**: Admin endpoints `/api/admin/**` and global mentor request inbox strictly enforce `@PreAuthorize("hasRole('ADMIN')")`.
- **API Key Safety**: API keys & SMTP passwords are configured via environment variables and never exposed to client-side bundles.
