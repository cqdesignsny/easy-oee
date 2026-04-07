/**
 * Easy OEE translation dictionaries — EN / ES / FR.
 *
 * Convention: dot-namespaced keys grouped by surface.
 *
 *   nav.*       Site navigation
 *   footer.*    Site footer
 *   home.*      Marketing homepage
 *   how.*       /how-it-works
 *   roi.*       /roi-calculator
 *   pricing.*   /pricing
 *   contact.*   /contact
 *   legal.*     /privacy and /terms
 *   signin.*    /sign-in
 *   pin.*       /pin (operator)
 *   operator.*  /operator
 *   shift.*     /shift/[id] live
 *   summary.*   /shift/[id]/summary
 *   dashboard.* /dashboard
 *   admin.*     /dashboard/lines, /operators, /shifts
 *   stop.*      Stop reason labels
 *   common.*    Reused everywhere
 *
 * To add a new key: add it to en first, then es, then fr. Missing keys
 * fall back to en automatically (see `t()` at the bottom).
 */

export type Locale = "en" | "es" | "fr";

export const LOCALES: Locale[] = ["en", "es", "fr"];
export const LOCALE_LABELS: Record<Locale, string> = {
  en: "EN",
  es: "ES",
  fr: "FR",
};
export const LOCALE_NAMES: Record<Locale, string> = {
  en: "English",
  es: "Español",
  fr: "Français",
};

export type Dictionary = Record<string, string>;

