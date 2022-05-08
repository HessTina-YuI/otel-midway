'use strict';

const fs = require('fs');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const opentelemetry = require('@opentelemetry/api');
const { registerInstrumentations } = require('@opentelemetry/instrumentation');
const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
const { Resource } = require('@opentelemetry/resources');
const {
  SemanticResourceAttributes,
} = require('@opentelemetry/semantic-conventions');
const {
  SimpleSpanProcessor,
  BatchSpanProcessor,
  ConsoleSpanExporter,
} = require('@opentelemetry/sdk-trace-base');
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');
const { ZipkinExporter } = require('@opentelemetry/exporter-zipkin');
const {
  CollectorTraceExporter,
} = require('@opentelemetry/exporter-collector-grpc');
const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http');
const { GrpcInstrumentation } = require('@opentelemetry/instrumentation-grpc');

const EXPORTER = process.env.EXPORTER || '';

const SERVER_NAME = process.env.SERVER_NAME || 'midway-server';

module.exports = () => {
  const provider = new NodeTracerProvider({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: SERVER_NAME,
    }),
  });

  let exporter;
  if (EXPORTER.toLowerCase().startsWith('j')) {
    exporter = new JaegerExporter();
  } else if (EXPORTER.toLowerCase().startsWith('z')) {
    exporter = new ZipkinExporter();
  } else {
    // use http protocol, send tracing to opentelemetry-collector
    exporter = new CollectorTraceExporter({
      headers: {
        'Content-Type': 'application/json',
      },
      url: 'grpc://localhost:4317/v1/traces',
    });
  }

  provider.addSpanProcessor(new SimpleSpanProcessor(exporter));
  // output to console
  provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));

  // Initialize the OpenTelemetry APIs to use the NodeTracerProvider bindings
  provider.register();
  ['SIGINT', 'SIGTERM'].forEach(signal => {
    process.on(signal, () => provider.shutdown().catch(console.error));
  });

  registerInstrumentations({
    // when boostraping with lerna for testing purposes
    instrumentations: [new HttpInstrumentation(), new GrpcInstrumentation()],
  });

  return opentelemetry.trace.getTracer(SERVER_NAME, packageJson.version);
};
