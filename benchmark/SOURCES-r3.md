# Sources for the round-3 held-out set (`cases-r3.json`)

The topic is fake or misleading job ads that lead applicants into a business they have to pay to join: MLM or pay-to-join distributor and travel-agent programs, "salary" figures that turn out to mean commission only, group "information sessions" held in place of interviews, agreements with setup or monthly fees, sponsor IDs and "build your team" pitches. The set has 60 cases (30 scam, 30 legit), all marked `split: "test"`. Every scam case except two cites one source below in its `source` field. Legit cases cite a source only where a public page documents the practice. The other 21 have `null`.

All pages were accessed on **2026-11-16**. "Fetched" means the page was opened and read that day. "Search-confirmed" means a web search that day returned the URL and title, but the page itself was not opened. "Blocked" means the site refused the automated fetch.

## Background

| # | Title | Publisher | URL | Status | Used for |
|---|---|---|---|---|---|
| 1 | "1,500 fake job ads led us to a global multi-level marketing scheme" (video) | CBC News (Visual Investigations), November 2026 | https://www.youtube.com/watch?v=RioE6ClJbaM | Cited by title only | Background for the topic of this set; cited by 3 scam cases |

## Scam patterns

| # | Title | Publisher | URL | Status | Pattern it supports | Cases |
|---|---|---|---|---|---|---|
| 2 | Multi-Level Marketing Businesses and Pyramid Schemes | U.S. Federal Trade Commission (Consumer Advice) | https://consumer.ftc.gov/articles/multi-level-marketing-businesses-and-pyramid-schemes | Fetched | Income from recruiting rather than selling ("two people who find two people"), extravagant earnings claims, high pressure, purchases required before earning, recurring fees | 4 |
| 3 | Business Guidance Concerning Multi-Level Marketing (staff guidance, 2024) | U.S. Federal Trade Commission | https://www.ftc.gov/business-guidance/resources/business-guidance-concerning-multi-level-marketing | Fetched | Pay tied to recruits' purchases, purchase requirements to qualify for rewards, earnings claims that must reflect a typical participant net of expenses, lifestyle claims, "results not typical" not being enough | 5 scam + 1 legit |
| 4 | Job Scams | U.S. Federal Trade Commission (Consumer Advice) | https://consumer.ftc.gov/articles/job-scams | Fetched | Honest employers never charge you to get a job; "be your own boss" offers with starter kits or training; unsolicited offers; big earnings for little effort; placement firms are paid by the employer | 4 scam + 1 legit |
| 5 | FTC puts over 1,100 businesses on notice about deceptive money-making claims | U.S. Federal Trade Commission (Consumer Alert) | https://consumer.ftc.gov/consumer-alerts/2021/10/ftc-puts-over-1100-businesses-notice-about-deceptive-money-making-claims | Fetched (the page shows a 2023 date although the URL path says 2021/10) | MLMs and business opportunities that make false earnings claims, imply no experience is needed or pressure people to act at once | 2 |
| 6 | Bogus Business Opportunities | U.S. Federal Trade Commission (Business Guidance) | https://www.ftc.gov/business-guidance/resources/bogus-business-opportunities | Fetched | Earnings claims, being rushed before the disclosure period, bogus references | 2 |
| 7 | How to spot a job scam (Sep 24 2025) | U.S. Federal Trade Commission (Consumer Alert) | https://consumer.ftc.gov/consumer-alerts/2025/09/how-spot-job-scam | Fetched (the detail is in an untranscribed video) | Names deceptive MLM deals and phony business opportunities among job scams | 0 (background) |
| 9 | Promise of Big Bucks is Really a Pyramid Scheme | Truth in Advertising (TINA.org) | https://truthinadvertising.org/articles/promise-of-big-bucks-is-really-a-pyramid-scheme/ | Fetched | Travel-club MLM: work-from-home and luxury pitch, tiered memberships, pay from enrolling members rather than bookings, short refund window | 0 (cited in notes) |
| 10 | A 2008 press release on a lawsuit against an online travel pyramid scheme | California Attorney General | https://www.oag.ca.gov/news/press-releases/brown-sues-topple-online-pyramid-scheme | Search-confirmed | A travel-agent-style MLM sued as a pyramid scheme over deceptive earnings claims | 0 (cited in notes) |
| 11 | Multi-level marketing and pyramid selling | Competition Bureau Canada | https://competition-bureau.canada.ca/deceptive-marketing-practices/types-deceptive-marketing-practices/multi-level-marketing-and-pyramid-selling | Fetched | A pyramid scheme pays for recruitment; requiring purchases beyond a start-up kit sold at cost, inventory loading and no reasonable buyback are prohibited; earnings claims must be fair, reasonable and timely | 1 scam + 1 legit |
| 12 | Jobs and employment scams | Scamwatch (National Anti-Scam Centre, Australia) | https://www.scamwatch.gov.au/types-of-scams/jobs-and-employment-scams | Fetched | Large upfront payments to join, rewards for recruiting, fees before earning, recruitment at seminars and on social media | 4 |
| 13 | Contacting Multi-level Marketing companies to ensure recruitment ads aren't misleading (10 Jun 2021) | Advertising Standards Authority (UK) | https://www.asa.org.uk/news/contacting-multi-level-marketing-companies-to-ensure-recruitment-ads-aren-t-misleading.html | Fetched | MLM recruitment ads with exaggerated earnings claims, unsupported claims about the nature of the job, missing company information and incentives that joiners are unlikely to achieve | 3 |

