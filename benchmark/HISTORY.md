# Benchmark history

Every scored round, in order. A held-out set is scored once per version and is
then retired into training data; the next version needs a fresh held-out set.
Numbers are never edited after the fact.

## Round 1 · benchmark v1 (225 cases, written blind to the rules)

`cases.json`: 115 scams (16 types) and 110 real-job "hard negatives" (16
types), 52 sources from 22 publishers. Split by type into `dev` (60 scams, 58
real jobs) and `test` (55 scams, 52 real jobs).

| Checker | Split | Scams warned (caution or worse) | Scams "Stop" or "Walk away" | Real jobs told "Stop" | Real jobs given any warning |
|---|---|---|---|---|---|
| v0.2.0 (before seeing the benchmark) | test | 16 / 55 (29.1%) | 8 / 55 (14.5%) | 2 / 52 (3.8%) | 3 / 52 (5.8%) |
| v0.2.0 (before seeing the benchmark) | dev | 24 / 60 (40.0%) | 10 / 60 (16.7%) | 1 / 58 (1.7%) | 1 / 58 (1.7%) |
| v0.3.0 (tuned on dev only) | dev | 60 / 60 (100%) | 33 / 60 (55.0%) | 0 / 58 (0%) | 0 / 58 (0%) |
| **v0.3.0 (tuned on dev only)** | **test (held out)** | **22 / 55 (40.0%)** | **9 / 55 (16.4%)** | **2 / 52 (3.8%)** | **3 / 52 (5.8%)** |

**What this round showed.** Tuning on the dev split took it to 100%, but the
held-out split only moved from 29% to 40%. Rules written against specific
wording do not transfer well to the same scams told in other words. The
held-out number is the honest one, and it is the one we report.

After this score, the round 1 test split was retired into training data.

## Round 2 · benchmark v2 (120 new cases, written blind)

`cases-r2.json`: 60 scams and 60 real jobs, written by a separate assistant
that never saw the rules or the round 1 cases. 24 cited sources. All held out.

v0.4.0 was tuned on all 225 round 1 cases (dev + retired test) and on real
postings for false alarms, then frozen (sha256 of `src/red-flags.js` begins
`f55cd7828108`) and scored once on round 2.

| Checker | Set | Scams warned (caution or worse) | Scams "Stop" or "Walk away" | Real jobs told "Stop" | Real jobs given any warning |
|---|---|---|---|---|---|
| v0.4.0 | round 1, all (training) | 112 / 115 (97.4%) | 60 / 115 (52.2%) | 0 / 110 (0%) | 0 / 110 (0%) |
| **v0.4.0** | **round 2 (held out)** | **30 / 60 (50.0%)** | **19 / 60 (31.7%)** | **0 / 60 (0%)** | **1 / 60 (1.7%)** |

**What this round showed.** Moving from phrases to concepts transferred:
held-out detection rose from 40% to 50%, strong verdicts nearly doubled
(16% → 32%), and false alarms on real jobs fell to zero "Stop" verdicts. The
gap between training (97%) and held-out (50%) is still large: half of new
scams use wording no rule anticipates. The one real job warned is a
government posting with a civil-service exam fee.

After scoring, two code comments in `src/red-flags.js` were reworded (no rule
changed). The file's hash became `40ed70af33f6`; re-running round 2 gave
identical numbers.

After this score, round 2 was retired into training data. v0.5 needs round 3.

## Real postings · US federal jobs (USAJOBS, March 2026)

