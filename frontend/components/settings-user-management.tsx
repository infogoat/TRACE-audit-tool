"use client"

import { useState, useEffect } from "react" // <-- Added useEffect import
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
import { useDashboardData } from "@/hooks/use-api-data" // <-- Import hook
import type { AppSettings } from "@/hooks/use-api-data" // <-- Import AppSettings type


// Define a sensible default state to prevent runtime errors on first render
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
};


export function SettingsUserManagement() {
  const { users, appSettings } = useDashboardData()

  const [activeTab, setActiveTab] = useState("general")
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)

  // FIX: Initialize with a default object, then update when real data arrives
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS)

  // Use useEffect to synchronize local state with fetched state
  useEffect(() => {
    // Only update the local state if the fetched data is available and different from the current local state default
    if (appSettings) {
        setSettings(appSettings)
    }
  }, [appSettings])
  
  // --- REMOVED: const users = [...] (Now fetched via hook)

  const getRoleColor = (role: string) => {
    switch (role) {
      case "Admin":
        return "bg-red-100 text-red-800"
      case "Security Analyst":
        return "bg-blue-100 text-blue-800"
      case "Auditor":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    return status === "Active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
  }

  const handleSettingChange = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
    // ⚠️ Add your backend script/API call here to save the setting
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-800">Settings & User Management</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            General Settings
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            User Management
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security Settings
          </TabsTrigger>
        </TabsList>

        {/* General Settings Tab */}
        <TabsContent value="general" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Company Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input
                    id="company-name"
                    value={settings.companyName}
                    onChange={(e) => handleSettingChange("companyName", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={settings.timezone} onValueChange={(value) => handleSettingChange("timezone", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC-8">Pacific Time (UTC-8)</SelectItem>
                      <SelectItem value="UTC-7">Mountain Time (UTC-7)</SelectItem>
                      <SelectItem value="UTC-6">Central Time (UTC-6)</SelectItem>
                      <SelectItem value="UTC-5">Eastern Time (UTC-5)</SelectItem>
                      <SelectItem value="UTC+0">UTC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-slate-500">Receive security alerts via email</p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => handleSettingChange("emailNotifications", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Slack Notifications</Label>
                    <p className="text-sm text-slate-500">Send alerts to Slack channels</p>
                  </div>
                  <Switch
                    checked={settings.slackNotifications}
                    onCheckedChange={(checked) => handleSettingChange("slackNotifications", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>SMS Notifications</Label>
                    <p className="text-sm text-slate-500">Critical alerts via SMS</p>
                  </div>
                  <Switch
                    checked={settings.smsNotifications}
                    onCheckedChange={(checked) => handleSettingChange("smsNotifications", checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* User Management Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>User Management</CardTitle>
                <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-teal-600 hover:bg-teal-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Add New User
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New User</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="new-username">Username</Label>
                        <Input id="new-username" placeholder="Enter username" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-email">Email</Label>
                        <Input id="new-email" type="email" placeholder="Enter email address" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-role">Role</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="analyst">Security Analyst</SelectItem>
                            <SelectItem value="auditor">Auditor</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>
                          Cancel
                        </Button>
                        <Button className="bg-teal-600 hover:bg-teal-700">Add User</Button>
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
                      <th className="text-left p-3 font-medium text-slate-600">Username</th>
                      <th className="text-left p-3 font-medium text-slate-600">Email</th>
                      <th className="text-left p-3 font-medium text-slate-600">Role</th>
                      <th className="text-left p-3 font-medium text-slate-600">Status</th>
                      <th className="text-left p-3 font-medium text-slate-600">Last Login</th>
                      <th className="text-left p-3 font-medium text-slate-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, index) => (
                      <tr key={user.id} className={index % 2 === 0 ? "bg-slate-50" : "bg-white"}>
                        <td className="p-3 font-medium text-slate-800">{user.username}</td>
                        <td className="p-3 text-sm text-slate-600">{user.email}</td>
                        <td className="p-3">
                          <Badge className={getRoleColor(user.role)}>{user.role}</Badge>
                        </td>
                        <td className="p-3">
                          <Badge className={getStatusColor(user.status)}>{user.status}</Badge>
                        </td>
                        <td className="p-3 text-sm text-slate-600">{user.lastLogin}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700 bg-transparent"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings Tab */}
        <TabsContent value="security" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Password Policy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="min-length">Minimum Password Length</Label>
                  <Select
                    value={settings.passwordMinLength.toString()}
                    onValueChange={(value) => handleSettingChange("passwordMinLength", Number.parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="8">8 characters</SelectItem>
                      <SelectItem value="10">10 characters</SelectItem>
                      <SelectItem value="12">12 characters</SelectItem>
                      <SelectItem value="16">16 characters</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Password Complexity</Label>
                    <p className="text-sm text-slate-500">Require uppercase, lowercase, numbers, and symbols</p>
                  </div>
                  <Switch
                    checked={settings.passwordComplexity}
                    onCheckedChange={(checked) => handleSettingChange("passwordComplexity", checked)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Authentication & Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-slate-500">Require 2FA for all users</p>
                  </div>
                  <Switch
                    checked={settings.twoFactorAuth}
                    onCheckedChange={(checked) => handleSettingChange("twoFactorAuth", checked)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                  <Select
                    value={settings.sessionTimeout.toString()}
                    onValueChange={(value) => handleSettingChange("sessionTimeout", Number.parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="pt-4">
                  <Button className="w-full bg-teal-600 hover:bg-teal-700">
                    <Key className="h-4 w-4 mr-2" />
                    Generate New API Key
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}