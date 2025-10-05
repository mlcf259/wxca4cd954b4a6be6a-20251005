import INDEX from '../pages/index.jsx';
import ACTIVITY from '../pages/activity.jsx';
import ACTIVITY_DETAIL from '../pages/activity-detail.jsx';
import PROFILE from '../pages/profile.jsx';
import INTEGRAL from '../pages/integral.jsx';
import DONATION from '../pages/donation.jsx';
import ADMIN_LOGIN from '../pages/admin-login.jsx';
import ADMIN_DASHBOARD from '../pages/admin-dashboard.jsx';
import ADMIN_USERS from '../pages/admin-users.jsx';
import ADMIN_EXCHANGE from '../pages/admin-exchange.jsx';
import ADMIN_ANALYTICS from '../pages/admin-analytics.jsx';
import ADMIN_ROLES from '../pages/admin-roles.jsx';
import ADMIN_ROLE-PERMISSIONS from '../pages/admin-role-permissions.jsx';
import ADMIN_USER-ROLES from '../pages/admin-user-roles.jsx';
import ADMIN_EXPORT from '../pages/admin-export.jsx';
import MOBILE_ADMIN from '../pages/mobile-admin.jsx';
import ADMIN_REPORTS from '../pages/admin-reports.jsx';
import ADMIN_BACKUP from '../pages/admin-backup.jsx';
export const routers = [{
  id: "index",
  component: INDEX
}, {
  id: "activity",
  component: ACTIVITY
}, {
  id: "activity-detail",
  component: ACTIVITY_DETAIL
}, {
  id: "profile",
  component: PROFILE
}, {
  id: "integral",
  component: INTEGRAL
}, {
  id: "donation",
  component: DONATION
}, {
  id: "admin-login",
  component: ADMIN_LOGIN
}, {
  id: "admin-dashboard",
  component: ADMIN_DASHBOARD
}, {
  id: "admin-users",
  component: ADMIN_USERS
}, {
  id: "admin-exchange",
  component: ADMIN_EXCHANGE
}, {
  id: "admin-analytics",
  component: ADMIN_ANALYTICS
}, {
  id: "admin-roles",
  component: ADMIN_ROLES
}, {
  id: "admin-role-permissions",
  component: ADMIN_ROLE-PERMISSIONS
}, {
  id: "admin-user-roles",
  component: ADMIN_USER-ROLES
}, {
  id: "admin-export",
  component: ADMIN_EXPORT
}, {
  id: "mobile-admin",
  component: MOBILE_ADMIN
}, {
  id: "admin-reports",
  component: ADMIN_REPORTS
}, {
  id: "admin-backup",
  component: ADMIN_BACKUP
}]