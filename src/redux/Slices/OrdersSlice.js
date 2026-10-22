import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { handleaccept, handleaccreptedride, handledelievred, handlegetlatestorders, handlemakeonline, handlepickup } from "../../services/Serviceapis/DeliveryApi";

// Get the latest available orders.
export const getallorders = createAsyncThunk("get/orders", async (_, ThunkAPi) => {
    try {
        const response = await handlegetlatestorders();
        if (!Array.isArray(response.data?.data)) {
            throw new Error("The available orders response has an unexpected format.");
        }
        return response.data.data;
    }
    catch (error) {
        return ThunkAPi.rejectWithValue(error.response?.data?.message || error.message || "Unable to load available orders.");
    }
});

// make it online / offline
export const makeitonlineofline = createAsyncThunk("post/online", async (data, ThunkApi) => {
    try {
        const resposne = await handlemakeonline(data);
        return resposne.data.data;
    }
    catch (error) {
        return ThunkApi.rejectWithValue(error.response?.data?.message || error.message);
    }
});

// accept order -> returns the full delivery (order items, customer, address, rider info)
export const acceptbooking = createAsyncThunk("post/accept", async (id, ThunkApi) => {
    try {
        const response = await handleaccept(id);
        return response.data.data;
    }
    catch (error) {
        return ThunkApi.rejectWithValue(error.response?.data?.message || error.message || "Unable to accept this order.");
    }
});

// my acceted orders 
export const getacceptrides = createAsyncThunk("get/myacceptrides", async (_, ThunkApi) => {
    try {
        const response = await handleaccreptedride();
        if (!Array.isArray(response.data?.data)) {
            throw new Error("The active deliveries response has an unexpected format.");
        }
        return response.data.data;
    }
    catch (error) {
        return ThunkApi.rejectWithValue(error.response?.data?.message || error.message || "Unable to load your active deliveries.");
    }
})

// confirm pickup (items collected from the store) -> returns the delivery with status PICKED_UP
export const acceptpickup = createAsyncThunk("put/pickup", async (id, ThunkApi) => {
    try {
        const resposne = await handlepickup(id);
        return resposne.data.data;
    }
    catch (error) {
        return ThunkApi.rejectWithValue(error.response?.data?.message || error.message || "Unable to confirm the pickup.");
    }
})

// complete the delivery with the customer's OTP -> returns the delivery with status DELIVERED
// the server checks the OTP: wrong OTP / too many attempts come back as a message
export const deliverysuccess = createAsyncThunk("post/delivery", async ({ id, otp }, ThunkApi) => {
    try {
        const response = await handledelievred(id, otp);
        return response.data.data;
    }
    catch (error) {
        const data = error.response?.data;
        const message = data?.message || error.message || "Unable to complete the delivery.";
        const left = data?.attemptsLeft;
        return ThunkApi.rejectWithValue(left !== undefined ? `${message} (${left} attempt${left === 1 ? "" : "s"} left)` : message);
    }
})

const initialState = {
    orderdata: {
        orderloading: false,
        ordererror: null,
        orderlist: [],
    },
    rideronline: {
        online: false,
        onlineloading: false,
        onlineerror: null,
    },
    accpetbooking: {
        acceptloading: false,
        acceptdata: [],
        accepterror: null,
        activeRidesLoading: false,
        activeRidesStatus: "idle",
        activeRidesError: null,
        pickuploading: false,
        pickuperror: null,
        deliveryloading: false,
        deliveryerror: null,
    },
};

