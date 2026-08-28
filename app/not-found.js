import Link from 'next/link';

export const metadata = {
  title: '404 — XVVIIX',
};

export default function NotFound() {
  return (
    <main className="notfound">
      <span className="notfound__kicker">404 — Lost chapter</span>
      <h1 className="notfound__title" aria-label="404">
        4<span>/</span>0<span>/</span>4
      </h1>
      <p className="notfound__en">
        This page was never built — the rest of the experience still is.
      </p>
      <p className="notfound__fa" dir="rtl" lang="fa">
        این صفحه ساخته نشده — بقیهٔ تجربه هنوز آنجاست.
      </p>
      <Link className="notfound__cta" href="/">
        <span>Return to the journey</span>
        <small dir="rtl" lang="fa">بازگشت به تجربه</small>
        <b aria-hidden="true">↗</b>
      </Link>
    </main>
  );
}
