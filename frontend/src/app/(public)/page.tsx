import Link from "next/link";
import InquiryForm from "@/components/inquiry/InquiryForm";
import LoadSheddingWidget from "@/components/loadshedding/LoadSheddingWidget";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* ================================================================ */}
      {/* HERO                                                              */}
      {/* ================================================================ */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-industrial-950">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(245,158,11,0.08),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(245,158,11,0.04),transparent_50%)]" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-500/30 to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 lg:py-40">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500/10 border border-brand-500/20 rounded-full mb-8">
                <span className="w-2 h-2 bg-brand-500 rounded-full animate-pulse" />
                <span className="text-xs font-semibold text-brand-400 uppercase tracking-wider">
                  15 Years Mastery
                </span>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-[1.05] tracking-tight">
                Engineering
                <br />
                <span className="gradient-text">Reliability.</span>
              </h1>

              <p className="mt-6 text-lg text-industrial-400 max-w-lg leading-relaxed">
                South Africa&apos;s most advanced electrical and refrigeration services — now with
                AI-powered instant quoting, real-time load-shedding intelligence, and 24/7
                emergency response across Gauteng and Limpopo.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/inquire" className="btn-primary text-lg">
                  Get an Instant Quote
                  <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <a href="tel:+27711018493" className="btn-outline text-lg">
                  <svg className="mr-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Emergency Line
                </a>
              </div>

              <div className="mt-10 flex flex-wrap items-center gap-6 text-sm text-industrial-500">
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-brand-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  SANS 10142 Certified
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-brand-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Fully Insured
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-brand-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  24/7 Emergency
                </span>
              </div>
            </div>

            <div className="animate-slide-up lg:pl-8">
              <LoadSheddingWidget />
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-industrial-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* ================================================================ */}
      {/* AI INQUIRY WIDGET                                                 */}
      {/* ================================================================ */}
      <section id="inquire" className="relative -mt-20 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <span className="text-xs font-semibold text-brand-400 uppercase tracking-widest">
              AI-Powered Intelligence
            </span>
            <h2 className="mt-2 text-2xl font-bold text-white">
              Describe Your Problem. Get an Instant Estimate.
            </h2>
          </div>
          <InquiryForm />
        </div>
      </section>

      {/* ================================================================ */}
      {/* INDUSTRIAL MASTERY                                                */}
      {/* ================================================================ */}
      <section id="about" className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-xs font-semibold text-brand-400 uppercase tracking-widest">
                Industrial Mastery
              </span>
              <h2 className="mt-3 section-heading">
                We don&apos;t just fix wires;
                <br />
                <span className="gradient-text">we engineer safety.</span>
              </h2>
              <p className="mt-6 text-industrial-400 leading-relaxed">
                At Rams @Elec, we translate complex technical requirements into elegant,
                high-performance systems. Our team doesn&apos;t just install — we engineer
                environments where businesses thrive and homes remain safe for the next decade.
              </p>

              <div className="mt-8 grid grid-cols-2 gap-4">
                <StatCard value="15+" label="Years Experience" />
                <StatCard value="8" label="Service Zones" />
                <StatCard value="5" label="Master Technicians" />
                <StatCard value="24/7" label="Emergency Response" />
              </div>
            </div>

            <div className="space-y-4">
              <FeatureCard
                icon={<BoltIcon />}
                title="Rapid Deployment"
                description="Dedicated task force for critical system failures. Response within 1 hour for emergencies."
              />
              <FeatureCard
                icon={<ShieldIcon />}
                title="Compliance Shield"
                description="Every installation exceeds SANS 10142 regulations. Full documentation provided for insurance and audits."
              />
              <FeatureCard
                icon={<BrainIcon />}
                title="AI-Powered Intelligence"
                description="Instant cost estimates based on 60+ historical jobs. Not guesswork — data-driven precision."
              />
              <FeatureCard
                icon={<PowerIcon />}
                title="Load-Shedding Experts"
                description="Surge protection, backup power, and generator solutions engineered for South African conditions."
              />
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* THE RISK OF MEDIOCRITY                                            */}
      {/* ================================================================ */}
      <section className="py-24 bg-industrial-900/50 border-y border-industrial-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-xs font-semibold text-red-400 uppercase tracking-widest">
                The Risk of Mediocrity
              </span>
              <h2 className="mt-3 text-3xl font-bold text-white">
                Electrical failure accounts for a significant percentage of property damage.
              </h2>
              <p className="mt-4 text-industrial-400 leading-relaxed">
                We ensure your infrastructure meets modern SANS regulations through documented
                mastery. Every installation is tested, verified, and guaranteed for peak
                performance.
              </p>
              <div className="mt-6">
                <Link href="/inquire" className="btn-primary">
                  Initiate Audit
                  <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <RiskCard icon={<FireIcon />} stat="40%" label="Electrical fires from faulty wiring" />
              <RiskCard icon={<BoltIcon />} stat="R2.4B" label="Annual surge damage in SA" />
              <RiskCard icon={<SnowflakeIcon />} stat="R850K" label="Avg cold room failure loss" />
              <RiskCard icon={<ClipboardIcon />} stat="68%" label="Properties fail compliance audit" />
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* EXPERT SOLUTIONS                                                  */}
      {/* ================================================================ */}
      <section id="solutions" className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-xs font-semibold text-brand-400 uppercase tracking-widest">
              Expert Solutions
            </span>
            <h2 className="mt-3 section-heading">Professional Mastery</h2>
            <p className="mt-4 section-subheading mx-auto">
              Comprehensive electrical, refrigeration, and cooling services where reliability is non-negotiable.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ServiceCard
              icon={<BoltIcon />}
              title="Electrical"
              items={["Distribution Boards", "Compliance Audits", "Industrial Wiring", "Surge Protection"]}
              href="/services"
            />
            <ServiceCard
              icon={<CubeIcon />}
              title="Refrigeration"
              items={["Cold Room Installation", "Cold Room Repair", "HVAC Systems", "Preventative Maintenance"]}
              href="/services"
            />
            <ServiceCard
              icon={<ClockIcon />}
              title="24/7 Emergency"
              items={["Power Failures", "Cold Room Breakdowns", "Critical Failures", "1-Hour Response"]}
              href="tel:+27711018493"
            />
          </div>

          <div className="text-center mt-10">
            <Link href="/services" className="btn-outline">
              View Full Catalog
              <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* CTA                                                               */}
      {/* ================================================================ */}
      <section className="py-24 bg-gradient-to-b from-industrial-950 to-industrial-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-semibold text-brand-400 uppercase tracking-widest">
            Direct Mastery Link
          </span>
          <h2 className="mt-3 text-4xl sm:text-5xl font-bold text-white">
            Ready to Engineer Safety?
          </h2>
          <p className="mt-4 text-industrial-400 text-lg max-w-xl mx-auto">
            Submit your technical scope and let our AI-powered platform match you with the right
            technician — with an instant cost estimate.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/inquire" className="btn-primary text-lg">
              Launch Inquiry Portal
              <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <a href="tel:+27711018493" className="btn-emergency text-lg">
              <svg className="mr-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Call Task Force
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

