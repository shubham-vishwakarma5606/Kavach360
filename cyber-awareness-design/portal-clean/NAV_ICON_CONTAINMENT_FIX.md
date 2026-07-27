# Nav Icon Containment Fix

Issue: when the left nav was collapsed, icons were appearing over the dashboard content area.

Fix applied:

- Collapsed nav width remains 84px.
- Nav content margin is reset to `0` in collapsed state.
- Icons are centered inside the 84px nav pane.
- Expanded nav grows to 304px on hover.
- Labels only appear when nav is expanded.
- Tooltips may appear to the right only when hovering an icon, but the icons themselves stay inside the nav pane.

Updated files:

- `portal-clean/left-glass-portal.html`
- `final-release/final-portal.html`
