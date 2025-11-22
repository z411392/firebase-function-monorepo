import pino from 'pino'

const pinoInstance = pino({
    level: 'info',
    base: { service: 'monorepo' },
    formatters: {
        level: (label) => {
            return { severity: label.toUpperCase() };
        },
    },
})

export const logger = {
    info: (msg: string, data?: object) => pinoInstance.info(data, msg),
    warn: (msg: string, data?: object) => pinoInstance.warn(data, msg),
    error: (msg: string, err?: any) => pinoInstance.error({ err }, msg),
}