"use client"
import { useState } from "react"
import { supabase } from "@/lib/supabaseClient"

export default function Signup() {
  const [form, setForm] = useState({ email:"", password:"", phone:"", username:"", role:"agent" })
  const [msg, setMsg] = useState("")

  async function handleSignup(e) {
    e.preventDefault()
    // إنشاء حساب في Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password
    })
    if (error) return setMsg(error.message)

    // إضافة بيانات إضافية في جدول users
    const { error: dbError } = await supabase.from("users").insert([{
      id: data.user.id,
      email: form.email,
      phone: form.phone,
      username: form.username,
      role: form.role,
      password_hash: "hashed_password" -- هنا لازم تستخدم bcrypt بالكود الحقيقي
    }])
    if (dbError) return setMsg(dbError.message)

    setMsg("تم التسجيل بنجاح ✅")
  }

  return (
    <form onSubmit={handleSignup} className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">تسجيل جديد</h1>
      <input type="email" placeholder="الإيميل" className="border p-2 w-full mb-2"
        onChange={e=>setForm({...form,email:e.target.value})}/>
      <input type="password" placeholder="كلمة المرور" className="border p-2 w-full mb-2"
        onChange={e=>setForm({...form,password:e.target.value})}/>
      <input type="text" placeholder="رقم الجوال" className="border p-2 w-full mb-2"
        onChange={e=>setForm({...form,phone:e.target.value})}/>
      <input type="text" placeholder="اسم المستخدم" className="border p-2 w-full mb-2"
        onChange={e=>setForm({...form,username:e.target.value})}/>
      <select onChange={e=>setForm({...form,role:e.target.value})} className="border p-2 w-full mb-2">
        <option value="agent">معقب</option>
        <option value="visitor">زائر</option>
      </select>
      <button className="bg-green-600 text-white p-2 rounded">تسجيل</button>
      <p className="mt-2">{msg}</p>
    </form>
  )
}
