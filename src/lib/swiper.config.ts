import {
	Pagination,
	Parallax,
	Navigation,
	Mousewheel,
	Keyboard,
	EffectCoverflow
} from "swiper/modules";
import type { SwiperOptions } from "swiper/types";

export const swiperClass = {
	MOVIES: "horSwiperMov",
	POPULAR: "horSwiperPop",
	RECENT: "horSwiperRec",
	TOP: "horSwiperTop",
	GENRE: "horSwiperGen",
	SEARCH: "searchSwiperHor"
};

export const HORIZONTAL_CONFIG: SwiperOptions = {
	direction: "horizontal",
	spaceBetween: 10,
	slidesPerView: "auto",
	breakpoints: {
		base: {
			slidesPerView: 1
		},
		524: {
			slidesPerView: 2
		},
		800: {
			slidesPerView: 3
		},
		1000: {
			slidesPerView: 4
		},
		1200: {
			slidesPerView: 5
		}
	},
	mousewheel: { forceToAxis: true, enabled: true },
	keyboard: true,
	modules: [Navigation, Mousewheel, Keyboard, Parallax],

	navigation: {
		nextEl: ".swiper-button-next-hor",
		prevEl: ".swiper-button-prev-hor",
		enabled: true
	},
	parallax: true
};

export const VERTICAL_CONFIG: SwiperOptions = {
	direction: "vertical",
	slidesPerView: 1,
	mousewheel: { forceToAxis: true, enabled: true },
	keyboard: true,
	effect: "coverflow",
	modules: [Pagination, Parallax, Navigation, Mousewheel, Keyboard, EffectCoverflow],
	pagination: {
		el: ".swiper-pagination-vertical",
		clickable: true,
		type: "progressbar"
	},
	navigation: {
		nextEl: ".swiper-button-next-ver",
		prevEl: ".swiper-button-prev-ver"
	},
	parallax: true
};
