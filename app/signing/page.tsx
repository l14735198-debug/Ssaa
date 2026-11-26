"use client";

import { useEffect, useState } from "react";

type Signer = { id: string; fullName: string; role: string; tokenExpiresAt: string; revokedAt: string | null; viewedAt: string | null; signedAt: string | null };
type Contract = { id: string; title: string; status: string; signers: Signer[] };
type LinkItem = { signerId: string; fullName: string; role: string; url: string; expiresAt: string };

export default function SigningAdminPage() {
  const [key, setKey] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [people, setPeople] = useState([{ fullName: "", role: "متعهد" }]);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    const r = await fetch("/api/signing/contracts", { cache: "no-store" });
    const d = await r.json(); if (!r.ok) throw new Error(d.error || "خطا");
    setContracts(d.contracts);
  }
  useEffect(() => { if (authenticated) load().catch(e => setMessage(e.message)); }, [authenticated]);

  async function login(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setMessage("");
    try {
      const r = await fetch("/api/signing/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key }) });
      const d = await r.json(); if (!r.ok) throw new Error(d.error || "ورود ناموفق بود");
      setKey(""); setAuthenticated(true); setMessage("ورود مدیر با نشست امن انجام شد.");
    } catch (e) { setMessage(e instanceof Error ? e.message : "خطا"); } finally { setBusy(false); }
  }
  async function logout() {
    await fetch("/api/signing/session", { method: "DELETE" });
    setAuthenticated(false); setContracts([]); setLinks([]); setMessage("از پنل خارج شدید.");
  }
  async function createContract(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setMessage(""); setLinks([]);
    try {
      const r = await fetch("/api/signing/contracts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title, body, signers: people }) });
      const d = await r.json(); if (!r.ok) throw new Error(d.error || "ایجاد قرارداد ناموفق بود");
      setLinks(d.links); setTitle(""); setBody(""); setPeople([{ fullName: "", role: "متعهد" }]); await load();
    } catch (e) { setMessage(e instanceof Error ? e.message : "خطا"); } finally { setBusy(false); }
  }
  async function action(id: string, method: "DELETE" | "PATCH") {
    const r = await fetch("/api/signing/invites/" + id, { method });
    const d = await r.json(); if (!r.ok) { setMessage(d.error || "خطا"); return; }
    if (d.url) setLinks([{ signerId: id, fullName: "لینک جدید", role: "", url: d.url, expiresAt: d.expiresAt }]);
    await load();
  }
  const copy = async (url: string) => { await navigator.clipboard.writeText(url); setMessage("لینک کپی شد؛ آن را شخصاً برای امضاکننده ارسال کنید."); };

  return <main className="editor-page" dir="rtl"><header className="editor-header"><span>سامانه هوشمند مدیریت قرارداد</span><span>مدیریت لینک‌های امضا</span></header><div className="editor-wrap">
    <div className="editor-heading"><div><p className="eyebrow">پنل مدیر</p><h1>مدیریت امضای طرفین قرارداد</h1><p className="muted">لینک هر امضاکننده مستقل است؛ ارسال پیامکی یا واتساپی انجام نمی‌شود.</p></div>{authenticated && <button className="secondary-button" onClick={logout}>خروج امن</button>}</div>
    {!authenticated && <form className="editor-card" onSubmit={login}><h2>ورود مدیر</h2><label>کلید دسترسی<input type="password" value={key} onChange={e => setKey(e.target.value)} placeholder="کلید محرمانه مدیر" autoComplete="current-password" required /></label><p className="muted">پس از ورود، کلید در کوکی امن HttpOnly نگهداری نمی‌شود؛ فقط شناسه نشست امضاشده ذخیره خواهد شد.</p><button className="primary-button" type="submit" disabled={busy || !key}>{busy ? "در حال بررسی..." : "ورود به پنل"}</button></form>}
    {message && <p className="saved-message" role="status">{message}</p>}
    {authenticated && <>
      <form className="editor-card" onSubmit={createContract}><h2>ایجاد قرارداد و لینک‌های اختصاصی</h2>
        <label>عنوان قرارداد<input required value={title} onChange={e => setTitle(e.target.value)} /></label>
        <label>متن کامل قرارداد<textarea required rows={10} value={body} onChange={e => setBody(e.target.value)} /></label>
        <h3>امضاکنندگان</h3>
        {people.map((p,i)=><div key={i} className="form-grid"><label>نام و نام خانوادگی<input required value={p.fullName} onChange={e=>setPeople(old=>old.map((x,j)=>j===i?{...x,fullName:e.target.value}:x))}/></label><label>نقش<select value={p.role} onChange={e=>setPeople(old=>old.map((x,j)=>j===i?{...x,role:e.target.value}:x))}><option>متعهد</option><option>متعهدله</option><option>شاهد</option><option>سایر</option></select></label><button type="button" className="secondary-button" onClick={()=>setPeople(old=>old.filter((_,j)=>j!==i))} disabled={people.length===1}>حذف</button></div>)}
        <button type="button" className="secondary-button" onClick={()=>setPeople(old=>[...old,{fullName:"",role:"متعهدله"}])}>افزودن امضاکننده</button>
        <button className="primary-button" type="submit" disabled={busy}>{busy?"در حال ایجاد...":"ایجاد قرارداد و تولید لینک‌ها"}</button>
      </form>
      {links.length>0 && <section className="editor-card"><h2>لینک‌های صادرشده — اعتبار ۷ روز</h2>{links.map(l=><div key={l.signerId} className="signer-row"><div><strong>{l.fullName}</strong><p className="muted">{l.role} · انقضا: {new Date(l.expiresAt).toLocaleString("fa-IR")}</p><code>{l.url}</code></div><button className="secondary-button" onClick={()=>copy(l.url)}>کپی لینک</button></div>)}</section>}
      <section className="editor-card"><h2>قراردادها و وضعیت امضا</h2>{contracts.length===0?<p className="muted">قراردادی ثبت نشده است.</p>:contracts.map(c=><div key={c.id} className="contract-list-item"><h3>{c.title}</h3>{c.signers.map(s=><div key={s.id} className="signer-row"><div><strong>{s.fullName}</strong><p className="muted">{s.role} · {s.signedAt?"امضا شده":s.viewedAt?"مشاهده شده":s.revokedAt?"لغو شده":"در انتظار"} · {s.tokenExpiresAt && "انقضا "+new Date(s.tokenExpiresAt).toLocaleDateString("fa-IR")}</p></div><div className="button-row"><button className="secondary-button" onClick={()=>action(s.id,"PATCH")} disabled={!!s.signedAt}>صدور لینک جدید</button><button className="secondary-button" onClick={()=>action(s.id,"DELETE")} disabled={!!s.revokedAt}>لغو لینک</button></div></div>)}</div>)}</section>
    </>}
  </div></main>;
}
