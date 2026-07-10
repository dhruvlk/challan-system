import { Challan } from "@/types"
import { mockChallans } from "@/data/challans"

const STORAGE_KEYS = {
  CHALLANS: 'challan_system_challans',
}

export async function initializeChallansService(): Promise<void> {
  if (typeof window === 'undefined') return
  if (!localStorage.getItem(STORAGE_KEYS.CHALLANS)) {
    localStorage.setItem(STORAGE_KEYS.CHALLANS, JSON.stringify(mockChallans))
  }
}

export async function getChallans(): Promise<Challan[]> {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(STORAGE_KEYS.CHALLANS)
  return data ? JSON.parse(data) : []
}

async function saveChallans(challans: Challan[]): Promise<void> {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEYS.CHALLANS, JSON.stringify(challans))
}

export async function getChallanById(id: string): Promise<Challan | undefined> {
  const challans = await getChallans()
  return challans.find(c => c.id === id)
}

export async function addChallan(challan: Challan): Promise<void> {
  const challans = await getChallans()
  challans.push(challan)
  await saveChallans(challans)
}

export async function updateChallan(challan: Challan): Promise<void> {
  const challans = await getChallans()
  const index = challans.findIndex(c => c.id === challan.id)
  if (index !== -1) {
    challans[index] = challan
    await saveChallans(challans)
  }
}

export async function deleteChallan(id: string): Promise<void> {
  let challans = await getChallans()
  challans = challans.filter(c => c.id !== id)
  await saveChallans(challans)
}
