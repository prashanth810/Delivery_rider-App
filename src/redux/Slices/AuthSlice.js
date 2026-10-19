import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getmyprofielinfo, handlelogout, handleprofileedit, LoginApi, Registerapi } from "../services/Apis";

// register api
export const handleRegister = createAsyncThunk("auth/register", async (data, { rejectWithValue }) => {
    try {
        const response = await Registerapi(data);
        return response.data;
    }
    catch (error) {
        return rejectWithValue(
            error.response?.data?.message ||
            error.response?.data?.error ||
            (typeof error.response?.data === "string" ? error.response.data : null) ||
            (error.response?.status === 429 ? "Too many requests" : null) ||
            error.message
        );
    }
});

export const handleLogin = createAsyncThunk("auth/login", async (data, { rejectWithValue }) => {
    try {
        const response = await LoginApi(data);
        return response.data;
    }
    catch (error) {
        return rejectWithValue(
            error.response?.data?.message ||
            error.response?.data?.error ||
            (typeof error.response?.data === "string" ? error.response.data : null) ||
            (error.response?.status === 429 ? "Too many requests" : null) ||
            error.message
        );
    }
});

export const handlefetchprofileinfo = createAsyncThunk("auth/profil", async (_, ThunkApi) => {
    try {
        const resposne = await getmyprofielinfo();
        return resposne.data.data;
    }
    catch (error) {
        return ThunkApi.rejectWithValue(error.message);
    }
})

// logout 
export const logoutapi = createAsyncThunk("auth/logout", async (token, ThunkApi) => {
    try {
        const response = await handlelogout(token);
        return response.data.data;
    }
    catch (error) {
        return ThunkApi.rejectWithValue(error.message);
    }
})

// update profile data
export const updateprofile = createAsyncThunk("auth/edit", async ({ id, data }, ThunkApi) => {
    try {
        const response = await handleprofileedit({ id, data });
        const payload = response.data;
        return payload?.data?.user ?? payload?.data ?? payload?.user ?? payload;
    }
    catch (error) {
        return ThunkApi.rejectWithValue(
            error.response?.data?.message ||
            error.response?.data?.error ||
            (typeof error.response?.data === "string" ? error.response.data : null) ||
            error.message ||
            "Unable to update your profile"
        );
    }
})



const AuthSlice = createSlice({
    name: "auth",

    initialState: {
        register: {
            registerloading: false,
            registerdata: {},
            registererror: null,
            token: null,
        },
        login: {
            loginloading: false,
            logindata: {},
            loginerror: null,
            token: null,
        },
        profile: {
            profileloading: false,
            profiledata: null,
            profileerror: null,
            profileupdating: false,
            profileupdateerror: null,
        },

    },

    reducers: {
        logout: (state) => {
            state.login.token = null;
            state.login.logindata = {};
            state.profile.profiledata = null;
            sessionStorage.removeItem("token");
        },
    },

    extraReducers: (builder) => {
        builder
            .addCase(handleRegister.pending, (state) => {
                state.register.registerloading = true;
            })
            .addCase(handleRegister.fulfilled, (state, action) => {
                state.register.registerloading = false;
                state.register.registerdata = action.payload.data;
                state.register.token = action.payload.token;
                sessionStorage.setItem("token", action.payload.token);
            })
            .addCase(handleRegister.rejected, (state, action) => {
                state.register.registerloading = false;
                state.register.registererror = action.payload;
            })
            .addCase(handleLogin.pending, (state) => {
                state.login.loginloading = true;
                state.login.loginerror = null;
            })
            .addCase(handleLogin.fulfilled, (state, action) => {
                state.login.loginloading = false;
                state.login.logindata = action.payload.data;
                state.login.token = action.payload.token;
                sessionStorage.setItem("token", action.payload.token);
            })
            .addCase(handleLogin.rejected, (state, action) => {
                state.login.loginloading = false;
                state.login.loginerror = action.payload;
            })
            .addCase(handlefetchprofileinfo.pending, (state) => {
                state.profile.profileloading = true;
                state.profile.profileerror = null;
            })
            .addCase(handlefetchprofileinfo.fulfilled, (state, action) => {
                state.profile.profileloading = false;
                state.profile.profiledata = action.payload;
            })
            .addCase(handlefetchprofileinfo.rejected, (state, action) => {
                state.profile.profileloading = false;
                state.profile.profileerror = action.payload;
            })
            .addCase(updateprofile.pending, (state) => {
                state.profile.profileupdating = true;
                state.profile.profileupdateerror = null;
            })
            .addCase(updateprofile.fulfilled, (state, action) => {
                state.profile.profileupdating = false;
                state.profile.profiledata = action.payload;
            })
            .addCase(updateprofile.rejected, (state, action) => {
                state.profile.profileupdating = false;
                state.profile.profileupdateerror = action.payload;
            })

            // logout
            .addCase(logoutapi.pending, (state) => {
                state.login.loginloading = true;
            })
            .addCase(logoutapi.fulfilled, (state) => {
                state.login.loginloading = false;
                state.login.token = null;
                state.login.logindata = {};
                state.profile.profiledata = null;
                state.register.registerloading = false;
                state.register.token = null;
                state.register.registerdata = {};
                state.profile.profiledata = null;
                sessionStorage.removeItem("token");
            })
            .addCase(logoutapi.rejected, (state, action) => {
                state.login.loginloading = false;
                state.login.loginerror = action.payload;
            })
    }
})

export const { logout } = AuthSlice.actions;
export default AuthSlice.reducer;