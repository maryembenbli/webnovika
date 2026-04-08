import { http } from './http';

export const DashboardAPI = {
  summary: () => http('/dashboard/summary'),
};
