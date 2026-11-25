"use client"; // error boundaries must be client components

import "./globals.css";

/* The last-resort error page, used only when the root layout itself fails, so
   it can't use the site's header, footer or branch picker (they need the
   branches table). The everyday error page is (site)/error.tsx.
   Spec: docs/requirements/Requirements_NotFound.md section 3 */
const themeScript = `(function(){try{var t=localStorage.getItem("vslm-theme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}})()`;

export default function GlobalError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <html lang="en">
      <head>
        <title>Something went wrong | VS Lens Mart</title>
        <meta name="robots" content="noindex" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <main className="container">
          <section className="notfound notfound--page">
            <p className="caps notfound__code">Error</p>
            <h1>Something went wrong on our side.</h1>
            <p>Please try again. If it keeps happening, call or WhatsApp us and we&apos;ll help straight away.</p>
            <div className="empty__actions">
              <button className="btn btn--primary" type="button" onClick={() => retry()}>Try again</button>
              {/* A plain link on purpose: a full page load, in case the app itself is what failed */}
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
              <a className="btn btn--outline-dark" href="/">Back to home</a>
            </div>
          </section>
        </main>
      </body>
    </html>
  );
}
