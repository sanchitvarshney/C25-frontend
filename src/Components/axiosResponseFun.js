import { getGlobalToast } from "../context/ToastContext";


const axiosResponseFunction = async (func) => {
  const showToast = getGlobalToast();
  try {
    await func();
  } catch (error) {
    showToast("Something went wrong, Please contact administrator", "error");
   
  }
};

export default axiosResponseFunction;
