import api from "./client";

// Every backend response is shaped like { message, data }
export const loginRequest = (email, password) =>
  api.post("/api/auth/login", { email, password }).then((r) => r.data);

export const fetchAppointments = () => api.get("/appointments").then((r) => r.data.data);

export const fetchAppointment = (id) => api.get(`/appointment/${id}`).then((r) => r.data.data);

export const createAppointment = (body) =>
  api.post("/appointment", body).then((r) => r.data.data);

export const updateAppointment = (id, body) =>
  api.put(`/appointment/${id}`, body).then((r) => r.data.data);

// action: "approve" | "reject" | "return"
export const submitAction = (id, action, remarks) =>
  api.put(`/appointment/${id}/status`, { action, remarks }).then((r) => r.data.data);
