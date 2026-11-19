#!/usr/bin/env node
'use strict';
// Tests for the Job Red Flag Checker. Plain Node, no dependencies:
//   node test/run.js
// Every posting here is invented for testing.
const fs = require('fs');
const path = require('path');
const RF = require('../src/red-flags.js');

let pass = 0, fail = 0;
function check(name, ok, detail) {
  if (ok) { pass++; return; }
  fail++;
  console.log('✗ ' + name + (detail ? '\n    ' + detail : ''));
}
const found = (text) => RF.scan(text).found;

// ── 1. Single sentences: what must fire, and what must not ────────────────
const CASES = [
  // pay-to-apply
  ['You must purchase a $150 starter kit before your first shift.', ['pay-to-apply']],
  ['A one-time registration fee of $49 is required.', ['pay-to-apply']],
  ['Pay the onboarding fee with Apple or Google Play gift cards.', ['pay-to-apply']],
  ['Deposit the check, then buy your laptop from our approved vendor.', ['pay-to-apply']],
  ['We will never ask you to pay for training or equipment.', [], ['pay-to-apply']],
  ['We reimburse certification fees and provide all equipment.', [], ['pay-to-apply', 'paid-program']],
  ['Experience with cryptocurrency exchanges and payment apps such as Venmo is a plus.', [], ['pay-to-apply']],
  ['There is no application fee.', [], ['pay-to-apply']],
  ['Any remaining balance must be sent back via Zelle.', ['pay-to-apply']],
  ['You will be paid weekly via Zelle or direct deposit.', [], ['pay-to-apply']],
  // ids-before-interview
  ['Please send your SSN with your resume so we can process your application.', ['ids-before-interview']],
  ['Email a scan of your passport to be considered.', ['ids-before-interview']],
  ['Must hold a valid passport and be able to travel 30% of the time.', [], ['ids-before-interview']],
  ['You will provide your SSN for E-Verify after an offer is accepted.', [], ['ids-before-interview']],
  ['We do not ask for your social insurance number before an offer.', [], ['ids-before-interview']],
  // reship-or-money-mule
  ['Receive packages at your home address and forward them to our customers abroad.', ['reship-or-money-mule']],
  ['Hiring a reshipping coordinator, work from home.', ['reship-or-money-mule']],
  ['You will receive client payments into your personal bank account and transfer them to our partners.', ['reship-or-money-mule']],
  ['Your pay is sent by direct deposit into your bank account every two weeks.', [], ['reship-or-money-mule', 'personal-data-upfront']],
  ['Process customer payments and reconcile accounts in NetSuite.', [], ['reship-or-money-mule']],
  ['Inspect inbound shipments against purchase orders.', [], ['reship-or-money-mule']],
  // personal-data-upfront
  ['Include your date of birth and a photo of your driver\'s license with your application.', ['personal-data-upfront']],
  ['Valid driver\'s license required.', [], ['personal-data-upfront']],
  ['Bank details for direct deposit are collected on your first day.', [], ['personal-data-upfront']],
  // chat-app-contact
  ['The interview will be held via Telegram with our hiring manager.', ['chat-app-contact']],
  ['Text us on WhatsApp to get started.', ['chat-app-contact']],
  ['Grow our WhatsApp and Telegram community channels to 50,000 members.', [], ['chat-app-contact']],
  // paid-program
  ['Purchase the business kit and build your own team to earn residual income.', ['paid-program']],
  ['The company pays for your certification course.', [], ['paid-program', 'pay-to-apply']],
  // urgency
  ['Only 3 spots left, apply now!', ['urgency']],
  ['Hiring immediately for the night shift.', [], ['urgency']],
  ['Act now: this offer expires in 24 hours.', ['urgency']],
  ['We review applications on a rolling basis.', [], ['urgency']],
  ['Don\'t miss this chance to mentor the next generation of nurses.', [], ['urgency']],
  // personal-email
  ['Send your resume to recruiting.team.hr@gmail.com today.', ['personal-email']],
  ['Send your resume to careers@quillbarrow-widgets.com.', [], ['personal-email']],

  // v0.2 ── real jobs that must never be called a scam
  ['Candidates must purchase their own hand tools and steel-toe boots before the first day.', [], ['pay-to-apply']],
  ['Applicants must pay the $45 fingerprinting fee required by the state.', [], ['pay-to-apply']],
  ['New agents are required to pay for the state licensing exam.', [], ['pay-to-apply', 'paid-program']],
  ['Recruitment fraud alert: scammers may ask you to pay a fee or send your SSN. Acme will never do this.', [], ['pay-to-apply', 'ids-before-interview']],
  ['Please note: we will never ask for payment, gift cards or your bank details during hiring.', [], ['pay-to-apply', 'personal-data-upfront']],
  ['Beware of fake recruiters on WhatsApp or Telegram asking for gift cards.', [], ['chat-app-contact', 'pay-to-apply']],
  ['Collect security deposits and process application fees for new tenants.', [], ['pay-to-apply']],
  ['Help customers deposit crypto and withdraw funds through our app.', [], ['pay-to-apply', 'pay-to-unlock']],
  ['Direct deposit with early access to your earnings through the payroll app.', [], ['pay-to-unlock']],
  ['Reconcile negative balances and merge orders in NetSuite.', [], ['pay-to-unlock']],
  ['Experience processing payments in cryptocurrency is a plus.', [], ['odd-pay-method']],
  ['You have been selected for an interview with our hiring manager.', [], ['no-interview-offer']],
  ['Text JOBS to 55555 to apply, or apply by SMS.', [], ['chat-app-contact']],
  ['We will confirm your interview time by text.', [], ['chat-app-contact']],
  ['Optimize product listings to boost sales and earn commission on every order.', [], ['task-pay']],
  ['Interviews are held over Microsoft Teams video.', [], ['chat-app-contact']],
  // (wording patterns seen in real postings during measurement; rewritten, not quoted)
  ['Our commission-based pay structure means you continue to receive commission on your accounts.', [], ['pay-to-unlock']],
  ['Process member transactions including deposits, withdrawals and money orders.', [], ['pay-to-unlock']],
  ['Lead the editorial group and build a team of strong writers.', [], ['paid-program']],
  ['Be your own boss with unlimited earning potential in real estate sales.', [], ['easy-money', 'paid-program']],
  ['Our client, an engineering firm in Houston, needs a site supervisor.', [], ['no-company']],
  ['Build your own team and earn overrides on their sales.', ['paid-program']],
  ['Account managers earn residual income as they grow their customer base.', [], ['paid-program']],
  ['Earn residual income from the efforts of the people you recruit.', ['paid-program']],
  ['Our app cuts the cost of sending money abroad, a market led by operators like Western Union.', [], ['pay-to-apply']],
  ['Our service gives consumers a US address for package forwarding.', [], ['reship-or-money-mule']],
  ['If you are selected for the position, you will get a laptop and a phone.', [], ['no-interview-offer']],
  ['If you are chosen for the final round of interviews, you may start within a week.', [], ['no-interview-offer']],
  ['At our hiring event we may hire you on the spot.', [], ['no-interview-offer']],
  ['Enter credit card transactions and reconcile bank account statements daily.', [], ['personal-data-upfront']],
  ['Order supplies and keep track of inventory.', [], ['paid-program']],
  ['Sales experience in network marketing is a plus.', [], ['paid-program']],
  ['Provide estimates with line items for each task.', [], ['task-pay']],
  ['You have been selected for the analyst role. The next step is a phone screening with our manager.', [], ['no-interview-offer']],
  ['Receive customer payments and forward them to the accounting team.', [], ['reship-or-money-mule']],
  ['Your bank details for direct deposit are collected during onboarding.', [], ['personal-data-upfront']],
  ['Add our recruiter on Telegram. For onboarding, send a photo of your driver\'s license.', ['chat-app-contact', 'personal-data-upfront']],
  ['Your next career move could start today.', [], ['urgency']],
  ['Hello!! Great perks!! Free snacks!!', [], ['sloppy-writing']],
  ['Join a leading company in our field.', [], ['no-company']],

  // v0.2 ── scams the first version missed
  ['There is a $49 registration fee to activate your account.', ['pay-to-apply']],
  ['We will send you a cheque to buy your home office equipment.', ['pay-to-apply']],
  ['Become a secret shopper: we will mail you a check to shop with and you keep the rest.', ['pay-to-apply']],
  ['Complete 40 product optimization tasks a day on our app and earn commission. A small deposit unlocks premium tasks.', ['pay-to-unlock', 'task-pay']],
  ['Rate apps and boost hotel reviews on our platform to earn daily. Recharge your account with USDT to start.', ['pay-to-unlock', 'task-pay']],
  ['Congratulations! You have been selected for the position. No interview required.', ['no-interview-offer']],
  ['Download Signal and message our HR manager to begin onboarding.', ['chat-app-contact']],
  ['Your interview will be conducted over Microsoft Teams chat.', ['chat-app-contact']],
  ['Salary is paid weekly in USDT.', ['odd-pay-method']],
  ['Hi, I am Sarah from HR at a big online retailer. Your profile matches our remote role, $35/hr, part time. Please reply on WhatsApp.', ['chat-app-contact']],
  ['No experience needed. Earn £1,200 per week from home.', ['easy-money']],
  ['Entry level, part time. €60 per hour.', ['implausible-pay']]
];

