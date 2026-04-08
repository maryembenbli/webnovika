import { http } from "./http";

export const OrdersAPI = {
  create: (payload) =>
    http("/orders", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  saveAbandoned: (payload) =>
    http("/orders/abandoned", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
