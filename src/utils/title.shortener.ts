const joinTitle = (splitted: string[], count: number) => {
	const titles: string[] = [];
	const lastLimit = splitted.length - count;

	for (let i = 0; i < splitted.length; i++) {
		const word = splitted[i];
		if (i + 1 <= count) {
			titles.push(word);
			continue;
		}
		if (i === lastLimit) titles.push("....");
		if (i + 1 >= lastLimit) {
			titles.push(word);
			continue;
		}
	}

	return titles.join(" ");
};

export function titleShorten(title: string) {
	const splitted = [];
	let word = "";

	for (let i = 0; i < title.length; i++) {
		const char = title[i];

		if (i === title.length - 1) {
			word += char;
			splitted.push(word);
		}

		if (char === " ") {
			if (word.length) splitted.push(word);

			word = "";
			continue;
		}

		word += char;
	}
	if (splitted.length <= 4) return title;
	if (splitted.length >= 8) return joinTitle(splitted, 5);
	return joinTitle(splitted, 4);
}
