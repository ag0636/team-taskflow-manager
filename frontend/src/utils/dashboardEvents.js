export const DASHBOARD_SUMMARY_REFRESH_EVENT = "dashboard:refresh-summary";

export function notifyDashboardSummaryRefresh() {
  window.dispatchEvent(new CustomEvent(DASHBOARD_SUMMARY_REFRESH_EVENT));
}
