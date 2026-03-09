import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import FormPage from './pages/FormPage'
import AnalysisPage from './pages/AnalysisPage'
import ResultPage from './pages/ResultPage'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/form" element={<FormPage />} />
        <Route path="/analysis/:uuid" element={<AnalysisPage />} />
        <Route path="/result/:uuid" element={<ResultPage />} />
      </Routes>
    </div>
  )
}

export default App
