const DEFAULTS = {
  panel: 'E1003',
  height: 1404,
  width: 1872,
  screen: 'welcome',
  refresh: 60, 
}; 

const UPPERCASE = /[A-Z]/g

export default function lookup(headers, kv, persist = true) {
  const device = kv.get(headers.get('ID'), 'json');

  // All TRMNL headers are uppercase
  const trmnlHeaders = Object.fromEntries(headers.entries()).filter(
    ([key]) => UPPERCASE.test(key)
  ); 
  console.log(`[${ device.ID }] ${ JSON.stringify(trmnlHeaders) }`); 
  
  const newDevice = { ...DEFAULTS, ...device, ...trmnlHeaders };

  if (persist) save(newDevice, kv); 
  
  return newDevice;
}; 

export function save(device, kv) {
  device.updated = new Date().toISOString(); 
  kv.put(device.ID, JSON.stringify(device));
}; 