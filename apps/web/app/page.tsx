import Link from 'next/link';
import { ArrowRight, Workflow, Shield, Zap, BarChart3, FileText, Users } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-6xl font-bold text-slate-900 mb-6">
            Enterprise Operations Hub
          </h1>
          <p className="text-xl text-slate-600 mb-8">
            A unified, AI-augmented operations platform that centralizes processes, automations, 
            knowledge, and real-time analytics so large companies can run fewer systems, 
            reduce process drift, and scale cross-team workflows.
          </p>
          <div className="flex gap-4 justify-center">
            <Link 
              href="/dashboard"
              className="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition flex items-center gap-2"
            >
              Get Started <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              href="/demo"
              className="px-8 py-4 bg-white text-slate-900 rounded-lg font-semibold hover:bg-slate-50 transition border border-slate-200"
            >
              Watch Demo
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-20">
          <FeatureCard
            icon={<Workflow className="w-8 h-8 text-blue-600" />}
            title="Process Automation"
            description="Automate recurring operational processes with safe approvals - finance close, purchase requests, onboarding, incident resolution."
          />
          <FeatureCard
            icon={<Shield className="w-8 h-8 text-green-600" />}
            title="Enterprise Security"
            description="Audit trails, SLAs, and enterprise-grade security/compliance built-in. SOC 2, GDPR, and HIPAA compliant."
          />
          <FeatureCard
            icon={<Zap className="w-8 h-8 text-yellow-600" />}
            title="AI-Powered Intelligence"
            description="Document intelligence and RPA-style connectors - extract invoices, route approvals automatically."
          />
          <FeatureCard
            icon={<BarChart3 className="w-8 h-8 text-purple-600" />}
            title="Real-time Analytics"
            description="Built-in analytics and alerts for KPIs, plus an 'ops command center' dashboard."
          />
          <FeatureCard
            icon={<FileText className="w-8 h-8 text-red-600" />}
            title="Unified Platform"
            description="Replaces dozens of siloed point tools - eliminates manual handoffs between ERP/CRM/HR/Support."
          />
          <FeatureCard
            icon={<Users className="w-8 h-8 text-indigo-600" />}
            title="Cross-team Collaboration"
            description="Built for COO, IT/SRE, Finance, HR, and Legal teams to work together seamlessly."
          />
        </div>

        {/* Stats Section */}
        <div className="mt-20 bg-white rounded-2xl shadow-xl p-12">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <StatCard number="10x" label="Faster Process Execution" />
            <StatCard number="75%" label="Reduction in Manual Work" />
            <StatCard number="99.9%" label="Uptime SLA" />
            <StatCard number="50+" label="Pre-built Integrations" />
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Ready to transform your operations?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join leading enterprises using EOH to streamline their operations
          </p>
          <Link 
            href="/signup"
            className="inline-block px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-slate-50 transition"
          >
            Start Free Trial
          </Link>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600">{description}</p>
    </div>
  );
}

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div>
      <div className="text-4xl font-bold text-blue-600 mb-2">{number}</div>
      <div className="text-slate-600">{label}</div>
    </div>
  );
}
