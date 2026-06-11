// في المتصفح Console على أي موقع
fetch("https://mahmoudelshora.vercel.app/api/posts", {
  headers: { "Authorization": "admin-token" }
})
.then(r => r.json())
.then(console.log)

// أو يحذف مقال
fetch("https://mahmoudelshora.vercel.app/api/posts/أي-ID", {
  method: "DELETE",
  headers: { "Authorization": "admin-token" }
})