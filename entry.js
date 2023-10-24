const turbo = require('@turbo360/turbo-sdk');
const app = require('./app');

const TURBO_ROUTES = process.env.TURBO_ROUTES || '{"www": {"main":{"path":"","methods":["get"],"func":"main"}}}'
const ENV = process.env.TURBO_ENV || 'local'

const routes = JSON.parse(TURBO_ROUTES)
const entries = {};
Object.keys(routes).forEach(route => (entries[route] = app(routes[route])));

if (ENV === 'local') {
  turbo.local(() => app(routes), true)
  console.log('\nDev server running.\nOpen browser to http://localhost:3000');
  return;
}

module.exports.handler = turbo.production(subdomain => {
  return entries[subdomain] || entries['www'];
}, true);
