/**
 * Shared gallery project data.
 */
import pennAfter from "../assets/projects/14PennPlaza/web/14PennPlaza-After3.jpg";
import pennBefore from "../assets/projects/14PennPlaza/web/14PennPlaza-Before.jpg";
import pennDuring from "../assets/projects/14PennPlaza/web/14PennPlaza-During.jpg";
import pennDetail from "../assets/projects/14PennPlaza/web/14PennPlaza-After2.jpg";
import conollyAfter from "../assets/projects/ConollyDorms/web/ConollyDorms-After3.jpg";
import conollyBefore from "../assets/projects/ConollyDorms/web/ConollyDorms-Before.jpg";
import conollyDuring from "../assets/projects/ConollyDorms/web/ConollyDorms-During.jpg";
import conollyDetail from "../assets/projects/ConollyDorms/web/ConollyDorms-After2.jpg";
import parkAfter from "../assets/projects/445ParkAve/web/445ParkAve-After.jpg";
import parkBefore from "../assets/projects/445ParkAve/web/445ParkAve-Before.jpg";
import parkBefore2 from "../assets/projects/445ParkAve/web/445ParkAve-Before2.jpg";
import parkBefore3 from "../assets/projects/445ParkAve/web/445ParkAve-Before3.jpg";
import meadowsAfter from "../assets/projects/FrancisLewis/web/FrancisLewis-After2.jpg";
import meadowsBefore from "../assets/projects/FrancisLewis/web/FrancisLewis-Before.jpg";
import meadowsBefore2 from "../assets/projects/FrancisLewis/web/FrancisLewis-Before2.jpg";
import meadowsDuring from "../assets/projects/FrancisLewis/web/FrancisLewis-During.jpg";
import meadowsDuring2 from "../assets/projects/FrancisLewis/web/FrancisLewis-During2.jpg";
import meadowsDetail from "../assets/projects/FrancisLewis/web/FrancisLewis-After.jpg";
import bellAfter from "../assets/projects/BellBlvd2801/web/BellBlvd2801-after.jpg";
import bellAfter2 from "../assets/projects/BellBlvd2801/web/BellBlvd2801-after1.jpg";
import bellAfter3 from "../assets/projects/BellBlvd2801/web/BellBlvd2801-after2.jpg";
import bellBefore from "../assets/projects/BellBlvd2801/web/BellBlvd2801-before.jpg";
import bellBefore2 from "../assets/projects/BellBlvd2801/web/BellBlvd2801-before1.jpg";
import bellDuring from "../assets/projects/BellBlvd2801/web/BellBlvd2801-during.jpg";
import bellDuring2 from "../assets/projects/BellBlvd2801/web/BellBlvd2801-during2.jpg";
import aveAfter from "../assets/projects/315-70th-ave/web/315-70thAve-After9.jpg";
import aveAfter2 from "../assets/projects/315-70th-ave/web/315-70thAve-After11.jpg";
import aveAfter3 from "../assets/projects/315-70th-ave/web/315-70thAve-After10.jpg";
import aveAfter4 from "../assets/projects/315-70th-ave/web/315-70thAve-After12.jpg";
import aveBefore from "../assets/projects/315-70th-ave/web/315-70thAve-Before1.jpg";
import aveDuring from "../assets/projects/315-70th-ave/web/315-70thAve-During6.jpg";
import aveDuring2 from "../assets/projects/315-70th-ave/web/315-70thAve-During.jpg";

