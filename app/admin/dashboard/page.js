"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

export default function AdminDashboard() {
  const [users, setUsers] = useState([])
  const [posts, setPosts] = useState([])
  const [msg, setMsg] = useState("")

  useEffect(() => {
    fetchUsers()
    fetchPosts()
  }, [])

  // جلب كل المستخدمين
  async function fetchUsers() {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false })
    if (!error) setUsers(data)
  }

  // جلب كل المنشورات
  async function fetchPosts() {
    const { data, error } = await supabase
      .from("posts")
      .select("id, title, user_id (username), created_at")
      .order("created_at", { ascending: false })
    if (!error) setPosts(data)
  }

  // حذف منشور
  async function deletePost(id) {
    if (!confirm("هل تريد حذف هذا المنشور؟")) return
    const { error } = await supabase.from("posts").delete().eq("id", id)
    if (error) return setMsg(error.message)
    setMsg("تم حذف المنشور ✅")
    fetchPosts()
  }

  // حظر / إلغاء حظر مستخدم
  async function toggleBlockUser(user) {
    const newStatus = user.status === "blocked" ? "active" : "blocked"
    const { error } = await supabase.from("users").update({ status: newStatus }).eq("id", user.id)
    if (error) return setMsg(error.message)
    fetchUsers()
  }

  // منح لقب
  async function assignTitle(user) {
    const title = prompt("أدخل اللقب الجديد:")
    if (!title) return
    const { error } = await supabase.from("users").update({ title }).eq("id", user.id)
    if (error) return setMsg(error.message)
    fetchUsers()
  }

  // منح عدد منشورات إضافية
  async function grantExtraPosts(user) {
    const extra = prompt("عدد المنشورات الإضافية:")
    if (!extra || isNaN(extra)) return
    const { error } = await supabase.from("users").update({
      extra_posts: parseInt(extra)
    }).eq("id", user.id)
    if (error) return setMsg(error.message)
    fetchUsers()
  }

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6">لوحة إدارة المشرف</h1>
      {msg && <p className="text-red-500 mb-4">{msg}</p>}

      {/* قسم المستخدمين */}
      <h2 className="text-2xl font-semibold mb-2">المستخدمون</h2>
      <table className="w-full border mb-6">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2">الاسم</th>
            <th className="p-2">البريد</th>
            <th className="p-2">الحالة</th>
            <th className="p-2">إجراءات</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id} className="border-b">
              <td className="p-2">{u.username}</td>
              <td className="p-2">{u.email}</td>
              <td className="p-2">{u.status}</td>
              <td className="p-2 flex gap-2">
                <button onClick={() => toggleBlockUser(u)} className="bg-red-500 text-white p-1 rounded">
                  {u.status === "blocked" ? "إلغاء الحظر" : "حظر"}
                </button>
                <button onClick={() => assignTitle(u)} className="bg-green-500 text-white p-1 rounded">منح لقب</button>
                <button onClick={() => grantExtraPosts(u)} className="bg-blue-500 text-white p-1 rounded">منح منشورات</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* قسم المنشورات */}
      <h2 className="text-2xl font-semibold mb-2">المنشورات</h2>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2">العنوان</th>
            <th className="p-2">المستخدم</th>
            <th className="p-2">تاريخ الإنشاء</th>
            <th className="p-2">إجراءات</th>
          </tr>
        </thead>
        <tbody>
          {posts.map(p => (
            <tr key={p.id} className="border-b">
              <td className="p-2">{p.title}</td>
              <td className="p-2">{p.user_id.username}</td>
              <td className="p-2">{new Date(p.created_at).toLocaleString("ar-SA")}</td>
              <td className="p-2">
                <button onClick={() => deletePost(p.id)} className="bg-red-500 text-white p-1 rounded">حذف</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
