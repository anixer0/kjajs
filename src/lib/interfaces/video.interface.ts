import type { IVideo } from "@consumet/extensions";
import type Artplayer from "artplayer";

export interface IVideoQuality {
	default: boolean;
	html: string;
	url: string;
}
export interface IVideoSubtitle {
	url: string;
	type: string;
	style: {
		color: string;
	};
	encoding: "utf-8";
}
export interface IVideoThumb {
	url: string;
	number: number;
	column: number;
}
export interface ICustomType {
	m3u8: (video: HTMLVideoElement, url: string, art: Artplayer) => void;
}
export interface IVideoOpts {
	container: string;
	url: string;
	customType: ICustomType;
	title?: string;
	poster?: string;
	volume?: number;
	isLive?: boolean;
	muted?: boolean;
	autoplay?: boolean;
	autoOrientation?: boolean;
	pip?: boolean;
	autoSize?: boolean;
	autoMini?: boolean;
	screenshot?: boolean;
	setting?: boolean;
	loop?: boolean;
	flip?: boolean;
	playbackRate?: boolean;
	aspectRatio?: boolean;
	fullscreen?: boolean;
	fullscreenWeb?: boolean;
	subtitleOffset?: boolean;
	miniProgressBar?: boolean;
	mutex?: boolean;
	backdrop?: boolean;
	playsInline?: boolean;
	autoPlayback?: boolean;
	airplay?: boolean;
	theme: "#F5316F";
	whitelist: string[];
	moreVideoAttr: {
		crossOrigin: "anonymous";
	};
	thumbnails: IVideoThumb;
	subtitle: IVideoSubtitle;
	quality: IVideoQuality[];
}

export interface IGenerateOpts {
	currentSource: IVideo | undefined;
	qualities: IVideoQuality[];
	currentSubs?: string | undefined;
	div?: HTMLDivElement;
}
