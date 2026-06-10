import axios from "axios";
const BASE = process.env.REACT_APP_BACKEND_URL;
export const API = `${BASE}/api`;

export const api = axios.create({ baseURL: API });

function readCookie(name) {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
    ?.split("=")[1];
}

api.interceptors.request.use((cfg) => {
  const t = localStorage.getItem("npw_token");
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  const csrf = readCookie("csrf_token");
  if (csrf) cfg.headers["X-CSRF-Token"] = decodeURIComponent(csrf);
  return cfg;
});
