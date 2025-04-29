class CircuitBreaker {
    constructor({ name, timeout, errorThresholdPercentage, resetTimeout }) {
      this.state = 'CLOSED';
      this.failureCount = 0;
      this.successCount = 0;
      this.nextAttempt = Date.now();
      this.name = name;
      this.timeout = timeout;
      this.errorThresholdPercentage = errorThresholdPercentage;
      this.resetTimeout = resetTimeout;
    }
  
    async call(serviceFn) {
      if (this.state === 'OPEN') {
        if (this.nextAttempt <= Date.now()) {
          this.state = 'HALF-OPEN';
        } else {
          throw new Error('Service unavailable (circuit breaker open)');
        }
      }
  
      try {
        const response = await Promise.race([
          serviceFn(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Service timeout')), this.timeout))
        ]);
        
        this.success();
        return response;
      } catch (err) {
        this.failure();
        throw err;
      }
    }
  
    success() {
      this.successCount++;
      if (this.state === 'HALF-OPEN') {
        this.reset();
      }
    }
  
    failure() {
      this.failureCount++;
      const total = this.successCount + this.failureCount;
      const errorPercentage = (this.failureCount / total) * 100;
      
      if (errorPercentage > this.errorThresholdPercentage) {
        this.trip();
      }
    }
  
    trip() {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.resetTimeout;
    }
  
    reset() {
      this.state = 'CLOSED';
      this.failureCount = 0;
      this.successCount = 0;
    }
  }
  
  module.exports = CircuitBreaker;