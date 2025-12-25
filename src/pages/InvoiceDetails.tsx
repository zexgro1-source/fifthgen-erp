
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { Invoice, Client, Project } from '../types';
import { Button, Card } from '../components/UI/Shared';

export const InvoiceDetails: React.FC<{ user: any }> = ({ user }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDetails = async () => {
    if (!id) return;
    setLoading(true);
    const invData = await db.getDoc('invoices', id) as Invoice;
    if (invData) {
      setInvoice(invData);
      const cData = await db.getDoc('clients', invData.clientId) as Client;
      setClient(cData);
      if (invData.projectId) {
        const pData = await db.getDoc('projects', invData.projectId) as Project;
        setProject(pData);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const updateStatus = async (newStatus: Invoice['status']) => {
    if (!id) return;
    await db.updateDoc('invoices', id, { status: newStatus });
    await fetchDetails();
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="py-20 text-center text-slate-500">جاري جلب تفاصيل الفاتورة...</div>;
  if (!invoice) return <div className="py-20 text-center text-red-500 font-bold">الفاتورة غير موجودة</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 print:m-0 print:p-0">
      <div className="flex justify-between items-center print:hidden">
        <Button variant="secondary" onClick={() => navigate('/invoices')}>
          <svg className="w-5 h-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          العودة للقائمة
        </Button>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={handlePrint}>
            <svg className="w-5 h-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 00-2 2h2m2 4h10a2 2 0 002-2v-4H7v4a2 2 0 002 2z" /></svg>
            طباعة / PDF
          </Button>
          {invoice.status !== 'paid' && (
            <Button onClick={() => updateStatus('paid')}>تحديد كمدفوعة</Button>
          )}
          {invoice.status === 'draft' && (
            <Button variant="secondary" onClick={() => updateStatus('sent')}>تحديد كمرسلة</Button>
          )}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden print:border-0 print:shadow-none">
        {/* Invoice Header */}
        <div className="bg-slate-900 text-white p-8 md:p-12">
          <div className="flex justify-between items-start">
            <div>
              <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center text-2xl font-bold mb-4">5G</div>
              <h1 className="text-3xl font-bold">فاتورة ضريبية</h1>
              <p className="text-slate-400 mt-2">شركة الجيل الخامس للحلول التقنية</p>
            </div>
            <div className="text-left">
              <h2 className="text-xl font-bold text-blue-400">{invoice.invoiceNumber}</h2>
              <div className="mt-4 space-y-1 text-slate-300">
                <p><span className="text-slate-500">تاريخ الإصدار:</span> {invoice.issueDate}</p>
                <p><span className="text-slate-500">تاريخ الاستحقاق:</span> {invoice.dueDate}</p>
                <p className="inline-block px-3 py-1 rounded bg-blue-600/20 text-blue-400 text-sm font-bold uppercase mt-2">{invoice.status}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Client & Company Info */}
        <div className="p-8 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-12 border-b border-slate-100">
          <div>
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">مرسل إلى:</h4>
            <div className="text-slate-800">
              <p className="text-xl font-bold">{client?.name}</p>
              <p className="text-slate-500 mt-2">{client?.email}</p>
              <p className="text-slate-500">{client?.phone}</p>
              {project && (
                <p className="mt-4 text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded-full inline-block font-bold">
                   المشروع: {project.name}
                </p>
              )}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">صادر من:</h4>
            <div className="text-slate-800">
              <p className="text-xl font-bold">شركة الجيل الخامس (5G Corp)</p>
              <p className="text-slate-500 mt-2">شارع التقنية، الرياض، المملكة العربية السعودية</p>
              <p className="text-slate-500">الرقم الضريبي: 30005678912345</p>
            </div>
          </div>
        </div>

        {/* Table Items */}
        <div className="p-8 md:p-12">
          <table className="w-full text-right">
            <thead>
              <tr className="border-b-2 border-slate-100">
                <th className="py-4 font-bold text-slate-600">الوصف</th>
                <th className="py-4 font-bold text-slate-600 text-center">الكمية</th>
                <th className="py-4 font-bold text-slate-600 text-center">السعر</th>
                <th className="py-4 font-bold text-slate-600 text-left">الإجمالي</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {invoice.lineItems.map((item) => (
                <tr key={item.id}>
                  <td className="py-6 font-semibold text-slate-700">{item.description}</td>
                  <td className="py-6 text-center text-slate-500">{item.quantity}</td>
                  <td className="py-6 text-center text-slate-500">{item.unitPrice.toLocaleString()} {invoice.currency}</td>
                  <td className="py-6 text-left font-bold text-slate-800">{item.total.toLocaleString()} {invoice.currency}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="mt-12 flex justify-end">
            <div className="w-full md:w-64 space-y-4">
              <div className="flex justify-between text-slate-500">
                <span>المجموع الفرعي:</span>
                <span className="font-semibold">{invoice.subtotal.toLocaleString()} {invoice.currency}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>ضريبة القيمة المضافة (14%):</span>
                <span className="font-semibold">{invoice.tax.toLocaleString()} {invoice.currency}</span>
              </div>
              <div className="pt-4 border-t-2 border-slate-100 flex justify-between text-2xl font-black text-blue-600">
                <span>الإجمالي الكلي:</span>
                <span>{invoice.total.toLocaleString()} {invoice.currency}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 md:p-12 bg-slate-50 text-sm text-slate-400 leading-relaxed italic text-center border-t border-slate-100">
          شكراً لتعاملكم مع شركة الجيل الخامس. يرجى سداد المبلغ قبل تاريخ الاستحقاق لتجنب أي رسوم تأخير.
          <br /> جميع الحقوق محفوظة &copy; {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
};
