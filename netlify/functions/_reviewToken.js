import crypto from "crypto";

export function makeReviewToken() {
	return crypto.randomBytes(32).toString("hex");
}

export function hashToken(rawToken, secret) {
	return crypto.createHmac("sha256", secret).update(rawToken).digest("hex");
}