// v0.3 ── recruiter-insight rules
const CASES3 = [
  ['When you deposit the check, do not tell the bank teller it is for a job.', ['secrecy']],
  ['If the bank asks, say it is a gift from your uncle.', ['secrecy']],
  ['Keep this arrangement confidential from your family for now.', ['secrecy']],
  ['Keep client information confidential and secure at all times.', [], ['secrecy']],
  ['Do not discuss confidential projects outside the team.', [], ['secrecy']],
  ['Hi, I am Dana with the HR department at Corvalynt Logistics. Please email your resume to corvalynt.hr.dept@gmail.com.', ['email-mismatch']],
  ['Hi, I am Dana, a recruiter at Summit Peak Staffing. Reach me at dana@summitpeakstaffing.com.', [], ['email-mismatch']],
  ['Send your resume to bakery.jobs@gmail.com.', ['personal-email'], ['email-mismatch']],
  ['We found your resume online and you are a great fit for our remote role.', ['unsolicited']],
  ['Your resume was forwarded to us by our hiring team.', ['unsolicited']],
  ['I came across your profile while searching for analysts.', [], ['unsolicited']],
  ['Remote data entry clerk needed, no experience required, work from home.', ['high-risk-role']],
  ['Data entry clerk, on site in our Denver office, 2 years of experience required.', [], ['high-risk-role']],
  ['Virtual assistant for our CEO. 3+ years supporting executives. Remote.', [], ['high-risk-role']],
  // account takeover
  ['Please send me your online banking username and password so payroll can link it.', ['account-access']],
  ['Install the remote access tool and read us the code on your screen.', ['account-access']],
  ['Open a new checking account in your name for company transfers.', ['account-access']],
  ['Never share your password with anyone.', [], ['account-access']],
  ['Help customers reset their login password and install remote support tools.', [], ['account-access']],
  // paperwork before any interview
  ['Upload your passport and a completed W-4 before we can schedule your interview.', ['paperwork-before-interview']],
  ['To apply, verify your identity with a credit or debit card. You will not be charged.', ['paperwork-before-interview']],
  ['Send a picture of the front and back of your debit card for payroll.', ['paperwork-before-interview']],
  ['Complete a short skills assessment before your interview.', [], ['paperwork-before-interview']],
  // bank screening
  ['Quick question: do you have a checking account with mobile deposit?', ['bank-question']],
  ['Help members use mobile deposit and online bill pay.', [], ['bank-question']],
  // lookalike domain
  ['Questions? Write to hiring@corvalynt-careers.net. Learn more at www.corvalynt.com.', ['lookalike-domain']],
  ['Questions? Write to hiring@corvalynt.com or careers.corvalynt.com. Learn more at www.corvalynt.com.', [], ['lookalike-domain']],
  ['Write to jobs@harbor-hr.com. Our parent company is www.quellmarsh.com.', [], ['lookalike-domain']],
  // charged for access
  ['Get certified today for only $39.99 and unlock our shopper directory.', ['pays-for-access']],
  ['The clearance processing fee of $180 is due before your start date.', ['pays-for-access']],
  ['We reimburse the $250 certification course after 90 days.', [], ['pays-for-access']],
  ['Earn up to $3,000 extra over the course of the season.', [], ['pays-for-access']],
  ['Experience with AutoCad 3D and Revit required.', [], ['pays-for-access', 'implausible-pay']],
  // fake checks and money flows, in new words
  ['We will mail you a cashier\'s check to cover your home office setup.', ['pay-to-apply']],
  ['Has the check cleared yet? Then send the vendor\'s portion today.', ['pay-to-apply']],
  ['Return the remaining balance to your coordinator after each visit.', ['pay-to-apply']],
  ['Buy your laptop from our approved vendor; it is reimbursed in your first paycheck.', ['pay-to-apply']],
  ['I need 4 gift cards for a client event, please scratch and send me the codes.', ['pay-to-apply']],
  ['Return unused inventory to the warehouse at the end of the month.', [], ['pay-to-apply']],
  ['Purchase lab supplies from approved vendors for the team.', [], ['pay-to-apply']],
  // task, review, MLM and chat-only language
  ['Your balance shows -$212.40. Please recharge the difference to withdraw.', ['pay-to-unlock']],
  ['Upgrade your membership to unlock higher-paying packages.', ['pay-to-unlock']],
  ['Buy the products with your own money and leave 5-star reviews; we refund you plus $7.', ['task-pay']],
  ['Your upline will help you hit your personal volume each month.', ['paid-program']],
  ['The interview is chat only. Message your answers here.', ['chat-app-contact']],
  ['Our manager is traveling, so a video interview is not possible.', ['chat-app-contact']],
  ['Work 1-2 hours a day and earn $600 per week.', ['easy-money']],
  ['Guaranteed base salary of $45,000 plus commission.', [], ['easy-money']],
  ['Management has approved you for the position. Welcome!', ['no-interview-offer']],
  // v0.4 concept rules: money requests in any wording …
  ['To confirm your seat, please send $75 through the payment link.', ['money-request']],
  ['Kindly top up 2,000 to unlock the premium package.', ['pay-to-unlock']],
  ['Deposit it, keep your pay, and forward the balance to our partner.', ['money-request']],
  ['Base Pay $80,000 - $95,000 per year.', [], ['money-request']],
  ['Pay rates start from £12.47 per hour.', [], ['money-request']],
  ['Deposit daily cash receipts of $5,000 or more at the branch.', [], ['money-request']],
  ['Please pay the network fee of 0.01 ETH to the payroll wallet.', ['pay-to-apply']],
  ['Accounting overpaid you; please return the extra $2,000 today.', ['pay-to-apply']],
  ['We are building our own Bitcoin ATM network.', [], ['pay-to-apply']],
  ['Experience running a payments and wallet system.', [], ['pay-to-apply']],
  // … money through your own account …
  ['Collect donations into your personal account and forward them weekly.', ['reship-or-money-mule']],
  ['Our app lets people transfer funds from their bank account abroad.', [], ['reship-or-money-mule']],
  // … goods to your address with their labels …
  ['Three parcels arrive at your address tomorrow; attach the labels I emailed and drop them at the post office.', ['reship-or-money-mule']],
  ['Repackage returned items and print new labels for restock.', [], ['reship-or-money-mule']],
  ['Package Handler, part time, $21/hr, at our regional parcel hub.', [], ['reship-or-money-mule']],
  // … chat, impersonation, MLM pitch, task variants
  ['As our offices are being renovated, interviews are held by text chat.', ['chat-app-contact']],
  ['Northbeam Outfitters is a leading retailer with more than 60 stores. Apply to northbeam.jobs@gmail.com.', ['email-mismatch']],
  ['It\'s not a job, it\'s a lifestyle! Can I send you a quick video?', ['paid-program']],
  ['Must be willing to follow a proven system.', [], ['paid-program']],
  ['Like 3 videos, screenshot them and earn $5 each.', ['task-pay']],
  ['Pick up paid tasks at stores near you: $15 to $45 per task.', [], ['task-pay']],
  ['You must not discuss your work with your bank.', ['secrecy']],
  // government-posting boilerplate (rewritten), which must stay quiet
  ['Depending on the type of appointment you are selected for, you will serve a one-year probationary period.', [], ['no-interview-offer']],
  ['The representative rate for this position is $120,000 per annum ($57.50 per hour). Part-time telework may be available.', [], ['implausible-pay']],
  ['To check your application status, log into your job site account (Account Login).', [], ['account-access']],
  ['Never give anyone your bank account password.', [], ['account-access']],
  ['Send me your bank account password so payroll can verify it.', ['account-access']]
];
// v0.4.2 ── US government postings (rewritten, not quoted): what federal
// hiring legitimately asks for, next to the same request from anyone else.
const CASES42 = [
  // last four SSN digits beside the announcement number, on a paper packet
  ['Please include the last four digits of your SSN and the announcement number on each page you mail.', [], ['ids-before-interview']],
  ['Please include the last four digits of your SSN with your resume.', ['ids-before-interview']],
  // the SSN a USAJOBS account asks for, not one sent to a lookalike address
  ['You will enter your Social Security Number in USAJOBS when you create an account; the agency never sees it.', [], ['ids-before-interview']],
  ['Send your Social Security Number to usajobs.verify@gmail.com today.', ['ids-before-interview']],
  // a sentence that defines PII is not a request for it
  ['Examples of PII include a date of birth, a Social Security number and a home address.', [], ['ids-before-interview', 'personal-data-upfront']],
  ['Please include your PII, such as your date of birth and Social Security number, with your application.', ['ids-before-interview', 'personal-data-upfront']],
  // date of birth for a job with a maximum entry age
  ['Firefighter positions have a maximum entry age. Your application must include a document showing your date of birth.', [], ['personal-data-upfront']],
  ['Your application must include a document showing your date of birth.', ['personal-data-upfront']],
  ['You must be 18 or older. Please provide your date of birth to proceed.', ['personal-data-upfront']],
  // a government credit card the job holds
  ['The incumbent may need to carry a government credit card for small purchases.', [], ['personal-data-upfront']],
  ['Applicants need to provide a credit card number to verify their identity.', ['personal-data-upfront']],
  // the military Transition Assistance form
  ['If this applies to you, upload a copy of your Transition Assistance form and a copy of your ID card stamped TA.', [], ['personal-data-upfront']],
  ['Upload a copy of your ID card with your application.', ['personal-data-upfront']],
  // the government's scored Written Interview
  ['Your answers to the Written Interview questions will be scored to place you in a quality group.', [], ['chat-app-contact']],
  ['The next step is a written interview with our hiring manager over the app.', ['chat-app-contact']],
  // equipment check in/out is an inspection; an equipment check to deposit is not
  ['Handle equipment check in/out and inspect each item when it is returned.', [], ['pay-to-apply']],
  ['Staff the equipment check-in desk at the range.', [], ['pay-to-apply']],
  ['Deposit the equipment check in your banking app tonight.', ['pay-to-apply']],
  ['We will mail you an equipment check; buy your laptop with it.', ['pay-to-apply']],
  // buying course materials, and payment certification, are the job's duties
  ['Procure about $80,000 in textbooks each year for more than 50 courses.', [], ['pays-for-access']],
  ['Review claims from $10 to over $1 million at each step of the payment certification process.', [], ['pays-for-access']],
  ['Pay $80 for the course to start.', ['pays-for-access']],
  ['Get your certification for only $49.', ['pays-for-access']],
  // "virtual assistant (such as ChatGPT)" is software
  ['Remote, entry level role. Applicants may not use an AI tool or virtual assistant (such as ChatGPT) during interviews.', [], ['high-risk-role']],
  ['Remote, entry level role. Virtual assistant needed; we also use ChatGPT for drafts.', ['high-risk-role']],
  // a union's contact on free email is not the employer's recruiter
  ['Recruiting team at Harlow Freight. The exclusive representative is the Drivers Association, Local 12; contact its president at drivers.local12@gmail.com.', [], ['email-mismatch']],
  ['Recruiting team at Harlow Freight. Please email your resume to harlow.freight.hr@gmail.com.', ['email-mismatch']]
];
// v0.5 ── a job ad that turns out to be a business you pay to join. Each rule
// fires on the pattern and stays quiet on the closest real wording.
const CASES5 = [
  // pay-to-join: an "independent" role plus a fee you pay to start or keep it
  ['Attached is your Independent Distributor Agreement. The setup fee is $249, then a $59 monthly back-office subscription.', ['pay-to-join']],
  ['You will sign the independent contractor agreement and pay a one-time $299 to get started.', ['pay-to-join']],
  ['To get started, enroll as an agent on our booking platform. Your platform fee is $79 each month.', ['pay-to-join']],
  ['Enter your sponsor ID on the sign-up page so your mentor gets credit.', ['pay-to-join']],
  ['Become an independent business owner. A $35 membership fee keeps your website live.', ['pay-to-join']],
  // … and stays quiet on honest contract, franchise, licensing and gig wording
  ['This is an independent contractor role at $65 per hour. You will invoice us monthly and handle your own taxes.', [], ['pay-to-join', 'salary-mismatch']],
  ['Drivers sign an independent contractor agreement. A 20% platform fee is deducted from each delivery payout.', [], ['pay-to-join']],
  ['Independent contractor agreement: there is no fee to join and no monthly cost.', [], ['pay-to-join']],
  ['Our franchise disclosure document lists the initial franchise fee of $45,000 and a 6% royalty. Become an independent business owner.', [], ['pay-to-join']],
  ['As an independent agent you cover your own state licensing exam fee and errors and omissions insurance.', [], ['pay-to-join', 'pay-to-apply']],
  ['You are a W-2 employee, not an independent contractor. Parking costs $40 a month at our garage.', [], ['pay-to-join']],
  ['Independent consultants earn $4,000 per month on average.', [], ['pay-to-join']],
  ['Once you sign up as an independent travel agent, there is a one-time $149 activation and $59.95 monthly for your booking portal.', ['pay-to-join']],
  ['Join our host agency as an independent travel agent. Advisors average $3,500 a month in commissions.', [], ['pay-to-join']],
  ['The sponsor\'s DoD ID number is needed to enroll dependents in benefits.', [], ['pay-to-join']],
  // salary-mismatch: a salary figure, and commission only / no base / a contractor
  ['Salary: $45,000 - $65,000 a year. Pay is 100% commission on the trips you book.', ['salary-mismatch']],
  ['Pay: $50,000 to $70,000 per year. There is no base pay; you earn on each booking.', ['salary-mismatch']],
  ['Salary range $48,000–$62,000. You will join as an independent contractor.', ['salary-mismatch']],
  // … quiet on base + commission, OTE, honest commission-only, and honest contract rates
  ['Base salary $55,000 plus commission, OTE $90,000.', [], ['salary-mismatch']],
  ['Salary of $50,000 plus uncapped commission.', [], ['salary-mismatch']],
  ['On-target earnings of $120,000 (salary $70,000, commission $50,000), paid commission-only above quota.', [], ['salary-mismatch']],
  ['This is a 100% commission role with no salary. Our top agents earn $80,000 a year.', [], ['salary-mismatch']],
  ['1099 contract, $70 per hour, about 30 hours a week.', [], ['salary-mismatch']],
  ['Salary: $60,000 a year. This is not a commission-only role.', [], ['salary-mismatch']],
  ['This position is commission based and you will be an independent agent. Annual salary $55,000-$75,000.', ['salary-mismatch']],
  ['Salary: $62,000 - $70,000. Commission-based bonus paid quarterly on top of salary.', [], ['salary-mismatch']],
  ['Commission-only, average first-year earnings $48,000. You are an independent contractor (1099).', [], ['salary-mismatch']],
  // info-session: a group session about "the opportunity" instead of an interview
  ['Thanks for applying! The next step is a group information session on Zoom this Thursday.', ['info-session']],
  ['Join our virtual information session to learn about the opportunity and our compensation plan.', ['info-session']],
  ['You will attend a short webinar instead of an individual interview.', ['info-session']],
  ['Hear how our members get paid on the opportunity call tonight.', ['info-session']],
  ['Our Equal Employment Opportunity meetings are held quarterly for all managers.', [], ['info-session']],
  // … quiet on hiring events, open interviews, orientation and real info sessions about careers
  ['Join our hiring event on Saturday: meet the managers and interview on the spot.', [], ['info-session']],
  ['Open interviews every Tuesday from 9 to 11 at the front desk.', [], ['info-session']],
  ['New hire orientation is a group session on your first day covering pay, benefits and safety.', [], ['info-session']],
  ['Attend our information session to learn about careers in nursing and how to apply.', [], ['info-session']],
  ['The next step is a 30-minute video interview with the hiring manager.', [], ['info-session']],
  // high-risk-role: travel roles offered remote with no experience
  ['Remote Destination Planner, no experience needed, work from home.', ['high-risk-role']],
  ['Work from home as a travel advisor. Entry level, no resume required.', ['high-risk-role']],
  // … quiet on a travel employer that hires on payroll, or that wants experience
  ['Remote travel advisor, entry level. W-2 employee, salary $46,000, health insurance and a 401(k).', [], ['high-risk-role', 'salary-mismatch']],
  ['Travel consultant in our downtown office, 3+ years of booking experience required.', [], ['high-risk-role']],
  // paid-program: the pitch of a business you join
  ['Build multiple streams of income on your own schedule.', ['paid-program']],
  ['Sign up as an independent distributor and share the products you love.', ['paid-program']],
  // … quiet on a sales manager's job and on plain financial advice
  ['Manage our network of independent distributors across the Midwest.', [], ['paid-program', 'pay-to-join']],
  ['Help clients plan multiple sources of retirement income.', [], ['paid-program']]
];
CASES5.forEach(([text, must, mustNot = []]) => {
  const got = found(text);
  must.forEach((id) => check('fires ' + id + ': "' + text + '"', got.includes(id), 'got: ' + JSON.stringify(got)));
  mustNot.forEach((id) => check('quiet ' + id + ': "' + text + '"', !got.includes(id), 'got: ' + JSON.stringify(got)));
});
// A whole pay-to-join funnel is "Walk away", never "Stop": it is a business
// you would pay to join, not proof of a scam.
const funnel = RF.scan('Travel Planner (Remote). Salary: $45,000 - $65,000 a year. No experience needed, work from home.\n\nThe next step is a group information session to learn about the opportunity.\n\nAttached is your Independent Contractor Agreement. The setup fee is $199, then $49 a month for your booking website. Pay is commission only.');
check('pay-to-join funnel fires its flags', ['pay-to-join', 'salary-mismatch', 'info-session', 'high-risk-role'].every((id) => funnel.found.includes(id)), JSON.stringify(funnel.found));
check('pay-to-join funnel is "high", not "stop"', funnel.verdict.level === 'high', funnel.verdict.level + ' ' + JSON.stringify(funnel.found));
check('pay-to-join copy never says "scam"', RF.flags().filter((f) => ['pay-to-join', 'salary-mismatch', 'info-session', 'recruiting-pitch'].includes(f.id)).every((f) => !/scam/i.test(f.label + f.detail + f.tip)));

