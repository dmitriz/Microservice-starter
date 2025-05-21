// server.js
const express = require('express');
const app = express();
const fn = require('./functions.js');

// Helper function to validate and sanitize input
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

app.get('/', (req, res) => {
  // Validate and sanitize the input
  const { validatedParams, errors } = validateInput(req.query);
  
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
    res.status(err.status || 500).send(err);
  });
});

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
