import "./admin.css";

export const metadata = {
  title: "Administration",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }) {
  return <div className="dark admin-root">{children}</div>;
}
