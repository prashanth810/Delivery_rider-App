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
        console.log(error.message);
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
    try {
        const resposne = await deliveryApi.get(`${baseurl}/deliveries/my/active`);
        return resposne;
    }
    catch (error) {
        console.log("Getting Api error:", error.message?.data || error.message);
    }
}