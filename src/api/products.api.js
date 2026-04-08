import { http } from "./http";

export const ProductsAPI = {
  list: () => http("/products"),
  byId: (id) => http(`/products/${id}`),
};