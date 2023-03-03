// 获取某个用户信息
import { http } from "@/utils/http";

import { baseAPI } from "../utils";
import { IResultType } from "./types";

export const requestUserInfoById = (id?: number) => {
  return http.request<IResultType>("get", baseAPI(`/users/${id}`));
};

export const reqUserMenuByRoleId = (id?: number) => {
  return http.request<IResultType>("get", baseAPI(`/role/${id}/menu`));
};

// export function requestUserInfoById(id: number) {
//   return pRequest.get<IDataType>({
//     url: LoginAPI.LoginUserInfo + id,
//     showLoading: false
//   });
// }

// 获取侧边栏全部数据
