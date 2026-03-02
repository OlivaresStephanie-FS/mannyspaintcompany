const styles = {
	wrap: { borderTop: "1px solid #eee", padding: "24px", marginTop: 48 },
	inner: { maxWidth: 1100, margin: "0 auto", color: "#666", fontSize: 14 },
};

export default function Footer() {
	return (
		<footer style={styles.wrap}>
			<div style={styles.inner}>
				<div style={{ fontWeight: 700, color: "#111" }}>
					Manny's Painting Company
				</div>
				<div style={{ marginTop: 6 }}>
					Serving NYC / NJ • Licensed & Insured
				</div>
				<div style={{ marginTop: 12 }}>
					© {new Date().getFullYear()} Soli.NYC All
					rights reserved.
				</div>
			</div>
		</footer>
	);
}