## Legit practices

| # | Title | Publisher | URL | Status | Practice it supports | Cases |
|---|---|---|---|---|---|---|
| 14 | Ontario job posting rules take effect on January 1, 2026 | Alexander Holburn Beaudin + Lang LLP (law-firm summary) | https://www.ahbl.ca/ontario-job-posting-rules-take-effect-on-january-1-2026/ | Fetched | From 2026, Ontario postings by employers with 25+ employees must show the expected pay or a range of no more than $50,000, say whether the vacancy exists, disclose AI screening and not require Canadian experience. | 1 |
| 15 | Franchise Fundamentals: Taking a deep dive into the Franchise Disclosure Document (May 26 2023) | U.S. Federal Trade Commission (Consumer Alert) | https://consumer.ftc.gov/consumer-alerts/2023/05/franchise-fundamentals-taking-deep-dive-franchise-disclosure-document | Fetched | The FDD's 23 items (fees, Item 19 earnings, Item 20 franchisee lists) and the 14-day rule | 1 |
| 16 | Independent contractor defined | U.S. Internal Revenue Service | https://www.irs.gov/businesses/small-businesses-self-employed/independent-contractor-defined | Search-confirmed | Honest 1099 contractor status | 4 |

Legit cases also cite three of the scam sources for the practice they describe. #3 covers the host agency (r3-legit-013), which discloses typical earnings and pays nothing for recruiting. #11 covers the direct-selling agreement (r3-legit-020): a kit sold at cost, no purchase quota and a buyback. #4 covers the staffing agency that is paid by the employer (r3-legit-014).

Pages looked at but not cited: the ACCC pyramid-schemes page (404 at the URL tried), the Northern Territory government's pyramid-selling warning signs (403), a Canadian consumer handbook MLM page (404), and the FTC's franchise buying guide at the guessed URL (404). No UK JobsAware page on MLM ads came up in search.

## Counts

| | ad | email | invite | agreement | message | total | ambiguous |
|---|---|---|---|---|---|---|---|
| scam | 11 | 6 | 3 | 3 | 7 | 30 | 4 |
| legit | 20 | 3 | 3 | 2 | 2 | 30 | 4 |
| total | 31 | 9 | 6 | 5 | 9 | 60 | 8 |

Regions: mostly US, plus Canada (r3-scam-001, -015, -019, r3-legit-003, -018), the UK (r3-scam-008, -030, r3-legit-010, -025) and Australia (r3-scam-009, -025, -027, r3-legit-011, -030).

