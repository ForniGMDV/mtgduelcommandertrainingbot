import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import GamePage from './pages/GamePage';
import DeckBuilder from './pages/DeckBuilder';
import Statistics from './pages/Statistics';
import Dashboard from './pages/Dashboard';
function App() {
    return (<Router>
      <Routes>
        <Route path="/" element={<Dashboard />}/>
        <Route path="/play" element={<GamePage />}/>
        <Route path="/deck-builder" element={<DeckBuilder />}/>
        <Route path="/stats" element={<Statistics />}/>
      </Routes>
    </Router>);
}
export default App;
//# sourceMappingURL=App.js.map