// v0.6 ── the first contact: the ad, the first message, the invite. Each
// rule fires on the mechanism and stays quiet on the closest real wording.
const CASES6 = [
  // pay-to-join without the word "independent": paying to start or activate
  ['Grow your own wellness business. The startup investment is $340, and most people cover their costs in a few weeks.', ['pay-to-join']],
  ['Earn commission on every sale. Pick up the Launch Bundle ($225) to start taking orders.', ['pay-to-join']],
  ['Earn commission on every booking. It is just $89 to get started.', ['pay-to-join']],
  ['The welcome set is $150. Earn commission on your orders, and most people get their money back within a month.', ['pay-to-join']],
  ['Earn commission on bookings. The Premier Pass ($300) unlocks full commissions.', ['pay-to-join']],
  // … quiet on pay, on selling packages to customers, on honest disclosures and optional kits
  ['Commission on every sale, and a $500 sign-on bonus to start.', [], ['pay-to-join']],
  ['Help customers choose the right business package ($49 to $199 a month) for their store.', [], ['pay-to-join']],
  ['Our team earns $22 an hour to start, plus quarterly bonuses.', [], ['pay-to-join']],
  ['This is not an offer of employment: consultants run their own business. A $60 sample kit is optional.', [], ['pay-to-join']],
  ['Earn commission on bookings. We provide your booking website and training at no cost.', [], ['pay-to-join']],
  // salary-mismatch: a headline figure, then no wage
  ['Office Coordinator, $48,000 - $61,000. Our coordinators are self-employed and set their own income.', ['salary-mismatch']],
  ['Client Services Associate, $55K. Your income depends on building your own team.', ['salary-mismatch']],
  ['Marketing Assistant, $50,000 - $64,000. Pay is earned through our tiered commission plan.', ['salary-mismatch']],
  // … quiet on a real base, a retainer, a draw, a UK basic, earnings claims and honest disclosures
  ['Sales Executive, £27,000 basic plus commission, OTE £42,000.', [], ['salary-mismatch']],
  ['$900 per week retainer plus commission. Top reps earn $95,000 a year.', [], ['salary-mismatch']],
  ['Income depends on your own sales. Our top advisors earn $120,000 a year.', [], ['salary-mismatch']],
  ['Consultants are not employees and there is no salary; our income disclosure shows a median of $410 a year. Office address: $10,000 deposit refunded.', [], ['salary-mismatch']],
  ['Account Manager, $70,000 - $85,000, W-2. Compensation depends on experience.', [], ['salary-mismatch']],
  ['Own a franchise. Initial franchise fee $40,000. Become an independent business owner.', [], ['salary-mismatch', 'pay-to-join']],
  // paid-program: pay for bringing other people in
  ['You also earn a bonus on every new member you sponsor.', ['paid-program']],
  ['Get paid each time your friends sign up through your link.', ['paid-program']],
  ['Your earnings are based on building a sales team.', ['paid-program']],
  ['Make a list of 50 people you know before our next call.', ['paid-program']],
  // … quiet on an employee referral bonus and on managing a team
  ['Earn a $750 referral bonus when a friend you refer is hired.', [], ['paid-program']],
  ['Your bonus depends on your team hitting its quarterly targets.', [], ['paid-program']],
  ['We do not pay you for recruiting other agents.', [], ['paid-program']],
  // no-interview-offer: "no traditional interview"
  ['We have no formal interviews; just show up to the presentation.', ['no-interview-offer']],
  ['Please note we do not conduct traditional interviews.', ['no-interview-offer']],
  // … quiet on a work sample or an informal chat in place of a formal interview
  ['There is no traditional interview: you will complete a paid work sample instead.', [], ['no-interview-offer']],
  ['This is not a formal interview, just an informal chat with the team.', [], ['no-interview-offer']],
  // info-session: a group overview or webinar as the next step
  ['Reserve your seat for tonight\'s virtual overview.', ['info-session']],
  ['The next step is a short group presentation on Zoom.', ['info-session']],
  ['Watch the opportunity video, then we can talk.', ['info-session']],
  // … quiet when the job runs sessions for others, or the session is about careers
  ['You will host online presentations for our clients every week.', [], ['info-session']],
  ['Join our webinar on careers in nursing and how to apply.', [], ['info-session']],
  ['Lead group sessions for patients in our recovery program.', [], ['info-session']],
  // email-mismatch: a signature line naming a company, on a free address
  ['From: careers.team.office@gmail.com\nPlease confirm your spot.\nRegards,\nHiring Manager, Velmora Outfitters', ['email-mismatch']],
  // … quiet when the signature names no company
  ['From: corner.bakery.jobs@gmail.com\nThanks for applying.\nHiring manager, our bakery', [], ['email-mismatch']],
  // unsolicited, in text-message shorthand
  ['hey saw ur resume online, got a role 4 u', ['unsolicited']],
  ['I saw your resume when you applied last week.', [], ['unsolicited']],
  // federal wording (rewritten, not quoted) that the older rules misread
  ['Identify excess funds in budget line items for possible transfer to other programs.', [], ['pay-to-apply']],
  ['Return the excess funds to the coordinator by wire today.', ['pay-to-apply']],
  ['Run the front desk and equipment check out at the fitness center.', [], ['pay-to-apply']],
  ['Failure to provide your Social Security Number when requested means your application cannot be processed.', [], ['ids-before-interview']],
  ['Please provide your Social Security Number now so we can process your application.', ['ids-before-interview']],
  ['Serve as the government purchase cardholder for the training program.', [], ['paid-program']],
  ['Purchase the training program to begin.', ['paid-program']]
];
CASES6.forEach(([text, must, mustNot = []]) => {
  const got = found(text);
  must.forEach((id) => check('fires ' + id + ': "' + text + '"', got.includes(id), 'got: ' + JSON.stringify(got)));
  mustNot.forEach((id) => check('quiet ' + id + ': "' + text + '"', !got.includes(id), 'got: ' + JSON.stringify(got)));
});
// The combination flag needs three different kinds of sign.
const PITCH = [
  // fires: lifestyle language + a group session + a travel role with no employment details
  ['Remote Trip Planner wanted. Turn your passion into income! Reserve your seat for our live online overview tonight.', true],
  // fires: no experience + a pay figure + a keyword to text + lifestyle language
  ['No experience needed. Earn $5,000 a month and be your own boss. Text WORK to 555-0119.', true],
  // quiet: a real remote entry-level customer service job with a pay range
  ['Remote Customer Service Representative. No experience necessary, paid training. $17 - $19 per hour, W-2, health insurance and PTO. Interviews by video with a team lead.', false],
  // quiet: a real travel advisor job with salary and benefits
  ['Travel Advisor, remote. $50,000 salary plus booking incentives, full benefits. Interviews by video with our owner.', false],
  // quiet: a staffing agency that does not name its client
  ['Our client, a logistics company, needs entry-level warehouse associates. No experience needed. $18/hr. Apply online; interviews on site.', false]
];
PITCH.forEach(([text, want]) => check((want ? 'fires' : 'quiet') + ' recruiting-pitch: "' + text + '"', found(text).includes('recruiting-pitch') === want, 'got: ' + JSON.stringify(found(text))));

