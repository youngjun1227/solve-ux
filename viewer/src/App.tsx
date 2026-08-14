import { NavLink, Route, Routes } from 'react-router-dom'
import ListPage from './pages/ListPage'
import CardPage from './pages/CardPage'
import DirectionsPage from './pages/DirectionsPage'
import EvalSheetPage from './pages/EvalSheetPage'
import RecordSheetPage from './pages/RecordSheetPage'
import SurveyPage from './pages/SurveyPage'
import { cards } from './lib/cards'

export default function App() {
  return (
    <div className="app">
      <header className="masthead">
        <div className="masthead-left">
          <NavLink to="/" className="wordmark">
            SOL:VE <span className="wordmark-sub">카드 서랍</span>
          </NavLink>
          <nav className="nav" aria-label="화면">
            <NavLink to="/" end className="nav-link">
              카드 목록
            </NavLink>
            <NavLink to="/directions" className="nav-link">
              아이디어별 근거 모아보기
            </NavLink>
            <NavLink to="/eval-sheet" className="nav-link">
              경쟁 앱 평가지
            </NavLink>
            <NavLink to="/record-sheet" className="nav-link">
              개인 기록지
            </NavLink>
            <NavLink to="/survey" className="nav-link">
              설문지
            </NavLink>
          </nav>
        </div>
        <span className="masthead-note">근거 카드 {cards.length}장 · 읽기 전용</span>
      </header>
      <Routes>
        <Route path="/" element={<ListPage />} />
        <Route path="/directions" element={<DirectionsPage />} />
        <Route path="/eval-sheet" element={<EvalSheetPage />} />
        <Route path="/record-sheet" element={<RecordSheetPage />} />
        <Route path="/survey" element={<SurveyPage />} />
        <Route path="/card/:id" element={<CardPage />} />
      </Routes>
    </div>
  )
}
