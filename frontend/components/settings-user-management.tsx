"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Settings, Users, Shield, Plus, Edit, Trash2, Key, Bell, Globe } from "lucide-react"
import { useDashboardData } from "@/hooks/use-api-data"
import type { AppSettings } from "@/hooks/use-api-data"

// -------------------- DEFAULTS --------------------
const DEFAULT_SETTINGS: AppSettings = {
  companyName: "",
  timezone: "UTC-5",
  emailNotifications: false,
  slackNotifications: false,
  smsNotifications: false,
  twoFactorAuth: false,
  passwordMinLength: 8,
  passwordComplexity: false,
  sessionTimeout: 30,
}

// -------------------- COMPONENT --------------------
export function SettingsUserManagement() {
  const { appSettings } = useDashboardData()

  const [activeTab, setActiveTab] = useState("general")
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS)
  const [users, setUsers] = useState<any[]>([])
  const [newUser, setNewUser] = useState({ username: "", email: "", role: "" })

  // Load backend users on mount
  useEffect(() => {
    fetchUsers()
  }, [])

  // Sync settings with backend
  useEffect(() => {
    if (appSettings) setSettings(appSettings)
  }, [appSettings])

  // -------------------- FETCH USERS --------------------
  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/users")
      const data = await res.json()
      setUsers(data)
    } catch (err) {
      console.error("Failed to load users:", err)
    }
  }

  // -------------------- ADD USER --------------------
  const handleAddUser = async () => {
    if (!newUser.username || !newUser.email || !newUser.role) {
      alert("Please fill all fields before adding user.")
      return
    }

    try {
      const res = await fetch("http://localhost:8000/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      })

      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`)
      const data = await res.json()
      alert(data.message || "User added successfully!")
      setIsAddUserOpen(false)
      setNewUser({ username: "", email: "", role: "" })
      fetchUsers()
    } catch (err) {
      console.error("Error adding user:", err)
      alert("Failed to add user. Check backend connection.")
    }
  }

  // -------------------- UTILITIES --------------------
  const getRoleColor = (role: string) => {
    switch (role) {
      case "Admin": return "bg-red-100 text-red-800"
      case "Security Analyst": return "bg-blue-100 text-blue-800"
      case "Auditor": return "bg-green-100 text-green-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => (
    status === "Active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
  )

  const handleSettingChange = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  // -------------------- RENDER --------------------
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-800">Settings & User Management</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general" className="flex items-center gap-2"><Settings className="h-4 w-4" />General</TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2"><Users className="h-4 w-4" />User Management</TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2"><Shield className="h-4 w-4" />Security</TabsTrigger>
        </TabsList>

        {/* -------------------- USER MANAGEMENT TAB -------------------- */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>User Management</CardTitle>
                <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-teal-600 hover:bg-teal-700">
                      <Plus className="h-4 w-4 mr-2" /> Add New User
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Add New User</DialogTitle></DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="new-username">Username</Label>
                        <Input
                          id="new-username"
                          placeholder="Enter username"
                          value={newUser.username}
                          onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="new-email">Email</Label>
                        <Input
                          id="new-email"
                          type="email"
                          placeholder="Enter email address"
                          value={newUser.email}
                          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="new-role">Role</Label>
                        <Select
                          value={newUser.role}
                          onValueChange={(value) => setNewUser({ ...newUser, role: value })}
                        >
                          <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Admin">Admin</SelectItem>
                            <SelectItem value="Security Analyst">Security Analyst</SelectItem>
                            <SelectItem value="Auditor">Auditor</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>Cancel</Button>
                        <Button className="bg-teal-600 hover:bg-teal-700" onClick={handleAddUser}>Add User</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>

            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Username</th>
                      <th className="text-left p-3">Email</th>
                      <th className="text-left p-3">Role</th>
                      <th className="text-left p-3">Status</th>
                      <th className="text-left p-3">Last Login</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length > 0 ? (
                      users.map((user, index) => (
                        <tr key={user.id} className={index % 2 === 0 ? "bg-slate-50" : "bg-white"}>
                          <td className="p-3 font-medium">{user.username}</td>
                          <td className="p-3 text-sm">{user.email}</td>
                          <td className="p-3"><Badge className={getRoleColor(user.role)}>{user.role}</Badge></td>
                          <td className="p-3"><Badge className={getStatusColor(user.status)}>{user.status}</Badge></td>
                          <td className="p-3 text-sm">{user.lastLogin}</td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan={5} className="text-center p-3 text-gray-500">No users found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
