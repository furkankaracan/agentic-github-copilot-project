import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './AppRoutes';
import { CrmProvider } from './store/CrmStore';
import './styles.css';

const root = document.getElementById('root');
if (!root) {
  throw new TypeError('Root element #root is missing from index.html.');
}

createRoot(root).render(
  <StrictMode>
    <BrowserRouter>
      <CrmProvider>
        <AppRoutes />
      </CrmProvider>
    </BrowserRouter>
  </StrictMode>,
);
