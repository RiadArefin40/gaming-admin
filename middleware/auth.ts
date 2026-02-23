export default defineNuxtRouteMiddleware(() => {
  if (process.client) {
    const user = sessionStorage.getItem("auth_user");

    if (!user) {
      return navigateTo("/auth/login");
    }
  }
});
