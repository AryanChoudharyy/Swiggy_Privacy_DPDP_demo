# Swiggy Privacy Center API Contract

This prototype uses local React state only. A production implementation would need authenticated APIs, consent-policy versioning, immutable audit logs, processor sync, and legal review.

## 1. Get Consent State

- Method: `GET`
- Path: `/api/privacy/consents`
- Request: authenticated user session
- Response:

```json
{
  "userId": "usr_123",
  "noticeVersion": "dpdp-in-v1",
  "purposes": [
    {
      "purpose": "personalisation",
      "status": "granted",
      "required": false,
      "updatedAt": "2026-07-03T12:20:00+05:30"
    }
  ],
  "essentialProcessing": ["delivery", "payments", "fraud_prevention", "support"]
}
```

- DPDP obligation: clear notice, specific consent, purpose limitation, accountability.

## 2. Update Consent State

- Method: `PATCH`
- Path: `/api/privacy/consents`
- Request:

```json
{
  "noticeVersion": "dpdp-in-v1",
  "changes": [
    {
      "purpose": "marketing",
      "status": "withdrawn"
    }
  ],
  "source": "privacy_center"
}
```

- Response:

```json
{
  "success": true,
  "consentEventId": "cevt_123",
  "updatedPurposes": [
    {
      "purpose": "marketing",
      "status": "withdrawn",
      "updatedAt": "2026-07-03T12:22:00+05:30"
    }
  ]
}
```

- DPDP obligation: easy withdrawal, affirmative consent record, purpose limitation, accountability.

## 3. Get Marketing Preferences

- Method: `GET`
- Path: `/api/privacy/marketing-preferences`
- Request: authenticated user session
- Response:

```json
{
  "channels": {
    "push": true,
    "email": false,
    "sms": false,
    "whatsapp": false,
    "partnerOffers": false
  },
  "serviceMessagesUnaffected": ["order_updates", "payment_status", "safety_alerts", "legal_notices"]
}
```

- DPDP obligation: specific consent and transparent purpose-level control for promotional processing.

## 4. Update Marketing Preferences

- Method: `PATCH`
- Path: `/api/privacy/marketing-preferences`
- Request:

```json
{
  "channel": "email",
  "enabled": false,
  "source": "privacy_center"
}
```

- Response:

```json
{
  "success": true,
  "preferenceEventId": "pref_123",
  "channel": "email",
  "enabled": false,
  "updatedAt": "2026-07-03T12:23:00+05:30"
}
```

- DPDP obligation: withdrawal as easy as giving consent; purpose-specific consent management.

## 5. Get Location Preference

- Method: `GET`
- Path: `/api/privacy/location-preference`
- Request: authenticated user session
- Response:

```json
{
  "mode": "saved_address",
  "nearbyOffersEnabled": false,
  "osPermissionStatus": "not_available_to_server"
}
```

- DPDP obligation: data minimisation, purpose limitation, transparency around optional location use.

## 6. Update Location Preference

- Method: `PATCH`
- Path: `/api/privacy/location-preference`
- Request:

```json
{
  "mode": "manual",
  "nearbyOffersEnabled": false,
  "source": "privacy_center"
}
```

- Response:

```json
{
  "success": true,
  "locationPreferenceEventId": "loc_123",
  "mode": "manual",
  "nearbyOffersEnabled": false,
  "updatedAt": "2026-07-03T12:24:00+05:30"
}
```

- DPDP obligation: data minimisation and purpose-limited processing.

## 7. Create Data Export Request

- Method: `POST`
- Path: `/api/privacy/data-exports`
- Request:

```json
{
  "include": ["profile", "saved_addresses", "order_history", "consent_history", "marketing_preferences"],
  "source": "privacy_center"
}
```

- Response:

```json
{
  "requestId": "EXP-123456",
  "status": "pending",
  "createdAt": "2026-07-03T12:25:00+05:30"
}
```

- DPDP obligation: Data Principal right to access information about personal data and processing.

## 8. Get Export Request Status

- Method: `GET`
- Path: `/api/privacy/data-exports/{requestId}`
- Request: authenticated user session plus request ID ownership check
- Response:

```json
{
  "requestId": "EXP-123456",
  "status": "ready",
  "downloadUrl": "https://downloads.example.com/expiring-token",
  "expiresAt": "2026-07-04T12:25:00+05:30"
}
```

- DPDP obligation: transparent fulfilment of access requests with security safeguards.

## 9. Create Deletion Request

- Method: `POST`
- Path: `/api/privacy/deletion-requests`
- Request:

```json
{
  "acknowledgedConsequences": true,
  "source": "privacy_center"
}
```

- Response:

```json
{
  "requestId": "DEL-123456",
  "status": "pending",
  "createdAt": "2026-07-03T12:26:00+05:30",
  "retentionNotice": "Some records may be retained where legally required."
}
```

- DPDP obligation: erasure request handling, withdrawal consequences, storage limitation, accountability.

## 10. Get Deletion Request Status

- Method: `GET`
- Path: `/api/privacy/deletion-requests/{requestId}`
- Request: authenticated user session plus request ID ownership check
- Response:

```json
{
  "requestId": "DEL-123456",
  "status": "pending",
  "blockedBy": ["active_refund"],
  "lastUpdatedAt": "2026-07-03T12:27:00+05:30"
}
```

- DPDP obligation: grievance transparency, erasure workflow accountability, storage limitation.

## 11. Get Consent History

- Method: `GET`
- Path: `/api/privacy/consent-history`
- Request query:

```json
{
  "cursor": "hist_cursor_abc",
  "limit": 20,
  "type": "marketing"
}
```

- Response:

```json
{
  "items": [
    {
      "eventId": "hist_123",
      "type": "marketing",
      "title": "Email offers disabled",
      "purpose": "email_marketing",
      "status": "withdrawn",
      "source": "privacy_center",
      "createdAt": "2026-07-03T12:28:00+05:30"
    }
  ],
  "nextCursor": "hist_cursor_def"
}
```

- DPDP obligation: accountability, consent proof, easy review of consent/withdrawal history.
