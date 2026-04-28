import Link from "next/link";

export default function GlobalNotFound() {
  return (
    <html>
      <body
        style={{
          fontFamily: "system-ui",
          padding: "60px",
          textAlign: "center",
          background: "#f7f7f5",
        }}
      >
        <h1 style={{ fontSize: 56, color: "#1d6f3c", margin: 0 }}>404</h1>
        <p style={{ color: "#555", marginTop: 8 }}>Page not found</p>
        <p style={{ marginTop: 24 }}>
          <Link href="/en" style={{ color: "#1d6f3c" }}>
            Go to homepage
          </Link>
        </p>
      </body>
    </html>
  );
}
