const localPagesBasePath = process.env.PLAYWRIGHT_LOCAL_PAGES_BASE_PATH;
const localPort = process.env.PLAYWRIGHT_LOCAL_PORT ?? "4176";
const withQa = (url:string) => `${url}${url.includes("?")?"&":"?"}qa=1`;

export const testEntryUrl = withQa(process.env.PLAYWRIGHT_BASE_URL
  || (localPagesBasePath ? `http://127.0.0.1:${localPort}${localPagesBasePath}` : "/"));
