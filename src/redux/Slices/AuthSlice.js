import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { LoginApi } from "../services/Apis";

const readStoredUser = () => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return null;

    try {
        return JSON.parse(storedUser);
    } catch {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        return null;
    }
};

const storedUser = readStoredUser();

const getErrorMessage = (error) =>
    error.response?.data?.message ||
    error.response?.data?.error ||
    (typeof error.response?.data === "string" ? error.response.data : null) ||
    error.message ||
    "Login failed. Please try again.";

export const handleriderlogin = createAsyncThunk(
    "rider/login",
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await LoginApi(credentials);
            const body = response.data;
            const data = body?.data ?? body;
            const token =
                data?.token ??
                data?.accessToken ??
                body?.token ??
                body?.accessToken;

            if (typeof token !== "string" || !token.trim()) {
                return rejectWithValue("The login response did not include an authentication token.");
            }

            const user =
                data?.user ??
                data?.rider ??
                body?.user ??
                body?.rider ??
                { email: credentials.email };

            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(user));

            return { token, user, response: body };
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    },
);

export const riderLogout = createAsyncThunk("rider/logout", async () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
});

const initialState = {
    token: localStorage.getItem("token"),
    user: storedUser,
    riderlogin: {
        loginloading: false,
        logindata: null,
        loginerror: null,
    },
};

const AuthSlice = createSlice({
    name: "rider",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(handleriderlogin.pending, (state) => {
                state.riderlogin.loginloading = true;
                state.riderlogin.loginerror = null;
            })
            .addCase(handleriderlogin.fulfilled, (state, action) => {
                state.riderlogin.loginloading = false;
                state.riderlogin.logindata = action.payload.response;
                state.token = action.payload.token;
                state.user = action.payload.user;
            })
            .addCase(handleriderlogin.rejected, (state, action) => {
                state.riderlogin.loginloading = false;
                state.riderlogin.loginerror =
                    action.payload || action.error.message || "Login failed. Please try again.";
            })
            .addCase(riderLogout.fulfilled, (state) => {
                state.token = null;
                state.user = null;
                state.riderlogin.logindata = null;
                state.riderlogin.loginerror = null;
            });
    },
});

export default AuthSlice.reducer;
