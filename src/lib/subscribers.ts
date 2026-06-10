/**
 * Simple JSON-file store for Weekly Rundown newsletter subscribers.
 * Mirrors the pattern used in lib/db.ts.
 */

import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { Subscriber } from '@/types/subscriber'

const DB_PATH = path.join(process.cwd(), 'data', 'subscribers.json')

function ensureDB(): void {
  const dir = path.join(process.cwd(), 'data')
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify([], null, 2))
  }
}

export function getAllSubscribers(): Subscriber[] {
  ensureDB()
  const raw = fs.readFileSync(DB_PATH, 'utf-8')
  return JSON.parse(raw)
}

export function addSubscriber(email: string, source?: string): { subscriber: Subscriber; alreadySubscribed: boolean } {
  const all = getAllSubscribers()
  const normalized = email.trim().toLowerCase()

  const existing = all.find((s) => s.email === normalized)
  if (existing) return { subscriber: existing, alreadySubscribed: true }

  const subscriber: Subscriber = {
    id: uuidv4(),
    email: normalized,
    source,
    createdAt: new Date().toISOString(),
  }

  all.push(subscriber)
  fs.writeFileSync(DB_PATH, JSON.stringify(all, null, 2))
  return { subscriber, alreadySubscribed: false }
}
