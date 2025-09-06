"use client"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">مرحباً بك في موقع المعقبين</h1>
      <p className="mb-4">يمكنك تصفح المنشورات، التعليق، وتسجيل الدخول أو إنشاء حساب.</p>

      <div className="flex gap-4">
        <Link href="/auth/login" className="bg-blue-600 text-white px-4 py-2 rounded">تسجيل الدخول</Link>
        <Link href="/auth/register" className="bg-green-600 text-white px-4 py-2 rounded">تسجيل جديد</Link>
      </div>
    </div>
  )
}
