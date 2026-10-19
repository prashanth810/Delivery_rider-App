import { configureStore } from "@reduxjs/toolkit";
import AuthSlice from "../Slices/AuthSlice.js";

const Mystore = configureStore({
    reducer: {
        auth: AuthSlice,
    }
})

export default Mystore;