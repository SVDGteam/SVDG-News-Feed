/**
 * Lightweight "accounts" — no passwords, just a name picked from the team
 * roster and remembered in this browser. Used as the key for per-person
 * state: reactions (like/dislike), read status, and the reading list.
 */

export const TEAM_MEMBERS = ['Simone', 'Merritt', 'Mike', 'Emily']

export const USER_NAME_KEY = 'svdg-user-name'

export function getStoredUserName(): string {
  if (typeof window === 'undefined') return ''
  return window.localStorage.getItem(USER_NAME_KEY) ?? ''
}

export function storeUserName(name: string): void {
  if (typeof window === 'undefined') return
  if (name) {
    window.localStorage.setItem(USER_NAME_KEY, name)
  } else {
    window.localStorage.removeItem(USER_NAME_KEY)
  }
}
