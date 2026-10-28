# QuickNotes System Design

QuickNotes is a small notes app. This project has two parts: a working browser client that lists, creates and deletes notes through a REST API, and three design documents that describe how the real QuickNotes backend would be built and scaled to 1 million users.

The client talks to the free practice API at `https://jsonplaceholder.typicode.com/posts`. That API answers like a real one but does not store what you send, so a note you create will not come back when you load the list again.

## How to run the API client

1. Download or clone this repository.
2. Open `index.html` in any modern browser. No install or build step is needed.
3. Click **Load notes** to fetch 10 notes.
4. Fill in the form and click **Add note** to create one. The title is required and can be up to 100 characters.
5. Click **Delete** on any note to remove it.

## Files

- `index.html`, `style.css`, `api.js`: the client
- `docs/api-design.md`: REST endpoints, example requests and responses, error codes
- `docs/data-model.md`: tables, relationships, SQL, example queries, index
- `docs/architecture.md`: requirements, load estimate, diagram, request flows, trade-offs

## Documentation

- [API design](docs/api-design.md)
- [Data model](docs/data-model.md)
- [Architecture](docs/architecture.md)

## What I learned

- Every request can fail, so each one needs a check on `response.ok`, a `try/catch`, and a clear message for the user. Putting this in one reusable `request()` function kept the code short.
- A good API design is mostly about being predictable: the same nouns in the paths, the right HTTP methods, honest status codes, and one error format everywhere.
- Many-to-many relationships need a join table, and an index that matches the most common query (a user's newest notes) matters more than adding indexes everywhere.
- Rough numbers help before drawing boxes. About 231 reads and 23 writes per second on average showed me the app is read heavy, which is why a cache and a read replica make sense.
- Every part of a system needs a plan for failing: more than one app server, a replica that can take over, and a queue that keeps jobs safe.
