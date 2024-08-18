import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import icon from '../../assets/icon.png';
import './styles/App.css';

function Hello() {
  return (
    <div style={{ userSelect: 'none' }}>
      <div className="image-container">
        <img width="70" alt="icon" src={icon} draggable="false" />
      </div>
      <div className="loading-bar">
        <div className="loading-bar-fill" />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hello />} />
      </Routes>
    </Router>
  );
}
