const DEFAULTS = {
  height: '1404',
  width: '1872',
  screen: 'welcome',
  refresh_rate: '60', 
  api_key: null, 
  friendly_id: null,
  depth: '4',
}; 

export default async function lookup(headers, kv, persist = true) {
  const device = await kv.get(headers.get('id'), 'json');

  // All headers are lowercase
  const trmnlHeaders = Object.fromEntries(headers.entries().filter(
    ([key]) => !IGNORE_HEADERS.includes(key)
  )); 
  
  const newDevice = { ...DEFAULTS, ...device, ...trmnlHeaders };
  console.log(`[${ newDevice.id }] ${ JSON.stringify(trmnlHeaders) }`); 

  if (persist) save(newDevice, kv); 
  
  return newDevice;
}; 

export function save(device, kv) {
  device.updated = new Date().toISOString(); 
  kv.put(device.id, JSON.stringify(device));
}; 

const IGNORE_HEADERS = [
  'host', 
  'connection', 
  'content-type',
  'user-agent',
  'api_key', 
  'screen',
  'depth',
  'refresh_rate',
  'cf-ray', 
  'accept-encoding',
  'x-forwarded-proto'
  'cf-connecting-ip', 
  'updated', 
  'fw-commit'
]