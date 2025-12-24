# مبادئ البدء - نظام الجيل الخامس ERP

هذا الدليل يشرح خطوات الإعداد الكاملة لتشغيل نظام الجيل الخامس على جهازك.

## المتطلبات الأساسية

- Node.js >= 14.0
- npm or yarn
- Firebase Account (free)
- Google Gemini API Key (optional)
- Git

## خطوات الإعداد

### 1٠ استنسخ المشروع

```bash
git clone https://github.com/zexgro1-source/fifthgen-erp.git
cd fifthgen-erp
npm install
```

### 2٠ إرسال Firebase Config

#### 2.1 اذهب إلم Firebase Console
https://console.firebase.google.com/

#### 2.2 ركب مشروع Google Cloud
1. اضغط **Create Project**
2. ادخل اسم مشروع مثلاً: `fifthgen-erp`
3. اضغط **Continue**
4. فعّل Google Analytics اذا أردت
5. اضغط **Create Project**

#### 2.3 الحصول على Firebase Config

1. عود إلى Firebase Console
2. اضغط **Project Settings** (Gear icon)
3. راجع Your apps section
4. اضغط **</>** (Web)
5. ارسم التطبيق: `fifthgen-web`
6. نسخ **firebaseConfig** object

#### 2.4 رال Firebase Config في .env.local

```bash
cp .env.example .env.local
```

رفتع .env.local:
```
VITE_FIREBASE_API_KEY=YOUR_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=YOUR_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET=YOUR_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID=YOUR_APP_ID
VITE_GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

### 3٠ فعّل Firestore

1. اذهب Cloud Firestore
2. اضغط **Create Database**
3. اختر **Start in Production Mode**
4. اختر منطقة قريبة
5. اضغط **Create**

### 4٠ تفعل صلاحيات Firestore

1. عود إلى Firestore Rules
2. راع firestore.rules من هذا Repository
3. الصق المحتواه في رابط Firestore
4. اضغط **Publish**

### 5٠ فعّل Firebase Authentication

1. اذهب Authentication
2. اضغط **Get started**
3. اعبر **Email/Password**
4. فعّل **Enable**
5. اضغط **Save**

## تشغيل التطبيق

```bash
npm run dev
```

التطبيق سيبدأ على:
```
http://localhost:5173
```

## أول مستخدم

1. اذهب لم http://localhost:5173
2. اضغط على "**إنشاء حساب جديد**"
3. ادخل:
   - اسم الشركة
   - اسمك
   - بريدك
   - كلمة مرور
4. اضغط "إنشاء الحساب"
5. سهيره! سيراك الآن مستخدم ADMIN مع عربة خاصة بك

## نرشر على Firebase Hosting

```bash
npm run build
firebase login
firebase init hosting
firebase deploy
```

## البنية العامة

```
fifthgen-erp/
├── src/
│  ├── pages/
│  ├── components/
│  ├── services/
│  └── App.tsx
├── firestore.rules
├── .env.example
├── package.json
└── vite.config.ts
```

## الأدوار

- **ADMIN**: موظف إداري يرى كل البيانات
- **STAFF**: موظف يرى البيانات الخاصة به
- **CLIENT**: عميل يرى مشاريعه فقط

## الدعم

اذا واجهتك مشكلة:
1. العا دعائم README.md
2. سجل مشكلة ، Issues
3. رابط بنا

---

بالتوفيق! نتمنى لك عملاً موفقاً! شركة الجيل الخامس 2025©
