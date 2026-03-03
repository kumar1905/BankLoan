import React, { useState } from 'react';
import api from '../../services/api';

export default function ApplicationForm({ onSuccess }) {
    const [formData, setFormData] = useState({
        type: 'PERSONAL',
        amount: '',
        tenure: '',
        monthlyIncome: '',
        pan: '',
        address: ''
    });
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const payload = new FormData();
        payload.append('loanData', JSON.stringify({
            type: formData.type,
            amount: parseFloat(formData.amount),
            tenure: parseInt(formData.tenure),
            monthlyIncome: parseFloat(formData.monthlyIncome),
            pan: formData.pan,
            address: formData.address
        }));

        if (file) {
            payload.append('files', file);
        }

        try {
            await api.post('/api/customer/apply', payload, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            onSuccess();
        } catch (err) {
            if (err.response?.data?.error) {
                setError(err.response.data.error);
            } else {
                setError('Failed to submit application. Note that you must be eligible based on the 20x income rule.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 bg-slate-50">
                <h2 className="text-xl font-bold text-slate-900">Loan Application Form</h2>
                <p className="text-sm text-slate-500 mt-1">Please fill out all details accurately.</p>
            </div>

            <div className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && <div className="text-red-500 text-sm bg-red-50 p-3 rounded-md border border-red-100">{error}</div>}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Loan Type</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            >
                                <option value="PERSONAL">Personal Loan</option>
                                <option value="HOME">Home Loan</option>
                                <option value="BUSINESS">Business Loan</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">PAN Number</label>
                            <input
                                type="text"
                                required
                                value={formData.pan}
                                onChange={(e) => setFormData({ ...formData, pan: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm uppercase"
                                placeholder="ABCDE1234F"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Loan Amount (Rs.)</label>
                            <input
                                type="number"
                                required
                                min="1000"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
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

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Residential Address</label>
                            <textarea
                                required
                                rows="3"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            ></textarea>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Upload Document (Optional for Demo)</label>
                            <input
                                type="file"
                                onChange={(e) => setFile(e.target.files[0])}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 text-white py-2 px-6 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition shadow-sm disabled:opacity-50"
                        >
                            {loading ? 'Submitting...' : 'Submit Application'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
