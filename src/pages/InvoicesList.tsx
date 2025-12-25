
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Button } from '../components/UI/Shared';
import { db } from '../firebase';
import { Invoice, Client } from '../types';

export const InvoicesList: React.FC<{ user: any }> = ({ user }) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchData = async () => {
    setIsLoading(true);
    const [invoicesData, clientsData] = await Promise.all([
      db.getCollection('invoices', user.companyId),
      db.getCollection('clients', user.companyId)
    ]);
    setInvoices(invoicesData);
    setClients(clientsData);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [user.companyId]);

  const getClientName = (id: string) => clients.find(c => c.id === id)?.name || 'غير معروف';

  const getStatusBadge = (status: string) => {
    const styles: any = {
      paid: 'bg-green-100 text-green-700',
      draft: 'bg-slate-100 text-slate-700',
      sent: 'bg-blue-100 text-blue-700',
      overdue: 'bg-red-100 text-red-700'
    };
    const labels: any = { paid: 'مدفوعة', draft: 'مسودة', sent: 'مرسلة', overdue: 'متأخرة' };
    return <span className={`px-2 py-1 rounded text-xs font-bold ${styles[status]}`}>{labels[status]}</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">الفواتير</h2>
          <p className="text-slate-500 text-sm">إدارة الفواتير والتحصيلات المالية</p>
        </div>
        <Button onClick={() => navigate('/invoices/create')}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          إنشاء فاتورة
        </Button>
      </div>

      <Card>
        <Table<Invoice>
          data={invoices}
          columns={[
            { key: 'invoiceNumber', label: 'رقم الفاتورة', render: (inv) => <span className="font-bold text-slate-700">{inv.invoiceNumber}</span> },
            { key: 'clientId', label: 'العميل', render: (inv) => getClientName(inv.clientId) },
            { key: 'total', label: 'المبلغ الإجمالي', render: (inv) => <span className="font-semibold">{inv.total.toLocaleString()} {inv.currency}</span> },
            { key: 'issueDate', label: 'تاريخ الإصدار' },
            { key: 'dueDate', label: 'تاريخ الاستحقاق' },
            { key: 'status', label: 'الحالة', render: (inv) => getStatusBadge(inv.status) },
            { key: 'actions', label: 'إجراءات', render: () => (
               <button className="text-blue-600 hover:text-blue-800 text-sm font-bold">عرض التفاصيل</button>
            )}
          ]}
        />
        
        {!isLoading && invoices.length === 0 && (
          <div className="py-20 text-center">
            <div className="text-slate-200 mb-4 flex justify-center">
              <svg className="w-20 h-20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <p className="text-slate-400">لا توجد فواتير صادرة حتى الآن</p>
          </div>
        )}
      </Card>
    </div>
  );
};
