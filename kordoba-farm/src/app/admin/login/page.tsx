"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f172a] px-4">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-[#334155] bg-[#1e293b] p-8 shadow-xl">
          <div className="mb-6 text-center">
            <h1 className="text-xl font-bold text-white">Kordoba Farms</h1>
            <p className="mt-1 text-sm text-[#94a3b8]">Admin sign in</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium text-[#cbd5e1]">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-[#475569] bg-[#0f172a] px-3 py-2.5 text-white placeholder-[#64748b] focus:border-[#c8a951] focus:outline-none focus:ring-1 focus:ring-[#c8a951]"
                placeholder="Enter admin password"
                required
                autoFocus
              />
            </div>
            {error && (
              <p className="text-sm text-red-400">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#0F3D2E] py-2.5 font-medium text-white transition-colors hover:bg-[#14533a] focus:outline-none focus:ring-2 focus:ring-[#c8a951] focus:ring-offset-2 focus:ring-offset-[#1e293b] disabled:opacity-50"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
