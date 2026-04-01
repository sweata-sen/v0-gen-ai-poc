import { Calculator } from '@/components/calculator'

export const metadata = {
  title: 'Scientific Calculator',
  description: 'A powerful calculator with BODMAS and trigonometry support',
}

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <Calculator />
    </main>
  )
}
