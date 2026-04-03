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
  return String(s || '').replace(/<[^>]*>/g, '').trim().slice(0, max || 200);
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: CORS, body: '' };

  const sql = getDb();

  try {
    // ── POST: submit RSVP (public) ──────────────────────────────
    if (event.httpMethod === 'POST') {
      const body     = JSON.parse(event.body || '{}');
      const attending = body.attending === 'yes' ? 'yes' : 'no';
      const name      = sanitize(body.name || 'Tetamu', 100);

      await sql`
        INSERT INTO rsvp (name, phone, attending, guests)
        VALUES (${name}, ${''}, ${attending}, ${0})
      `;
      return { statusCode: 201, headers: CORS, body: JSON.stringify({ ok: true }) };
    }

    // ── GET: public counts (?counts=1) or full list (admin only) ─
    if (event.httpMethod === 'GET') {
      // Public: return only aggregate counts
      if ((event.queryStringParameters || {}).counts === '1') {
        const rows = await sql`
          SELECT attending, COUNT(*) AS total FROM rsvp GROUP BY attending
        `;
        let hadir = 0, takHadir = 0;
        rows.forEach(r => {
          if (r.attending === 'yes') hadir = parseInt(r.total);
          else takHadir = parseInt(r.total);
        });
        return { statusCode: 200, headers: CORS, body: JSON.stringify({ hadir, takHadir }) };
      }

      if ((event.headers['x-admin-key'] || '') !== ADMIN_SECRET) {
        return { statusCode: 401, headers: CORS, body: JSON.stringify({ error: 'Unauthorized' }) };
      }
      const rows = await sql`
        SELECT id, name, phone, attending, guests, created_at
        FROM rsvp ORDER BY created_at ASC
      `;
      const mapped = rows.map(r => ({
        id:        r.id,
        name:      r.name,
        phone:     r.phone,
        attending: r.attending,
        guests:    r.guests,
        time:      new Date(r.created_at).getTime(),
      }));
      return { statusCode: 200, headers: CORS, body: JSON.stringify(mapped) };
    }

    // ── DELETE: remove RSVP by id (admin only) ──────────────────
    if (event.httpMethod === 'DELETE') {
      if ((event.headers['x-admin-key'] || '') !== ADMIN_SECRET) {
        return { statusCode: 401, headers: CORS, body: JSON.stringify({ error: 'Unauthorized' }) };
      }
      const id = parseInt((event.queryStringParameters || {}).id);
      if (!id) return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Missing id' }) };
      await sql`DELETE FROM rsvp WHERE id = ${id}`;
      return { statusCode: 200, headers: CORS, body: JSON.stringify({ ok: true }) };
    }

    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: 'Method not allowed' }) };
  } catch (err) {
    console.error('rsvp error:', err);
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'Database error' }) };
  }
};
