"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

export default function AdminDashboard() {
  const [posts, setPosts] = useState([])
  const [users, setUsers] = useState([])
  const [stats, setStats] = useState({ totalUsers: 0, totalPosts: 0, pendingUsers: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
    fetchPosts()
    fetchStats()
  }, [])

  async function fetchUsers() {
    const { data } = await supabase.from("profiles").select("*")
    setUsers(data || [])
  }

  async function fetchPosts() {
    const { data } = await supabase.from("posts").select("*").order("created_at", { ascending: false })
    setPosts(data || [])
    setLoading(false)
  }

  async function fetchStats() {
    const { count: totalUsers } = await supabase.from("profiles").select("*", { count: "exact" })
    const { count: totalPosts } = await supabase.from("posts").select("*", { count: "exact" })
    const { count: pendingUsers } = await supabase
      .from("profiles")
      .select("*", { count: "exact" })
      .eq("approved", false)
    setStats({ totalUsers, totalPosts, pendingUsers })
  }

  // حذف منشور
  async function handleDeletePost(postId) {
    if (!confirm("هل أنت متأكد من حذف المنشور؟")) return
    await supabase.from("posts").delete().eq("id", postId)
    fetchPosts()
    fetchStats()
  }

  // منح لقب
  async function handleGrantTitle(userId) {
    const title = prompt("أدخل اللقب الجديد:")
    if (!title) return
    await supabase.from("profiles").update({ title }).eq("id", userId)
    fetchUsers()
  }

  // منح منشورات إضافية
  async function handleAddPosts(userId) {
    const number = prompt("كم عدد المنشورات الإضافية؟")
    const extra = parseInt(number)
    if (!extra || extra <= 0) return
    await supabase.from("profiles").update({ extra_posts: (prev) => (prev || 0) + extra }).eq("id", userId)
    fetchUsers()
  }

  // الموافقة على معقب
  async function handleApproveUser(userId) {
    await supabase.from("profiles").update({ approved: true }).eq("id", userId)
    fetchUsers()
    fetchStats()
  }

  // حظر أو إلغاء حظر مستخدم
  async function handleToggleBlock(userId, currentStatus) {
    await supabase.from("profiles").update({ blocked: !currentStatus }).eq("id", userId)
    fetchUsers()
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">لوحة إدارة المشرف</h1>

      {/* الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-100 p-4 rounded text-center">
          <h2 className="font-bold text-xl">{stats.totalUsers}</h2>
          <p>عدد المستخدمين</p>
        </div>
        <div className="bg-green-100 p-4 rounded text-center">
          <h2 className="font-bold text-xl">{stats.totalPosts}</h2>
          <p>عدد المنشورات</p>
        </div>
        <div className="bg-yellow-100 p-4 rounded text-center">
          <h2 className="font-bold text-xl">{stats.pendingUsers}</h2>
          <p>المعقبون بانتظار الموافقة</p>
        </div>
      </div>

      {/* قائمة المستخدمين */}
      <h2 className="text-2xl font-bold mb-4">المستخدمون</h2>
      <div className="overflow-x-auto mb-8">
        <table className="w-full table-auto border">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border">الاسم</th>
              <th className="p-2 border">البريد</th>
              <th className="p-2 border">الحالة</th>
              <th className="p-2 border">ألقاب / منشورات إضافية</th>
              <th className="p-2 border">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td className="p-2 border">{user.username}</td>
                <td className="p-2 border">{user.email}</td>
                <td className="p-2 border">{user.approved ? (user.blocked ? "محظور" : "مفعل") : "في الانتظار"}</td>
                <td className="p-2 border">
                  لقب: {user.title || "لا يوجد"} <br />
                  منشورات إضافية: {user.extra_posts || 0}
                </td>
                <td className="p-2 border flex gap-2 flex-wrap">
                  {!user.approved && (
                    <button
                      onClick={() => handleApproveUser(user.id)}
                      className="bg-green-500 text-white p-1 rounded"
                    >
                      موافقة
                    </button>
                  )}
                  <button
                    onClick={() => handleGrantTitle(user.id)}
                    className="bg-yellow-500 text-white p-1 rounded"
                  >
                    منح لقب
                  </button>
                  <button
                    onClick={() => handleAddPosts(user.id)}
                    className="bg-blue-500 text-white p-1 rounded"
                  >
                    منح منشورات
                  </button>
                  <button
                    onClick={() => handleToggleBlock(user.id, user.blocked)}
                    className={`p-1 rounded ${user.blocked ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}
                  >
                    {user.blocked ? "إلغاء الحظر" : "حظر"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* قائمة المنشورات */}
      <h2 className="text-2xl font-bold mb-4">المنشورات</h2>
      {loading ? (
        <p>جارٍ التحميل...</p>
      ) : posts.length === 0 ? (
        <p className="text-gray-500">لا توجد منشورات.</p>
      ) : (
        posts.map(post => (
          <div key={post.id} className="border rounded shadow p-4 mb-4">
            <h3 className="font-bold">{post.title}</h3>
            <p className="text-gray-500 text-sm">تم النشر في: {new Date(post.created_at).toLocaleDateString("ar-SA")}</p>
            {post.image_url && (
              <img src={post.image_url} alt={post.title} className="w-full h-48 object-cover rounded my-2" />
            )}
            <p>{post.description}</p>
            <button
              onClick={() => handleDeletePost(post.id)}
              className="bg-red-500 text-white p-1 rounded mt-2"
            >
              حذف المنشور
            </button>
          </div>
        ))
      )}
    </div>
  )
}
