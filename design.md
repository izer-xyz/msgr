# Msgr

Dashboard for daily scheduled activities and recent messages. 

## Features 

 * Dashboard - display day, date, time, today's schedule, and daily/recent messages 
 * Calendar manager - schedule activities for a specific date or recurring acitivties for specific days    
 * Messages - send new messages and manage recurring messages
 * Server - TRMNL BYOS server

## Architecture

 * Language: JavaScript
 * Cloudflare Workers
 * Cloudflare KV
 * Libraries:
   * takumi-js - HTML  -> Raw
   * luxon - date, time and timezone managent
   * @cf-wasm/png - raw -> PNG

## Workers 

### admin

The `admin` worker is the management interface for a group to manage the schedule and send messages to the board. 

 * The main entry point is the index.html. 
 * Access is controlled by Cloudflare Access. 

### api

API is the TRMNL BYOS server implementation on cloudflare worker. 

### img

API entry point to render PNG images to be displayed on the board. The pictures are pre-procssed to TRMNL standard (1-4 bit Grayscale PNG). 

### email 

Future capability to send messages and schedule event via email. 

## APIs
