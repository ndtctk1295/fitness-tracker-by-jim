#!/bin/bash

# Update script for our fitness tracker application
echo "Fitness Tracker Update Script"
echo "=============================="

# Install missing TypeScript type definitions
echo "Installing @types/bcrypt package..."
yarn add --dev @types/bcrypt

# Fix any Typescript errors
echo "Running type checking..."
yarn tsc --noEmit

echo "Update completed!"
