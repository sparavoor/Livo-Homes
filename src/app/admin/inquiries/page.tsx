'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { fetchInquiriesAction, updateInquiryStatusAction, deleteInquiryAction } from './actions';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminInquiries() {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedInquiry, setSelectedInquiry] = useState<any>(null);

  const statuses = ['unread', 'read', 'archived'];
  
  useEffect(() => {
    fetchInquiries();
  }, []);

  async function fetchInquiries() {
    setIsLoading(true);
    try {
      const data = await fetchInquiriesAction();
      setInquiries(data);
    } catch (error) {
      console.error('Failed to fetch inquiries:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const filteredInquiries = useMemo(() => {
    return inquiries.filter(item => {
      const name = item.name?.toLowerCase() || '';
      const email = item.email?.toLowerCase() || '';
      const subject = item.subject?.toLowerCase() || '';
      const status = item.status || '';

      const matchesSearch = 
        name.includes(searchTerm.toLowerCase()) ||
        email.includes(searchTerm.toLowerCase()) ||
        subject.includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'All' || status === statusFilter.toLowerCase();
      
      return matchesSearch && matchesStatus;
    });
  }, [inquiries, searchTerm, statusFilter]);

  async function handleStatusChange(id: string, newStatus: string) {
    try {
      await updateInquiryStatusAction(id, newStatus);
      setInquiries(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
      if (selectedInquiry?.id === id) {
        setSelectedInquiry({ ...selectedInquiry, status: newStatus });
      }
    } catch (error) {
      alert('Failed to update status');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Permanently delete this inquiry manifest?')) return;
    try {
      await deleteInquiryAction(id);
      setInquiries(prev => prev.filter(o => o.id !== id));
      setSelectedInquiry(null);
    } catch (error) {
      alert('Failed to delete inquiry');
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'unread': return 'bg-amber-100 text-amber-700 font-bold';
      case 'read': return 'bg-blue-100 text-blue-700';
      case 'archived': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="flex flex-col gap-8 font-body">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-headline font-extrabold text-primary tracking-tight">Inquiry Manifest</h1>
          <p className="text-secondary mt-1 text-sm font-medium opacity-70 uppercase tracking-widest">Public Correspondence Log</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Inquiry List */}
        <div className="lg:col-span-12 bg-white rounded-2xl shadow-xl shadow-primary/5 border border-outline-variant/30 overflow-hidden">
          <div className="p-6 border-b border-outline-variant/20 flex flex-wrap gap-4 bg-surface-container-low/30">
            <div className="relative flex-1 min-w-[250px]">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-secondary text-xl">search</span>
              <input 
                type="text" 
                placeholder="Search Name, Email, Subject..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-outline-variant/30 focus:ring-2 focus:ring-primary/20 focus:border-primary rounded-xl pl-12 pr-4 py-3 text-sm transition-all outline-none" 
              />
            </div>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 min-w-[200px] bg-white border border-outline-variant/30 focus:ring-2 focus:ring-primary/20 focus:border-primary rounded-xl px-4 py-3 text-sm font-bold transition-all cursor-pointer appearance-none"
            >
              <option>All Statuses</option>
              {statuses.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
            </select>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low/50 border-b border-outline-variant/20 text-secondary text-[0.65rem] font-bold uppercase tracking-[0.2em]">
                  <th className="p-6">Date</th>
                  <th className="p-6">Inquirer</th>
                  <th className="p-6">Subject</th>
                  <th className="p-6">Status</th>
                  <th className="p-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="p-20 text-center">
                      <div className="animate-pulse flex flex-col items-center gap-4">
                        <div className="w-10 h-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
                        <span className="text-xs font-bold uppercase tracking-widest text-secondary">Synchronising Records...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredInquiries.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-20 text-center text-secondary font-medium italic">No correspondence records found.</td>
                  </tr>
                ) : filteredInquiries.map((item) => (
                  <tr 
                    key={item.id} 
                    className={`text-sm font-medium hover:bg-primary/[0.02] transition-colors group cursor-pointer ${item.status === 'unread' ? 'bg-amber-50/10' : ''}`}
                    onClick={() => {
                      setSelectedInquiry(item);
                      if (item.status === 'unread') handleStatusChange(item.id, 'read');
                    }}
                  >
                    <td className="p-6 text-secondary text-xs font-bold">
                      {new Date(item.created_at).toLocaleDateString('en-IN', { 
                        day: '2-digit', month: 'short', year: 'numeric' 
                      })}
                    </td>
                    <td className="p-6">
                      <div className="font-headline font-bold text-primary text-base">{item.name}</div>
                      <div className="text-[10px] text-secondary/40 mt-0.5">{item.email}</div>
                    </td>
                    <td className="p-6 font-medium text-primary">
                      {item.subject}
                    </td>
                    <td className="p-6 text-xs uppercase tracking-widest font-black">
                      <span className={`px-4 py-1.5 rounded-full ${getStatusColor(item.status)} text-[9px]`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-6 text-right">
                       <button className="text-primary font-bold text-[10px] uppercase tracking-[0.3em] hover:text-brand-accent transition-colors">Review</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Inquiry Detail Modal */}
      <AnimatePresence>
        {selectedInquiry && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-primary/20 backdrop-blur-sm" onClick={() => setSelectedInquiry(null)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-sm shadow-2xl p-10 sm:p-16 relative"
            >
              <button 
                onClick={() => setSelectedInquiry(null)}
                className="absolute top-10 right-10 text-secondary hover:text-primary transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>

              <div className="space-y-12">
                <div className="space-y-4">
                  <span className="text-brand-accent font-black text-[9px] uppercase tracking-[0.4em] block">Inquiry Manifest Record</span>
                  <h2 className="font-headline text-4xl font-black text-primary tracking-tighter">{selectedInquiry.subject}</h2>
                  <div className="flex gap-4">
                    <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${getStatusColor(selectedInquiry.status)}`}>{selectedInquiry.status}</span>
                    <span className="text-[10px] text-secondary/40 font-bold uppercase tracking-widest">Logged: {new Date(selectedInquiry.created_at).toLocaleString()}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8 border-t border-outline-variant/10">
                  <div className="space-y-2">
                    <p className="text-[9px] font-black text-secondary/40 uppercase tracking-widest">Inquirer Identity</p>
                    <p className="font-headline font-black text-xl text-primary">{selectedInquiry.name}</p>
                    <p className="text-sm font-medium text-secondary">{selectedInquiry.email}</p>
                  </div>
                  <div className="flex flex-wrap gap-4 pt-4 md:pt-0">
                    <button 
                      onClick={() => handleStatusChange(selectedInquiry.id, 'archived')}
                      className="px-6 py-3 border border-outline-variant/30 text-[9px] font-black uppercase tracking-[0.2em] hover:bg-surface-container-low transition-all"
                    >
                      Archive Inquiry
                    </button>
                    <button 
                      onClick={() => handleDelete(selectedInquiry.id)}
                      className="px-6 py-3 bg-red-50 text-red-600 text-[9px] font-black uppercase tracking-[0.2em] hover:bg-red-600 hover:text-white transition-all"
                    >
                      Delete Record
                    </button>
                  </div>
                </div>

                <div className="bg-surface-container-low/30 p-10 rounded-sm border-l-4 border-brand-accent">
                   <p className="text-[9px] font-black text-secondary/40 uppercase tracking-[0.3em] mb-6 underline">Dispatch Message:</p>
                   <p className="text-primary font-medium text-lg leading-relaxed whitespace-pre-wrap">{selectedInquiry.message}</p>
                </div>

                <div className="pt-8 border-t border-outline-variant/10">
                   <a 
                    href={`mailto:${selectedInquiry.email}?subject=Re: ${selectedInquiry.subject}`}
                    className="bg-primary text-white text-[10px] font-black uppercase tracking-[0.4em] px-12 py-6 hover:bg-brand-accent transition-all duration-700 shadow-2xl block text-center active:scale-[0.98]"
                   >
                     Respond to Inquirer
                   </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
