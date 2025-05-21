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

# Copy all template files from the templates directory to the new project root.
echo "Copying template files..."

# Copy all files including hidden files like .gitignore
cp -r "$template_dir"/* "$template_dir"/.[!.]* . 2>/dev/null || :

# Verify that essential files were copied
if [ ! -f "functions.js" ] || [ ! -f "server.js" ]; then
  echo "Error: Essential template files are missing. Please check your template directory."
  cd ..
  rm -rf "$microservice_name"  # Clean up the partially created directory
  exit 1
fi

# Create the .env file for environment variables (local, non-sensitive)
touch .env

# Since we're using the package.json from templates, 
# we don't need to modify it - it already has the right scripts
# Just update the microservice name in the start script
if [ -f "package.json" ]; then
  # Replace 'your-microservice-name' with the actual microservice name in package.json
  sed -i "s/your-microservice-name/$microservice_name/g" package.json
fi

echo ""
echo "Microservice '$microservice_name' created successfully!"
echo "Next steps:"
echo "1. Change into the new directory: cd $microservice_name"
echo "2. Install dependencies: npm install"
echo "3. Start development: npm run dev or npm start"
echo "4. Run tests: npm test or npm run tw"