### Ambiguous cases (`ambiguous: true`)

- **r3-scam-006**: a social DM recruiting into a travel "team" with lifestyle claims. It says outright that it is not a job and asks for nothing yet.
- **r3-scam-016**: a distributor agreement with a required monthly autoship to earn commissions. Lawful MLMs use similar paperwork, and it never claims to be a job.
- **r3-scam-021**: a classic "$800–$1200/wk, group interview" salary-bait ad. No fee is asked. The label rests on the misleading pay framing.
- **r3-scam-023**: a polished recruiter message offering a same-night "virtual overview". On its own words it is close to a real recruiter's message.
- **r3-legit-006**: commission-only real-estate contractor work, with the licence paid by the candidate.
- **r3-legit-013**: a host agency with an annual fee, commission-only pay, no recruitment pay and earnings disclosed.
- **r3-legit-020**: a lawful direct-selling agreement with the safeguards described (kit at cost, no quota, buyback, an income disclosure). It is pay-to-join but not posing as a job.
- **r3-legit-029**: a commission-only insurance agent who pays for the state licence and E&O insurance, with all of it disclosed.

## How these cases were written

- **Written blind to the checker.** The author did not open, read or search the checker's `src/`, `test/`, `benchmark/*.json` (round 1 and 2 cases), `benchmark/run.js`, `RESULTS.md`, `HISTORY.md`, `METHODOLOGY.md`, `README.md` or the project's internal notes, and did not try to guess what the rules match. Only `SOURCES.md` (its first 40 lines) and `SOURCES-r2.md` were read, to copy their format. The only files written in the project folder are `cases-r3.json` and this file.
- **Composed, not copied.** Each case paraphrases a pattern that a cited source describes. No sentence was copied from a source or from any real ad. The texts vary in voice and stage: polished corporate postings, all-caps classifieds, friend-to-friend DMs with emoji, broken English, automated texts, "hiring manager" follow-ups, event invites, and checkout and agreement terms.
- **Schema.** Each case has `id`, `label`, `ambiguous`, `kind` (`ad|email|invite|agreement|message`), `split` (`"test"`, as in round 2), `text`, `note` and `source` (a URL or `null`, as in round 2).
- **Hard negatives on purpose.** The legit half reuses the scam half's vocabulary: OTE and "uncapped" commission, "build your team" in its management sense, travel, booking, destination and perks, hiring events and walk-in interviews, orientation and campus information sessions, candidate-paid licensing exams, 1099 and gig work, franchise fees with FDD disclosure, a host-agency fee, and an honest direct-selling agreement.
- **Invented names only.** Every person, company and domain is made up. No real company is named as a scammer, and no company from any news report is named or alluded to. Real places, regulators and trade terms appear only as setting (e.g. Toronto, Brisbane, NMLS, FDD). Phone numbers use the reserved 555-01xx range. A free-mail sender appears in one scam case on purpose.
- **Invented-name check (2026-11-16).** Every domain written in a case text, and the bare `.com` (or national) stem of every invented company, was looked up with Node's `dns.resolve4` (A) and `dns.resolveNs` (NS). Six scam-company stems resolved (registered or parked), and those companies were renamed before saving. The final set (wandrislecareers.com, pellamypathmarketing.com, emberquoytravelpass.com, tidewyckjourneys.com, and the stems horizanthe.com, wandrisle.com, tidewyck.com, emberquoy.com, pellamypath.com, bluvarra.com, voyalumen.com, sunvale.co.uk, koraleeescapes.com.au, quillanpeak.com, larkspurlegacy.com, plus the legit-company `.com` stems) returned no A and no NS record. Two hotel names that might have matched real venues were also replaced. Two lookups in the legit half resolved, but only as parked or for-sale stems (brightwick.com, saltmere.com). Those names appear only in legit cases with no domain written, so they were kept.
- **Who wrote them.** The cases were drafted by an AI assistant (Claude) from public descriptions.
