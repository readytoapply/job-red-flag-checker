# Sources for the round-4 held-out set (`cases-r4.json`)

60 cases (30 scam/misleading, 30 legit), all `split: "test"`. Topic: job ads and recruiter contacts that funnel applicants into a "business you pay to join" (MLM or pay-to-join distributor, affiliate and travel-agent programs, salary bait that turns into commission-only, group "overviews" in place of interviews, starter kits, certification and monthly fees, sponsor IDs). This round puts the weight on the **first contact**: 16 of the 30 scam cases are the job-board ad itself and 8 are the first recruiter email, text or DM.

Every scam case except three cites one source below. Legit cases cite a source only where a public page documents the practice; the other 25 are `null`.

All pages were accessed on **2026-11-16**. "Fetched" means the page was opened and read that day. "Search-confirmed" means the URL and title came back from a web search that day, but the page was not opened.

## Scam patterns

| # | Title | Publisher | URL | Status | Cited by |
|---|---|---|---|---|---|
| 1 | Multi-Level Marketing Businesses and Pyramid Schemes | U.S. Federal Trade Commission (Consumer Advice) | https://consumer.ftc.gov/articles/multi-level-marketing-businesses-and-pyramid-schemes | Fetched | scam-007, 022, 028 |
| 2 | Business Guidance Concerning Multi-Level Marketing | U.S. Federal Trade Commission (business guidance, non-binding staff guidance) | https://www.ftc.gov/business-guidance/resources/business-guidance-concerning-multi-level-marketing | Fetched | scam-002, 006, 016, 020, 025 |
| 3 | When a Business Offer or Coaching Program Is a Scam | U.S. Federal Trade Commission (Consumer Advice) | https://consumer.ftc.gov/articles/when-business-offer-or-coaching-program-scam | Fetched | scam-005, 024, 030 |
| 4 | How to avoid work-from-home job scams (consumer alert, Jun 24 2025) | U.S. Federal Trade Commission | https://consumer.ftc.gov/consumer-alerts/2025/06/how-avoid-work-home-job-scams | Fetched | scam-001, 010, 018 |
| 5 | Jobs and employment scams | Scamwatch (National Anti-Scam Centre, Australia) | https://www.scamwatch.gov.au/types-of-scams/jobs-and-employment-scams | Fetched (has a pyramid-scheme section; warns against paying recruitment or training fees and up-front PayID transfers) | scam-004, 019, 029 |
| 6 | Guidance Notice for MLM Companies | UK Advertising Standards Authority / CAP | https://www.asa.org.uk/resource/guidance-notice-for-mlm-companies.html | Fetched (short notice: flags misleading earnings and job-description claims in MLM recruitment ads) | scam-013 |
| 7 | Getting the job done: getting your ads for employment opportunities right | UK ASA | https://www.asa.org.uk/news/getting-the-job-done-getting-your-ads-for-employment-opportunities-right.html | Search-confirmed | scam-008, 026 |
| 12 | Multi-level marketing and pyramid selling | Competition Bureau Canada | https://competition-bureau.canada.ca/deceptive-marketing-practices/types-deceptive-marketing-practices/multi-level-marketing-and-pyramid-selling | Search-confirmed (pay for recruitment and required purchases other than an at-cost start-up kit are hallmarks of illegal pyramid selling) | scam-009, 027, legit-008 |
| 13 | Job (scam type page) | Canadian Anti-Fraud Centre | https://antifraudcentre-centreantifraude.ca/scams-fraudes/job-emploi-eng.htm | Search-confirmed | scam-023 |
| 14 | Warning signs of a pyramid scheme | Northern Territory Government (Australia) | https://nt.gov.au/law/rights/pyramid-selling/warning-signs-of-a-pyramid-scheme | Search-confirmed | scam-011 |
| 15 | Work from Home Opportunities | Arizona Attorney General | https://www.azag.gov/consumer/tips/work-home-opportunities | Search-confirmed ("in a legitimate job, the business pays you") | scam-015 |

## Regulator rulings on misleading job ads

Two UK Advertising Standards Authority rulings, cited by ruling number only. They informed scam-003, scam-014 and legit-016, whose `source` field points to the ASA's guidance on recruitment ads (row 17).

| # | Ruling | Publisher | Informed |
|---|---|---|---|
| 8 | ASA ruling A13-222791: an ad called a self-employed sales role "permanent, full time" | UK ASA | scam-003 |
| 9 | ASA ruling A12-214985: an ad for self-employed, door-to-door, commission-only work had to make that status clear | UK ASA | scam-014, legit-016 |

## Legit practices

| # | Title | Publisher | URL | Status | Cited by |
|---|---|---|---|---|---|
| 16 | Employment Eligibility Verification (Form I-9) | U.S. Citizenship and Immigration Services | https://www.uscis.gov/i-9 | Not re-opened this round (listed as fetched in round 2's sources) | legit-004 |
| 17 | Recruitment and business opportunities: earnings claims (AdviceOnline) | UK ASA / CAP | https://www.asa.org.uk/advice-online/recruitment-and-business-opportunities-earnings-claims.html | Search-confirmed | legit-012, scam-003, scam-014, legit-016 |
| 18 | Ontario's new job posting and hiring transparency rules in force as of January 1, 2026 | Mondaq (law-firm summary, not the government text) | https://www.mondaq.com/canada/employee-benefits-compensation/1729652/ontarios-new-job-posting-and-hiring-transparency-rules-in-force-as-of-january-1-2026 | Search-confirmed (pay range ≤ $50,000 wide for covered employers, AI-screening disclosure, whether a vacancy exists) | legit-017 |

