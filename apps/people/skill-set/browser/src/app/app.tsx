import { ThemeProvider } from '@mui/material/styles';
import { Route, Routes } from 'react-router-dom';
import { NavigationBar } from '../components/shared/NavigationBar';
import { CladogramPage } from '../pages/CladogramPage';
import { HomePage } from '../pages/Home';
import { createTheme } from '../theme';

const theme = createTheme({ colorPreset: 'purple' });

export function App() {
  return (
    <ThemeProvider theme={theme}>
      <br />
      <hr />
      <br />
      <NavigationBar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/cladogram" element={<CladogramPage />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
