"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

export default function PostComments({ postId, user }) {
  const [comments, setComments] = useState([])
  const [content, setContent] = useState("")
  const [msg, setMsg] = useState("")

  useEffect(() => {
    fetchComments()
  }, [])

  // جلب التعليقات
  async function fetchComments() {
    const { data } = await supabase
      .from("comments")
      .select("id, content, user_id, created_at, user_id(username)")
      .eq("post_id", postId)
      .order("created_at", { ascending: true })
    setComments(data || [])
  }

  // إرسال تعليق
  async function handleComment(e) {
    e.preventDefault()
    if (!user) return setMsg("يجب تسجيل الدخول للتعليق")

    // التحقق من الحد: 3 تعليقات/دقيقة
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString()
    const { data: recent, error } = await supabase
      .from("comments")
      .select("*")
      .eq("post_id", postId)
      .eq("user_id", user.id)
      .gt("created_at", oneMinuteAgo)

    if (recent?.length >= 3) {
      return setMsg("لقد وصلت الحد الأقصى 3 تعليقات في الدقيقة")
    }

    // إضافة التعليق
    const { error: insertError } = await supabase.from("comments").insert([{
      post_id: postId,
      user_id: user.id,
      content
    }])
    if (insertError) return setMsg(insertError.message)

    setContent("")
    setMsg("")
    fetchComments()
  }

  return (
    <div className="mt-4 border-t pt-2">
      <h3 className="font-bold mb-2">التعليقات</h3>

      <div className="flex flex-col gap-2 mb-2">
        {comments.length === 0 ? (
          <p className="text-gray-500">لا توجد تعليقات بعد.</p>
        ) : (
          comments.map(c => (
            <div key={c.id} className="p-2 bg-gray-100 rounded">
              <p className="font-semibold">{c.user_id.username}</p>
              <p>{c.content}</p>
              <p className="text-xs text-gray-500 text-right">{new Date(c.created_at).toLocaleTimeString("ar-SA")}</p>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleComment} className="flex gap-2">
        <input
          type="text"
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="اكتب تعليقك..."
          className="flex-1 p-2 border rounded"
          required
        />
        <button type="submit" className="bg-blue-600 text-white p-2 rounded">إرسال</button>
      </form>
      {msg && <p className="text-red-500 mt-1">{msg}</p>}
    </div>
  )
}
