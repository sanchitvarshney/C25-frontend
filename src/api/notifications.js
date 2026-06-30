import { imsAxios } from "../axiosInterceptor";

export async function deleteAllNotifications() {
  return imsAxios.delete("/services/delete-notification");
}
