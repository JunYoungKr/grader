import { GA_DEBUG, GA_ID, gaEnabled } from "@/lib/gtag";

export function GoogleTag() {
  if (!gaEnabled) return null;

  return (
    <>
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());if(!location.pathname.startsWith('/admin')){gtag('config','${GA_ID}',{debug_mode:${GA_DEBUG}});}`,
        }}
      />
    </>
  );
}
