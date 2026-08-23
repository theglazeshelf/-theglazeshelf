export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f7f3ea",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ textAlign: "center", padding: "40px" }}>
        <h1
          style={{
            fontSize: "42px",
            color: "#17364d",
            marginBottom: "12px",
          }}
        >
          The Glaze Shelf
        </h1>

        <p
          style={{
            fontSize: "18px",
            color: "#555",
          }}
        >
          Know what you have. Discover what works.
        </p>
      </div>
    </main>
  );
}
