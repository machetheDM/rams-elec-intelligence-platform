import Link from "next/link";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="bg-industrial-950 border-t border-industrial-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <Logo className="h-10 w-auto" />
            </Link>
            <p className="text-industrial-400 text-sm leading-relaxed">
              15+ Years of industrial strength mastery. We provide knowledge-led electrical and
              refrigeration engineering where safety and compliance are non-negotiable.
            </p>
            <div className="flex items-center gap-4 mt-4">
              <span className="text-xs text-industrial-500 font-medium px-3 py-1 bg-industrial-900 rounded-full border border-industrial-800">
                24/7 Resilience
              </span>
              <span className="text-xs text-industrial-500 font-medium px-3 py-1 bg-industrial-900 rounded-full border border-industrial-800">
                SANS Compliant
              </span>
            </div>
          </div>

          {/* Expert Solutions */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              Expert Solutions
            </h4>
            <ul className="space-y-2.5">
              {[
                "Cold Room Installation",
                "HVAC Design & AC",
                "Electrical Grid Management",
                "Industrial Maintenance",
                "24/7 Emergency Repairs",
              ].map((item) => (
                <li key={item}>
                  <Link
                    href="/services"
                    className="text-industrial-400 hover:text-brand-400 text-sm transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Command Center */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              Command Center
            </h4>
            <ul className="space-y-2.5 text-sm text-industrial-400">
              <li>Mogaladi stand 287B, Polokwane Mankweng</li>
              <li>
                <a href="tel:+27711018493" className="hover:text-brand-400 transition-colors">
                  +27 71 101 8493
                </a>
              </li>
              <li>
                <a href="mailto:ramsatelec@gmail.com" className="hover:text-brand-400 transition-colors">
                  ramsatelec@gmail.com
                </a>
              </li>
            </ul>
          </div>

          {/* Operations */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              Operations
            </h4>
            <ul className="space-y-2.5 text-sm text-industrial-400">
              <li>Mon – Fri: 08:00 – 18:00</li>
              <li>Saturday: 09:00 – 16:00</li>
              <li>Sunday: Emergency Task Force</li>
            </ul>
            <div className="mt-6">
              <Link href="/inquire" className="btn-primary text-sm !px-5 !py-2.5 w-full">
                Get Free Quote
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-industrial-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-industrial-500 text-xs">
            © 2026 Rams @Elec • Industrial Mastery • SANS Compliant
          </p>
          <p className="text-industrial-600 text-xs">
            Powered by AI Intelligence Platform
          </p>
        </div>
      </div>
    </footer>
  );
}
