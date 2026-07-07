import { Navigate, Route, Routes } from 'react-router-dom'
import TopPage from './pages/TopPage'
import PlayPage from './pages/PlayPage'
import ResultPage from './pages/ResultPage'
import HowToPage from './pages/HowToPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<TopPage />} />
      <Route path="/play" element={<PlayPage />} />
      <Route path="/result" element={<ResultPage />} />
      <Route path="/howto" element={<HowToPage />} />
      <Route path="*" element={<Navigate replace to="/" />} />
    </Routes>
  )
}
