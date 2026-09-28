import '@fontsource-variable/geist'
import '@fontsource-variable/geist-mono'
import './kestra.css'
import { useEffect } from 'react'
import { Architecture } from './components/Architecture'
import { Benchmarks } from './components/Benchmarks'
import { Capabilities } from './components/Capabilities'
import { Faq, Footer } from './components/Footer'
import { Hero, MetricStrip, Nav } from './components/Hero'
import { Pricing } from './components/Pricing'

// Landing generada con la skill `minimalist-ui`.
export default function KestraLanding() {
  useEffect(() => {
    const prev = document.title
    document.title = 'KestraDB · Base de datos vectorial distribuida'
    return () => {
      document.title = prev
    }
  }, [])

  return (
    <div className="kestra min-h-screen">
      <div className="k-ambient" aria-hidden="true" />
      <Nav />
      <main className="relative mx-auto max-w-[1200px] border-x border-(--k-line)">
        <Hero />
        <MetricStrip />
        <Benchmarks />
        <Architecture />
        <Capabilities />
        <Pricing />
        <Faq />
      </main>
      <div className="relative mx-auto max-w-[1200px]">
        <Footer />
      </div>
    </div>
  )
}
