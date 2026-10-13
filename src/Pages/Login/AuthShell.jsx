import { Typography } from "antd";
import { PackageCheck, ScanBarcode, Truck, ShieldCheck } from "lucide-react";
import "./AuthShell.css";

const { Text } = Typography;

const features = [
  { icon: PackageCheck, label: "Track stock levels across every location" },
  { icon: ScanBarcode, label: "Faster inward, outward & material issue" },
  { icon: Truck, label: "Purchase orders, vendors & dispatch in one place" },
  { icon: ShieldCheck, label: "Role-based access with secure sign-in" },
];

const stats = [
  { value: "Real-time", label: "Stock visibility" },
  { value: "Multi", label: "Branch support" },
  { value: "Audit", label: "Ready reports" },
];

/**
 * Shared layout for login, sign-up, and OTP screens (brand panel + form panel).
 */
export default function AuthShell({ footerLeft, children }) {
  return (
    <div className="auth-shell">
      <div className="auth-card">
        <aside className="auth-brand">
          <div className="auth-brand-logo">
            <div className="auth-brand-logo-tile">
              <img src={"/assets/images/mscorpres_auto_logo.png"} alt="Oakter Logo" />
            </div>
            <div className="auth-brand-name">
              IMS (C25)
              <small>Inventory Management System</small>
            </div>
          </div>

          <div>
            <h2 className="auth-brand-headline">
              Every part, every store, <span>always in sync.</span>
            </h2>
            <p className="auth-brand-copy">
              Manage materials, warehouses and production flow from a single
              dashboard built for the shop floor.
            </p>
          </div>

          <ul className="auth-features">
            {features.map(({ icon: Icon, label }) => (
              <li key={label}>
                <span className="auth-feature-icon">
                  <Icon size={18} />
                </span>
                {label}
              </li>
            ))}
          </ul>

          <div className="auth-stats">
            {stats.map((s) => (
              <div key={s.label} className="auth-stat">
                <strong>{s.value}</strong>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </aside>

        <section className="auth-form-panel">
          <div className="auth-form-body">
            <div className="auth-form-inner">{children}</div>
          </div>
          {footerLeft ? <div className="auth-form-footer">{footerLeft}</div> : null}
        </section>
      </div>
    </div>
  );
}

export { Text };