export const galleryProjects = [
	{
		title: "14 Penn Plaza — Commercial Exterior Painting",
		service: "Commercial Exterior Painting",
		location: "Manhattan, New York",
		description:
			"Exterior façade painting at 14 Penn Plaza in Manhattan, featuring a refreshed white finish across wall surfaces, window surrounds, and architectural details.",
		placeholder: false,
		beforeSrc: pennBefore,
		afterSrc: pennAfter,
		photos: [
			{ id: "after", label: "After", src: pennAfter },
			{ id: "before", label: "Before", src: pennBefore },
			{ id: "during", label: "During", src: pennDuring },
			{ id: "detail", label: "Detail", src: pennDetail },
		],
	},
	{
		title: "LIU Conolly Hall — Bathtub Regrouting & Reglazing",
		service: "Bathtub Regrouting & Reglazing",
		location: "Brooklyn, New York",
		description:
			"Bathtub regrouting and reglazing at Long Island University's Conolly Hall student dormitories, restoring worn surfaces and refreshing the bathtub with a clean, glossy white finish.",
		placeholder: false,
		beforeSrc: conollyBefore,
		afterSrc: conollyAfter,
		photos: [
			{ id: "after", label: "After", src: conollyAfter },
			{ id: "before", label: "Before", src: conollyBefore },
			{ id: "during", label: "During", src: conollyDuring },
			{ id: "detail", label: "Detail", src: conollyDetail },
		],
	},
	{
		title: "445 Park Avenue — Commercial Hallway Renovation",
		service: "Flooring Installation & Interior Painting",
		location: "Manhattan, New York",
		description:
			"Commercial hallway renovation at 445 Park Avenue in Manhattan, featuring new marble-look tile flooring, coordinating baseboards, and interior wall painting for a clean, polished finish.",
		placeholder: false,
		beforeSrc: parkBefore,
		afterSrc: parkAfter,
		photos: [
			{ id: "after", label: "After", src: parkAfter },
			{ id: "before", label: "Before", src: parkBefore },
			{ id: "before2", label: "Before 2", src: parkBefore2 },
			{ id: "before3", label: "Before 3", src: parkBefore3 },
		],
	},
	{
		title: "Fresh Meadows Center — Commercial Exterior Restoration",
		service: "Commercial Exterior Painting & Restoration",
		location: "Fresh Meadows, Queens, New York",
		description:
			"Exterior painting and restoration at Fresh Meadows Center on Francis Lewis Boulevard in Queens, refreshing both the smooth exterior walls and textured façade for a clean, consistent finish.",
		placeholder: false,
		beforeSrc: meadowsBefore,
		afterSrc: meadowsAfter,
		photos: [
			{ id: "after", label: "After", src: meadowsAfter },
			{ id: "before", label: "Before", src: meadowsBefore },
			{ id: "before2", label: "Before 2", src: meadowsBefore2 },
			{ id: "during", label: "During", src: meadowsDuring },
			{ id: "during2", label: "During 2", src: meadowsDuring2 },
			{ id: "detail", label: "Detail", src: meadowsDetail },
		],
	},
	{
		title: "Bell Boulevard — Wood Door Restoration & Refinishing",
		service: "Wood Restoration & Refinishing",
		location: "Bell Boulevard, Queens, New York",
		description:
			"Restoration and refinishing of a decorative wood entrance door and surrounding panels, transforming weathered surfaces into a rich, polished finish while preserving the original woodwork and decorative glass.",
		placeholder: false,
		beforeSrc: bellBefore,
		afterSrc: bellAfter,
		photos: [
			{ id: "after", label: "After", src: bellAfter },
			{ id: "after2", label: "After 2", src: bellAfter2 },
			{ id: "after3", label: "After 3", src: bellAfter3 },
			{ id: "before", label: "Before", src: bellBefore },
			{ id: "before2", label: "Before 2", src: bellBefore2 },
			{ id: "during", label: "During", src: bellDuring },
			{ id: "during2", label: "During 2", src: bellDuring2 },
		],
	},
	{
		title: "70th Avenue — Residential Interior Renovation & Finishing",
		service: "Interior Painting & Finishing",
		location: "70th Avenue, New York",
		description:
			"Interior renovation featuring professional painting, wall repairs, custom carpentry and shelving, trim finishing, and hardwood flooring.",
		placeholder: false,
		beforeSrc: aveBefore,
		afterSrc: aveAfter,
		photos: [
			{ id: "after", label: "After", src: aveAfter },
			{ id: "after2", label: "After 2", src: aveAfter2 },
			{ id: "after3", label: "After 3", src: aveAfter3 },
			{ id: "after4", label: "After 4", src: aveAfter4 },
			{ id: "before", label: "Before", src: aveBefore },
			{ id: "during", label: "During", src: aveDuring },
			{ id: "during2", label: "During 2", src: aveDuring2 },
		],
	},
];
