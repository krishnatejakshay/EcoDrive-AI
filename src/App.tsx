/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import { AppProvider, useApp } from './context/AppContext';
import ErrorBoundary from './components/ErrorBoundary';

const ThemesProvider = ThemeProvider as any;
import { Toaster } from 'sonner';
import { Layout } from './components/Layout';
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { Scanner } from './pages/Scanner';
import { Analyzer } from './pages/Analyzer';
import { Combined } from './pages/Combined';
import { EcoScore } from './pages/EcoScore';
import { Savings } from './pages/Savings';
import { Carbon } from './pages/Carbon';
import { Reports } from './pages/Reports';
import { Profile } from './pages/Profile';
import { DemoPage } from './pages/DemoPage';

function AppContent() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/scanner" element={<Scanner />} />
          <Route path="/analyzer" element={<Analyzer />} />
          <Route path="/combined" element={<Combined />} />
          <Route path="/eco-score" element={<EcoScore />} />
          <Route path="/savings" element={<Savings />} />
          <Route path="/carbon" element={<Carbon />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/demo" element={<DemoPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default function App() {
  return (
    <ThemesProvider attribute="class" defaultTheme="light">
      <Toaster position="top-center" richColors />
      <ErrorBoundary>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </ErrorBoundary>
    </ThemesProvider>
  );
}
