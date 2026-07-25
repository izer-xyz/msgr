const DEFAULTS = {
  height: 1404,
  width: 1872,
  screen: 'welcome',
  refresh_rate: 60, 
  api_key: null, 
  friendly_id: null,
}; 

export default function lookup(headers, kv, persist = true) {
  const device = kv.get(headers.get('id'), 'json');

  // All headers are lowercase
  const trmnlHeaders = Object.fromEntries(headers.entries().filter(
    ([key]) => TRMNL_HEADERS.includes(key)
  )); 
  console.log(`[${ device.id }] ${ JSON.stringify(trmnlHeaders) }`); 
  
  const newDevice = { ...DEFAULTS, ...device, ...trmnlHeaders };

  if (persist) save(newDevice, kv); 
  
  return newDevice;
}; 

export function save(device, kv) {
  device.updated = new Date().toISOString(); 
  kv.put(device.id, JSON.stringify(device));
}; 

const TRMNL_HEADERS = [
  'access_token'
  ,'battery_capacity'
  ,'battery_charging'
  ,'battery_count'
  ,'battery_current'
  ,'battery_health'
  ,'battery_temp'
  ,'battery_voltage'
  ,'fw_version'
  ,'height'
  ,'id'
  ,'image_cached'
  ,'model'
  ,'percent_charged'
  ,'refresh_rate'
  ,'rssi'
  ,'sensors'
  ,'temperature_profile'
  ,'update_source'
  ,'usb_connected'
  ,'wake_time'
  ,'width'
]
