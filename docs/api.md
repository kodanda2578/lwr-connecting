# LAUGHS WITH RAMESH CONNECTING — REST API Specification

---

## Base URL
`/api`

## Authentication Header
`Authorization: Bearer <JWT_TOKEN>`

---

## 1. Authentication & Multi-Step Onboarding APIs
- `POST /api/auth/register` — Step 1: Register initial student account (`PENDING_VERIFICATION`)
- `POST /api/auth/send-email-otp` — Send 6-digit email OTP (with 60s cooldown & 10 min expiry)
- `POST /api/auth/verify-email-otp` — Verify email OTP and mark `emailVerified = true`
- `POST /api/auth/send-mobile-otp` — Send 6-digit mobile OTP via configurable `SmsService`
- `POST /api/auth/verify-mobile-otp` — Verify mobile OTP and mark `mobileVerified = true`
- `POST /api/auth/complete-profile` — Save academic & location details and mark `accountStatus = ACTIVE`
- `POST /api/auth/login` — Authenticate & receive JWT + onboarding status redirect guidance
- `GET /api/auth/me` — Token verification & user onboarding state endpoint

## 2. College & Cutoff Discovery APIs
- `GET /api/colleges` — Browse colleges
- `POST /api/college-predictor` — Find matching historical colleges
- `POST /api/rank-estimator` — Estimate rank with non-official disclaimer

## 3. LWR AI & Mentor Escalation APIs
- `POST /api/ai/chat` — Query LWR AI assistant
- `POST /api/mentor-requests` — Escalate to Ramesh (creates `MentorRequest`, in-app admin notification, and email)
- `GET /api/mentor-requests` — Get requests (Admin sees all; Student sees own)
- `PUT /api/mentor-requests/{id}/status` — Update request status / send Ramesh reply

## 4. Notifications & Email Preferences APIs
- `GET /api/notifications` — Fetch user notifications
- `POST /api/notifications/{id}/read` — Mark notification read
- `GET /api/email-preferences` — Get student email preferences
- `PUT /api/email-preferences` — Update student email preferences

## 5. Admin & Notification Composer APIs
- `GET /api/admin/dashboard` — Platform overview metrics
- `POST /api/admin/colleges` — Create new college (persisted to database)
- `POST /api/admin/announcements/send` — Notification Composer broadcast API
