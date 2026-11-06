import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import styles from "./PhotoViewer.module.css";

const SWIPE_THRESHOLD = 48;

export default function PhotoViewer({
	title,
	photos,
	index,
	onClose,
	onIndexChange,
}) {
	const titleId = useId();
	const dialogRef = useRef(null);
	const closeRef = useRef(null);
	const indexRef = useRef(index);
	const photosRef = useRef(photos);
	const onCloseRef = useRef(onClose);
	const onIndexChangeRef = useRef(onIndexChange);
	const touchStart = useRef(null);

	indexRef.current = index;
	photosRef.current = photos;
	onCloseRef.current = onClose;
	onIndexChangeRef.current = onIndexChange;

	const count = photos.length;
	const safeIndex = ((index % count) + count) % count;
	const photo = photos[safeIndex];

	function step(delta) {
		const total = photosRef.current.length;
		if (total < 1) return;
		const current = indexRef.current;
		onIndexChangeRef.current((current + delta + total) % total);
	}

	useEffect(() => {
		const opener = document.activeElement;
		const { body } = document;
		const root = document.documentElement;
		const previousBodyOverflow = body.style.overflow;
		const previousRootOverflow = root.style.overflow;
		const previousBodyPadding = body.style.paddingRight;
		const scrollbar = window.innerWidth - root.clientWidth;

		body.style.overflow = "hidden";
		root.style.overflow = "hidden";
		if (scrollbar > 0) {
			body.style.paddingRight = `${scrollbar}px`;
		}

		closeRef.current?.focus();

		function focusable() {
			const dialog = dialogRef.current;
			if (!dialog) return [];
			return [...dialog.querySelectorAll("button")].filter(
				(el) => !el.disabled,
			);
		}

		function onKeyDown(event) {
			if (event.key === "Escape") {
				event.preventDefault();
				onCloseRef.current();
				return;
			}

			if (event.key === "ArrowLeft") {
				event.preventDefault();
				step(-1);
				return;
			}

			if (event.key === "ArrowRight") {
				event.preventDefault();
				step(1);
				return;
			}

			if (event.key !== "Tab") return;

			const items = focusable();
			if (items.length === 0) {
				event.preventDefault();
				return;
			}

			const first = items[0];
			const last = items[items.length - 1];
			const active = document.activeElement;
			const inside = dialogRef.current?.contains(active);

			if (event.shiftKey) {
				if (!inside || active === first) {
					event.preventDefault();
					last.focus();
				}
			} else if (!inside || active === last) {
				event.preventDefault();
				first.focus();
			}
		}

		function blockTouchScroll(event) {
			event.preventDefault();
		}

		document.addEventListener("keydown", onKeyDown);
		dialogRef.current?.addEventListener("touchmove", blockTouchScroll, {
			passive: false,
		});

		return () => {
			document.removeEventListener("keydown", onKeyDown);
			dialogRef.current?.removeEventListener(
				"touchmove",
				blockTouchScroll,
			);
			body.style.overflow = previousBodyOverflow;
			root.style.overflow = previousRootOverflow;
			body.style.paddingRight = previousBodyPadding;
			if (opener instanceof HTMLElement) opener.focus();
		};
	}, []);

	function onBackdropClick(event) {
		if (event.target === event.currentTarget) onClose();
	}

	function onTouchStart(event) {
		const touch = event.changedTouches[0];
		if (!touch) return;
		touchStart.current = { x: touch.clientX, y: touch.clientY };
	}

	function onTouchEnd(event) {
		const start = touchStart.current;
		touchStart.current = null;
		const touch = event.changedTouches[0];
		if (!start || !touch) return;

		const dx = touch.clientX - start.x;
		const dy = touch.clientY - start.y;
		if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) < Math.abs(dy)) {
			return;
		}

		step(dx < 0 ? 1 : -1);
	}

	if (!photo) return null;

	return createPortal(
		<div
			ref={dialogRef}
			className={styles.backdrop}
			role="dialog"
			aria-modal="true"
			aria-labelledby={titleId}
			onClick={onBackdropClick}>
			<button
				ref={closeRef}
				type="button"
				className={styles.close}
				onClick={onClose}
				aria-label="Close photo viewer">
				×
			</button>

			<button
				type="button"
				className={`${styles.nav} ${styles.prev}`}
				onClick={() => step(-1)}
				aria-label="Previous photo">
				‹
			</button>

			<button
				type="button"
				className={`${styles.nav} ${styles.next}`}
				onClick={() => step(1)}
				aria-label="Next photo">
				›
			</button>

			<figure
				className={styles.stage}
				onTouchStart={onTouchStart}
				onTouchEnd={onTouchEnd}>
				<img
					src={photo.src}
					alt={`${title} — ${photo.label}`}
					className={styles.image}
				/>
				<figcaption className={styles.caption}>
					<h2 id={titleId} className={styles.title}>
						{title}
					</h2>
					<p className={styles.label}>{photo.label}</p>
					<p className={styles.count} aria-live="polite">
						{safeIndex + 1} of {count}
					</p>
				</figcaption>
			</figure>
		</div>,
		document.body,
	);
}
