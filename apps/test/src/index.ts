import { setGlobalOptions } from "firebase-functions/v2"
import { onRequest } from "firebase-functions/v2/https"
import { logger } from "@mymonorepo/logger"

setGlobalOptions({ maxInstances: 10 })

export const helloWorld = onRequest((request, response) => {
    logger.info("hello world", {
        structuredData: true,
        target: "Moriarty",
        evidence_count: 5
    })
    response.json({
        status: "ok",
        message: "Hello from Monorepo! Check your terminal for Pino logs.",
        timestamp: new Date().toISOString()
    })
})