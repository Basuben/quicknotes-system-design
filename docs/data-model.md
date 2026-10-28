# QuickNotes Data Model

## Entities

### users
| Column | Type | Key / notes |
|--------|------|-------------|
| id | INTEGER | Primary key |
| email | VARCHAR(255) | Unique, not null |
| password_hash | VARCHAR(255) | Not null |
| created_at | TIMESTAMP | Not null |

### notes
| Column | Type | Key / notes |
|--------|------|-------------|
| id | INTEGER | Primary key |
| user_id | INTEGER | Foreign key to users(id), not null |
| title | VARCHAR(100) | Not null |
| body | TEXT | Optional |
| created_at | TIMESTAMP | Not null |
| updated_at | TIMESTAMP | Not null |

### tags
| Column | Type | Key / notes |
|--------|------|-------------|
| id | INTEGER | Primary key |
| user_id | INTEGER | Foreign key to users(id), not null |
| name | VARCHAR(50) | Not null, unique per user |

### note_tags
| Column | Type | Key / notes |
|--------|------|-------------|
| note_id | INTEGER | Foreign key to notes(id), part of the primary key |
| tag_id | INTEGER | Foreign key to tags(id), part of the primary key |

## Relationships

**One-to-many.** One user has many notes, and each note belongs to exactly one user. The `user_id` column in `notes` holds that link. The same pattern applies between users and tags.

**Many-to-many.** One note can have many tags (a note can be both "errands" and "home"), and one tag can be on many notes. A database cannot store this with a single column, so the `note_tags` table sits in the middle. Each row says "this note has this tag", and its two foreign keys together form the primary key so the same pair cannot be added twice.

## CREATE TABLE statements

```sql
CREATE TABLE users (
  id            INTEGER PRIMARY KEY,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notes (
  id         INTEGER PRIMARY KEY,
  user_id    INTEGER NOT NULL,
  title      VARCHAR(100) NOT NULL,
  body       TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE tags (
  id      INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  name    VARCHAR(50) NOT NULL,
  UNIQUE (user_id, name),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE note_tags (
  note_id INTEGER NOT NULL,
  tag_id  INTEGER NOT NULL,
  PRIMARY KEY (note_id, tag_id),
  FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id)  REFERENCES tags(id)  ON DELETE CASCADE
);

CREATE INDEX idx_notes_user_created ON notes (user_id, created_at DESC);
```

## Example queries

1. The 10 newest notes for one user (this is what `GET /notes` runs):

```sql
SELECT id, title, body, created_at
FROM notes
WHERE user_id = 17
ORDER BY created_at DESC
LIMIT 10;
```

2. All notes that carry a given tag, using a JOIN across the three tables:

```sql
SELECT n.id, n.title
FROM notes n
JOIN note_tags nt ON nt.note_id = n.id
JOIN tags t       ON t.id = nt.tag_id
WHERE n.user_id = 17
  AND t.name = 'errands'
ORDER BY n.created_at DESC;
```

3. How many notes each tag has for a user:

```sql
SELECT t.name, COUNT(nt.note_id) AS note_count
FROM tags t
LEFT JOIN note_tags nt ON nt.tag_id = t.id
WHERE t.user_id = 17
GROUP BY t.name
ORDER BY note_count DESC;
```

## Index and why

`idx_notes_user_created` is an index on `notes (user_id, created_at DESC)`. Almost every read in the app asks for "this user's newest notes". Without the index the database would scan every note of every user and then sort them. With it, the database jumps straight to the user's rows, already in date order, and stops after the first 10.

## SQL or NoSQL?

I would choose SQL, such as PostgreSQL. The data is clearly structured and relational: users own notes, and notes and tags link in both directions. Joins, foreign keys and transactions keep that data consistent (for example, deleting a note also removes its tag links). The load is mostly simple reads and writes that one primary database with read replicas can handle for a long time. NoSQL would make more sense only if the app grew so large that one database could no longer hold the data, and by then sharding by user id would be possible in SQL too.
