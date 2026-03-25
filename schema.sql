-- ============================================================
-- Majlis Kesyukuran Perkahwinan Muhsin & Syaqiela
-- Run this SQL in your Neon project → SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS rsvp (
  id         SERIAL       PRIMARY KEY,
  name       TEXT         NOT NULL,
  phone      TEXT         NOT NULL,
  attending  VARCHAR(3)   NOT NULL CHECK (attending IN ('yes', 'no')),
  guests     INTEGER      NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wishes (
  id         SERIAL      PRIMARY KEY,
  name       TEXT        NOT NULL,
  type       VARCHAR(10) NOT NULL DEFAULT 'wish' CHECK (type IN ('wish', 'doa', 'photo')),
  text       TEXT,
  photo_data TEXT,
  caption    TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
  id         SERIAL      PRIMARY KEY,
  name       TEXT        NOT NULL,
  text       TEXT        NOT NULL,
  sig        TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for faster admin queries
CREATE INDEX IF NOT EXISTS idx_rsvp_attending   ON rsvp    (attending);
CREATE INDEX IF NOT EXISTS idx_rsvp_created     ON rsvp    (created_at);
CREATE INDEX IF NOT EXISTS idx_wishes_type      ON wishes  (type);
CREATE INDEX IF NOT EXISTS idx_wishes_created   ON wishes  (created_at);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at);
