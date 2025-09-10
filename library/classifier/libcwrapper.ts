import koffi from 'koffi';

declare module 'koffi' {
    /**
     * Zero-copy view into native memory. Introduced in 2.11, but not in the type hints yet.
     * @param ptr    Pointer returned by mmap / malloc / etc.
     * @param length Number of bytes to expose
     * @returns      A Node-style ArrayBuffer backed by that memory
     */
    export function view(ptr: unknown, length: number): ArrayBuffer;
}

export const O_CREAT = 0x0200;
export const O_RDWR = 0x0002;
export const PROT_READ = 0x1;
export const PROT_WRITE = 0x2;
export const MAP_SHARED = 0x01;

export class LibcWrapper {
    private _shm_open: koffi.KoffiFunction;
    private _ftruncate: koffi.KoffiFunction;
    private _close: koffi.KoffiFunction;
    private _mmap: koffi.KoffiFunction;

    constructor(libc: koffi.IKoffiLib) {
        this._shm_open = libc.func('int shm_open(const char* name, int oflag, int mode)');
        this._ftruncate = libc.func('int ftruncate(int fd, long length)');
        this._close = libc.func('int close(int fd)');
        this._mmap = libc.func('void* mmap(void* addr, size_t len, int prot, int flags, int fd, long off)');
    }

    shmOpen(name: string, flags: number, mode: number): number {
        return this._shm_open(name, flags, mode);
    }

    fTruncate(fd: number, length: number): number {
        return this._ftruncate(fd, length);
    }

    close(fd: number): number {
        return this._close(fd);
    }

    mmapToArrayBuffer(fd: number, size: number) {
        // mmap returns a Buffer *whose internal pointer* is the mapped region
        // eslint-disable-next-line no-bitwise
        const ptrBuf = this._mmap(null, size, PROT_READ | PROT_WRITE, MAP_SHARED, fd, 0);
        return koffi.view(ptrBuf, size);
    }
}
