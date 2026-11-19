# How the Job Red Flag Checker is built and tested

This document explains where the rules come from, how they are tested, what
the published numbers mean, and what the checker cannot do. Every number here
can be reproduced from this repository and the public dataset it names (see
section 8).

## Why a recruiter built this

> I spent my career on the other side of the desk. I've run hiring from start to finish: I wrote the job postings, decided whose resumes made the shortlist, ran the interviews and made the offers. I've led recruitment teams in Canada, the US, and Australia, for roles from entry level to executive, in fields from tech and healthcare to the trades, mining, and local government. Hundreds of roles filled, thousands of interviews. I love recruitment.
>
> That's how I know what a real hiring process looks like. Real employers don't charge candidates and a great hiring company puts transparency in front when recruiting. In most hiring, your Social Security Number, SIN, bank details, and passport are documents you provide after an offer is accepted, through a verified HR system. A scam has to break those rules somewhere, and it usually does it in writing.
>
> I built this checker on rules instead of AI, for the same reason I built Resume Cleanup that way: what you paste stays on your device. Rules have edges, and I'd rather tell you where they are. Every flag quotes the exact words that raised it, so you can judge it yourself.
>
> One habit protects you more than any tool: check whether the role appears on the company's own careers page. If the job is real, it should be there. If it isn't, ask why before you apply. A job posting not advertised on the careers page isn't abnormal (plenty of small companies do not have a careers page that is integrated into job boards such as Indeed and LinkedIn), but it should raise some skepticism. Trust the feeling. If something seems off, it probably is.
>
> — Jeff, the recruiter who built Ready to Apply

## 1. Design principles

1. **Never tell someone a real job is a scam.** A false "Stop" costs a job
   seeker a real opportunity and accuses a real employer. Every rule is tuned
   for that first, and detection second.
2. **Evidence, not a score.** Every flag quotes the exact words that raised
   it, so the reader can judge it. If we can't point to it, we don't flag it.
3. **Rules only.** No AI and no network calls: the same text always gets the
   same answer, nothing is sent anywhere, and every decision can be read in
   `src/red-flags.js`.
4. **One flag is a question; three flags are an answer.** Severe flags mean
   stop. Hard flags mean verify first. Soft flags count only in clusters.

## 2. Where the rules come from

**Public authorities.** Each scam type the checker looks for is documented by
at least one of: the US Federal Trade Commission (FTC), the FBI's Internet
Crime Complaint Center (IC3), the US Postal Inspection Service, the Better
Business Bureau, the Canadian Anti-Fraud Centre, UK Action Fraud, Australia's
Scamwatch, and job boards' own safety guidance. The sources used to build the
benchmark are listed in [benchmark/SOURCES.md](benchmark/SOURCES.md).

