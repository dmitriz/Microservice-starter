#!/bin/bash
# create-microservice.sh

# Check if the microservice name is provided.
if [ $# -ne 1 ]; then
  echo "Usage: $0 <microservice_name>"
  exit 1
fi

microservice_name=$1

# Validate the microservice name for allowed characters (alphanumeric, dashes, and underscores)
if ! [[ $microservice_name =~ ^[a-zA-Z0-9_-]+$ ]]; then
  echo "Error: Microservice name can only contain alphanumeric characters, dashes, and underscores."
  echo "Invalid name: $microservice_name"
  exit 1
fi

template_dir="./templates"

# Check if the template directory exists.
if [ ! -d "$template_dir" ]; then
  echo "Template directory not found."
  exit 1
fi

# Check if the project directory already exists.
if [ -d "$microservice_name" ]; then
  echo "Error: Directory '$microservice_name' already exists."
  echo "Please choose a different name or remove the existing directory."
  exit 1
fi

# Create the project folder.
mkdir "$microservice_name"
cd "$microservice_name"

# Copy only the necessary template files, excluding hidden files, version control files, and temp files.
echo "Copying template files..."

# Use find to selectively copy only relevant files based on extension
# This excludes hidden files (.git, .DS_Store, etc.), temporary files, and other unwanted files
find "$template_dir" -type f \( -name "*.js" -o -name "*.json" -o -name "*.md" \) -not -path "*/\.*" | while read file; do
  filename=$(basename "$file")
  echo "- Copying $filename"
  cp "$file" .
done

# Verify that essential files were copied
if [ ! -f "functions.js" ] || [ ! -f "server.js" ]; then
  echo "Error: Essential template files are missing. Please check your template directory."
  cd ..
  rm -rf "$microservice_name"  # Clean up the partially created directory
  exit 1
fi

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
echo "  2. npm install express"
echo "  3. npm install ava pm2 nodemon --save-dev"
echo "  4. npm run dev (for development)"
echo "  5. npm test (for testing)"