CASES42.forEach(([text, must, mustNot = []]) => {
  const got = found(text);
  must.forEach((id) => check('fires ' + id + ': "' + text + '"', got.includes(id), 'got: ' + JSON.stringify(got)));
  mustNot.forEach((id) => check('quiet ' + id + ': "' + text + '"', !got.includes(id), 'got: ' + JSON.stringify(got)));
});

CASES3.forEach(([text, must, mustNot = []]) => {
  const got = found(text);
  must.forEach((id) => check('fires ' + id + ': "' + text + '"', got.includes(id), 'got: ' + JSON.stringify(got)));
  mustNot.forEach((id) => check('quiet ' + id + ': "' + text + '"', !got.includes(id), 'got: ' + JSON.stringify(got)));
});

// A recruiter's message is short by nature: it is never "vague work".
check('short message is not vague work', !found('Hi! Remote role, $25/hr. Interested? Reply here.').includes('vague-work'));
// One sentence is one piece of evidence per tier.
const one = RF.scan('Entry level. Earn $1,500 per week.');
check('one sentence raises one hard flag', one.verdict.counts.hard === 1, JSON.stringify(one.found));

CASES.forEach(([text, must, mustNot = []]) => {
  const got = found(text);
  must.forEach((id) => check('fires ' + id + ': "' + text + '"', got.includes(id), 'got: ' + JSON.stringify(got)));
  mustNot.forEach((id) => check('quiet ' + id + ': "' + text + '"', !got.includes(id), 'got: ' + JSON.stringify(got)));
});

