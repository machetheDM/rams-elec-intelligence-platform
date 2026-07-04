import Link from "next/link";

const SERVICES = [
  {
    category: "Electrical",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    items: [
      { name: "Distribution Board Upgrade", cost: "R3,500 – R15,000", response: "1–2 days", desc: "Replace outdated fuse boxes with modern circuit breaker panels. Includes labelling, earth leakage, and surge protection." },
      { name: "Electrical Compliance Audit", cost: "R1,800 – R6,500", response: "2–4 hours", desc: "Full SANS 10142 inspection with detailed report. Required for property sales, insurance, and licensing." },
      { name: "Industrial Wiring", cost: "R5,000 – R35,000", response: "2–5 days", desc: "Three-phase installations for factories, warehouses, and commercial buildings." },
      { name: "Surge Protection Installation", cost: "R1,800 – R8,500", response: "Same day", desc: "Whole-building surge protection against load-shedding spikes and lightning." },
    ],
  },
  {
    category: "Refrigeration & HVAC",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    items: [
      { name: "Cold Room Installation", cost: "R15,000 – R85,000", response: "3–10 days", desc: "Custom-engineered cold rooms for warehouses, supermarkets, and pharmaceutical storage." },
      { name: "Cold Room Repair", cost: "R2,500 – R18,000", response: "2–6 hours", desc: "Compressor replacement, refrigerant recharge, thermostat and door seal repair." },
      { name: "HVAC Installation", cost: "R8,000 – R45,000", response: "1–3 days", desc: "Split units, multi-split, and ducted air conditioning for offices and retail." },
      { name: "HVAC Maintenance", cost: "R1,200 – R4,500", response: "1–2 hours", desc: "Filter replacement, coil cleaning, gas recharge, and drainage check." },
    ],
  },
  {
    category: "Emergency & Backup Power",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    items: [
      { name: "Emergency Electrical Repair", cost: "R900 – R7,500", response: "1 hour", desc: "24/7 response for power failures, tripping breakers, sparking outlets, and faults." },
      { name: "Generator Installation", cost: "R12,000 – R95,000", response: "1–3 days", desc: "Full installation with changeover switch and automatic transfer switch options." },
      { name: "Generator Service", cost: "R1,500 – R5,000", response: "2–4 hours", desc: "Oil change, filter replacement, battery test, and load test every 6 months." },
      { name: "Preventative Maintenance", cost: "R900 – R3,000", response: "1–2 hours", desc: "Quarterly or bi-annual servicing for all electrical and refrigeration equipment." },
    ],
  },
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-xs font-semibold text-brand-400 uppercase tracking-widest">
            Expert Solutions
          </span>
          <h1 className="mt-3 text-4xl sm:text-5xl font-bold text-white">
            Engineering Reliability
          </h1>
          <p className="mt-4 text-industrial-400 max-w-xl mx-auto">
            Comprehensive electrical and refrigeration services where failure is not an option.
            All pricing is indicative — get an exact quote via our AI-powered inquiry form.
          </p>
        </div>

        <div className="space-y-20">
          {SERVICES.map((section) => (
            <div key={section.category}>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-brand-500/10 text-brand-500">
                  {section.icon}
                </div>
                <h2 className="text-2xl font-bold text-white">{section.category}</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {section.items.map((item) => (
                  <div
                    key={item.name}
                    className="card-glow group"
                  >
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-white group-hover:text-brand-400 transition-colors">
                        {item.name}
                      </h3>
                      <span className="text-xs px-2.5 py-1 rounded-full bg-industrial-800 text-industrial-400 border border-industrial-700">
                        {item.response}
                      </span>
                    </div>
                    <p className="text-sm text-industrial-400 mt-2 leading-relaxed">{item.desc}</p>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-industrial-800">
                      <span className="text-sm font-semibold text-brand-500">{item.cost}</span>
                      <Link
                        href="/inquire"
                        className="text-sm font-medium text-brand-500 hover:text-brand-400 transition-colors flex items-center gap-1"
                      >
                        Get Quote
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Emergency CTA */}
        <div className="mt-20 p-8 bg-red-950/30 rounded-2xl border border-red-900/50 text-center">
          <div className="w-14 h-14 mx-auto flex items-center justify-center rounded-2xl bg-red-500/10 text-red-400 mb-4">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-red-400">Emergency?</h2>
          <p className="text-red-300/70 mt-2 max-w-md mx-auto">
            For critical failures, power outages, or cold room breakdowns — call our 24/7 task force now.
          </p>
          <a
            href="tel:+27711018493"
            className="btn-emergency mt-6"
          >
            <svg className="mr-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            +27 71 101 8493
          </a>
        </div>
      </div>
    </div>
  );
}
