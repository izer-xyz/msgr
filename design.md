# Msgr

Dashboard for daily scheduled activities and recent messages. 

## Features 

 * Dashboard - display day, date, time, today's schedule, and recent messages 
 * Calendar manager - schedule activities for a specific date or recurring acitivties for specific days    
 * Messages - send new messages
 * Server - TRMNL BYOS server

## Architecture 

 * Language: Typescript
 * Cloudflare Pages
   * functions
     * api/display.js
     * api/image/[hash].js
     * api/setup.js
     * api/log.js
     * screen/default.js
     * screen/dashboard.js
 * Cloudflare KV
   * calendar: date -> ical
   * messages: date-time -> message
   * cache: hash -> image
   * devices: id -> config 
 * Libraries:
   * @vercel/og - HTML -> SVG -> PNG
   * Jimp - PNG (RGBA) -> PNG (Greyscale)
   * ? - ical -> json 

## APIs

### EMAIL (*.ics attachment) #Calendar-manager
Schedule calendar event

'''
KV.calendar.put(ICS.ID, ICS)
'''

### EMAIL (no attachment) #Messages
Save message (date/time, subject and from)

'''
KV.messages.put(EMAIL.dateTime + EMAIL.ID, {EMAIL.subject, EMAIL.from})
'''

.
### GET /api/display #Dashboard #Server
Update Device status, and return content URL / next refresh 

Headers: 
 * ID
 * Access-Token 

'''
messages = KV.messages.list(now().dateTime)
activities = KV.calendar.list(now().dateTime)

image = Jimp.greyscale(vercel.og(dasboard(now(), messages, activities)))
KV.cache.put(hash, image)

'''

Response (application/json):

### GET /api/image/{hash}.png #Server
PNG content by hash

Headers: 
 * ID
 * Access-Token 

Response (image/png):
 * binary

'''
return KV.cache.get(hash)
'''

### GET /api/setup #Server
Register new Device

Headers: 
 * ID

Response (application/json):
 * Access-Token

### POST /api/log #Server
Device logs

Headers: 
 * ID
 * Access-Token 

Response (application/json):
 * message
