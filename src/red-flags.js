/*!
 * Job Red Flag Checker v0.6.1
 * Spots the warning signs of a fake or scam job posting or recruiter message,
 * and quotes the line that triggered each one. Rules only: no AI, no network,
 * no data stored.
 * MIT License. Made by Ready to Apply: https://readytoapply.ai
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.JobRedFlags = factory();
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var VERSION = '0.6.1';

  // ── Tiers ────────────────────────────────────────────────────────────────
  // One flag is a question; three flags are an answer.
  var TIERS = {
    severe: { label: 'Severe', meaning: 'Stop. Do not apply, reply or share anything.' },
    hard:   { label: 'Hard',   meaning: 'A strong reason to pause and verify before going further.' },
    soft:   { label: 'Soft',   meaning: 'Worth a closer look, especially when several appear together.' }
  };

  // ── Shared pieces ────────────────────────────────────────────────────────
  // Real employers now warn candidates about scams in their own postings
  // ("we will never ask you to pay or for your SSN"). Those warnings describe
  // the red flags, so a sentence like that, or a whole fraud-notice paragraph,
  // is never counted as evidence.
  var PROTECT_SENTENCE = /\b(scams?|scammers?|fraud\w*|phishing|impersonat\w*|beware|identity theft)\b|\bnever (ask|request|require|charge|solicit)s?\b|\b(candidates?|applicants?|you) (will )?(never|don'?t|do not|won'?t) (pay|be charged)\b/i;
  var PROTECT_PARAGRAPH = /\b(recruit(ment|ing)? (fraud|scams?)|(fraud|scam|phishing) (alert|notice|warning|awareness)|beware of|impersonat\w+|fraudulent (job|offers?|recruit\w*|emails?|messages?))\b/i;

  // A sentence that says the employer pays or reimburses is the opposite of
  // the red flag.
  var EMPLOYER_PAYS = /\b(we|our company|the company|employer|company)\b[^.\n]{0,25}\b(pay|pays|cover|covers|reimburse|reimburses|provide|provides|supply|supplies|fund|funds|sponsor|sponsors)\b|\b(reimburs\w*|company[- ]paid|company[- ]provided|paid by (us|the company|the employer)|at no (cost|charge) to you|free of charge|stipend|allowance|tuition assistance)\b/i;
  // Ordinary costs of some real jobs: your own tools, boots, a license exam,
  // state fingerprinting. Paying for these is not paying to get hired.
  var JOB_COST = /\b(own tools?|hand tools|tool ?kit|tools|steel[- ]toe|boots|uniforms?|scrubs|shoes|work ?wear|licen[cs]e|licen[cs]ing|exams?|fingerprint\w*|background (check|screening)s?|drug (test|screen)\w*|vehicle|car|auto insurance|parking|transportation|commut\w*|meals|booth rent|chair rent|dues|union)\b/i;
  var AFTER_OFFER = /\b(e-?verify|i-9|form i9|upon (hire|hiring)|after (an |the |a )?(offer|hire)|offer of employment|post-offer|contingent (up)?on|onboarding|new hire paperwork|first day|background (check|screening)s? (will|may) be|direct deposit|payroll)\b/i;
  var NEGATION = /\b(never|not|no|won'?t|don'?t|doesn'?t|isn'?t|aren'?t|without|nor)\b/i;
  var ENTRY = /\b(no (prior |previous )?experience (is )?(necessary|needed|required)|no experience|entry[- ]level|no degree|no resume|no interview|anyone can (do|apply)|no skills? (needed|required))\b/i;

  // US government postings legitimately ask for some things that are scam
  // signs anywhere else (measured on real USAJOBS postings). Each exemption is
  // tied to the government's own wording, so the same request in other words
  // still counts.
  // A sentence that defines personal data ("Examples of PII include: date of
  // birth, Social Security Number") describes it; it does not ask for it.
  var DESCRIBES_PII = /\bexamples? of (pii|personally identifiable information|personal (data|information)|sensitive (data|information))\b|\b(pii|personally identifiable information) (includes?|means|is defined as|consists of)\b/i;
  // The last four digits of the SSN next to the vacancy announcement number,
  // on a paper application packet; or the SSN that a USAJOBS account itself
  // asks for. (Not "usajobs-careers.com" or "usajobs.help": a lookalike is not
  // the government's site.)
  var GOV_SSN = /\blast (four|4)\b[^.\n]{0,40}\b(ssn|social security)\b[^.\n]{0,80}\b(vacancy |job )?announcement (number|no\.?)|\b(ssn|social security number)\b[^.\n]{0,40}\b(for|in|into|on|to|through) (your )?usajobs(?![\w@-]|\.\w)/i;
  // Age-limited federal jobs (firefighters, air traffic controllers, law
  // enforcement) need proof of your date of birth to check a maximum entry age.
  // "Failure to provide your SSN when requested will result in your
  // application not being processed": a federal notice about a later request.
  var GOV_SSN_NOTICE = /\bfailure to (provide|furnish|disclose) (your |the )?(ssn|social security number)\b[^.\n]{0,20}\bwhen requested\b/i;
  var AGE_LIMIT =/\bmaximum entry age\b|\bmust not have reached (their|your|his or her) \d{2}(st|nd|rd|th) birthday\b/i;

  // Money: $, £, €, ₹ and the common written forms (CA$, A$, USD 500, 500 GBP).
  // Currency codes count only as whole words ("AutoCad 3D" is not CAD 3).
  var CUR = '(?:US\\$|CA\\$|C\\$|AU\\$|A\\$|NZ\\$|S\\$|\\$|£|€|₹|\\bRs\\.?\\s?|\\b(?:USD|CAD|AUD|GBP|EUR|INR)\\s)';
  var NUM = '(\\d{1,3}(?:,\\d{3})+|\\d+)(?:\\.\\d+)?';
  var PAY_QUOTE = new RegExp('(' + CUR + ')\\s?' + NUM + '\\s*(k\\b)?(?:\\s*(?:-|to|–)\\s*' + CUR + '?\\s?\\d[\\d,]*(?:\\.\\d+)?\\s*k?)?\\s*(?:\\+\\s*)?(?:per|a|an|\\/|each)\\s*(hour|hr|day|week|wk)\\b', 'gi');
  // An amount: "$500", "£1,200", or written after the number ("200-500 USD",
  // "150 USDT", "0.012 ETH").
  var MONEY = '(?:' + CUR + '\\s?\\d[\\d,]*|\\b\\d[\\d,]*(?:\\.\\d+)?\\s?(?:usd|eur|gbp|cad|aud|inr|dollars|usdt|eth|btc|tether)\\b)';
  // Rough value of one unit in US dollars, only to set "implausibly high".
  function toUsd(sym) {
    var s = sym.replace(/\s/g, '').toUpperCase();
    if (/£|GBP/.test(s)) return 1.25;
    if (/€|EUR/.test(s)) return 1.08;
    if (/₹|INR|RS/.test(s)) return 0.012;
    if (/CA\$|C\$|CAD/.test(s)) return 0.73;
    if (/AU\$|A\$|AUD|NZ\$/.test(s)) return 0.65;
    if (/S\$/.test(s)) return 0.74;
    return 1;
  }

  // Texting itself is not a flag: big retailers run "text JOBS to apply" and
  // recruiters confirm interviews by text. Chat APPS are the signal.
  var CHAT_APPS = '(?:whats ?app|telegram|signal|wickr|kik|wechat|line app|viber|google hangouts|hangouts|instant messag\\w*|(the |a |our )?(secure )?(chat|messaging|messenger) app)';
  var FREE_EMAIL = /\b[\w.+-]+@(gmail|googlemail|yahoo|ymail|rocketmail|hotmail|outlook|live|msn|aol|icloud|me|proton|protonmail|gmx|mail|zoho|yandex|inbox)\.(com|ca|co\.uk|co|net|me|ru|de|fr|in)\b/i;
  // What scammers sell as the way into a job (always as a phrase, never a bare
  // word: "claims processing of $5M" and "charge nurse" are real jobs).
  var ACCESS_ITEMS = '(courses?|certification( course| program| exam)?|get certified|become certified|certified (shopper|specialist|program)|directory|study guide|score guarantee|(registration|starter|welcome) (packet|kit|pack)|enrollment|enrolment|membership (fee|upgrade|level|plan)|(clearance|placement|processing|registration|enrollment|application|activation) (fee|charge|contribution|cost|payment)|portal access|private (job )?portal)';
  var FEE_TYPES = '(registration|application|processing|training|onboarding|starter[- ]?kit|equipment|enrollment|enrolment|placement|activation|membership|admin(istration)?|security)';
  var NOT_PAYROLL = /\b(direct deposit|payroll|paycheck|early (wage |pay )?access|earned wage access|401\(?k\)?|hsa|fsa|retirement|pension)\b/i;

  // A job ad that turns out to be a commission business you buy into: you
  // sign up as an "independent" distributor, agent or affiliate and pay to
  // start. (Multi-level marketing is not automatically illegal, so this is a
  // reason to ask, never called a scam.)
  var INDEPENDENT_ROLE = /\bindependent (travel )?(distributors?|business owners?|business partners?|affiliates?|ibos?)\b|\bindependent (travel )?(agents?|advisors?|contractors?|consultants?|associates?|representatives?|reps?|members?)\b[^.\n]{0,30}\b(agreements?|program|role|position|opportunity|application|enrol+ment|kit|account|package)\b|\b(enrol+\w*|register\w*|sign\w* up|join\w*|start\w*|become)\b[^.\n]{0,15}\bas an? (independent )?(travel )?(agent|distributor|affiliate|ambassador|business owner|ibo)\b/i;
  // A fee named as the cost of joining, or an amount to start or each month.
  var JOIN_FEE_NAMED = /\b(set-?up|start-?up|starter|enrol+ment|monthly|annual|yearly|management|membership|subscription|platform|host(ing)?|host agency|website|back[- ]?office|activation|joining|sign[- ]?up|registration|technology|tech|renewal|business (center|centre|kit|package))\s+(fees?|costs?|charges?|dues|subscriptions?)\b/i;
  var JOIN_FEE_AMOUNT = new RegExp(MONEY + '(\\.\\d+)?\\s*(\\/ ?mo(nth)?\\b|per month\\b|a month\\b|monthly\\b|each month\\b|up ?front\\b|one[- ]time\\b|to (start|join|enrol+|get started|activate|begin)\\b)', 'i');
  var JOIN_FEE_WORD = /\b(fees?|costs?|subscriptions?|charges?|pay|invest\w*|dues|price|purchase|buy|activat\w*|one[- ]time|due|enrol+\w*|sign[- ]?up|join\w*|get started)\b/i;
  var EARNINGS_WORD = /\b(earn\w*|salary|wages?|income|paid|stipend|commissions?|bonus(es)?|averag\w*|making|takes? home|bring in|pay (you|employees|staff))\b|\bmake (up to |over |about |around )?[$£€₹\d]|\b(we|they|the company|employer)\s+(will\s+)?pay\b/i;
  // Not a fee to join: a cut taken from what you earn, a franchise's
  // disclosed fees, licensing and exam costs, or "no fee".
  var NOT_A_JOIN_FEE = /%|\bpercent\b|\bdeducted\b|\bwithheld\b|\b(taken|comes?) (out )?(of|from) (your |each )?(earnings|payouts?|sales?|bookings?|commissions?)\b|\bfranchis\w*|\b(licen[cs]\w* (exams?|tests?|course)|state licen[cs]\w*|pre-?licens\w*|errors (and|&) omissions|e&o|exams?|fingerprint\w*|background checks?)\b|\b(no|zero|without|free|waived?|never)\b[^.\n]{0,15}\b(fees?|costs?|charges?)\b|\bfree to (join|sign up|enrol+)\b|\bat no (cost|charge)\b/i;
  var SPONSOR_ID = /\b(sponsor|enroller)'?s? (id|i\.d\.|number|code)\b|\b(enrol+|sign\w* up|join|register)\w*\b[^.\n]{0,60}\busing my (code|link)\b/i;
  // v0.6: a payment to start, activate or unlock the "job", with or without
  // the word "independent": an investment, a starter or founder's pack, a
  // fee to register or be activated, an amount "to start".
  var START_PAY = /\b(start-?up|initial|business|training|one[- ]time) investment\b|\binvestment of\b|\b(start-?up|set-?up) costs?\b|\b(founder'?s?|founders|business|launch|success)( \w+)? (pack|package|kit|pass|bundle|toolkit)s?\b|\bunlocks? (your |the )?(full )?commissions?\b|\b(purchase|buy)\w* (of )?(the |a |an |our |your )?[\w' -]{0,30}\b(pack|package|toolkit|pass)\b/i;
  // (A plain registration, enrollment or certification fee is left to the
  // older pay-to-get-hired flags.) Not when the sentence is about pay.
  var PAY_IN_SENTENCE = /\b(earn\w*|salary|wages?|income|paid|stipend|bonus(es)?|per (hour|hr|week|month|year)|an hour|\/ ?(hr|hour|wk|week|yr|year))\b/i;
  var START_AMOUNT = new RegExp(MONEY + '(\\.\\d+)?\\s*(\\w+\\s+){0,2}to (start|get started|join|activate|be activated|enrol+|begin|secure your (spot|place|position|seat))\\b|\\bto (start|get started|join|be activated|activate (your|the) (account|business))\\b[^.\\n]{0,60}' + MONEY, 'i');
  // "You make it back on your first booking": a cost you are expected to recoup.
  var PAYBACK = /\b(make|earn|get|cover) (it|that|this|(your|their|the) (money|costs?|fees?|investment)) back\b|\bcover (your|their) (costs|investment|fees?)\b|\bpays? for itself\b/i;
  // A text that says plainly what the offer is (not employment, the income
  // disclosure) is not dressing a business up as a job.
  var HONEST_BUSINESS = /\b(not an employee|not an offer of employment|this is not a job|income disclosure|earnings disclosure)\b/i;
  var BUSINESS_CUE = /\b(commissions?|self[- ]employed|business|booking (site|website|tools|portal)|members?|advisors?|consultants?|concierge|ambassadors?|team|earn\w*|income|bonus(es)?)\b/i;
  // Duties that sell packages to customers are not purchases by you.
  var SELLS_IT = /\b(sell|sells|selling|sold)\b[^.\n]{0,30}\b(packs?|packages?|kits?|pass(es)?|memberships?)\b|\b(customers?|clients?|buyers?|patients?|guests?|students?)\b/i;

  // ── The flags ────────────────────────────────────────────────────────────
  // Order matters twice: it is the display order within a tier, and when two
  // flags of the same tier quote the same sentence, only the earlier one keeps
  // it (one sentence is one piece of evidence).
  // detect: 'auto'    → the rules find it reliably; a match is pre-ticked
  //         'partial' → the rules find some cases; the reader confirms the rest
  //         'manual'  → rules cannot judge it; the reader ticks it
  // patterns: each match quotes its sentence. unless: a sentence matching any
  // of these is skipped. negatable: skip when a negation word comes before the
  // match in the same sentence ("we will never ask you to pay").
  var FLAGS = [
    {
      id: 'pay-to-apply', tier: 'severe', detect: 'auto',
      label: 'Asks you to pay to get the job',
      detail: 'A fee, a starter kit, "training", equipment from their vendor, or money through gift cards, crypto or a payment app. Real employers do not charge candidates. (Your own boots or a state license exam are different.)',
      tip: 'Do not pay. Gift cards, wire transfers, crypto and payment apps are used because the money cannot be pulled back.',
      negatable: true,
      unless: [EMPLOYER_PAYS],
      patterns: [
        // A fee the candidate pays. "Collect security deposits" or "process
        // application fees" (a property manager's job) does not match.
        // ("Clients pay our placement fee" is a staffing agency describing its business.)
        { re: new RegExp('\\b(pay|paying|submit|send)\\b[^.\\n]{0,20}\\b(an? |the )?(one[- ]time |small |refundable )?(' + MONEY + ' )?' + FEE_TYPES + ' (fee|cost|deposit|charge)s?\\b', 'i'),
          unless: /\b(clients?|customers?|employers?|companies|businesses|tenants?|members?)\s+(pay|cover)\b/i },
        new RegExp('\\b' + FEE_TYPES + ' (fee|cost|deposit|charge)s? (of ' + MONEY + ' )?(is |are |will be )?(required|payable|due|applies|non[- ]refundable)\\b', 'i'),
        new RegExp(MONEY + '(\\.\\d+)? ' + FEE_TYPES + ' (fee|cost|deposit|charge)\\b', 'i'),
        // Not when a company is describing its customers or its market
        // ("money transfer operators like Western Union").
        { re: /\b(pay|send|sent|purchase|buy|deposit|transfer|load)\b[^.\n]{0,40}\b(gift ?cards?|itunes cards?|google play cards?|steam cards?|bitcoin|btc|crypto\w*|usdt|zelle|cash ?app|venmo|western union|moneygram)\b/i,
          unless: /\b(customers?|clients?|users?|merchants?|members?|players?|market|industry|operators?|competitors?|platform|like|such as|including)\b/i },
        /\b(gift ?cards?|bitcoin|zelle|cash ?app|venmo|western union|moneygram)\b[^.\n]{0,40}\b(payment|to (pay|purchase|buy)|to the vendor|to our vendor)\b/i,
        /\b(deposit|cash|mobile[- ]deposit)\b[^.\n]{0,30}\b(check|cheque)\b[^.\n]{0,80}\b(purchase|buy|send|forward|wire|vendor|supplier|return the (rest|remainder|balance|difference))\b/i,
        // "We will send you a check …". The words must be adjacent: "receive
        // shipments and check them against purchase orders" is warehouse work.
        /\b(send|sends|mail|mails|email|ship|ships|overnight|courier|issue)\w*\s+(you\s+)?(a\s+|an\s+|the\s+)?(cashier'?s\s+|certified\s+|company\s+)?(check|cheque|money order|image of a check)\b[^.\n]{0,80}\b(purchase|buy|equipment|supplies|software|shop|vendor|deposit|cash|cover)\w*\b/i,
        // Fake-check language: a check for the job to deposit, wait on, or cash.
        // ("Equipment check in/out" and "equipment check-in" are inspections.)
        { re: /\b(did|has|have|once|when|after|until) (the |your |my )?(check|cheque|funds?) (clear|cleared|clears|arrive|arrived|arrives|show|shows)\b|\bdeposit (the |this |that |your |it )?(check|cheque)\b|\bdeposit it (at|through|with|using) (an? |the |your )?(atm|banking app|mobile)|\b(starter[- ]kit|equipment|onboarding|setup|advance) (check|cheque)\b(?!\s*(in|out)\s*(\/|and|&|or)\s*(in|out)\b|-(in|out)\b|\s+out\b)/i,
          unless: /\b(customers?|members?|clients?|patrons?|paychecks?|direct deposit)\b/i },
        /\b(send|mail|email|issue|provide)\w*\b[^.\n]{0,20}\b(you )?(funds|money|an advance|advance funds)\b[^.\n]{0,40}\b(by check|to cover|in advance|ahead of)\b/i,
        // "Return the remaining balance", "send the vendor's portion".
        { re: /\b(remaining|leftover|rest of the|excess|difference)\b[^.\n]{0,30}\b(balance|funds|money|amount)\b[^.\n]{0,50}\b(return\w*|send|sent|wire\w*|transfer\w*|forward\w*)\b|\b(return\w*|send|sent|wire\w*|transfer\w*|forward\w*)\b[^.\n]{0,30}\b(remaining|leftover|the rest of the|excess)\b[^.\n]{0,20}\b(balance|funds|money|amount)\b/i,
          // (Moving "excess funds" between budget lines is a budget analyst's job.)
          unless: /\b(inventory|pto|vacation|leave|customers?|clients?|line items?|sub-?projects?|operating programs?|appropriations?|allotments?|budget\w*|fiscal)\b/i },
        /\b(remit|send|pay|transfer|wire)\w*\b[^.\n]{0,30}\b(the )?(vendor'?s|supplier'?s|equipment|kit|setup|workstation)\s+(portion|amount|payment|balance|cost|share)\b/i,
        // Your equipment bought from THEIR vendor. A buyer purchasing supplies
        // for the office from approved vendors is doing their job.
        { re: /\b(purchas|buy|bought|order)\w*\b[^.\n]{0,40}\b(from|through)\b[^.\n]{0,10}\b(our |the |a |an |their )?(approved|designated|preferred|certified|recommended|partner)? ?(vendor|supplier|provider|them)\b/i,
          requires: /\b(your|you)\b[^.\n]*\b(equipment|laptop|workstation|computer|software|home office|monitors?|starter kit|devices?)\b|\b(equipment|laptop|workstation|computer|software|home office|monitors?|starter kit|devices?)\b[^.\n]*\b(your|you)\b/i,
          unless: /\b(for the (lab|team|office|company|department|site|store)|on behalf of|purchase orders?|procurement|inventory)\b/i,
          // "Buy it from our vendor, we'll reimburse you" is the scam itself.
          force: true },
        // Crypto as the way money moves, a "wallet" to send to, a crypto ATM.
        // ("We are building our own Bitcoin ATM", "a payments and wallet
        // system" are crypto companies describing their product.)
        { re: /\b(pay|send|deposit|transfer|top[- ]?up|verify|activate|load)\w*\b[^.\n]{0,40}\b\d[\d,]*(\.\d+)?\s?(usdt|eth|btc|tether)\b|\b(use|go to|visit|at|through|via) (a |the |any |your )?(nearest )?(crypto|bitcoin) atm\b|\b(crypto|bitcoin) atm (near|close to) (you|u)\b|\b(send|deposit|transfer|pay)\b[^.\n]{0,25}\bto (the|our|this|that|a|my) (\w+ )?wallet\b/i,
          unless: /\b(customers?|users?|clients?|merchants?|businesses|process(es|ing)|payments? (for|to))\b/i },
        // "Return the extra $3,000", "send the installer's portion".
        new RegExp('\\b(return|send|refund|transfer|wire)\\b[^.\\n]{0,20}\\bthe (extra|overpaid|overpayment|excess|difference)\\b|\\b(send|pay|transfer|remit|wire)\\b[^.\\n]{0,15}\\b(the )?\\w+\'s (portion|share|cut|payment)\\b', 'i'),
        // You pay now, "reimbursed in your first paycheck": the reimbursement promise is the tell.
        { re: /\b(pay|purchase|buy|send)\w*\b[^.\n]{0,80}\b(reimburs\w*|refund\w*|repaid|paid back)\b[^.\n]{0,30}\b(on|in|with|from) (your )?(first )?(paycheck|pay ?check|salary|pay)\b/i, force: true },
        // A check in the mail to deposit, however it is phrased.
        { re: /\b(get|receive|send|mail)\w*\b[^.\n]{0,15}\b(a |the )?(check|cheque)\b[^.\n]{0,15}\b(in the mail|by mail|in mail)\b/i, requiresText: /\bdeposit/i },
        // Gift or voucher cards to buy and send codes for.
        { re: /\b(need|buy|purchase|get|pick up|load)\w*\b[^.\n]{0,40}\b(gift|voucher|prepaid|itunes|apple|google play|steam|ebay|reload) ?cards?\b/i,
          requiresText: /\b(codes?|scratch|pictures?|photos?|send (me|us|them))\b/i,
          unless: /\b(customers?|employees?|recognition|raffle|prizes?)\b/i },
        // "You must buy …" counts only for what scammers sell, never job costs.
        { re: /\b(you|applicants?|candidates?|new hires?)\b[^.\n]{0,40}\b(must|will|need to|needs to|required to|have to)\b[^.\n]{0,25}\b(pay|purchase|buy)\b[^.\n]{0,40}\b(kit|course|training|software|laptop|equipment|package|membership|fee|deposit|program|certificate)\b/i, unless: JOB_COST }
      ]
    },
    {
      id: 'pay-to-unlock', tier: 'severe', detect: 'auto',
      label: 'Asks you to deposit money to unlock tasks or earnings',
      detail: 'A "task" job where you rate apps, boost products or complete orders, then must deposit or "recharge" (often in crypto) to unlock more tasks or withdraw your pay. The deposits are never returned.',
      tip: 'Do not deposit anything. If you already did, stop: the next request will be bigger.',
      unless: [NOT_PAYROLL],
      patterns: [
        // A deposit that UNLOCKS something. "Commission-based pay … continue to
        // receive commission" (sales) and "deposits, withdrawals" (a bank
        // teller's duties) are not.
        /\b(deposit|recharge|top[- ]?up)(?!s)\b[^.\n]{0,40}\b(unlocks?|activates?|upgrades?|to (unlock|activate|upgrade|access|start|continue|withdraw))\b[^.\n]{0,30}\b(tasks?|orders?|levels?|vip|premium|earnings|commissions?|wallet|account|withdrawals?)\b/i,
        /\b(unlock|activate|upgrade|withdraw)\w*\b[^.\n]{0,40}\b(by|after|requires?|need to)\b[^.\n]{0,20}\b(depositing|deposit|recharg\w*|top[- ]?up|fund\w*)\b/i,
        /\brecharge\w*\b[^.\n]{0,20}\b(your |the )?(account|balance|wallet|difference)\b/i,
        /\b(combination tasks?|lucky (bonus )?orders?|bonus orders?)\b/i,
        new RegExp('\\bbalance (now )?(shows|is|reads) (-|negative|minus)\\s?' + CUR + '?', 'i'),
        /\b(membership|account|vip) (upgrades?|levels?)\b[^.\n]{0,40}\b(unlock|higher[- ]paying|earn more|commission)\w*\b|\bupgrade your (membership|account|level)\b/i,
        { re: /\b(send|deposit|transfer|pay)\w*\b[^.\n]{0,40}\bwallet address\b|\bwallet address\b[^.\n]{0,40}\b(send|deposit|transfer|pay)\w*\b/i,
          unless: /\b(customers?|users?|clients?)\b/i }
      ]
    },
    {
      id: 'ids-before-interview', tier: 'severe', detect: 'auto',
      label: 'Asks for your SSN, SIN or passport before an interview',
      detail: 'These belong in verified HR paperwork after you accept an offer, never in an application or a first message.',
      tip: 'Do not send them. If you already did, see "If you already shared something" below.',
      negatable: true,
      offerGuard: true,
      unless: [DESCRIBES_PII, GOV_SSN, GOV_SSN_NOTICE],
      patterns: [
        /\b(send|provide|submit|upload|email|e-mail|share|include|attach|text|forward|fill in|enter|reply with|respond with|return)\b[^.\n]{0,60}\b(ssn|social security (number|card|no\.?)|social insurance (number|card)|s\.i\.n\.?|passport (number|copy|scan|photo|picture|details|page)|copy of (your )?passport|scan of (your )?(passport|national id)|national id (number|card|scan))\b/i,
        /\b(ssn|social security number|social insurance number|passport (number|copy|scan|photo|details))\b[^.\n]{0,40}\b(required|needed|to apply|with (your )?(application|resume|cv)|to (be )?considered|to proceed|before (the |an |your )?interview)\b/i
      ]
    },
    {
      id: 'reship-or-money-mule', tier: 'severe', detect: 'auto',
      label: 'Involves forwarding packages or money for someone else',
      detail: 'Reshipping and "payment processing" jobs that run through your own address or bank account move stolen goods or laundered money. You can be held liable.',
      tip: 'Walk away. If you already received packages or money, stop and report it.',
      negatable: true,
      unless: [/\b(direct deposit|payroll|paycheck|your (salary|wages|pay))\b/i],
      patterns: [
        // Job titles of reshipping scams. A company that SELLS package
        // forwarding to consumers is describing its product, not the job.
        // ("Package handler" is a real parcel-hub job title, so it is not here.)
        { re: /\b(reship\w*|re-ship\w*|package (inspector|reshipper)|parcel inspector|shipping (coordinator|inspector) from home|merchandise (inspector|forwarder))\b/i,
          unless: /\b(consumers|our service|platform|marketplace)\b/i },
        // Goods arriving at YOUR address or in YOUR name, sent on with labels they provide.
        { re: /\b(at|to) (your|ur) (home |own |residential )?(address|house|residence|door)\b|\bunder (your|ur) name\b/i,
          requiresText: /\b(labels?|forward\w*|reship\w*|post office|drop (them|it) off)\b/i,
          unless: /\b(paycheck|w-2|tax form|offer letter|benefits|badge|welcome kit|swag)\b/i },
        /\blabels?\b[^.\n]{0,30}\b(i |we )?(emailed|e-mailed|sent you|will send|provided by|in (your|ur) (email|inbox))\b[^.\n]{0,80}\b(parcels?|packages?|boxes|items|post office|ship\w*)\b|\b(parcels?|packages?|boxes)\b[^.\n]{0,80}\blabels?\b[^.\n]{0,20}\b(i |we )?(emailed|e-mailed|sent you|provided by|in (your|ur) (email|inbox))\b/i,
        /\bremove (the )?(store |retailer'?s? )?(invoices?|receipts?|packing slips?)\b|\bdo not open the (boxes|packages|parcels)\b/i,
        /\b(receive|accept|collect)\b[^.\n]{0,30}\b(packages?|parcels?|shipments?|merchandise)\b[^.\n]{0,40}\b(at|to) (your|my) (home|house|address|residence)\b/i,
        // Repacking alone is warehouse work (returns, restocking); stripping the
        // retailer's identity from the box is the reshipping tell.
        { re: /\b(forward|reship|re-ship|relabel|re-label|repackage|repack|re-pack)\w*\b[^.\n]{0,30}\b(packages?|parcels?|shipments?|merchandise|items|boxes)\b/i,
          requires: /\b(plain boxes|without (the )?(store|retailer)|branding|invoices?|overseas|abroad|to (our )?(clients?|customers?) (abroad|overseas|outside)|your (home|address))\b/i },
        /\b(your )?(home|residential|receiving) address\b[^.\n]{0,60}\b(drop point|drop-off point|receiving (point|hub|station)|registered)\b|\boutbound labels?\b[^.\n]{0,60}\b(parcels?|packages?|dispatch)\b|\bplain boxes\b/i,
        /\b(your (own |personal )?(bank|checking|savings|paypal) account)\b[^.\n]{0,60}\b(receive|transfer|forward|deposit|process)\w*\b[^.\n]{0,40}\b(payments?|funds|money|transfers?)\b[^.\n]{0,40}\b(clients?|customers?|company|on (our|their) behalf|to (our|another|a third))\b/i,
        /\b(receive|process|transfer|forward)\w*\b[^.\n]{0,30}\b(payments?|funds|money)\b[^.\n]{0,30}\b(into|through|via|using) your (own |personal )?(bank|checking|paypal)? ?account\b/i,
        // Money into your OWN account (or "their own local accounts"), then passed on.
        /\b(into|in|to|through|via) (your|ur|their own|their personal|their local) (own |personal |local |private )?(bank |checking )?accounts?\b[^.\n]{0,80}\b(forward|pass|transfer|send|wire|remit)\w*\b|\b(forward|pass|transfer|send|wire|remit)\w*\b[^.\n]{0,60}\b(from|out of) (your|ur) (own |personal )?(bank )?accounts?\b/i,
        // Money into an account in YOUR name, then sent on.
        /\b(receive|accept|collect)\w*\b[^.\n]{0,60}\b(payments?|funds|money|transfers?|ach|wires?)\b[^.\n]{0,60}\b(account|accounts) in your (own )?name\b|\baccount in your (own )?name\b[^.\n]{0,80}\b(forward|transfer|send|wire|digital currency|crypto)\w*\b/i,
        // "Receive payments … and forward them to our vendors / overseas."
        /\b(receive|accept|collect)\w*\b[^.\n]{0,30}\b(payments?|funds|money)\b[^.\n]{0,40}\b(forward|transfer|send|wire)\w*\b[^.\n]{0,30}\b(vendors?|suppliers?|our (clients?|partners?)|overseas|abroad|another account|third part(y|ies))\b/i
      ]
    },
    {
      id: 'account-access', tier: 'severe', detect: 'auto',
      label: 'Asks for your banking login, passwords or remote access to your device',
      detail: 'No employer needs your online banking username or password, a one-time code, or remote control of your computer. Payroll needs a routing and account number from a verified HR system, nothing more.',
      tip: 'Do not share it. If you already did, call your bank now and change your passwords.',
      negatable: true,
      patterns: [
        // Banking logins only: "log into your USAJOBS account (Account Login)"
        // is how real job sites work.
        /\b(online banking|bank(ing)?|bank account|checking account)\s+(username|user ?name|password|login|log-?in|credentials|pin)\b/i,
        { re: /\b(send|share|give|tell|provide|text|read|reply with|respond with)\w*\b[^.\n]{0,40}\b(password|passcode|pin|access code|verification code|security code|one[- ]time (code|password)|2fa code|login details)\b/i,
          unless: /\b(customers?|users?|clients?|members?)\b/i },
        { re: /\b(install|download|run|open)\w*\b[^.\n]{0,40}\b(remote (support|access|desktop|control) (tool|app|software|program)|anydesk|teamviewer|screen[- ]?shar\w* (app|tool|software))\b/i,
          unless: /\b(customers?|users?|clients?|end[- ]users?|troubleshoot\w*)\b/i },
        // A new account opened for the "employer" to control is a mule account.
        { re: /\bopen (a |an )?(new |separate |second )?(checking|bank|savings|business) account\b/i,
          requires: /\b(send|share|username|password|login|for (the )?(company|payroll|transfers?)|in your name|don'?t use your (main|own|personal))\b/i }
      ]
    },
    {
      id: 'secrecy', tier: 'severe', detect: 'auto',
      label: 'Tells you to keep it from your bank or family',
      detail: 'Scammers coach people to hide what is happening from bank tellers and relatives, because those are the people who would spot a fake check or a money-mule job. No real employer asks this.',
      tip: 'Stop and talk to your bank before you move any money. Then report it.',
      patterns: [
        /\b(don'?t|do not|never|no need to|must not|mustn'?t|should not|shouldn'?t|may not)\s+(tell|mention|inform|discuss|explain|say anything|talk about)\b[^.\n]{0,60}\b(bank|teller|banker|family|relatives|friends|spouse|husband|wife|parents)\b/i,
        /\b(if|when)\s+(the |your )?(bank|teller)\s+(asks|questions)\b[^.\n]{0,60}\b(say|tell (them|her|him)|it'?s|it is)\b/i,
        /\bkeep (this|it|our)( \w+)? (confidential|private|secret|between us)\b[^.\n]{0,40}\b(bank|teller|family|relatives|friends|spouse|parents)\b/i
      ]
    },
    {
      id: 'paperwork-before-interview', tier: 'hard', detect: 'auto',
      label: 'Wants hiring paperwork, ID or card details before any interview',
      detail: 'I-9s, tax forms, ID scans and payment cards come after an offer, through HR. Asking for them first, or to "verify your identity" with a debit card, is how identity theft starts.',
      tip: 'Say you will complete paperwork after an interview and a written offer. A real employer will agree.',
      patterns: [
        /\b(i-9|w-4|w4|tax forms?|payroll forms?|direct deposit (forms?|details|setup)|onboarding (forms|documents|paperwork)|pre-employment verification|verification documents?|id|identification|passport|driver'?s licen[cs]e|ssn|social security)\b[^.\n]{0,100}\bbefore (we can )?(schedul\w+ )?(your|the|an|any) interview\b/i,
        /\bbefore (we can )?(schedul\w+ )?(your|the|an|any) interview\b[^.\n]{0,100}\b(i-9|w-4|tax forms?|payroll forms?|direct deposit|verification|upload|passport|driver'?s licen[cs]e|ssn|social security|date of birth|bank\w*)\b/i,
        /\bverify (your )?identity (with|using) (a |an |your )?(credit|debit|bank|payment)( or (credit|debit))? card\b/i,
        /\b(register|add|link|enter)\w*\b[^.\n]{0,20}\byour (payment|credit|debit|bank) card\b/i,
        /\b(front and back|both sides)\b[^.\n]{0,40}\b(debit|credit|bank|payment) card\b|\b(photo|picture|scan|image)s? of (the front and back of )?(your )?(debit|credit|bank|payment) card\b/i,
        /\bselfie\b[^.\n]{0,30}\b(holding|with)\b[^.\n]{0,20}\b(id|identification|passport|licen[cs]e)\b/i
      ]
    },
    {
      id: 'bank-question', tier: 'hard', detect: 'auto',
      label: 'Screens you on your bank account or mobile deposit',
      detail: '"Do you have a checking account with mobile deposit?" is not an interview question. It is how fake-check scammers find out whether you can deposit their check.',
      tip: 'Do not answer, and do not deposit any check they send.',
      patterns: [
        /\bdo you (have|use) (a |an )?(checking|bank|savings|personal) account\b/i,
        /\b(do|can) you\b[^.\n]{0,30}\bmobile deposit\b/i,
        /\bmobile deposit\s*\?/i
      ]
    },
    {
      id: 'lookalike-domain', tier: 'hard', detect: 'auto',
      label: 'Email comes from a lookalike of the company\'s domain',
      detail: 'Scammers register addresses like company-careers.co or companyhr.net next to the real company.com. A real recruiter writes from the exact domain on the company\'s website.',
      tip: 'Compare the email domain letter by letter with the company website, then contact the company through its website.',
      check: function (text) {
        var hits = [];
        var emails = [], sites = [], m;
        var EM = /\b[\w.+-]+@([a-z0-9-]+(?:\.[a-z0-9-]+)+)\b/gi;
        var WEB = /\b(?:https?:\/\/)?(?:www\.)([a-z0-9-]+(?:\.[a-z0-9-]+)+)\b/gi;
        while ((m = EM.exec(text))) emails.push({ domain: m[1].toLowerCase(), at: m.index, len: m[0].length });
        while ((m = WEB.exec(text))) sites.push(m[1].toLowerCase());
        if (!emails.length || !sites.length) return hits;
        var stem = function (d) { return d.split('.')[0]; };
        emails.forEach(function (e) {
          sites.forEach(function (s) {
            var es = stem(e.domain), ss = stem(s);
            if (e.domain === s || e.domain.slice(-(s.length + 1)) === '.' + s) return; // same domain or a subdomain
            if (ss.length >= 4 && es !== ss && es.indexOf(ss) >= 0) {
              eachSentence(text, function (sn) {
                if (!hits.length && e.at >= sn.start && e.at < sn.start + sn.text.length) hits.push(hit(sn, e.at - sn.start, e.len));
              });
            }
          });
        });
        return hits;
      }
    },
    {
      id: 'pay-to-join', tier: 'hard', detect: 'auto',
      label: 'It\'s a business you pay to join, not a salaried job',
      detail: 'You would sign up as an "independent" distributor, agent or affiliate and pay a setup, enrollment or monthly fee, or enter a "sponsor ID". That is buying into a commission business, often multi-level marketing, not being hired. Some of these businesses are legal; none of them is the salaried job the ad described.',
      tip: 'Ask one question: is this a salaried job paid by a named employer, or a commission business you\'d have to pay to join?',
      check: function (text) {
        var hits = [];
        // The text puts you in an "independent" role you sign up for (not
        // "you are an employee, not an independent contractor").
        var joins = false;
        eachSentence(text, function (s) {
          var m = INDEPENDENT_ROLE.exec(s.text);
          if (m && !NEGATION.test(s.text.slice(Math.max(0, m.index - 25), m.index))) joins = true;
        });
        var honest = HONEST_BUSINESS.test(text);
        var business = BUSINESS_CUE.test(text);
        var money = new RegExp(MONEY, 'i');
        eachSentence(text, function (s) {
          var m = SPONSOR_ID.exec(s.text);
          if (m) { hits.push(hit(s, m.index, m[0].length)); return; }
          if (honest || NOT_A_JOIN_FEE.test(s.text) || EMPLOYER_PAYS.test(s.text) || /\boptional\b|\bsold at (our )?cost\b/i.test(s.text)) return;
          if (joins) {
            m = JOIN_FEE_NAMED.exec(s.text);
            if (!m && JOIN_FEE_WORD.test(s.text) && !EARNINGS_WORD.test(s.text)) m = JOIN_FEE_AMOUNT.exec(s.text);
          }
          // v0.6: paying to start or activate, in a text about earning
          // commission or running "your business".
          if (!m && business && !SELLS_IT.test(s.text)) {
            var paid = money.test(s.text);
            var bare = s.text.replace(PAYBACK, '');
            m = (paid && START_PAY.exec(s.text)) ||
              (!PAY_IN_SENTENCE.test(bare) && START_AMOUNT.exec(s.text)) ||
              (money.test(text) && PAYBACK.exec(s.text)) || null;
          }
          if (m && !NEGATION.test(s.text.slice(Math.max(0, m.index - 25), m.index))) hits.push(hit(s, m.index, m[0].length));
        });
        return hits;
      }
    },
    {
      id: 'salary-mismatch', tier: 'hard', detect: 'auto',
      label: 'The "salary" isn\'t a salary',
      detail: 'The ad quotes a salary, but the text also says the pay is commission only, there is no base pay, or you would be an independent contractor. A salary figure on a commission business is how a sales pitch gets dressed up as a job.',
      tip: 'Ask one question: is this a salaried job paid by a named employer, or a commission business you\'d have to pay to join? Ask for the base pay in writing.',
      check: function (text) {
        var hits = [];
        // A real base or a draw makes "salary plus commission" an ordinary
        // sales job: on-target earnings (OTE) included.
        // A text that states plainly it is not employment hides nothing.
        if (HONEST_BUSINESS.test(text)) return hits;
        var base = /\b(salary|base|hourly)\b[^.\n]{0,40}\b(plus|\+|and|with)\b[^.\n]{0,15}\b(commissions?|bonus(es)?|incentives?)\b|\bbase (salary|pay|wage)\b|\b(on top of|in addition to) (your |the )?(base|salary)\b|\bguaranteed (base|salary|minimum|hourly)\b|\bdraw (against|on) commissions?\b|\b(non-)?recoverable draw\b|\d\s?k?\s+basic\b|\bretainer\b|\bw-?2\b/gi;
        // On-target earnings imply a base, unless the role is self-employed.
        var ote = /\bote\b|\bon[- ]target earnings\b/gi;
        var self = /\bself[- ]employed\b|\bindependent (contractor|business owner)s?\b/i.test(text);
        var m, real = false;
        [base].concat(self ? [] : [ote]).forEach(function (re) {
          while (!real && (m = re.exec(text))) {
            if (!NEGATION.test(text.slice(Math.max(0, m.index - 20), m.index))) real = true;
          }
          re.lastIndex = 0;
        });
        if (real) return hits;
        var SAL = new RegExp('\\b(salary|salaried|pay range|compensation range|annual pay|yearly pay)\\b[^.\\n]{0,40}' + MONEY + '|' + MONEY + '[^.\\n]{0,40}\\b(salary|salaried)\\b|^(pay|compensation)\\s*:\\s*' + MONEY, 'i');
        // v0.6: any yearly-sized figure ("$65,000 - $80,000 + super", "$45K"),
        // which counts only against a plain statement that there is no wage.
        var FIG = new RegExp(CUR + '\\s?(\\d{2,3},\\d{3}|\\d{2,3}\\s?k)\\b', 'i');
        var COMM = /\b(commission[- ]only|100 ?% commission(ed)?|straight commission|commission[- ]based (role|position|job|pay|compensation|opportunity|income)|(position|role|job|pay|compensation|income|this) (is )?(entirely |purely |fully |strictly )?commission[- ]based|(purely|solely|entirely|strictly|only) (on |by |through )?commissions?|paid (only |solely |entirely |strictly )?(on|by|through|in) commissions?|no base (pay|salary|wage)|without (a |any )?base (pay|salary|wage)?|no (guaranteed|fixed|set) (pay|salary|wage|income)|not a salaried (position|role|job)|there is no salary)\b/i;
        var NO_WAGE = /\b(commission[- ]based (independent|self)|self[- ]employed|independent business owners?|not paid (a )?salar(y|ies)|tiered (performance|compensation|commission|bonus) plan|(income|earnings|pay|compensation)\b[^.\n]{0,15}\b(is |are )?(based (entirely |solely |only )?on|depends? on|comes? (only )?from|earned through)\b[^.\n]{0,25}\b(personal production|production|your (own )?(sales|bookings|client base)|building|team|recruit\w*|commissions?|(a |our )?tiered))/i;
        var WEAK = /\b(independent (contractor|agent|distributor|business owner|affiliate)|1099)\b/i;
        var salary = null, salaryWord = false, fig = null, noWage = null, comm = null, weak = null;
        eachSentence(text, function (s) {
          var a = SAL.exec(s.text);
          if (a && !salary && !NEGATION.test(s.text.slice(Math.max(0, a.index - 20), a.index))) {
            salary = hit(s, a.index, a[0].length);
            salaryWord = /\bsalar(y|ied)\b/i.test(a[0]);
          }
          // A headline figure, not an earnings claim ("top agents earn $80,000").
          var f = FIG.exec(s.text);
          // (Nor a price: a franchise fee or an investment is money you pay.)
          if (f && !fig && !/\b(earn\w*|average\w*|median|top|typical\w*|disclos\w*|potential|up to|fees?|costs?|invest\w*|deposits?|price|franchis\w*)\b/i.test(s.text)) fig = hit(s, f.index, f[0].length);
          var n = NO_WAGE.exec(s.text);
          if (n && !noWage && !NEGATION.test(s.text.slice(Math.max(0, n.index - 20), n.index))) noWage = hit(s, n.index, n[0].length);
          var c = COMM.exec(s.text);
          if (c && !comm && !NEGATION.test(s.text.slice(Math.max(0, c.index - 20), c.index))) comm = hit(s, c.index, c[0].length);
          var w = WEAK.exec(s.text);
          if (w && !weak && !NEGATION.test(s.text.slice(Math.max(0, w.index - 25), w.index))) weak = hit(s, w.index, w[0].length);
        });
        // An independent contractor or 1099 role counts only against a figure
        // the ad itself calls a "salary".
        var why = comm || noWage || (salaryWord ? weak : null);
        if (!salary && noWage) { salary = fig; why = noWage; }
        if (!salary || !why) return hits;
        hits.push(why);
        if (salary.sentence !== why.sentence) hits.push(salary);
        return hits;
      }
    },
    {
      id: 'pays-for-access', tier: 'hard', detect: 'auto',
      label: 'Charges you for training, certification or access to jobs',
      detail: 'A course, "certification", directory, study guide, membership or "processing" you must buy to get the work. The FTC\'s rule of thumb: never pay to get a job.',
      tip: 'Ask whether the employer pays for it. If you must pay before you can work, walk away.',
      // (Buying course materials for an employer and a government "payment
      // certification" process are duties of the job, not costs to you.)
      // (v0.6: a licensing course and state exam for a licensed job are the
      // job's own costs; an optional kit sold at cost is not a condition.)
      unless: [EMPLOYER_PAYS, /\bprocur(e|es|ed|ing|ement)\b|\bpayment certification\b|\bcertifying officers?\b/i, /\bpre-?licens\w*|\bstate (licens\w* )?exams?\b|\boptional\b|\bsold at (our )?cost\b/i, /\b(fingerprint\w*|background check|drug (test|screen)\w*|uniforms?|boots|tools|licen[cs]e fee|licensing fee|exam fee|per (hour|hr|week|month|year)|\/(hr|hour|week|month|year)|an hour|salary|wages?|bonus|commission|stipend|reimburs\w*|allowance|budget|benefits?|gym|discount|free|over the course of|worth|valued at|courses should|earn)\b/i],
      patterns: [
        new RegExp('(' + MONEY + ')[^.\\n]{0,60}\\b' + ACCESS_ITEMS + '\\b|\\b' + ACCESS_ITEMS + '\\b[^.\\n]{0,60}(' + MONEY + ')', 'i'),
        // Sellers of "guaranteed" jobs and hidden-job lists.
        /\bguarantee\w* (you )?(a )?(job )?(placement|position|job)\b|\bor your money back\b|\bmoney[- ]back guarantee\b|\bnever (advertised|posted) to the public\b|\bnot (posted|advertised) on (public )?job boards\b/i,
        // Registration or a visa through "our agency" that costs you money.
        new RegExp('\\b(registration|enrollment|enrolment|sign[- ]?up|visa (application|processing|sponsorship)|agency)\\b[^.\\n]{0,40}\\b(costs?|is|of|fee)\\b[^.\\n]{0,15}(' + MONEY + ')', 'i')
      ]
    },
    {
      id: 'money-request', tier: 'hard', detect: 'auto',
      label: 'Asks you to send, pay or return money',
      detail: 'Any request for you to pay, send, return or "top up" an amount, however it is worded: a deposit, a balance, a "tax" to withdraw, a uniform, an activation. Money flows from an employer to you, never the other way.',
      tip: 'Do not send anything. Ask who receives the money and why the employer cannot pay it.',
      // Not the employer paying, not a salary, not cash handled as a job duty.
      unless: [/\b(salary|wages?|paychecks?|per (\w+ )?(hour|hr|week|month|year|minute|word|page|task|mile|delivery)|\/(hr|hour|week|month|year)|an hour|direct deposit|payroll|receipts|cash drawers?|tills?|registers?|daily (cash|sales|deposits)|for the (office|team|company|store)|bonus|commission|tuition)\b/i],
      patterns: [
        // A REQUEST to you: "please send", "you must pay", "to activate, purchase…".
        // ("Pay" alone is usually a noun in job ads: "Base Pay $80,000".)
        { re: new RegExp('\\b(please|kindly|pls|must|need(s)? to|have to|required to|asked to|you(\'ll| will)? need to|(to|in order to) (activate|unlock|confirm|secure|receive|withdraw|start|proceed|release|begin|get started|complete|keep|reserve))\\b[^.\\n]{0,40}\\b(pay|send|transfer|wire|remit|top[- ]?up|deposit|buy|purchase|return)\\b[^.\\n]{0,30}(' + MONEY + '|\\b(the |your )?(balance|remainder|rest of the money|difference)\\b)', 'i'),
          // "We pay", "the company will send": the employer paying, not you.
          unless: /\b(we|they|the company|employer|employers|clients?|customers?|i)\s+(will\s+|'ll\s+|would\s+)?(pay|send|deposit|transfer|forward)\b/i },
        // A sentence that opens with the instruction: "Send $60 …", "Deposit it, … forward the balance".
        new RegExp('^(send|transfer|wire|remit|deposit|buy|purchase|forward|return)\\b[^.\\n]{0,60}(' + MONEY + '|\\b(the |your )?(balance|remainder|rest of the money|difference)\\b)', 'i'),
        /\bto withdraw\b[^.\n]{0,80}\b(tax|fee|deposit|pay|first)\b|\b(tax|fee)\b[^.\n]{0,40}\bbefore (you can )?withdraw/i,
        new RegExp('\\b(top[- ]?up|deposit) of (' + MONEY + '|\\d[\\d,]*)|\\b(level \\d|starter|premium|vip) (package|bundle)\\b[^.\\n]{0,40}\\b(minimum|\\d{2,}|unlock|withdraw)', 'i')
      ]
    },
    {
      id: 'email-mismatch', tier: 'hard', detect: 'auto',
      label: 'Claims to be a company recruiter but writes from a free email',
      detail: 'A recruiter at a real company writes from the company\'s own email domain. "HR at a well-known company" using Gmail, Outlook.com or Yahoo is impersonation. (Agency recruiters use their agency\'s domain, which is normal.)',
      tip: 'Find the company\'s careers page yourself and contact them there. Do not reply to the free address.',
      check: function (text) {
        var hits = [];
        // "a recruiter / HR … with|at|from <Company Name>": the role words in
        // any case, the company as a capitalized name.
        var claim = /\b(recruit(er|ing|ment)|talent( acquisition| team| partner)?|head of talent|human resources|hr|hiring (manager|team)|people (team|operations)|personnel)\s+(department\s+|team\s+|manager\s+|specialist\s+|coordinator\s+|officer\s+)?(with|at|from|for|of)\s+(the\s+)?/gi;
        var named = false, m0;
        while ((m0 = claim.exec(text))) {
          if (/^(?!(A|An|Our|Your|My)\b)[A-Z][\w&'-]+/.test(text.slice(m0.index + m0[0].length))) { named = true; break; }
        }
        // v0.6: or a signature line of its own, "Hiring Manager, <Company>".
        var sig = /(^|\n)[ \t]*(recruiter|talent (acquisition )?(partner|specialist|manager)|hiring manager|hr (manager|coordinator|specialist)|human resources (manager|coordinator))[ \t]*,[ \t]*/gi;
        while (!named && (m0 = sig.exec(text))) {
          if (/^(?!(A|An|Our|Your|My)\b)[A-Z][\w&'-]+/.test(text.slice(m0.index + m0[0].length))) named = true;
        }
        // Or the posting presents a large, established company: a real one
        // would not take applications at a free personal address.
        if (!named && !/\b(leading|largest|nationwide|national (chain|retailer|leader)|global (leader|company)|fortune \d+|more than \d[\d,]* (stores|locations|offices|employees|branches)|[\d,]{4,} employees)\b/i.test(text)) return hits;
        eachSentence(text, function (s) {
          var m = FREE_EMAIL.exec(s.text);
          if (!m) return;
          // A union's contact ("the exclusive representative is the
          // Association …, its President at …@gmail.com") is not the employer
          // claiming to recruit: unions often run on free email.
          var at = s.start + m.index;
          if (/\b(bargaining unit|labou?r (union|organi[sz]ation)|exclusive representative|union (president|steward|representative|local))\b/i.test(text.slice(Math.max(0, at - 250), at))) return;
          hits.push(hit(s, m.index, m[0].length));
        });
        return hits;
      }
    },
    {
      id: 'easy-money', tier: 'hard', detect: 'auto',
      label: 'Promises high income with little effort or no requirements',
      detail: 'Real jobs ask for something: skills, experience, credentials. "No experience, earn $1,200 a week" is a pitch, not a job.',
      tip: 'Ask what the actual daily work is. If nobody can tell you, there is no job.',
      check: function (text) {
        var hits = [];
        // "Be your own boss" and "unlimited earning potential" are everywhere in
        // real commission sales, so they are not evidence on their own.
        var hype = new RegExp('\\b(financial freedom|passive income|easy money|quick cash|fast cash|earn while you sleep|get paid to (text|chat|like|post|watch)|work (only )?\\d+ (hours?|hrs?) (a|per) (day|week) and (earn|make)|six[- ]figure income from home|make money (from|at) home|earn (up to )?' + MONEY + ' (a|per) day from home)\\b', 'i');
        eachSentence(text, function (s) {
          var m = hype.exec(s.text);
          if (m) hits.push(hit(s, m.index, m[0].length));
        });
        // Little time for a lot of money, or pay that is "guaranteed".
        var effort = new RegExp('\\b(\\d+\\s?(-|–|to)\\s?\\d+|one|two|a (few|couple of)|\\d+) (hours?|hrs?) (a|per) day\\b[^.\\n]{0,60}' + MONEY + '|' + MONEY + '[^.\\n]{0,40}\\b(a|per) (week|day)\\b[^.\\n]{0,30}\\bguaranteed\\b|\\bguaranteed\\b[^.\\n]{0,20}' + MONEY, 'i');
        eachSentence(text, function (s) {
          // A guaranteed base salary or minimum is an ordinary pay structure.
          if (/\b(base (salary|pay)|minimum|per mile|salary)\b/i.test(s.text)) return;
          var m = effort.exec(s.text);
          if (m) hits.push(hit(s, m.index, m[0].length));
        });
        if (ENTRY.test(text)) {
          var promise = new RegExp('\\b(earn|make|take home|guaranteed)\\b[^.\\n]{0,25}' + MONEY + '\\s*(k\\b)?[^.\\n]{0,15}\\b(a|per|\\/|each)\\s*(day|week|wk)\\b|\\bguaranteed (income|pay|earnings)\\b', 'i');
          eachSentence(text, function (s) {
            var m = promise.exec(s.text);
            if (m) hits.push(hit(s, m.index, m[0].length));
          });
        }
        return hits;
      }
    },
    {
      id: 'implausible-pay', tier: 'hard', detect: 'partial',
      label: 'Pay is implausibly high for the role',
      detail: 'A weekly or hourly figure far above market for entry-level or part-time work is bait: it is there to switch off your doubts.',
      tip: 'Look the role up on a salary site for your city. 40% or more above what comes back is a reason to ask why. Indeed\'s salary pages are a good place to start: indeed.com/career/salaries, or your own country\'s Indeed site.',
      check: function (text) {
        var hits = [];
        // "Part-time" or "flexible hours" somewhere in a 30,000-character
        // government posting says nothing about the pay; in long postings only
        // "no experience" opens this check.
        var lowBar = ENTRY.test(text) || (text.length < 4000 && /\bpart[- ]time\b|\bfrom home\b|\bflexible hours\b/i.test(text));
        if (!lowBar) return hits;
        eachSentence(text, function (s) {
          if (/\b(per annum|salary|representative rate|grade|gs-\d+|pay scale|locality)\b/i.test(s.text)) return;
          PAY_QUOTE.lastIndex = 0;
          var m;
          while ((m = PAY_QUOTE.exec(s.text))) {
            var usd = parseFloat(m[2].replace(/,/g, '')) * (m[3] ? 1000 : 1) * toUsd(m[1]);
            var unit = m[4].toLowerCase();
            var high = (unit === 'hour' || unit === 'hr') ? usd >= 40
              : unit === 'day' ? usd >= 300
              : usd >= 1000; // per week
            if (high) { hits.push(hit(s, m.index, m[0].length)); break; }
          }
        });
        return hits;
      }
    },
    {
      id: 'task-pay', tier: 'hard', detect: 'auto',
      label: 'Pays per "task" for rating, liking or boosting things',
      detail: 'Rating apps, liking videos or "optimizing" products for a commission per task is how task scams begin, before the deposits start.',
      tip: 'Search the company and the app name with the word "scam". Never pay to receive work.',
      patterns: [
        // Real field-task apps pay per task for physical work in stores; the
        // scam version is online ratings, likes and "orders".
        { re: /\b(per task|each task|task commissions?|commission per (task|order|rating)|sets? of (\d+ )?tasks|\d+ (\w+ ){0,3}(tasks|orders|ratings) (a|per) day)\b/i,
          requires: /\b(earn\w*|commissions?|paid|pay|income|usdt)\b|[$£€₹]/i,
          unlessText: /\b(stores? near you|in stores?|restock\w*|deliver(y|ies)|in[- ]person|on[- ]site|shelf|shelves|errands?|merchandis\w+)\b/i },
        /\b(like|follow|subscribe to|watch|rate)\w* \d+ (videos?|posts?|apps?|hotels?|products?|channels?|accounts?)\b|\bvip ?\d\b|\bvip (level|group|tier|member)s?\b[^.\n]{0,40}\b(tasks?|ratings?|orders?|pay|income)\b/i,
        // "Optimize product listings … earn commission" is e-commerce work, so
        // commission alone is not enough: it must run on their app or per task.
        /\b(rate|rating|review|like|liking|boost\w*|optimi[sz]\w*|click\w*)\b[^.\n]{0,25}\b(apps?|hotels?|videos?|products?|movies?|restaurants?|trailers?|films?)\b[^.\n]{0,50}\b(on (our|the|a|their) (app|platform)|from your phone|per task|for each task)\b/i,
        // "Simple online tasks from your phone, $150–$450 a day."
        /\b(simple|easy|basic)\s+(online\s+)?tasks\b[^.\n]{0,60}\b(phone|app|platform|per day|a day|daily)\b|\b(earn|make)\b[^.\n]{0,40}\b(per|a) day\b[^.\n]{0,40}\b(simple|easy)\s+(online\s+)?tasks\b/i,
        /\beach set of \d+ (ratings|reviews|tasks|orders)\b|\bcommission on every completed set\b/i,
        // Paid fake reviews: buy the product yourself, post 5 stars, get "refunded".
        /\b(buy|purchase)\w*\b[^.\n]{0,40}\bproducts?\b[^.\n]{0,60}\b(5|five)[- ]star (reviews?|ratings?)\b|\bleave\b[^.\n]{0,20}\b(5|five)[- ]star (reviews?|ratings?)\b|\bwith your own (funds|money)\b[^.\n]{0,60}\b(refund\w*|reimburs\w*)\b/i
      ]
    },
    {
      id: 'paid-program', tier: 'hard', detect: 'auto',
      label: 'Pushes you toward a paid webinar, course, kit or coaching program',
      detail: 'When the "training" is the product, or you are told to build a team or downline, it is a sales funnel or multi-level marketing, not employment.',
      tip: 'A real employer does not make you buy anything before you can do the work.',
      negatable: true,
      // (A government purchase cardholder buys for the agency: a duty.)
      unless: [EMPLOYER_PAYS, /\bpurchase card(holder)?s?\b/i],
      patterns: [
        /\b(purchase|buy|invest in|pay for)\b[^.\n]{0,40}\b(course|certification program|training (program|package|materials?)|coaching|mentorship|starter kit|business kit|business package|license package|(your own|initial|starter) inventory|leads package)\b/i,
        // Not when MLM is only named as past experience ("… a plus").
        /\b(your upline|personal volume|starter inventory|launch (kit|pack|package)|fast start bonus|sharing the opportunity|stay (active|qualified)\b[^.\n]{0,40}\bcommissions?)\b/i,
        // The recruiting pitch itself. ("A proven system" and "more than a
        // 9-to-5" are ordinary sales-hiring language, so they are not here.)
        /\b(it'?s )?not (just )?a job,? it'?s a\b|\bbusiness opportunity\b[^.\n]{0,40}\b(not a job|from (your|my) phone|around (my|your) kids)\b|\bwork from my phone\b/i,
        { re: /\b(recruit (others|friends|family|your own team)|downline|network marketing|multi[- ]level marketing|\bmlm\b)\b/i,
          unless: /\b(experience|background)\b[^.\n]{0,60}\b(in|with)\b|\ba plus\b|\bpreferred\b/i },
        // "Residual income as you build your customer base" is ordinary sales
        // pay; it counts when it comes from recruiting others.
        { re: /\bresidual income\b/i, requires: /\b(others|downline|recruit\w*|your (own )?team)\b/i },
        // "Build a team of best-in-class editors" is management. Building your
        // team counts only when it is tied to what you earn.
        { re: /\bbuild (your|a) (own )?team\b/i, requires: /\b(earn|income|commissions?|bonus(es)?|overrides?)\b/i },
        /\b(attend|register for|sign up for|join|watch)\b[^.\n]{0,30}\b(our |a |the |free )?(webinar|masterclass|online seminar|info(rmation)? session)\b[^.\n]{0,80}\b(earn|income|opportunity|financial|start (making|earning))\b/i,
        // v0.5: the pitch of a business you join. ("Manage our network of
        // independent distributors" is a sales manager's job, so becoming one
        // is what counts.)
        /\bmultiple streams of (passive |residual )?income\b/i,
        // v0.6: pay for bringing other people in, however it is worded. (An
        // employee referral bonus pays when someone is hired, which is ordinary.)
        { re: /\b(earn\w*|paid|bonus(es)?|income|overrides?|commissions?|a cut|rewards?)\b[^.\n]{0,60}\b(new )?(members?|advisors?|people|friends|mates|recruits|others|agents|consultants|distributors)\b[^.\n]{0,25}\b(you|they|u) (bring|recruit|sponsor|enrol+|refer|introduce|mentor|sign)\w*|\b(earn\w*|paid|bonus(es)?|income|rewards?)\b[^.\n]{0,40}\b(when|as|if|once|each time|every time|whenever) (your |ur |their )?(friends|mates|recruits|referrals|people|others|team) (join|sign up|enrol+|start|buy)\w*|\b(help|helping) (others|people|friends|family) (start|join|launch)\b[^.\n]{0,40}\b(business|team)\b|\b(earnings|income|pay|compensation)\b[^.\n]{0,15}\b(is |are )?(based (entirely |solely |only )?on|depends? on|comes? from)\b[^.\n]{0,40}\b(team (development|building|volume|sales)|building (your |a )?(own )?([\w ]{0,20} and )?(sales )?team|recruit\w*)\b|\bget (you|u) in under me\b|\blist of \d{2,} (people|names|contacts|friends)\b/i,
          unless: /\b(hired|hire|hires|employee referral|referral bonus)\b/i },
        /\b(become|join\w*|sign\w* up|enrol+\w*|register\w*|start\w*)\b[^.\n]{0,20}\bas an? independent (distributor|business owner|ibo|affiliate)\b|\bindependent (distributor|business owner|ibo) (agreement|kit|id|program|opportunity|application|enrol+ment)\b/i,
        SPONSOR_ID
      ]
    },
    {
      id: 'no-interview-offer', tier: 'hard', detect: 'auto',
      label: 'Offers you the job without an interview',
      detail: 'Real employers talk to you before they hire you. "You have been selected" out of the blue, or "no interview required", skips the step scammers can\'t fake.',
      tip: 'Ask for a video interview with a named person, then confirm that person works there.',
      patterns: [
        /\bno (job )?interviews?\b(?! (slots?|times?|availability|scheduled))/i,
        { re: /\b(management|hr|we|the (company|team))\s+(has |have )?(approved|hired|selected) you\b|\byou('ve| have) been (approved|hired)\b/i,
          unless: /\b(if|in case|once|when|should|after)\s+(you|we)\b|\bfor (an|the next|a) (interview|round|screening)\b/i },
        /\bwithout (an |a |any )?interviews?\b/i,
        // v0.6: "no traditional interview", "we do not hold interviews", "a
        // group presentation, not an individual interview". (A work sample or
        // an informal chat in place of a formal interview is real hiring.)
        { re: /\bno (traditional|formal|individual|one-on-one|personal|real) (job )?interviews?\b|\b(do not|don'?t|never) (hold|conduct|do|have) (traditional |formal |individual |one-on-one )?interviews\b|\bnot an? (individual|one-on-one|personal|formal|traditional) interview\b/i,
          unless: /\b(work samples?|assessments?|skills? tests?|trials?|portfolios?|auditions?|coding|exercises?|casual|informal|coffee|chat)\b/i },
        // "Selected for an interview" is how real hiring works, and "if you are
        // selected for the position, you will…" is a condition. Only a flat
        // "you have been selected for the job" counts. (Hiring events that
        // "hire on the spot" are real, so that phrase is not a flag.)
        // ("The type of position you are selected for" is a relative clause in
        // government boilerplate; only a done deal, "you have been selected", counts.)
        { re: /\byou (have been|were|'ve been) (selected|shortlisted|chosen|approved|hired) (for|as)\b/i,
          unless: /\b(if|in case|once|when|should|after)\s+you\b/i,
          unlessText: /\b(interviews?|screening|next (round|stage|step)|assessments?)\b/i }
      ]
    },
    {
      id: 'odd-pay-method', tier: 'hard', detect: 'auto',
      label: 'Pays you in crypto or gift cards',
      detail: 'Wages in crypto or gift cards cannot be traced or reversed, which is why scammers use them, and it often comes with a "deposit to withdraw" request later.',
      tip: 'Ask how payroll is run and who issues your tax form. A real employer has a straight answer.',
      negatable: true,
      patterns: [
        // About YOUR pay only: "process payments in crypto" is fintech work.
        /\b(you('ll| will)? (be |get )?paid|your (pay|salary|wages|earnings|commissions?)|salary|wages|compensation|payouts?)\b[^.\n]{0,30}\b(in|via|through|with|as)\b[^.\n]{0,10}\b(usdt|bitcoin|btc|eth|ethereum|crypto\w*|gift ?cards?|tether)\b/i
      ]
    },
    {
      id: 'personal-data-upfront', tier: 'hard', detect: 'auto',
      label: 'Asks for personal data in the posting or application',
      detail: 'Date of birth, bank details, a photo of your ID or credit card: none of these belong in an application.',
      tip: 'Share only your resume and contact details until you have verified the employer and have an offer.',
      negatable: true,
      // "Enter credit card transactions" is a bookkeeper's duty, not a request.
      offerGuard: true,
      // Also: a sentence defining PII, a government credit card the job holds,
      // and a military "Transition Assistance" form (US government postings).
      unless: [/\b(transactions?|reconcil\w*|statements?|ledgers?|journal entr\w*|invoices?|portfolios?|analy\w+|forecasts?|products?|programs?|industry)\b/i,
        DESCRIBES_PII, /\b(government|government-issued|travel|corporate|agency) (credit|charge|travel|purchase) card\b/i, /\btransition assistance"? form\b/i],
      patterns: [
        // Date of birth on its own line of patterns: a federal job with a
        // maximum entry age needs it, so there it is not a red flag.
        { re: /\b(send|provide|submit|upload|email|e-mail|share|include|attach|text|enter|fill in|requires?|needs?|ask(s|ing)? for|reply with|respond with|return)\b[^.\n]{0,60}\b(date of birth|birth ?date|d\.?o\.?b\.?)\b/i, unlessText: AGE_LIMIT },
        { re: /\b(date of birth)\b[^.\n]{0,40}\b(required|needed|to apply|with (your )?(application|resume|cv)|to (be )?considered|to proceed)\b/i, unlessText: AGE_LIMIT },
        /\b(send|provide|submit|upload|email|e-mail|share|include|attach|text|enter|fill in|requires?|needs?|ask(s|ing)? for|reply with|respond with|return)\b[^.\n]{0,60}\b(bank (account|routing)( number| details| info\w*)?|routing number|account number|credit card|debit card|driver'?s licen[cs]e (number|copy|photo|scan|picture|image)|(copy|photo|scan|picture|image) of (your )?(driver'?s licen[cs]e|id|identification|government[- ]issued id|id card|credit card|debit card|bank card)|mother'?s maiden name)\b/i,
        /\b(bank (account|routing) (number|details)|credit card (number|details)|driver'?s licen[cs]e (number|copy|photo|scan))\b[^.\n]{0,40}\b(required|needed|to apply|with (your )?(application|resume|cv)|to (be )?considered|to proceed)\b/i
      ]
    },
    {
      id: 'chat-app-contact', tier: 'hard', detect: 'auto',
      label: 'Hiring runs through a chat app or text messages',
      detail: 'Interviews or "onboarding" over WhatsApp, Telegram, Signal, text or a chat window, with no video call or office, is one of the most common scam patterns.',
      tip: 'Ask for a video interview with a named person, then check that person on the company website.',
      negatable: true,
      patterns: [
        new RegExp('\\b(contact|reach|message|text|apply|interview\\w*|add|chat with|connect with|onboard\\w*|reply|respond)\\b[^.\\n]{0,40}\\b(on|via|through|over|using|by|in)\\s+' + CHAT_APPS + '\\b', 'i'),
        // The interview itself is chat-only.
        /\binterview (is|will be) (chat|text|message)[- ]?(only|based)\b|\b(chat|text)[- ]only interview\b/i,
        // Except the US government's scored "Written Interview" (a written
        // assessment that places you in a quality group).
        { re: /\bwritten interview\b/i, unless: /\b(will be (scored|rated|evaluated)|quality (groups?|categor\w+))\b/i },
        /\b(video|phone) (interview|call)s? (is |are )?(not possible|unavailable|not available)\b/i,
        /\b(message|text|send|type) (me |us )?your answers\b|\banswer the (\d+ )?questions\b[^.\n]{0,60}\b(message|text|chat|here|document)\b/i,
        /^\s*\[?(chat|\d{1,2}:\d{2})[^\]\n]{0,12}\]?\s*(hm|hiring manager|hr|recruiter)\s*:/im,
        new RegExp('\\b(download|install|set up|sign up (for|on)|create an? (account on|\\w+ account))\\b[^.\\n]{0,20}\\b(whats ?app|telegram|signal|wickr|kik|wechat|viber|line app)\\b', 'i'),
        /\b(whats ?app|telegram|signal|wickr|kik)\b\s*(number|no\.?|id|handle|username|:)\s*:?\s*[@+(\d]/i,
        // The interview ITSELF in a chat ("we'll confirm your interview by text" is fine).
        /\binterviews?\s+(will be\s+|is\s+|are\s+)?(conducted\s+|held\s+|done\s+)?(via|over|on|through|by|using)\s+(an? |the )?(\w+ ){0,2}(chat|text|instant message|messenger|messaging app)\b/i,
        /\b(text|chat|instant message|im)[- ]based interviews?\b/i
      ]
    },
    {
      id: 'urgency', tier: 'soft', detect: 'auto',
      label: 'Creates artificial urgency',
      detail: '"Apply today", "positions fill fast", a deadline of tomorrow. Pressure is meant to make you act before you think.',
      tip: 'Some roles do move fast. Urgency plus any other flag on this list is a real signal.',
      patterns: [
        // Only pressure, not enthusiasm: "limited openings" and "your career
        // could start today" are in plenty of real postings.
        /\b(apply (today|now|immediately|right away) (before|or|as)|positions? (fill|filling|go|are going) (fast|quickly)|spots? (fill|filling|go|are going) (fast|quickly)|only \d+ (spots|positions|openings|slots|seats) (left|remaining|available)|act (now|fast)|respond within \d+ (hours?|minutes?)|offer expires|first come,? first served|this (offer|opportunity) (won'?t|will not) last)\b/i
      ]
    },
    {
      id: 'vague-work', tier: 'soft', detect: 'partial',
      label: 'No concrete work is described',
      detail: 'You cannot tell what you would actually do on a Monday morning: no tools, no deliverables, no team, just "assist with operations".',
      tip: 'Ask for the list of duties and who you would report to. A real employer can answer in one line.',
      check: function (text) {
        var words = (text.match(/[A-Za-z]{2,}/g) || []).length;
        // A recruiter's message is short by nature: only full postings are judged.
        if (words < 60) return [];
        var hits = [];
        var vague = /\b(assist with (various|general|daily|simple|basic) (tasks|duties|operations)|various (tasks|duties|assignments)|simple (tasks|duties|assignments)|general (office |administrative )?(tasks|duties)|support key initiatives|contribute to company goals|other duties (as )?(needed|assigned)|easy (tasks|work)|perform simple online tasks|complete (simple |online |easy )?(tasks|assignments|orders) (online|from home|on the app|on our platform))\b/gi;
        var vagueHits = [];
        eachSentence(text, function (s) {
          vague.lastIndex = 0;
          var m;
          while ((m = vague.exec(s.text))) vagueHits.push(hit(s, m.index, m[0].length));
        });
        // "other duties as assigned" alone is in most real postings: it only
        // counts with a second vague phrase, or in a short posting. Length on
        // its own is not evidence, so it is never flagged by itself.
        var strong = vagueHits.filter(function (h) { return !/other duties/i.test(h.match); });
        if (strong.length >= 1 && (vagueHits.length >= 2 || words < 200)) hits = hits.concat(vagueHits);
        return hits;
      }
    },
    // The reader's call. Measured on real postings, rules for these two
    // flagged far more real jobs than scams ("Perks!!", benefits in capitals,
    // "a trusted organization"), so the checker lists them and never ticks them.
    {
      id: 'sloppy-writing', tier: 'soft', detect: 'manual',
      label: 'Significant grammar, spelling or formatting problems',
      detail: 'One typo means nothing. A posting full of shouting, broken sentences and odd capitalization is written at volume, not by an HR team.',
      tip: 'Read it out loud. If it does not sound like a company wrote it, trust that.'
    },
    {
      id: 'no-company', tier: 'soft', detect: 'manual',
      label: 'The hiring company is not identified',
      detail: 'Agencies sometimes keep the client confidential, and that is fine. No company name and nothing you can verify is not.',
      tip: 'Ask who the employer is before you share anything. A recruiter can name the client once you are a serious candidate.'
    },
    {
      id: 'personal-email', tier: 'soft', detect: 'auto',
      label: 'Applications go to a free personal email address',
      detail: 'Gmail, Yahoo or Outlook.com addresses cost nothing to create. Some small businesses use them, but most employers use their own domain.',
      tip: 'Check that the company exists and that the address appears on its official website.',
      patterns: [FREE_EMAIL]
    },
    {
      id: 'unsolicited', tier: 'soft', detect: 'auto',
      label: 'Contacts you about a job you never applied for',
      detail: 'Real recruiters do reach out, usually on LinkedIn about your actual field. Scams open with "we found your resume" for a job you never asked about, often by text.',
      tip: 'Ask how they got your details and which posting this is. Then find that posting yourself.',
      patterns: [
        /\b(we|i)\s+(found|came across|saw|got|received|obtained|were given|was given)\s+your\s+(resume|cv|profile|contact|number|phone number|details|information)\b[^.\n]{0,60}\b(online|database|job (board|site)|indeed|monster|careerbuilder|ziprecruiter|recommended|referred)\b/i,
        /\byour\s+(resume|cv|profile|number|contact details)\s+(was|has been|were)\s+(forwarded|recommended|passed|shared|referred|selected)\b/i,
        // v0.6: the same in text-message shorthand ("saw ur CV online").
        /\b(saw|found|came across|got)\s+(ur|your)\s+(cv|resume|number)\s+(online|on (an? )?(job (board|site)|indeed|seek|monster))\b/i
      ]
    },
    {
      id: 'info-session', tier: 'soft', detect: 'auto',
      label: 'An information session instead of an interview',
      detail: 'You applied for a job and are invited to a group session, call or webinar about "the opportunity", the compensation plan or how you get paid, not to an interview about you. That is how a commission business recruits. (Hiring events, open interviews and orientation for people already hired are different.)',
      tip: 'Before you go, ask one question: is this a salaried job paid by a named employer, or a commission business you\'d have to pay to join?',
      negatable: true,
      // Real hiring: a hiring event or job fair, a new hire's orientation,
      // a session about careers or how to apply.
      unless: [/\b(hiring events?|open interviews?|job fairs?|career fairs?|career info(rmation)? sessions?|new[- ]hires?|first day|benefits enrol+ment|careers|career (fairs?|opportunities)|vacanc\w+|how to apply|application process)\b/i],
      patterns: [
        /\b(group|informational|information|info|opportunity|business|overview|introductory|intro)\s+(video\s+|zoom\s+|virtual\s+|online\s+|live\s+)?(sessions?|meetings?|webinars?|calls?|presentations?|briefings?)\b[^.\n]{0,100}\b(business opportunity|(the|this|our) (business|opportunity|program)|compensation plan|comp plan|income (opportunity|potential|streams?)|vendors?|suppliers?|how (it|this|the business|the program) works|how (you|our agents|agents|members|our members) (get paid|earn|make money)|commission structure|business model|earning potential)\b/i,
        /\b(learn|hear|find out|discuss)\w*\b[^.\n]{0,20}\babout\b[^.\n]{0,20}\b(business opportunity|(the|this|our) (business|opportunity)|compensation plan|comp plan|how (you|agents|members) (get paid|earn))\b[^.\n]{0,60}\b(group|informational|information|info|opportunity|overview)\s+(video\s+|zoom\s+|virtual\s+|online\s+|live\s+)?(sessions?|meetings?|webinars?|calls?|presentations?)\b/i,
        // "Opportunity call" or "opportunity meeting" is how such a business
        // names its recruiting session (not "Equal Employment Opportunity").
        { re: /\b(business )?opportunity (calls?|meetings?|webinars?|sessions?|presentations?|nights?|zoom|overviews?|videos?)\b/i, unless: /\bequal (employment )?opportunity\b|\beeo\b/i },
        // v0.6: a group session, overview or webinar offered to the applicant
        // as the next step (not a session the job runs for others).
        { re: /\bwebinars?\b|\b(group|virtual|online|live|career|business|discovery|intro(ductory)?)\s+(discovery\s+|overview\s+|info(rmation(al)?)?\s+)?(sessions?|overviews?|presentations?|videos?|orientations?)\b/i,
          requires: /\b(next step|hiring process|reserve|rsvp|invit\w*|attend|join|watch|register|sign up|confirm|are you free|tonight|link|seats?|spots?|instead|before (you )?(commit|decid|interview))\w*/i,
          unless: /\b(lead|leads|leading|facilitat\w*|deliver\w*|run|runs|running|host|hosts|hosting|conduct\w*|presenting|create|design|prepare|clients?|customers?|patients?|students?|training sessions?)\b/i },
        /\b(next|first) step\b[^.\n]{0,60}\b(group|informational|information|info|opportunity|overview)\s+(video\s+|zoom\s+|virtual\s+|online\s+|live\s+)?(sessions?|meetings?|webinars?|presentations?)\b/i,
        /\b(sessions?|webinars?|meetings?|presentations?)\b[^.\n]{0,40}\b(instead of|in place of|rather than) (an? |the )?(individual |one-on-one |formal |personal )?interviews?\b/i
      ]
    },
    {
      // Hard, on evidence: when measured on real labeled postings, this
      // combination appeared far more often on fraudulent ones.
      id: 'high-risk-role', tier: 'hard', detect: 'auto',
      label: 'A role scammers use most, offered remote with no experience needed',
      detail: 'Data entry, virtual or personal assistant, package handling, payment processing, mystery shopping and travel planning or booking are the job titles scammers post most, and "remote, no experience" is how they are pitched. Real ones exist, which is why this is a reason to verify, not proof.',
      tip: 'For these roles especially, find the same job on the company\'s own careers page before you apply.',
      check: function (text) {
        var hits = [];
        if (!ENTRY.test(text)) return hits;
        if (!/\b(remote|work from home|from home|wfh|home[- ]based|online)\b/i.test(text)) return hits;
        var role = /\b(data entry (clerk|specialist|operator|assistant|position|job)s?|virtual assistant|personal assistant|package (handler|inspector)|payment (processor|processing (agent|clerk|specialist))|mystery shopper|secret shopper|online (chat|typing) (agent|job)|typing jobs?|home typists?|envelope stuff\w*|stuff(ing)? envelopes|product tester|personal shopper assistant)\b/i;
        // v0.5: travel roles, the way pay-to-join travel businesses advertise.
        // A travel employer that hires on payroll says so (W-2, health
        // insurance, 401(k), paid time off), and then it is not flagged.
        var travel = /\b(travel (agent|advisor|consultant|planner|coordinator|specialist)s?|destination (planner|specialist|coordinator|advisor|consultant)s?|vacation planners?|(hotel|booking) (coordinator|specialist|agent)s?)\b/i;
        var employed = /\bw-?2\b|\b401\(?k\)?|\bhealth (insurance|benefits|plan)\b|\bdental\b|\bpaid time off\b|\bpto\b/i.test(text);
        eachSentence(text, function (s) {
          if (hits.length) return;
          // "May not use an AI tool or virtual assistant (such as ChatGPT)" is
          // about software, not a job.
          if (/\b(ai|chatbot) tools? or virtual assistants?\b|\bvirtual assistants? \(?(such as|like|e\.g\.,?) (chatgpt|siri|alexa|copilot|gemini|claude)\b/i.test(s.text)) return;
          var m = role.exec(s.text) || (!employed && travel.exec(s.text));
          if (m) hits.push(hit(s, m.index, m[0].length));
        });
        return hits;
      }
    },
    {
      // v0.6, a combination: no single sign here is evidence, so it takes
      // three different kinds of sign together.
      id: 'recruiting-pitch', tier: 'hard', detect: 'auto',
      label: 'Reads like a pitch for a business opportunity, not a job ad',
      detail: 'Several signs of a recruiting pitch appear together: lifestyle or "be your own boss" language, no experience needed next to a big pay figure, a group session or a keyword to text instead of an interview, a contact out of the blue or from a free email, and a travel or booking role with nothing about how you would be employed.',
      tip: 'Ask one question: is this a salaried job paid by a named employer, or a commission business you\'d have to pay to join?',
      check: function (text) {
        var found = [];
        function first(re) {
          var h = null;
          eachSentence(text, function (s) {
            var m = !h && re.exec(s.text);
            if (m) h = hit(s, m.index, m[0].length);
          });
          return h;
        }
        // 1. Lifestyle and business-opportunity language inside a "job".
        var life = first(/\b(be your own boss|income opportunity|(financial|lifestyle|time) freedom|leav\w+ the 9[- ]to[- ]5|fed up (of|with) the commute|turn your passion into|earn\w* (\$\$\$ )?while (you|u) (travel|holiday)|travel perks|(discounted|free) travel for (you|your family)|paid for by my business|from (my|your) phone|full[- ]time income|unlimited (income|earnings?)|(your )?income is unlimited|in business for yourself|(start|run|build|activat\w+) (your|their) (own )?(\w+ )?business|self[- ]employed|\$\$\$)\b|\$\$\$/i);
        if (life) found.push(life);
        // 2. A group session, overview or webinar instead of an interview.
        var session = runPatterns(byId['info-session'], text)[0] ||
          first(/\bno (traditional|formal|individual|one-on-one) interviews?\b|\b(do not|don'?t) (hold|conduct|do) (traditional |formal )?interviews\b|\bnot an? (individual|one-on-one|formal) interview\b/i);
        if (session) found.push(session);
        // 3. No experience needed, next to a pay figure.
        var bait = (ENTRY.test(text) || /\bno (exp|cv|resume|worries)\b|\brecent grads welcome\b|\bwe (teach|train) you everything\b/i.test(text)) &&
          first(new RegExp(MONEY, 'i'));
        if (bait) found.push(bait);
        // 4. Contact out of the blue, from a free address, or by texting a keyword.
        var contact = runPatterns(byId.unsolicited, text)[0] || first(FREE_EMAIL) ||
          first(/\b(DM|PM|[Dd]m|[Mm]essage( us)?|[Tt]ext( us)?|[Rr]eply)\s+['"‘“]?(?!STOP\b|HELP\b|JOBS?\b)[A-Z]{3,}\b/);
        if (contact) found.push(contact);
        // 5. A travel or booking role that says nothing about employment.
        if (!/\bw-?2\b|\b401\(?k\)?|\bhealth (insurance|benefits|plan)\b|\bdental\b|\bpaid time off\b|\bpto\b|\b(full|medical) benefits\b|\bbenefits (from|after|eligible)\b/i.test(text)) {
          var travel = first(/\b((travel|trip) (agent|advisor|consultant|planner|coordinator|specialist|concierge|ambassador)s?|destination (planner|specialist|coordinator|advisor|consultant)s?|(vacation|holiday) (planner|booking (advisor|agent|specialist))s?|(hotel|booking|bookings) (coordinator|specialist|agent|advisor|officer)s?)\b/i);
          if (travel) found.push(travel);
        }
        return found.length >= 3 ? found : [];
      }
    }
  ];

  // ── Text helpers ─────────────────────────────────────────────────────────
  // Splits into sentences, keeping each one's position (so a quote can be
  // traced back to the text) and its paragraph (blank-line separated).
  function sentences(text) {
    var out = [];
    var re = /[^\n]+/g, line, para = 0, lastEnd = 0;
    while ((line = re.exec(text))) {
      if (out.length && /\n\s*\n/.test(text.slice(lastEnd, line.index))) para++;
      lastEnd = line.index + line[0].length;
      var base = line.index, s = line[0];
      var cut = /[.!?](?=\s+["“(]?[A-Z0-9•\-])/g, start = 0, m;
      while ((m = cut.exec(s))) {
        push(s.slice(start, m.index + 1), base + start);
        start = m.index + 1;
      }
      push(s.slice(start), base + start);
    }
    function push(t, at) {
      var lead = t.length - t.replace(/^\s+/, '').length;
      t = t.trim();
      if (t) out.push({ text: t, start: at + lead, para: para });
    }
    return out;
  }

  var _cache = { text: null, list: null };
  // Visits every sentence that can count as evidence: fraud warnings and
  // fraud-notice paragraphs are skipped.
  function eachSentence(text, fn) {
    if (_cache.text !== text) {
      _cache.text = text;
      var list = sentences(text), paraText = {};
      list.forEach(function (s) { paraText[s.para] = (paraText[s.para] || '') + ' ' + s.text; });
      var protectedPara = {};
      Object.keys(paraText).forEach(function (p) { protectedPara[p] = PROTECT_PARAGRAPH.test(paraText[p]); });
      _cache.list = list.filter(function (s) { return !protectedPara[s.para] && !PROTECT_SENTENCE.test(s.text); });
    }
    for (var i = 0; i < _cache.list.length; i++) fn(_cache.list[i]);
  }

  // A quote: the sentence, trimmed to ~220 characters around the match.
  function hit(s, at, len) {
    var t = s.text, from = 0, to = t.length;
    if (t.length > 220) {
      from = Math.max(0, at - 90);
      to = Math.min(t.length, at + len + 110);
    }
    return {
      excerpt: (from > 0 ? '…' : '') + t.slice(from, to).trim() + (to < t.length ? '…' : ''),
      match: t.substr(at, len),
      start: s.start + at,
      end: s.start + at + len,
      sentence: s.start
    };
  }

  function runPatterns(flag, text, ctx) {
    var hits = [];
    eachSentence(text, function (s) {
      var flagUnless = flag.unless && flag.unless.some(function (u) { return u.test(s.text); });
      // Normal post-offer paperwork (I-9, payroll, onboarding) is exempt, but
      // not when hiring runs over a chat app: there is no real HR system there.
      if (flag.offerGuard && !(ctx && ctx.chat) && AFTER_OFFER.test(s.text)) return;
      for (var i = 0; i < flag.patterns.length; i++) {
        var p = flag.patterns[i], re = p.re || p;
        // A flag-wide exemption (e.g. "the employer reimburses") skips the
        // sentence, except for patterns where that promise IS the scam.
        if (flagUnless && !p.force) continue;
        var m = re.exec(s.text);
        if (!m) continue;
        if (p.unless && p.unless.test(s.text)) continue;
        if (p.requires && !p.requires.test(s.text)) continue;
        if (p.unlessText && p.unlessText.test(text)) continue;
        if (p.requiresText && !p.requiresText.test(text)) continue;
        if (flag.negatable && NEGATION.test(s.text.slice(Math.max(0, m.index - 60), m.index))) continue;
        hits.push(hit(s, m.index, m[0].length));
        break; // one quote per sentence is enough
      }
    });
    return hits;
  }

  function normalize(text) {
    return String(text || '')
      .replace(/\r\n?/g, '\n')
      .replace(/[‘’]/g, "'")
      .replace(/ /g, ' ');
  }

  // ── Public API ───────────────────────────────────────────────────────────
  /**
   * scan(text) → { found: [flagId], flags: [{ id, tier, label, detect, hits }], verdict }
   * Every hit carries the quoted sentence that triggered it.
   */
  function scan(text) {
    text = normalize(text);
    _cache.text = null;
    var claimed = { severe: {}, hard: {}, soft: {} };
    var ctx = { chat: runPatterns(byId['chat-app-contact'], text).length > 0 };
    var flags = FLAGS.map(function (f) {
      var hits = f.check ? f.check(text) : f.patterns ? runPatterns(f, text, ctx) : [];
      // De-duplicate identical quotes.
      var seen = {};
      hits = hits.filter(function (h) { return seen[h.excerpt] ? false : (seen[h.excerpt] = true); });
      // One sentence is one piece of evidence per tier: a sentence already
      // quoted by an earlier hard or soft flag does not count again (it would
      // inflate the verdict). Severe flags all show: any one of them is "Stop".
      if (f.tier !== 'severe') {
        var mine = claimed[f.tier];
        hits = hits.filter(function (h) { return h.note || h.sentence === undefined || !mine[h.sentence]; });
        hits.forEach(function (h) { if (h.sentence !== undefined) mine[h.sentence] = true; });
      }
      return { id: f.id, tier: f.tier, label: f.label, detect: f.detect, hits: hits.slice(0, 3) };
    });
    var found = flags.filter(function (f) { return f.hits.length; }).map(function (f) { return f.id; });
    return { version: VERSION, found: found, flags: flags, verdict: verdict(found) };
  }

  /**
   * verdict(flagIds) → { level, title, text, counts }
   * level: 'none' | 'clear' | 'caution' | 'high' | 'stop'
   * Takes the ids the reader has confirmed, so it works for ticked boxes too.
   */
  function verdict(ids) {
    var count = { severe: 0, hard: 0, soft: 0 };
    (ids || []).forEach(function (id) {
      var f = byId[id];
      if (f) count[f.tier]++;
    });
    var total = count.severe + count.hard + count.soft;
    var v;
    if (total === 0) v = { level: 'none', title: 'No red flags found', text: 'Nothing on this list showed up. That is a good sign, not a guarantee: still confirm the company is real before you apply.' };
    else if (count.severe > 0) v = { level: 'stop', title: 'Stop: this looks like a scam', text: 'This has a severe red flag. Do not apply, do not reply, and do not share any personal information.' };
    else if (count.hard >= 2) v = { level: 'high', title: 'Walk away, or verify thoroughly', text: 'Several hard red flags together sharply raise the risk. Do not go further until you have independently confirmed the company and the person contacting you.' };
    else if (count.hard === 1 && count.soft >= 2) v = { level: 'high', title: 'High caution', text: 'One hard red flag plus several soft ones. Verify the company and the recruiter before you spend any time on this.' };
    else if (count.hard === 1 || count.soft >= 3) v = { level: 'caution', title: 'Proceed with caution', text: 'These flags do not prove fraud on their own, but they deserve a closer look. Verify the company independently before you apply.' };
    else v = { level: 'clear', title: 'No major red flags', text: 'A minor flag or two, which plenty of real postings have. Confirm the company is legitimate, then decide whether the job is a fit.' };
    v.counts = count;
    return v;
  }

  var byId = {};
  FLAGS.forEach(function (f) { byId[f.id] = f; });

  // The public flag list, without the matching internals.
  function list() {
    return FLAGS.map(function (f) {
      return { id: f.id, tier: f.tier, detect: f.detect, label: f.label, detail: f.detail, tip: f.tip };
    });
  }

  return { version: VERSION, TIERS: TIERS, flags: list, scan: scan, verdict: verdict, sentences: sentences };
}));
