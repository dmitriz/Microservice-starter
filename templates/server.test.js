// server.test.js
const test = require('ava')
const fetch = require('node-fetch')
const { execSync, spawn } = require('child_process')

let serverProcess

// Hook to start the server before tests run
test.before(async t => {
  // Ensure we are in the context of the generated microservice for `npm start`
  const projectRoot = process.cwd() // This will be the new microservice folder
  
  // Install dependencies if not already done by the setup script (npm install)
  // For this test, we assume npm install was run by the user after script execution.

  // Start the server using the npm start script
  serverProcess = spawn('npm', ['start'], { 
    cwd: projectRoot, // Run npm start in the current (newly created) project directory
    detached: true, // Detach the process so it runs in background
    stdio: 'ignore' // Suppress output for clean test logs
  })

  // Wait for the server to be ready by polling the health endpoint
  const maxWaitMs = 10000; // 10 seconds timeout
  const pollIntervalMs = 250;
  const start = Date.now();
  let ready = false;
  while (Date.now() - start < maxWaitMs) {
    try {
      const res = await fetch('http://127.0.0.1:3000/');
      if (res.ok) {
        ready = true;
        break;
      }
    } catch (e) {
      // Ignore errors, server may not be up yet
    }
    await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
  }
  if (!ready) {
    t.fail('Server did not become ready in time');
  }

  // Optional: Check if PM2 process is actually running (more robust)
  // try {
  //   const pm2List = execSync('pm2 list', { encoding: 'utf8' });
  //   t.regex(pm2List, /your-microservice-name/, 'PM2 process should be running');
  // } catch (e) {
  //   console.error('PM2 list failed:', e.message);
  //   t.fail('Failed to verify PM2 process');
  // }
})

// Test if the server responds to a basic GET request
test('server responds to GET /', async t => {
  try {
    const res = await fetch('http://127.0.0.1:3000/')
    t.is(res.status, 200)
    // Expecting an empty object from default functions.js implementation
    const body = await res.json()
    t.deepEqual(body, {})
  } catch (error) {
    console.error('Fetch error:', error)
    t.fail(`Server did not respond as expected: ${error.message}`)
  }
})

// Hook to stop and clean up the server process after all tests
test.after.always(t => {
  if (serverProcess) {
    // Kill the detached process group
    process.kill(-serverProcess.pid, 'SIGKILL')
  }
  // Ensure PM2 processes are stopped and cleared if they were used
  try {
    execSync('pm2 stop all --silent', { stdio: 'ignore' })
    execSync('pm2 delete all --silent', { stdio: 'ignore' })
  } catch (e) {
    // Ignore errors if pm2 isn't running or installed
    console.warn('PM2 cleanup might have failed (perhaps PM2 not running):', e.message)
  }
})
