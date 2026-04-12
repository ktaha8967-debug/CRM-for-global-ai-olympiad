# GAIO Global CRM - API Documentation v1.0

This documentation outlines the data structures and endpoints required for external websites to push registration data into the GAIO Command Center.

## Base URL
`https://api.gaio.uk/v1` (Production)
`https://staging-api.gaio.uk/v1` (Development)

## Authentication
All requests must include a Secure Bearer Token in the header:
```http
Authorization: Bearer YOUR_API_GATEWAY_TOKEN
Content-Type: application/json
```

---

## 1. Sponsor & Partner Registration
**Endpoint:** `POST /sponsors/register`

### Request Body
| Field | Type | Description |
| :--- | :--- | :--- |
| `name` | string | Legal name of the organization |
| `tier` | string | One of: `Global Partner`, `Technology Partner`, `Regional Sponsor` |
| `industry` | string | Sector (e.g., AI, Education, Finance) |
| `funding` | string | Committed funding amount (e.g., "$50,000") |

### Example Payload
```json
{
  "name": "NeuroCore AI",
  "tier": "Technology Partner",
  "industry": "Computing",
  "funding": "$150,000"
}
```

---

## 2. National Organiser Application
**Endpoint:** `POST /organisers/apply`

### Request Body
| Field | Type | Description |
| :--- | :--- | :--- |
| `name` | string | Name of the organizing body/entity |
| `country` | string | Country of operation |
| `contact` | string | Primary contact person name |
| `email` | string | Official communication email |

### Example Payload
```json
{
  "name": "Nordic AI Council",
  "country": "Norway",
  "contact": "Erik Johansen",
  "email": "erik@nordic-ai.no"
}
```

---

## 3. Volunteer Network Application
**Endpoint:** `POST /volunteers/join`

### Request Body
| Field | Type | Description |
| :--- | :--- | :--- |
| `name` | string | Full legal name of the candidate |
| `university` | string | Educational institution |
| `email` | string | Personal email address |
| `phone` | string | Contact number with country code |
| `skills` | array | List of strings (e.g., ["Python", "Logistics"]) |
| `availability` | string | Working hours/days |
| `experience` | string | Summary of relevant experience |

### Example Payload
```json
{
  "name": "Sophia Martinez",
  "university": "MIT",
  "email": "s.martinez@mit.edu",
  "phone": "+1 617 555 0199",
  "skills": ["AI Ethics", "Event Management"],
  "availability": "Full-time during July",
  "experience": "Coordinated 2 regional hackathons in 2025."
}
```

---

## Implementation Example (JavaScript/Next.js)

If you are sending data from an external React/Next.js website, use the following logic:

```javascript
const registerSponsor = async (data) => {
  try {
    const response = await fetch('https://api.gaio.uk/v1/sponsors/register', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer gaio_live_xxxxxxxxxxxx',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (response.ok) {
      console.log('Synchronized with GAIO CRM successfully');
    }
  } catch (error) {
    console.error('GAIO Sync Error:', error);
  }
};
```

## Response Codes
*   `201 Created`: Data successfully provisioned in GAIO CRM.
*   `400 Bad Request`: Missing required fields or invalid data structure.
*   `401 Unauthorized`: Invalid or expired API Gateway Token.
*   `500 Server Error`: Internal GAIO infrastructure issue.
