//@ts-ignore
import { getGlobalToast } from "../context/ToastContext";
//@ts-ignore
import useLoading from "./useLoadingUpdated";

const useApi = () => {
  const { loading, setLoading } = useLoading();

  const executeFun = async (fun:any, loadingLabel:any) => {
    try {
      let message = "";
      setLoading(loadingLabel, true);
      const response = await fun();
      if(response.status==false){
        const showToast = getGlobalToast();
        if (showToast) showToast(response.message, "error");
        return {
          data: null,
          error: true,
        };
      }

      if (response.success !== undefined) {
        const showToast = getGlobalToast();
        if (response.success && response.message) {
          if (showToast) showToast(response?.message ?? response.data?.message, "success");
        } else if (!response.success && response.message) {
          if (showToast) showToast(response.message, "error");
        }
        return response;
      }
      //prev
      // if (response.success !== undefined) {
      //   if (response.success && response.message) {
      //     toast.success(response.message);
      //   } else if (!response.success && response.message) {
      //     toast.error(response.message);
      //   }
      //   return response;
      // }

      if (typeof response?.data === "string") {
        const showToast = getGlobalToast();
        if (response?.status === 200) {
          if (showToast) showToast(response?.data, "success");
          return {
            data: null,
            success: true,
            error: false,
            message: null,
          };
        } else {
          if (showToast) showToast(response?.data, "error");
          return {
            data: null,
            error: true,
          };
        }
      }

      if (
        (response.data &&
          response?.data?.code &&
          response?.success !== undefined &&
          response?.data?.code !== 200 &&
          typeof response?.data.message &&
          typeof response?.data.message.msg === "string") ||
        response?.success === false
      ) {
        message = response?.data.message.msg;
        throw new Error(message);
      } else if (
        (response?.data?.code === 200 &&
          response?.data?.message &&
          response?.data?.message.length &&
          typeof response?.data?.message === "string") ||
        (response?.data?.success && response?.data.message !== "")
      ) {
        message = response?.data.message;
        const showToast = getGlobalToast();
        if (showToast) showToast(message, "success");
      }

      return {
        data: response?.data,
        error: false,
        success: true,
        message,
      };
    } catch (error) {
      let message = "";
      if (typeof error === "string") {
        message = error;
      } else if (error instanceof Error) {
        message = error.message;
      }
      console.log("Some error occured in the api", error);
      const showToast = getGlobalToast();
      if (showToast) showToast(message, "error");

      return {
        data: null,
        error: true,
        success: false,
        message,
      };
    } finally {
      setLoading(loadingLabel, false);
    }
  };
  return { executeFun, loading };
};

export default useApi;
