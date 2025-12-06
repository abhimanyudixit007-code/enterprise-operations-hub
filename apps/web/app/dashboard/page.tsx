'use client';

import { useState } from 'react';
import { 
  Activity, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  TrendingUp,
  Users,
  FileText,
  Workflow
} from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-900">Operations Command Center</h1>
            <div className="flex items-center gap-4">
              <button className="px-4 py-2 text-slate-600 hover:text-slate-900">
                <Activity className="w-5 h-5" />
              </button>
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                AD
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* KPI Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <KPICard
            title="Active Workflows"
            value="24"
            change="+12%"
            icon={<Workflow className="w-6 h-6 text-blue-600" />}
            trend="up"
          />
          <KPICard
            title="Pending Approvals"
            value="8"
            change="-5%"
            icon={<Clock className="w-6 h-6 text-yellow-600" />}
            trend="down"
          />
          <KPICard
            title="Completed Today"
            value="156"
            change="+23%"
            icon={<CheckCircle className="w-6 h-6 text-green-600" />}
            trend="up"
          />
          <KPICard
            title="SLA Compliance"
            value="98.5%"
            change="+2.1%"
            icon={<TrendingUp className="w-6 h-6 text-purple-600" />}
            trend="up"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Workflows */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Workflow Executions</h2>
            <div className="space-y-3">
              <WorkflowItem
                name="Invoice Approval - INV-2024-001"
                status="completed"
                time="2 minutes ago"
                assignee="Finance Team"
              />
              <WorkflowItem
                name="Employee Onboarding - John Doe"
                status="in-progress"
                time="15 minutes ago"
                assignee="HR Team"
              />
              <WorkflowItem
                name="Purchase Request - Office Supplies"
                status="pending-approval"
                time="1 hour ago"
                assignee="Procurement"
              />
              <WorkflowItem
                name="Incident Resolution - IT-2024-042"
                status="in-progress"
                time="2 hours ago"
                assignee="IT Team"
              />
              <WorkflowItem
                name="Contract Review - Vendor Agreement"
                status="completed"
                time="3 hours ago"
                assignee="Legal Team"
              />
            </div>
          </div>

          {/* Pending Approvals */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Pending Approvals</h2>
            <div className="space-y-3">
              <ApprovalItem
                title="Invoice #2024-156"
                amount="$12,450"
                priority="high"
                dueIn="2 hours"
              />
              <ApprovalItem
                title="Purchase Order #PO-891"
                amount="$5,200"
                priority="medium"
                dueIn="1 day"
              />
              <ApprovalItem
                title="Expense Report - Travel"
                amount="$3,800"
                priority="low"
                dueIn="3 days"
              />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid md:grid-cols-4 gap-4">
          <QuickAction icon={<Workflow />} label="Create Workflow" />
          <QuickAction icon={<FileText />} label="Upload Document" />
          <QuickAction icon={<Users />} label="Manage Team" />
          <QuickAction icon={<Activity />} label="View Analytics" />
        </div>
      </div>
    </div>
  );
}

function KPICard({ title, value, change, icon, trend }: any) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-slate-600">{title}</span>
        {icon}
      </div>
      <div className="text-3xl font-bold text-slate-900 mb-1">{value}</div>
      <div className={`text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
        {change} from last week
      </div>
    </div>
  );
}

function WorkflowItem({ name, status, time, assignee }: any) {
  const statusColors: any = {
    'completed': 'bg-green-100 text-green-800',
    'in-progress': 'bg-blue-100 text-blue-800',
    'pending-approval': 'bg-yellow-100 text-yellow-800'
  };

  return (
    <div className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition">
      <div className="flex-1">
        <div className="font-medium text-slate-900">{name}</div>
        <div className="text-sm text-slate-500">{assignee} • {time}</div>
      </div>
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}>
        {status.replace('-', ' ')}
      </span>
    </div>
  );
}

function ApprovalItem({ title, amount, priority, dueIn }: any) {
  const priorityColors: any = {
    'high': 'text-red-600',
    'medium': 'text-yellow-600',
    'low': 'text-green-600'
  };

  return (
    <div className="p-3 border border-slate-200 rounded-lg hover:border-blue-300 transition cursor-pointer">
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium text-slate-900">{title}</span>
        <AlertCircle className={`w-4 h-4 ${priorityColors[priority]}`} />
      </div>
      <div className="text-lg font-bold text-slate-900 mb-1">{amount}</div>
      <div className="text-xs text-slate-500">Due in {dueIn}</div>
    </div>
  );
}

function QuickAction({ icon, label }: any) {
  return (
    <button className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition border border-slate-200 hover:border-blue-300">
      <div className="text-blue-600">{icon}</div>
      <span className="font-medium text-slate-900">{label}</span>
    </button>
  );
}
