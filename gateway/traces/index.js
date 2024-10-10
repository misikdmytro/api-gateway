const { NodeSDK } = require('@opentelemetry/sdk-node')
const {
    getNodeAutoInstrumentations,
} = require('@opentelemetry/auto-instrumentations-node')
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http')

const sdk = new NodeSDK({
    traceExporter: new OTLPTraceExporter({
        url: process.env.TEMPO_URL || 'http://localhost:14268/api/traces',
    }),
    instrumentations: [getNodeAutoInstrumentations()],
})

sdk.start()