// ── 2. Whole postings ──────────────────────────────────────────────────────
const FIX = path.join(__dirname, 'fixtures');
const POSTINGS = {
  'scam-equipment-check.txt': { must: ['pay-to-apply', 'ids-before-interview', 'easy-money', 'email-mismatch', 'chat-app-contact', 'urgency', 'personal-email'], level: 'stop' },
  'scam-package-inspector.txt': { must: ['reship-or-money-mule', 'chat-app-contact'], level: 'stop' },
  'scam-coaching-funnel.txt': { must: ['paid-program', 'easy-money', 'urgency'], level: 'high' },
  'scam-task-message.txt': { must: ['pay-to-unlock', 'task-pay', 'no-interview-offer', 'chat-app-contact'], level: 'stop' },
  'scam-impersonated-recruiter.txt': { must: ['chat-app-contact', 'personal-data-upfront', 'urgency'], level: 'high' },
  'scam-fake-check-assistant.txt': { must: ['pay-to-apply', 'reship-or-money-mule', 'personal-email'], level: 'stop' },
  'legit-marketing-manager.txt': { none: true },
  'legit-warehouse-associate.txt': { noneAbove: 'soft' },
  'legit-agency-confidential.txt': { noneAbove: 'soft' }
};

Object.keys(POSTINGS).forEach((file) => {
  const want = POSTINGS[file];
  const r = RF.scan(fs.readFileSync(path.join(FIX, file), 'utf8'));
  (want.must || []).forEach((id) => check(file + ' fires ' + id, r.found.includes(id), 'got: ' + JSON.stringify(r.found)));
  if (want.level) check(file + ' verdict ' + want.level, r.verdict.level === want.level, 'got: ' + r.verdict.level);
  if (want.none) check(file + ' has no flags', r.found.length === 0, 'got: ' + JSON.stringify(r.found));
  if (want.noneAbove) {
    const loud = r.flags.filter((f) => f.hits.length && f.tier !== 'soft').map((f) => f.id);
    check(file + ' has no severe or hard flags', loud.length === 0, 'got: ' + JSON.stringify(loud));
  }
  // Every quote must be real text from the posting.
  const text = fs.readFileSync(path.join(FIX, file), 'utf8').replace(/\r\n?/g, '\n');
  r.flags.forEach((f) => f.hits.forEach((h) => {
    if (h.note) return;
    check(file + ' ' + f.id + ' quote is in the posting', text.includes(h.match) && text.slice(h.start, h.end) === h.match,
      'match ' + JSON.stringify(h.match) + ' at ' + h.start);
  }));
});

