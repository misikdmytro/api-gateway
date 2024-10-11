const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node')
const { SimpleSpanProcessor } = require('@opentelemetry/sdk-trace-base')
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-grpc')
const { registerInstrumentations } = require('@opentelemetry/instrumentation')
const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http')
const {
    ExpressInstrumentation,
} = require('@opentelemetry/instrumentation-express')
const {
    RedisInstrumentation,
} = require('@opentelemetry/instrumentation-redis-4')
const { Resource } = require('@opentelemetry/resources')
const { ATTR_SERVICE_NAME } = require('@opentelemetry/semantic-conventions')

const logger = require('../logger')

// Set up the Jaeger exporter
const jaegerExporter = new OTLPTraceExporter({
    url: process.env.JAEGER_URL || 'http://localhost:4317', // Change if your Jaeger instance is different
})

// Create a tracer provider
const provider = new NodeTracerProvider({
    resource: new Resource({
        [ATTR_SERVICE_NAME]: 'api-gateway',
    }),
})

// Set up span processor to send spans to Jaeger
provider.addSpanProcessor(new SimpleSpanProcessor(jaegerExporter))

// Register instrumentations for HTTP and Express
registerInstrumentations({
    tracerProvider: provider,
    instrumentations: [
        new HttpInstrumentation(),
        new ExpressInstrumentation(),
        new RedisInstrumentation(),
    ],
})

// Initialize the provider
provider.register()

logger.info('Tracing initialized')