export const dictionaries: Record<Locale, Dictionary> = {
  // ─────────────────────────────────────────────────────────────────────────
  // ENGLISH
  // ─────────────────────────────────────────────────────────────────────────
  en: {
    // NAV
    "nav.howItWorks": "How It Works",
    "nav.features": "Features",
    "nav.pricing": "Pricing",
    "nav.roi": "ROI Calculator",
    "nav.signIn": "Sign In",
    "nav.bookDemo": "Book a Demo",

    // FOOTER
    "footer.tagline":
      "Real-time OEE tracking built for plant managers who want clarity on the shop floor. Up and running in one shift.",
    "footer.product": "Product",
    "footer.company": "Company",
    "footer.howItWorks": "How It Works",
    "footer.features": "Features",
    "footer.pricing": "Pricing",
    "footer.roi": "ROI Calculator",
    "footer.bookDemo": "Book a Demo",
    "footer.contact": "Contact",
    "footer.privacy": "Privacy Policy",
    "footer.terms": "Terms of Service",
    "footer.rights": "All rights reserved.",

    // HOME — HERO
    "home.eyebrow": "Built for smart manufacturers",
    "home.h1.line1": "YOU DON'T KNOW",
    "home.h1.line2": "YOUR REAL OEE.",
    "home.h1.line3": "WE CAN FIX THAT.",
    "home.sub":
      "Easy OEE gives plant managers real-time visibility into machine performance, downtime causes, and shift efficiency, from any device on the floor. Up and running today.",
    "home.cta.demo": "Book a Free Demo",
    "home.cta.how": "See How It Works",

    // HOME — STATS
    "home.stat1.n": "23%",
    "home.stat1.l": "Average OEE improvement in year one",
    "home.stat2.n": "<4 min",
    "home.stat2.l": "Operator setup time per shift",
    "home.stat3.n": "$0",
    "home.stat3.l": "Setup fees, ever",
    "home.stat4.n": "100%",
    "home.stat4.l": "Web-based. Works on any device you already own",

    // HOME — PROBLEM
    "home.problem.tag": "The problem",
    "home.problem.title": "MOST PLANT MANAGERS ARE FLYING BLIND.",
    "home.problem.intro":
      "If you're tracking OEE at all, you're probably doing it in a spreadsheet updated at end of shift. By the time you see the numbers, the shift is over and the losses are permanent.",
    "home.problem.p1.strong": "You don't know your real OEE.",
    "home.problem.p1.rest":
      " You have a feeling the line isn't performing. But a feeling isn't a number, and yesterday's number doesn't help you today.",
    "home.problem.p2.strong": "Stop reasons are vague or never recorded.",
    "home.problem.p2.rest":
      " \"Machine down\" is not a root cause. Without knowing why, you can't fix anything systematically.",
    "home.problem.p3.strong": "Shift-to-shift comparison is impossible.",
    "home.problem.p3.rest":
      " Without consistent data, every comparison turns into an argument instead of a conversation backed by evidence.",
    "home.problem.p4.strong": "By the time you see the data, it's too late.",
    "home.problem.p4.rest":
      " End-of-day reports tell you what happened. Easy OEE tells you what's happening, while you can still do something about it.",

    "home.dash.live": "Live Shift / Line 2 / Morning",
    "home.dash.running": "Running",
    "home.dash.availability": "Availability",
    "home.dash.performance": "Performance",
    "home.dash.quality": "Quality",
    "home.dash.oeeScore": "OEE Score",
    "home.dash.recentStops": "Recent stops",

    // HOME — SOLUTION
    "home.sol.tag": "The solution",
    "home.sol.title": "OEE THAT UPDATES WHILE THE SHIFT RUNS.",
    "home.sol.body":
      "Easy OEE connects the operator on the floor to the numbers on your screen. Every stop gets logged with a reason. Every part gets counted. Availability, Performance, and Quality calculate automatically. No formulas, no spreadsheets, no end-of-day data entry.",
    "home.sol.bodyStrong": "You see your OEE right now. Not tomorrow morning.",
    "home.sol.pill1": "Real-time dashboard",
    "home.sol.pill2": "10 stop categories",
    "home.sol.pill3": "Auto OEE calculation",
    "home.sol.pill4": "Shift reports",
    "home.sol.pill5": "Any device",
    "home.sol.cta": "See the full walkthrough",
    "home.sol.pull": "KNOW YOUR OEE",
    "home.sol.pull2": "BEFORE THE SHIFT ENDS.",
    "home.sol.pull3": "NOT THE NEXT MORNING.",

    // HOME — HOW
    "home.how.tag": "How it works",
    "home.how.title": "UP AND RUNNING IN ONE SHIFT.",
    "home.how.intro":
      "No IT department. No setup project. Operators are logging real data within minutes of account setup.",
    "home.how.s1.title": "Operator Logs In",
    "home.how.s1.body":
      "Opens Easy OEE on any device. Phone, tablet, or floor terminal. Picks the line, shift type, product, and ideal rate. Under 60 seconds.",
    "home.how.s2.title": "Stops Are Captured",
    "home.how.s2.body":
      "Machine stops? One tap to log the reason. Duration tracked automatically. Machine restarts? One more tap. The stop closes with duration calculated.",
    "home.how.s3.title": "OEE Is Calculated",
    "home.how.s3.body":
      "Availability, Performance, and Quality update in real time. Shift summary generated automatically. No formulas. No manual work. No next-morning surprises.",

    // HOME — FEATURES
    "home.feat.tag": "Features",
    "home.feat.title": "EVERYTHING A PLANT MANAGER ACTUALLY NEEDS.",
    "home.feat.intro":
      "Built for the realities of the shop floor. Not a generic BI tool retrofitted for manufacturing.",
    "home.feat.f1.title": "Real-Time OEE Dashboard",
    "home.feat.f1.body":
      "See Availability, Performance, and Quality update live as the shift progresses. No waiting for end-of-day reports.",
    "home.feat.f2.title": "10 Standardized Stop Reasons",
    "home.feat.f2.body":
      "Mechanical Failure, Changeover, No Material, Quality Check, Maintenance, and more. The same set across every operator and every line.",
    "home.feat.f3.title": "Automatic Shift Reports",
    "home.feat.f3.body":
      "Every shift generates a complete summary: good parts, bad parts, total downtime, top stop causes, and final OEE score. Zero data entry required.",
    "home.feat.f4.title": "Multi-Line, Multi-Shift",
    "home.feat.f4.body":
      "Track Morning, Afternoon, and Night shifts across as many lines as you run. All from one account.",
    "home.feat.f5.title": "Company Data Privacy",
    "home.feat.f5.body":
      "Your data stays yours. Operators see only their line. Managers see their plant. No data is ever shared across accounts.",
    "home.feat.f6.title": "Works on Any Device",
    "home.feat.f6.body":
      "Fully web-based. Runs on the phone in the operator's pocket, the tablet on the line, or the PC in your office. Hardware add-on coming soon for plants that want PLC integration.",

    // HOME — PROOF
    "home.proof.tag": "From the floor",
    "home.proof.title": "PLANT MANAGERS WHO MADE THE SWITCH.",
    "home.proof.t1.role": "Plant Manager, Ontario",
    "home.proof.t1.q":
      "We went from a shared spreadsheet to live OEE data on my phone. The first week we found out changeover was eating 22% of our available time. We'd never measured it before.",
    "home.proof.t2.role": "Operations Director, Quebec",
    "home.proof.t2.q":
      "Our operators were skeptical. Two weeks in, they're the ones reminding each other to log stops because they can see the numbers in real time. Simple is what made it stick.",
    "home.proof.t3.role": "Plant Manager, Alberta",
    "home.proof.t3.q":
      "Enterprise OEE platforms want $2,000 a month and six months to set up. Easy OEE was running on our floor the same afternoon we signed up. The difference is night and day.",

    // HOME — PRICING TEASE
    "home.pt.tag": "Pricing",
    "home.pt.title.line1": "STARTS AT $39 USD/LINE/MONTH.",
    "home.pt.title.line2": "NO SETUP FEES. EVER.",
    "home.pt.intro":
      "Priced per production line. You only pay for the lines you track. A single hour of downtime costs more than a full month of Easy OEE. The math is obvious on day one.",
    "home.pt.cta1": "See Full Pricing",
    "home.pt.cta2": "Calculate Your ROI",
    "home.pt.roi.title": "THE MATH IS SIMPLE",
    "home.pt.roi.p1":
      "If your line runs 480 minutes per shift and your OEE is 65%, you're losing 168 minutes of potential production every single shift.",
    "home.pt.roi.p2.before": "At a conservative $85/minute throughput value, that's ",
    "home.pt.roi.p2.strong": "$14,280 lost per week",
    "home.pt.roi.p2.after": " on a single line.",
    "home.pt.roi.p3": "Easy OEE Professional covers up to 5 lines for $99/month USD.",
    "home.pt.roi.p4": "A 5% OEE improvement returns the entire annual cost in under 3 days.",

    // HOME — CTA BAND
    "home.cta.title": "READY TO SEE YOUR REAL OEE?",
    "home.cta.body":
      "Book a free 30-minute demo. We'll walk through the platform live using your own line setup. No slides, no pitch.",
    "home.cta.sub": "14-day free trial included. No credit card required.",
    "home.cta.button": "Book Your Free Demo",

    // HOW IT WORKS PAGE
    "how.eyebrow": "How it works",
    "how.h1.line1": "FROM ZERO TO LIVE OEE",
    "how.h1.line2": "IN ONE SHIFT.",
    "how.sub":
      "Here's exactly what happens when an operator picks up their phone and starts a shift in Easy OEE, and what you see as plant manager while it runs.",

    "how.steps.tag": "3 Steps",
    "how.steps.title": "START. RUN. END.",
    "how.steps.intro": "One workflow, three moments. Every Easy OEE shift looks like this.",
    "how.s1.title": "SHIFT START",
    "how.s1.p1":
      "The operator opens Easy OEE on any device. Phone, tablet, or a shared floor terminal. No app download. No training manual.",
    "how.s1.p2":
      "They sign in, select their production line, choose their shift, enter the product being run, and set planned minutes and ideal rate.",
    "how.s1.p3": "Total time: under 60 seconds.",
    "how.s2.title": "DURING THE SHIFT",
    "how.s2.p1":
      "When the machine stops, the operator taps the reason. That's the entire workflow. One tap.",
    "how.s2.p2":
      "The button turns red. The timer starts. When the machine restarts, the operator taps again. The stop closes and the duration is calculated automatically.",
    "how.s2.p3": "No paper. No radio calls to the office. No end-of-day reconstruction.",
    "how.s3.title": "END OF SHIFT",
    "how.s3.p1": "The operator records good and bad parts produced. Easy OEE does the rest.",
    "how.s3.p2":
      "Availability, Performance, and Quality are calculated instantly. The OEE score appears. The full shift summary is generated. Every stop, every reason, every minute of lost production.",
    "how.s3.p3": "Zero manual calculation.",

    "how.stops.tag": "Standardized",
    "how.stops.title": "10 STOP REASONS.",
    "how.stops.intro":
      "Every reason is the same across every line and every operator. When you compare shifts or lines, you're comparing apples to apples.",

    "how.math.tag": "The math",
    "how.math.title": "HOW OEE IS CALCULATED.",
    "how.math.intro":
      "Easy OEE computes all three components automatically. Here's what's happening under the hood.",
    "how.math.a.title": "AVAILABILITY",
    "how.math.a.formula": "(Planned − Stop) / Planned",
    "how.math.a.body":
      "Was the machine running when it was supposed to? Measures unplanned downtime as a percentage of scheduled production time.",
    "how.math.p.title": "PERFORMANCE",
    "how.math.p.formula": "Parts / (Ideal Rate × Run Time)",
    "how.math.p.body":
      "Was the machine running at its ideal speed? Captures small stops, speed losses, and micro-stoppages that don't get recorded as full stops.",
    "how.math.q.title": "QUALITY",
    "how.math.q.formula": "Good / (Good + Bad)",
    "how.math.q.body":
      "Were the parts made right the first time? Measures the percentage of production output that meets quality standards without rework.",
    "how.math.final.tag": "Final formula",
    "how.math.final.title": "OEE = A × P × Q",
    "how.math.final.scale": "World class: 85%+   ·   Typical: 60 to 75%   ·   Low: below 60%",

    "how.start.tag": "Getting started",
    "how.start.title": "FOUR STEPS.",
    "how.start.intro": "No IT department. No setup project. No training sessions.",
    "how.start.s1.title": "Create your account",
    "how.start.s1.body":
      "Sign up at app.easy-oee.com. Enter your company name. Takes 2 minutes. No credit card needed for the trial.",
    "how.start.s2.title": "Add your lines",
    "how.start.s2.body":
      "Enter each production line and its ideal parts-per-minute rate. Machine 1, Line A, Press 3, whatever you call them on the floor.",
    "how.start.s3.title": "Invite operators",
    "how.start.s3.body":
      "Add operators by email. They get a login link. No training required. The interface explains itself the first time they use it.",
    "how.start.s4.title": "Start your first shift",
    "how.start.s4.body":
      "Your first real OEE data will be on your screen before the shift ends. That's the whole onboarding process.",
    "how.start.cta": "Start Your Free Trial. No Credit Card Required.",

    "how.faq.tag": "FAQ",
    "how.faq.title": "QUICK ANSWERS.",
    "how.faq.q1": "Do operators need smartphones?",
    "how.faq.a1":
      "No. Easy OEE runs in any browser. Smartphones, tablets, shared floor terminals, or a PC. Most plants put a cheap wall-mounted tablet at the operator station and call it a day.",
    "how.faq.q2": "What if an operator forgets to log a stop?",
    "how.faq.a2":
      "Stops can be added or adjusted within the active shift. The plant manager can also review and edit shift data from the management view before the shift record is finalized.",
    "how.faq.q3": "How long does operator training take?",
    "how.faq.a3":
      "Most operators understand the interface within 5 minutes without any formal training. The workflow is: start shift, tap when machine stops, tap when it restarts, end shift. That's it.",
    "how.faq.q4": "What if we have multiple shifts on the same line?",
    "how.faq.a4":
      "Each shift is a separate record. Morning, Afternoon, and Night shifts on the same line are tracked independently and can be compared side by side in the management dashboard.",
    "how.faq.q5": "What happens if the internet goes down on the floor?",
    "how.faq.a5":
      "Easy OEE requires an internet connection to save data in real time. Most plants use a reliable WiFi network or mobile hotspot at the operator station. Offline mode is on the product roadmap.",

    "how.ctaBand.tag": "Want to see it live?",
    "how.ctaBand.title": "BOOK A FREE DEMO.",
    "how.ctaBand.body":
      "Thirty minutes. We'll configure it around your plant and run a live shift walkthrough together.",
    "how.ctaBand.button": "Book a Free Demo",

    // STOP REASONS (used in /how-it-works list)
    "stop.01.label": "Mechanical Failure",
    "stop.01.desc": "Unplanned equipment breakdown or malfunction",
    "stop.02.label": "Changeover",
    "stop.02.desc": "Product or tooling change between runs",
    "stop.03.label": "No Material",
    "stop.03.desc": "Waiting for raw materials or components to arrive",
    "stop.04.label": "Quality Check",
    "stop.04.desc": "Inspection, measurement, or quality hold requiring stoppage",
    "stop.05.label": "Scheduled Break",
    "stop.05.desc": "Meal breaks, shift meetings, planned pauses",
    "stop.06.label": "No Operator",
    "stop.06.desc": "Waiting for an available qualified operator",
    "stop.07.label": "Maintenance",
    "stop.07.desc": "Planned preventive maintenance activities",
    "stop.08.label": "Training",
    "stop.08.desc": "Operator training activities during production hours",
    "stop.09.label": "No Production Scheduled",
    "stop.09.desc": "Planned idle time. Line is not scheduled to run.",
    "stop.10.label": "Other",
    "stop.10.desc": "Anything not captured by the above categories",

    // ROI CALCULATOR PAGE
    "roi.eyebrow": "ROI Calculator",
    "roi.h1.line1": "HOW MUCH IS YOUR",
    "roi.h1.line2": "DOWNTIME COSTING YOU?",
    "roi.sub":
      "Enter your plant's numbers. See exactly what your current OEE losses cost, and what fixing them would put back in your pocket.",
    "roi.calc.tag": "Calculator",
    "roi.calc.title": "YOUR PLANT'S NUMBERS.",
    "roi.calc.intro": "All figures in USD. Adjust the sliders to match your operation.",
    "roi.input.lines": "Production lines",
    "roi.input.shifts": "Shifts per day",
    "roi.input.days": "Working days per week",
    "roi.input.mins": "Minutes per shift",
    "roi.input.rate": "Throughput value",
    "roi.input.rate.hint": "Estimate: hourly revenue ÷ 60",
    "roi.input.oee": "Current OEE estimate",
    "roi.input.oee.hint": "World class is 85%+. SME average is 60 to 70%.",
    "roi.target": "Target OEE improvement",
    "roi.losing": "You're losing",
    "roi.losing.line": "per year at {oee}% OEE · {min} min lost / shift / line · {week} per week",
    "roi.recover": "Recover with +{pct}% OEE",
    "roi.gained": "gained per year · +{min} min / shift / line",
    "roi.payback.label": "Easy OEE payback",
    "roi.payback.refLine": "Reference: Easy OEE Professional at $99 USD/month ($1,188 USD/year, 5 lines).",
    "roi.payback.over1y": "> 1 year",
    "roi.cta": "Book a Free Demo",

    "roi.losses.tag": "Three loss types",
    "roi.losses.title": "WHERE OEE LOSSES COME FROM.",
    "roi.losses.intro": "All three are measurable. All three are recoverable.",
    "roi.losses.a.title": "AVAILABILITY LOSS",
    "roi.losses.a.body":
      "Unplanned downtime. Breakdowns, changeovers that ran long, material starvation, waiting on operators or maintenance.",
    "roi.losses.p.title": "PERFORMANCE LOSS",
    "roi.losses.p.body":
      "Speed losses. Micro-stops too short to log, running below ideal rate, equipment wear slowing the line down.",
    "roi.losses.q.title": "QUALITY LOSS",
    "roi.losses.q.body":
      "Scrap and rework. Parts that don't meet spec the first time and either get tossed or have to be fixed.",

    // PRICING
    "pricing.eyebrow": "Pricing",
    "pricing.h1": "SIMPLE. TRANSPARENT.",
    "pricing.sub": "14-day free trial. No credit card required.",
    "pricing.usdLabel": "USD",
    "pricing.cadLabel": "≈ {price} CAD",
    "pricing.perMo": "/mo",
    "pricing.starter.name": "Starter",
    "pricing.starter.desc": "For single-line operations getting started with OEE tracking.",
    "pricing.pro.name": "Professional",
    "pricing.pro.desc": "Most popular. For multi-line plants ready to optimize.",
    "pricing.ent.name": "Enterprise",
    "pricing.ent.price": "Custom",
    "pricing.ent.desc": "For 5+ lines, multi-plant operations, or custom needs.",
    "pricing.startTrial": "Start Free Trial",
    "pricing.feature.lines.starter": "1 production line",
    "pricing.feature.lines.pro": "Up to 5 production lines",
    "pricing.feature.lines.ent": "Unlimited lines and operators",
    "pricing.feature.ops.starter": "Up to 5 operators",
    "pricing.feature.ops.pro": "Up to 25 operator accounts",
    "pricing.feature.stops": "All 10 stop reason categories",
    "pricing.feature.dash": "Real-time OEE dashboard",
    "pricing.feature.reports": "Shift summary reports",
    "pricing.feature.history90": "90-day data history",
    "pricing.feature.compare": "Multi-line comparison",
    "pricing.feature.supervisor": "Supervisor dashboard",
    "pricing.feature.csv": "CSV data export",
    "pricing.feature.history1y": "1-year data history",
    "pricing.feature.customStops": "Custom stop reason categories",
    "pricing.feature.multiPlant": "Multi-plant dashboard",
    "pricing.feature.onboarding": "Dedicated onboarding",
    "pricing.feature.sla": "SLA and priority support",
    "pricing.feature.unlimitedHistory": "Unlimited history",

    // CONTACT
    "contact.eyebrow": "Book a Demo",
    "contact.h1": "SEE YOUR REAL OEE.",
    "contact.sub":
      "30-minute walkthrough on Zoom. We'll show you the platform with sample plant data and answer your questions.",
    "contact.firstName": "First name",
    "contact.lastName": "Last name",
    "contact.email": "Work email",
    "contact.company": "Company",
    "contact.province": "Province / State",
    "contact.numLines": "Number of lines",
    "contact.method": "Current OEE method",
    "contact.notes": "Notes (optional)",
    "contact.select": "Select...",
    "contact.method.none": "Not tracking yet",
    "contact.method.paper": "Paper or whiteboard",
    "contact.method.excel": "Excel or spreadsheets",
    "contact.method.mes": "MES or enterprise system",
    "contact.method.other": "Other",
    "contact.submit": "Request Demo",
    "contact.success.title": "REQUEST RECEIVED",
    "contact.success.body":
      "Thanks. We'll be in touch within one business day to schedule your demo.",
    "contact.error.invalid": "Please check your inputs and try again.",
    "contact.error.server":
      "Something went wrong on our side. Please try again or email hello@easy-oee.com.",

    // LEGAL
    "legal.tag": "Legal",
    "legal.lastUpdated": "Last updated: April 2026",
    "legal.privacy.title": "PRIVACY POLICY",
    "legal.terms.title": "TERMS OF SERVICE",
    "legal.back": "Back home",

    // SIGN IN
    "signin.tag": "Manager Sign In",
    "signin.title": "SIGN IN",
    "signin.subtitle":
      "Sign in to view the manager dashboard, line setup, and shift history.",
    "signin.email": "Email",
    "signin.password": "Password",
    "signin.continueGoogle": "Continue with Google",
    "signin.continueMicrosoft": "Continue with Microsoft",
    "signin.orEmail": "or sign in with email",
    "signin.submit": "SIGN IN",
    "signin.submitting": "Signing in...",
    "signin.forgot": "Forgot password?",
    "signin.operatorPrompt": "Are you an operator on the floor?",
    "signin.operatorLink": "Sign in with PIN",
    "signin.back": "Back to easy-oee.com",
    "signin.errEmpty": "Enter your password.",
    "signin.errWrong": "Wrong password.",

    // PIN (operator)
    "pin.tag": "Operator Sign In",
    "pin.title": "PICK YOUR NAME",
    "pin.subtitle": "Then enter your 4-digit PIN.",
    "pin.operator": "Operator",
    "pin.signIn": "SIGN IN",
    "pin.signingIn": "Signing in…",
    "pin.errNotFound": "Operator not found",
    "pin.errWrongPin": "Wrong PIN",

    // OPERATOR
    "operator.tag": "Operator",
    "operator.title": "START A SHIFT",
    "operator.signedInAs": "Signed in as",
    "operator.signOut": "Sign out",
    "operator.line": "Production Line",
    "operator.shift": "Shift",
    "operator.shift.morning": "Morning",
    "operator.shift.afternoon": "Afternoon",
    "operator.shift.night": "Night",
    "operator.product": "Product",
    "operator.productPlaceholder": "e.g. Widget A",
    "operator.plannedMinutes": "Planned Minutes",
    "operator.start": "START SHIFT",
    "operator.managerLink": "Manager dashboard",

    // SHIFT (live)
    "shift.live": "LIVE SHIFT",
    "shift.running": "RUNNING",
    "shift.stopped": "STOPPED",
    "shift.goodParts": "Good Parts",
    "shift.badParts": "Bad Parts",
    "shift.tapHint": "Tap a reason to log a stop. Tap again to resume.",
    "shift.endShift": "END SHIFT",
    "shift.ending": "ENDING…",
    "shift.confirmEnd": "End this shift? Final OEE will be calculated and saved.",
    "shift.totalProduced": "Total produced",
    "shift.planned": "Planned",
    "shift.idealRate": "Ideal rate",
    "shift.elapsed": "Elapsed",
    "shift.startedAt": "Started",
    "shift.projectedEnd": "Projected End",
    "shift.totalStops": "Stop Time",
    "shift.liveOee": "Live OEE",
    "shift.target": "Target",
    "shift.currentStop": "Current Stop",
    "shift.handoff": "Hand Off",
    "shift.handoff.title": "Hand off to another operator",
    "shift.handoff.body": "The next operator picks their name and types their PIN. The shift keeps running under their name.",
    "shift.handoff.pick": "Pick operator",
    "shift.handoff.confirm": "Confirm Hand Off",
    "shift.handoff.cancel": "Cancel",
    "shift.handoff.none": "No other active operators on this account.",
    "shift.longStop.title": "Long stop — quick note?",
    "shift.longStop.body": "That stop ran {minutes} minutes for {reason}. Leave a note so the team knows what happened.",
    "shift.longStop.placeholder": "e.g. swapped left bearing, ran out of caps",
    "shift.longStop.save": "Save Note",
    "shift.longStop.skip": "Skip",

    // SUMMARY
    "summary.tag": "Shift Complete",
    "summary.title": "SHIFT SUMMARY",
    "summary.overallOee": "Overall OEE",
    "summary.availability": "Availability",
    "summary.performance": "Performance",
    "summary.quality": "Quality",
    "summary.production": "Production Detail",
    "summary.downtime": "Downtime Events",
    "summary.noStops": "No stops recorded.",
    "summary.startNew": "START NEW SHIFT",
    "summary.dashboard": "DASHBOARD",
    "summary.row.good": "Good parts",
    "summary.row.bad": "Bad parts",
    "summary.row.total": "Total parts",
    "summary.row.planned": "Planned minutes",
    "summary.row.stop": "Stop minutes",
    "summary.row.run": "Run minutes",
    "summary.row.ideal": "Ideal rate",
    "summary.col.reason": "Reason",
    "summary.col.started": "Started",
    "summary.col.minutes": "Minutes",
    "summary.lossTree": "Where the Time Went",
    "summary.lossTree.help": "All planned minutes split into productive output, quality losses (bad parts), speed losses (running below ideal rate), and downtime.",
    "summary.loss.good": "Good Output",
    "summary.loss.quality": "Quality Loss",
    "summary.loss.speed": "Speed Loss",
    "summary.loss.down": "Downtime",

    // EXPORT (shift summary)
    "export.title": "Export this shift",
    "export.csv": "Download CSV",
    "export.print": "Print or save PDF",
    "export.email": "Email it",
    "export.emailLabel": "Send to",
    "export.send": "SEND",
    "export.sending": "Sending...",

    // DASHBOARD
    "dashboard.tag": "Manager Dashboard",
    "dashboard.title": "TODAY",
    "dashboard.startShift": "START SHIFT",
    "dashboard.todaysOee": "Today's OEE",
    "dashboard.todaysOee.sub": "(avg of {n} completed shifts)",
    "dashboard.liveShifts": "Live Shifts",
    "dashboard.recentShifts": "Recent Shifts",
    "dashboard.topStops": "Top Stop Reasons (last 7 days)",
    "dashboard.noLive": "No shifts in progress.",
    "dashboard.noRecent": "No completed shifts yet.",
    "dashboard.noStops": "No stops recorded.",
    "dashboard.live": "LIVE",
    "dashboard.done": "DONE",
    "dashboard.col.line": "Line",
    "dashboard.col.operator": "Operator",
    "dashboard.col.shift": "Shift",
    "dashboard.col.parts": "Parts",
    "dashboard.col.started": "Started",
    "dashboard.col.date": "Date",
    "dashboard.col.product": "Product",
    "dashboard.col.good": "Good",
    "dashboard.col.bad": "Bad",
    "dashboard.col.status": "Status",
    "dashboard.shiftCompare": "Shift Comparison (last 7 days)",
    "dashboard.shiftCompare.shift": "shift",
    "dashboard.shiftCompare.shifts": "shifts",

    // ADMIN (lines / operators / shifts)
    "admin.lines.tag": "Manage",
    "admin.lines.title": "PRODUCTION LINES",
    "admin.lines.intro":
      "Add the lines or machines on your shop floor and their ideal parts-per-minute rate.",
    "admin.lines.add": "Add a line",
    "admin.lines.namePlaceholder": "Machine 3",
    "admin.lines.ratePlaceholder": "ideal rate (parts/min)",
    "admin.lines.count1": "{n} line",
    "admin.lines.count": "{n} lines",
    "admin.lines.empty": "No lines yet.",

    "admin.ops.tag": "Manage",
    "admin.ops.title": "OPERATORS",
    "admin.ops.intro":
      "Add operators to your company. Each gets a 4-digit PIN for shop-floor sign in at /pin.",
    "admin.ops.add": "Add an operator",
    "admin.ops.namePlaceholder": "Full name",
    "admin.ops.pinPlaceholder": "4-digit PIN",
    "admin.ops.newPin": "New PIN (optional)",
    "admin.ops.newPinPlaceholder": "leave blank",
    "admin.ops.count1": "{n} operator",
    "admin.ops.count": "{n} operators",
    "admin.ops.empty": "No operators yet.",

    "admin.shifts.tag": "History",
    "admin.shifts.title": "ALL SHIFTS",
    "admin.shifts.sub": "Most recent 100 shifts.",
    "admin.shifts.empty": "No shifts yet.",

    // SIDEBAR / NAV (manager)
    "mgr.nav.dashboard": "Dashboard",
    "mgr.nav.shifts": "Shifts",
    "mgr.nav.lines": "Lines",
    "mgr.nav.operators": "Operators",
    "mgr.nav.startShift": "Start Shift",
    "mgr.nav.signOut": "Sign out",

    // COMMON
    "common.signOut": "Sign out",
    "common.save": "Save",
    "common.add": "ADD",
    "common.deactivate": "Deactivate",
    "common.active": "active",
    "common.name": "Name",
    "common.idealRate": "Ideal Rate",
    "common.status": "Status",
    "common.back": "Back",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // SPANISH
  // ─────────────────────────────────────────────────────────────────────────
  es: {
    "nav.howItWorks": "Cómo Funciona",
    "nav.features": "Funciones",
    "nav.pricing": "Precios",
    "nav.roi": "Calculadora ROI",
    "nav.signIn": "Iniciar Sesión",
    "nav.bookDemo": "Reservar Demo",

    "footer.tagline":
      "Seguimiento de OEE en tiempo real para gerentes de planta que buscan claridad en el área de producción. Listo en un solo turno.",
    "footer.product": "Producto",
    "footer.company": "Empresa",
    "footer.howItWorks": "Cómo Funciona",
    "footer.features": "Funciones",
    "footer.pricing": "Precios",
    "footer.roi": "Calculadora ROI",
    "footer.bookDemo": "Reservar Demo",
    "footer.contact": "Contacto",
    "footer.privacy": "Política de Privacidad",
    "footer.terms": "Términos de Servicio",
    "footer.rights": "Todos los derechos reservados.",

    "home.eyebrow": "Hecho para fabricantes inteligentes",
    "home.h1.line1": "NO CONOCES",
    "home.h1.line2": "TU OEE REAL.",
    "home.h1.line3": "PODEMOS ARREGLARLO.",
    "home.sub":
      "Easy OEE le da a los gerentes de planta visibilidad en tiempo real del rendimiento de las máquinas, las causas de paradas y la eficiencia por turno, desde cualquier dispositivo en el área de producción. Listo hoy mismo.",
    "home.cta.demo": "Reservar una Demo Gratis",
    "home.cta.how": "Ver Cómo Funciona",

    "home.stat1.n": "23%",
    "home.stat1.l": "Mejora promedio de OEE en el primer año",
    "home.stat2.n": "<4 min",
    "home.stat2.l": "Tiempo de configuración del operador por turno",
    "home.stat3.n": "$0",
    "home.stat3.l": "Cero costos de instalación",
    "home.stat4.n": "100%",
    "home.stat4.l": "Web. Funciona en cualquier dispositivo que ya tengas",

    "home.problem.tag": "El problema",
    "home.problem.title": "LA MAYORÍA DE GERENTES DE PLANTA TRABAJAN A CIEGAS.",
    "home.problem.intro":
      "Si estás midiendo OEE, probablemente lo haces en una hoja de cálculo que se actualiza al final del turno. Para cuando ves los números, el turno terminó y las pérdidas son permanentes.",
    "home.problem.p1.strong": "No conoces tu OEE real.",
    "home.problem.p1.rest":
      " Tienes la sensación de que la línea no rinde. Pero una sensación no es un número, y el número de ayer no te ayuda hoy.",
    "home.problem.p2.strong": "Las razones de paro son vagas o nunca se registran.",
    "home.problem.p2.rest":
      " \"Máquina parada\" no es una causa raíz. Sin saber por qué, no puedes arreglar nada de manera sistemática.",
    "home.problem.p3.strong": "Comparar turno contra turno es imposible.",
    "home.problem.p3.rest":
      " Sin datos consistentes, cada comparación se vuelve una discusión en lugar de una conversación basada en evidencia.",
    "home.problem.p4.strong": "Para cuando ves los datos, ya es muy tarde.",
    "home.problem.p4.rest":
      " Los reportes de fin de día te dicen qué pasó. Easy OEE te dice qué está pasando, mientras todavía puedes hacer algo al respecto.",

    "home.dash.live": "Turno en Vivo / Línea 2 / Mañana",
    "home.dash.running": "En Marcha",
    "home.dash.availability": "Disponibilidad",
    "home.dash.performance": "Desempeño",
    "home.dash.quality": "Calidad",
    "home.dash.oeeScore": "Puntaje OEE",
    "home.dash.recentStops": "Paradas recientes",

    "home.sol.tag": "La solución",
    "home.sol.title": "OEE QUE SE ACTUALIZA MIENTRAS CORRE EL TURNO.",
    "home.sol.body":
      "Easy OEE conecta al operador en planta con los números en tu pantalla. Cada parada se registra con una razón. Cada pieza se cuenta. Disponibilidad, Desempeño y Calidad se calculan automáticamente. Sin fórmulas, sin hojas de cálculo, sin captura de datos al final del día.",
    "home.sol.bodyStrong": "Ves tu OEE ahora mismo. No mañana en la mañana.",
    "home.sol.pill1": "Panel en tiempo real",
    "home.sol.pill2": "10 categorías de paro",
    "home.sol.pill3": "Cálculo automático de OEE",
    "home.sol.pill4": "Reportes por turno",
    "home.sol.pill5": "Cualquier dispositivo",
    "home.sol.cta": "Ver el recorrido completo",
    "home.sol.pull": "CONOCE TU OEE",
    "home.sol.pull2": "ANTES DE QUE TERMINE EL TURNO.",
    "home.sol.pull3": "NO LA MAÑANA SIGUIENTE.",

    "home.how.tag": "Cómo funciona",
    "home.how.title": "OPERANDO EN UN SOLO TURNO.",
    "home.how.intro":
      "Sin departamento de TI. Sin proyecto de instalación. Los operadores registran datos reales en minutos después de crear la cuenta.",
    "home.how.s1.title": "El Operador Inicia Sesión",
    "home.how.s1.body":
      "Abre Easy OEE en cualquier dispositivo. Teléfono, tablet o terminal de planta. Elige la línea, el tipo de turno, el producto y la cadencia ideal. En menos de 60 segundos.",
    "home.how.s2.title": "Las Paradas Se Capturan",
    "home.how.s2.body":
      "¿La máquina se detiene? Un toque para registrar la razón. Duración rastreada automáticamente. ¿La máquina arranca? Un toque más. La parada se cierra con la duración calculada.",
    "home.how.s3.title": "El OEE Se Calcula",
    "home.how.s3.body":
      "Disponibilidad, Desempeño y Calidad se actualizan en tiempo real. El resumen del turno se genera automáticamente. Sin fórmulas. Sin trabajo manual. Sin sorpresas a la mañana siguiente.",

    "home.feat.tag": "Funciones",
    "home.feat.title": "TODO LO QUE UN GERENTE DE PLANTA REALMENTE NECESITA.",
    "home.feat.intro":
      "Diseñado para la realidad del piso de planta. No es una herramienta de BI genérica adaptada a manufactura.",
    "home.feat.f1.title": "Panel de OEE en Tiempo Real",
    "home.feat.f1.body":
      "Mira Disponibilidad, Desempeño y Calidad actualizándose en vivo conforme avanza el turno. Sin esperar reportes de fin de día.",
    "home.feat.f2.title": "10 Razones de Paro Estandarizadas",
    "home.feat.f2.body":
      "Falla Mecánica, Cambio de Producto, Sin Material, Inspección de Calidad, Mantenimiento y más. El mismo conjunto para cada operador y cada línea.",
    "home.feat.f3.title": "Reportes de Turno Automáticos",
    "home.feat.f3.body":
      "Cada turno genera un resumen completo: piezas buenas, piezas malas, tiempo total de paro, principales causas de paro y puntaje OEE final. Cero captura de datos requerida.",
    "home.feat.f4.title": "Multilínea, Multiturno",
    "home.feat.f4.body":
      "Rastrea turnos de Mañana, Tarde y Noche en tantas líneas como tengas. Todo desde una sola cuenta.",
    "home.feat.f5.title": "Privacidad de Datos por Empresa",
    "home.feat.f5.body":
      "Tus datos siguen siendo tuyos. Los operadores ven solo su línea. Los gerentes ven su planta. Los datos nunca se comparten entre cuentas.",
    "home.feat.f6.title": "Funciona en Cualquier Dispositivo",
    "home.feat.f6.body":
      "Totalmente web. Corre en el teléfono del operador, la tablet en la línea o el PC en tu oficina. Próximamente un complemento de hardware para plantas que quieran integración con PLC.",

    "home.proof.tag": "Desde el piso",
    "home.proof.title": "GERENTES DE PLANTA QUE HICIERON EL CAMBIO.",
    "home.proof.t1.role": "Gerente de Planta, Ontario",
    "home.proof.t1.q":
      "Pasamos de una hoja de cálculo compartida a tener datos de OEE en vivo en mi teléfono. La primera semana descubrimos que el cambio de producto se comía el 22% de nuestro tiempo disponible. Nunca lo habíamos medido antes.",
    "home.proof.t2.role": "Directora de Operaciones, Quebec",
    "home.proof.t2.q":
      "Nuestros operadores eran escépticos. Dos semanas después, ellos mismos se recuerdan unos a otros que registren las paradas porque pueden ver los números en tiempo real. Lo simple es lo que hizo que se adoptara.",
    "home.proof.t3.role": "Gerente de Planta, Alberta",
    "home.proof.t3.q":
      "Las plataformas empresariales de OEE quieren $2,000 al mes y seis meses para implementarse. Easy OEE estaba corriendo en nuestro piso la misma tarde que nos registramos. La diferencia es del cielo a la tierra.",

    "home.pt.tag": "Precios",
    "home.pt.title.line1": "DESDE $39 USD/LÍNEA/MES.",
    "home.pt.title.line2": "SIN COSTOS DE INSTALACIÓN. NUNCA.",
    "home.pt.intro":
      "Precio por línea de producción. Solo pagas por las líneas que rastreas. Una sola hora de paro cuesta más que un mes completo de Easy OEE. La cuenta es obvia desde el primer día.",
    "home.pt.cta1": "Ver Precios Completos",
    "home.pt.cta2": "Calcula Tu ROI",
    "home.pt.roi.title": "LA CUENTA ES SIMPLE",
    "home.pt.roi.p1":
      "Si tu línea corre 480 minutos por turno y tu OEE es 65%, estás perdiendo 168 minutos de producción potencial cada turno.",
    "home.pt.roi.p2.before": "A un valor conservador de $85/minuto de producción, eso es ",
    "home.pt.roi.p2.strong": "$14,280 perdidos por semana",
    "home.pt.roi.p2.after": " en una sola línea.",
    "home.pt.roi.p3": "Easy OEE Professional cubre hasta 5 líneas por $99 USD/mes.",
    "home.pt.roi.p4":
      "Una mejora de 5% en OEE recupera el costo anual completo en menos de 3 días.",

    "home.cta.title": "¿LISTO PARA VER TU OEE REAL?",
    "home.cta.body":
      "Reserva una demo gratis de 30 minutos. Te mostraremos la plataforma en vivo usando la configuración de tu propia línea. Sin diapositivas, sin discurso de venta.",
    "home.cta.sub": "Prueba gratis de 14 días incluida. No se requiere tarjeta de crédito.",
    "home.cta.button": "Reserva Tu Demo Gratis",

    "how.eyebrow": "Cómo funciona",
    "how.h1.line1": "DE CERO A OEE EN VIVO",
    "how.h1.line2": "EN UN SOLO TURNO.",
    "how.sub":
      "Esto es exactamente lo que pasa cuando un operador toma su teléfono e inicia un turno en Easy OEE, y lo que ves tú como gerente de planta mientras corre.",

    "how.steps.tag": "3 Pasos",
    "how.steps.title": "INICIO. CORRIDA. FIN.",
    "how.steps.intro": "Un flujo, tres momentos. Cada turno en Easy OEE se ve así.",
    "how.s1.title": "INICIO DE TURNO",
    "how.s1.p1":
      "El operador abre Easy OEE en cualquier dispositivo. Teléfono, tablet o una terminal compartida. Sin descargar app. Sin manual de capacitación.",
    "how.s1.p2":
      "Inicia sesión, selecciona su línea de producción, elige su turno, ingresa el producto que va a correr y establece los minutos planeados y la cadencia ideal.",
    "how.s1.p3": "Tiempo total: menos de 60 segundos.",
    "how.s2.title": "DURANTE EL TURNO",
    "how.s2.p1":
      "Cuando la máquina se detiene, el operador toca la razón. Ese es todo el flujo. Un toque.",
    "how.s2.p2":
      "El botón se vuelve rojo. El cronómetro arranca. Cuando la máquina arranca, el operador toca de nuevo. La parada se cierra y la duración se calcula automáticamente.",
    "how.s2.p3":
      "Sin papel. Sin llamadas por radio a la oficina. Sin reconstruir todo al final del día.",
    "how.s3.title": "FIN DE TURNO",
    "how.s3.p1": "El operador registra las piezas buenas y malas producidas. Easy OEE hace el resto.",
    "how.s3.p2":
      "Disponibilidad, Desempeño y Calidad se calculan al instante. Aparece el puntaje OEE. Se genera el resumen completo del turno. Cada paro, cada razón, cada minuto de producción perdida.",
    "how.s3.p3": "Cero cálculo manual.",

    "how.stops.tag": "Estandarizado",
    "how.stops.title": "10 RAZONES DE PARO.",
    "how.stops.intro":
      "Cada razón es la misma para todas las líneas y todos los operadores. Cuando comparas turnos o líneas, comparas peras con peras.",

    "how.math.tag": "Las matemáticas",
    "how.math.title": "CÓMO SE CALCULA EL OEE.",
    "how.math.intro":
      "Easy OEE calcula los tres componentes automáticamente. Esto es lo que sucede internamente.",
    "how.math.a.title": "DISPONIBILIDAD",
    "how.math.a.formula": "(Planeado − Paro) / Planeado",
    "how.math.a.body":
      "¿La máquina estaba corriendo cuando debía? Mide el tiempo de paro no planeado como porcentaje del tiempo de producción programado.",
    "how.math.p.title": "DESEMPEÑO",
    "how.math.p.formula": "Piezas / (Cadencia Ideal × Tiempo de Corrida)",
    "how.math.p.body":
      "¿La máquina corría a su velocidad ideal? Captura paros pequeños, pérdidas de velocidad y micro-paradas que no se registran como paros completos.",
    "how.math.q.title": "CALIDAD",
    "how.math.q.formula": "Buenas / (Buenas + Malas)",
    "how.math.q.body":
      "¿Las piezas se hicieron bien a la primera? Mide el porcentaje de la producción que cumple los estándares de calidad sin retrabajo.",
    "how.math.final.tag": "Fórmula final",
    "how.math.final.title": "OEE = D × R × C",
    "how.math.final.scale": "Clase mundial: 85%+   ·   Típico: 60 a 75%   ·   Bajo: menos de 60%",

    "how.start.tag": "Empezando",
    "how.start.title": "CUATRO PASOS.",
    "how.start.intro": "Sin departamento de TI. Sin proyecto de instalación. Sin sesiones de capacitación.",
    "how.start.s1.title": "Crea tu cuenta",
    "how.start.s1.body":
      "Regístrate en app.easy-oee.com. Ingresa el nombre de tu empresa. Toma 2 minutos. No se necesita tarjeta de crédito para la prueba.",
    "how.start.s2.title": "Agrega tus líneas",
    "how.start.s2.body":
      "Ingresa cada línea de producción y su cadencia ideal en piezas por minuto. Máquina 1, Línea A, Prensa 3, como sea que las llames en planta.",
    "how.start.s3.title": "Invita a los operadores",
    "how.start.s3.body":
      "Agrega operadores por correo. Reciben un enlace de acceso. No se requiere capacitación. La interfaz se explica sola la primera vez que se usa.",
    "how.start.s4.title": "Inicia tu primer turno",
    "how.start.s4.body":
      "Tus primeros datos reales de OEE estarán en tu pantalla antes de que termine el turno. Ese es todo el proceso de incorporación.",
    "how.start.cta": "Inicia Tu Prueba Gratis. Sin Tarjeta de Crédito.",

    "how.faq.tag": "Preguntas Frecuentes",
    "how.faq.title": "RESPUESTAS RÁPIDAS.",
    "how.faq.q1": "¿Los operadores necesitan smartphones?",
    "how.faq.a1":
      "No. Easy OEE corre en cualquier navegador. Smartphones, tablets, terminales compartidas o un PC. La mayoría de plantas pone una tablet barata montada en pared en la estación del operador y eso es todo.",
    "how.faq.q2": "¿Y si un operador olvida registrar un paro?",
    "how.faq.a2":
      "Los paros pueden agregarse o ajustarse durante el turno activo. El gerente de planta también puede revisar y editar los datos del turno desde la vista de gerencia antes de que el registro se finalice.",
    "how.faq.q3": "¿Cuánto dura la capacitación del operador?",
    "how.faq.a3":
      "La mayoría de operadores entiende la interfaz en 5 minutos sin capacitación formal. El flujo es: inicia turno, toca cuando la máquina se detiene, toca cuando arranca, termina turno. Eso es todo.",
    "how.faq.q4": "¿Y si tenemos varios turnos en la misma línea?",
    "how.faq.a4":
      "Cada turno es un registro separado. Los turnos de Mañana, Tarde y Noche en la misma línea se rastrean independientemente y se pueden comparar lado a lado en el panel de gerencia.",
    "how.faq.q5": "¿Qué pasa si se cae el internet en planta?",
    "how.faq.a5":
      "Easy OEE necesita conexión a internet para guardar datos en tiempo real. La mayoría de plantas usa una red WiFi confiable o un hotspot móvil en la estación del operador. El modo sin conexión está en la hoja de ruta del producto.",

    "how.ctaBand.tag": "¿Quieres verlo en vivo?",
    "how.ctaBand.title": "RESERVA UNA DEMO GRATIS.",
    "how.ctaBand.body":
      "Treinta minutos. Lo configuramos según tu planta y hacemos una demostración en vivo de un turno juntos.",
    "how.ctaBand.button": "Reserva una Demo Gratis",

    "stop.01.label": "Falla Mecánica",
    "stop.01.desc": "Falla o avería no planeada del equipo",
    "stop.02.label": "Cambio de Producto",
    "stop.02.desc": "Cambio de producto o herramienta entre corridas",
    "stop.03.label": "Sin Material",
    "stop.03.desc": "Esperando materia prima o componentes",
    "stop.04.label": "Inspección de Calidad",
    "stop.04.desc": "Inspección, medición o retención de calidad que requiere paro",
    "stop.05.label": "Descanso Programado",
    "stop.05.desc": "Comidas, juntas de turno, pausas planeadas",
    "stop.06.label": "Sin Operador",
    "stop.06.desc": "Esperando un operador calificado disponible",
    "stop.07.label": "Mantenimiento",
    "stop.07.desc": "Actividades de mantenimiento preventivo planeado",
    "stop.08.label": "Capacitación",
    "stop.08.desc": "Capacitación de operadores durante horas de producción",
    "stop.09.label": "Sin Producción Programada",
    "stop.09.desc": "Tiempo inactivo planeado. Línea no programada para correr.",
    "stop.10.label": "Otro",
    "stop.10.desc": "Cualquier cosa no cubierta por las categorías anteriores",

    "roi.eyebrow": "Calculadora ROI",
    "roi.h1.line1": "¿CUÁNTO TE CUESTA",
    "roi.h1.line2": "TU TIEMPO DE PARO?",
    "roi.sub":
      "Ingresa los números de tu planta. Mira exactamente cuánto te cuestan tus pérdidas actuales de OEE y cuánto recuperarías si las arreglas.",
    "roi.calc.tag": "Calculadora",
    "roi.calc.title": "LOS NÚMEROS DE TU PLANTA.",
    "roi.calc.intro": "Todas las cifras en USD. Ajusta los controles para que coincidan con tu operación.",
    "roi.input.lines": "Líneas de producción",
    "roi.input.shifts": "Turnos por día",
    "roi.input.days": "Días laborables por semana",
    "roi.input.mins": "Minutos por turno",
    "roi.input.rate": "Valor de producción",
    "roi.input.rate.hint": "Estimación: ingresos por hora ÷ 60",
    "roi.input.oee": "Estimación de OEE actual",
    "roi.input.oee.hint": "Clase mundial es 85%+. Promedio PYME es 60 a 70%.",
    "roi.target": "Mejora objetivo de OEE",
    "roi.losing": "Estás perdiendo",
    "roi.recover": "Recupera con +{pct}% de OEE",
    "roi.payback.label": "Retorno de Easy OEE",
    "roi.payback.refLine": "Referencia: Easy OEE Professional a $99 USD/mes ($1,188 USD/año, 5 líneas).",
    "roi.payback.over1y": "> 1 año",
    "roi.cta": "Reserva una Demo Gratis",

    "roi.losses.tag": "Tres tipos de pérdidas",
    "roi.losses.title": "DE DÓNDE VIENEN LAS PÉRDIDAS DE OEE.",
    "roi.losses.intro": "Las tres son medibles. Las tres son recuperables.",
    "roi.losses.a.title": "PÉRDIDA DE DISPONIBILIDAD",
    "roi.losses.a.body":
      "Tiempo de paro no planeado. Averías, cambios de producto que se alargaron, falta de material, esperar a operadores o mantenimiento.",
    "roi.losses.p.title": "PÉRDIDA DE DESEMPEÑO",
    "roi.losses.p.body":
      "Pérdidas de velocidad. Micro-paros muy cortos para registrarse, correr por debajo de la cadencia ideal, desgaste del equipo bajando la línea.",
    "roi.losses.q.title": "PÉRDIDA DE CALIDAD",
    "roi.losses.q.body":
      "Desperdicio y retrabajo. Piezas que no cumplen especificación a la primera y se descartan o tienen que arreglarse.",

    "pricing.eyebrow": "Precios",
    "pricing.h1": "SIMPLE. TRANSPARENTE.",
    "pricing.sub": "Prueba gratis de 14 días. No se requiere tarjeta de crédito.",
    "pricing.usdLabel": "USD",
    "pricing.cadLabel": "≈ {price} CAD",
    "pricing.perMo": "/mes",
    "pricing.starter.name": "Starter",
    "pricing.starter.desc": "Para operaciones de una línea que están empezando con seguimiento de OEE.",
    "pricing.pro.name": "Professional",
    "pricing.pro.desc": "El más popular. Para plantas multilínea listas para optimizar.",
    "pricing.ent.name": "Enterprise",
    "pricing.ent.price": "Personalizado",
    "pricing.ent.desc": "Para 5+ líneas, operaciones multiplanta o necesidades personalizadas.",
    "pricing.startTrial": "Iniciar Prueba Gratis",
    "pricing.feature.lines.starter": "1 línea de producción",
    "pricing.feature.lines.pro": "Hasta 5 líneas de producción",
    "pricing.feature.lines.ent": "Líneas y operadores ilimitados",
    "pricing.feature.ops.starter": "Hasta 5 operadores",
    "pricing.feature.ops.pro": "Hasta 25 cuentas de operador",
    "pricing.feature.stops": "Las 10 categorías de razones de paro",
    "pricing.feature.dash": "Panel OEE en tiempo real",
    "pricing.feature.reports": "Reportes de resumen de turno",
    "pricing.feature.history90": "90 días de historial",
    "pricing.feature.compare": "Comparación multilínea",
    "pricing.feature.supervisor": "Panel de supervisor",
    "pricing.feature.csv": "Exportación de datos a CSV",
    "pricing.feature.history1y": "1 año de historial",
    "pricing.feature.customStops": "Categorías de paro personalizadas",
    "pricing.feature.multiPlant": "Panel multiplanta",
    "pricing.feature.onboarding": "Incorporación dedicada",
    "pricing.feature.sla": "SLA y soporte prioritario",
    "pricing.feature.unlimitedHistory": "Historial ilimitado",

    "contact.eyebrow": "Reservar Demo",
    "contact.h1": "MIRA TU OEE REAL.",
    "contact.sub":
      "Recorrido de 30 minutos por Zoom. Te mostraremos la plataforma con datos de planta de muestra y responderemos tus preguntas.",
    "contact.firstName": "Nombre",
    "contact.lastName": "Apellido",
    "contact.email": "Correo de trabajo",
    "contact.company": "Empresa",
    "contact.province": "Provincia / Estado",
    "contact.numLines": "Número de líneas",
    "contact.method": "Método actual de OEE",
    "contact.notes": "Notas (opcional)",
    "contact.select": "Seleccionar...",
    "contact.method.none": "Aún no medimos",
    "contact.method.paper": "Papel o pizarrón",
    "contact.method.excel": "Excel o hojas de cálculo",
    "contact.method.mes": "MES o sistema empresarial",
    "contact.method.other": "Otro",
    "contact.submit": "Solicitar Demo",
    "contact.success.title": "SOLICITUD RECIBIDA",
    "contact.success.body":
      "Gracias. Nos pondremos en contacto en un día hábil para programar tu demo.",
    "contact.error.invalid": "Por favor revisa los datos e intenta de nuevo.",
    "contact.error.server":
      "Algo falló de nuestro lado. Intenta de nuevo o escríbenos a hello@easy-oee.com.",

    "legal.tag": "Legal",
    "legal.lastUpdated": "Última actualización: Abril 2026",
    "legal.privacy.title": "POLÍTICA DE PRIVACIDAD",
    "legal.terms.title": "TÉRMINOS DE SERVICIO",
    "legal.back": "Volver al inicio",

    "signin.tag": "Acceso del Gerente",
    "signin.title": "INICIAR SESIÓN",
    "signin.subtitle":
      "Inicia sesión para ver el panel del gerente, la configuración de líneas y el historial de turnos.",
    "signin.email": "Correo electrónico",
    "signin.password": "Contraseña",
    "signin.continueGoogle": "Continuar con Google",
    "signin.continueMicrosoft": "Continuar con Microsoft",
    "signin.orEmail": "o inicia sesión con correo",
    "signin.submit": "INICIAR SESIÓN",
    "signin.submitting": "Iniciando sesión...",
    "signin.forgot": "¿Olvidaste tu contraseña?",
    "signin.operatorPrompt": "¿Eres operador en planta?",
    "signin.operatorLink": "Inicia sesión con PIN",
    "signin.back": "Volver a easy-oee.com",
    "signin.errEmpty": "Ingresa tu contraseña.",
    "signin.errWrong": "Contraseña incorrecta.",

    "pin.tag": "Acceso del Operador",
    "pin.title": "ELIGE TU NOMBRE",
    "pin.subtitle": "Luego ingresa tu PIN de 4 dígitos.",
    "pin.operator": "Operador",
    "pin.signIn": "INICIAR SESIÓN",
    "pin.signingIn": "Iniciando sesión…",
    "pin.errNotFound": "Operador no encontrado",
    "pin.errWrongPin": "PIN incorrecto",

    "operator.tag": "Operador",
    "operator.title": "INICIAR UN TURNO",
    "operator.signedInAs": "Sesión iniciada como",
    "operator.signOut": "Cerrar sesión",
    "operator.line": "Línea de Producción",
    "operator.shift": "Turno",
    "operator.shift.morning": "Mañana",
    "operator.shift.afternoon": "Tarde",
    "operator.shift.night": "Noche",
    "operator.product": "Producto",
    "operator.productPlaceholder": "ej. Widget A",
    "operator.plannedMinutes": "Minutos Planeados",
    "operator.start": "INICIAR TURNO",
    "operator.managerLink": "Panel del gerente",

    "shift.live": "TURNO EN VIVO",
    "shift.running": "EN MARCHA",
    "shift.stopped": "DETENIDO",
    "shift.goodParts": "Piezas Buenas",
    "shift.badParts": "Piezas Defectuosas",
    "shift.tapHint": "Toca una razón para registrar una parada. Toca de nuevo para reanudar.",
    "shift.endShift": "TERMINAR TURNO",
    "shift.ending": "TERMINANDO…",
    "shift.confirmEnd": "¿Terminar este turno? Se calculará y guardará el OEE final.",
    "shift.totalProduced": "Total producido",
    "shift.planned": "Planeado",
    "shift.idealRate": "Cadencia ideal",
    "shift.elapsed": "Transcurrido",
    "shift.startedAt": "Inicio",
    "shift.projectedEnd": "Fin Previsto",
    "shift.totalStops": "Tiempo Parado",
    "shift.liveOee": "OEE en Vivo",
    "shift.target": "Objetivo",
    "shift.currentStop": "Parada Actual",
    "shift.handoff": "Cambio de Turno",
    "shift.handoff.title": "Pasar a otro operador",
    "shift.handoff.body": "El siguiente operador elige su nombre y escribe su PIN. El turno sigue bajo su nombre.",
    "shift.handoff.pick": "Elegir operador",
    "shift.handoff.confirm": "Confirmar Cambio",
    "shift.handoff.cancel": "Cancelar",
    "shift.handoff.none": "No hay otros operadores activos en esta cuenta.",
    "shift.longStop.title": "Parada larga — ¿una nota rápida?",
    "shift.longStop.body": "Esa parada duró {minutes} minutos por {reason}. Deja una nota para que el equipo sepa lo que pasó.",
    "shift.longStop.placeholder": "ej. cambié rodamiento izquierdo, sin tapas",
    "shift.longStop.save": "Guardar Nota",
    "shift.longStop.skip": "Omitir",

    "summary.tag": "Turno Completo",
    "summary.title": "RESUMEN DEL TURNO",
    "summary.overallOee": "OEE Total",
    "summary.availability": "Disponibilidad",
    "summary.performance": "Desempeño",
    "summary.quality": "Calidad",
    "summary.production": "Detalles de Producción",
    "summary.downtime": "Eventos de Paro",
    "summary.noStops": "Sin paradas registradas.",
    "summary.startNew": "INICIAR NUEVO TURNO",
    "summary.dashboard": "PANEL",
    "summary.row.good": "Piezas buenas",
    "summary.row.bad": "Piezas malas",
    "summary.row.total": "Total de piezas",
    "summary.row.planned": "Minutos planeados",
    "summary.row.stop": "Minutos de paro",
    "summary.row.run": "Minutos de corrida",
    "summary.row.ideal": "Cadencia ideal",
    "summary.col.reason": "Razón",
    "summary.col.started": "Iniciado",
    "summary.col.minutes": "Minutos",
    "summary.lossTree": "A Dónde Se Fue el Tiempo",
    "summary.lossTree.help": "Todos los minutos planeados divididos en producción útil, pérdidas de calidad (piezas malas), pérdidas de velocidad (por debajo de la cadencia ideal) y paradas.",
    "summary.loss.good": "Producción Buena",
    "summary.loss.quality": "Pérdida de Calidad",
    "summary.loss.speed": "Pérdida de Velocidad",
    "summary.loss.down": "Paradas",

    "export.title": "Exportar este turno",
    "export.csv": "Descargar CSV",
    "export.print": "Imprimir o guardar PDF",
    "export.email": "Enviar por correo",
    "export.emailLabel": "Enviar a",
    "export.send": "ENVIAR",
    "export.sending": "Enviando...",

    "dashboard.tag": "Panel del Gerente",
    "dashboard.title": "HOY",
    "dashboard.startShift": "INICIAR TURNO",
    "dashboard.todaysOee": "OEE de Hoy",
    "dashboard.todaysOee.sub": "(promedio de {n} turnos completos)",
    "dashboard.liveShifts": "Turnos en Vivo",
    "dashboard.recentShifts": "Turnos Recientes",
    "dashboard.topStops": "Principales Razones de Parada (últimos 7 días)",
    "dashboard.noLive": "No hay turnos en progreso.",
    "dashboard.noRecent": "Aún no hay turnos completados.",
    "dashboard.noStops": "Sin paradas registradas.",
    "dashboard.live": "EN VIVO",
    "dashboard.done": "HECHO",
    "dashboard.col.line": "Línea",
    "dashboard.col.operator": "Operador",
    "dashboard.col.shift": "Turno",
    "dashboard.col.parts": "Piezas",
    "dashboard.col.started": "Iniciado",
    "dashboard.col.date": "Fecha",
    "dashboard.col.product": "Producto",
    "dashboard.col.good": "Buenas",
    "dashboard.col.bad": "Malas",
    "dashboard.col.status": "Estado",
    "dashboard.shiftCompare": "Comparación de Turnos (últimos 7 días)",
    "dashboard.shiftCompare.shift": "turno",
    "dashboard.shiftCompare.shifts": "turnos",

    "admin.lines.tag": "Administrar",
    "admin.lines.title": "LÍNEAS DE PRODUCCIÓN",
    "admin.lines.intro":
      "Agrega las líneas o máquinas de tu planta y su cadencia ideal en piezas por minuto.",
    "admin.lines.add": "Agregar una línea",
    "admin.lines.namePlaceholder": "Máquina 3",
    "admin.lines.ratePlaceholder": "cadencia ideal (piezas/min)",
    "admin.lines.count1": "{n} línea",
    "admin.lines.count": "{n} líneas",
    "admin.lines.empty": "Aún no hay líneas.",

    "admin.ops.tag": "Administrar",
    "admin.ops.title": "OPERADORES",
    "admin.ops.intro":
      "Agrega operadores a tu empresa. Cada uno recibe un PIN de 4 dígitos para iniciar sesión en /pin.",
    "admin.ops.add": "Agregar un operador",
    "admin.ops.namePlaceholder": "Nombre completo",
    "admin.ops.pinPlaceholder": "PIN de 4 dígitos",
    "admin.ops.newPin": "Nuevo PIN (opcional)",
    "admin.ops.newPinPlaceholder": "déjalo en blanco",
    "admin.ops.count1": "{n} operador",
    "admin.ops.count": "{n} operadores",
    "admin.ops.empty": "Aún no hay operadores.",

    "admin.shifts.tag": "Historial",
    "admin.shifts.title": "TODOS LOS TURNOS",
    "admin.shifts.sub": "Los 100 turnos más recientes.",
    "admin.shifts.empty": "Aún no hay turnos.",

    "mgr.nav.dashboard": "Panel",
    "mgr.nav.shifts": "Turnos",
    "mgr.nav.lines": "Líneas",
    "mgr.nav.operators": "Operadores",
    "mgr.nav.startShift": "Iniciar Turno",
    "mgr.nav.signOut": "Cerrar sesión",

    "common.signOut": "Cerrar sesión",
    "common.save": "Guardar",
    "common.add": "AÑADIR",
    "common.deactivate": "Desactivar",
    "common.active": "activo",
    "common.name": "Nombre",
    "common.idealRate": "Cadencia Ideal",
    "common.status": "Estado",
    "common.back": "Volver",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // FRENCH
  // ─────────────────────────────────────────────────────────────────────────
  fr: {
    "nav.howItWorks": "Fonctionnement",
    "nav.features": "Fonctionnalités",
    "nav.pricing": "Tarifs",
    "nav.roi": "Calculateur ROI",
    "nav.signIn": "Connexion",
    "nav.bookDemo": "Réserver une Démo",

    "footer.tagline":
      "Suivi OEE en temps réel pour les directeurs d'usine qui veulent de la clarté sur le plancher. Opérationnel en un seul quart.",
    "footer.product": "Produit",
    "footer.company": "Entreprise",
    "footer.howItWorks": "Fonctionnement",
    "footer.features": "Fonctionnalités",
    "footer.pricing": "Tarifs",
    "footer.roi": "Calculateur ROI",
    "footer.bookDemo": "Réserver une Démo",
    "footer.contact": "Contact",
    "footer.privacy": "Politique de Confidentialité",
    "footer.terms": "Conditions d'Utilisation",
    "footer.rights": "Tous droits réservés.",

    "home.eyebrow": "Conçu pour les fabricants intelligents",
    "home.h1.line1": "VOUS NE CONNAISSEZ PAS",
    "home.h1.line2": "VOTRE VRAI OEE.",
    "home.h1.line3": "ON PEUT ARRANGER ÇA.",
    "home.sub":
      "Easy OEE donne aux directeurs d'usine une visibilité en temps réel sur la performance des machines, les causes d'arrêt et l'efficacité des quarts, depuis n'importe quel appareil sur le plancher. En marche dès aujourd'hui.",
    "home.cta.demo": "Réserver une Démo Gratuite",
    "home.cta.how": "Voir le Fonctionnement",

    "home.stat1.n": "23 %",
    "home.stat1.l": "Amélioration moyenne du OEE la première année",
    "home.stat2.n": "<4 min",
    "home.stat2.l": "Temps de configuration de l'opérateur par quart",
    "home.stat3.n": "0 $",
    "home.stat3.l": "Aucuns frais d'installation. Jamais.",
    "home.stat4.n": "100 %",
    "home.stat4.l": "Web. Fonctionne sur tout appareil que vous possédez déjà",

    "home.problem.tag": "Le problème",
    "home.problem.title": "LA PLUPART DES DIRECTEURS D'USINE TRAVAILLENT À L'AVEUGLE.",
    "home.problem.intro":
      "Si vous suivez le OEE, c'est probablement dans un tableur mis à jour à la fin du quart. Quand vous voyez les chiffres, le quart est terminé et les pertes sont permanentes.",
    "home.problem.p1.strong": "Vous ne connaissez pas votre vrai OEE.",
    "home.problem.p1.rest":
      " Vous sentez que la ligne ne performe pas. Mais une impression n'est pas un chiffre, et le chiffre d'hier ne vous aide pas aujourd'hui.",
    "home.problem.p2.strong": "Les raisons d'arrêt sont vagues ou jamais notées.",
    "home.problem.p2.rest":
      " « Machine arrêtée » n'est pas une cause racine. Sans savoir pourquoi, on ne peut rien corriger systématiquement.",
    "home.problem.p3.strong": "Comparer un quart à l'autre est impossible.",
    "home.problem.p3.rest":
      " Sans données cohérentes, chaque comparaison devient une dispute au lieu d'une conversation appuyée par des preuves.",
    "home.problem.p4.strong": "Quand vous voyez les données, c'est trop tard.",
    "home.problem.p4.rest":
      " Les rapports de fin de journée vous disent ce qui s'est passé. Easy OEE vous dit ce qui se passe, pendant que vous pouvez encore agir.",

    "home.dash.live": "Quart en cours / Ligne 2 / Matin",
    "home.dash.running": "En marche",
    "home.dash.availability": "Disponibilité",
    "home.dash.performance": "Performance",
    "home.dash.quality": "Qualité",
    "home.dash.oeeScore": "Score OEE",
    "home.dash.recentStops": "Arrêts récents",

    "home.sol.tag": "La solution",
    "home.sol.title": "UN OEE QUI SE MET À JOUR PENDANT LE QUART.",
    "home.sol.body":
      "Easy OEE relie l'opérateur sur le plancher aux chiffres sur votre écran. Chaque arrêt est noté avec une raison. Chaque pièce est comptée. Disponibilité, Performance et Qualité sont calculées automatiquement. Pas de formules, pas de tableurs, pas de saisie en fin de journée.",
    "home.sol.bodyStrong": "Vous voyez votre OEE maintenant. Pas demain matin.",
    "home.sol.pill1": "Tableau de bord en temps réel",
    "home.sol.pill2": "10 catégories d'arrêt",
    "home.sol.pill3": "Calcul OEE automatique",
    "home.sol.pill4": "Rapports de quart",
    "home.sol.pill5": "Tout appareil",
    "home.sol.cta": "Voir le tour complet",
    "home.sol.pull": "CONNAISSEZ VOTRE OEE",
    "home.sol.pull2": "AVANT LA FIN DU QUART.",
    "home.sol.pull3": "PAS LE LENDEMAIN MATIN.",

    "home.how.tag": "Fonctionnement",
    "home.how.title": "OPÉRATIONNEL EN UN SEUL QUART.",
    "home.how.intro":
      "Pas de département TI. Pas de projet d'installation. Les opérateurs enregistrent des données réelles dans les minutes qui suivent la création du compte.",
    "home.how.s1.title": "L'opérateur se connecte",
    "home.how.s1.body":
      "Ouvre Easy OEE sur n'importe quel appareil. Téléphone, tablette ou terminal de plancher. Choisit la ligne, le type de quart, le produit et la cadence idéale. En moins de 60 secondes.",
    "home.how.s2.title": "Les arrêts sont saisis",
    "home.how.s2.body":
      "La machine s'arrête ? Une touche pour noter la raison. La durée est suivie automatiquement. La machine repart ? Une autre touche. L'arrêt se ferme avec la durée calculée.",
    "home.how.s3.title": "Le OEE est calculé",
    "home.how.s3.body":
      "Disponibilité, Performance et Qualité se mettent à jour en temps réel. Le résumé de quart se génère automatiquement. Pas de formules. Pas de travail manuel. Pas de surprises le lendemain matin.",

    "home.feat.tag": "Fonctionnalités",
    "home.feat.title": "TOUT CE QU'UN DIRECTEUR D'USINE A VRAIMENT BESOIN.",
    "home.feat.intro":
      "Conçu pour la réalité du plancher. Pas un outil BI générique adapté à la fabrication.",
    "home.feat.f1.title": "Tableau de bord OEE en temps réel",
    "home.feat.f1.body":
      "Voyez Disponibilité, Performance et Qualité se mettre à jour en direct pendant le quart. Sans attendre les rapports de fin de journée.",
    "home.feat.f2.title": "10 raisons d'arrêt standardisées",
    "home.feat.f2.body":
      "Panne mécanique, Changement de format, Manque de matière, Contrôle qualité, Maintenance, et plus encore. Le même ensemble pour chaque opérateur et chaque ligne.",
    "home.feat.f3.title": "Rapports de quart automatiques",
    "home.feat.f3.body":
      "Chaque quart génère un résumé complet : pièces bonnes, pièces mauvaises, temps d'arrêt total, principales causes d'arrêt et score OEE final. Aucune saisie de données requise.",
    "home.feat.f4.title": "Multi-ligne, multi-quart",
    "home.feat.f4.body":
      "Suivez les quarts du Matin, de l'Après-midi et de la Nuit sur autant de lignes que vous opérez. Le tout depuis un seul compte.",
    "home.feat.f5.title": "Confidentialité des données par entreprise",
    "home.feat.f5.body":
      "Vos données restent les vôtres. Les opérateurs voient seulement leur ligne. Les directeurs voient leur usine. Les données ne sont jamais partagées entre comptes.",
    "home.feat.f6.title": "Fonctionne sur tout appareil",
    "home.feat.f6.body":
      "Entièrement web. Tourne sur le téléphone de l'opérateur, la tablette sur la ligne ou le PC dans votre bureau. Module matériel à venir pour les usines qui veulent une intégration PLC.",

    "home.proof.tag": "Du plancher",
    "home.proof.title": "DES DIRECTEURS D'USINE QUI ONT FAIT LE SAUT.",
    "home.proof.t1.role": "Directeur d'usine, Ontario",
    "home.proof.t1.q":
      "Nous sommes passés d'un tableur partagé à des données OEE en direct sur mon téléphone. La première semaine, on a découvert que les changements de format mangeaient 22 % de notre temps disponible. On ne l'avait jamais mesuré avant.",
    "home.proof.t2.role": "Directrice des opérations, Québec",
    "home.proof.t2.q":
      "Nos opérateurs étaient sceptiques. Deux semaines plus tard, ce sont eux qui se rappellent les uns aux autres de noter les arrêts, parce qu'ils peuvent voir les chiffres en temps réel. C'est la simplicité qui a fait que ça a pris.",
    "home.proof.t3.role": "Directeur d'usine, Alberta",
    "home.proof.t3.q":
      "Les plateformes OEE d'entreprise demandent 2 000 $ par mois et six mois pour la mise en place. Easy OEE tournait sur notre plancher l'après-midi même de l'inscription. La différence est le jour et la nuit.",

    "home.pt.tag": "Tarifs",
    "home.pt.title.line1": "À PARTIR DE 39 $ USD/LIGNE/MOIS.",
    "home.pt.title.line2": "AUCUNS FRAIS D'INSTALLATION. JAMAIS.",
    "home.pt.intro":
      "Tarifé par ligne de production. Vous ne payez que pour les lignes que vous suivez. Une seule heure d'arrêt coûte plus qu'un mois complet d'Easy OEE. Le calcul est évident dès le premier jour.",
    "home.pt.cta1": "Voir tous les tarifs",
    "home.pt.cta2": "Calculez votre ROI",
    "home.pt.roi.title": "LE CALCUL EST SIMPLE",
    "home.pt.roi.p1":
      "Si votre ligne tourne 480 minutes par quart et que votre OEE est à 65 %, vous perdez 168 minutes de production potentielle à chaque quart.",
    "home.pt.roi.p2.before": "À une valeur conservatrice de 85 $/minute de production, c'est ",
    "home.pt.roi.p2.strong": "14 280 $ perdus par semaine",
    "home.pt.roi.p2.after": " sur une seule ligne.",
    "home.pt.roi.p3": "Easy OEE Professional couvre jusqu'à 5 lignes pour 99 $ USD/mois.",
    "home.pt.roi.p4":
      "Une amélioration de 5 % du OEE rembourse le coût annuel complet en moins de 3 jours.",

    "home.cta.title": "PRÊT À VOIR VOTRE VRAI OEE ?",
    "home.cta.body":
      "Réservez une démo gratuite de 30 minutes. On parcourt la plateforme en direct avec votre propre configuration de ligne. Pas de diapositives, pas de discours de vente.",
    "home.cta.sub": "Essai gratuit de 14 jours inclus. Aucune carte de crédit requise.",
    "home.cta.button": "Réserver Votre Démo Gratuite",

    "how.eyebrow": "Fonctionnement",
    "how.h1.line1": "DE ZÉRO À OEE EN DIRECT",
    "how.h1.line2": "EN UN SEUL QUART.",
    "how.sub":
      "Voici exactement ce qui se passe quand un opérateur prend son téléphone et démarre un quart dans Easy OEE, et ce que vous voyez comme directeur d'usine pendant que ça tourne.",

    "how.steps.tag": "3 Étapes",
    "how.steps.title": "DÉMARRER. ROULER. TERMINER.",
    "how.steps.intro": "Un seul flux, trois moments. Chaque quart Easy OEE ressemble à ça.",
    "how.s1.title": "DÉMARRAGE DU QUART",
    "how.s1.p1":
      "L'opérateur ouvre Easy OEE sur n'importe quel appareil. Téléphone, tablette ou terminal partagé sur le plancher. Pas d'application à télécharger. Pas de manuel de formation.",
    "how.s1.p2":
      "Il se connecte, sélectionne sa ligne de production, choisit son quart, entre le produit qui va rouler et fixe les minutes planifiées et la cadence idéale.",
    "how.s1.p3": "Temps total : moins de 60 secondes.",
    "how.s2.title": "PENDANT LE QUART",
    "how.s2.p1":
      "Quand la machine s'arrête, l'opérateur touche la raison. C'est tout le flux. Une touche.",
    "how.s2.p2":
      "Le bouton devient rouge. Le chrono démarre. Quand la machine repart, l'opérateur touche encore. L'arrêt se ferme et la durée est calculée automatiquement.",
    "how.s2.p3": "Pas de papier. Pas d'appels radio au bureau. Pas de reconstitution en fin de journée.",
    "how.s3.title": "FIN DU QUART",
    "how.s3.p1":
      "L'opérateur enregistre les pièces bonnes et mauvaises produites. Easy OEE fait le reste.",
    "how.s3.p2":
      "Disponibilité, Performance et Qualité sont calculées instantanément. Le score OEE apparaît. Le résumé complet du quart est généré. Chaque arrêt, chaque raison, chaque minute de production perdue.",
    "how.s3.p3": "Aucun calcul manuel.",

    "how.stops.tag": "Standardisé",
    "how.stops.title": "10 RAISONS D'ARRÊT.",
    "how.stops.intro":
      "Chaque raison est la même pour toutes les lignes et tous les opérateurs. Quand vous comparez des quarts ou des lignes, vous comparez des pommes avec des pommes.",

    "how.math.tag": "Le calcul",
    "how.math.title": "COMMENT LE OEE EST CALCULÉ.",
    "how.math.intro":
      "Easy OEE calcule les trois composantes automatiquement. Voici ce qui se passe sous le capot.",
    "how.math.a.title": "DISPONIBILITÉ",
    "how.math.a.formula": "(Planifié − Arrêt) / Planifié",
    "how.math.a.body":
      "La machine roulait-elle quand elle devait ? Mesure le temps d'arrêt non planifié en pourcentage du temps de production planifié.",
    "how.math.p.title": "PERFORMANCE",
    "how.math.p.formula": "Pièces / (Cadence Idéale × Temps de Marche)",
    "how.math.p.body":
      "La machine tournait-elle à sa vitesse idéale ? Capte les petits arrêts, les pertes de vitesse et les micro-arrêts qui ne sont pas notés comme arrêts complets.",
    "how.math.q.title": "QUALITÉ",
    "how.math.q.formula": "Bonnes / (Bonnes + Mauvaises)",
    "how.math.q.body":
      "Les pièces ont-elles été faites correctement du premier coup ? Mesure le pourcentage de production qui respecte les normes de qualité sans retouche.",
    "how.math.final.tag": "Formule finale",
    "how.math.final.title": "OEE = D × P × Q",
    "how.math.final.scale": "Classe mondiale : 85 %+   ·   Typique : 60 à 75 %   ·   Bas : sous 60 %",

    "how.start.tag": "Pour commencer",
    "how.start.title": "QUATRE ÉTAPES.",
    "how.start.intro": "Pas de département TI. Pas de projet d'installation. Pas de séances de formation.",
    "how.start.s1.title": "Créez votre compte",
    "how.start.s1.body":
      "Inscrivez-vous sur app.easy-oee.com. Entrez le nom de votre entreprise. Ça prend 2 minutes. Aucune carte de crédit requise pour l'essai.",
    "how.start.s2.title": "Ajoutez vos lignes",
    "how.start.s2.body":
      "Entrez chaque ligne de production et sa cadence idéale en pièces par minute. Machine 1, Ligne A, Presse 3, comme vous les appelez sur le plancher.",
    "how.start.s3.title": "Invitez les opérateurs",
    "how.start.s3.body":
      "Ajoutez les opérateurs par courriel. Ils reçoivent un lien de connexion. Aucune formation requise. L'interface s'explique d'elle-même la première fois.",
    "how.start.s4.title": "Démarrez votre premier quart",
    "how.start.s4.body":
      "Vos premières vraies données OEE seront sur votre écran avant la fin du quart. C'est tout le processus d'intégration.",
    "how.start.cta": "Démarrez Votre Essai Gratuit. Aucune Carte de Crédit.",

    "how.faq.tag": "FAQ",
    "how.faq.title": "RÉPONSES RAPIDES.",
    "how.faq.q1": "Les opérateurs ont-ils besoin de téléphones intelligents ?",
    "how.faq.a1":
      "Non. Easy OEE fonctionne dans n'importe quel navigateur. Téléphones, tablettes, terminaux partagés ou un PC. La plupart des usines mettent une tablette pas chère murale au poste de l'opérateur et c'est tout.",
    "how.faq.q2": "Et si un opérateur oublie de noter un arrêt ?",
    "how.faq.a2":
      "Les arrêts peuvent être ajoutés ou ajustés pendant le quart actif. Le directeur d'usine peut aussi revoir et modifier les données du quart depuis la vue de gestion avant que l'enregistrement soit finalisé.",
    "how.faq.q3": "Combien de temps prend la formation des opérateurs ?",
    "how.faq.a3":
      "La plupart des opérateurs comprennent l'interface en 5 minutes sans formation formelle. Le flux est : démarrer le quart, toucher quand la machine s'arrête, toucher quand elle repart, terminer le quart. C'est tout.",
    "how.faq.q4": "Et si on a plusieurs quarts sur la même ligne ?",
    "how.faq.a4":
      "Chaque quart est un enregistrement séparé. Les quarts du Matin, de l'Après-midi et de la Nuit sur la même ligne sont suivis indépendamment et peuvent être comparés côte à côte dans le tableau de bord de gestion.",
    "how.faq.q5": "Que se passe-t-il si l'internet tombe sur le plancher ?",
    "how.faq.a5":
      "Easy OEE a besoin d'une connexion internet pour sauvegarder les données en temps réel. La plupart des usines utilisent un WiFi fiable ou un point d'accès mobile au poste de l'opérateur. Le mode hors ligne est dans la feuille de route.",

    "how.ctaBand.tag": "Vous voulez voir en direct ?",
    "how.ctaBand.title": "RÉSERVEZ UNE DÉMO GRATUITE.",
    "how.ctaBand.body":
      "Trente minutes. On la configure autour de votre usine et on fait un tour de quart en direct ensemble.",
    "how.ctaBand.button": "Réserver une Démo Gratuite",

    "stop.01.label": "Panne Mécanique",
    "stop.01.desc": "Panne ou défaillance non planifiée de l'équipement",
    "stop.02.label": "Changement de Format",
    "stop.02.desc": "Changement de produit ou d'outillage entre deux séries",
    "stop.03.label": "Manque de Matière",
    "stop.03.desc": "En attente de matières premières ou de composants",
    "stop.04.label": "Contrôle Qualité",
    "stop.04.desc": "Inspection, mesure ou attente qualité qui exige un arrêt",
    "stop.05.label": "Pause Planifiée",
    "stop.05.desc": "Repas, réunions de quart, pauses planifiées",
    "stop.06.label": "Manque d'Opérateur",
    "stop.06.desc": "En attente d'un opérateur qualifié disponible",
    "stop.07.label": "Maintenance",
    "stop.07.desc": "Activités de maintenance préventive planifiée",
    "stop.08.label": "Formation",
    "stop.08.desc": "Activités de formation des opérateurs en heures de production",
    "stop.09.label": "Pas de Production Planifiée",
    "stop.09.desc": "Temps mort planifié. Ligne non programmée pour rouler.",
    "stop.10.label": "Autre",
    "stop.10.desc": "Tout ce qui n'est pas couvert par les catégories ci-dessus",

    "roi.eyebrow": "Calculateur ROI",
    "roi.h1.line1": "COMBIEN VOUS COÛTE",
    "roi.h1.line2": "VOTRE TEMPS D'ARRÊT ?",
    "roi.sub":
      "Entrez les chiffres de votre usine. Voyez exactement ce que vos pertes OEE actuelles coûtent, et ce que les corriger remettrait dans vos poches.",
    "roi.calc.tag": "Calculateur",
    "roi.calc.title": "LES CHIFFRES DE VOTRE USINE.",
    "roi.calc.intro": "Tous les chiffres en USD. Ajustez les curseurs selon votre opération.",
    "roi.input.lines": "Lignes de production",
    "roi.input.shifts": "Quarts par jour",
    "roi.input.days": "Jours travaillés par semaine",
    "roi.input.mins": "Minutes par quart",
    "roi.input.rate": "Valeur de production",
    "roi.input.rate.hint": "Estimation : revenu horaire ÷ 60",
    "roi.input.oee": "Estimation OEE actuelle",
    "roi.input.oee.hint": "Classe mondiale c'est 85 %+. Moyenne PME 60 à 70 %.",
    "roi.target": "Amélioration OEE visée",
    "roi.losing": "Vous perdez",
    "roi.recover": "Récupérez avec +{pct} % d'OEE",
    "roi.payback.label": "Retour Easy OEE",
    "roi.payback.refLine": "Référence : Easy OEE Professional à 99 $ USD/mois (1 188 $ USD/an, 5 lignes).",
    "roi.payback.over1y": "> 1 an",
    "roi.cta": "Réserver une Démo Gratuite",

    "roi.losses.tag": "Trois types de pertes",
    "roi.losses.title": "D'OÙ VIENNENT LES PERTES OEE.",
    "roi.losses.intro": "Les trois sont mesurables. Les trois sont récupérables.",
    "roi.losses.a.title": "PERTE DE DISPONIBILITÉ",
    "roi.losses.a.body":
      "Temps d'arrêt non planifié. Pannes, changements de format trop longs, manque de matière, attente d'opérateurs ou de maintenance.",
    "roi.losses.p.title": "PERTE DE PERFORMANCE",
    "roi.losses.p.body":
      "Pertes de vitesse. Micro-arrêts trop courts pour être notés, marche sous la cadence idéale, usure d'équipement qui ralentit la ligne.",
    "roi.losses.q.title": "PERTE DE QUALITÉ",
    "roi.losses.q.body":
      "Rebuts et retouches. Pièces qui ne respectent pas les spécifications du premier coup et qui sont jetées ou doivent être réparées.",

    "pricing.eyebrow": "Tarifs",
    "pricing.h1": "SIMPLE. TRANSPARENT.",
    "pricing.sub": "Essai gratuit de 14 jours. Aucune carte de crédit requise.",
    "pricing.usdLabel": "USD",
    "pricing.cadLabel": "≈ {price} CAD",
    "pricing.perMo": "/mois",
    "pricing.starter.name": "Starter",
    "pricing.starter.desc":
      "Pour les opérations à une seule ligne qui débutent avec le suivi OEE.",
    "pricing.pro.name": "Professional",
    "pricing.pro.desc": "Le plus populaire. Pour les usines multi-lignes prêtes à optimiser.",
    "pricing.ent.name": "Enterprise",
    "pricing.ent.price": "Sur mesure",
    "pricing.ent.desc": "Pour 5+ lignes, opérations multi-usines ou besoins sur mesure.",
    "pricing.startTrial": "Démarrer l'Essai Gratuit",
    "pricing.feature.lines.starter": "1 ligne de production",
    "pricing.feature.lines.pro": "Jusqu'à 5 lignes de production",
    "pricing.feature.lines.ent": "Lignes et opérateurs illimités",
    "pricing.feature.ops.starter": "Jusqu'à 5 opérateurs",
    "pricing.feature.ops.pro": "Jusqu'à 25 comptes opérateur",
    "pricing.feature.stops": "Les 10 catégories de raisons d'arrêt",
    "pricing.feature.dash": "Tableau de bord OEE en temps réel",
    "pricing.feature.reports": "Rapports de résumé de quart",
    "pricing.feature.history90": "90 jours d'historique",
    "pricing.feature.compare": "Comparaison multi-lignes",
    "pricing.feature.supervisor": "Tableau de bord superviseur",
    "pricing.feature.csv": "Exportation CSV",
    "pricing.feature.history1y": "1 an d'historique",
    "pricing.feature.customStops": "Catégories d'arrêt personnalisées",
    "pricing.feature.multiPlant": "Tableau de bord multi-usines",
    "pricing.feature.onboarding": "Intégration dédiée",
    "pricing.feature.sla": "SLA et support prioritaire",
    "pricing.feature.unlimitedHistory": "Historique illimité",

    "contact.eyebrow": "Réserver une Démo",
    "contact.h1": "VOYEZ VOTRE VRAI OEE.",
    "contact.sub":
      "Tour de 30 minutes sur Zoom. On vous montre la plateforme avec des données d'usine d'exemple et on répond à vos questions.",
    "contact.firstName": "Prénom",
    "contact.lastName": "Nom",
    "contact.email": "Courriel professionnel",
    "contact.company": "Entreprise",
    "contact.province": "Province / État",
    "contact.numLines": "Nombre de lignes",
    "contact.method": "Méthode OEE actuelle",
    "contact.notes": "Notes (optionnel)",
    "contact.select": "Sélectionner...",
    "contact.method.none": "Pas encore de suivi",
    "contact.method.paper": "Papier ou tableau",
    "contact.method.excel": "Excel ou tableurs",
    "contact.method.mes": "MES ou système d'entreprise",
    "contact.method.other": "Autre",
    "contact.submit": "Demander une Démo",
    "contact.success.title": "DEMANDE REÇUE",
    "contact.success.body":
      "Merci. On vous contacte dans un jour ouvrable pour planifier votre démo.",
    "contact.error.invalid": "Vérifiez vos informations et réessayez.",
    "contact.error.server":
      "Quelque chose a mal tourné de notre côté. Réessayez ou écrivez-nous à hello@easy-oee.com.",

    "legal.tag": "Légal",
    "legal.lastUpdated": "Dernière mise à jour : Avril 2026",
    "legal.privacy.title": "POLITIQUE DE CONFIDENTIALITÉ",
    "legal.terms.title": "CONDITIONS D'UTILISATION",
    "legal.back": "Retour à l'accueil",

    "signin.tag": "Connexion Directeur",
    "signin.title": "CONNEXION",
    "signin.subtitle":
      "Connectez-vous pour voir le tableau de bord, la configuration des lignes et l'historique des quarts.",
    "signin.email": "Courriel",
    "signin.password": "Mot de passe",
    "signin.continueGoogle": "Continuer avec Google",
    "signin.continueMicrosoft": "Continuer avec Microsoft",
    "signin.orEmail": "ou connectez-vous par courriel",
    "signin.submit": "CONNEXION",
    "signin.submitting": "Connexion en cours...",
    "signin.forgot": "Mot de passe oublié ?",
    "signin.operatorPrompt": "Vous êtes opérateur sur le plancher ?",
    "signin.operatorLink": "Connexion par NIP",
    "signin.back": "Retour à easy-oee.com",
    "signin.errEmpty": "Entrez votre mot de passe.",
    "signin.errWrong": "Mot de passe incorrect.",

    "pin.tag": "Connexion Opérateur",
    "pin.title": "CHOISISSEZ VOTRE NOM",
    "pin.subtitle": "Puis entrez votre NIP à 4 chiffres.",
    "pin.operator": "Opérateur",
    "pin.signIn": "CONNEXION",
    "pin.signingIn": "Connexion…",
    "pin.errNotFound": "Opérateur introuvable",
    "pin.errWrongPin": "NIP incorrect",

    "operator.tag": "Opérateur",
    "operator.title": "DÉMARRER UN QUART",
    "operator.signedInAs": "Connecté en tant que",
    "operator.signOut": "Déconnexion",
    "operator.line": "Ligne de Production",
    "operator.shift": "Quart",
    "operator.shift.morning": "Matin",
    "operator.shift.afternoon": "Après-midi",
    "operator.shift.night": "Nuit",
    "operator.product": "Produit",
    "operator.productPlaceholder": "ex. Widget A",
    "operator.plannedMinutes": "Minutes Planifiées",
    "operator.start": "DÉMARRER LE QUART",
    "operator.managerLink": "Tableau de bord directeur",

    "shift.live": "QUART EN COURS",
    "shift.running": "EN MARCHE",
    "shift.stopped": "ARRÊTÉ",
    "shift.goodParts": "Pièces Bonnes",
    "shift.badParts": "Pièces Mauvaises",
    "shift.tapHint": "Touchez une raison pour enregistrer un arrêt. Touchez encore pour reprendre.",
    "shift.endShift": "TERMINER LE QUART",
    "shift.ending": "EN TRAIN DE TERMINER…",
    "shift.confirmEnd": "Terminer ce quart ? L'OEE final sera calculé et sauvegardé.",
    "shift.totalProduced": "Total produit",
    "shift.planned": "Planifié",
    "shift.idealRate": "Cadence idéale",
    "shift.elapsed": "Écoulé",
    "shift.startedAt": "Début",
    "shift.projectedEnd": "Fin Prévue",
    "shift.totalStops": "Temps d'Arrêt",
    "shift.liveOee": "OEE en Direct",
    "shift.target": "Objectif",
    "shift.currentStop": "Arrêt en Cours",
    "shift.handoff": "Passer le Relais",
    "shift.handoff.title": "Passer à un autre opérateur",
    "shift.handoff.body": "Le prochain opérateur choisit son nom et tape son NIP. Le quart continue sous son nom.",
    "shift.handoff.pick": "Choisir un opérateur",
    "shift.handoff.confirm": "Confirmer le Relais",
    "shift.handoff.cancel": "Annuler",
    "shift.handoff.none": "Aucun autre opérateur actif sur ce compte.",
    "shift.longStop.title": "Arrêt long — une note rapide ?",
    "shift.longStop.body": "Cet arrêt a duré {minutes} minutes pour {reason}. Laissez une note pour que l'équipe sache ce qui s'est passé.",
    "shift.longStop.placeholder": "ex. roulement gauche remplacé, plus de bouchons",
    "shift.longStop.save": "Sauvegarder",
    "shift.longStop.skip": "Passer",

    "summary.tag": "Quart Terminé",
    "summary.title": "RÉSUMÉ DU QUART",
    "summary.overallOee": "OEE Global",
    "summary.availability": "Disponibilité",
    "summary.performance": "Performance",
    "summary.quality": "Qualité",
    "summary.production": "Détails de Production",
    "summary.downtime": "Événements d'Arrêt",
    "summary.noStops": "Aucun arrêt enregistré.",
    "summary.startNew": "DÉMARRER UN NOUVEAU QUART",
    "summary.dashboard": "TABLEAU DE BORD",
    "summary.row.good": "Pièces bonnes",
    "summary.row.bad": "Pièces mauvaises",
    "summary.row.total": "Total des pièces",
    "summary.row.planned": "Minutes planifiées",
    "summary.row.stop": "Minutes d'arrêt",
    "summary.row.run": "Minutes de marche",
    "summary.row.ideal": "Cadence idéale",
    "summary.col.reason": "Raison",
    "summary.col.started": "Démarré",
    "summary.col.minutes": "Minutes",
    "summary.lossTree": "Où Le Temps Est Allé",
    "summary.lossTree.help": "Toutes les minutes planifiées réparties entre la production utile, les pertes de qualité (pièces mauvaises), les pertes de vitesse (sous la cadence idéale) et les arrêts.",
    "summary.loss.good": "Production Bonne",
    "summary.loss.quality": "Perte de Qualité",
    "summary.loss.speed": "Perte de Vitesse",
    "summary.loss.down": "Temps d'Arrêt",

    "export.title": "Exporter ce quart",
    "export.csv": "Télécharger CSV",
    "export.print": "Imprimer ou sauvegarder en PDF",
    "export.email": "Envoyer par courriel",
    "export.emailLabel": "Envoyer à",
    "export.send": "ENVOYER",
    "export.sending": "Envoi en cours...",

    "dashboard.tag": "Tableau de Bord",
    "dashboard.title": "AUJOURD'HUI",
    "dashboard.startShift": "DÉMARRER UN QUART",
    "dashboard.todaysOee": "OEE d'Aujourd'hui",
    "dashboard.todaysOee.sub": "(moyenne de {n} quarts terminés)",
    "dashboard.liveShifts": "Quarts en Cours",
    "dashboard.recentShifts": "Quarts Récents",
    "dashboard.topStops": "Principales Raisons d'Arrêt (7 derniers jours)",
    "dashboard.noLive": "Aucun quart en cours.",
    "dashboard.noRecent": "Aucun quart terminé pour le moment.",
    "dashboard.noStops": "Aucun arrêt enregistré.",
    "dashboard.live": "EN COURS",
    "dashboard.done": "TERMINÉ",
    "dashboard.col.line": "Ligne",
    "dashboard.col.operator": "Opérateur",
    "dashboard.col.shift": "Quart",
    "dashboard.col.parts": "Pièces",
    "dashboard.col.started": "Démarré",
    "dashboard.col.date": "Date",
    "dashboard.col.product": "Produit",
    "dashboard.col.good": "Bonnes",
    "dashboard.col.bad": "Mauvaises",
    "dashboard.col.status": "Statut",
    "dashboard.shiftCompare": "Comparaison des Quarts (7 derniers jours)",
    "dashboard.shiftCompare.shift": "quart",
    "dashboard.shiftCompare.shifts": "quarts",

    "admin.lines.tag": "Gestion",
    "admin.lines.title": "LIGNES DE PRODUCTION",
    "admin.lines.intro":
      "Ajoutez les lignes ou machines de votre plancher et leur cadence idéale en pièces par minute.",
    "admin.lines.add": "Ajouter une ligne",
    "admin.lines.namePlaceholder": "Machine 3",
    "admin.lines.ratePlaceholder": "cadence idéale (pièces/min)",
    "admin.lines.count1": "{n} ligne",
    "admin.lines.count": "{n} lignes",
    "admin.lines.empty": "Aucune ligne pour le moment.",

    "admin.ops.tag": "Gestion",
    "admin.ops.title": "OPÉRATEURS",
    "admin.ops.intro":
      "Ajoutez des opérateurs à votre entreprise. Chacun reçoit un NIP à 4 chiffres pour se connecter sur /pin.",
    "admin.ops.add": "Ajouter un opérateur",
    "admin.ops.namePlaceholder": "Nom complet",
    "admin.ops.pinPlaceholder": "NIP à 4 chiffres",
    "admin.ops.newPin": "Nouveau NIP (optionnel)",
    "admin.ops.newPinPlaceholder": "laisser vide",
    "admin.ops.count1": "{n} opérateur",
    "admin.ops.count": "{n} opérateurs",
    "admin.ops.empty": "Aucun opérateur pour le moment.",

    "admin.shifts.tag": "Historique",
    "admin.shifts.title": "TOUS LES QUARTS",
    "admin.shifts.sub": "Les 100 quarts les plus récents.",
    "admin.shifts.empty": "Aucun quart pour le moment.",

    "mgr.nav.dashboard": "Tableau de Bord",
    "mgr.nav.shifts": "Quarts",
    "mgr.nav.lines": "Lignes",
    "mgr.nav.operators": "Opérateurs",
    "mgr.nav.startShift": "Démarrer un Quart",
    "mgr.nav.signOut": "Déconnexion",

    "common.signOut": "Déconnexion",
    "common.save": "Enregistrer",
    "common.add": "AJOUTER",
    "common.deactivate": "Désactiver",
    "common.active": "actif",
    "common.name": "Nom",
    "common.idealRate": "Cadence Idéale",
    "common.status": "Statut",
    "common.back": "Retour",
  },
};

export function t(locale: Locale, key: string): string {
  return dictionaries[locale]?.[key] ?? dictionaries.en[key] ?? key;
}