**Job ads for a business you pay to join (version 0.5).** CBC News reported on
fake job ads that led applicants into a multi-level marketing scheme ("1,500
fake job ads led us to a global multi-level marketing scheme", Visual
Investigations, November 2026,
[video](https://www.youtube.com/watch?v=RioE6ClJbaM)). The pattern these flags
look for, in our words: an ordinary-looking job ad, then a group session
instead of an interview, then a contract that turns the "job" into a
commission business you pay to start. The FTC describes the parts of it:
"Don't pay for the promise of a job"
([Job Scams](https://consumer.ftc.gov/articles/job-scams), March 2023), and
"In many MLMs, before you can start selling the products, you have to buy
them from the company"
([Multi-Level Marketing Businesses and Pyramid Schemes](https://consumer.ftc.gov/articles/multi-level-marketing-businesses-and-pyramid-schemes),
July 2022). Three flags cover that path, written from the mechanism rather
than any one report: a business you pay to join (an "independent" role plus a
fee to start or keep it, or a sponsor ID), a "salary" that is commission only,
and an information session in place of an interview.

The first of these is a hard flag, never a severe one, and its wording never
says "scam". The FTC says "Some MLMs are illegal pyramid schemes"
([Multi-Level Marketing Businesses and Pyramid Schemes](https://consumer.ftc.gov/articles/multi-level-marketing-businesses-and-pyramid-schemes),
July 2022), not all of them, and that "whether an MLM is a pyramid scheme
depends on what the MLM's compensation plan incentivizes"
([Business Guidance Concerning Multi-Level Marketing](https://www.ftc.gov/business-guidance/resources/business-guidance-concerning-multi-level-marketing),
April 2024). A text checker cannot see a compensation plan. What it can show
is that the "job" is a business you would pay to join. For the same reason,
the benchmark's label of "scam" on its multi-level marketing cases is open to
debate; those cases describe pay from recruiting and required purchases, the
FTC's warning signs of a pyramid scheme.

**The first contact (version 0.6).** Version 0.5 caught these offers once the
fee or the agreement appeared, but most of them start with an ad, a message
or an invitation that reads like a real job. Version 0.6 looks at that first
contact, again by mechanism:

- **Paying to start**, with or without the word "independent": a startup
  investment, a business or founder's pack, an amount "to get started", a pass
  that "unlocks full commissions", or a cost "most people make back".
- **Pay for bringing other people in**: a bonus on every member you sponsor,
  pay when your friends sign up, earnings based on building a team, a list of
  the people you know. (An employee referral bonus, paid when someone is
  hired, is ordinary.)
- **A headline figure, then no wage**: "$50,000 - $64,000" at the top, then
  self-employed, independent business owners, "not paid a salary", or pay
  earned through a tiered plan.
- **No traditional interview**, or a group overview, presentation or webinar
  offered as the next step instead.
- **A combination flag, "Reads like a pitch for a business opportunity, not a
  job ad"**, which needs three different kinds of sign together: lifestyle or
  "be your own boss" language, no experience needed next to a pay figure, a
  group session instead of an interview, contact out of the blue or from a
  free email or by texting a keyword, and a travel or booking role with
  nothing about employment. No one of these is evidence on its own.

Some laws now make the honest version easier to recognize. Since January 1,
2026, Ontario's Employment Standards Act, 2000 (section 8.5, added by the
Working for Workers Five Act, 2024) requires a publicly advertised job posting
to include "a statement disclosing whether the posting is for an existing
vacancy or not". The checker does not test for that statement, because most
postings are not covered by the rule.

**How real hiring works.** Many of the strongest rules come from knowing the
legitimate process well enough to spot when something departs from it. This
is a recruiter's knowledge of how hiring actually runs, checked against a
career of doing it, not a scam list copied from elsewhere.

- **Money flows from the employer to you, never the other way.** Real
  employers don't charge for training, equipment, a starter kit or
  "activation". (Your own tools, a license exam or a government background
  check can be real costs; those are not flagged.)
- **Paperwork comes after an interview and a written offer**, through HR:
  tax forms, I-9 or the local equivalent, direct deposit. Never before an
  interview. I've onboarded dozens of internal hires: the offer letter comes
  first, and the tax forms and bank details are completed during onboarding.
- **An interview is a conversation with a named person**, by phone, video or
  in person, not a chat window or a questionnaire you text back.
- **Recruiters at real companies write from the company's own email
  domain.** Agency recruiters use their agency's domain, which is normal; a
  "company recruiter" on Gmail is not.
- **Nobody needs your online banking login**, a one-time code, or remote
  control of your computer. Payroll needs an account number, from HR.
- **No employer asks you to keep anything from your bank.** Scammers coach
  people to hide fake-check deposits from bank tellers.
- **"Is your checking account set up for mobile deposit?" is not an
  interview question.** In fact, questions that pertain to banking or direct
  deposits are handled confidentially by the hiring company's payroll
  department, and not by the recruiter or hiring manager interviewing you.
- **If you're feeling suspicious, call the company using the number on its
  official website.** Not the number in the posting, and not the number in
  any email you received.
- **Check the recruiter on LinkedIn, then confirm the job with the company
  itself.** Scammers build fake recruiter profiles and copy real recruiters'
  names, so a profile alone proves nothing.

**What is deliberately NOT flagged.** Real jobs share words with scams. These
never count as evidence, and each has a test proving it:

- employers' own fraud warnings ("we will never ask you to pay…")
- normal job costs: your own tools or boots, a license exam, state fingerprinting
- post-offer paperwork from HR (unless the "hiring" runs in a chat app)
- everyday hiring language: "selected for an interview", "text JOBS to apply",
  "hiring immediately", an agency's "our client"
- job duties that handle money or parcels: tellers, cashiers, payroll, AP/AR,
  package handlers, returns processing, real per-task field work
- a company describing its own product ("our payments and wallet platform")
- US federal hiring's own requirements, in the government's wording only: the
  last four digits of an SSN beside the announcement number on an application
  packet, the SSN a USAJOBS account asks for, date of birth for jobs with a
  maximum entry age, the scored "Written Interview", a sentence that defines
  personal data, a government credit card the job holds, the military
  "Transition Assistance" form, "payment certification" and buying course
  materials as job duties, a rule against AI assistants in interviews, checking
  equipment in and out, and a union's contact on a free email address. The
  same request in other words, or from a lookalike address, still counts.
- honest commission and contract work: a base salary plus commission,
  on-target earnings (OTE), commission-only or hourly 1099 work that never
  calls the pay a salary, a cut deducted from a gig worker's earnings, a
  franchise's disclosed fees, and an independent agent's own licensing exam
- hiring events, open interviews, orientation for new hires, and information
  sessions about careers or how to apply
- travel advisors hired on payroll (W-2, health insurance, a 401(k), paid
  time off)
- an employee referral bonus, a retainer or a draw against commission, a UK
  "basic" salary, a work sample or an informal chat in place of a formal
  interview, a session the job runs for clients or patients, a career
  information session, an optional kit sold at cost, and a licensing course
  and state exam for a licensed job
- in US federal postings: moving "excess funds" between budget lines,
  "equipment check out", a notice that an application without the SSN "when
  requested" is not processed, and a government purchase cardholder

## 3. Three kinds of evidence

### 3.1 Unit tests (`npm test`)

393 tests. Every rule has tests showing it **firing** on scam wording **and
staying quiet** on the closest wording a real employer uses. Every example is
invented.

### 3.2 The benchmark (`node benchmark/run.js`)

**What it is.** Synthetic test cases (scams and real-job "hard negatives")
written by an AI assistant from the public descriptions above. They are **not
postings collected in the wild**. Each scam case cites its source, except
nine whose page was later found broken or naming a company
([benchmark/HISTORY.md](benchmark/HISTORY.md), 2026-11-16 note).

**Written blind.** The cases were written without access to the rules, so
they could not be shaped to match them.

**Held out.** Rules are tuned on one set, then scored once on a set they
never saw. That score is the one we publish. A held-out set is then retired
into training data, and the next version is scored on a fresh one. This is
what keeps the numbers from being self-graded.

**The record, unedited** (full detail in [benchmark/HISTORY.md](benchmark/HISTORY.md)):

| Round | Checker | Held-out set | Scams warned | Scams "Stop"/"Walk away" | Real jobs told "Stop" | Real jobs warned |
|---|---|---|---|---|---|---|
| 1 | v0.2.0 (before the benchmark) | round 1 test (55 scams, 52 real) | 29.1% | 14.5% | 3.8% | 5.8% |
| 1 | v0.3.0 (tuned on round 1 dev) | round 1 test (55 scams, 52 real) | 40.0% | 16.4% | 3.8% | 5.8% |
| 2 | **v0.4.0** (tuned on all of round 1) | **round 2 (60 scams, 60 real, new and blind)** | **50.0%** | **31.7%** | **0%** | **1.7%** |
| 3 | **v0.5.0** (tuned on rounds 1 and 2) | **round 3 (30 scams, 30 real: job ads for a business you pay to join, new and blind)** | **40.0%** | **10.0%** | **0%** | **6.7%** (2 cases the writer marked ambiguous; 0 of the 26 others) |
| 4 | **v0.6.0** (tuned on rounds 1 to 3) | **round 4 (30 scams, 30 real: the multi-level marketing / pay-to-join family, new and blind)** | **70.0%** | **36.7%** | **0%** | **0%** |

**What round 1 taught us.** Tuning took the dev set to 100% but the held-out
set only to 40%: rules written against specific wording don't transfer to the
same scam told in other words. Version 0.4 therefore moved from phrases to
**concepts**: *the reader is asked to send or return money*, *money passes
through the reader's own account*, *goods arrive at the reader's address with
labels someone else provides*, *the interview happens in a chat*. On a fresh,
blind round 2 set, that lifted detection from 40% to 50%, nearly doubled the
strong verdicts, and brought false "Stop" verdicts on real jobs to zero. Half
of new scams still use wording no rule anticipates, which is why each version
is scored on a set it has never seen, and why the number we publish is the
held-out one, not the training one (97% for v0.4.0; 111 of 115, 96.5%, for
v0.4.2, v0.5.0 and v0.6.0).

**What round 3 taught us.** Round 3 was written about one kind of offer: job
ads that lead to a business you pay to join. Version 0.5 warned on 40% of
them, nearly all at the stage where the fee or the agreement appears; the ad,
the first message and the invitation mostly read like real jobs. Version 0.6
was tuned on round 3 (it is training data now) to read that first contact by
its mechanism. On round 3 it warns on 27 of 30 scams and on none of the 30 real
jobs, but that is a training number. Its held-out number is round 4, recorded
in [benchmark/HISTORY.md](benchmark/HISTORY.md).

### 3.3 Real postings, for false alarms

The benchmark's "real jobs" are synthetic too, so false alarms are also
measured on real postings:

- **4,800 real US federal job postings** (USAJOBS, March 2026, held out from
  tuning): **12 wrongly told "Stop" (0.25%), 38 given any warning (0.79%).**
  Federal postings are a demanding test: they legitimately ask for the last
  four digits of an SSN, proof of age for firefighters and air traffic
  controllers, and a scored "Written Interview", all of which would be scam
  signs in a private-sector posting.
- **2,000 fresh US federal job postings** (the next postings in the same
  set, held out from tuning), after version 0.4.2 exempted those federal
  requirements, in the government's wording only: **0 wrongly told "Stop",
  0 given any warning.** Version 0.4.1 on the same 2,000: 5 told "Stop"
  (0.25%), 10 given a warning (0.50%). Federal agencies reuse the same
  boilerplate, so a batch from the same month largely tests whether the same
  sentences recur; other employers' wording is not measured here.
- **2,000 more fresh US federal job postings** (postings 7,001–9,000 of the
  same set, held out from tuning), for version 0.5.0: **3 wrongly told "Stop"
  (0.15%), 4 given any warning (0.20%)**, exactly the same as version 0.4.2
  on the same 2,000. None of the new flags fired; the four came from older
  rules meeting federal wording they had not seen (budget transfers of
  "excess funds", "equipment check out", an SSN statement, a government
  purchase cardholder). Federal postings rarely use the words the new flags
  look for, so this checks that they stay quiet, not how well they work.
- **2,000 more fresh US federal job postings** (postings 9,001–11,000), for
  version 0.6.0, which also fixed those four: **1 wrongly told "Stop"
  (0.05%), 2 given any warning (0.10%)**, the same as versions 0.5.0 and
  0.4.2 on the same 2,000. None of the newer flags fired; the two came from
  older rules (the last four SSN digits listed in an order the federal
  exemption does not cover, and a driver's license number asked for in a
  written narrative).

  Details of all four in [benchmark/HISTORY.md](benchmark/HISTORY.md). _Data: USAJOBS job
  announcements via the Hugging Face dataset
  [loyoladatamining/usajobs](https://huggingface.co/datasets/loyoladatamining/usajobs)
  (MIT license), curated by Resh, Lee & Ming (2025),
  doi:[10.6084/m9.figshare.28509314.v5](https://doi.org/10.6084/m9.figshare.28509314.v5)._

## 4. Limitations

- **Text only.** A scammer who copies a real company's posting word for word
  passes the text checks. The tell is usually in the contact: a chat app, a
  free email address, a request for money or documents. When in doubt, find
  the job on the company's own careers page.
- **English only**, written for North American, UK and Australian wording.
- **Synthetic benchmark.** The benchmark measures how well the rules
  generalize to new wording of known scam types, not how often they meet
  each type in the wild.
- **Rules lag new scams.** New patterns appear constantly. Contributions are
  welcome: see [CONTRIBUTING.md](CONTRIBUTING.md).

## 5. How it was built, and who checked it

- **The rules and tests** were written in JavaScript with AI coding
  assistance, with direction and oversight by Jeff.
- **Recruiter review.** Jeff manually reviewed the wording of all 31 flags
  (label, explanation, and what to do), spot-checked 20 benchmark cases
  (mostly ones the writers marked hard to call), and agreed with the label on
  all 20.
- **Benchmark cases** were written by an AI assistant from public
  descriptions, without access to the rules (section 3.2).

## 6. What we won't do

- **We won't name employers as scammers.** The checker flags wording, never
  companies. There is no list of "bad companies", and there won't be one.
- **We won't collect what you paste.** The checker runs entirely in your
  browser or on your machine. Nothing is sent, logged or stored.
- **We won't hide our interest.** Ready to Apply is a paid product (it scores
  your resume against a job description). This checker is free, open source
  and works without it. When a posting looks real, the page suggests checking
  your fit with Ready to Apply; that's the only link between them.
- **We won't publish numbers we can't back up.** Every figure in this
  document is reproducible here, or names the dataset and its license. A
  dataset whose terms we haven't confirmed is used privately and never cited.
- **We won't quietly fix a bad number.** Results are recorded in
  [benchmark/HISTORY.md](benchmark/HISTORY.md) and never edited after the
  fact, including the ones that went badly.

## 7. If it flags a real job

A false alarm accuses a real employer and can cost someone an opportunity, so
it's treated as a bug. Open an issue with the wording that was flagged (remove
names and contact details), and we'll fix the rule, add a test so it can't
come back, and record the change.

## 8. Reproduce it

```bash
npm test                                         # unit tests
node benchmark/run.js --file cases.json --split all
node benchmark/run.js --file cases-r2.json       # the round 2 held-out score

# Real US federal postings (downloaded from Hugging Face, kept out of the repo)
node benchmark/usajobs.js fetch --config 2026_03 --n 7000
node benchmark/usajobs.js score --skip 5000 --limit 2000   # v0.4.2's fresh batch
node benchmark/usajobs.js fetch --config 2026_03 --n 9000
node benchmark/usajobs.js score --skip 7000 --limit 2000   # v0.5.0's fresh batch
node benchmark/usajobs.js fetch --config 2026_03 --n 11000
node benchmark/usajobs.js score --skip 9000 --limit 2000   # v0.6.0's fresh batch
```

Each figure in [benchmark/HISTORY.md](benchmark/HISTORY.md) names the rules
version it was measured with; a figure for an older version needs that
version's `src/red-flags.js`.
