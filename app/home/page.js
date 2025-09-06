"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

export default function HomePage() {
  const [posts, setPosts] = useState([])
  const [categories, setCategories] = useState([])
  const [filter, setFilter] = useState({ category: "", sort: "date" })

  useEffect(() => {
    fetchCategories()
    fetchPosts()
  }, [filter])

  // جلب الأقسام
  async function fetchCategories() {
    const { data } = await supabase.from("categories").select("*")
    setCategories(data || [])
  }

  // جلب المنشورات مع الفلاتر
  async function fetchPosts() {
    let query = supabase
      .from("posts")
      .select(`
        id,
        title,
        description,
        image_url,
        user_id (username),
        created_at,
        likes,
        dislikes,
        category_id
      `)

    if (filter.category) query = query.eq("category_id", filter.category)

    if (filter.sort === "date") query = query.order("created_at", { ascending: false })
    if (filter.sort === "popular") query = query.order("likes", { ascending: false })

    const { data } = await query
    setPosts(data || [])
  }

  // الإعجاب
  async function handleLike(post) {
    const { error } = await supabase.from("posts").update({
      likes: post.likes + 1
    }).eq("id", post.id)
    if (!error) fetchPosts()
  }

  // عدم الإعجاب
  async function handleDislike(post) {
    const { error } = await supabase.from("posts").update({
      dislikes: post.dislikes + 1
    }).eq("id", post.id)
    if (!error) fetchPosts()
  }

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">آخر المنشورات</h1>

      {/* الفلترة */}
      <div className="flex gap-4 mb-6">
        <select
          value={filter.category}
          onChange={e => setFilter({...filter, category: e.target.value})}
          className="border p-2 rounded"
        >
          <option value="">كل الأقسام</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <select
          value={filter.sort}
          onChange={e => setFilter({...filter, sort: e.target.value})}
          className="border p-2 rounded"
        >
          <option value="date">الأحدث أولاً</option>
          <option value="popular">الأكثر تقييم</option>
        </select>
      </div>

      {/* قائمة المنشورات */}
      <div className="grid md:grid-cols-2 gap-6">
        {posts.map(post => (
          <div key={post.id} className="border rounded shadow p-4 flex flex-col gap-2">
            <img src={post.image_url} alt={post.title} className="w-full h-48 object-cover rounded" />
            <h2 className="font-bold text-xl">{post.title}</h2>
            <p>{post.description}</p>
            <p className="text-gray-500 text-sm">بواسطة: {post.user_id.username}</p>
            <div className="flex gap-2 mt-2">
              <button onClick={() => handleLike(post)} className="bg-green-500 text-white p-1 rounded">
                👍 {post.likes}
              </button>
              <button onClick={() => handleDislike(post)} className="bg-red-500 text-white p-1 rounded">
                👎 {post.dislikes}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
