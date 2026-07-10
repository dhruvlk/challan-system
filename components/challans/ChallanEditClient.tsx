"use client"

import { useEffect, useState } from "react"
import { ChallanForm } from "@/components/challans/challan-form"
import { getChallanById } from "@/services/challans.service"
import { notFound } from "next/navigation"
import { Challan } from "@/types"

export default function ChallanEditClient({ id }: { id: string }) {
  const [challan, setChallan] = useState<Challan | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadChallan() {
      const found = await getChallanById(id)
      if (found) {
        setChallan(found)
      }
      setLoading(false)
    }
    loadChallan()
  }, [id])

  if (loading) return <div>Loading...</div>

  if (!challan) {
    return <div>Challan not found.</div>
  }

  return (
    <div className="container mx-auto py-10 max-w-5xl">
      <ChallanForm initialData={challan} />
    </div>
  )
}
