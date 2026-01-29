"use client"

import { useEffect, useState } from "react"
import AuthPage from "@/components/auth-page"
import DashboardLayout from "@/components/dashboard_layout"

export default function Home() {
  const [authenticated, setAuthenticated] = useState(false)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    const auth = localStorage.getItem("authenticated")
    setAuthenticated(auth === "true")
    setChecked(true)
  }, [])

  if (!checked) return null

  if (!authenticated) {
    return <AuthPage onAuth={() => setAuthenticated(true)} />
  }

  return <DashboardLayout />
}
