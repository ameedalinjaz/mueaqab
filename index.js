"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import PostComments from "@/components/PostComments"

export default function HomePage() {
  const [posts, setPosts] = useState([])

  useEffect(() => {
    fetchPosts()
  }, [])

  async function fetchPosts() {
    const { data } = await supabase
      .from("posts")
      .select(`
        *,
        profiles(username, avatar_url)
      `)
      .order("created_at", { ascending: false })
    setPosts(data || [])
  }

  async function handleLike(postId) {
    // زيادة التقييم أو الإعجاب
    const { data } = await supabase
      .from("posts")
      .select("likes")
      .eq("id", postId)
      .single()

    await supabase
      .from("posts")
      .update({ likes: (data.likes || 0) + 1 })
      .eq("id", postId)

    fetchPosts()
  }

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">آخر المنشورات</h1>

      {posts.length === 0 ? (
        <p className="text-gray-500">لا توجد منشورات بعد.</p>
      ) : (
        posts.map(post => (
          <div key={post.id} className="border rounded shadow p-4 mb-6">
            <div className="flex items-center gap-3 mb-2">
              <img src={post.profiles.avatar_url} alt={post.profiles.username} className="w-10 h-10 rounded-full" />
              <span className="font-semibold">{post.profiles.username}</span>
              <span className="text-gray-500 text-sm">• {new Date(post.created_at).toLocaleDateString("ar-SA")}</span>
            </div>

            <img src={post.image_url} alt={post.title} className="w-full h-48 object-cover rounded mb-2" />
            <h2 className="font-bold text-lg">{post.title}</h2>
            <p className="mb-2">{post.description}</p>

            <div className="flex gap-3 items-center">
              <button onClick={() => handleLike(post.id)} className="bg-yellow-400 px-3 py-1 rounded">
                👍 إعجاب ({post.likes || 0})
              </button>
            </div>

            <PostComments postId={post.id} />
          </div>
        ))
      )}
    </div>
  )
}
