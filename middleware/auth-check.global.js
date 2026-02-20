export default defineNuxtRouteMiddleware((to) => {
  if (to.path === "/auth/login") return;

  if (process.client) {
    const token = sessionStorage.getItem("auth_token");

    if (!token) {
      return navigateTo("/auth/login");
    }
  }
});