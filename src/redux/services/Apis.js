import { authApi } from "../../services/BaseUrl";


const baseurl = '/api/auth/v6';

// regsiter api
export const Registerapi = async (data) => {
    try {
        const response = await authApi.post("/api/auth/v1/register", data);
        return response;
    }
    catch (error) {
        console.log("Error in Registerapi", error);
        throw error;
    }
}

// login 
export const LoginApi = async (data) => {
    const { email, password } = data;
    return authApi.post(`${baseurl}/rider/login`, { email, password });
}

// get all my profile info 
export const getmyprofielinfo = async () => {
    try {
        const response = await authApi.get("/api/auth/v1/myprofile");
        return response;
    }
    catch (error) {
        console.log(error.message);
        throw error;
    }
}

// vendor register
export const handlevendorregister = async (data) => {
    try {
        const resposne = await authApi.post("/api/auth/v1/vendor/register", data);
        return resposne;
    }
    catch (error) {
        console.log(error.message);
        throw error;
    }
}

// logout api
export const handlelogout = async (token) => {
    try {
        const response = await authApi.post("/api/auth/v1/logout", { token });
        return response;
    }
    catch (error) {
        console.error(error.message);
        throw error;
    }
}

// update profile 
export const handleprofileedit = async ({ id, data }) => {
    try {
        const response = await authApi.put(
            `/api/auth/v1/profile/${encodeURIComponent(id)}`,
            data,
            data instanceof FormData
                ? { headers: { "Content-Type": "multipart/form-data" } }
                : undefined
        );
        return response;
    }
    catch (error) {
        console.error("Profile update failed:", error.response?.data || error.message);
        throw error;
    }
}