import { lazy, Suspense } from 'react'
import { Link, Route, Routes } from 'react-router'
import { sites } from './sites'

const KestraLanding = lazy(() => import('./sites/kestradb-minimalist'))
const BrutalistPortfolio = lazy(() => import('./sites/portfolio-brutalist'))

// Index provisional: se reemplazará por el bento grid con previews.
function Home() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-24 font-sans">
      <h1 className="text-2xl font-semibold">Testing Skills Frontend</h1>
      <ul className="mt-8 divide-y divide-neutral-200 border-y border-neutral-200">
        {sites.map((site) => (
          <li key={site.slug}>
            <Link to={`/${site.slug}`} className="flex items-baseline justify-between py-4 hover:underline">
              <span>{site.name}</span>
              <span className="font-mono text-sm text-neutral-500">{site.skill}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}

function App() {
  return (
    <Suspense fallback={null}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/kestradb" element={<KestraLanding />} />
        <Route path="/sebastian-agudelo" element={<BrutalistPortfolio />} />
      </Routes>
    </Suspense>
  )
}

export default App
