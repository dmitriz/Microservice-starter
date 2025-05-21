#!/bin/bash
# create-microservice.sh

# Check if the microservice name is provided.
if [ $# -ne 1 ]; then
  echo "Usage: $0 <microservice_name>"
  exit 1
fi

microservice_name=$1
template_dir="./templates"

# Check if the template directory exists.
if [ ! -d "$template_dir" ]; then
  echo "Template directory not found."
  exit 1
fi

# Create the project folder.
mkdir "$microservice_name"
cd "$microservice_name"

# Copy the template files.
cp -r "$template_dir"/* .

# Initialize a new npm project.
npm init -y

# Add npm scripts to package.json.
# This uses a temporary file approach which is more portable across different versions of sed
# Get the second-to-last line of package.json (should be before the closing brace)
line_count=$(wc -l < package.json)
head -n $((line_count - 1)) package.json > temp.json
# Append our scripts section
cat << 'EOF' >> temp.json
  "scripts": {
    "start": "pm2 start server.js",
    "test": "ava",
    "tw": "ava --watch",
    "dev": "nodemon server.js"
  },
}
EOF
# Replace the original package.json with our modified version
mv temp.json package.json

echo "Microservice '$microservice_name' created successfully!"
echo "Next steps:"
echo "  1. cd $microservice_name"
echo "  2. npm install express ava pm2 nodemon --save-dev"
echo "  3. npm run dev (for development)"
echo "  4. npm test (for testing)"
