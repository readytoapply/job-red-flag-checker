# Sources for the round-2 held-out set (`cases-r2.json`)

120 cases (60 scam, 60 legit), all `split: "test"`. Every scam case cites one source below. Legit cases cite a source only where a public page documents the practice; the rest are `null`.

All pages were accessed on **2026-11-09**. "Fetched" means the page was opened and read that day. "Search-confirmed" means the URL and title came back from a web search that day, but the page itself was not opened. "Blocked" means the site refused the automated fetch (HTTP 403), so the URL comes from a link on another official page.

## Scam patterns

| # | Title | Publisher | URL | Status |
|---|---|---|---|---|
| 1 | Job Scams | U.S. Federal Trade Commission (Consumer Advice) | https://consumer.ftc.gov/articles/job-scams | Fetched |
| 2 | Paying to get paid: gamified job scams drive record losses (Data Spotlight, Dec 2024) | U.S. Federal Trade Commission | https://www.ftc.gov/news-events/data-visualizations/data-spotlight/2024/12/paying-get-paid-gamified-job-scams-drive-record-losses | Search-confirmed |
| 3 | Task scams create the illusion of making money (consumer alert, Nov 2024) | U.S. Federal Trade Commission | https://consumer.ftc.gov/consumer-alerts/2024/11/task-scams-create-illusion-making-money | Search-confirmed |
| 4 | How To Spot, Avoid, and Report Fake Check Scams | U.S. Federal Trade Commission | https://consumer.ftc.gov/articles/how-spot-avoid-and-report-fake-check-scams | Fetched |
| 5 | Mystery Shopping Scams | U.S. Federal Trade Commission | https://consumer.ftc.gov/mystery-shopping-scams | Fetched |
| 6 | Can you unbox the signs of a reshipping scam? (consumer alert, Dec 3 2025) | U.S. Federal Trade Commission | https://consumer.ftc.gov/consumer-alerts/2025/12/can-you-unbox-signs-reshipping-scam | Fetched |
| 7 | Multi-Level Marketing Businesses and Pyramid Schemes | U.S. Federal Trade Commission | https://consumer.ftc.gov/articles/multi-level-marketing-businesses-and-pyramid-schemes | Fetched |
| 8 | Don't send your Social Security number to an "employer" on WhatsApp. It's a scam (consumer alert, Aug 15 2024) | U.S. Federal Trade Commission | https://consumer.ftc.gov/node/86098 | Fetched (node URL; the slug URL was not shown on the page) |
| 9 | Scammers impersonate well-known companies, recruit for fake jobs on LinkedIn and other job platforms (Aug 8 2023) | U.S. Federal Trade Commission | https://consumer.ftc.gov/consumer-alerts/2023/08/scammers-impersonate-well-known-companies-recruit-fake-jobs-linkedin-other-job-platforms | Fetched |
| 10 | That job offer text is probably a scam (Apr 30 2026) | U.S. Federal Trade Commission | https://consumer.ftc.gov/consumer-alerts/2026/04/job-offer-text-probably-scam | Fetched |
| 11 | Looking for a job? Scammers might be looking for you (Jan 2023) | U.S. Federal Trade Commission | https://consumer.ftc.gov/consumer-alerts/2023/01/looking-job-scammers-might-be-looking-you | Search-confirmed |
| 12 | Scammers are hijacking job ads. Here's how to spot the fakes (May 2023) | U.S. Federal Trade Commission | https://consumer.ftc.gov/consumer-alerts/2023/05/scammers-are-hijacking-job-ads-heres-how-spot-fakes | Search-confirmed |
| 13 | Searching for a job to work remotely? Avoid scams and identity theft (Nov 2023) | U.S. Federal Trade Commission | https://consumer.ftc.gov/consumer-alerts/2023/11/searching-job-work-remotely-avoid-scams-identity-theft | Search-confirmed |
| 14 | Scammers Defraud Individuals via Work-From-Home Scams (PSA I-060424-PSA, Jun 4 2024) | FBI Internet Crime Complaint Center (IC3) | https://www.ic3.gov/PSA/2024/PSA240604 | Fetched |
| 15 | Scammers Exploit Security Weaknesses on Job Recruitment Websites to Impersonate Legitimate Businesses (PSA I-020122-PSA, Feb 1 2022) | FBI IC3 | https://www.ic3.gov/PSA/2022/PSA220201 | Fetched |
| 16 | Cyber Criminals Use Fake Job Listings To Target Applicants' Personally Identifiable Information (PSA I-012120-PSA, Jan 21 2020) | FBI IC3 | https://www.ic3.gov/PSA/2020/PSA200121 | Fetched |
| 17 | Fraud Advisory for Consumers: Involvement in Criminal Activity through Work from Home Scams | IC3 / FBI / U.S. Secret Service (2010) | https://www.ic3.gov/PSA/2010/WorkAtHome.pdf | Search-confirmed |
| 18 | Jobs and employment scams | Scamwatch (National Anti-Scam Centre, Australia) | https://www.scamwatch.gov.au/types-of-scams/jobs-and-employment-scams | Fetched |
| 19 | Job | Canadian Anti-Fraud Centre | https://antifraudcentre-centreantifraude.ca/scams-fraudes/job-emploi-eng.htm | Fetched |
| 20 | Recruitment scams | Action Fraud (UK) | https://www.actionfraud.police.uk/a-z-of-fraud/recruitment-scams | Blocked (403); URL as linked by a UK police force |
| 21 | Protect yourself from immigration fraud | Immigration, Refugees and Citizenship Canada | https://www.canada.ca/en/immigration-refugees-citizenship/services/protect-fraud.html | Fetched (general immigration fraud; the page does not discuss job offers specifically) |
| 22 | Employment Scams Report (2020) | BBB Institute for Marketplace Trust | https://bbbmarketplacetrust.org/employment-scams-report/ | Fetched (landing page only; the PDF was not read) |

