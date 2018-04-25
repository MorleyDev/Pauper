export function shallowCompare(lhs: any | null, rhs: any| null): boolean {
	if (lhs == rhs) {
		return true;
	}
	for (const key in lhs) {
		if (!(key in rhs)) return false;
	}
	for (const key in rhs) {
		const lv = lhs[key];
		const rv = rhs[key];
		if (lv !== rv) {
			return false;
		}
	}
	return true;
}
