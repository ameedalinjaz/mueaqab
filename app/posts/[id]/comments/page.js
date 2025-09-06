"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useParams } from "next/navigation"

export default function CommentsPage() {
  const params = useParams()
  const postId = params.id
  const [comments, setComments] = useState([])
  const [user, setUser] = useState(null)
  const [content, setContent] = useState("")
  const [msg, setMsg] = useState("")

  useEffect(() => {
    fetchUser()
    fetchComments()
  }, [])

  // جلب المستخدم الحالي
  async function fetchUser() {
    const { data } = await supabase.auth.getUser()
    setUser(data.user)
  }

  // جلب التعليقات
  async function fetchComments() {
    const { data, error } = await supabase
      .from("comments")
      .select(`id, content, user_id (username), created_at`)
      .eq("post_id", postId)
      .order("created_at", { ascending: true })
    if (!error) setComments(data)
  }

  // إضافة تعليق
  async function handleComment(e) {
    e.preventDefault()
    if (!user) return setMsg("يجب تسجيل الدخول للتعليق")

    // تحقق الحد: 3 تعليقات/الدقيقة
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString()
    const { data: recentComments } = await supabase
      .from("comments")
      .select("*")
      .eq("user_id", user.id)
      .gte("created_at", oneMinuteAgo)

    if (recentComments.length >= 3) {
      return setMsg("لقد وصلت الحد المسموح للتعليقات (3 تعليقات/الدقيقة)")
    }

    const { error } = await supabase.from("comments").insert([{
      post_id: postId,
      user_id: user.id,
      content
    }])
    if (error) return setMsg(error.message)

    setContent("")
    setMsg("تم إضافة التعليق ✅")
    fetchComments()
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">التعليقات</h1>

      {/* التعليقات الحالية */}
      {comments.length === 0 ? (
        <p className="text-gray-500">لا توجد تعليقات بعد.</p>
      ) : (
        <div className="flex flex-col gap-3 mb-4">
          {comments.map(c => (
            <div key={c.id} className="border p-2 rounded">
              <p className="font-semibold">{c.user_id.username}</p>
              <p>{c.content}</p>
              <p className="text-xs text-gray-400">{new Date(c.created_at).toLocaleTimeString("ar-SA")}</p>
            </div>
          ))}
        </div>
      )}

      {/* إضافة تعليق */}
      <form onSubmit={handleComment} className="flex flex-col gap-2">
        <textarea
          className="border p-2 rounded"
          placeholder="أضف تعليقك..."
          value={content}
          onChange={e => setContent(e.target.value)}
          required
        />
        <button type="submit" className="bg-blue-600 text-white p-2 rounded">إرسال</button>
        {msg && <p className="text-red-500">{msg}</p>}
      </form>
    </div>
  )
}
