export default defineNuxtRouteMiddleware(() => {
  const user = localStorage.getItem("auth_user");
  if (!user) {
    return navigateTo("/auth/login");
  }
});
