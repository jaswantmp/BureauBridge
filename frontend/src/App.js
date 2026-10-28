import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AppProvider } from '@/store/AppStore';
import AppShell from '@/components/AppShell';
import Welcome from '@/pages/Welcome';
import Dashboard from '@/pages/Dashboard';
import Registry from '@/pages/Registry';
import InstitutionDetail from '@/pages/InstitutionDetail';
import InstitutionForm from '@/pages/InstitutionForm';
import Complaints from '@/pages/Complaints';
import ComplaintDetail from '@/pages/ComplaintDetail';
import ComplaintRegister from '@/pages/ComplaintRegister';
import Conflicts from '@/pages/Conflicts';
import ConflictDetail from '@/pages/ConflictDetail';
import Coordination from '@/pages/Coordination';
import CoordinationDetail from '@/pages/CoordinationDetail';
import CoordinationCompose from '@/pages/CoordinationCompose';
import NotFound from '@/pages/NotFound';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/app" element={<AppShell />}>
            <Route index element={<Dashboard />} />
            <Route path="registry" element={<Registry />} />
            <Route path="registry/new" element={<InstitutionForm />} />
            <Route path="registry/:id" element={<InstitutionDetail />} />
            <Route path="registry/:id/edit" element={<InstitutionForm />} />
            <Route path="complaints" element={<Complaints />} />
            <Route path="complaints/new" element={<ComplaintRegister />} />
            <Route path="complaints/:caseId" element={<ComplaintDetail />} />
            <Route path="conflicts" element={<Conflicts />} />
            <Route path="conflicts/:id" element={<ConflictDetail />} />
            <Route path="coordination" element={<Coordination />} />
            <Route path="coordination/compose" element={<CoordinationCompose />} />
            <Route path="coordination/:id" element={<CoordinationDetail />} />
          </Route>
          <Route path="/dashboard" element={<Navigate to="/app" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster
          theme="dark"
          position="top-right"
          richColors
          toastOptions={{
            style: { background: '#0A1222', border: '1px solid rgba(148,163,184,0.25)', color: '#E2E8F0', fontFamily: "'IBM Plex Sans', sans-serif" },
          }}
        />
      </BrowserRouter>
    </AppProvider>
  );
}
