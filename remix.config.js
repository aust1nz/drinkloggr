/** @type {import('@remix-pwa/dev').WorkerConfig} */
/** @type {import('@remix-run/dev').AppConfig} */
export default {
  ignoredRouteFiles: ['**/.*'],
  serverDependenciesToBundle: [/@remix-pwa\/.*/],
};
