'use client';
import { ClientOnly } from "./client-only";
import { StoreResetHandler } from "./store-reset-handler";

export function StoreWrapper({children}: {children?: React.ReactNode}) {
    return (
        <>
        <ClientOnly>
            <StoreResetHandler />
        </ClientOnly>
        {children}
        </>
    );
}