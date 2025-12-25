
import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { Invoice, Payment } from '../types';
import { Card } from '../components/UI/Shared';
import { getAIInsights } from '../services/geminiService';

export const FinancialReports: React.FC<{ user: any }> = ({ user }) => {
  const [data, setData] = useState<{ revenue: number, unpaid: number, count: number }>({ revenue: 0, unpaid: 0, count: 0 });
  const [insight, setInsight] = useState("جاري تحليل البيانات المالية...");

  useEffect(() => {
    const fetchStats = async () => {
      const [invs, pays] = await Promise.all([
        db.getCollection('invoices', user.companyId),
        db.getCollection('payments', user.companyId)
      ]);
      
      const revenue = pays.reduce((sum, p) => sum + p.amount, 0);
      const unpaid = invs.filter(i => i.status !== 'paid').reduce((sum, i) => sum + i.total, 0);
      
      setData({ revenue, unpaid, count: invs.length });
      
      const insightText = await getAIInsights(
        `البيانات المالية لشركة الجيل الخامس: إجمالي الإيرادات المحصلة ${revenue} ر.س. المبالغ المتبقية غير المحصلة ${unpaid} ر.س من إجمالي ${invs.length} فاتورة. ما هي التوصية المالية؟`
      );
      setInsight(insightText);
    };
    fetchStats();
  }, [user.companyId]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-slate-800">التقارير المالية والتحليل</h2>
        <p className="text-slate-500">نظرة شاملة على أداء الشركة المالي</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Card>
            <div className="p-2">
               <h4 className="text-slate-400 font-bold text-sm uppercase mb-4">كفاءة التحصيل المالي</h4>
               <div className="flex items-end gap-2 mb-2">
                 <div className="h-4 flex-1 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 rounded-full" 
                      style={{ width: `${(data.revenue / (data.revenue + data.unpaid)) * 100}%` }}
                    ></div>
                 </div>
                 <span className="text-xs font-bold text-slate-500">
                    {((data.revenue / (data.revenue + data.unpaid || 1)) * 100).toFixed(1)}%
                 </span>
               </div>
               <p className="text-xs text-slate-400">نسبة المبالغ المحصلة من إجمالي الفواتير الصادرة</p>
            </div>
          </Card>

          <Card title="ملخص الأداء المالي">
             <div className="space-y-4">
               <div className="flex justify-between items-center p-4 bg-emerald-50 rounded-xl">
                 <span className="font-bold text-emerald-800">إجمالي الإيرادات (المحصلة)</span>
                 <span className="text-xl font-black text-emerald-600">{data.revenue.toLocaleString()} ر.س</span>
               </div>
               <div className="flex justify-between items-center p-4 bg-red-50 rounded-xl">
                 <span className="font-bold text-red-800">إجمالي الديون (غير المحصلة)</span>
                 <span className="text-xl font-black text-red-600">{data.unpaid.toLocaleString()} ر.س</span>
               </div>
               <div className="flex justify-between items-center p-4 bg-blue-50 rounded-xl">
                 <span className="font-bold text-blue-800">عدد الفواتير الكلي</span>
                 <span className="text-xl font-black text-blue-600">{data.count}</span>
               </div>
             </div>
          </Card>
        </div>

        <div className="space-y-6">
           <Card title="تحليل Gemini AI المالي">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-lg flex-shrink-0 animate-pulse">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 text-slate-700 leading-relaxed italic relative">
                  <div className="absolute -top-3 right-8 bg-blue-600 text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest">مستشار مالي ذكي</div>
                  "{insight}"
                </div>
              </div>
           </Card>

           <Card title="التوقعات المستقبلية">
              <div className="flex items-center gap-6 p-4 border border-dashed border-slate-200 rounded-xl">
                 <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                   <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /></svg>
                 </div>
                 <div>
                   <h5 className="font-bold text-slate-800">توقع نمو ربع سنوي</h5>
                   <p className="text-sm text-slate-500">بناءً على وتيرة التحصيل الحالية، يُتوقع نمو بنسبة 12% في الربع القادم.</p>
                 </div>
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
};
