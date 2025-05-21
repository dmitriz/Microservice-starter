// functions.js
/**
 * Function processor that handles input parameters and returns results via callbacks
 * @param {Object} params - Input parameters from the request
 * @returns {Function} - Callback handler function
 */
module.exports = (params) => (onSuccess, onError) => {
  try {
    // Ensure error handler is a function before using it
    const safeErrorHandler = typeof onError === 'function' ? onError : (err) => {
      console.error('Error handler not provided:', err);
      throw new Error(err.error || 'Internal error');
    };

    // Validate required parameters - check if null, undefined, or empty object
    if (!params || (typeof params === 'object' && Object.keys(params).length === 0)) {
      return safeErrorHandler({
        error: 'Missing or empty parameters',
        status: 400
      });
    }

    // Verify the success callback is a function
    if (typeof onSuccess !== 'function') {
      return safeErrorHandler({
        error: 'Invalid success callback',
        status: 500
      });
    }
    
    // Process the parameters
    const result = processParams(params);
    
    // Return the result through the success callback
    return onSuccess(result);
  } catch (error) {
    // Handle any errors and pass them to the error callback
    console.error('Error processing request:', error);
    return (typeof onError === 'function' ? onError : console.error)({
      error: error.message || 'Internal server error',
      status: 500
    });
  }
};

/**
 * Process the input parameters and return a result
 * @param {Object} params - Input parameters to process
 * @returns {Object} - Processed result
 */
function processParams(params) {
  // Example implementation - replace with your actual business logic
  const result = {
    processed: true,
    timestamp: new Date().toISOString(),
    params: { ...params }, // Include the original params in the result
    message: 'Request processed successfully'
  };
  
  // Convert string parameters to numbers if needed (common with HTTP requests)
  let numA, numB;
  if (params.a !== undefined) {
    numA = Number(params.a);
  }
  if (params.b !== undefined) {
    numB = Number(params.b);
  }
  
  // Add any custom logic here based on specific parameters
  if (params.operation === 'add' && !isNaN(numA) && !isNaN(numB)) {
    result.result = numA + numB;
  } else if (params.operation === 'multiply' && !isNaN(numA) && !isNaN(numB)) {
    result.result = numA * numB;
  } else if (params.name) {
    result.greeting = `Hello, ${params.name}!`;
  } else if (params.operation) {
    // Handle unsupported or invalid operations
    result.error = `Unsupported operation: ${params.operation}`;
    result.validOperations = ['add', 'multiply'];
    result.success = false;
    result.message = 'Operation failed';
  }
  
  return result;
}
