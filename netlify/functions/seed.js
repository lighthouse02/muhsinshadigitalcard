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
    // ── Demo RSVP ──────────────────────────────────────────────
    const rsvpDemo = [
      { name: 'Ahmad Faris bin Razali',   phone: '0123456781', attending: 'yes', guests: 4, offset: 86400 * 8 },
      { name: 'Nurul Ain binti Kamarudin',phone: '0167890123', attending: 'yes', guests: 2, offset: 86400 * 7 },
      { name: 'Dr. Hakim Syafiq',         phone: '0112223344', attending: 'yes', guests: 3, offset: 86400 * 6 },
      { name: 'Zainab binti Yusoff',      phone: '0198887766', attending: 'yes', guests: 5, offset: 86400 * 5 },
      { name: 'Hafizuddin Malik',         phone: '0134445556', attending: 'yes', guests: 2, offset: 86400 * 5 },
      { name: 'Rania Izzatul Hayat',      phone: '0109998877', attending: 'yes', guests: 6, offset: 86400 * 4 },
      { name: 'Encik Azlan Nordin',       phone: '0155544433', attending: 'yes', guests: 3, offset: 86400 * 4 },
      { name: 'Syafiqah Nabilah',         phone: '0176665554', attending: 'yes', guests: 1, offset: 86400 * 3 },
      { name: 'Ustaz Ridhwan Fikri',      phone: '0133332221', attending: 'yes', guests: 4, offset: 86400 * 3 },
      { name: 'Fatimah Zahra binti Saad', phone: '0189990011', attending: 'yes', guests: 2, offset: 86400 * 2 },
      { name: 'Khairul Anwar',            phone: '0144455566', attending: 'no',  guests: 0, offset: 86400 * 2 },
      { name: 'Siti Mariam Junid',        phone: '0122211100', attending: 'yes', guests: 3, offset: 86400 * 1 },
      { name: 'Amirul Haziq',             phone: '0177788899', attending: 'no',  guests: 0, offset: 86400 * 1 },
      { name: 'Puan Rohani binti Daud',   phone: '0166677788', attending: 'yes', guests: 4, offset: 43200     },
      { name: 'Harith Iskandar Wafi',     phone: '0199900011', attending: 'yes', guests: 2, offset: 21600     },
    ];

    for (const r of rsvpDemo) {
      const ts = new Date(Date.now() - r.offset * 1000);
      await sql`
        INSERT INTO rsvp (name, phone, attending, guests, created_at)
        VALUES (${r.name}, ${r.phone}, ${r.attending}, ${r.guests}, ${ts})
      `;
    }

    // ── Demo Wishes ────────────────────────────────────────────
    const wishesDemo = [
      { name: 'Ahmad Faris',    type: 'wish', text: 'Barakallahu lakuma wa baraka \'alaykuma wa jama\'a baynakuma fi khayr. Tahniah Cin & Qiela! 🤍', offset: 86400 * 7 },
      { name: 'Fatimah Zahra',  type: 'doa',  text: 'Semoga rumah tangga Muhsin & Syaqiela diberkati Allah, sakinah mawaddah warahmah. Semoga kekal hingga ke syurga. 💛', offset: 86400 * 6 },
      { name: 'Dr. Hakim',      type: 'wish', text: 'May Allah shower Muhsin & Syaqiela with endless blessings, love and happiness. Wishing you both a lifetime of joy together.', offset: 86400 * 5 },
      { name: 'Ustaz Ridhwan',  type: 'doa',  text: 'اللَّهُمَّ بَارِكْ لَهُمَا وَبَارِكْ عَلَيْهِمَا وَاجْمَعْ بَيْنَهُمَا فِي خَيْرٍ. Aamiin ya Rabbal \'Aalamin. Tahniah Muhsin & Syaqiela.', offset: 86400 * 4 },
      { name: 'Hafizuddin',     type: 'wish', text: 'Tahniah Sen & Sya! Semoga majlis ini penuh barakah dan menjadi kenangan indah buat selamanya. 🌙', offset: 86400 * 3 },
      { name: 'Nurul Ain',      type: 'wish', text: 'Selamat pengantin baru Cin & Qiela! Doakan kami pula ya 😊💛', offset: 86400 * 3 },
      { name: 'Rania & family', type: 'wish', text: 'Came all the way from Kedah for Cin & Qiela — so worth it! Love you both! 🌸', offset: 86400 * 2 },
      { name: 'Encik Azlan',    type: 'wish', text: 'Congratulations Muhsin & Syaqiela! May your home always be filled with laughter, patience and endless love. 💐', offset: 86400 * 2 },
      { name: 'Syafiqah',       type: 'wish', text: 'Qiela, you look absolutely radiant today! Wishing you and Muhsin the most wonderful life ahead. 🌸', offset: 86400 * 1 },
      { name: 'Siti Mariam',    type: 'doa',  text: 'Ya Allah, kurniakanlah kepada mereka zuriat yang soleh solehah dan jadikanlah rumah tangga mereka syurga dunia. Aamiin.', offset: 43200 },
    ];

    for (const w of wishesDemo) {
      const ts = new Date(Date.now() - w.offset * 1000);
      await sql`
        INSERT INTO wishes (name, type, text, created_at)
        VALUES (${w.name}, ${w.type}, ${w.text}, ${ts})
      `;
    }

    // ── Demo Messages ──────────────────────────────────────────
    const msgsDemo = [
      { name: 'Ibu & Ayah',   text: 'Anakanda Muhsin, ibu dan ayah amat berbangga dengan kamu. Jaga isteri kamu baik-baik. Semoga kalian bahagia dunia akhirat. Kami sentiasa mendoakan kebahagian kalian. 🤍', offset: 86400 * 5 },
      { name: 'Abang Faiz',   text: 'Tahniah adik! Dah jadi orang dah kau sekarang haha. Jaga keluarga kau. Aku ada kalau kau perlukan aku. Love you bro.', offset: 86400 * 3 },
      { name: 'BFF Syaqiela', text: 'Qiela bestie!! I am SO happy for you today. You deserve every bit of this happiness. Muhsin, please take care of my bestie tau! 💛', offset: 86400 * 1 },
    ];

    for (const m of msgsDemo) {
      const ts = new Date(Date.now() - m.offset * 1000);
      await sql`
        INSERT INTO messages (name, text, created_at)
        VALUES (${m.name}, ${m.text}, ${ts})
      `;
    }

    return { statusCode: 200, headers: CORS, body: JSON.stringify({ ok: true, seeded: { rsvp: rsvpDemo.length, wishes: wishesDemo.length, messages: msgsDemo.length } }) };
  } catch (err) {
    console.error('seed error:', err);
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'Database error', detail: err.message }) };
  }
};
