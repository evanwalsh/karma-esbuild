export function newCache<T extends { time: number }>() {
	const cache = new Map<string, T>();
	const pending = new Map<
		string,
		{ reject: (err?: Error) => void; resolve: (item: T) => void }[]
	>();
	const lastUsed = new Map<string, number>();

	async function set(key: string, item: T) {
		cache.set(key, item);

		const waitingFns = pending.get(key);
		pending.set(key, []);
		lastUsed.set(key, item.time);

		if (waitingFns) {
			await Promise.all(waitingFns.map(fn => fn.resolve(item)));
		}
	}

	async function get(key: string): Promise<T> {
		let result = cache.get(key);
		const last = lastUsed.get(key) || 0;
		if (result && result.time >= last) {
			lastUsed.set(key, result.time);
			return result;
		}

		return new Promise((resolve, reject) => {
			let fns = pending.get(key) || [];
			fns.push({ resolve, reject });
			pending.set(key, fns);
		});
	}

	function has(key: string) {
		return cache.has(key) || pending.has(key);
	}

	function clear() {
		cache.clear();
		lastUsed.clear();
		Array.from(pending.values()).forEach(item => {
			item.forEach(p => p.reject());
		});
		pending.clear();
	}

	return {
		set,
		get,
		has,
		clear,
	};
}
