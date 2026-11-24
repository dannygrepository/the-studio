import { createContext, useContext } from 'react'

export type View =
  | { type: 'channel'; id: string }
  | { type: 'lesson'; id: string }
  | { type: 'people' }
  | { type: 'dictionary' }

export const NavContext = createContext<{ view: View; go: (v: View) => void }>({
  view: { type: 'channel', id: 'general' },
  go: () => {},
})

export const useNav = () => useContext(NavContext)
