// functions.js
/**
 * Function processor that handles input parameters and returns results via callbacks
 * @param {Object} params - Input parameters from the request
 * @returns {Function} - Callback handler function
 */
module.exports = (params) => (onSuccess, onError) => {
  try {
    // Validate required parameters
    if (!params) {
      return onError({
        error: 'Missing parameters',
        status: 400
      });
    }
    
    // Process the parameters
    const result = processParams(params);
    
    // Return the result through the success callback
    return onSuccess(result);
  } catch (error) {
    // Handle any errors and pass them to the error callback
    console.error('Error processing request:', error);
    return onError({
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
  
  // Add any custom logic here based on specific parameters
  if (params.operation === 'add' && typeof params.a === 'number' && typeof params.b === 'number') {
    result.result = params.a + params.b;
  } else if (params.operation === 'multiply' && typeof params.a === 'number' && typeof params.b === 'number') {
    result.result = params.a * params.b;
  } else if (params.name) {
    result.greeting = `Hello, ${params.name}!`;
  }
  
  return result;
}
