import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import { LogOut, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function ManagerDashboard() {
    const { user, logout } = useContext(AuthContext);
    const [loans, setLoans] = useState([]);
    const [filter, setFilter] = useState('SUBMITTED');
    const [loading, setLoading] = useState(true);
    const [reviewReason, setReviewReason] = useState('');
    const [selectedLoan, setSelectedLoan] = useState(null);

    useEffect(() => {
        fetchLoans();
    }, [filter]);

    const fetchLoans = async () => {
        try {
            setLoading(true);
            const endpoint = filter === 'ALL' ? '/api/manager/loans' : '/api/manager/loans/submitted';
            const response = await api.get(endpoint);
            setLoans(response.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleReview = async (id, decision) => {
        try {
            await api.put(`/api/manager/loans/${id}/review`, {
                decision,
                reason: decision === 'REJECTED' ? reviewReason : ''
            });
            setSelectedLoan(null);
            setReviewReason('');
            fetchLoans();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to review loan');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <nav className="bg-white shadow border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-bold text-slate-900">Manager Dashboard</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-sm font-medium text-slate-500">Welcome, {user?.name}</span>
                            <button
                                onClick={logout}
                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-50 focus:outline-none transition"
                            >
                                <LogOut className="h-4 w-4 mr-2" />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="mb-6 flex justify-between items-center">
                    <h2 className="text-2xl font-bold leading-tight text-slate-900">Loan Applications</h2>
                    <div className="flex bg-white rounded-md shadow-sm border border-slate-200">
                        <button
                            onClick={() => setFilter('SUBMITTED')}
                            className={`px-4 py-2 text-sm font-medium rounded-l-md ${filter === 'SUBMITTED' ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'}`}
                        >
                            Pending Review
                        </button>
                        <button
                            onClick={() => setFilter('ALL')}
                            className={`px-4 py-2 text-sm font-medium rounded-r-md border-l border-slate-200 ${filter === 'ALL' ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'}`}
                        >
                            All Loans
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-10">Loading...</div>
                ) : loans.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-10 text-center">
                        <p className="text-slate-500">No loan applications found.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {loans.map(loan => (
                            <div key={loan.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-sm font-medium text-slate-500">Application #{loan.id}</h3>
                                            <p className="font-bold text-slate-900">{loan.user?.name}</p>
                                        </div>
                                        {loan.status === 'SUBMITTED' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" /> Pending</span>}
                                        {loan.status === 'APPROVED' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" /> Approved</span>}
                                        {loan.status === 'REJECTED' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" /> Rejected</span>}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                                        <div>
                                            <p className="text-slate-500">Type</p>
                                            <p className="font-medium">{loan.type}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-500">Amount</p>
                                            <p className="font-medium">Rs. {loan.amount}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-500">Tenure</p>
                                            <p className="font-medium">{loan.tenure} m</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-500">Income</p>
                                            <p className="font-medium">Rs. {loan.monthlyIncome}</p>
                                        </div>
                                    </div>

                                    {loan.status === 'SUBMITTED' && (
                                        <div className="mt-6">
                                            {selectedLoan === loan.id ? (
                                                <div className="space-y-3">
                                                    <textarea
                                                        className="w-full text-sm rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                        rows="2"
                                                        placeholder="Rejection reason (if rejecting)"
                                                        value={reviewReason}
                                                        onChange={(e) => setReviewReason(e.target.value)}
                                                    ></textarea>
                                                    <div className="flex space-x-3">
                                                        <button
                                                            onClick={() => handleReview(loan.id, 'APPROVED')}
                                                            className="flex-1 bg-green-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleReview(loan.id, 'REJECTED')}
                                                            className="flex-1 bg-red-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                    <button
                                                        onClick={() => setSelectedLoan(null)}
                                                        className="w-full bg-slate-100 text-slate-700 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-slate-200 transition"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setSelectedLoan(loan.id)}
                                                    className="w-full bg-blue-50 text-blue-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-100 transition"
                                                >
                                                    Review Application
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
