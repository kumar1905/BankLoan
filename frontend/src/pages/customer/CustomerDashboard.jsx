import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { LogOut, Calculator, FileText, UserCircle } from 'lucide-react';
import EligibilityCheck from './EligibilityCheck';
import ApplicationForm from './ApplicationForm';
import CustomerProfile from './CustomerProfile';

export default function CustomerDashboard() {
    const { user, logout } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('profile');

    const navItems = [
        { id: 'profile', label: 'My Profile & Loans', icon: UserCircle },
        { id: 'eligibility', label: 'Check Eligibility', icon: Calculator },
        { id: 'apply', label: 'Apply for Loan', icon: FileText },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar */}
            <div className="w-64 bg-white shadow-xl border-r border-slate-100 flex flex-col">
                <div className="h-16 flex items-center px-6 border-b border-slate-100">
                    <h1 className="text-xl font-bold text-slate-900">Customer Portal</h1>
                </div>
                <div className="flex-1 py-6 flex flex-col gap-1 px-3">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === item.id
                                        ? 'bg-blue-50 text-blue-700'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                            >
                                <Icon className={`w-5 h-5 mr-3 ${activeTab === item.id ? 'text-blue-700' : 'text-slate-400'}`} />
                                {item.label}
                            </button>
                        );
                    })}
                </div>
                <div className="p-4 border-t border-slate-100">
                    <div className="mb-4 px-3">
                        <p className="text-sm font-medium text-slate-900">{user?.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                    </div>
                    <button
                        onClick={logout}
                        className="flex items-center w-full px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                    >
                        <LogOut className="w-5 h-5 mr-3 text-red-500" />
                        Logout
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto">
                <div className="p-8 max-w-5xl mx-auto">
                    {activeTab === 'profile' && <CustomerProfile />}
                    {activeTab === 'eligibility' && <EligibilityCheck onEligible={() => setActiveTab('apply')} />}
                    {activeTab === 'apply' && <ApplicationForm onSuccess={() => setActiveTab('profile')} />}
                </div>
            </div>
        </div>
    );
}
