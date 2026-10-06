import express from 'express';

// Only the API foundation is prepared. Database work comes in phase 3.
const app = express();
const port = Number(process.env.PORT || 5001);

app.disable('x-powered-by');
app.use(express.json());

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok', service: 'claw-backend' });
});

app.listen(port, '127.0.0.1', () => {
  console.log(`CLAW backend: http://localhost:${port}`);
});
