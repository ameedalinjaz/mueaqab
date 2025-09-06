"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

export default function Posts() {
  const [posts, setPosts] = useState([])
  const [categories, setCategories] = useState([])
  const [filter, setFilter] = useState({ category: "", sort: "recent" })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategories()
    fetchPosts()
  }, [])

  useEffect(() => {
    fetchPosts()
  }, [filter])

  // جلب الأقسام
  async function fetchCategories() {
    const { data, error } = await supabase.from("categories").select("*")
    if (!error) setCategories(data)
  }

  // جلب المنشورات مع الفلترة
  async function fetchPosts() {
    setLoading(true)
    let query = supabase.from("posts").select(`
      id, title, description, price, image, likes, dislikes, created_at,
      user_id (username)
    `)

    if (filter.category) query = query.eq("category_id", filter.category)

    if (filter.sort === "recent") query = query.order("created_at", { ascending: false })
    else if (filter.sort === "popular") query = query.order("likes", { ascending: false })
    else if (filter.sort === "rating") query = query.order("user_id->>rating_avg", { ascending: false })

    const { data, error } = await query
    if (!error) setPosts(data)
    setLoading(false)
  }

  // التعامل مع الإعجاب / عدم الإعجاب
  async function handleLike(postId, type) {
    const post = posts.find(p => p.id === postId)
    if (!post) return

    const field = type === "like" ? "likes" : "dislikes"
    const newValue = (post[field] || 0) + 1

    await supabase.from("posts").update({ [field]: newValue }).eq("id", postId)
    fetchPosts()
  }

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">آخر المنشورات</h1>

      {/* الفلترة */}
      <div className="flex gap-4 mb-4 flex-wrap">
        <select
          className="border p-2 rounded"
          value={filter.category}
          onChange={e => setFilter({ ...filter, category: e.target.value })}
        >
          <option value="">جميع الأقسام</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>

        <select
          className="border p-2 rounded"
          value={filter.sort}
          onChange={e => setFilter({ ...filter, sort: e.target.value })}
        >
          <option value="recent">الأحدث</option>
          <option value="popular">الأكثر إعجابًا</option>
          <option value="rating">الأعلى تقييم</option>
        </select>
      </div>

      {/* المنشورات */}
      {loading ? (
        <p>جار التحميل...</p>
      ) : posts.length === 0 ? (
        <p className="text-gray-500">لا توجد منشورات بعد.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {posts.map(post => (
            <div key={post.id} className="border rounded-lg p-3 shadow">
              {post.image && <img src={post.image} alt={post.title} className="w-full h-40 object-cover rounded" />}
              <h3 className="text-lg font-bold mt-2">{post.title}</h3>
              <p className="text-gray-600">{post.description}</p>
              <p className="font-semibold mt-1">💰 {post.price} ريال</p>
              <p className="text-sm text-gray-400">📅 {new Date(post.created_at).toLocaleDateString("ar-SA")}</p>
              <p className="text-sm text-gray-500">المعقب: {post.user_id.username}</p>

              {/* الإعجابات والتعليقات */}
              <div className="flex gap-3 mt-2">
                <button onClick={() => handleLike(post.id, "like")} className="text-green-600">👍 {post.likes || 0}</button>
                <button onClick={() => handleLike(post.id, "dislike")} className="text-red-600">👎 {post.dislikes || 0}</button>
              </div>

              {/* رابط التعليقات */}
              <button
                onClick={() => window.location.href = `/posts/${post.id}/comments`}
                className="mt-2 text-blue-600 text-sm"
              >
                عرض التعليقات
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
