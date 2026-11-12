/* ============================================================
   Demo dashboard — runs FIRST, before every other script.
   ------------------------------------------------------------
   1. DemoStore: an in-memory stand-in for localStorage. The copied
      Measures scripts read/write `DemoStore` instead of localStorage,
      so a refresh always starts the demo fresh and nothing is kept
      on the visitor's phone.
   2. window.DEMO: language (from the URL: /demo-dashboard/es|en|hi/),
      the teacher persona, the school and the name lists the seeded
      class is built from (tilli-api.js → HERO_SCHOOLS reads these).
   ============================================================ */
(function () {
  'use strict';

  // ---------- 1. in-memory storage (same API as localStorage) ----------
  var mem = {};
  window.DemoStore = {
    getItem: function (k) { return Object.prototype.hasOwnProperty.call(mem, k) ? mem[k] : null; },
    setItem: function (k, v) { mem[k] = String(v); },
    removeItem: function (k) { delete mem[k]; },
    clear: function () { mem = {}; },
    key: function (i) { return Object.keys(mem)[i] || null; },
    get length() { return Object.keys(mem).length; },
  };

  // ---------- 2. language from the path ----------
  var m = location.pathname.match(/\/demo-dashboard\/(es|en|hi)(\/|$)/);
  var lang = m ? m[1] : 'es';

  var IN_F = ['Aanya', 'Diya', 'Ira', 'Kavya', 'Meera', 'Navya', 'Riya', 'Saanvi', 'Tara', 'Zara', 'Anika', 'Myra', 'Prisha', 'Aadhya'];
  var IN_M = ['Aarav', 'Arjun', 'Dhruv', 'Ishaan', 'Kabir', 'Reyansh', 'Vihaan', 'Yash', 'Advik', 'Kian', 'Rohan', 'Krish', 'Vivaan', 'Neel'];
  var IN_L = ['Sharma', 'Iyer', 'Nair', 'Menon', 'Reddy', 'Rao', 'Shah', 'Desai', 'Pillai', 'Verma', 'Gupta', 'Joshi', 'Patel', 'Kulkarni', 'Mehta', 'Bose'];
  var IN_T = ['Anita', 'Deepa', 'Farah', 'Kavitha', 'Lakshmi', 'Nalini', 'Priya', 'Revathi', 'Shalini', 'Geetha', 'Sunita', 'Pooja', 'Neha', 'Rekha', 'Rohan', 'Vikram'];

  var PERSONAS = {
    es: {
      locale: 'es-ES', dir: 'ltr',
      teacher: { name: 'María Fernández', email: 'maria.fernandez@losalmendros.es', gender: 'Female' },
      school: { name: 'Colegio Los Almendros', city: 'Madrid', country: 'Spain', board: 'LOMLOE', domain: 'losalmendros.es', prefix: 'LA', code: 'ALMD-2611' },
      first_f: ['Lucía', 'Sofía', 'Martina', 'Paula', 'Valeria', 'Daniela', 'Carla', 'Alba', 'Noa', 'Julia', 'Sara', 'Emma', 'Olivia', 'Irene'],
      first_m: ['Hugo', 'Mateo', 'Martín', 'Lucas', 'Leo', 'Daniel', 'Alejandro', 'Pablo', 'Manuel', 'Álvaro', 'Adrián', 'Mario', 'Diego', 'Javier'],
      last: ['García', 'Martínez', 'López', 'Sánchez', 'Pérez', 'Gómez', 'Fernández', 'Ruiz', 'Díaz', 'Moreno', 'Muñoz', 'Romero', 'Navarro', 'Torres', 'Serrano', 'Ortega'],
      teachers: ['Carmen', 'Laura', 'Elena', 'Ana', 'Isabel', 'Pilar', 'Rosa', 'Marta', 'Cristina', 'Beatriz', 'Nuria', 'Silvia', 'Raquel', 'Teresa', 'Sergio', 'Javier'],
    },
    en: {
      locale: 'en-IN', dir: 'ltr',
      teacher: { name: 'Kiara Mehta', email: 'kiara.mehta@heritageoaks.edu', gender: 'Female' },
      school: { name: 'Heritage Oaks School', city: 'Bengaluru', country: 'India', board: 'CBSE', domain: 'heritageoaks.edu', prefix: 'HO', code: 'HROK-4410' },
      first_f: IN_F, first_m: IN_M, last: IN_L, teachers: IN_T,
    },
    hi: {
      locale: 'hi-IN', dir: 'ltr',
      teacher: { name: 'मनोज शर्मा', email: 'manoj.sharma@heritageoaks.edu', gender: 'Male' },
      school: { name: 'हेरिटेज ओक्स स्कूल', city: 'Bengaluru', country: 'India', board: 'CBSE', domain: 'heritageoaks.edu', prefix: 'HO', code: 'HROK-4410' },
      first_f: ['आन्या', 'दिया', 'इरा', 'काव्या', 'मीरा', 'नव्या', 'रिया', 'सान्वी', 'तारा', 'ज़ारा', 'अनिका', 'मायरा', 'प्रिशा', 'आध्या'],
      first_m: ['आरव', 'अर्जुन', 'ध्रुव', 'ईशान', 'कबीर', 'रेयांश', 'विहान', 'यश', 'अद्विक', 'कियान', 'रोहन', 'कृष', 'विवान', 'नील'],
      last: ['शर्मा', 'अय्यर', 'नायर', 'मेनन', 'रेड्डी', 'राव', 'शाह', 'देसाई', 'पिल्लई', 'वर्मा', 'गुप्ता', 'जोशी', 'पटेल', 'कुलकर्णी', 'मेहता', 'बोस'],
      teachers: ['अनीता', 'दीपा', 'फ़राह', 'कविता', 'लक्ष्मी', 'नलिनी', 'प्रिया', 'रेवती', 'शालिनी', 'गीता', 'सुनीता', 'पूजा', 'नेहा', 'रेखा', 'रोहन', 'विक्रम'],
    },
  };

  var P = PERSONAS[lang];
  window.DEMO = {
    lang: lang,
    langs: [
      { code: 'es', native: 'Español' },
      { code: 'en', native: 'English' },
      { code: 'hi', native: 'हिन्दी' },
    ],
    locale: P.locale,
    teacher: P.teacher,
    school: Object.assign({ id: 'demo-school' }, P.school),
    names: { f: P.first_f, m: P.first_m, last: P.last, teachers: P.teachers },
    // The demo teacher's class (the other classes only exist so the children have past years).
    myClass: ['Grade 3', 'A'],
  };
  document.documentElement.lang = lang;
})();