False alarms on real job postings, every one of them a real job. Data: 5,000
postings with full text from the March 2026 subset of
[loyoladatamining/usajobs](https://huggingface.co/datasets/loyoladatamining/usajobs)
(license MIT per its dataset card; USAJOBS open data; curated by Resh, Lee & Ming,
2025, doi:10.6084/m9.figshare.28509314.v5). The posting text is not in this repo.

The first 200 postings were used to tune three rules (relative clauses like
"the position you are selected for", government salary lines, "Account Login"
on a job site). The result below is on the other **4,800**, which the rules
never saw. The rules measured are v0.4.1 (the version label was set after the
run; no rule changed).

| Checker | Real postings | Wrongly told "Stop" | Given any warning | No flag at all |
|---|---|---|---|---|
| **v0.4.1** | **4,800 federal postings (held out)** | **12 (0.25%)** | **38 (0.79%)** | 4,745 (98.9%) |

**What this showed.** Federal hiring legitimately asks for things that would be
scam signs anywhere else: the last four digits of the SSN on an application
packet, a document proving date of birth for firefighters and air traffic
controllers (who have age limits), and a scored "Written Interview" (the
government's name for a written assessment). Every false "Stop" came from one
of those. Fixing them means tuning on this sample, so a fix will be scored on a
fresh batch of federal postings, never on these.

## Real postings · US federal jobs, a fresh batch (v0.4.2)

The 5,000 postings above (all of them, including the 4,800 scored once) became
tuning data. On them, v0.4.1's 12 false "Stop" verdicts came from four kinds of
sentence: the last four SSN digits beside the announcement number on an
application packet (7), the SSN a USAJOBS account asks for (2), a definition
of personally identifiable information that lists the SSN (2), and checking
equipment in and out, read as a fake check (1). The other 26 warnings came
from the scored "Written Interview" (12), date of birth for jobs with a
maximum entry age (5), the military "Transition Assistance" form (3), a
union's contact on a free email address (2), a government credit card (1),
course-material procurement and "payment certification" (2), and a rule
against using AI assistants in interviews (1).

v0.4.2 exempts each of those in the government's own wording only: the same
request in other words, or from a lookalike address, still fires (29 new test
assertions: each exemption fires on the scam wording and stays quiet on the
closest real one). It was then frozen (sha256 of `src/red-flags.js` begins
`1909071fa6c4`) and scored once on postings 5,001–7,000 of the same March
2026 subset: 2,000 postings, downloaded while the fix was being written but
not opened or scored until the rules were frozen, none sharing a control
number with the first 5,000. For comparison, v0.4.1 (rebuilt exactly, same hash `02f70e7ecee0`) was
run on the same 2,000.

| Checker | Real postings | Wrongly told "Stop" | Given any warning | No flag at all |
|---|---|---|---|---|
| v0.4.1 | 2,000 fresh federal postings | 5 (0.25%) | 10 (0.50%) | 1,984 (99.2%) |
| **v0.4.2** | **2,000 fresh federal postings (held out)** | **0 (0%)** | **0 (0%)** | 1,994 (99.7%) |

The six postings with a flag each have one or two soft flags ("No major red
flags"): a free email address (3), "other duties as assigned" with a second
vague phrase (2), and a note that your resume is passed on to the hiring
manager, read as unsolicited contact (1).

Training sets, re-run after the fix: round 1 unchanged (111 / 115 scams warned,
60 / 115 "Stop" or "Walk away", 0 / 110 real jobs warned), and every round 1
and round 2 case kept the same verdict and flags. On the 5,000 tuning postings
v0.4.2 gives 0 "Stop" and 0 warnings, a self-graded number.

**What this showed.** The federal false alarms were a handful of recurring
sentences, and narrow exemptions removed them on postings the rules had not
seen. Read the zero with care: federal agencies reuse the same boilerplate,
so a fresh batch from the same month largely tests whether the same sentences
recur. Other employers' wording, other months and other countries are not
measured here.

After this score, postings 5,001–7,000 were retired into tuning data.

## Invented names replaced; verdicts identical (2026-11-10)

Some invented company domains in the cases and tests turned out to be real,
registered domains. They were replaced with names that do not resolve in DNS
(checked on 2026-11-10), and one test's impersonated brand became a generic
"big online retailer". In `cases.json`: case `scam-impersonation-007`
(Tessaline → Tesvaline, its website and sender domain) and the company in one
reshipping case (Corvane → Corvalynt). `cases-r2.json` needed no change. No
rule changed (`src/red-flags.js` still begins `1909071fa6c4`), and no case's
label, split, source or wording otherwise changed. `cases.json`'s sha256 now
begins `720864fb9066` (was `35f19c15b19b`); `cases-r2.json` is unchanged
(`9db1e1a0ed72`).

Re-run with v0.4.2, every one of the 345 cases kept the same verdict and flags:

| Checker | Set | Scams warned (caution or worse) | Scams "Stop" or "Walk away" | Real jobs told "Stop" | Real jobs given any warning |
|---|---|---|---|---|---|
| v0.4.2 | round 1, all (training) | 111 / 115 (96.5%) | 60 / 115 (52.2%) | 0 / 110 (0%) | 0 / 110 (0%) |
| v0.4.2 | round 2 (retired; reproduction only) | 30 / 60 (50.0%) | 19 / 60 (31.7%) | 0 / 60 (0%) | 1 / 60 (1.7%) |

The round 2 row reproduces the recorded v0.4.0 held-out score. It is not a
new held-out number: round 2 is training data now.

## v0.5.0 · job ads for a business you pay to join (2026-11-16)

**Why.** A CBC News visual investigation (November 2026, "1,500 fake job ads
led us to a global multi-level marketing scheme") followed ordinary-looking
salaried job ads (remote, no experience) to a commission business: a group
information session instead of an interview, then an independent contractor
agreement with fees to pay. v0.4.2 let most of that wording through without a
flag.

*Correction note added 2026-11-16 (afternoon); the entry above is left as
written.* The CBC report is cited by its title only: CBC News, "1,500 fake job
ads led us to a global multi-level marketing scheme" (Visual Investigations,
November 2026). The description of the path from job ad to paid business in
the "Why" paragraph is ours, not CBC's; the FTC pages cited in METHODOLOGY.md
describe its parts.

**What changed.** Three new flags and two widened ones (30 flags, up from 27):

- **New, hard: "It's a business you pay to join, not a salaried job"**
  (`pay-to-join`). An "independent" distributor, agent, contractor or
  affiliate role you sign up for, plus a setup, enrollment, monthly,
  membership or platform fee (or an amount to start or each month); or a
  "sponsor ID". Quiet on a cut deducted from earnings, a franchise's disclosed
  fees, licensing exams, "no fee to join", and "an employee, not an
  independent contractor". Not severe, and its wording never says "scam": a
  multi-level marketing business is not automatically illegal.
- **New, hard: "The 'salary' isn't a salary"** (`salary-mismatch`). A figure
  the ad calls a salary (or a "Pay:" line), plus commission only, no base pay,
  or an independent contractor role. Quiet whenever there is a real base
  ("base salary plus commission", on-target earnings, a draw) and on honest
  commission-only or hourly contract ads that never call the pay a salary.
- **New, soft: "An information session instead of an interview"**
  (`info-session`). A group session, call or webinar about "the
  opportunity", the compensation plan or how members get paid, or offered
  instead of an interview. Quiet on hiring events, open interviews, orientation
  for new hires, and information sessions about careers or how to apply.
- **Widened: "A role scammers use most …"** (`high-risk-role`) now includes
  travel planning and booking roles offered remote with no experience, except
  when the employer says it hires on payroll (W-2, health insurance, a 401(k),
  paid time off).
- **Widened: "Pushes you toward a paid … program"** (`paid-program`) now
  includes "multiple streams of income", signing up as an independent
  distributor, and a sponsor ID. "Manage our network of independent
  distributors" (a sales manager's job) stays quiet.
- The three new flags carry one recruiter's tip: ask whether this is a
  salaried job paid by a named employer, or a commission business you would
  have to pay to join.

52 new test assertions (339 in all): each rule fires on the pattern and stays
quiet on the closest real wording (base plus commission, OTE, salaried travel
advisors, hiring events, orientation, honest 1099 work, a franchise
disclosure document, licensing exams), plus a whole funnel that must end at
"Walk away", never "Stop".

Frozen: sha256 of `src/red-flags.js` begins **`07491cc0ba15`** (2026-11-16,
8:22 AM PST).

**No loss on the training sets** (v0.4.2 → v0.5.0, same 345 cases; `cases.json`
`720864fb9066`, `cases-r2.json` `9db1e1a0ed72`):

| Checker | Set | Scams warned (caution or worse) | Scams "Stop" or "Walk away" | Real jobs told "Stop" | Real jobs given any warning |
|---|---|---|---|---|---|
| v0.4.2 | round 1, all (training) | 111 / 115 (96.5%) | 60 / 115 (52.2%) | 0 / 110 (0%) | 0 / 110 (0%) |
| v0.5.0 | round 1, all (training) | 111 / 115 (96.5%) | 61 / 115 (53.0%) | 0 / 110 (0%) | 0 / 110 (0%) |
| v0.5.0 | round 2 (retired; reproduction only) | 30 / 60 (50.0%) | 19 / 60 (31.7%) | 0 / 60 (0%) | 1 / 60 (1.7%) |

Case by case, one verdict changed: a round 1 travel multi-level marketing
scam went from "Proceed with caution" to "Walk away" (the widened
`high-risk-role`). One other round 1 scam gained the new soft flag with the
same verdict. Every round 2 case kept its verdict and flags.

**Real postings, tuning.** On the 7,000 federal postings already used for
tuning (1–7,000), v0.5.0 gives the same result as v0.4.2: 0 "Stop", 0 warnings
(a self-graded number). Federal postings rarely use this vocabulary: none of
the 7,000 mentions an independent contractor, distributor or agent, or a
travel agent role; 31 mention an information session, and none was flagged.

**Real postings · US federal jobs, a fresh batch (v0.5.0).** Scored once, after
the freeze, on postings 7,001–9,000 of the same March 2026 subset: 2,000
postings, none sharing a control number with the first 7,000. They were
downloaded on 2026-11-11 and were not opened or scored while v0.5.0 was written. v0.4.2
(rebuilt exactly, same hash `1909071fa6c4`) was run on the same 2,000:

| Checker | Real postings | Wrongly told "Stop" | Given any warning | No flag at all |
|---|---|---|---|---|
| v0.4.2 | 2,000 fresh federal postings | 3 (0.15%) | 4 (0.20%) | 1,988 (99.4%) |
| **v0.5.0** | **2,000 fresh federal postings (held out)** | **3 (0.15%)** | **4 (0.20%)** | 1,988 (99.4%) |

The two versions agree on every count, and none of the new flags fired. The
four warnings come from older rules meeting federal wording they had not seen:
"excess funds" moved between budget lines, read as returning money (Stop);
"equipment check out" without "check in", read as a fake check (Stop); a
statement that an application without the SSN "when requested" is not
processed (Stop); and a government purchase cardholder for a training
program, read as a paid program (caution). The other eight flagged postings
have soft flags only. These are left for a later version, which will need
another fresh batch; postings 7,001–9,000 are now tuning data.

**Round 3 (held out), scored ONCE on 2026-11-16 after v0.5.0 froze (07491cc0ba15).**
`benchmark/cases-r3.json`: 60 synthetic cases (30 scam, 30 real look-alikes; 4 + 4
marked ambiguous) written by a separate AI agent from public descriptions (FTC,
Competition Bureau Canada, Scamwatch, UK ASA, BBB and others; see SOURCES-r3.md),
without access to the rules, about job ads that lead to a business you pay to join.
v0.4.2 scored on the same cases for comparison:

| | v0.4.2 | v0.5.0 |
|---|---|---|
| Scams warned (caution or worse) | 9/30 (30.0%) | 12/30 (40.0%) |
| Scams "Stop" or "Walk away" | 2/30 (6.7%) | 3/30 (10.0%) |
| Real jobs told "Stop" | 0/30 | 0/30 |
| Real jobs given any warning | 2/30 (6.7%), both marked ambiguous | 2/30 (6.7%), the same two |
| Real jobs given any warning, unambiguous cases only | 0/26 | 0/26 |

Scams warned by stage (v0.5.0): the agreement 3/3, a recruiter's message 3/7,
the job ad 3/11, the follow-up email 2/6, the info-session invite 1/3. Most
salary-bait ads and follow-up emails still pass with no warning: they read like
real jobs until the fee or the "business" appears. The two real jobs warned are
a commission-only real-estate contract and an honest direct-selling agreement
(both candidate-paid, both marked ambiguous by the writer), flagged by the older
`pays-for-access` rule, as v0.4.2 did. Round 3 is now RETIRED into tuning data;
a later version needs a round-4 blind set for its held-out number.

## v0.6.0 · the first contact: the ad, the message, the invite (2026-11-16)

**Why.** Round 3 showed v0.5.0 warning on job ads for a business you pay to
join mostly at the late stages (the agreement 3/3), while the job ad (3/11),
the first message (3/7), the follow-up email (2/6) and the invitation (1/3)
read like real jobs. The owner chose to improve before launch. Round 3 became
training data for this version.

*Wording note added 2026-11-16 (afternoon); the entry above is left as
written.* For "The owner chose to improve before launch", read "We chose to
improve before launch".

**What changed** (31 flags, up from 30; generalized from the mechanism, not
round 3's wording):

- **New, hard, a combination: "Reads like a pitch for a business opportunity,
  not a job ad"** (`recruiting-pitch`). Fires only when three different kinds
  of sign appear together: lifestyle or "be your own boss" language; no
  experience needed next to a pay figure; a group session or "no traditional
  interview"; contact out of the blue, from a free email, or by texting a
  keyword; a travel or booking role with nothing about employment (W-2,
  benefits, PTO).
- **Widened `pay-to-join`**: paying to start or activate no longer needs the
  word "independent" (a startup investment, a business or founder's pack, an
  amount "to get started", a pass that unlocks commissions, a cost "most
  people make back"). Quiet on pay ("a $500 sign-on bonus to start", "$22 an
  hour to start"), on packages sold to customers, on optional kits sold at
  cost, and on texts that say plainly they are not employment (an income
  disclosure, "not an offer of employment").
- **Widened `salary-mismatch`**: a headline figure ("$50,000 - $64,000",
  "$55K") against self-employment, independent business owners, "not paid a
  salary", income that depends on building a team, or a tiered plan. On-target
  earnings no longer excuse a role that is self-employed. Quiet on a base, a
  UK "basic", a retainer, a draw, W-2 employment, earnings claims ("top
  advisors earn …"), franchise fees and honest disclosures.
- **Widened `paid-program`**: pay for bringing other people in (a bonus on
  every member you sponsor, pay when your friends sign up, earnings based on
  building a team, a list of the people you know). Quiet on an employee
  referral bonus paid when someone is hired.
- **Widened `no-interview-offer`**: "no traditional interview", "we do not
  hold interviews", "not an individual interview". Quiet on a work sample or
  an informal chat in place of a formal interview.
- **Widened `info-session`**: a group overview, presentation or webinar
  offered as the next step ("reserve your seat", "tonight", "watch the
  opportunity video"). Quiet on sessions the job runs for clients or patients,
  and on career information sessions.
- **Widened `email-mismatch`** to a signature line ("Hiring Manager, <Company>")
  on a free address, and **`unsolicited`** to text shorthand ("saw ur resume
  online").
- **Narrowed `pays-for-access`**: a licensing course and state exam for a
  licensed job, and an optional kit sold at cost, are no longer charges for
  access (the two round 3 real jobs it warned on).
- **Federal fixes** (from the v0.5.0 fresh batch, now tuning data): "excess
  funds" moved between budget lines, "equipment check out", a notice that an
  application without the SSN "when requested" is not processed, and a
  government purchase cardholder.

54 new test assertions (393 in all): each rule fires on the mechanism and stays
quiet on the closest real wording (an employee referral bonus, a team-bonus
target, a work sample, a real remote customer-service job with a pay range,
a salaried travel advisor, a staffing agency that does not name its client).

Frozen: sha256 of `src/red-flags.js` begins **`5354a5455980`** (2026-11-16,
10:41 AM PST).

**No loss on the training sets** (same 405 cases; `cases.json` `720864fb9066`,
`cases-r2.json` `9db1e1a0ed72`, `cases-r3.json` `eb0c4e385893`):

| Checker | Set | Scams warned (caution or worse) | Scams "Stop" or "Walk away" | Real jobs told "Stop" | Real jobs given any warning |
|---|---|---|---|---|---|
| v0.5.0 | round 1, all (training) | 111 / 115 (96.5%) | 61 / 115 (53.0%) | 0 / 110 (0%) | 0 / 110 (0%) |
| v0.6.0 | round 1, all (training) | 111 / 115 (96.5%) | 63 / 115 (54.8%) | 0 / 110 (0%) | 0 / 110 (0%) |
| v0.5.0 | round 2 (retired) | 30 / 60 (50.0%) | 19 / 60 (31.7%) | 0 / 60 (0%) | 1 / 60 (1.7%) |
| v0.6.0 | round 2 (retired) | 30 / 60 (50.0%) | 20 / 60 (33.3%) | 0 / 60 (0%) | 1 / 60 (1.7%) |
| v0.5.0 | round 3 (retired; its held-out score) | 12 / 30 (40.0%) | 3 / 30 (10.0%) | 0 / 30 (0%) | 2 / 30 (6.7%) |
| v0.6.0 | round 3 (training; self-graded) | 27 / 30 (90.0%) | 15 / 30 (50.0%) | 0 / 30 (0%) | 0 / 30 (0%) |

Round 3 scams warned by stage, v0.5.0 → v0.6.0: the job ad 3/11 → 10/11, the
first message 3/7 → 5/7, the follow-up email 2/6 → 6/6, the invitation 1/3 →
3/3, the agreement 3/3 → 3/3. The three still missed: two the writer marked
ambiguous (a salary-bait sales ad that asks no fee, and a polished recruiter
message about a "virtual overview") and a text whose own "Not MLM!!" reads as
a negation. Of the eight cases marked ambiguous, the four real ones get no
warning.

Case by case on rounds 1 and 2 (v0.5.0 → v0.6.0), no real job changed. Five
scams changed: three rose from "Proceed with caution" to "Walk away" (a task
scam, a multi-level marketing recruitment, a round 2 multi-level marketing
message whose buy-in you "earn back"), one more gained the combination flag at the same verdict, and one
data-entry starter kit is now quoted as a business you pay to join instead of
a charge for access (same verdict).

**Real postings, tuning.** On federal postings 1–9,000 (all tuning data now),
v0.6.0 gives 0 "Stop" and 0 warnings (a self-graded number); the four v0.5.0
false alarms on 7,001–9,000 are gone, and 33 postings have one or two soft
flags.

**Real postings · US federal jobs, a fresh batch (v0.6.0).** Scored once,
after the freeze, on postings 9,001–11,000 of the same March 2026 subset:
2,000 postings, downloaded after the freeze, none sharing a control number
with the first 9,000. v0.5.0 (`07491cc0ba15`) and v0.4.2 (`1909071fa6c4`),
exact copies, were run on the same 2,000:

| Checker | Real postings | Wrongly told "Stop" | Given any warning | No flag at all |
|---|---|---|---|---|
| v0.4.2 | 2,000 fresh federal postings | 1 (0.05%) | 2 (0.10%) | 1,990 (99.5%) |
| v0.5.0 | 2,000 fresh federal postings | 1 (0.05%) | 2 (0.10%) | 1,990 (99.5%) |
| **v0.6.0** | **2,000 fresh federal postings (held out)** | **1 (0.05%)** | **2 (0.10%)** | 1,990 (99.5%) |

All three agree on every count, and none of the v0.5 or v0.6 flags fired. The
two warnings come from older rules: the last four SSN digits listed with the
announcement number in an order the federal exemption does not cover (Stop),
and a driver's license number asked for in a written narrative (caution).
These are left for a later version and another fresh batch; postings
9,001–11,000 are now tuning data.

**Round 4 (held out), scored ONCE on 2026-11-16 after v0.6.0 froze (5354a5455980).**
`benchmark/cases-r4.json`: 60 synthetic cases (30 scam, 30 real look-alikes; 4 + 4
marked ambiguous; weighted to the first contact: 16 scam job ads and 8 first
messages), written by a separate AI agent from public descriptions (see
SOURCES-r4.md), without access to the rules or to round 3. All three versions
scored on the same cases:

| | v0.4.2 | v0.5.0 | v0.6.0 |
|---|---|---|---|
| Scams warned (caution or worse) | 12/30 (40.0%) | 15/30 (50.0%) | 21/30 (70.0%) |
| Scams "Stop" or "Walk away" | 7/30 (23.3%) | 8/30 (26.7%) | 11/30 (36.7%) |
| Real jobs told "Stop" | 0/30 | 0/30 | 0/30 |
| Real jobs given any warning | 1/30 (3.3%), marked ambiguous | 1/30, the same | 0/30 |

Scams warned by stage (v0.6.0): the job ad 11/16, the first message 3/5, the
follow-up email 3/5, the invitation 2/2, the agreement 2/2. Round 3's training
figure for v0.6.0 (27/30) was self-graded; this 70% is the held-out number.
Round 4 is now RETIRED into tuning data; a later version needs a round-5 blind set.

*Note added 2026-11-16 (evening).* 2026-11-16: source links checked by hand;
8 dropped (broken or naming a company): 5 broken links (one Ontario
government guide page, two Action Fraud pages, one job board's identity-theft
page, and an ASA rulings listing page) and 3 consumer reports whose pages name
a company. Case files' source fields only; texts, labels and verdicts
unchanged. In `cases.json` 4 scam cases' `source` became `null` (sha256 now
begins `4885daa155b6`, was `720864fb9066`); in `cases-r3.json` 2 scam cases'
`source` became `null` (now `f4fce278d8a1`, was `eb0c4e385893`); in
`cases-r4.json` 3 scam cases' `source` became `null` and 3 cases that cited two
ASA rulings now cite the ASA's guidance on recruitment ads (now
`317fac7a9a84`, was `dec289b2cbe8`). `cases-r2.json` is unchanged.

Reproduction on v0.6.0 (`5354a5455980`), not a new score: every one of the 465
cases kept the same verdict and flags. Round 3: 27 / 30 scams warned, 0 / 30
real jobs warned. Round 4: 21 / 30 scams warned (11 "Stop" or "Walk away"),
0 / 30 real jobs warned. Round 1: 111 / 115 and 0 / 110; round 2: 30 / 60 and
1 / 60, as before.

## v0.6.1 · the salary tip works in any country (2026-11-18)

A wording change to one flag's advice, nothing else. The tip on "Pay is
implausibly high for the role" (`implausible-pay`) told the reader to look the
role up on a salary site, without saying where; it now names a place to start
that works outside the US too:

> Look the role up on a salary site for your city. 40% or more above what
> comes back is a reason to ask why. Indeed's salary pages are a good place to
> start: indeed.com/career/salaries, or your own country's Indeed site.

The flag's label, detail and check are unchanged, as are the other 30 flags.
The only other edits are the version string (`0.6.0` → `0.6.1` in
`src/red-flags.js` and `package.json`).

Frozen: sha256 of `src/red-flags.js` begins **`6d848822fd4e`** (2026-11-18;
v0.6.0 was `5354a5455980`). 393 tests pass, as before.

**Verdicts identical on all 465 cases.** v0.6.0 (an exact copy) and v0.6.1
were run on every case: `cases.json` 225 / 225, `cases-r2.json` 120 / 120,
`cases-r3.json` 60 / 60, `cases-r4.json` 60 / 60 kept the same verdict and the
same flags, with the same quoted lines (case files unchanged: `4885daa155b6`,
`9db1e1a0ed72`, `f4fce278d8a1`, `317fac7a9a84`). `node benchmark/run.js`
prints the same figures on all four, apart from the version in its first line.

**No new federal score.** The rules decide what is flagged; the tip is only
shown next to a flag that has already fired. With no change to any check, v0.6.1
flags exactly what v0.6.0 flags on any text, so v0.6.0's figures (the held-out
round 4 score and the fresh federal batch, 9,001–11,000) stand for v0.6.1, and
no held-out set or fresh federal batch was spent on it.
