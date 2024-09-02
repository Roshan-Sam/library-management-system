import { useContext } from "react";
import { CartCountContext } from "../context/cartCountContext";

export const useCartCountContext = () => {
    const context = useContext(CartCountContext);

    if (!context) {
        throw new Error("useCartCountContext must be used within the CartCountContextProvider")
    }

    return context
}