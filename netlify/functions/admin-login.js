import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

function json(statusCode, body) {
	return {
		statusCode,
		headers: {
  "Content-Type": "application/json",
  "Cache-Control": "no-store",
},
		body: JSON.stringify(body),
	};
}

export const handler = async (event) => {
	try {
		if (event.httpMethod !== "POST") {
			return json(405, { ok: false, error: "Method Not Allowed" });
		}

		const { username, password } = JSON.parse(event.body || "{}");

		const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "";
		const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || "";
		const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || "";

		if (!ADMIN_USERNAME || !ADMIN_PASSWORD_HASH || !ADMIN_JWT_SECRET) {
			return json(500, { ok: false, error: "Admin auth not configured" });
		}

		if (!username || !password) {
			return json(400, { ok: false, error: "Missing credentials" });
		}

		if (String(username).trim() !== ADMIN_USERNAME) {
			return json(401, { ok: false, error: "Invalid credentials" });
		}

		const ok = await bcrypt.compare(String(password), ADMIN_PASSWORD_HASH);
		if (!ok) {
			return json(401, { ok: false, error: "Invalid credentials" });
		}

		const token = jwt.sign(
			{ sub: ADMIN_USERNAME, role: "admin" },
			ADMIN_JWT_SECRET,
			{ expiresIn: "12h" },
		);

		return json(200, { ok: true, token });
	} catch (err) {
		console.error("admin-login error:", err);
		return json(500, { ok: false, error: "Server error" });
	}
};
