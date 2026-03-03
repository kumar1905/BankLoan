import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import { Download, CheckCircle, Clock, XCircle, FileText } from 'lucide-react';

export default function CustomerProfile() {
    const { user } = useContext(AuthContext);
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLoans = async () => {
            try {
                const response = await api.get('/api/customer/loans');
                setLoans(response.data);
            } catch (err) {
                console.error('Failed to fetch loans', err);
            } finally {
                setLoading(false);
            }
        };
        fetchLoans();
    }, []);

    const handleDownloadPdf = async (id) => {
        try {
            const response = await api.get(`/api/customer/loans/${id}/pdf`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `approval_letter_${id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (err) {
            alert('Failed to download PDF');
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 bg-slate-50 flex items-center">
                    <h3 className="text-lg font-bold text-slate-900">Personal Information</h3>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm font-medium text-slate-500">Full Name</p>
                        <p className="mt-1 text-sm text-slate-900">{user?.name}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Email Address</p>
                        <p className="mt-1 text-sm text-slate-900">{user?.email}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Role</p>
                        <p className="mt-1 text-sm text-slate-900">{user?.role}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 bg-slate-50 flex items-center">
                    <FileText className="w-5 h-5 text-blue-600 mr-2" />
                    <h3 className="text-lg font-bold text-slate-900">Loan History</h3>
                </div>
                <div className="p-6">
                    {loading ? (
                        <p className="text-slate-500 text-sm">Loading...</p>
                    ) : loans.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-slate-500">You haven't applied for any loans yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {loans.map((loan) => (
                                <div key={loan.id} className="border border-slate-200 rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between hover:border-blue-200 transition-colors bg-white">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-2">
                                            <span className="text-sm font-semibold text-slate-900">App #{loan.id}</span>
                                            <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium">{loan.type}</span>
                                            {loan.status === 'SUBMITTED' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" /> Pending</span>}
                                            {loan.status === 'APPROVED' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" /> Approved</span>}
                                            {loan.status === 'REJECTED' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" /> Rejected</span>}
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs mt-3">
                                            <div>
                                                <p className="text-slate-500 mb-0.5">Amount</p>
                                                <p className="font-medium">Rs. {loan.amount.toLocaleString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-500 mb-0.5">Tenure</p>
                                                <p className="font-medium">{loan.tenure} months</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-500 mb-0.5">Applied On</p>
                                                <p className="font-medium">{new Date(loan.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>

                                        {loan.status === 'REJECTED' && loan.rejectionReason && (
                                            <div className="mt-4 text-xs p-3 bg-red-50 text-red-700 rounded-md border border-red-100">
                                                <span className="font-semibold">Rejection Reason:</span> {loan.rejectionReason}
                                            </div>
                                        )}
                                    </div>

                                    {loan.status === 'APPROVED' && (
                                        <div className="mt-4 md:mt-0 md:ml-6 flex-shrink-0">
                                            <button
                                                onClick={() => handleDownloadPdf(loan.id)}
                                                className="inline-flex items-center px-4 py-2 border border-blue-600 shadow-sm text-sm font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors w-full md:w-auto justify-center"
                                            >
                                                <Download className="h-4 w-4 mr-2" />
                                                Download PDF
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
