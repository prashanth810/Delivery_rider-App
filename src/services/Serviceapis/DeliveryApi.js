import { deliveryApi } from "../BaseUrl";

const baseurl = '/api/auth/v6'

// get get latest orders
export const handlegetlatestorders = async () => {
    try {
        const response = deliveryApi.get(`${baseurl}/deliveries/available`);
        return response;
    }
    catch (error) {
        console.log(error.message)
    }
};

// make it online / offline
export const handlemakeonline = async (data) => {
    try {
        const resposne = await deliveryApi.post(`${baseurl}/rider/availability`, data);
        return resposne;
    }
    catch (error) {
        console.log(error.response?.data || error.message);
        throw error; // let the thunk's rejectWithValue show the real message
    }
}

// handle accept orders
export const handleaccept = async (id) => {
    try {
        const response = await deliveryApi.post(`${baseurl}/deliveries/${id}/accept`);
        return response;
    } catch (error) {
        console.log("Accept API error:", error.response?.data || error.message);
        throw error; // let the thunk's rejectWithValue handle it
    }
};

// get accepted rides
export const handleaccreptedride = async () => {
    return deliveryApi.get(`${baseurl}/deliveries/my/active`);
}

// confirm pickup (rider collected the items from the store)
export const handlepickup = async (id) => {
    return deliveryApi.patch(`${baseurl}/deliveries/${id}/pickup`);
};

// resend customer OTP email
export const handleresendotp = async (id) => {
    return deliveryApi.post(`${baseurl}/deliveries/${id}/resend-otp`);
};

// complete the delivery with the OTP given by the customer
export const handledelievred = async (id, otp) => {
    return deliveryApi.post(`${baseurl}/deliveries/${id}/deliver`, { otp });
};
