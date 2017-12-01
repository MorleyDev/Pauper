const fileLoadingRequests: { [id: number]: ((contents?: string) => void) | undefined } = {};

let nextId = 0;
const getId = () => nextId++;

FS_OnLoad = (id: number, content: string) => {
	const req = fileLoadingRequests[id];
	if (req != null) {
		fileLoadingRequests[id] = undefined;
		return req(content);
	}
};

export const fs = {
	load: (name: string, src: string): Promise<string> => new Promise<string>((resolve, reject) => {
		const id = getId();
		fileLoadingRequests[id] = (contents) => contents != null
			? resolve(contents)
			: reject(new Error(`File ${name} (${src}) not found`));
		FS_Load(name, src, id);
	}),
	loadSync: (name: string, src: string): string => FS_LoadSync(name, src)
};
