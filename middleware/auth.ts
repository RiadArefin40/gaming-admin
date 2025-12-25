export default defineNuxtRouteMiddleware(() => {
  const user = localStorage.getItem("auth_user");
  console.log("user", user)
  if (!user) {
    return navigateTo("/auth/login");
  }
});
