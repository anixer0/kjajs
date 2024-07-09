import Hls from "hls.js";
import type { IGenerateOpts } from "../lib/interfaces/video.interface";
import type Option from "artplayer/types/option";

export const generateOpts = ({
	currentSource,
	qualities,
	currentSubs,
	div
}: IGenerateOpts): Option => {
	const opts = {
		container: div ?? ".artplayer-app",
		url: currentSource?.url,
		customType: {
			m3u8: function (this, video, url, art) {
				if (Hls.isSupported()) {
					if (this.hls) this.hls.destroy();
					const hls = new Hls();
					hls.loadSource(url);
					hls.attachMedia(video);
					this.hls = hls;
					this.on("destroy", () => hls.destroy());
				} else if (video.canPlayType("application/vnd.apple.mpegurl")) {
					video.src = url;
				} else {
					art.notice.show = "Unsupported playback format";
				}
			}
		},
		title: "",
		poster: "",
		volume: 1,
		isLive: false,
		muted: false,
		autoplay: false,
		autoOrientation: true,
		pip: true,
		autoSize: false,
		autoMini: false,
		screenshot: true,
		setting: true,
		loop: false,
		flip: true,
		playbackRate: true,
		aspectRatio: true,
		fullscreen: true,
		fullscreenWeb: false,
		subtitleOffset: false,
		miniProgressBar: false,
		mutex: true,
		backdrop: true,
		playsInline: true,
		autoPlayback: true,
		airplay: true,
		theme: "#77CF6D",
		whitelist: ["*"],
		moreVideoAttr: {
			crossOrigin: "anonymous"
		},
		thumbnails: {
			url: "",
			number: 60,
			column: 10
		},
		quality: qualities
	} as Option;

	if (currentSubs) {
		opts.subtitle = {
			url: currentSubs,
			type: "vtt",
			style: {
				color: "#fff"
			},
			encoding: "utf-8"
		};
	}
	return opts;
};
