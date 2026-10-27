import { spawn } from 'child_process';

export type SpawnHelperType = (
    command: string,
    args: string[],
    opts?: { ignoreErrors: boolean, cwd?: string, timeoutMs?: number }) => Promise<string>;

export function spawnHelper(command: string, args: string[],
                            opts: { ignoreErrors: boolean, cwd?: string, timeoutMs?: number } = { ignoreErrors: false }) {
    return new Promise<string>((resolve, reject) => {
        const p = spawn(command, args, { env: process.env, cwd: opts.cwd });

        let allData: Buffer[] = [];
        let timedOut = false;
        let closed = false;
        let timeout: NodeJS.Timeout | undefined;
        let killTimeout: NodeJS.Timeout | undefined;

        const clearTimeouts = () => {
            if (timeout) {
                clearTimeout(timeout);
            }
            if (killTimeout) {
                clearTimeout(killTimeout);
            }
        };

        p.stdout.on('data', (data: Buffer) => {
            allData.push(data);
        });

        p.stderr.on('data', (data: Buffer) => {
            allData.push(data);
        });

        p.on('error', (error) => {
            clearTimeouts();
            reject(error);
        });

        p.on('close', (code) => {
            closed = true;
            clearTimeouts();

            if (code === 0 || opts.ignoreErrors === true || timedOut) {
                resolve(Buffer.concat(allData).toString('utf-8'));
            }
            else {
                reject('Error code was not 0: ' + Buffer.concat(allData).toString('utf-8'));
            }
        });

        if (opts.timeoutMs !== undefined) {
            timeout = setTimeout(() => {
                timedOut = true;
                p.kill('SIGINT');

                // gst-device-monitor should exit after SIGINT, but make sure
                // a broken monitor cannot block startup forever.
                killTimeout = setTimeout(() => {
                    if (!closed) {
                        p.kill('SIGKILL');
                    }
                }, 1000);
            }, opts.timeoutMs);
        }
    });
}
