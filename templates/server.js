// server.js
const express = require('express');
const app = express();
const fn = require('./functions.js');

// Middleware to parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * Validates and sanitizes input parameters for supported operations.
 *
 * Checks the presence and validity of the `operation` parameter (must be 'add' or 'multiply'), ensures required numeric parameters `a` and `b` are provided and valid for math operations, and validates the optional `name` parameter as a non-empty string trimmed and limited to 50 characters.
 *
 * @param {object} query - The input parameters to validate, typically from a request.
 * @returns {{ validatedParams: object, errors: string[] }} An object containing sanitized parameters and an array of validation error messages, if any.
 */
function validateInput(query) {
  const validatedParams = {};
  const errors = [];

  // Validate operation parameter if present
  if (query.operation) {
    const validOperations = ['add', 'multiply'];
    if (!validOperations.includes(query.operation)) {
      errors.push(`Invalid operation: ${query.operation}. Valid operations are: ${validOperations.join(', ')}`);
    } else {
      validatedParams.operation = query.operation;
    }
    
    // If operation is math-related, validate numeric parameters
    if ((query.operation === 'add' || query.operation === 'multiply')) {
      // Validate 'a' parameter
      if (query.a === undefined) {
        errors.push("Parameter 'a' is required for this operation");
      } else {
        const numA = Number(query.a);
        if (isNaN(numA)) {
          errors.push("Parameter 'a' must be a valid number");
        } else {
          validatedParams.a = numA;
        }
      }
      
      // Validate 'b' parameter
      if (query.b === undefined) {
        errors.push("Parameter 'b' is required for this operation");
      } else {
        const numB = Number(query.b);
        if (isNaN(numB)) {
          errors.push("Parameter 'b' must be a valid number");
        } else {
          validatedParams.b = numB;
        }
      }
    }
  }

  // Validate name parameter if present
  if (query.name !== undefined) {
    if (typeof query.name !== 'string' || query.name.trim() === '') {
      errors.push("Parameter 'name' must be a non-empty string");
    } else {
      // Sanitize name by trimming and limiting length
      validatedParams.name = query.name.trim().substring(0, 50);
    }
  }

  return { validatedParams, errors };
}

/**
 * Handles incoming GET and POST requests by validating input, invoking the main operation, and returning the result or error response.
 *
 * Extracts input parameters from the request, validates and sanitizes them, and calls the main function with the validated data. Responds with a JSON result on success or an error message with appropriate HTTP status on failure.
 */
function handleRequest(req, res) {
  // Use query params for GET and body for POST
  const inputData = req.method === 'GET' ? req.query : req.body;
  
  // Validate and sanitize the input
  const { validatedParams, errors } = validateInput(inputData);
  
  if (errors.length > 0) {
    return res.status(400).json({ 
      error: 'Invalid input parameters', 
      details: errors 
    });
  }

  // Process the validated parameters
  fn(validatedParams)((result) => {
    res.json(result);
  }, (err) => {
    // Log full error details for debugging
    console.error('Function execution error:', err);
    // Send only a generic error message to the client
    res.status(err.status || 500).json({ error: 'Internal Server Error' });
  });
}

// Define GET route
app.get('/', handleRequest);

// Define POST route
app.post('/', handleRequest);

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Error: Port ${port} is already in use. Please use a different port.`);
  } else {
    console.error(`Error starting server: ${err.message}`);
  }
  process.exit(1); // Exit with a non-zero status code to indicate failure
});
