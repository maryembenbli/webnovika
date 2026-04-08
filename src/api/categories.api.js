import { http } from "./http";

export const CategoriesAPI = {
  list: () => http("/categories"),
};