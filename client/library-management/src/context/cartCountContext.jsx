import { createContext, useEffect, useReducer } from "react";

export const CartCountContext = createContext();

export const cartCountReducer = (state, action) => {
  switch (action.type) {
    case "UPDATE_CART":
      return {
        ...state,
        cartCount: action.payload,
      };
    default:
      return state;
  }
};

export const CartCountContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartCountReducer, {
    cartCount: JSON.parse(localStorage.getItem("cartCount")) || 0,
  });

  useEffect(() => {
    localStorage.setItem("cartCount", JSON.stringify(state.cartCount));
  }, [state.cartCount]);

  console.log("cartCountContext state", state);

  return (
    <CartCountContext.Provider value={{ ...state, dispatch }}>
      {children}
    </CartCountContext.Provider>
  );
};
