"use client";
import { useEffect, useState } from "react";
type Draft = { id: string; title: string; createdAt: string; status: string; obligor: string; obligee: string };
export default function ContractsPage() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  useEffect(() => { try { setDrafts(JSON.parse(localStorage.getItem("contract-drafts-v1") || "[]")); } catch {} }, []);
  return <main className="editor-page"><header className="editor-header"><a href="/">← داشبورد</a><span>فهرست قراردادها</span></header><div className="editor-wrap"><div className="editor-heading"><div><h1>قراردادهای ثبت‌شده</h1><p className="muted">پیش‌نویس‌های ذخیره‌شده در این مرورگر</p></div><a className="primary-button" href="/contracts/new">＋ قرارداد جدید</a></div>{drafts.length ? <div className="editor-card"><div className="table-wrap"><table><thead><tr><th>عنوان</th><th>متعهد</th><th>متعهدله</th><th>تاریخ</th><th>عملیات</th></tr></thead><tbody>{drafts.map(d => <tr key={d.id}><td>{d.title}</td><td>{d.obligor || "تکمیل نشده"}</td><td>{d.obligee || "تکمیل نشده"}</td><td>{new Date(d.createdAt).toLocaleDateString("fa-IR")}</td><td><a className="text-link" href={`/contracts/${d.id}`}>باز کردن و ویرایش</a></td></tr>)}</tbody></table></div></div> : <div className="editor-card empty-state"><h2>هنوز قراردادی ذخیره نشده است</h2><p className="muted">با ایجاد قرارداد جدید، پیش‌نویس‌های شما اینجا نمایش داده می‌شوند.</p><a className="primary-button" href="/contracts/new">ایجاد اولین قرارداد</a></div>}</div></main>;
}
