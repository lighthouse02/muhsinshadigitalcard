'use strict';
const { getDb } = require('./db');

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'muhsin2026admin';

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Key',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: CORS, body: '' };
  if (event.httpMethod !== 'POST')    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: 'Method not allowed' }) };

  if ((event.headers['x-admin-key'] || '') !== ADMIN_SECRET) {
    return { statusCode: 401, headers: CORS, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  const sql = getDb();

  try {
    const body = JSON.parse(event.body || '{}');
    // Selective flush: { tables: ['rsvp','wishes','messages'] } or omit for all
    const all = ['rsvp', 'wishes', 'messages'];
    const tables = Array.isArray(body.tables) ? body.tables.filter(t => all.includes(t)) : all;

    const counts = {};
    for (const t of tables) {
      if (t === 'rsvp')     { const r = await sql`DELETE FROM rsvp`;     counts.rsvp     = r.count ?? 0; }
      if (t === 'wishes')   { const r = await sql`DELETE FROM wishes`;   counts.wishes   = r.count ?? 0; }
      if (t === 'messages') { const r = await sql`DELETE FROM messages`; counts.messages = r.count ?? 0; }
    }

    return { statusCode: 200, headers: CORS, body: JSON.stringify({ ok: true, deleted: counts }) };
  } catch (err) {
    console.error('flush error:', err);
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'Database error', detail: err.message }) };
  }
};
