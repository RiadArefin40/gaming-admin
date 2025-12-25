export const permissionChecker = () => {
  const userManagementPermissions = [
    "view user",
    "create user",
    "update user",
    "delete user",
  ];
  const driverManagementPermissions = [
    "view driver",
    "create driver",
    "update driver",
    "delete driver",
    "lock driver",
  ];
  const roleManagementPermissions = [
    "view role",
    "create role",
    "update role",
    "delete role",
  ];
  const rolePerManagementPermissions = ["view permission", "update permission"];
  const contentManagementPermissions = [
    "view content-management",
    "update content-management",
  ];
  const promoManagementPermissions = [
    "view promo-code",
    "create promo-code",
    "update promo-code",
    "delete promo-code",
  ];
  const driverFeePermissions = [
    "view driver-fee",
    "create driver-fee",
    "update driver-fee",
    "delete driver-fee",
  ];
  const packageManagementPermissions = [
    "view package",
    "create package",
    "update package",
    "delete package",
  ];
  const linkManagementPermissions = [
    "view promotional-link",
    "create promotional-link",
    "update promotional-link",
    "delete promotional-link",
  ];
  const celebrityManagementPermissions = [
    "view celebrity-content",
    "create celebrity-content",
    "update celebrity-content",
    "delete celebrity-content",
  ];
  const driverComManagementPermissions = [
    "view driver-commission",
    "create driver-commission",
    "update driver-commission",
    "delete driver-commission",
  ];
  const orderManagementPermissions = [
    "view order-management",
    "create order-management",
    "update order-management",
    "delete order-management",
    "change_owner order-management",
  ];
  const regionManagementPermissions = [
    "view region",
    "create region",
    "update region",
    "delete region",
  ];
  const locationManagementPermissions = [
    "view location",
    "create location",
    "update location",
    "delete location",
  ];
  const sliderManagementPermissions = [
    "view slider",
    "create slider",
    "update slider",
    "delete slider",
  ];
  const saleManagementPermissions = [
    "view sale-item",
    "create sale-item",
    "update sale-item",
    "delete sale-item",
  ];
  const paymentProblemPermissions = [
    "view payment-problem",

    "verify_payment payment-problem",

    "recalculate payment-problem",

    "complete_payment payment-problem",

    "active_order_item payment-problem",

    "change_owner payment-problem",
  ];
  return {
    userManagementPermissions,
    driverManagementPermissions,
    roleManagementPermissions,
    rolePerManagementPermissions,
    contentManagementPermissions,
    promoManagementPermissions,
    driverFeePermissions,
    packageManagementPermissions,
    linkManagementPermissions,
    celebrityManagementPermissions,
    driverComManagementPermissions,
    orderManagementPermissions,
    regionManagementPermissions,
    locationManagementPermissions,
    sliderManagementPermissions,
    saleManagementPermissions,
    paymentProblemPermissions
  };
};