// ── 3. The verdict ladder ──────────────────────────────────────────────────
const V = (ids) => RF.verdict(ids).level;
check('verdict: nothing → none', V([]) === 'none');
check('verdict: one soft → clear', V(['urgency']) === 'clear');
check('verdict: three soft → caution', V(['urgency', 'personal-email', 'no-company']) === 'caution');
check('verdict: one hard → caution', V(['chat-app-contact']) === 'caution');
check('verdict: one hard + two soft → high', V(['chat-app-contact', 'urgency', 'personal-email']) === 'high');
check('verdict: two hard → high', V(['chat-app-contact', 'easy-money']) === 'high');
check('verdict: any severe → stop', V(['urgency', 'pay-to-apply']) === 'stop');
check('verdict: unknown ids ignored', V(['not-a-flag']) === 'none');

// ── 4. The public list ─────────────────────────────────────────────────────
const L = RF.flags();
check('flag list has 31 flags', L.length === 31, 'got ' + L.length);
check('every flag has label, detail, tip', L.every((f) => f.label && f.detail && f.tip));
check('ids are unique', new Set(L.map((f) => f.id)).size === L.length);
check('empty input is safe', RF.scan('').found.length === 0 && RF.scan(null).verdict.level === 'none');

console.log((fail ? '✗ ' : '✓ ') + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
