// Pixel2Code backend entry point. The code lives in src/ (routes -> services -> providers / db).
const { createApp } = require('./src/app');

const { app, cfg, log } = createApp();
app.listen(cfg.port, '0.0.0.0', () => log.info('Pixel2Code server started', { port: cfg.port, provider: cfg.provider, model: cfg.model, aiKey: Boolean(cfg.key), db: cfg.dbPath }));
