import { Route, Routes } from 'react-router-dom';
import { CladogramPage } from '../pages/CladogramPage';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<CladogramPage />} />
    </Routes>
  );
}

export default App;
