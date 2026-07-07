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
