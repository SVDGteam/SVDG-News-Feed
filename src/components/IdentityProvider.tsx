'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { getStoredUserName, storeUserName } from '@/lib/identity'

interface IdentityContextValue {
  userName: string
  setUserName: (name: string) => void
}

const IdentityContext = createContext<IdentityContextValue>({
  userName: '',
  setUserName: () => {},
})

export function IdentityProvider({ children }: { children: React.ReactNode }) {
  const [userName, setUserNameState] = useState('')

  // Read from localStorage on mount (client-only — avoids hydration mismatch).
  useEffect(() => {
    setUserNameState(getStoredUserName())
  }, [])

  function setUserName(name: string) {
    storeUserName(name)
    setUserNameState(name)
  }

  return (
    <IdentityContext.Provider value={{ userName, setUserName }}>
      {children}
    </IdentityContext.Provider>
  )
}

// Returns { userName, setUserName }. userName is '' until the person has
// picked their name from the team list.
export function useIdentity() {
  return useContext(IdentityContext)
}
