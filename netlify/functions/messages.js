'use strict';
const { getDb } = require('./db');

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'muhsin2026admin';

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Key',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Content-Type': 'application/json',
};

function sanitize(s, max) {
  return String(s || '').replace(/<[^>]*>/g, '').trim().slice(0, max || 2000);
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: CORS, body: '' };

  const sql = getDb();

  try {
    // ── POST: submit private message (public from form) ─────────
    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const name = sanitize(body.name, 100);
      const text = sanitize(body.text, 2000);
      // Signature is a base64 data URL — cap at ~500 KB
      const sig  = body.sig ? String(body.sig).slice(0, 500_000) : null;

      if (!name || !text) {
        return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Missing name or text' }) };
      }

      await sql`
        INSERT INTO messages (name, text, sig)
        VALUES (${name}, ${text}, ${sig})
      `;
      return { statusCode: 201, headers: CORS, body: JSON.stringify({ ok: true }) };
    }

    // ── GET: list messages (admin only) ─────────────────────────
    if (event.httpMethod === 'GET') {
      if ((event.headers['x-admin-key'] || '') !== ADMIN_SECRET) {
        return { statusCode: 401, headers: CORS, body: JSON.stringify({ error: 'Unauthorized' }) };
      }
      const rows = await sql`
        SELECT id, name, text, sig, created_at
        FROM messages ORDER BY created_at ASC
      `;
      const mapped = rows.map(r => ({
        id:   r.id,
        name: r.name,
        text: r.text,
        sig:  r.sig,
        time: new Date(r.created_at).getTime(),
      }));
      return { statusCode: 200, headers: CORS, body: JSON.stringify(mapped) };
    }

    // ── DELETE: delete message (admin only) ─────────────────────
    if (event.httpMethod === 'DELETE') {
      if ((event.headers['x-admin-key'] || '') !== ADMIN_SECRET) {
        return { statusCode: 401, headers: CORS, body: JSON.stringify({ error: 'Unauthorized' }) };
      }
      const id = parseInt((event.queryStringParameters || {}).id);
      if (!id) return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Missing id' }) };
      await sql`DELETE FROM messages WHERE id = ${id}`;
      return { statusCode: 200, headers: CORS, body: JSON.stringify({ ok: true }) };
    }

    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: 'Method not allowed' }) };
  } catch (err) {
    console.error('messages error:', err);
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'Database error' }) };
  }
};
