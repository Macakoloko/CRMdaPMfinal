import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppointmentProvider } from './context/AppointmentContext';
import { SupabaseProvider } from './context/SupabaseContext';
import { FinancialProvider } from './context/FinancialContext';
import { ProductsProvider } from './context/ProductsContext';
import { ThemeProvider } from './context/ThemeContext';
import Agenda from './pages/Agenda';
// ... existing code ...

function App() {
  return (
    <ThemeProvider>
      <SupabaseProvider>
        <AppointmentProvider>
          <FinancialProvider>
            <ProductsProvider>
              <Router>
                <Routes>
                  <Route path="/agenda" element={<Agenda />} />
                  {/* Other routes */}
                </Routes>
              </Router>
            </ProductsProvider>
          </FinancialProvider>
        </AppointmentProvider>
      </SupabaseProvider>
    </ThemeProvider>
  );
}

export default App; 