const OrdersSlice = createSlice({
    name: "orders",
    initialState,
    reducers: {
        // live socket events
        liveOrderAdded: (state, action) => {
            const job = action.payload;
            if (!job?._id) return;
            if (!state.orderdata.orderlist.some((o) => o._id === job._id)) state.orderdata.orderlist.unshift(job);
        },
        liveOrderRemoved: (state, action) => {
            state.orderdata.orderlist = state.orderdata.orderlist.filter((o) => o._id !== action.payload);
        },
        clearAcceptedBooking: (state) => {
            state.accpetbooking.acceptdata = [];
            state.accpetbooking.accepterror = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // order data
            .addCase(getallorders.pending, (state, action) => {
                if (!action.meta.arg?.silent) state.orderdata.orderloading = true;
                state.orderdata.ordererror = null;
            })
            .addCase(getallorders.fulfilled, (state, action) => {
                state.orderdata.orderloading = false;
                state.orderdata.orderlist = action.payload;
            })
            .addCase(getallorders.rejected, (state, action) => {
                state.orderdata.orderloading = false;
                state.orderdata.ordererror = action.payload;
            })

            // make it online / offline
            .addCase(makeitonlineofline.pending, (state) => {
                state.rideronline.onlineloading = true;
                state.rideronline.onlineerror = null;
            })
            .addCase(makeitonlineofline.fulfilled, (state, action) => {
                state.rideronline.onlineloading = false;
                state.rideronline.online = action.payload;
            })
            .addCase(makeitonlineofline.rejected, (state, action) => {
                state.rideronline.onlineloading = false;
                state.rideronline.onlineerror = action.payload;
            })

            // accept order
            .addCase(acceptbooking.pending, (state) => {
                state.accpetbooking.acceptloading = true;
                state.accpetbooking.accepterror = null;
            })
            .addCase(acceptbooking.fulfilled, (state, action) => {
                state.accpetbooking.acceptloading = false;
                const acceptedDelivery = action.payload?.delivery || action.payload?.order || action.payload;
                const acceptedId = acceptedDelivery?._id;
                if (acceptedId) {
                    state.accpetbooking.acceptdata = [
                        ...state.accpetbooking.acceptdata.filter((delivery) => delivery._id !== acceptedId),
                        acceptedDelivery,
                    ];
                }
            })
            .addCase(acceptbooking.rejected, (state, action) => {
                state.accpetbooking.acceptloading = false;
                state.accpetbooking.accepterror = action.payload;
            })

            // get my accptes inly
            .addCase(getacceptrides.pending, (state) => {
                state.accpetbooking.activeRidesLoading = true;
                state.accpetbooking.activeRidesStatus = "pending";
                state.accpetbooking.activeRidesError = null;
            })
            .addCase(getacceptrides.fulfilled, (state, action) => {
                state.accpetbooking.activeRidesLoading = false;
                state.accpetbooking.activeRidesStatus = "fulfilled";
                state.accpetbooking.acceptdata = action.payload;
                state.accpetbooking.activeRidesError = null;
            })
            .addCase(getacceptrides.rejected, (state, action) => {
                state.accpetbooking.activeRidesLoading = false;
                state.accpetbooking.activeRidesStatus = "rejected";
                state.accpetbooking.activeRidesError = action.payload;
            })

            // confirm pickup -> the delivery in my accepted list becomes PICKED_UP
            .addCase(acceptpickup.pending, (state) => {
                state.accpetbooking.pickuploading = true;
                state.accpetbooking.pickuperror = null;
            })
            .addCase(acceptpickup.fulfilled, (state, action) => {
                state.accpetbooking.pickuploading = false;
                const updated = action.payload?.delivery || action.payload;
                if (updated?._id && Array.isArray(state.accpetbooking.acceptdata)) {
                    state.accpetbooking.acceptdata = state.accpetbooking.acceptdata.map((delivery) =>
                        delivery._id === updated._id ? { ...delivery, ...updated } : delivery
                    );
                }
            })
            .addCase(acceptpickup.rejected, (state, action) => {
                state.accpetbooking.pickuploading = false;
                state.accpetbooking.pickuperror = action.payload;
            })

            // complete delivery (OTP) -> the delivery in my accepted list becomes DELIVERED
            .addCase(deliverysuccess.pending, (state) => {
                state.accpetbooking.deliveryloading = true;
                state.accpetbooking.deliveryerror = null;
            })
            .addCase(deliverysuccess.fulfilled, (state, action) => {
                state.accpetbooking.deliveryloading = false;
                const updated = action.payload?.delivery || action.payload;
                if (updated?._id && Array.isArray(state.accpetbooking.acceptdata)) {
                    state.accpetbooking.acceptdata = state.accpetbooking.acceptdata.map((delivery) =>
                        delivery._id === updated._id ? { ...delivery, ...updated } : delivery
                    );
                }
            })
            .addCase(deliverysuccess.rejected, (state, action) => {
                state.accpetbooking.deliveryloading = false;
                state.accpetbooking.deliveryerror = action.payload;
            })
    },
});

export const { clearAcceptedBooking, liveOrderAdded, liveOrderRemoved } = OrdersSlice.actions;
export default OrdersSlice.reducer;