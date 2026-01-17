"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Settings, Users, Shield, Plus, Trash2 } from "lucide-react"

const backendUrl = "http://localhost:8000"

export function SettingsUserManagement() {
  const [activeTab, setActiveTab] = useState("users")
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [newUser, setNewUser] = useState({ username: "", email: "", role: "" })

  // -------------------- FETCH USERS --------------------
  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${backendUrl}/api/users`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setUsers(data)
    } catch (err) {
      console.error("❌ Failed to load users:", err)
      alert("⚠ Could not fetch users. Check backend connection.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  // -------------------- ADD USER --------------------
  const handleAddUser = async () => {
    if (!newUser.username || !newUser.email || !newUser.role) {
      alert("Please fill all fields.")
      return
    }
    try {
      const res = await fetch(`${backendUrl}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || "Failed to add user")
      alert("User added successfully!")
      setNewUser({ username: "", email: "", role: "" })
      setIsAddUserOpen(false)
      fetchUsers()
    } catch (err) {
      console.error(err)
      alert("❌ Error adding user. Ensure backend is running.")
    }
  }

  // -------------------- DELETE USER --------------------
  const handleDeleteUser = async (id: number) => {
    if (!confirm("Are you sure you want to delete this user?")) return
    try {
      const res = await fetch(`${backendUrl}/api/users/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      alert("🗑️ User deleted successfully.")
      fetchUsers()
    } catch (err) {
      console.error(err)
      alert("❌ Failed to delete user.")
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

  const getStatusColor = (status: string) =>
    status === "Active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"

  // -------------------- RENDER --------------------
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-800">Settings & User Management</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" /> General
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" /> User Management
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" /> Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>User Management</CardTitle>
              <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-teal-600 hover:bg-teal-700">
                    <Plus className="h-4 w-4 mr-2" /> Add New User
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New User</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Username</Label>
                      <Input
                        placeholder="Enter username"
                        value={newUser.username}
                        onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input
                        type="email"
                        placeholder="Enter email"
                        value={newUser.email}
                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Role</Label>
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
            </CardHeader>

            <CardContent>
              <div className="overflow-x-auto">
                {loading ? (
                  <p className="text-center text-gray-500 p-3">Loading users...</p>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">Username</th>
                        <th className="text-left p-3">Email</th>
                        <th className="text-left p-3">Role</th>
                        <th className="text-left p-3">Status</th>
                        <th className="text-left p-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.length > 0 ? (
                        users.map((user, i) => (
                          <tr key={i} className={i % 2 === 0 ? "bg-slate-50" : "bg-white"}>
                            <td className="p-3 font-medium">{user.username}</td>
                            <td className="p-3 text-sm">{user.email}</td>
                            <td className="p-3"><Badge className={getRoleColor(user.role)}>{user.role}</Badge></td>
                            <td className="p-3"><Badge className={getStatusColor(user.status || "Active")}>{user.status || "Active"}</Badge></td>
                            <td className="p-3 flex gap-2">
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteUser(user.id)}>
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan={5} className="text-center p-3 text-gray-500">No users found</td></tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
