import axios from "axios";

const createApiClient = (baseURL) => axios.create({
    baseURL,
    headers: {
        "Content-Type": "application/json",
    },
});

const authApi = createApiClient(import.meta.env.VITE_AUTH_API_URL);
const deliveryApi = createApiClient(import.meta.env.VITE_DELIVERY_API_URL);


const attachInterceptors = (api) => {
    api.interceptors.request.use(
        (config) => {
            const token = localStorage.getItem("token");

            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }

            return config;
        },
        (error) => Promise.reject(error),
    );

    api.interceptors.response.use(
        (response) => response,
        (error) => {
            if (error.response?.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                if (window.location.pathname !== "/login" && window.location.pathname !== "/register") {
                    window.location.href = "/login";
                }
            }

            return Promise.reject(error);
        },
    );
};

attachInterceptors(authApi);
attachInterceptors(deliveryApi);

export { authApi, deliveryApi };
export default authApi;
