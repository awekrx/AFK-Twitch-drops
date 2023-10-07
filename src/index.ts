import { config } from './configs';
import { Logger, WatcherMaster } from './modules';

const logger = new Logger();
if (config.tokens.length == 0) {
  logger.error('Before starting, you must add at least one token');
  process.exit(1);
}

process.setMaxListeners(0);
new WatcherMaster(config.tokens);
