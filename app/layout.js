export const metadata = {
  title: "A1 Massage System",
  description: "Massage management system",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
