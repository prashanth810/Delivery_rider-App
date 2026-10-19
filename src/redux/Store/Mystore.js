import { configureStore } from "@reduxjs/toolkit";
import AuthSlice from "../Slices/AuthSlice.js";
import OrdersSlice from "../Slices/OrdersSlice.js";

const Mystore = configureStore({
    reducer: {
        auth: AuthSlice,
        orders: OrdersSlice
    }
});
export default Mystore;