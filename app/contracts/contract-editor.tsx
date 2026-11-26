"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Draft = { id: string; title: string; createdAt: string; status: string; body: string; obligor: string; obligee: string; subject: string; amount: string; dueDate: string; notes: string; mode: "blank" | "prefill" };

const STORAGE_KEY = "contract-drafts-v1";
const template = `قرارداد تعهد

این قرارداد در تاریخ {{تاریخ}} میان اشخاص زیر منعقد می‌گردد:

۱. متعهد: {{متعهد}}
۲. متعهدله (تعهدگیرنده): {{متعهدله}}

ماده ۱ ـ موضوع تعهد
{{موضوع تعهد}}

ماده ۲ ـ مبلغ یا ارزش تعهد
{{مبلغ}}

ماده ۳ ـ مهلت انجام تعهد
{{مهلت}}

ماده ۴ ـ شرایط و توضیحات تکمیلی
{{توضیحات}}

امضای متعهد:                         امضای متعهدله:
`;

export default function ContractEditor({ contractId }: { contractId?: string }) {
  const router = useRouter();
  const [title, setTitle] = useState("قرارداد تعهد");
  const [obligor, setObligor] = useState("");
  const [obligee, setObligee] = useState("");
  const [subject, setSubject] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [mode, setMode] = useState<"blank" | "prefill">("blank");
  const [body, setBody] = useState(template);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!contractId) return;
    try {
      const all: Draft[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      const found = all.find((item) => item.id === contractId);
      if (found) {
        setTitle(found.title); setObligor(found.obligor); setObligee(found.obligee);
        setSubject(found.subject); setAmount(found.amount); setDueDate(found.dueDate); setNotes(found.notes || '');
        setMode(found.mode); setBody(found.body);
      }
    } catch { /* ignore invalid local draft data */ }
  }, [contractId]);

  const rendered = useMemo(() => {
    const values: Record<string, string> = {
      "تاریخ": new Date().toLocaleDateString("fa-IR"),
      "متعهد": mode === "blank" && !obligor ? "........................" : obligor || "........................",
      "متعهدله": mode === "blank" && !obligee ? "........................" : obligee || "........................",
      "موضوع تعهد": subject || "................................................................",
      "مبلغ": amount || "................................",
      "مهلت": dueDate || "................................",
      "توضیحات": notes || "................................................................"
    };
    return body.replace(/\{\{([^}]+)\}\}/g, (_, key: string) => values[key] ?? "........................");
  }, [body, mode, obligor, obligee, subject, amount, dueDate, notes]);

  function saveDraft() {
    const id = contractId || (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()));
    const item: Draft = { id, title, createdAt: new Date().toISOString(), status: "پیش‌نویس", body, obligor, obligee, subject, amount, dueDate, notes, mode };
    try {
      const all: Draft[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      const next = all.some((draft) => draft.id === id) ? all.map((draft) => draft.id === id ? item : draft) : [item, ...all];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setSaved(true);
      if (!contractId) router.push(`/contracts/${id}`);
    } catch { alert("ذخیره‌سازی در مرورگر انجام نشد. فضای ذخیره‌سازی را بررسی کنید."); }
  }

  return <main className="editor-page">
    <header className="editor-header"><a href="/">← بازگشت به داشبورد</a><span>سامانه هوشمند مدیریت و تنظیم پیش‌نویس قرارداد</span></header>
    <div className="editor-wrap">
      <div className="editor-heading"><div><p className="eyebrow">تنظیم سند جدید</p><h1>{contractId ? "ویرایش پیش‌نویس قرارداد" : "ایجاد قرارداد جدید"}</h1><p className="muted">اطلاعات طرفین و بندهای تعهد را وارد کنید یا جای خالی را برای تکمیل بعدی باقی بگذارید.</p></div><button className="primary-button" onClick={saveDraft}>ذخیره پیش‌نویس</button></div>
      {saved && <p className="saved-message">پیش‌نویس در همین مرورگر ذخیره شد.</p>}
      <section className="editor-card">
        <h2>۱. مشخصات قرارداد</h2>
        <label>عنوان قرارداد<input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="مثلاً قرارداد انجام تعهد" /></label>
        <div className="mode-box"><strong>نحوه تکمیل مشخصات طرفین</strong><div className="mode-options"><label><input type="radio" checked={mode === "blank"} onChange={() => setMode("blank")} /> جای خالی بماند تا طرفین تکمیل کنند</label><label><input type="radio" checked={mode === "prefill"} onChange={() => setMode("prefill")} /> اطلاعات را من از ابتدا وارد می‌کنم</label></div></div>
        <div className="fields-grid">
          <label>متعهد (انجام‌دهنده تعهد)<input value={obligor} onChange={(e) => setObligor(e.target.value)} placeholder="نام و نام خانوادگی / نام شرکت" /></label>
          <label>متعهدله (تعهدگیرنده)<input value={obligee} onChange={(e) => setObligee(e.target.value)} placeholder="نام و نام خانوادگی / نام شرکت" /></label>
          <label className="wide">موضوع تعهد<textarea value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="شرح دقیق کاری که متعهد باید انجام دهد" rows={3} /></label>
          <label>مبلغ یا ارزش تعهد<input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="در صورت وجود" /></label>
          <label>مهلت انجام تعهد<input value={dueDate} onChange={(e) => setDueDate(e.target.value)} placeholder="مثلاً تا تاریخ ۱۴۰۵/۱۲/۲۹" /></label>
          <label className="wide">توضیحات و شروط تکمیلی<textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="شرایط، ضمانت اجرا و توضیحات مورد توافق" /></label>
        </div>
      </section>
      <section className="editor-card">
        <div className="section-title"><div><h2>۲. متن قرارداد</h2><p className="muted">متن را می‌توانید مستقیماً ویرایش کنید. عبارت‌های داخل آکولاد هنگام پیش‌نمایش با اطلاعات فرم جایگزین می‌شوند.</p></div><button className="secondary-button" onClick={() => setBody(template)}>بازگردانی متن نمونه</button></div>
        <textarea className="contract-textarea" dir="rtl" value={body} onChange={(e) => setBody(e.target.value)} rows={17} />
      </section>
      <section className="editor-card">
        <div className="section-title"><div><h2>۳. پیش‌نمایش متن تکمیل‌شده</h2><p className="muted">جای خالی‌های تکمیل‌نشده برای درج اطلاعات بعدی باقی می‌مانند.</p></div><button className="secondary-button" onClick={() => navigator.clipboard?.writeText(rendered)}>کپی متن قرارداد</button></div>
        <pre className="contract-preview">{rendered}</pre>
      </section>
      <p className="legal-note">این ابزار برای تهیه پیش‌نویس است. پیش از امضا، هویت و اهلیت طرفین، مفاد قرارداد و الزامات قانونی را بررسی کنید. ذخیره‌سازی فعلی فقط روی همین مرورگر انجام می‌شود و این نسخه لینک تکمیل برای طرف مقابل یا امضای الکترونیکی ندارد.</p>
      <div className="bottom-actions"><a className="secondary-button" href="/contracts">فهرست قراردادها</a><button className="primary-button" onClick={saveDraft}>ذخیره پیش‌نویس</button></div>
    </div>
  </main>;
}
