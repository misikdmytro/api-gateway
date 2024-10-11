const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
const { SimpleSpanProcessor } = require('@opentelemetry/sdk-trace-base');
const {
    OTLPTraceExporter,
} = require('@opentelemetry/exporter-trace-otlp-grpc');
const { registerInstrumentations } = require('@opentelemetry/instrumentation');
const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http');
const {
    ExpressInstrumentation,
} = require('@opentelemetry/instrumentation-express');
const { Resource } = require('@opentelemetry/resources');
const { ATTR_SERVICE_NAME } = require('@opentelemetry/semantic-conventions');

// Set up the Jaeger exporter
const jaegerExporter = new OTLPTraceExporter({
    url: process.env.JAEGER_URL || 'http://localhost:4317', // Change if your Jaeger instance is different
});

// Create a tracer provider
const provider = new NodeTracerProvider({
    resource: new Resource({
        [ATTR_SERVICE_NAME]: 'auth-service',
    }),
});

// Set up span processor to send spans to Jaeger
provider.addSpanProcessor(new SimpleSpanProcessor(jaegerExporter));

// Register instrumentations for HTTP and Express
registerInstrumentations({
    tracerProvider: provider,
    instrumentations: [new HttpInstrumentation(), new ExpressInstrumentation()],
});

// Initialize the provider
provider.register();

console.log('Tracing initialized');
