const localPagesBasePath = process.env.PLAYWRIGHT_LOCAL_PAGES_BASE_PATH;

export const testEntryUrl = process.env.PLAYWRIGHT_BASE_URL
  || (localPagesBasePath ? `http://127.0.0.1:4173${localPagesBasePath}` : "/");
