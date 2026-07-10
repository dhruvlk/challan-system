import { Party } from "@/types"
import { mockParties } from "@/data/parties"

const STORAGE_KEYS = {
  PARTIES: 'challan_system_parties',
}

export async function initializePartiesService(): Promise<void> {
  if (typeof window === 'undefined') return
  if (!localStorage.getItem(STORAGE_KEYS.PARTIES)) {
    localStorage.setItem(STORAGE_KEYS.PARTIES, JSON.stringify(mockParties))
  }
}

export async function getParties(): Promise<Party[]> {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(STORAGE_KEYS.PARTIES)
  return data ? JSON.parse(data) : []
}

async function saveParties(parties: Party[]): Promise<void> {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEYS.PARTIES, JSON.stringify(parties))
}

export async function addParty(party: Party): Promise<void> {
  const parties = await getParties()
  parties.push(party)
  await saveParties(parties)
}

export async function updateParty(party: Party): Promise<void> {
  const parties = await getParties()
  const index = parties.findIndex(p => p.id === party.id)
  if (index !== -1) {
    parties[index] = party
    await saveParties(parties)
  }
}

export async function deleteParty(id: string): Promise<void> {
  let parties = await getParties()
  parties = parties.filter(p => p.id !== id)
  await saveParties(parties)
}
