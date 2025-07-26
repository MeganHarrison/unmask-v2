export default function NoSidebarLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-950">
      {children}
    </div>
  )
}