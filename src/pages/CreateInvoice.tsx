
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button } from '../components/UI/Shared';
import { db } from '../firebase';
import { Client, Project, InvoiceLineItem } from '../types';

export const CreateInvoice: React.FC<{ user: any }> = ({ user }) => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    clientId: '',
    projectId: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    currency: 'ر.س'
  });

  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([
    { id: '1', description: '', quantity: 1, unitPrice: 0, total: 0 }
  ]);

  useEffect(() => {
    const fetchSelectData = async () => {
      const [clientsData, projectsData] = await Promise.all([
        db.getCollection('clients', user.companyId),
        db.getCollection('projects', user.companyId)
      ]);
      setClients(clientsData);
      setProjects(projectsData);
    };
    fetchSelectData();
  }, [user.companyId]);

  const calculateTotals = () => {
    const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * 0.14; // 14% VAT
    const total = subtotal + tax;
    return { subtotal, tax, total };
  };

  const updateLineItem = (id: string, updates: Partial<InvoiceLineItem>) => {
    setLineItems(prev => prev.map(item => {
      if (item.id === id) {
        const newItem = { ...item, ...updates };
        newItem.total = newItem.quantity * newItem.unitPrice;
        return newItem;
      }
      return item;
    }));
  };

  const addLineItem = () => {
    setLineItems(prev => [...prev, { 
      id: Math.random().toString(36).substr(2, 9), 
      description: '', 
      quantity: 1, 
      unitPrice: 0, 
      total: 0 
    }]);
  };

  const removeLineItem = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientId) return setError('يرجى اختيار العميل');
    
    setIsLoading(true);
    const totals = calculateTotals();
    
    try {
      await db.addDoc('invoices', {
        ...formData,
        lineItems,
        ...totals,
        status: 'draft',
        companyId: user.companyId
      });
      navigate('/invoices');
    } catch (err) {
      setError('حدث خطأ أثناء حفظ الفاتورة');
    } finally {
      setIsLoading(false);
    }
  };

  const { subtotal, tax, total } = calculateTotals();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-2">
        <button onClick={() => navigate('/invoices')} className="p-2 hover:bg-slate-100 rounded-full">
          <svg className="w-6 h-6 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
        </button>
        <h2 className="text-2xl font-bold text-slate-800">إنشاء فاتورة جديدة</h2>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-100 font-bold">{error}</div>}

      <form onSubmit={handleSave} className="space-y-6">
        <Card title="معلومات الفاتورة والعميل">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">رقم الفاتورة</label>
              <input 
                className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-slate-50 font-mono"
                value={formData.invoiceNumber}
                onChange={(e) => setFormData({...formData, invoiceNumber: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">العميل</label>
              <select 
                required
                className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.clientId}
                onChange={(e) => setFormData({...formData, clientId: e.target.value})}
              >
                <option value="">اختر العميل...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">المشروع (اختياري)</label>
              <select 
                className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none"
                value={formData.projectId}
                onChange={(e) => setFormData({...formData, projectId: e.target.value})}
              >
                <option value="">اختر المشروع...</option>
                {projects.filter(p => !formData.clientId || p.clientId === formData.clientId).map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">تاريخ الإصدار</label>
              <input 
                type="date"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                value={formData.issueDate}
                onChange={(e) => setFormData({...formData, issueDate: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">تاريخ الاستحقاق</label>
              <input 
                type="date"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                value={formData.dueDate}
                onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">العملة</label>
              <select 
                className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                value={formData.currency}
                onChange={(e) => setFormData({...formData, currency: e.target.value})}
              >
                <option value="ر.س">ريال سعودي (ر.س)</option>
                <option value="USD">دولار أمريكي ($)</option>
              </select>
            </div>
          </div>
        </Card>

        <Card title="بنود الفاتورة">
          <div className="overflow-x-auto">
            <table className="w-full text-right mb-4">
              <thead className="border-b border-slate-100">
                <tr>
                  <th className="px-4 py-2 font-bold text-slate-500">الوصف</th>
                  <th className="px-4 py-2 font-bold text-slate-500 w-24 text-center">الكمية</th>
                  <th className="px-4 py-2 font-bold text-slate-500 w-40 text-center">سعر الوحدة</th>
                  <th className="px-4 py-2 font-bold text-slate-500 w-40 text-center">الإجمالي</th>
                  <th className="px-4 py-2 w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {lineItems.map((item) => (
                  <tr key={item.id} className="group">
                    <td className="px-2 py-3">
                      <input 
                        className="w-full px-3 py-2 border border-transparent hover:border-slate-200 focus:border-blue-300 rounded outline-none transition-all"
                        placeholder="أدخل وصف الخدمة أو المنتج..."
                        value={item.description}
                        onChange={(e) => updateLineItem(item.id, { description: e.target.value })}
                      />
                    </td>
                    <td className="px-2 py-3">
                      <input 
                        type="number"
                        className="w-full px-3 py-2 border border-transparent hover:border-slate-200 focus:border-blue-300 rounded outline-none text-center"
                        value={item.quantity}
                        onChange={(e) => updateLineItem(item.id, { quantity: Number(e.target.value) })}
                      />
                    </td>
                    <td className="px-2 py-3">
                      <input 
                        type="number"
                        className="w-full px-3 py-2 border border-transparent hover:border-slate-200 focus:border-blue-300 rounded outline-none text-center"
                        value={item.unitPrice}
                        onChange={(e) => updateLineItem(item.id, { unitPrice: Number(e.target.value) })}
                      />
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-700 text-center">
                      {item.total.toLocaleString()}
                    </td>
                    <td className="px-2 py-3">
                      <button 
                        type="button"
                        onClick={() => removeLineItem(item.id)}
                        className="p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button 
            type="button" 
            onClick={addLineItem}
            className="flex items-center gap-2 text-blue-600 font-bold hover:text-blue-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            إضافة بند جديد
          </button>
        </Card>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
             {/* Notes or extra info could go here */}
          </div>
          <div className="w-full md:w-80 space-y-3 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between text-slate-500">
              <span>المجموع الفرعي:</span>
              <span className="font-semibold">{subtotal.toLocaleString()} {formData.currency}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>ضريبة القيمة المضافة (14%):</span>
              <span className="font-semibold">{tax.toLocaleString()} {formData.currency}</span>
            </div>
            <div className="pt-3 border-t border-slate-100 flex justify-between text-xl font-bold text-blue-600">
              <span>الإجمالي:</span>
              <span>{total.toLocaleString()} {formData.currency}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-4 justify-end">
           <Button type="button" variant="secondary" onClick={() => navigate('/invoices')}>إلغاء</Button>
           <Button type="submit" isLoading={isLoading} className="px-12">حفظ كمسودة</Button>
        </div>
      </form>
    </div>
  );
};
