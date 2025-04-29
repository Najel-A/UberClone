const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf, colorize, errors, json } = format;
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

// Custom format for console output
const consoleFormat = printf(({ level, message, timestamp, stack }) => {
  let log = `${timestamp} [${level}]: ${message}`;
  if (stack) {
    log += `\n${stack}`;
  }
  return log;
});

// Custom format for file output
const fileFormat = printf(({ level, message, timestamp, stack, ...metadata }) => {
  let log = {
    timestamp,
    level,
    message,
    ...metadata
  };
  
  if (stack) {
    log.stack = stack;
  }
  
  return JSON.stringify(log);
});

// Create the logger instance
const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  defaultMeta: { service: 'ride-service' },
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }), // Proper error stack traces
  ),
  transports: [
    // Console transport (colorized)
    new transports.Console({
      format: combine(
        colorize(),
        consoleFormat
      ),
      handleExceptions: true
    }),
    
    // Daily rotating file transport for errors
    new DailyRotateFile({
      level: 'error',
      filename: path.join(__dirname, '../logs/error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d',
      format: fileFormat
    }),
    
    // Daily rotating file transport for all logs
    new DailyRotateFile({
      filename: path.join(__dirname, '../logs/combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d',
      format: fileFormat
    })
  ],
  exceptionHandlers: [
    new transports.File({ 
      filename: path.join(__dirname, '../logs/exceptions.log'),
      format: fileFormat
    })
  ]
});

// Add Morgan-like HTTP request logging for Express
logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  }
};

// Custom logging methods for specific scenarios
logger.rideEvent = (rideId, eventType, additionalData = {}) => {
  logger.info(`Ride event: ${eventType}`, { 
    rideId, 
    eventType, 
    ...additionalData 
  });
};

logger.driverLocation = (driverId, location) => {
  logger.debug(`Driver location update`, { 
    driverId, 
    latitude: location.latitude, 
    longitude: location.longitude 
  });
};

logger.kafkaEvent = (topic, eventType, key) => {
  logger.debug(`Kafka event: ${topic}/${eventType}`, { 
    topic, 
    eventType, 
    key 
  });
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

module.exports = logger;