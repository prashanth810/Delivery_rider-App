import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
    getmyprofielinfo, handlelogout, handleprofileedit, LoginApi, Registerapi,
    ResendOtpApi, SaveStepApi, SubmitOnboardingApi, VerifyOtpApi,
} from "../services/Apis";

const errMsg = (e) =>
    e.response?.data?.message || e.response?.data?.error ||
    (typeof e.response?.data === "string" ? e.response.data : null) ||
    (e.response?.status === 429 ? "Too many requests" : null) ||
    e.message || "Something went wrong";

const thunk = (name, fn) =>
    createAsyncThunk(name, async (arg, { rejectWithValue }) => {
        try { return await fn(arg); } catch (e) { return rejectWithValue(errMsg(e)); }
    });

export const registerRider = thunk("auth/register", async (d) => (await Registerapi(d)).data);
export const resendOtp = thunk("auth/resendOtp", async (d) => (await ResendOtpApi(d)).data);
export const verifyOtp = thunk("auth/verifyOtp", async (d) => (await VerifyOtpApi(d)).data);
export const loginRider = thunk("auth/login", async (d) => {
    const { remember, ...creds } = d;
    const res = (await LoginApi(creds)).data;
    return { ...res, remember };
});
export const fetchProfile = thunk("auth/profile", async () => (await getmyprofielinfo()).data.data);
export const saveStep = thunk("auth/saveStep", async ({ step, data }) => (await SaveStepApi(step, data)).data.data);
export const submitOnboarding = thunk("auth/submit", async () => (await SubmitOnboardingApi()).data.data);
export const updateProfile = thunk("auth/updateProfile", async (d) => (await handleprofileedit(d)).data.data);
export const logoutapi = createAsyncThunk("auth/logout", async () => {
    try { await handlelogout(); } catch { /* ignore – always clear locally */ }
});

const initialState = {
    user: null,
    loading: false,
    error: null,
    pendingRegistration: null, // { phone } while the OTP popup is open
};

const AuthSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        clearError: (s) => { s.error = null; },
        cancelOtp: (s) => { s.pendingRegistration = null; },
        logout: () => { },
    },
    extraReducers: (b) => {
        const pending = (s) => { s.loading = true; s.error = null; };
        const rejected = (s, a) => { s.loading = false; s.error = a.payload; };
        const setUser = (s, a) => { s.loading = false; s.user = a.payload; };

        b.addCase(registerRider.pending, pending)
            .addCase(registerRider.fulfilled, (s, a) => { s.loading = false; s.pendingRegistration = a.payload.data; })
            .addCase(registerRider.rejected, rejected)

            .addCase(verifyOtp.pending, pending)
            .addCase(verifyOtp.fulfilled, (s, a) => {
                s.loading = false; s.pendingRegistration = null;
                s.user = a.payload.data; s.token = a.payload.token;
            })
            .addCase(verifyOtp.rejected, rejected)

            .addCase(loginRider.pending, pending)
            .addCase(loginRider.fulfilled, (s, a) => {
                s.loading = false; s.user = a.payload.data; s.token = a.payload.token;
            })
            .addCase(loginRider.rejected, rejected)

            .addCase(fetchProfile.fulfilled, (s, a) => { s.booting = false; s.user = a.payload; })
            .addCase(fetchProfile.rejected, (s) => { s.booting = false; s.token = null })

            .addCase(saveStep.pending, pending).addCase(saveStep.fulfilled, setUser).addCase(saveStep.rejected, rejected)
            .addCase(submitOnboarding.pending, pending).addCase(submitOnboarding.fulfilled, setUser).addCase(submitOnboarding.rejected, rejected)
            .addCase(updateProfile.pending, pending).addCase(updateProfile.fulfilled, setUser).addCase(updateProfile.rejected, rejected)
            .addCase(resendOtp.rejected, rejected)

            .addCase(logoutapi.fulfilled, (s) => { s.user = null; s.token = null; s.pendingRegistration = null; });
    },
});

export const { logout, clearError, cancelOtp } = AuthSlice.actions;
export default AuthSlice.reducer;