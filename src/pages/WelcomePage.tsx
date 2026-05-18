import { Database, ShieldCheck, Layers, ArrowRight } from "lucide-react";

export const WelcomePage = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-6">
          Next-Generation <br />
          <span className="text-[var(--color-primary)]">Metadata Engine</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-600 mb-8">
          A powerful, dynamic library management system built with Clean
          Architecture, CQRS, and an advanced metadata processing engine.
        </p>
        <div className="flex justify-center gap-4">
          <button className="bg-[var(--color-primary)] text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition flex items-center gap-2">
            Explore Library <ArrowRight size={20} />
          </button>
          <button className="bg-white text-gray-700 border border-gray-300 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition">
            Librarian Login
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mt-12">
        <FeatureCard
          icon={<Database size={32} className="text-[var(--color-primary)]" />}
          title="Dynamic Metadata Engine"
          description="Support for global vocabularies like Dublin Core. Define properties dynamically without static database columns."
        />
        <FeatureCard
          icon={<Layers size={32} className="text-[var(--color-primary)]" />}
          title="Clean Architecture & CQRS"
          description="Robust backend logic separating read and write operations using MediatR and AutoMapper for optimal performance."
        />
        <FeatureCard
          icon={
            <ShieldCheck size={32} className="text-[var(--color-primary)]" />
          }
          title="Secure Authentication"
          description="Role-based access control (Admin, Librarian, User) powered by JWT and ASP.NET Identity."
        />
      </div>
    </div>
  );
};

const FeatureCard = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => (
  <div className="bg-white p-6 rounded-2xl border shadow-sm hover:shadow-md transition">
    <div className="mb-4 bg-blue-50 w-16 h-16 rounded-xl flex items-center justify-center">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600 leading-relaxed">{description}</p>
  </div>
);
