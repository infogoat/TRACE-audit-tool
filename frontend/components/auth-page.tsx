"use client"
import { useState } from "react"

export default function AuthPage({ onAuth }: { onAuth: () => void }) {
  const [mode, setMode] = useState<"login" | "register">("login")

  const [system, setSystem] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [message, setMessage] = useState("")

  const login = () => {
    if (!system || !password) {
      setMessage("Please enter system name and password")
      return
    }

    // SIMULATION LOGIN
    localStorage.setItem("system", system)
    localStorage.setItem("authenticated", "true")
    onAuth()
  }

  const register = () => {
    if (!system || !password || !confirmPassword) {
      setMessage("All fields are required")
      return
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match")
      return
    }

    // SIMULATION REGISTER
    setMessage("✅ Registration successful. Please login.")
    setMode("login")
    setPassword("")
    setConfirmPassword("")
  }

  return (
    <div className="flex h-screen items-center justify-center bg-slate-100">
      <div className="w-80 space-y-4 p-6 border rounded bg-white">
        <h2 className="text-xl font-bold text-center">
          {mode === "login" ? "Device Login" : "Device Registration"}
        </h2>

        <input
          className="w-full border p-2"
          placeholder="Please enter your device name"
          value={system}
          onChange={(e) => setSystem(e.target.value)}
        />

        <input
          className="w-full border p-2"
          type="password"
          placeholder={mode === "login" ? "Password" : "Create Password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {mode === "register" && (
          <input
            className="w-full border p-2"
            type="password"
            placeholder="Re-enter Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        )}

        {message && (
          <p className="text-sm text-center text-green-600">{message}</p>
        )}

        {mode === "login" ? (
          <>
            <button
              className="w-full bg-black text-white p-2"
              onClick={login}
            >
              Login
            </button>

            <p className="text-sm text-center">
              New to our system?{" "}
              <button
                className="text-blue-600 underline"
                onClick={() => {
                  setMode("register")
                  setMessage("")
                }}
              >
                Register here
              </button>
            </p>
          </>
        ) : (
          <>
            <button
              className="w-full bg-black text-white p-2"
              onClick={register}
            >
              Register
            </button>

            <p className="text-sm text-center">
              Already registered?{" "}
              <button
                className="text-blue-600 underline"
                onClick={() => {
                  setMode("login")
                  setMessage("")
                }}
              >
                Login here
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
