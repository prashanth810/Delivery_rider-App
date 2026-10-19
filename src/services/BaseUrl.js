import axios from "axios";

const createApiClient = (baseURL) => axios.create({
    baseURL,
    headers: {
        "Content-Type": "application/json",
    },
});

const authApi = createApiClient(import.meta.env.VITE_AUTH_API_URL);
const productApi = createApiClient(import.meta.env.VITE_PRODUCT_API_URL);
const categoryApi = createApiClient(import.meta.env.VITE_CATEGORY_API_URL);
const cartApi = createApiClient(import.meta.env.VITE_CART_API_URL);
const addressApi = createApiClient(import.meta.env.VITE_ADDRESS_API_URL);
const orderApi = createApiClient(import.meta.env.VITE_ORDER_API_URL);


const attachInterceptors = (api) => {
    api.interceptors.request.use(
        (config) => {
            const token = sessionStorage.getItem("token");

            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }

            return config;
        },
        (error) => Promise.reject(error)
    );

    api.interceptors.response.use(
        (response) => response,
        (error) => {
            if (error.response?.status === 401) {
                sessionStorage.removeItem("token");
                window.location.href = "/login";
            }

            return Promise.reject(error);
        }
    );
};

attachInterceptors(authApi);
attachInterceptors(productApi);
attachInterceptors(categoryApi);
attachInterceptors(cartApi);
attachInterceptors(addressApi);
attachInterceptors(orderApi);


export { authApi, productApi, categoryApi, cartApi, addressApi, orderApi };
export default authApi;