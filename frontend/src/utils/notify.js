import { toast } from "react-toastify";
const options = {
    position: "top-center",
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "colored"
};

export const error_toastify = (message) => {
    toast.error(message, options);
}

export const success_toastify = (message) => {
    toast.success(message, options);
}

export const info_toastify = (message) => {
    toast.info(message, options);
}

export const warning_toastify = (message) => {
    toast.warning(message, options);
}