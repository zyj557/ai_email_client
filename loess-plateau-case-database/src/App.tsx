import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import Layout from './components/Layout/Layout';
import HomePage from './pages/HomePage';
import CaseLibrary from './pages/CaseLibrary';
import CaseDetail from './pages/CaseDetail';
import AdminDashboard from './pages/AdminDashboard';
import './App.css';

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/cases" element={<CaseLibrary />} />
            <Route path="/cases/:id" element={<CaseDetail />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
