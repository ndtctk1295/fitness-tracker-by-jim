// 'use server';

import AppLayout from '@/components/layouts/app-layout';
import { StoreWrapper } from '@/components/shared/store-wrapper';
// This layout wraps all protected routes that require authentication
export default async function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {  
  return (
      <AppLayout>
        <StoreWrapper>
        {children}
        {/* Store Reset Handler - manages store state across user sessions */}
        </StoreWrapper>
      </AppLayout>
  );
}
