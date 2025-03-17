export const isEmpty = (data: any): boolean => {
	const emptyDataIdentifiers: any[] = [null, 0, "", undefined, "undefined", false, "0"];

	if (emptyDataIdentifiers.includes(typeof data)) {
		return true;
	}
	if (emptyDataIdentifiers.includes(data)) {
		return true;
	}
	if (typeof data === "object" && data !== null) {
		return Object.keys(data).length === 0;
	}
	return false;
};
