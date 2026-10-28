/* ============================================================================
   Tilli — "Book a 30-minute call" pop-up. Shared by BOTH builds:
   js/site-chrome.js (desktop + static pages) and js/m-chrome.js (/m/ pages)
   call window.TilliForm.open() (choices) or .open("form") (straight to the
   form). Styles: css/booking-form.css.

   Three states on .tl-modal:
     (none)            choices — Kavi's Calendly (primary) or WhatsApp, plus a
                       "can't find a time?" link to the form
     .tl-modal--form   the fallback form
     .tl-modal--done   thank-you after the form saved

   Form: validate → POST to the Apps Script (backend/booking-form.gs), which
   saves the Sheet row, alerts info@ + Kavi and emails the lead a confirmation.
   The thank-you only shows once the script answers {ok:true}; anything else
   shows the WhatsApp fallback, so a broken deployment can't swallow a lead.

   The POST keeps the script's original fields: the country-code dropdown and
   the number are joined into one international `phone` ("+94 771234567").

   Load AFTER js/site-config.js. Deciding WHEN to open (desktop CTA vs phone
   WhatsApp card) stays with each chrome file.
   ─────────────────────────────────────────────────────────────────────────── */
(function () {
  "use strict";
  var CONFIG = window.TILLI || {};
  var modal, form, open, close;

  /* ── Country codes ────────────────────────────────────────────────────────
     ISO|Name|dial code, A–Z. PINNED are listed first. ZONES maps each IANA
     time zone to its country so the dropdown can pre-select the visitor's
     country from their device clock (no permission prompt, no IP lookup).
     Source: tz database zone.tab + iso3166.tab. */
  var PINNED = ["LK", "IN", "JO", "AE"];
  var COUNTRIES = "AF|Afghanistan|93;AL|Albania|355;DZ|Algeria|213;AS|American Samoa|1;AD|Andorra|376;AO|Angola|244;AI|Anguilla|1;AG|Antigua & Barbuda|1;AR|Argentina|54;AM|Armenia|374;AW|Aruba|297;AU|Australia|61;AT|Austria|43;AZ|Azerbaijan|994;BS|Bahamas|1;BH|Bahrain|973;BD|Bangladesh|880;BB|Barbados|1;BY|Belarus|375;BE|Belgium|32;BZ|Belize|501;BJ|Benin|229;BM|Bermuda|1;BT|Bhutan|975;BO|Bolivia|591;BA|Bosnia & Herzegovina|387;BW|Botswana|267;BR|Brazil|55;IO|British Indian Ocean Territory|246;VG|British Virgin Islands|1;BN|Brunei|673;BG|Bulgaria|359;BF|Burkina Faso|226;BI|Burundi|257;KH|Cambodia|855;CM|Cameroon|237;CA|Canada|1;CV|Cape Verde|238;BQ|Caribbean Netherlands|599;KY|Cayman Islands|1;CF|Central African Republic|236;TD|Chad|235;CL|Chile|56;CN|China|86;CX|Christmas Island|61;CC|Cocos (Keeling) Islands|61;CO|Colombia|57;KM|Comoros|269;CG|Congo|242;CK|Cook Islands|682;CR|Costa Rica|506;HR|Croatia|385;CU|Cuba|53;CW|Curaçao|599;CY|Cyprus|357;CZ|Czechia|420;CI|Côte d’Ivoire|225;DK|Denmark|45;DJ|Djibouti|253;DM|Dominica|1;DO|Dominican Republic|1;CD|DR Congo|243;EC|Ecuador|593;EG|Egypt|20;SV|El Salvador|503;GQ|Equatorial Guinea|240;ER|Eritrea|291;EE|Estonia|372;SZ|Eswatini|268;ET|Ethiopia|251;FK|Falkland Islands|500;FO|Faroe Islands|298;FJ|Fiji|679;FI|Finland|358;FR|France|33;GF|French Guiana|594;PF|French Polynesia|689;GA|Gabon|241;GM|Gambia|220;GE|Georgia|995;DE|Germany|49;GH|Ghana|233;GI|Gibraltar|350;GR|Greece|30;GL|Greenland|299;GD|Grenada|1;GP|Guadeloupe|590;GU|Guam|1;GT|Guatemala|502;GG|Guernsey|44;GN|Guinea|224;GW|Guinea-Bissau|245;GY|Guyana|592;HT|Haiti|509;HN|Honduras|504;HK|Hong Kong|852;HU|Hungary|36;IS|Iceland|354;IN|India|91;ID|Indonesia|62;IR|Iran|98;IQ|Iraq|964;IE|Ireland|353;IM|Isle of Man|44;IL|Israel|972;IT|Italy|39;JM|Jamaica|1;JP|Japan|81;JE|Jersey|44;JO|Jordan|962;KZ|Kazakhstan|7;KE|Kenya|254;KI|Kiribati|686;XK|Kosovo|383;KW|Kuwait|965;KG|Kyrgyzstan|996;LA|Laos|856;LV|Latvia|371;LB|Lebanon|961;LS|Lesotho|266;LR|Liberia|231;LY|Libya|218;LI|Liechtenstein|423;LT|Lithuania|370;LU|Luxembourg|352;MO|Macau|853;MG|Madagascar|261;MW|Malawi|265;MY|Malaysia|60;MV|Maldives|960;ML|Mali|223;MT|Malta|356;MH|Marshall Islands|692;MQ|Martinique|596;MR|Mauritania|222;MU|Mauritius|230;YT|Mayotte|262;MX|Mexico|52;FM|Micronesia|691;MD|Moldova|373;MC|Monaco|377;MN|Mongolia|976;ME|Montenegro|382;MS|Montserrat|1;MA|Morocco|212;MZ|Mozambique|258;MM|Myanmar|95;NA|Namibia|264;NR|Nauru|674;NP|Nepal|977;NL|Netherlands|31;NC|New Caledonia|687;NZ|New Zealand|64;NI|Nicaragua|505;NE|Niger|227;NG|Nigeria|234;NU|Niue|683;NF|Norfolk Island|672;KP|North Korea|850;MK|North Macedonia|389;MP|Northern Mariana Islands|1;NO|Norway|47;OM|Oman|968;PK|Pakistan|92;PW|Palau|680;PS|Palestine|970;PA|Panama|507;PG|Papua New Guinea|675;PY|Paraguay|595;PE|Peru|51;PH|Philippines|63;PN|Pitcairn|64;PL|Poland|48;PT|Portugal|351;PR|Puerto Rico|1;QA|Qatar|974;RO|Romania|40;RU|Russia|7;RW|Rwanda|250;RE|Réunion|262;WS|Samoa|685;SM|San Marino|378;ST|Sao Tome & Principe|239;SA|Saudi Arabia|966;SN|Senegal|221;RS|Serbia|381;SC|Seychelles|248;SL|Sierra Leone|232;SG|Singapore|65;SX|Sint Maarten|1;SK|Slovakia|421;SI|Slovenia|386;SB|Solomon Islands|677;SO|Somalia|252;ZA|South Africa|27;KR|South Korea|82;SS|South Sudan|211;ES|Spain|34;LK|Sri Lanka|94;BL|St Barthélemy|590;SH|St Helena|290;KN|St Kitts & Nevis|1;LC|St Lucia|1;MF|St Martin|590;PM|St Pierre & Miquelon|508;VC|St Vincent & Grenadines|1;SD|Sudan|249;SR|Suriname|597;SJ|Svalbard & Jan Mayen|47;SE|Sweden|46;CH|Switzerland|41;SY|Syria|963;TW|Taiwan|886;TJ|Tajikistan|992;TZ|Tanzania|255;TH|Thailand|66;TL|Timor-Leste|670;TG|Togo|228;TK|Tokelau|690;TO|Tonga|676;TT|Trinidad & Tobago|1;TN|Tunisia|216;TR|Turkey|90;TM|Turkmenistan|993;TC|Turks & Caicos Islands|1;TV|Tuvalu|688;UG|Uganda|256;UA|Ukraine|380;AE|United Arab Emirates|971;GB|United Kingdom|44;US|United States|1;UY|Uruguay|598;VI|US Virgin Islands|1;UZ|Uzbekistan|998;VU|Vanuatu|678;VA|Vatican City|39;VE|Venezuela|58;VN|Vietnam|84;WF|Wallis & Futuna|681;EH|Western Sahara|212;YE|Yemen|967;ZM|Zambia|260;ZW|Zimbabwe|263;AX|Åland Islands|358";
  var ZONES = "AD:Europe/Andorra;AE:Asia/Dubai;AF:Asia/Kabul;AG:America/Antigua;AI:America/Anguilla;AL:Europe/Tirane;AM:Asia/Yerevan;AO:Africa/Luanda;AR:America/Argentina/Buenos_Aires,America/Argentina/Cordoba,America/Argentina/Salta,America/Argentina/Jujuy,America/Argentina/Tucuman,America/Argentina/Catamarca,America/Argentina/La_Rioja,America/Argentina/San_Juan,America/Argentina/Mendoza,America/Argentina/San_Luis,America/Argentina/Rio_Gallegos,America/Argentina/Ushuaia,America/Buenos_Aires;AS:Pacific/Pago_Pago;AT:Europe/Vienna;AU:Australia/Lord_Howe,Antarctica/Macquarie,Australia/Hobart,Australia/Melbourne,Australia/Sydney,Australia/Broken_Hill,Australia/Brisbane,Australia/Lindeman,Australia/Adelaide,Australia/Darwin,Australia/Perth,Australia/Eucla;AW:America/Aruba;AX:Europe/Mariehamn;AZ:Asia/Baku;BA:Europe/Sarajevo;BB:America/Barbados;BD:Asia/Dhaka,Asia/Dacca;BE:Europe/Brussels;BF:Africa/Ouagadougou;BG:Europe/Sofia;BH:Asia/Bahrain;BI:Africa/Bujumbura;BJ:Africa/Porto-Novo;BL:America/St_Barthelemy;BM:Atlantic/Bermuda;BN:Asia/Brunei;BO:America/La_Paz;BQ:America/Kralendijk;BR:America/Noronha,America/Belem,America/Fortaleza,America/Recife,America/Araguaina,America/Maceio,America/Bahia,America/Sao_Paulo,America/Campo_Grande,America/Cuiaba,America/Santarem,America/Porto_Velho,America/Boa_Vista,America/Manaus,America/Eirunepe,America/Rio_Branco;BS:America/Nassau;BT:Asia/Thimphu,Asia/Thimbu;BW:Africa/Gaborone;BY:Europe/Minsk;BZ:America/Belize;CA:America/St_Johns,America/Halifax,America/Glace_Bay,America/Moncton,America/Goose_Bay,America/Blanc-Sablon,America/Toronto,America/Iqaluit,America/Atikokan,America/Winnipeg,America/Resolute,America/Rankin_Inlet,America/Regina,America/Swift_Current,America/Edmonton,America/Cambridge_Bay,America/Inuvik,America/Vancouver,America/Creston,America/Dawson_Creek,America/Fort_Nelson,America/Whitehorse,America/Dawson;CC:Indian/Cocos;CD:Africa/Kinshasa,Africa/Lubumbashi;CF:Africa/Bangui;CG:Africa/Brazzaville;CH:Europe/Zurich;CI:Africa/Abidjan;CK:Pacific/Rarotonga;CL:America/Santiago,America/Coyhaique,America/Punta_Arenas,Pacific/Easter;CM:Africa/Douala;CN:Asia/Shanghai,Asia/Urumqi;CO:America/Bogota;CR:America/Costa_Rica;CU:America/Havana;CV:Atlantic/Cape_Verde;CW:America/Curacao;CX:Indian/Christmas;CY:Asia/Nicosia,Asia/Famagusta;CZ:Europe/Prague;DE:Europe/Berlin,Europe/Busingen;DJ:Africa/Djibouti;DK:Europe/Copenhagen;DM:America/Dominica;DO:America/Santo_Domingo;DZ:Africa/Algiers;EC:America/Guayaquil,Pacific/Galapagos;EE:Europe/Tallinn;EG:Africa/Cairo;EH:Africa/El_Aaiun;ER:Africa/Asmara;ES:Europe/Madrid,Africa/Ceuta,Atlantic/Canary;ET:Africa/Addis_Ababa;FI:Europe/Helsinki;FJ:Pacific/Fiji;FK:Atlantic/Stanley;FM:Pacific/Chuuk,Pacific/Pohnpei,Pacific/Kosrae,Pacific/Truk,Pacific/Ponape;FO:Atlantic/Faroe,Atlantic/Faeroe;FR:Europe/Paris;GA:Africa/Libreville;GB:Europe/London,Europe/Belfast;GD:America/Grenada;GE:Asia/Tbilisi;GF:America/Cayenne;GG:Europe/Guernsey;GH:Africa/Accra;GI:Europe/Gibraltar;GL:America/Nuuk,America/Danmarkshavn,America/Scoresbysund,America/Thule;GM:Africa/Banjul;GN:Africa/Conakry;GP:America/Guadeloupe;GQ:Africa/Malabo;GR:Europe/Athens;GT:America/Guatemala;GU:Pacific/Guam;GW:Africa/Bissau;GY:America/Guyana;HK:Asia/Hong_Kong;HN:America/Tegucigalpa;HR:Europe/Zagreb;HT:America/Port-au-Prince;HU:Europe/Budapest;ID:Asia/Jakarta,Asia/Pontianak,Asia/Makassar,Asia/Jayapura;IE:Europe/Dublin;IL:Asia/Jerusalem;IM:Europe/Isle_of_Man;IN:Asia/Kolkata,Asia/Calcutta;IO:Indian/Chagos;IQ:Asia/Baghdad;IR:Asia/Tehran;IS:Atlantic/Reykjavik;IT:Europe/Rome;JE:Europe/Jersey;JM:America/Jamaica;JO:Asia/Amman;JP:Asia/Tokyo;KE:Africa/Nairobi;KG:Asia/Bishkek;KH:Asia/Phnom_Penh;KI:Pacific/Tarawa,Pacific/Kanton,Pacific/Kiritimati;KM:Indian/Comoro;KN:America/St_Kitts;KP:Asia/Pyongyang;KR:Asia/Seoul;KW:Asia/Kuwait;KY:America/Cayman;KZ:Asia/Almaty,Asia/Qyzylorda,Asia/Qostanay,Asia/Aqtobe,Asia/Aqtau,Asia/Atyrau,Asia/Oral;LA:Asia/Vientiane;LB:Asia/Beirut;LC:America/St_Lucia;LI:Europe/Vaduz;LK:Asia/Colombo;LR:Africa/Monrovia;LS:Africa/Maseru;LT:Europe/Vilnius;LU:Europe/Luxembourg;LV:Europe/Riga;LY:Africa/Tripoli;MA:Africa/Casablanca;MC:Europe/Monaco;MD:Europe/Chisinau;ME:Europe/Podgorica;MF:America/Marigot;MG:Indian/Antananarivo;MH:Pacific/Majuro,Pacific/Kwajalein;MK:Europe/Skopje;ML:Africa/Bamako;MM:Asia/Yangon,Asia/Rangoon;MN:Asia/Ulaanbaatar,Asia/Hovd,Asia/Ulan_Bator;MO:Asia/Macau,Asia/Macao;MP:Pacific/Saipan;MQ:America/Martinique;MR:Africa/Nouakchott;MS:America/Montserrat;MT:Europe/Malta;MU:Indian/Mauritius;MV:Indian/Maldives;MW:Africa/Blantyre;MX:America/Mexico_City,America/Cancun,America/Merida,America/Monterrey,America/Matamoros,America/Chihuahua,America/Ciudad_Juarez,America/Ojinaga,America/Mazatlan,America/Bahia_Banderas,America/Hermosillo,America/Tijuana;MY:Asia/Kuala_Lumpur,Asia/Kuching;MZ:Africa/Maputo;NA:Africa/Windhoek;NC:Pacific/Noumea;NE:Africa/Niamey;NF:Pacific/Norfolk;NG:Africa/Lagos;NI:America/Managua;NL:Europe/Amsterdam;NO:Europe/Oslo;NP:Asia/Kathmandu,Asia/Katmandu;NR:Pacific/Nauru;NU:Pacific/Niue;NZ:Pacific/Auckland,Pacific/Chatham;OM:Asia/Muscat;PA:America/Panama;PE:America/Lima;PF:Pacific/Tahiti,Pacific/Marquesas,Pacific/Gambier;PG:Pacific/Port_Moresby,Pacific/Bougainville;PH:Asia/Manila;PK:Asia/Karachi;PL:Europe/Warsaw;PM:America/Miquelon;PN:Pacific/Pitcairn;PR:America/Puerto_Rico;PS:Asia/Gaza,Asia/Hebron;PT:Europe/Lisbon,Atlantic/Madeira,Atlantic/Azores;PW:Pacific/Palau;PY:America/Asuncion;QA:Asia/Qatar;RE:Indian/Reunion;RO:Europe/Bucharest;RS:Europe/Belgrade;RU:Europe/Kaliningrad,Europe/Moscow,Europe/Kirov,Europe/Volgograd,Europe/Astrakhan,Europe/Saratov,Europe/Ulyanovsk,Europe/Samara,Asia/Yekaterinburg,Asia/Omsk,Asia/Novosibirsk,Asia/Barnaul,Asia/Tomsk,Asia/Novokuznetsk,Asia/Krasnoyarsk,Asia/Irkutsk,Asia/Chita,Asia/Yakutsk,Asia/Khandyga,Asia/Vladivostok,Asia/Ust-Nera,Asia/Magadan,Asia/Sakhalin,Asia/Srednekolymsk,Asia/Kamchatka,Asia/Anadyr;RW:Africa/Kigali;SA:Asia/Riyadh;SB:Pacific/Guadalcanal;SC:Indian/Mahe;SD:Africa/Khartoum;SE:Europe/Stockholm;SG:Asia/Singapore;SH:Atlantic/St_Helena;SI:Europe/Ljubljana;SJ:Arctic/Longyearbyen;SK:Europe/Bratislava;SL:Africa/Freetown;SM:Europe/San_Marino;SN:Africa/Dakar;SO:Africa/Mogadishu;SR:America/Paramaribo;SS:Africa/Juba;ST:Africa/Sao_Tome;SV:America/El_Salvador;SX:America/Lower_Princes;SY:Asia/Damascus;SZ:Africa/Mbabane;TC:America/Grand_Turk;TD:Africa/Ndjamena;TG:Africa/Lome;TH:Asia/Bangkok;TJ:Asia/Dushanbe;TK:Pacific/Fakaofo;TL:Asia/Dili;TM:Asia/Ashgabat;TN:Africa/Tunis;TO:Pacific/Tongatapu;TR:Europe/Istanbul,Asia/Istanbul;TT:America/Port_of_Spain;TV:Pacific/Funafuti;TW:Asia/Taipei;TZ:Africa/Dar_es_Salaam;UA:Europe/Simferopol,Europe/Kyiv,Europe/Kiev;UG:Africa/Kampala;US:America/New_York,America/Detroit,America/Kentucky/Louisville,America/Kentucky/Monticello,America/Indiana/Indianapolis,America/Indiana/Vincennes,America/Indiana/Winamac,America/Indiana/Marengo,America/Indiana/Petersburg,America/Indiana/Vevay,America/Chicago,America/Indiana/Tell_City,America/Indiana/Knox,America/Menominee,America/North_Dakota/Center,America/North_Dakota/New_Salem,America/North_Dakota/Beulah,America/Denver,America/Boise,America/Phoenix,America/Los_Angeles,America/Anchorage,America/Juneau,America/Sitka,America/Metlakatla,America/Yakutat,America/Nome,America/Adak,Pacific/Honolulu;UY:America/Montevideo;UZ:Asia/Samarkand,Asia/Tashkent;VA:Europe/Vatican;VC:America/St_Vincent;VE:America/Caracas;VG:America/Tortola;VI:America/St_Thomas;VN:Asia/Ho_Chi_Minh,Asia/Saigon;VU:Pacific/Efate;WF:Pacific/Wallis;WS:Pacific/Apia;YE:Asia/Aden;YT:Indian/Mayotte;ZA:Africa/Johannesburg;ZM:Africa/Lusaka;ZW:Africa/Harare";
  var DIAL = {}, NAME = {}, ZONE_TO = {};
  COUNTRIES.split(";").forEach(function (r) { var p = r.split("|"); NAME[p[0]] = p[1]; DIAL[p[0]] = p[2]; });
  ZONES.split(";").forEach(function (r) {
    var p = r.split(":"); p[1].split(",").forEach(function (z) { ZONE_TO[z] = p[0]; });
  });
  /* Regional-indicator flag; Windows shows the two letters instead, which still reads fine. */
  function flag(iso) {
    return String.fromCodePoint(0x1F1E6 + iso.charCodeAt(0) - 65, 0x1F1E6 + iso.charCodeAt(1) - 65);
  }
  function detectCountry() {
    try {
      var tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (ZONE_TO[tz]) return ZONE_TO[tz];
    } catch (e) {}
    var langs = navigator.languages || [navigator.language || ""];
    for (var i = 0; i < langs.length; i++) {
      var m = /-([a-z]{2})$/i.exec(langs[i] || "");
      if (m && DIAL[m[1].toUpperCase()]) return m[1].toUpperCase();
    }
    return "";
  }
  function codeOptions() {
    function o(iso) {
      return '<option value="' + iso + '">' + flag(iso) + " " + NAME[iso] + " (+" + DIAL[iso] + ")</option>";
    }
    var all = COUNTRIES.split(";").map(function (r) { return r.split("|")[0]; });
    return '<option value="" disabled selected>Country code</option>' +
      '<optgroup label="Common">' + PINNED.map(o).join("") + "</optgroup>" +
      '<optgroup label="All countries">' + all.map(o).join("") + "</optgroup>";
  }

  /* Kavi's photo when KAVI_PHOTO is set (root-relative; /m/ pages sit one
     level down), else the same "KT" monogram the WhatsApp card uses. */
  function kaviAvatar() {
    if (!CONFIG.KAVI_PHOTO) return '<span class="tl-kavi__avatar" aria-hidden="true">KT</span>';
    var base = /\/m\//.test(location.pathname) ? "../" : "";
    return '<img class="tl-kavi__avatar" src="' + base + CONFIG.KAVI_PHOTO + '" alt="">';
  }
  /* Kavi's identity card; a link to her LinkedIn once KAVI_LINKEDIN is set. */
  function kaviCard() {
    var inner = kaviAvatar() +
      '<div class="tl-kavi__text"><p class="tl-kavi__name">Kavindya Tennakoon</p>' +
      '<p class="tl-kavi__role">Founder &amp; CEO, Tilli · Stanford researcher</p></div>';
    if (!CONFIG.KAVI_LINKEDIN) return '<div class="tl-kavi">' + inner + '</div>';
    inner = inner.replace('</div>', '<p class="tl-kavi__cta">View LinkedIn</p></div>');
    return '<a class="tl-kavi tl-kavi--link" href="' + CONFIG.KAVI_LINKEDIN + '" target="_blank" rel="noopener"' +
      ' aria-label="Kavindya Tennakoon on LinkedIn (opens in a new tab)">' + inner +
      '<svg class="tl-kavi__in" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4.98 3.5a2.5 2.5 0 11-.02 5 2.5 2.5 0 01.02-5zM3 9h4v12H3zM9 9h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.5c0-1.3-.02-3-1.83-3-1.83 0-2.12 1.43-2.12 2.9V21H9z"/></svg>' +
      '</a>';
  }
  function waLink() {
    return "https://wa.me/" + (CONFIG.WHATSAPP_NUMBER || "") +
      "?text=" + encodeURIComponent(CONFIG.WHATSAPP_PREFILL || "");
  }
  /* "+94 771234567". A number typed with its own "+" wins over the dropdown;
     a leading trunk 0 is dropped so the result works as a wa.me link. */
  function fullPhone() {
    var raw = form.phone.value.trim();
    if (/^\+/.test(raw)) return raw;
    return "+" + DIAL[form.phone_code.value] + " " + raw.replace(/^0+/, "");
  }

  function build() {
    var wrap = document.createElement("div");
    wrap.innerHTML =
      '<div class="tl-modal" role="dialog" aria-modal="true" aria-labelledby="tlf-title">' +
        '<div class="tl-modal__panel">' +
          '<button class="tl-modal__close" type="button" aria-label="Close">&times;</button>' +
          /* ── State 1: choices ── */
          '<div class="tl-choose">' +
            '<h2 class="tl-form__title" id="tlf-title">Book a 30-minute call with Kavi</h2>' +
            kaviCard() +
            '<div class="tl-choose__btns">' +
              '<a class="tl-form__btn tl-choose__cal" href="' + CONFIG.CALENDLY_URL + '" target="_blank" rel="noopener">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>' +
                'Pick a time' +
                /* ↗ = opens Calendly in a new tab */
                '<svg class="tl-ext" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 16L16 8M9 8h7v7"/></svg>' +
                '<span class="tl-sr">(opens in a new tab)</span></a>' +
              '<a class="tl-form__btn tl-form__btn--ghost tl-choose__wa" href="' + waLink() + '" target="_blank" rel="noopener">' +
                (CONFIG.WA_ICON || '') + 'Chat on WhatsApp</a>' +
            '</div>' +
            '<p class="tl-choose__alt">Can’t find a time that works? ' +
              '<button class="tl-linkbtn tl-choose__form" type="button">Leave your details</button> and we’ll reach out.</p>' +
          '</div>' +
          /* ── State 2: fallback form ── */
          '<div class="tl-form__head">' +
            '<button class="tl-linkbtn tl-back" type="button">← Back</button>' +
            '<h2 class="tl-form__title">Leave your details</h2>' +
            '<p class="tl-form__intro">Kavi’s team will reach out to find a time that works for you.</p>' +
          '</div>' +
          '<form class="tl-form" novalidate>' +
            /* honeypot — hidden from people; bots fill it and the backend drops them */
            '<input name="website" type="text" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;width:1px;height:1px;opacity:0">' +
            '<div class="tl-form__row">' +
              '<div class="tl-field">' +
                '<label for="tlf-name">Name</label>' +
                '<input class="tl-input" id="tlf-name" name="name" type="text" autocomplete="name" required>' +
                '<span class="tl-field__err">Please enter your name.</span>' +
              '</div>' +
              '<div class="tl-field">' +
                '<label for="tlf-role">Your role</label>' +
                '<input class="tl-input" id="tlf-role" name="role" type="text" placeholder="Principal, coordinator…" required>' +
                '<span class="tl-field__err">Please enter your role.</span>' +
              '</div>' +
            '</div>' +
            '<div class="tl-field">' +
              '<label for="tlf-school">School / organisation</label>' +
              '<input class="tl-input" id="tlf-school" name="school" type="text" autocomplete="organization" required>' +
              '<span class="tl-field__err">Please enter your school or organisation.</span>' +
            '</div>' +
            '<div class="tl-form__row">' +
              '<div class="tl-field">' +
                '<label for="tlf-email">Email</label>' +
                '<input class="tl-input" id="tlf-email" name="email" type="email" autocomplete="email" required>' +
                '<span class="tl-field__err">Please enter a valid email.</span>' +
              '</div>' +
              '<div class="tl-field">' +
                '<label for="tlf-phone">Phone (school or WhatsApp)</label>' +
                '<div class="tl-phone">' +
                  /* native picker (opacity 0) under a compact "🇱🇰 +94" face */
                  '<div class="tl-phone__code">' +
                    '<span class="tl-phone__shown" aria-hidden="true">Code</span>' +
                    '<select id="tlf-code" name="phone_code" aria-label="Country code" required>' + codeOptions() + '</select>' +
                  '</div>' +
                  '<input class="tl-input" id="tlf-phone" name="phone" type="tel" autocomplete="tel-national" placeholder="Number" required>' +
                '</div>' +
                '<span class="tl-field__hint">Only used to confirm your call.</span>' +
                '<span class="tl-field__err">Please choose a country code and enter your number.</span>' +
              '</div>' +
            '</div>' +
            '<div class="tl-field">' +
              '<label for="tlf-msg">Anything you’d like us to know? <span class="tl-opt">(optional)</span></label>' +
              '<textarea class="tl-textarea" id="tlf-msg" name="message"></textarea>' +
            '</div>' +
            '<button class="tl-form__btn tl-form__submit" type="submit">Send request</button>' +
            '<p class="tl-form__note tl-form__fail" hidden>Sorry, that didn’t send. Please try again, or <a href="' + waLink() + '" target="_blank" rel="noopener">message us on WhatsApp</a>.</p>' +
            '<p class="tl-form__note">We’ll only use these details to get in touch about Tilli.</p>' +
          '</form>' +
          '<div class="tl-form__ok" role="status">' +
            '<div class="tl-form__ok-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></div>' +
            '<h3 class="tl-form__ok-title">Thank you, we’ve got it!</h3>' +
            '<p class="tl-form__ok-text">We’ve emailed you a confirmation, and Kavi’s team will be in touch soon.</p>' +
            '<p class="tl-form__ok-alt">Prefer to chat? <a href="' + waLink() + '" target="_blank" rel="noopener">Message us on WhatsApp</a></p>' +
          '</div>' +
        '</div>' +
      '</div>';
    modal = wrap.firstChild;
    document.body.appendChild(modal);
    form = modal.querySelector(".tl-form");

    var code = form.phone_code;
    var shown = modal.querySelector(".tl-phone__shown");
    function syncCode() {
      var iso = code.value;
      shown.textContent = iso ? flag(iso) + " +" + DIAL[iso] : "Code";
      shown.classList.toggle("is-empty", !iso);
    }
    /* defaultSelected so form.reset() returns to the detected country, not blank */
    var guess = detectCountry();
    var guessOpt = guess && code.querySelector('optgroup[label="All countries"] option[value="' + guess + '"]');
    if (guessOpt) { guessOpt.defaultSelected = true; guessOpt.selected = true; }
    syncCode();
    code.addEventListener("change", syncCode);

    /* ── Errors ── `mark` outlines one control; `say` shows its field's message. */
    function mark(el, on) {
      (el.closest(".tl-phone__code") || el).classList.toggle("is-err", on);
    }
    function say(el, on) {
      var err = el.closest(".tl-field").querySelector(".tl-field__err");
      if (err) err.classList.toggle("tl-field__err--show", on);
    }
    function clearErrors() {
      form.querySelectorAll(".is-err").forEach(function (e) { e.classList.remove("is-err"); });
      form.querySelectorAll(".tl-field__err--show").forEach(function (e) { e.classList.remove("tl-field__err--show"); });
    }
    /* Clear a field's error as soon as the visitor fixes it */
    form.addEventListener("input", function (e) {
      if (e.target.name === "website") return;
      mark(e.target, false);
      var f = e.target.closest(".tl-field");
      if (f && !f.querySelector(".is-err")) say(e.target, false);
    });

    function showForm(on) {
      modal.classList.toggle("tl-modal--form", on);
      modal.querySelector(".tl-modal__panel").scrollTop = 0;
      setTimeout(function () {
        var f = modal.querySelector(on ? "#tlf-name" : ".tl-choose__cal"); if (f) f.focus();
      }, 60);
    }
    modal.querySelector(".tl-choose__form").addEventListener("click", function () { showForm(true); });
    modal.querySelector(".tl-back").addEventListener("click", function () { showForm(false); });

    open = function (view) {
      modal.classList.add("tl-modal--open"); document.body.style.overflow = "hidden";
      showForm(view === "form");
    };
    /* Every close returns to the choices. After a successful send the form is
       also wiped, so the next person on a shared screen never sees old details. */
    close = function () {
      modal.classList.remove("tl-modal--open", "tl-modal--form"); document.body.style.overflow = "";
      if (modal.classList.contains("tl-modal--done")) {
        modal.classList.remove("tl-modal--done");
        form.reset(); syncCode(); clearErrors();
      }
    };
    modal.querySelector(".tl-modal__close").addEventListener("click", close);
    modal.addEventListener("click", function (e) { if (e.target === modal) close(); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modal.classList.contains("tl-modal--open")) close();
    });

    function validEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
    function digits(v) { return (v.match(/\d/g) || []).length; }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      function check(el, valid) { mark(el, !valid); say(el, !valid); if (!valid) ok = false; }

      check(form.name, !!form.name.value.trim());
      check(form.role, !!form.role.value.trim());
      check(form.school, !!form.school.value.trim());
      check(form.email, validEmail(form.email.value.trim()));
      var num = form.phone.value.trim();
      var ownCode = /^\+/.test(num);
      var codeOk = ownCode || !!code.value, numOk = digits(num) >= 6;
      mark(code, !codeOk); mark(form.phone, !numOk); say(form.phone, !(codeOk && numOk));
      if (!(codeOk && numOk)) ok = false;

      if (!ok) {
        var first = form.querySelector(".is-err");
        var target = first && (first.matches("input, select") ? first : first.querySelector("input, select"));
        if (target) target.focus();
        return;
      }

      var btn = form.querySelector(".tl-form__submit");
      var fail = form.querySelector(".tl-form__fail");
      var done = function () {
        modal.classList.add("tl-modal--done");
        modal.querySelector(".tl-modal__panel").scrollTop = 0;
      };
      // urlencoded so Apps Script fills e.parameter (one value per key)
      var data = new URLSearchParams();
      data.append("website", form.website.value);
      data.append("name", form.name.value.trim());
      data.append("role", form.role.value.trim());
      data.append("school", form.school.value.trim());
      data.append("email", form.email.value.trim());
      data.append("phone", fullPhone());
      data.append("message", form.message.value.trim());
      data.append("page", location.pathname);

      if (!CONFIG.FORM_ENDPOINT) { done(); return; } // stub: no backend wired yet

      fail.hidden = true;
      btn.disabled = true; btn.textContent = "Sending…";
      // A urlencoded POST is a CORS "simple request" and Apps Script's final
      // response allows any origin, so the {ok} reply is readable. A rejected
      // fetch (offline, or the deployment no longer public → Google sign-in
      // page without CORS) lands in catch, so it can't fake a success.
      fetch(CONFIG.FORM_ENDPOINT, { method: "POST", body: data })
        .then(function (r) { return r.json(); })
        .then(function (res) { if (res && res.ok) done(); else fail.hidden = false; })
        .catch(function () { fail.hidden = false; })
        .finally(function () { btn.disabled = false; btn.textContent = "Send request"; });
    });
  }

  window.TilliForm = {
    open: function (view) { if (!modal) build(); open(view); }
  };
})();
