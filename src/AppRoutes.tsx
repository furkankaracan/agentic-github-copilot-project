import { Route, Routes } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { NotFound } from '@/components/NotFound';
import { AccountDetailPage } from '@/features/accounts/AccountDetailPage';
import { AccountFormPage } from '@/features/accounts/AccountFormPage';
import { AccountListPage } from '@/features/accounts/AccountListPage';
import { ContactFormPage } from '@/features/contacts/ContactFormPage';
import { ContactListPage } from '@/features/contacts/ContactListPage';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { OpportunityDetailPage } from '@/features/opportunities/OpportunityDetailPage';
import { OpportunityFormPage } from '@/features/opportunities/OpportunityFormPage';
import { OpportunityListPage } from '@/features/opportunities/OpportunityListPage';
import { OrderDetailPage } from '@/features/orders/OrderDetailPage';
import { OrderListPage } from '@/features/orders/OrderListPage';

/** Route table. Every new page is registered here — nowhere else. */
export function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<DashboardPage />} />
        <Route path="accounts" element={<AccountListPage />} />
        <Route path="accounts/new" element={<AccountFormPage />} />
        <Route path="accounts/:accountId" element={<AccountDetailPage />} />
        <Route path="contacts" element={<ContactListPage />} />
        <Route path="contacts/new" element={<ContactFormPage />} />
        <Route path="opportunities" element={<OpportunityListPage />} />
        <Route path="opportunities/new" element={<OpportunityFormPage />} />
        <Route path="opportunities/:opportunityId" element={<OpportunityDetailPage />} />
        <Route path="orders" element={<OrderListPage />} />
        <Route path="orders/:orderId" element={<OrderDetailPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
