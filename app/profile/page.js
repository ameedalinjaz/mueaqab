"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"

export default function Profile() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [posts, setPosts] = useState([])
  const router = useRouter()

  // التحقق من تسجيل الدخول
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data, error }) => {
      if (error || !data.user) {
        router.push("/auth/login")
      } else {
        setUser(data.user)
        fetchProfile(data.user.id)
        fetchPosts(data.user.id)
      }
    })
  }, [])

  // جلب بيانات البروفايل
  async function fetchProfile(userId) {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single()
    if (!error) setProfile(data)
  }

  // جلب منشورات المستخدم
  async function fetchPosts(userId) {
    const { data, error } = await supabase
      .from("posts")
      .select("id, title, description, price, image, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
    if (!error) setPosts(data)
  }

  if (!profile) return <p className="p-6">جار التحميل...</p>

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* صورة الكوفر */}
      <div className="relative h-48 bg-gray-200 rounded-lg overflow-hidden">
        {profile.cover_image && (
          <img src={profile.cover_image} alt="Cover" className="w-full h-full object-cover" />
        )}
        {/* صورة البروفايل */}
        <div className="absolute -bottom-12 left-6">
          <img
            src={profile.profile_image || "https://via.placeholder.com/100"}
            alt="Profile"
            className="w-24 h-24 rounded-full border-4 border-white shadow"
          />
        </div>
      </div>

      {/* بيانات البروفايل */}
      <div className="mt-16 px-4">
        <h1 className="text-2xl font-bold">{profile.username} {profile.title && `(${profile.title})`}</h1>
        <p className="text-gray-600">{profile.bio || "لم تتم إضافة نبذة بعد"}</p>
        <p className="mt-2">⭐ {profile.rating_avg?.toFixed(1) || 0} / 5 ({profile.rating_count} تقييم)</p>
      </div>

      {/* الأزرار */}
      <div className="mt-4 flex gap-2">
        <button
          onClick={() => router.push("/posts/new")}
          className="bg-green-600 text-white px-4 py-2 rounded-lg"
        >
          + إضافة خدمة
        </button>
        <button
          onClick={() => router.push("/profile/edit")}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          ✎ تعديل الملف الشخصي
        </button>
      </div>

      {/* قائمة المنشورات */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">خدماتي</h2>
        {posts.length === 0 ? (
          <p className="text-gray-500">لا توجد خدمات منشورة بعد.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {posts.map(post => (
              <div key={post.id} className="border rounded-lg p-3 shadow">
                {post.image && <img src={post.image} alt={post.title} className="w-full h-40 object-cover rounded"/>}
                <h3 className="text-lg font-bold mt-2">{post.title}</h3>
                <p className="text-gray-600">{post.description}</p>
                <p className="font-semibold mt-1">💰 {post.price} ريال</p>
                <p className="text-sm text-gray-400">📅 {new Date(post.created_at).toLocaleDateString("ar-SA")}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
