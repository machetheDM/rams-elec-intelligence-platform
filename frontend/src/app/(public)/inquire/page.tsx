import InquiryForm from "@/components/inquiry/InquiryForm";

export const metadata = {
  title: "Get an Instant Quote | Rams @Elec",
  description: "Describe your problem and our AI will provide an instant cost estimate and match you with the right technician.",
};

export default function InquirePage() {
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-xs font-semibold text-brand-400 uppercase tracking-widest">
            AI-Powered Quoting
          </span>
          <h1 className="mt-3 text-4xl sm:text-5xl font-bold text-white">
            Get an Instant Quote
          </h1>
          <p className="mt-4 text-industrial-400 max-w-xl mx-auto">
            Describe your problem. Our AI analyses your request, estimates costs, and matches you with the best technician — in seconds.
          </p>
        </div>
        <InquiryForm />
      </div>
    </div>
  );
}
