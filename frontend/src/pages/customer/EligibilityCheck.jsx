import React, { useState } from 'react';
import api from '../../services/api';
import { Calculator, CheckCircle2, XCircle } from 'lucide-react';

export default function EligibilityCheck({ onEligible }) {
    const [formData, setFormData] = useState({
        monthlyIncome: '',
        loanAmount: '',
        tenure: ''
    });
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleCheck = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await api.post('/api/customer/eligibility', {
                monthlyIncome: parseFloat(formData.monthlyIncome),
                loanAmount: parseFloat(formData.loanAmount),
                tenure: parseInt(formData.tenure)
            });
            setResult(response.data);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to check eligibility');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
            <div className="flex items-center mb-6">
                <Calculator className="w-6 h-6 text-blue-600 mr-2" />
                <h2 className="text-xl font-bold text-slate-900">Eligibility Check</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 border-b border-slate-100 pb-8 mb-8">
                <div>
                    <form className="space-y-4" onSubmit={handleCheck}>
                        {error && <div className="text-red-500 text-sm bg-red-50 p-2 rounded">{error}</div>}

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Monthly Income (Rs.)</label>
                            <input
                                type="number"
                                required
                                min="1000"
                                value={formData.monthlyIncome}
                                onChange={(e) => setFormData({ ...formData, monthlyIncome: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Required Loan Amount (Rs.)</label>
                            <input
                                type="number"
                                required
                                min="1000"
                                value={formData.loanAmount}
                                onChange={(e) => setFormData({ ...formData, loanAmount: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Tenure (Months)</label>
                            <input
                                type="number"
                                required
                                min="1"
                                value={formData.tenure}
                                onChange={(e) => setFormData({ ...formData, tenure: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-slate-900 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition disabled:opacity-50"
                        >
                            {loading ? 'Calculating...' : 'Check Eligibility'}
                        </button>
                    </form>
                </div>

                <div className="flex flex-col justify-center">
                    {result ? (
                        <div className={`p-6 rounded-xl border ${result.eligible ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                            <div className="flex items-center mb-4">
                                {result.eligible ? (
                                    <CheckCircle2 className="w-8 h-8 text-green-600 mr-3" />
                                ) : (
                                    <XCircle className="w-8 h-8 text-red-600 mr-3" />
                                )}
                                <h3 className={`text-lg font-bold ${result.eligible ? 'text-green-800' : 'text-red-800'}`}>
                                    {result.eligible ? 'ELIGIBLE' : 'NOT ELIGIBLE'}
                                </h3>
                            </div>
                            <p className={`mb-4 text-sm ${result.eligible ? 'text-green-700' : 'text-red-700'}`}>
                                {result.message}
                            </p>

                            <div className="p-3 bg-white/60 rounded border border-white/40 mb-4">
                                <p className="text-xs text-slate-500 uppercase font-semibold">Max Eligible Amount</p>
                                <p className="text-2xl font-bold text-slate-900">Rs. {result.maxEligibleAmount.toLocaleString()}</p>
                            </div>

                            {result.eligible && (
                                <button
                                    onClick={onEligible}
                                    className="w-full bg-green-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-green-700 transition"
                                >
                                    Proceed to Apply
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="text-center p-8 bg-slate-50 rounded-xl border border-slate-100">
                            <p className="text-slate-500 text-sm">
                                Enter your details to calculate eligibility. The system approves a maximum loan of up to 20 times your monthly income.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
