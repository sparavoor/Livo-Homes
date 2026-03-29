'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Profile } from '@/context/auth-context';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setCustomers(data || []);
    } catch (error: any) {
      console.error('Error fetching customers:', error.message || error);
      if (error.details) console.error('Details:', error.details);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(customer => 
    customer.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.includes(searchTerm)
  );

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-headline font-extrabold text-on-surface">Customers</h1>
      
      <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30 overflow-hidden">
        <div className="p-6 border-b border-outline-variant/30 flex flex-wrap gap-4 bg-surface-container-lowest">
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            className="flex-1 min-w-[300px] bg-surface-container-low border-none focus:ring-2 focus:ring-primary rounded-lg px-4 py-3 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-20 text-center text-secondary">Loading customers...</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant/30 text-secondary text-sm">
                  <th className="p-5 font-semibold">Name</th>
                  <th className="p-5 font-semibold">Email & Phone</th>
                  <th className="p-5 font-semibold">Last Active</th>
                  <th className="p-5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="border-b border-outline-variant/10 text-sm font-medium hover:bg-surface-container-lowest/50">
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-headline font-black text-xs overflow-hidden shadow-2xl border border-brand-accent/20">
                          {customer.avatar_url ? (
                            <img src={customer.avatar_url} alt={customer.full_name || ''} className="w-full h-full object-cover" />
                          ) : (
                            (customer.full_name || 'U').charAt(0).toUpperCase()
                          )}
                        </div>
                        <span className="font-bold text-on-surface">{customer.full_name || 'Anonymous User'}</span>
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="text-on-surface">{customer.email || 'No email provided'}</div>
                      {customer.phone && <div className="text-xs text-secondary mt-1">{customer.phone}</div>}
                    </td>
                    <td className="p-5 font-bold text-on-surface-variant">
                      {customer.updated_at ? new Date(customer.updated_at).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="p-5">
                      <select 
                        value={customer.privilege_tier || 'standard'}
                        onChange={async (e) => {
                          const newTier = e.target.value;
                          try {
                            const { updateUserPrivilegeAction } = await import('./actions');
                            await updateUserPrivilegeAction(customer.id, newTier);
                            fetchCustomers();
                          } catch (err: any) {
                            alert(err.message || 'Failed to update tier');
                          }
                        }}
                        className="bg-surface-container-low border-none rounded-lg px-3 py-1 text-[10px] font-black uppercase tracking-widest focus:ring-1 focus:ring-brand-accent outline-none cursor-pointer"
                      >
                        <option value="standard">Standard</option>
                        <option value="silver">Silver</option>
                        <option value="gold">Gold</option>
                        <option value="platinum">Platinum</option>
                      </select>
                    </td>
                    <td className="p-5 text-right space-x-4">
                      <button className="text-primary font-bold hover:underline">View Profile</button>
                    </td>
                  </tr>
                ))}
                {filteredCustomers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-10 text-center text-secondary">No customers found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
