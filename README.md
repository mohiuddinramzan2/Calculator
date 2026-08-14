# ক্যালকুলেটর (Save History সহ)

ক্লিন, মিনিমাল, প্রফেশনাল ডিজাইনের একটি ওয়েব ক্যালকুলেটর। প্রতিটি হিসাব স্বয়ংক্রিয়ভাবে ব্রাউজারের `localStorage`-এ সেভ থাকে (হিস্টোরি প্যানেল থেকে দেখা/মুছা যায়)।

## ফোল্ডার স্ট্রাকচার

```
calculator-app/
├── index.html
├── css/style.css
├── js/app.js
├── .github/workflows/deploy.yml   ← GitHub Actions (GitHub Pages এ অটো ডিপ্লয়)
└── README.md
```

## Termux দিয়ে GitHub-এ আপলোড করার ধাপ

1. Termux-এ প্রয়োজনীয় টুল ইনস্টল করুন (যদি না থাকে):
```bash
pkg update && pkg install git -y
```

2. এই zip ফাইলটি এক্সট্র্যাক্ট করুন (উদাহরণ):
```bash
cd ~/storage/downloads
unzip calculator-app.zip
cd calculator-app
```

3. Git init করে GitHub repo-তে পুশ করুন:
```bash
git init
git add .
git commit -m "Initial commit: calculator app"
git branch -M main
git remote add origin https://github.com/<আপনার-ইউজারনেম>/<repo-নাম>.git
git push -u origin main
```

4. GitHub repository-তে যান → **Settings → Pages** → Source হিসেবে **GitHub Actions** সিলেক্ট করুন। এরপর প্রতিবার `main` ব্রাঞ্চে push করলেই `.github/workflows/deploy.yml` অটোমেটিক সাইট বিল্ড ও ডিপ্লয় করবে।

5. কিছুক্ষণ পর সাইট লাইভ হবে এই লিংকে:
```
https://<আপনার-ইউজারনেম>.github.io/<repo-নাম>/
```

## ফিচার

- যোগ, বিয়োগ, গুণ, ভাগ, শতাংশ (%)
- কী-বোর্ড সাপোর্ট (সংখ্যা, + - * /, Enter, Backspace, Escape)
- প্রতিটি হিসাব localStorage-এ স্বয়ংক্রিয় সেভ (সর্বশেষ ১০০টি)
- হিস্টোরি প্যানেল: আগের হিসাব দেখা, ট্যাপ করে রেজাল্ট পুনরায় ব্যবহার, এবং "সব মুছে ফেলুন" অপশন
- সম্পূর্ণ অফলাইন-ক্যাপেবল (কোনো এক্সটার্নাল লাইব্রেরি/CDN নেই)
- ডার্ক থিম, রেসপন্সিভ (মোবাইল-ফার্স্ট) ডিজাইন

## লোকাল টেস্ট (Termux)

```bash
python -m http.server 8080
```
তারপর ব্রাউজারে খুলুন: `http://localhost:8080`
