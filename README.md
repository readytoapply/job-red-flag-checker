# Job Red Flag Checker

**Is this job posting a scam?** Paste the posting, or the text, email or LinkedIn message a "recruiter" sent you, and find out in a second. The checker flags the warning signs of a fake job and **quotes the exact line behind every flag**, so you can see the evidence yourself rather than trust a score.

- **Rules only.** No AI and no network calls. The same posting gives the same answer every time.
- **Private.** The text never leaves your machine or your browser. Nothing is stored.
- **Free and open.** MIT licensed. Use it, fork it, add a rule.

👉 **Try it in your browser, no install:** [readytoapply.ai/job-scam-checker](https://readytoapply.ai/job-scam-checker?utm_source=github&utm_medium=readme&utm_campaign=red-flags)

Built by [Ready to Apply](https://readytoapply.ai/?utm_source=github&utm_medium=readme&utm_campaign=red-flags), from a recruiter's years of reading job postings.

---

## What it looks for

Flags come in three tiers. One flag is a question; three flags are an answer.

| Tier | Flag | Found by |
|---|---|---|
| 🔴 Severe | Asks you to pay to get the job (a fee, a starter kit, "training", their vendor's equipment, gift cards, crypto, a check to deposit) | rules |
| 🔴 Severe | Asks you to deposit money to unlock tasks or earnings (task scams) | rules |
| 🔴 Severe | Asks for your SSN, SIN or passport before an interview | rules |
| 🔴 Severe | Involves forwarding packages or money for someone else (reshipping, money mules) | rules |
| 🔴 Severe | Asks for your banking login, passwords or remote access to your device | rules |
| 🔴 Severe | Tells you to keep it from your bank or family | rules |
| 🟠 Hard | Asks you to send, pay or return money, however it's worded | rules |
| 🟠 Hard | It's a business you pay to join, not a salaried job (an "independent" distributor or agent role with a setup or monthly fee, or a sponsor ID) | rules |
| 🟠 Hard | The "salary" isn't a salary (a salary figure, but commission only, no base pay, or an independent contractor) | rules |
| 🟠 Hard | Charges you for training, certification or access to jobs | rules |
| 🟠 Hard | Wants hiring paperwork, ID or card details before any interview | rules |
| 🟠 Hard | Screens you on your bank account or mobile deposit | rules |
| 🟠 Hard | Claims to be a company recruiter but writes from a free email | rules |
| 🟠 Hard | Email comes from a lookalike of the company's domain | rules |
| 🟠 Hard | A role scammers use most, offered remote with no experience needed | rules |
| 🟠 Hard | Reads like a pitch for a business opportunity, not a job ad (three kinds of sign together: lifestyle language, no experience with a big pay figure, a group session instead of an interview, a keyword to text, a travel role with no employment details) | rules |
| 🟠 Hard | Promises high income with little effort or no requirements | rules |
| 🟠 Hard | Pay is implausibly high for the role ($, £, €, ₹ and more) | rules + you |
| 🟠 Hard | Pays per "task" for rating, liking or boosting things | rules |
| 🟠 Hard | Pushes you toward a paid webinar, course, kit or coaching program, or recruiting others | rules |
| 🟠 Hard | Offers you the job without an interview | rules |
| 🟠 Hard | Pays you in crypto or gift cards | rules |
| 🟠 Hard | Asks for personal data (date of birth, bank details, a photo of your ID) | rules |
| 🟠 Hard | Hiring runs through a chat app (WhatsApp, Telegram, Signal) or a chat interview | rules |
| 🟡 Soft | Creates artificial urgency | rules |
| 🟡 Soft | No concrete work is described | rules + you |
| 🟡 Soft | Applications go to a free personal email address | rules |
| 🟡 Soft | Contacts you about a job you never applied for | rules |
| 🟡 Soft | An information session instead of an interview (about "the opportunity" or how you get paid) | rules |
| 🟡 Soft | Significant grammar, spelling or formatting problems | you |
| 🟡 Soft | The hiring company is not identified | you |

**"Rules + you"** means the rules catch the clear cases and you judge the rest. A rule cannot know the going rate for a job in your city, so it only flags pay that is high *and* paired with "no experience" or "part-time". **"You"** means rules flagged far more real jobs than scams when we tested them, so the checker lists the item and leaves the call to you.
### What it deliberately does not flag

Real jobs share some words with scams, so these never count as evidence:

- **Fraud warnings.** Many employers now write "we will never ask you to pay or for your SSN". That describes the red flag; it is not one.
- **Ordinary job costs.** Your own tools or boots, a license exam, state fingerprinting.
- **Normal paperwork after an offer.** I-9 documents and direct-deposit details collected by HR, unless the "hiring" is happening in a chat app.
- **Everyday hiring language.** "Selected for an interview", "text JOBS to apply", "hiring immediately", "our client" from a staffing agency, hiring events and open interviews.
- **Honest commission and contract work.** A base salary plus commission, on-target earnings, a 1099 hourly rate, a franchise's disclosed fees, an agent's own licensing exam, an optional kit sold at cost, an employee referral bonus.

A business you pay to join is a hard flag, never "Stop": multi-level marketing is not automatically illegal, so the checker says what the offer is (a business you'd buy into, not a salaried job) and leaves the judgment to you. The recruiter's question to ask: is this a salaried job paid by a named employer, or a commission business you'd have to pay to join? CBC News reported on fake job ads that led applicants into a multi-level marketing scheme ("[1,500 fake job ads led us to a global multi-level marketing scheme](https://www.youtube.com/watch?v=RioE6ClJbaM)", Visual Investigations, November 2026). The checker looks for the mechanism, and follows the FTC's advice: "[Don't pay for the promise of a job](https://consumer.ftc.gov/articles/job-scams)." Sources and the FTC's guidance on multi-level marketing are in [METHODOLOGY.md](METHODOLOGY.md).

One sentence counts once per tier, so a single line can't push the verdict up on its own.

### The verdict

| What was found | Verdict |
|---|---|
| Any severe flag | **Stop: this looks like a scam** |
| Two or more hard flags | **Walk away, or verify thoroughly** |
| One hard flag and two or more soft ones | **High caution** |
| One hard flag, or three or more soft ones | **Proceed with caution** |
| A soft flag or two | **No major red flags** |
| Nothing | **No red flags found** |

No red flags is a good sign, not a guarantee. Always confirm the company is real before you apply.

### What it will not do

It does not accuse anyone. A flag is a signal to investigate, shown with the line that raised it. Real postings sometimes trip a soft flag (a small business with a Gmail address), which is why soft flags only count when several appear together.

It reads text, so it cannot catch a scammer who copies a real company's posting word for word. The tell is usually in how they contact you: a chat app, a personal email, a request for money or documents. When in doubt, find the job on the company's own careers page.

### How it is tested

Three kinds of evidence, all reproducible from this repo and the public dataset it names. The full method, including the rounds that went badly, is in **[METHODOLOGY.md](METHODOLOGY.md)**.

- **393 unit tests.** Every rule fires on scam wording **and** stays quiet on the closest wording a real employer uses: fraud warnings, tellers and cashiers, package handlers, licensing and fingerprint fees, staffing agencies, fintech companies, commission sales with a base salary, hiring events.
- **A held-out benchmark, written blind.** Test cases written from FTC, FBI IC3, BBB, Canadian Anti-Fraud Centre and Scamwatch descriptions by an assistant that never saw the rules. The rules are scored once on cases they were never tuned on:

  | v0.4.0 on the round 2 held-out set (60 scams, 60 real jobs) | |
  |---|---|
  | Scams that get a warning | **50%** |
  | Scams told "Stop" or "Walk away" | 32% |
  | Real jobs wrongly told "Stop" | **0%** |
  | Real jobs given any warning | 1.7% |

  One family of scams has its own held-out set: job ads and recruiter messages that lead into multi-level marketing or another business you pay to join (round 4, 30 scams and 30 real look-alikes such as commission sales with a base, salaried travel advisors and honest franchise or direct-selling offers). It measures that family only, not all scams:

  | v0.6.0 on the round 4 held-out set (MLM / pay-to-join family: 30 scams, 30 real look-alikes) | |
  |---|---|
  | Scams in this family that get a warning | **70%** |
  | Scams in this family told "Stop" or "Walk away" | 37% |
  | Real look-alikes wrongly told "Stop" | **0 of 30** |
  | Real look-alikes given any warning | 0 of 30 |

  These are synthetic cases, not postings collected in the wild. Half of new scams still use wording no rule anticipates, so read the quotes, not just the verdict. Details: [benchmark/RESULTS.md](benchmark/RESULTS.md), and every round in [benchmark/HISTORY.md](benchmark/HISTORY.md).
- **Real postings, for false alarms.** On **4,800 real US federal job postings** the rules never saw, the checker wrongly said "Stop" on **0.25%** and gave any warning on **0.79%**. That's a demanding test: federal hiring legitimately asks for things that are scam signs elsewhere, like the last four digits of an SSN. Version 0.4.2 exempts those requirements in the government's own wording only (the same request in other words still counts). On **2,000 fresh federal postings** it then saw for the first time, it said "Stop" on **0** and warned on **0** (version 0.4.1 on the same 2,000: 0.25% and 0.50%). Agencies reuse boilerplate, so this mostly shows the same sentences no longer trip it, not how it does on other employers' wording. Version 0.5.0, on another **2,000 fresh federal postings**, said "Stop" on **0.15%** and warned on **0.20%**, exactly as version 0.4.2 did on the same postings: its new flags stayed quiet, and the warnings came from older rules meeting federal wording they hadn't seen. Version 0.6.0 fixed those and, on a further **2,000 fresh federal postings**, said "Stop" on **0.05%** and warned on **0.10%**, the same as versions 0.5.0 and 0.4.2 on those postings. Reproduce it with `node benchmark/usajobs.js` (it downloads the postings to your machine; they are not in this repo). _Data: USAJOBS via [loyoladatamining/usajobs](https://huggingface.co/datasets/loyoladatamining/usajobs) (MIT), Resh, Lee & Ming (2025), doi:[10.6084/m9.figshare.28509314.v5](https://doi.org/10.6084/m9.figshare.28509314.v5)._

---

## Use it from the command line

```bash
npx job-red-flag-checker posting.txt
```

Or pipe a posting in:

```bash
cat posting.txt | npx job-red-flag-checker
npx job-red-flag-checker posting.txt --json
```

Example output:

```
SEVERE: Stop. Do not apply, reply or share anything.
  ⚑ Asks you to pay to get the job
    “Deposit the check and use the funds to purchase your work equipment from our approved vendor.”
    → Do not pay. Gift cards, wire transfers, crypto and payment apps are used because the money cannot be pulled back.

Stop: this looks like a scam
This has a severe red flag. Do not apply, do not reply, and do not share any personal information.
```

## Use it in your code

One file, no dependencies. It works in Node and in the browser.

```js
const RF = require('job-red-flag-checker');

const result = RF.scan(postingText);
result.verdict;   // { level: 'stop' | 'high' | 'caution' | 'clear' | 'none', title, text, counts }
result.found;     // ['pay-to-apply', 'chat-app-contact', ...]
result.flags;     // every flag, each with hits: [{ excerpt, match, start, end }]

RF.verdict(['urgency', 'personal-email']); // recompute after a person ticks or unticks flags
RF.flags();       // the flag list: id, tier, label, detail, tip
```

In the browser, load `src/red-flags.js` with a `<script>` tag and use `window.JobRedFlags`.

---

## If a posting looks like a scam

- **Don't apply, reply or pay.** Stop all contact.
- **Report it** to the job board where you found it (most have a "report job" link), and:
  - United States: the FTC at [ReportFraud.ftc.gov](https://reportfraud.ftc.gov/), and the FBI's [IC3](https://www.ic3.gov/) if you lost money
  - Canada: the [Canadian Anti-Fraud Centre](https://antifraudcentre-centreantifraude.ca/)
  - United Kingdom: [Action Fraud](https://www.actionfraud.police.uk/)
  - Australia: [Scamwatch](https://www.scamwatch.gov.au/)
- **If you already shared something:** call your bank about any payment, and in the US place a fraud alert or freeze with the credit bureaus ([IdentityTheft.gov](https://www.identitytheft.gov/) walks you through it).

The full guide: [Job Description Red Flags: How to Spot a Fake Posting](https://readytoapply.ai/blog/job-description-red-flags.html?utm_source=github&utm_medium=readme&utm_campaign=red-flags).

## Posting looks real?

Then the next question is whether you're a fit. [Ready to Apply](https://readytoapply.ai/?utm_source=github&utm_medium=readme&utm_campaign=red-flags) scores your resume against the job description and shows the evidence for every point, so you know whether to apply before you spend the time.

---

## Contributing

Scam patterns change constantly, and new rules are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md). The short version: every new rule comes with a test that shows it firing on a scam line **and** staying quiet on a real posting's wording.

```bash
npm test
```

## License

MIT for the code. "Ready to Apply" and its logo are trademarks and are not covered by the license.
