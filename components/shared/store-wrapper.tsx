'use clients';
import { StoreInit } from "./store-init";
import { StoreResetHandler } from "./store-reset-handler";

export function StoreWrapper({children}: {children?: React.ReactNode}) {
    return (
        <>
        <StoreInit />
        <StoreResetHandler />
        {children}
        </>
    );
}