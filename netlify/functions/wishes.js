'use strict';
const { getDb } = require('./db');

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'muhsin2026admin';

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Key',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, PATCH, OPTIONS',
  'Content-Type': 'application/json',
};

function sanitize(s, max) {
  return String(s || '').replace(/<[^>]*>/g, '').trim().slice(0, max || 400);
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: CORS, body: '' };

  const sql = getDb();

  try {
    // ── POST: submit wish (public) ──────────────────────────────
    if (event.httpMethod === 'POST') {
      const body    = JSON.parse(event.body || '{}');
      const name    = sanitize(body.name, 100);
      const type    = ['wish', 'photo', 'doa'].includes(body.type) ? body.type : 'wish';
      const text    = sanitize(body.text, 400) || null;
      // Cap photo at ~2 MB to avoid Netlify function body limit
      const photo   = body.photoDataUrl ? String(body.photoDataUrl).slice(0, 2_000_000) : null;
      const caption = sanitize(body.caption, 200) || null;

      if (!name) return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Missing name' }) };

      await sql`
        INSERT INTO wishes (name, type, text, photo_data, caption)
        VALUES (${name}, ${type}, ${text}, ${photo}, ${caption})
      `;
      return { statusCode: 201, headers: CORS, body: JSON.stringify({ ok: true }) };
    }

    // ── GET: list all wishes (public — used by wall.html) ───────
    if (event.httpMethod === 'GET') {
      const rows = await sql`
        SELECT id, name, type, text, photo_data, caption, created_at
        FROM wishes ORDER BY created_at ASC
      `;
      const mapped = rows.map(r => ({
        id:           r.id,
        name:         r.name,
        type:         r.type,
        text:         r.text,
        photoDataUrl: r.photo_data,
        caption:      r.caption,
        time:         new Date(r.created_at).getTime(),
      }));
      return { statusCode: 200, headers: CORS, body: JSON.stringify(mapped) };
    }

    // ── PATCH: edit wish text (admin only) ──────────────────────
    if (event.httpMethod === 'PATCH') {
      if ((event.headers['x-admin-key'] || '') !== ADMIN_SECRET) {
        return { statusCode: 401, headers: CORS, body: JSON.stringify({ error: 'Unauthorized' }) };
      }
      const id = parseInt((event.queryStringParameters || {}).id);
      if (!id) return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Missing id' }) };
      const body = JSON.parse(event.body || '{}');
      const text = sanitize(body.text, 400);
      await sql`UPDATE wishes SET text = ${text} WHERE id = ${id}`;
      return { statusCode: 200, headers: CORS, body: JSON.stringify({ ok: true }) };
    }

    // ── DELETE: delete wish (admin only) ────────────────────────
    if (event.httpMethod === 'DELETE') {
      if ((event.headers['x-admin-key'] || '') !== ADMIN_SECRET) {
        return { statusCode: 401, headers: CORS, body: JSON.stringify({ error: 'Unauthorized' }) };
      }
      const id = parseInt((event.queryStringParameters || {}).id);
      if (!id) return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Missing id' }) };
      await sql`DELETE FROM wishes WHERE id = ${id}`;
      return { statusCode: 200, headers: CORS, body: JSON.stringify({ ok: true }) };
    }

    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: 'Method not allowed' }) };
  } catch (err) {
    console.error('wishes error:', err);
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'Database error' }) };
  }
};
