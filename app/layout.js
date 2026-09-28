import "./globals.css";

export const metadata = {
  title: "Predictive Analytics — Course Hub",
  description:
    "Course schedule, materials, labs, assessments, and semester roadmap for Predictive Analytics at Universitas Cakrawala.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
