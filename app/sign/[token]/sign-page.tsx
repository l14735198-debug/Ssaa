"use client";

import { useEffect, useRef, useState } from "react";

type Invite = { signer: { fullName: string; role: string }; contract: { title: string; body: string } };

export default function SignPage({ token }: { token: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [invite, setInvite] = useState<Invite | null>(null);
  const [error, setError] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    fetch(`/sign/${encodeURIComponent(token)}`).then(async r => {
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "دریافت قرارداد ناموفق بود");
      setInvite(data);
    }).catch(e => setError(e.message));
  }, [token]);

  function point(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return { x: (e.clientX - rect.left) * canvas.width / rect.width, y: (e.clientY - rect.top) * canvas.height / rect.height };
  }
  function start(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!;
    canvas.setPointerCapture(e.pointerId);
    const ctx = canvas.getContext("2d")!;
    const p = point(e); ctx.beginPath(); ctx.moveTo(p.x, p.y); drawing.current = true;
  }
  function move(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const ctx = canvasRef.current!.getContext("2d")!;
    const p = point(e); ctx.lineWidth = 2.4; ctx.lineCap = "round"; ctx.strokeStyle = "#172b4d"; ctx.lineTo(p.x, p.y); ctx.stroke();
  }
  function stop() { drawing.current = false; }
  async function submit() {
    const canvas = canvasRef.current;
    if (!canvas || !accepted) { setError("ابتدا مفاد قرارداد را بپذیرید."); return; }
    setBusy(true); setError("");
    try {
      const response = await fetch(`/sign/${encodeURIComponent(token)}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ accepted, signature: canvas.toDataURL("image/png") }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "ثبت امضا انجام نشد");
      setDone(true);
    } catch (e) { setError(e instanceof Error ? e.message : "خطای نامشخص"); }
    finally { setBusy(false); }
  }

  return <main className="editor-page" dir="rtl"><header className="editor-header"><span>سامانه هوشمند مدیریت و تنظیم پیش‌نویس قرارداد</span><span>صفحه امضای اختصاصی</span></header><div className="editor-wrap">
    {error && <p className="saved-message" role="alert">{error}</p>}
    {done ? <section className="editor-card empty-state"><h1>امضای شما ثبت شد</h1><p className="muted">زمان ثبت و رویداد امضا در سامانه ذخیره شد. امضای ترسیمی جایگزین اثر انگشت یا احراز هویت مستقل نیست.</p></section> : invite ? <>
      <div className="editor-heading"><div><p className="eyebrow">امضاکننده: {invite.signer.fullName} — {invite.signer.role}</p><h1>{invite.contract.title}</h1><p className="muted">متن قرارداد را با دقت مطالعه کنید.</p></div></div>
      <section className="editor-card"><h2>متن قرارداد</h2><pre className="contract-preview">{invite.contract.body}</pre></section>
      <section className="editor-card"><h2>امضای ترسیمی</h2><p className="muted">با انگشت یا ماوس در کادر زیر امضا کنید. این تصویر صرفاً امضای ترسیمی است.</p><canvas ref={canvasRef} width={900} height={220} style={{ width: "100%", height: 180, border: "1px solid #cbd5e1", borderRadius: 8, touchAction: "none", background: "#fff" }} onPointerDown={start} onPointerMove={move} onPointerUp={stop} onPointerCancel={stop} /><button className="secondary-button" onClick={() => { const c = canvasRef.current?.getContext("2d"); c?.clearRect(0,0,900,220); }}>پاک کردن و امضای مجدد</button>
        <label style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 9, marginTop: 20 }}><input type="checkbox" checked={accepted} onChange={e => setAccepted(e.target.checked)} /> متن قرارداد را خواندم و مفاد آن را می‌پذیرم.</label>
        <button className="primary-button" disabled={busy || !accepted} onClick={submit} style={{ marginTop: 18 }}>{busy ? "در حال ثبت..." : "ثبت امضا"}</button>
      </section>
    </> : !error ? <section className="editor-card">در حال بررسی لینک امضا...</section> : null}
  </div></main>;
}
