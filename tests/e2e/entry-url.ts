const localPagesBasePath = process.env.PLAYWRIGHT_LOCAL_PAGES_BASE_PATH;
const withQa = (url:string) => `${url}${url.includes("?")?"&":"?"}qa=1`;

export const testEntryUrl = withQa(process.env.PLAYWRIGHT_BASE_URL
  || (localPagesBasePath ? `http://127.0.0.1:4173${localPagesBasePath}` : "/"));