## Background read but not cited by a case

| Title | Publisher | URL | Status |
|---|---|---|---|
| Business Opportunity Rule (16 CFR Part 437: sellers of business opportunities must give buyers a disclosure document before they pay). Read in place of a 2024 FTC enforcement release about a gig-work platform's fees, whose address names the company. | U.S. Federal Trade Commission | https://www.ftc.gov/legal-library/browse/rules/business-opportunity-rule | Fetched |
| Travel MLMs: What You Need to Know ("travel agent discounts", ID cards) | Host Agency Reviews (industry site) | https://hostagencyreviews.com/travel-mlms/ | Search-confirmed |

A news feature about an alleged pyramid scheme that recruited migrant workers through a "job" was also read; it is not listed, because its address names the business.

The CBC News video cited as background for round 3 ("1,500 fake job ads led us to a global multi-level marketing scheme", Visual Investigations, November 2026, https://www.youtube.com/watch?v=RioE6ClJbaM) is cited by title only. No round 4 case relies on it.

## How the cases were written

- Written on 2026-11-16 by an AI assistant (Claude), working from the public descriptions above and general knowledge of how these offers are pitched. No source's ad wording was copied; voice, polish (from corporate copy to emoji-heavy DMs), length, region and industry were varied on purpose.
- The writer had **no access to the checker's rules, tests or earlier benchmark cases**: it did not open `src/`, `test/`, any `benchmark/*.json` other than this file, `run.js`, `RESULTS.md`, `HISTORY.md`, `SOURCES-r3.md`, `METHODOLOGY.md` or `README.md`. It read only the first 40 lines of `SOURCES-r2.md` for this file's format.
- Regions: US, Canada, UK and Australia. Industries: travel, admin, marketing, customer service, wellness, finance and insurance-style, events, retail, energy, real estate, healthcare, trades.
- The legit half is built as look-alikes: commission sales with a base or OTE stated, travel advisors on payroll, open interviews and group interviews, paid orientation, campus info sessions, a career fair, honest 1099 courier and freelance work, honest franchise recruiting with disclosure, honest direct selling that says it is not a job, a corporate job at a direct-selling company, insurance and real-estate roles with candidate-paid licences or fees, a staffing agency that doesn't name its client, and first-contact recruiter emails, DMs and texts. Several pair directly with a scam case (named in each note).

## Counts

| | ad | email | message | invite | agreement | total | ambiguous |
|---|---|---|---|---|---|---|---|
| scam | 16 | 5 | 5 | 2 | 2 | 30 | 4 |
| legit | 19 | 4 | 2 | 4 | 1 | 30 | 4 |
| **total** | 35 | 9 | 7 | 6 | 3 | 60 | 8 |

First-contact scam cases: 16 ads + 8 first messages (scam-016 to 023: 4 emails replying to or cold-contacting an applicant, 1 SMS, 1 LinkedIn DM, 1 WhatsApp/Facebook message, 1 Instagram DM). The other 6 scam cases are later stages (invites, agreements, a pressure follow-up, an "offer").

**Ambiguous cases** (marked `ambiguous: true`):
- scam-006: insurance-style recruiting; candidate-paid licensing is normal in the field, but reimbursement is tied to recruiting three associates and there is a membership fee.
- scam-011: an "assistant" ad with some real duties; the $295 fee is "once you're ready", but no wage is stated and the goal is to duplicate the owner's business.
- scam-014: the body honestly discloses commission-only contracting and fees; the headline salary range is the misleading part.
- scam-016: the DM says "not a job posting", but hides the company and the kind of opportunity.
- legit-008: honest direct selling with an optional kit, no quota, a buyback and a candid income disclosure; still an MLM-style opportunity.
- legit-010: real-estate brokerage, commission-only with a monthly desk fee, fully disclosed.
- legit-016: commission-only solar contractor with unpaid optional training, but no fees and no recruiting.
- legit-030: a group "career night" for self-employed estate agents with a desk fee, but costs, split and a realistic median are disclosed and interviews are one-to-one.

## Invented names

Every company, person and domain is invented. Phone numbers are 555-01xx (US/Canada format); the UK and Australian cases carry no phone number. No real company is named as a scammer; venues are invented.

On 2026-11-16, every domain in the case texts (47) and the bare `.com` stem of every scam company (both the full compacted name and its distinctive first word, 61 stems) was checked with Node's `dns` module for both an A record and NS records. The first pass found 24 that resolved (mostly coined single words held by registrars or parked, plus one scam domain and two legit-case domains); every affected name was renamed, and four replacement candidates that also resolved were discarded before use. In the final file **none resolves** (all ENOTFOUND).
