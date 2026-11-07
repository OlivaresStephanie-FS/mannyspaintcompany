const ICONS = {
	interior: (
		<>
			<path d="M3 10.5 12 4l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" />
			<path d="M9 21V12h6v9" />
		</>
	),
	exterior: (
		<>
			<path d="M3 21h18" />
			<path d="M6 21V7l6-4 6 4v14" />
			<path d="M10 11h4" />
			<path d="M10 15h4" />
		</>
	),
	repair: (
		<>
			<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 0 0 5.4-5.4l-2.1 2.1-3.3-3.3z" />
		</>
	),
	trim: (
		<>
			<path d="M13 4h3a2 2 0 0 1 2 2v14" />
			<path d="M2 20h3" />
			<path d="M13 20h9" />
			<path d="M10 4v16" />
			<path d="M6 12h4" />
		</>
	),
	cabinet: (
		<>
			<rect x="3" y="3" width="18" height="18" rx="2" />
			<path d="M3 9h18" />
			<path d="M3 15h18" />
			<path d="M12 9v12" />
		</>
	),
	turnover: (
		<>
			<circle cx="8" cy="15" r="4" />
			<path d="m10.85 12.15 8.55-8.55" />
			<path d="M18 6l2 2" />
			<path d="M20 8l2 2" />
		</>
	),
	flooring: (
		<>
			<path d="M3 7h18" />
			<path d="M3 12h18" />
			<path d="M3 17h18" />
			<path d="M8 7v5" />
			<path d="M15 12v5" />
		</>
	),
	cleaning: (
		<>
			<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3z" />
			<path d="M5 3v4" />
			<path d="M3 5h4" />
			<path d="M19 17v4" />
			<path d="M17 19h4" />
		</>
	),
	deepCleaning: (
		<>
			<path d="M10 7V4h4v3" />
			<path d="M8 7h8l-1 14H9z" />
			<path d="M5 4h.01" />
			<path d="M4 7h.01" />
			<path d="M6 5h.01" />
			<path d="M3 9h.01" />
		</>
	),
};

export default function ServiceIcon({ name, className }) {
	const paths = ICONS[name];
	if (!paths) return null;

	return (
		<svg
			className={className}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true">
			{paths}
		</svg>
	);
}