## Legit practices

| # | Title | Publisher | URL | Status |
|---|---|---|---|---|
| 23 | Employment Eligibility Verification (Form I-9) | U.S. Citizenship and Immigration Services | https://www.uscis.gov/i-9 | Fetched |
| 24 | If my employer offers me a payroll card, do I have to accept it? | Consumer Financial Protection Bureau | https://www.consumerfinance.gov/ask-cfpb/if-my-employer-offers-me-a-payroll-card-do-i-have-to-accept-it-en-407/ | Search-confirmed |

The legit cases also cite three of the scam sources for the practice they describe: #5 (real mystery shopping is reimbursed and never charges shoppers), #1 (placement firms that charge job seekers are a warning sign; agencies paid by the employer are the norm) and #15 (the FBI tells employers to publish fraud warnings and verification instructions).

Pages looked at but not cited: the FBI's "Money Mules" page (403 to automated fetches) and the USPIS reshipping handout PDF (the fetch returned image data only, no readable text).

## How these cases were written

- **Written blind to the checker.** The author did not open, read or search the checker's `src/`, `test/`, `benchmark/cases.json` or `benchmark/run.js`, and did not try to guess what its rules match. The only files written in the project folder are `cases-r2.json` and this file.
- **Composed, not copied.** Each case paraphrases a pattern that a cited source describes: how the approach works, what is asked for, and in what order. No sentence was copied from a source. The texts deliberately vary in voice: corporate postings, terse two-line DMs, broken English, emoji, all caps, typos, formal offer letters and automated texts.
- **Invented names only.** Every person, company and domain is made up, and none is meant to be a real organization. No real company or brand is used as an employer or as an impersonation target. Generic references to a payment method or chat app (e.g. "Signal app", "WhatsApp", "Bitcoin ATM") appear only where the medium is the pattern. Phone numbers use the reserved 555-01xx range. Free-mail addresses appear in a few scam and small-business cases on purpose.
- **Hard negatives on purpose.** The legit half is built to overlap with scam vocabulary: parcels and labels, deposits and wires, crypto, donations, per-task pay, staffing agencies' confidential clients, "be your own boss", candidate-paid fingerprint or exam fees, SSNs on official federal forms after an offer, employers' anti-fraud notices, and a "Reply YES" interview text.
- **Who wrote them.** The cases were drafted by an AI assistant (Claude).
- **Cases that may be disputed:** r2-scam-059 (a paid resume "upgrade" with a fake pre-selection claim; paid resume services exist legitimately), r2-scam-055 (the opening message of a personal-assistant scam, before any money is mentioned), r2-legit-028, -032, -035, -038 and -056 (the worker pays something, such as dues, booth rent, a fingerprint fee, an exam fee or their own documents, in a lawful arrangement).
