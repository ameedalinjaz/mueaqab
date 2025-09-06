"use client"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"

export default function NewPost() {
  const [user, setUser] = useState(null)
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    category_id: "",
    image: null
  })
  const [msg, setMsg] = useState("")
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push("/auth/login")
      else setUser(data.user)
    })
    fetchCategories()
  }, [])

  async function fetchCategories() {
    const { data, error } = await supabase.from("categories").select("*")
    if (!error) setCategories(data)
  }

  async function handleFileChange(e) {
    setForm({ ...form, image: e.target.files[0] })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!user) return

    // تحقق الحد اليومي: 3 منشورات/اليوم
    const today = new Date().toISOString().split("T")[0]
    const { data: todayPosts } = await supabase
      .from("posts")
      .select("*")
      .eq("user_id", user.id)
      .gte("created_at", today)
    if (todayPosts.length >= 3) {
      setMsg("لقد وصلت الحد اليومي للمنشورات المجانية (3 منشورات/اليوم)")
      return
    }

    let imageUrl = ""
    if (form.image) {
      // رفع الصورة إلى Supabase Storage
      const fileExt = form.image.name.split(".").pop()
      const fileName = `${Date.now()}.${fileExt}`
      const { data, error } = await supabase.storage
        .from("posts-images")
        .upload(fileName, form.image)
      if (error) return setMsg(error.message)
      imageUrl = data.path
    }

    // إدخال المنشور في جدول posts
    const { error } = await supabase.from("posts").insert([{
      user_id: user.id,
      title: form.title,
      description: form.description,
      price: form.price,
      category_id: form.category_id || null,
      image: imageUrl
    }])
    if (error) return setMsg(error.message)

    setMsg("تم إضافة الخدمة بنجاح ✅")
    router.push("/profile") // إعادة توجيه للملف الشخصي بعد الإضافة
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">إضافة خدمة جديدة</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="عنوان الخدمة"
          className="border p-2 rounded"
          value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })}
          required
        />
        <textarea
          placeholder="وصف الخدمة"
          className="border p-2 rounded"
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
          required
        />
        <input
          type="number"
          placeholder="السعر بالريال"
          className="border p-2 rounded"
          value={form.price}
          onChange={e => setForm({ ...form, price: e.target.value })}
          required
        />
        <select
          className="border p-2 rounded"
          value={form.category_id}
          onChange={e => setForm({ ...form, category_id: e.target.value })}
          required
        >
          <option value="">اختر القسم</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        <input type="file" accept="image/*" onChange={handleFileChange} />
        <button type="submit" className="bg-green-600 text-white p-2 rounded">نشر الخدمة</button>
        {msg && <p className="mt-2 text-red-500">{msg}</p>}
      </form>
    </div>
  )
}
