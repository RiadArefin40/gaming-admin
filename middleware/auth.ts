export default defineNuxtRouteMiddleware(() => {
  if (process.client) {
    const user = localStorage.getItem("auth_user");

    if (!user) {
      return navigateTo("/auth/login");
    }
  }
});
