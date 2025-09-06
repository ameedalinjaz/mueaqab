"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useParams } from "next/navigation"

export default function ChatPage() {
  const params = useParams()
  const chatId = params.chatId
  const [messages, setMessages] = useState([])
  const [user, setUser] = useState(null)
  const [content, setContent] = useState("")
  const [msg, setMsg] = useState("")

  const MAX_MESSAGES = 20 // الحد الأقصى للرسائل لكل محادثة

  useEffect(() => {
    fetchUser()
    fetchMessages()
  }, [])

  // جلب المستخدم الحالي
  async function fetchUser() {
    const { data } = await supabase.auth.getUser()
    setUser(data.user)
  }

  // جلب الرسائل
  async function fetchMessages() {
    const { data, error } = await supabase
      .from("chat_messages")
      .select(`id, content, user_id, created_at`)
      .eq("chat_id", chatId)
      .order("created_at", { ascending: true })
    if (!error) setMessages(data)
  }

  // إرسال رسالة
  async function handleSend(e) {
    e.preventDefault()
    if (!user) return setMsg("يجب تسجيل الدخول لإرسال رسالة")

    if (messages.length >= MAX_MESSAGES) {
      return setMsg(`لقد وصلت الحد الأقصى للرسائل (${MAX_MESSAGES})`)
    }

    const { error } = await supabase.from("chat_messages").insert([{
      chat_id: chatId,
      user_id: user.id,
      content
    }])

    if (error) return setMsg(error.message)

    setContent("")
    setMsg("")
    fetchMessages()
  }

  return (
    <div className="max-w-3xl mx-auto p-4 flex flex-col gap-4">
      <h1 className="text-2xl font-bold mb-4">المحادثة الخاصة</h1>

      <div className="flex flex-col gap-2 border p-3 rounded h-96 overflow-y-auto bg-gray-50">
        {messages.length === 0 ? (
          <p className="text-gray-500">لا توجد رسائل بعد.</p>
        ) : (
          messages.map(m => (
            <div
              key={m.id}
              className={`p-2 rounded ${m.user_id === user?.id ? "bg-blue-200 self-end" : "bg-gray-200 self-start"}`}
            >
              <p>{m.content}</p>
              <p className="text-xs text-gray-500 text-right">{new Date(m.created_at).toLocaleTimeString("ar-SA")}</p>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          className="border p-2 rounded flex-1"
          placeholder="اكتب رسالتك..."
          value={content}
          onChange={e => setContent(e.target.value)}
          required
        />
        <button type="submit" className="bg-blue-600 text-white p-2 rounded">إرسال</button>
      </form>
      {msg && <p className="text-red-500">{msg}</p>}
    </div>
  )
}
