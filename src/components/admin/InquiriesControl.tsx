'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { fetchInquiriesAction, updateInquiryStatusAction, deleteInquiryAction } from '@/app/admin/inquiries/actions';
import { motion, AnimatePresence } from 'framer-motion';

export default function InquiriesControl() {
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
    if (!confirm('Permanently delete this inquiry record?')) return;
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
      case 'unread': return 'bg-amber-100 text-amber-700 font-black';
      case 'read': return 'bg-blue-100 text-blue-700 font-bold';
      case 'archived': return 'bg-gray-100 text-secondary font-medium';
      default: return 'bg-gray-100 text-secondary';
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-headline font-black text-primary tracking-tight">Inquiry Manifest</h2>
          <p className="text-secondary text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Public Correspondence & Engagement</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-2xl border border-outline/5 overflow-hidden">
        <div className="p-6 border-b border-outline/5 flex flex-wrap gap-4 bg-background/30">
          <div className="relative flex-1 min-w-[250px]">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-secondary/40 text-xl">search</span>
            <input 
              type="text" 
              placeholder="Search Identity, Email, or Subject..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-outline/5 focus:ring-1 focus:ring-brand-accent/20 focus:border-brand-accent/40 rounded-sm pl-12 pr-4 py-3 text-xs font-bold transition-all outline-none" 
            />
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex-1 min-w-[180px] bg-white border border-outline/5 focus:ring-1 focus:ring-brand-accent/20 focus:border-brand-accent/40 rounded-sm px-4 py-3 text-xs font-black uppercase tracking-widest transition-all cursor-pointer appearance-none"
          >
            <option>All Statuses</option>
            {statuses.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
          </select>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-background/50 border-b border-outline/5 text-secondary/40 text-[9px] font-black uppercase tracking-[0.3em]">
                <th className="px-8 py-5">Logged Date</th>
                <th className="px-8 py-5">Inquirer</th>
                <th className="px-8 py-5">Subject</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline/5">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-20 text-center">
                    <div className="animate-pulse flex flex-col items-center gap-4">
                      <div className="w-8 h-8 rounded-full border-2 border-primary/10 border-t-brand-accent animate-spin"></div>
                      <span className="text-[9px] font-black uppercase tracking-[0.3em] text-secondary/40">Syncing Correspondence...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredInquiries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-20 text-center text-secondary/40 font-serif italic text-sm">No correspondence records archived.</td>
                </tr>
              ) : filteredInquiries.map((item) => (
                <tr 
                  key={item.id} 
                  className={`hover:bg-background/50 transition-colors duration-500 group cursor-pointer ${item.status === 'unread' ? 'bg-brand-accent/5' : ''}`}
                  onClick={() => {
                    setSelectedInquiry(item);
                    if (item.status === 'unread') handleStatusChange(item.id, 'read');
                  }}
                >
                  <td className="px-8 py-6 text-secondary/60 text-[10px] font-black uppercase tracking-widest">
                    {new Date(item.created_at).toLocaleDateString('en-IN', { 
                      day: '2-digit', month: 'short', year: 'numeric' 
                    })}
                  </td>
                  <td className="px-8 py-6">
                    <div className="font-headline font-black text-primary text-sm uppercase tracking-tight">{item.name}</div>
                    <div className="text-[10px] text-secondary/40 mt-1 font-bold uppercase tracking-widest">{item.email}</div>
                  </td>
                  <td className="px-8 py-6 font-bold text-primary text-[11px] uppercase tracking-wider">
                    {item.subject}
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-4 py-1 rounded-full ${getStatusColor(item.status)} text-[8px] uppercase tracking-[0.2em] shadow-sm`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                     <button className="text-primary/40 font-black text-[9px] uppercase tracking-[0.3em] hover:text-brand-accent transition-colors">Review Record</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inquiry Detail Modal */}
      <AnimatePresence>
        {selectedInquiry && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-primary/40 backdrop-blur-md" onClick={() => setSelectedInquiry(null)}>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-sm shadow-2xl p-12 relative"
            >
              <button 
                onClick={() => setSelectedInquiry(null)}
                className="absolute top-8 right-8 text-secondary/40 hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>

              <div className="space-y-10">
                <div className="space-y-3">
                  <span className="text-brand-accent font-black text-[9px] uppercase tracking-[0.4em] block">Inquiry Registry Entry</span>
                  <h2 className="font-headline text-3xl font-black text-primary tracking-tighter">{selectedInquiry.subject}</h2>
                  <div className="flex gap-4">
                    <span className={`px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.2em] ${getStatusColor(selectedInquiry.status)}`}>{selectedInquiry.status}</span>
                    <span className="text-[9px] text-secondary/40 font-black uppercase tracking-[0.3em]">LOGGED: {new Date(selectedInquiry.created_at).toLocaleString()}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-8 border-t border-outline/5">
                  <div className="space-y-2">
                    <p className="text-[8px] font-black text-secondary/40 uppercase tracking-[0.4em]">Inquirer Profile</p>
                    <p className="font-headline font-black text-lg text-primary tracking-tight">{selectedInquiry.name}</p>
                    <p className="text-[11px] font-bold text-secondary/60 uppercase tracking-wider">{selectedInquiry.email}</p>
                  </div>
                  <div className="flex flex-wrap gap-3 pt-4 md:pt-0 justify-end">
                    <button 
                      onClick={() => handleStatusChange(selectedInquiry.id, 'archived')}
                      className="px-5 py-3 border border-outline/10 text-[8px] font-black uppercase tracking-[0.2em] hover:bg-background transition-all"
                    >
                      Archive Entry
                    </button>
                    <button 
                      onClick={() => handleDelete(selectedInquiry.id)}
                      className="px-5 py-3 bg-red-50 text-red-600 text-[8px] font-black uppercase tracking-[0.2em] hover:bg-red-600 hover:text-white transition-all shadow-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="bg-background/50 p-8 rounded-sm border-l-2 border-brand-accent">
                   <p className="text-[8px] font-black text-secondary/40 uppercase tracking-[0.4em] mb-4 opacity-40">COMMUNICATION BLOCK:</p>
                   <p className="text-primary font-medium text-base leading-relaxed whitespace-pre-wrap tracking-tight">{selectedInquiry.message}</p>
                </div>

                <div className="pt-8">
                   <a 
                    href={`mailto:${selectedInquiry.email}?subject=RE: ${selectedInquiry.subject}`}
                    className="bg-primary text-white text-[9px] font-black uppercase tracking-[0.4em] px-10 py-5 hover:bg-brand-accent transition-all duration-500 shadow-2xl block text-center"
                   >
                     Initialize Response
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
