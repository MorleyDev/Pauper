declare function FS_Load(name: string, src: string, id: number): void;
declare function FS_LoadSync(name: string, src: string): string;

declare let FS_OnLoad: (id: number, content: string) => void;
