import { useEffect, useState } from "react"
import { Search, Bell, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useDashboardData } from "@/hooks/use-api-data" // <-- Import hook


export function Header() {
  const { notificationCount } = useDashboardData() // <-- Use hook
  const [systemName, setSystemName] = useState("")

  const [open, setOpen] = useState(false)


  useEffect(() => {
    const name = localStorage.getItem("system")
    if (name) setSystemName(name)
  }, [])

  const logout = () => {
    localStorage.removeItem("authenticated")
    localStorage.removeItem("system")
    window.location.reload()
  }
  

  
  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-navy-600 to-teal-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">T</span>
            </div>
            <span className="text-xl font-bold text-navy-800">TRACE</span>
            <span className="text-sm text-slate-500">
                - Tool for Risk Assessment & Configuration Evaluation
              </span>
          </div>
        </div>

        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search hosts or vulnerabilities..."
              className="pl-10 bg-slate-50 border-slate-200 focus:bg-white"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="w-5 h-5 text-slate-600" />
            {/* Display count only if greater than 0 */}
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {notificationCount}
              </span>
            )}
          </Button>

          <div className="relative">
          <Button variant="ghost" size="sm" className="flex items-center space-x-2" onClick={() => setOpen(!open)}>
            <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-slate-600" />
            </div>

            <span className="text-sm text-slate-700">
              {systemName || "Admin"}
            </span>

            <span className="text-xs">▼</span>
          </Button>

          {open && (
            <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-md z-50">
              <div className="px-4 py-2 text-sm text-slate-500 border-b">
                Logged in as
                <div className="font-semibold text-slate-800">
                  {systemName}
                </div>
              </div>

              <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-slate-100" onClick={logout}>
                Logout
              </button>
            </div>
          )}    
        </div>
        </div>
      </div>
    </header>
  )
}
