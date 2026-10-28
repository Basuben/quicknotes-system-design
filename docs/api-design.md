# QuickNotes API Design

This is the design of the real QuickNotes API, the one a production version of the app would call. It is not the JSONPlaceholder practice API used by the client in this repo.

Base URL: `https://api.quicknotes.example/v1`
All requests and responses use JSON. Protected endpoints need the header `Authorization: Bearer <token>`.

## Endpoints

| Method | Path | Description | Success status |
|--------|------|-------------|----------------|
| POST | `/auth/login` | Log in with email and password and receive a token | 200 OK |
| GET | `/notes` | List the logged in user's notes (supports `?limit=`, `?page=` and `?tag=`) | 200 OK |
| POST | `/notes` | Create a new note | 201 Created |
| GET | `/notes/{id}` | Get one note by id | 200 OK |
| PUT | `/notes/{id}` | Replace a note's title, body and tags | 200 OK |
| DELETE | `/notes/{id}` | Delete a note | 204 No Content |
| GET | `/tags` | List the user's tags | 200 OK |
| POST | `/notes/{id}/tags` | Attach a tag to a note | 201 Created |

## Create a note

`POST /notes`

Request:

```json
{
  "title": "Buy milk",
  "body": "Two litres of fresh milk on the way home.",
  "tags": ["errands", "home"]
}
```

Response `201 Created`:

```json
{
  "id": 4821,
  "title": "Buy milk",
  "body": "Two litres of fresh milk on the way home.",
  "tags": ["errands", "home"],
  "user_id": 17,
  "created_at": "2026-10-28T09:15:00Z",
  "updated_at": "2026-10-28T09:15:00Z"
}
```

## List notes

`GET /notes?limit=2&page=1`

Response `200 OK`:

```json
{
  "page": 1,
  "limit": 2,
  "total": 37,
  "notes": [
    {
      "id": 4821,
      "title": "Buy milk",
      "body": "Two litres of fresh milk on the way home.",
      "tags": ["errands", "home"],
      "created_at": "2026-10-28T09:15:00Z"
    },
    {
      "id": 4790,
      "title": "Project ideas",
      "body": "Try a reading list app.",
      "tags": ["ideas"],
      "created_at": "2026-10-27T18:02:41Z"
    }
  ]
}
```

## Error status codes

| Status | Meaning | When it happens |
|--------|---------|-----------------|
| 400 Bad Request | The request is malformed or fails validation | Missing title, or a title longer than 100 characters |
| 401 Unauthorized | No valid login | Missing, expired or wrong token |
| 403 Forbidden | Logged in but not allowed | Trying to read or delete another user's note |
| 404 Not Found | The resource does not exist | `GET /notes/999999` for an id that is not there |
| 500 Internal Server Error | Something broke on the server | Database down or an unexpected bug |

Every error uses the same body shape, so the client can handle all of them in one place:

```json
{
  "error": {
    "status": 400,
    "code": "validation_failed",
    "message": "The title is required and must be 100 characters or fewer.",
    "field": "title"
  }
}
```
