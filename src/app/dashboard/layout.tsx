import { Sidebar } from "@/components/sidebar/sidebar"
import { Navbar } from "@/components/navbar/navbar"
import { CommandPaletteProvider } from "@/components/command-palette/command-palette"

export const dynamic = "force-dynamic"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <CommandPaletteProvider>
        <Sidebar />
        <Navbar />
        <main
          id="main-content"
          className="pt-16 min-h-screen transition-all duration-300"
          style={{ marginLeft: "var(--sidebar-width, 240px)" }}
        >
          {children}
        </main>
      </CommandPaletteProvider>
    </div>
  )
}
