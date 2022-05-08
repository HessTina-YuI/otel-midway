import { Span } from '@opentelemetry/api';

const tracer = require('./tracing')();

const startSpan = (spanName: string): Span => {
  return tracer.startSpan(spanName);
};

export { startSpan };