/* =================================================================== */
/* Icons                                                               */
/* =================================================================== */

function BoltIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}

function BrainIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  );
}

function PowerIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
    </svg>
  );
}

function CubeIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

/* =================================================================== */
/* Sub-components                                                       */
/* =================================================================== */

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="card-glow text-center">
      <span className="text-2xl font-extrabold text-brand-500">{value}</span>
      <p className="text-xs text-industrial-400 mt-1">{label}</p>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="card-glow flex gap-4">
      <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl bg-brand-500/10 text-brand-500">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-white">{title}</h3>
        <p className="text-sm text-industrial-400 mt-1">{description}</p>
      </div>
    </div>
  );
}

function RiskCard({ icon, stat, label }: { icon: React.ReactNode; stat: string; label: string }) {
  return (
    <div className="bg-industrial-950 border border-industrial-800 rounded-2xl p-5 text-center hover:border-red-800/50 transition-all duration-300">
      <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-red-500/10 text-red-400 mx-auto">{icon}</span>
      <p className="mt-2 text-2xl font-extrabold text-red-400">{stat}</p>
      <p className="text-xs text-industrial-500 mt-1">{label}</p>
    </div>
  );
}

function FireIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
    </svg>
  );
}

function SnowflakeIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  );
}

function ClipboardIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  );
}

function ServiceCard({ icon, title, items, href }: { icon: React.ReactNode; title: string; items: string[]; href: string }) {
  return (
    <Link href={href} className="card-glow group block">
      <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-brand-500/10 text-brand-500 group-hover:bg-brand-500 group-hover:text-white transition-all duration-300">
        {icon}
      </div>
      <h3 className="mt-5 text-xl font-bold text-white group-hover:text-brand-400 transition-colors">
        {title}
      </h3>
      <ul className="mt-4 space-y-2">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-2 text-sm text-industrial-400">
            <svg className="w-4 h-4 text-brand-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {item}
          </li>
        ))}
      </ul>
      <div className="mt-6 flex items-center text-sm font-semibold text-brand-500 group-hover:text-brand-400 transition-colors">
        Learn more
        <svg className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
}
