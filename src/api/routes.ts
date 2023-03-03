import { http } from "@/utils/http";
import { baseAPI } from "./utils";

type Result = {
  success: boolean;
  data: Array<any>;
};

export const getAsyncRoutes = () => {
  return http.request<Result>("post", baseAPI("/menu/list"));
};
