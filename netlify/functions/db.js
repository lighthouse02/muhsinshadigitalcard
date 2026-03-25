'use strict';
const { neon } = require('@neondatabase/serverless');

let _sql;
function getDb() {
  // Netlify-native Neon integration sets NETLIFY_DATABASE_URL;
  // fall back to DATABASE_URL for manual / self-hosted setups.
  const url = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL;
  if (!_sql) _sql = neon(url);
  return _sql;
}

module.exports = { getDb };
