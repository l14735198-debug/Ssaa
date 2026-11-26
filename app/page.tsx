const stats = [
  { label: "کل قراردادها", value: "۱۲", icon: "▤" },
  { label: "در انتظار تأیید", value: "۰۴", icon: "◷" },
  { label: "تکمیل‌شده", value: "۰۶", icon: "✓" },
  { label: "نیازمند اصلاح", value: "۰۲", icon: "!" }
];

const contracts = [
  { id: "CTR-1405-0012", title: "قرارداد ارائه خدمات مشاوره", parties: "علی رضایی، مریم احمدی", date: "۱۴۰۵/۰۸/۲۵", status: "در انتظار تأیید", tone: "waiting" },
  { id: "CTR-1405-0011", title: "قرارداد همکاری تجاری", parties: "شرکت نمونه، رضا کریمی", date: "۱۴۰۵/۰۸/۲۲", status: "تکمیل‌شده", tone: "done" },
  { id: "CTR-1405-0010", title: "قرارداد محرمانگی اطلاعات", parties: "سارا محمدی، امیر حسینی", date: "۱۴۰۵/۰۸/۲۰", status: "نیازمند اصلاح", tone: "edit" }
];

export default function Home() {
  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand"><div className="brand-mark">ق</div><div><strong>سامانه قرارداد</strong><small>مدیریت و تنظیم پیش‌نویس</small></div></div>
        <div className="nav-caption">منوی اصلی</div>
        <a className="nav-item active" href="#"><span>▦</span> داشبورد</a>
        <a className="nav-item" href="/contracts"><span>▤</span> قراردادها</a>
        <a className="nav-item" href="/contracts/new"><span>＋</span> ثبت قرارداد جدید</a>
        <a className="nav-item" href="/contracts"><span>▥</span> گزارش‌ها</a>
        <div className="nav-caption">مدیریت سامانه</div>
        <a className="nav-item" href="/contracts"><span>♙</span> اشخاص و کاربران</a>
        <a className="nav-item" href="/contracts"><span>⚙</span> تنظیمات</a>
        <div className="sidebar-bottom"><div className="avatar">م</div><div><strong>مدیر سامانه</strong><small>دسترسی مدیر</small></div><span className="dots">•••</span></div>
      </aside>
      <section className="main-area">
        <header className="topbar"><div><span className="breadcrumb">مدیریت سامانه</span><span className="slash">/</span><strong>داشبورد</strong></div><div className="top-actions"><span className="date">جمعه، ۷ آذر ۱۴۰۵</span><button className="icon-button" aria-label="اعلان‌ها">♧</button><div className="avatar small">م</div></div></header>
        <div className="content">
          <div className="welcome"><div><p className="eyebrow">پنل مدیریت</p><h1>داشبورد مدیریت قراردادها</h1><p className="muted">نمای کلی فعالیت‌ها و آخرین وضعیت قراردادهای سامانه</p></div><a className="primary-button" href="#new-contract">＋ ایجاد قرارداد جدید</a></div>
          <div className="stats-grid">{stats.map((s) => <article className="stat-card" key={s.label}><div className="stat-top"><span>{s.label}</span><span className="stat-icon">{s.icon}</span></div><strong>{s.value}</strong><small>آخرین وضعیت ثبت‌شده</small></article>)}</div>
          <section className="panel" id="contracts"><div className="panel-heading"><div><h2>آخرین قراردادها</h2><p className="muted">فهرست نمونه برای نمایش محیط سامانه</p></div><a href="#contracts" className="text-link">مشاهده همه ←</a></div>
            <div className="table-wrap"><table><thead><tr><th>شماره قرارداد</th><th>عنوان</th><th>طرفین قرارداد</th><th>تاریخ ثبت</th><th>وضعیت</th><th>عملیات</th></tr></thead><tbody>{contracts.map((c) => <tr key={c.id}><td className="code">{c.id}</td><td>{c.title}</td><td>{c.parties}</td><td>{c.date}</td><td><span className={`status ${c.tone}`}>{c.status}</span></td><td><a className="text-link" href="/contracts">باز کردن</a></td></tr>)}</tbody></table></div>
          </section>
          <div className="lower-grid"><section className="panel" id="new-contract"><div className="panel-heading"><div><h2>شروع سریع</h2><p className="muted">دسترسی به بخش‌های پرکاربرد</p></div></div><div className="quick-actions"><a href="#new-contract"><span>＋</span><b>ثبت قرارداد جدید</b><small>ایجاد پیش‌نویس قرارداد</small></a><a href="#people"><span>♙</span><b>افزودن شخص</b><small>ثبت اطلاعات طرف قرارداد</small></a><a href="#reports"><span>▥</span><b>گزارش‌گیری</b><small>مشاهده گزارش فعالیت‌ها</small></a></div></section><section className="notice"><div className="notice-icon">i</div><div><strong>نسخه اولیه سامانه</strong><p>این نسخه برای راه‌اندازی اولیه رابط کاربری آماده شده است. اطلاعات نمایش‌داده‌شده آزمایشی هستند و هنوز به پایگاه داده متصل نشده‌اند.</p></div></section></div>
          <footer>سامانه مستقل مدیریت و تنظیم پیش‌نویس قرارداد <span>نسخه ۱.۰.۰</span></footer>
        </div>
      </section>
    </main>
  );
}