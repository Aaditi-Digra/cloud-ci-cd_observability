const express = require('express');
const client = require('prom-client');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Create a Registry for Prometheus metrics
const register = new client.Registry();
client.collectDefaultMetrics({ register });

// Custom metric: Counter for HTTP requests
const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status']
});
register.registerMetric(httpRequestCounter);

// Middleware to count requests
app.use((req, res, next) => {
  res.on('finish', () => {
    httpRequestCounter.labels(req.method, req.path, res.statusCode).inc();
  });
  next();
});

// Sample tasks data
let tasks = [
  { id: 1, title: 'Learn Docker', completed: true },
  { id: 2, title: 'Set up Jenkins Pipeline', completed: false },
  { id: 3, title: 'Deploy to Kubernetes', completed: false }
];

// Routes
app.get('/', (req, res) => {
  res.send({ message: 'Task Tracker API is running live!' });
});

app.get('/api/tasks', (req, res) => {
  res.json(tasks);
});

app.post('/api/tasks', (req, res) => {
  const newTask = {
    id: tasks.length + 1,
    title: req.body.title || 'New Task',
    completed: false
  };
  tasks.push(newTask);
  res.status(201).json(newTask);
});

// Health check endpoint (for Kubernetes Liveness/Readiness Probes)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date() });
});

// Prometheus metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});