import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true, // session-based auth, same convention as the rest of ITSR Portal
});

// export async function getComplaintSummary(orgId = 103) {
//   const { data } = await api.get("/customercomplaint/summary", { params: { orgId } });
//   return data.data;
// }

// export async function getComplaintTrend(orgId = 103) {
//   const { data } = await api.get("/customercomplaint/trend", { params: { orgId } });
//   return data.data;
// }

// export async function getProductSummary(orgId = 103, page = 1, pageSize = 10) {
//   const { data } = await api.get("/customercomplaint/product-summary", {
//     params: { orgId, page, pageSize },
//   });
//   return data.data;
// }
export const getComplaintSummary = (orgId, fromDate, toDate) =>
  api
    .get("/customercomplaint/summary", {
      params: { orgId, fromDate, toDate },
    })
    .then((r) => r.data.data);

export const getComplaintTrend = (orgId, fromDate, toDate) =>
  api
    .get("/customercomplaint/trend", {
      params: { orgId, fromDate, toDate },
    })
    .then((r) => r.data.data);

export const getProductSummary = (
  orgId,
  page,
  pageSize,
  fromDate,
  toDate
) =>
  api
    .get("/customercomplaint/product-summary", {
      params: {
        orgId,
        page,
        pageSize,
        fromDate,
        toDate,
      },
    })
    .then((r) => r.data.data);

export const downloadComplaintExport = (
  orgId,
  fromDate,
  toDate
) => {
  window.open(
    `${API_URL}/customercomplaint/export?orgId=${orgId}&fromDate=${fromDate}&toDate=${toDate}`,
    "_blank"
  );
};
