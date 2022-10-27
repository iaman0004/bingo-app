/**
 * 
 * @param url 
 * @returns {pathKey: queryValue}
 */
export const fetchPathQuery = (url: string): object => {
  const queries = {};
  url.split("?").at(1)?.split('&').forEach(q => {
    const qr = q.split('=');
    queries[qr.at(0) || "_"]  = qr.at(1);
  });
  return queries;
}