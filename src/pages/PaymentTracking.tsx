
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { Button, Card } from '../components/UI/Shared';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await auth.signInWithEmailAndPassword(email, password);
      navigate('/');
    } catch (err) {
      setError('خطأ في البريد الإلكتروني أو كلمة المرور');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center text-white text-3xl font-bold shadow-xl shadow-blue-200 mb-4">
            5G
          </div>
          <h1 className="text-3xl font-bold text-slate-800">شركة الجيل الخامس</h1>
          <p className="text-slate-500 mt-2">نظام إدارة الموارد المتكامل</p>
        </div>

        <Card>
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">البريد الإلكتروني</label>
              <input 
                required
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                type="email" 
                placeholder="admin@gen5.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">كلمة المرور</label>
              <input 
                required
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                type="password" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full py-3" 
              isLoading={loading}
            >
              تسجيل الدخول للنظام
            </Button>
          </form>
        </Card>
        
        <p className="text-center text-slate-400 text-xs mt-8">
          جميع الحقوق محفوظة &copy; {new Date().getFullYear()} شركة الجيل الخامس للحلول التقنية
        </p>
      </div>
    </div>
  );
};
