"use client"
import { useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"

export default function Login() {
  const [form, setForm] = useState({ email:"", password:"" })
  const [msg, setMsg] = useState("")
  const router = useRouter()

  async function handleLogin(e) {
    e.preventDefault()
    const { data, error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password
    })
    if (error) return setMsg(error.message)

    router.push("/profile") // بعد الدخول
  }

  return (
    <form onSubmit={handleLogin} className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">تسجيل الدخول</h1>
      <input type="email" placeholder="الإيميل" className="border p-2 w-full mb-2"
        onChange={e=>setForm({...form,email:e.target.value})}/>
      <input type="password" placeholder="كلمة المرور" className="border p-2 w-full mb-2"
        onChange={e=>setForm({...form,password:e.target.value})}/>
      <button className="bg-blue-600 text-white p-2 rounded">دخول</button>
      <p className="mt-2">{msg}</p>
    </form>
  )
}
