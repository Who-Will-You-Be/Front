import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainPage from './pages/MainPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import InputModePage from './pages/InputModePage'
import DirectInputPage from './pages/DirectInputPage'
import DirectInputManualPage from './pages/DirectInputManualPage'
import ImageInputPage from './pages/ImageInputPage'
import SituationTestPage from './pages/SituationTestPage'
import ReasonPage from './pages/ReasonPage'
import ResultPage from './pages/ResultPage'
import ProtectedRoute from './components/ProtectedRoute'
import Header from './components/Header'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/input-mode" element={<ProtectedRoute><InputModePage /></ProtectedRoute>} />
        <Route path="/direct-input" element={<ProtectedRoute><DirectInputPage /></ProtectedRoute>} />
        <Route path="/direct-input-manual" element={<ProtectedRoute><DirectInputManualPage /></ProtectedRoute>} />
        <Route path="/image-input" element={<ProtectedRoute><ImageInputPage /></ProtectedRoute>} />
        <Route path="/situation-test" element={<ProtectedRoute><SituationTestPage /></ProtectedRoute>} />
        <Route path="/reason" element={<ProtectedRoute><ReasonPage /></ProtectedRoute>} />
        <Route path="/result" element={<ProtectedRoute><ResultPage /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
