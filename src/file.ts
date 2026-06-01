import { mkdir, readFile, stat, unlink, writeFile } from 'fs/promises';

export class DataFile {
    constructor(
        public project: string,
        public id: string
    ) {}

    buildPath() {
        return `data/${this.project}/${this.id}`;
    }

    async mkdirPath() {
        await mkdir(`data/${this.project}`, { recursive: true });
    }

    async checkExists() {
        return stat(this.buildPath())
            .then(() => true)
            .catch(() => false);
    }

    async read() {
        return await readFile(this.buildPath());
    }

    async write(data: Buffer<ArrayBufferLike>) {
        await this.mkdirPath();
        return await writeFile(this.buildPath(), data);
    }

    async delete() {
        return await unlink(this.buildPath());
    }
}
