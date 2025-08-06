# Fitness Tracker App Deployment Script for Windows 11
# This script will clean up existing containers/images and deploy the app fresh

param(
    [string]$Environment = "dev",
    [switch]$SkipBuild = $false,
    [switch]$Verbose = $false
)

# Set error action preference
$ErrorActionPreference = "Continue"

# Validate environment parameter
$ValidEnvironments = @("dev", "prod", "stg")
if ($Environment -notin $ValidEnvironments) {
    Write-Host "[ERROR] Invalid environment '$Environment'. Valid options are: dev, prod, stg" -ForegroundColor Red
    exit 1
}

# Define constants based on environment
$IMAGE_NAME = "nguyentuananh190403/fitness-app:$Environment"
$CONTAINER_NAME = "fitness-tracker-app-$Environment"
$DB_CONTAINER_NAME = "fitness-tracker-db-$Environment"

# Function to write colored output
function Write-ColorOutput($Message, $Color = "White") {
    Write-Host $Message -ForegroundColor $Color
}

# Function to execute docker command with error handling
function Invoke-DockerCommand($Command, $Description) {
    Write-ColorOutput "[INFO] $Description..." "Cyan"
    if ($Verbose) {
        Write-ColorOutput "Executing: $Command" "Gray"
    }
    
    try {
        Invoke-Expression $Command
        if ($LASTEXITCODE -eq 0) {
            Write-ColorOutput "[SUCCESS] $Description completed successfully" "Green"
            return $true
        } else {
            Write-ColorOutput "[WARNING] $Description completed with warnings" "Yellow"
            return $true
        }
    }
    catch {
        Write-ColorOutput "[ERROR] $Description failed: $($_.Exception.Message)" "Red"
        return $false
    }
}

# Function to check if Docker is running
function Test-DockerRunning {
    try {
        docker version | Out-Null
        return $true
    }
    catch {
        return $false
    }
}

# Main deployment function
function Start-Deployment {
    Write-ColorOutput "Starting Fitness Tracker App Deployment ($Environment)" "Magenta"
    Write-ColorOutput "=======================================" "Magenta"
    Write-ColorOutput "[INFO] Environment: $Environment" "Cyan"
    Write-ColorOutput "[INFO] Image: $IMAGE_NAME" "Cyan"
    Write-ColorOutput "[INFO] Container: $CONTAINER_NAME" "Cyan"
    Write-ColorOutput ""
    
    # Check if Docker is running
    Write-ColorOutput "[INFO] Checking Docker status..." "Cyan"
    if (-not (Test-DockerRunning)) {
        Write-ColorOutput "[ERROR] Docker is not running or not installed!" "Red"
        Write-ColorOutput "Please start Docker Desktop and try again." "Yellow"
        exit 1
    }
    Write-ColorOutput "[SUCCESS] Docker is running" "Green"
    
    # Stop and remove existing containers
    Write-ColorOutput "`n[INFO] Cleaning up existing containers..." "Yellow"
    
    # Stop containers if they exist
    $containers = docker ps -aq --filter "name=$CONTAINER_NAME"
    if ($containers) {
        Invoke-DockerCommand "docker stop $CONTAINER_NAME" "Stopping app container"
        Invoke-DockerCommand "docker rm $CONTAINER_NAME" "Removing app container"
    } else {
        Write-ColorOutput "[INFO] No existing app container found" "Gray"
    }
    
    $dbContainers = docker ps -aq --filter "name=$DB_CONTAINER_NAME"
    if ($dbContainers) {
        Invoke-DockerCommand "docker stop $DB_CONTAINER_NAME" "Stopping database container"
        Invoke-DockerCommand "docker rm $DB_CONTAINER_NAME" "Removing database container"
    } else {
        Write-ColorOutput "[INFO] No existing database container found" "Gray"
    }
    
    # Remove existing images
    Write-ColorOutput "`n[INFO] Cleaning up existing images..." "Yellow"
    $existingImages = docker images -q $IMAGE_NAME
    if ($existingImages) {
        Invoke-DockerCommand "docker rmi $IMAGE_NAME --force" "Removing existing app image"
    } else {
        Write-ColorOutput "[INFO] No existing app image found" "Gray"
    }
    
    # Build new image (unless skipped)
    if (-not $SkipBuild) {
        Write-ColorOutput "`n[INFO] Building new Docker image for $Environment environment..." "Yellow"
        $buildSuccess = Invoke-DockerCommand "docker build -t $IMAGE_NAME --build-arg ENVIRONMENT=$Environment ." "Building app image"
        
        if (-not $buildSuccess) {
            Write-ColorOutput "[ERROR] Build failed! Deployment aborted." "Red"
            exit 1
        }
    } else {
        Write-ColorOutput "`n[INFO] Skipping build step for $Environment environment..." "Yellow"
    }
    
    # Deploy using docker-compose
    Write-ColorOutput "`n[INFO] Deploying application for $Environment environment..." "Yellow"
    
    # Set environment variables for docker-compose
    $env:ENVIRONMENT = $Environment
    $env:IMAGE_NAME = $IMAGE_NAME
    $env:CONTAINER_NAME = $CONTAINER_NAME
    $env:DB_CONTAINER_NAME = $DB_CONTAINER_NAME
    $env:NODE_ENV = "production"
    
    # Set environment-specific port
    $port = switch ($Environment) {
        "dev" { "3000" }
        "stg" { "3001" }
        "prod" { "3002" }
        default { "3000" }
    }
    $env:PORT = $port
    
    # Set default MongoDB credentials (can be overridden in .env files)
    $env:MONGO_USERNAME = "admin"
    $env:MONGO_PASSWORD = "password"
    
    $deploySuccess = Invoke-DockerCommand "docker-compose up -d" "Starting services with docker-compose"
    
    if (-not $deploySuccess) {
        Write-ColorOutput "[ERROR] Deployment failed!" "Red"
        exit 1
    }
    
    # Wait a moment for containers to start
    Write-ColorOutput "`n[INFO] Waiting for services to start..." "Cyan"
    Start-Sleep -Seconds 5
    
    # Show deployment status
    Write-ColorOutput "`nDeployment Status:" "Magenta"
    Write-ColorOutput "==================" "Magenta"
    
    # Check container status
    $containerStatus = docker ps --filter "name=$CONTAINER_NAME" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    $dbStatus = docker ps --filter "name=$DB_CONTAINER_NAME" --format "table {{.Names}}\t{{.Status}}"
    
    if ($containerStatus -match $CONTAINER_NAME) {
        Write-ColorOutput "[SUCCESS] App Container: Running" "Green"
        Write-ColorOutput $containerStatus "Gray"
    } else {
        Write-ColorOutput "[ERROR] App Container: Not running" "Red"
    }
    
    if ($dbStatus -match $DB_CONTAINER_NAME) {
        Write-ColorOutput "[SUCCESS] Database Container: Running" "Green"
        Write-ColorOutput $dbStatus "Gray"
    } else {
        Write-ColorOutput "[ERROR] Database Container: Not running" "Red"
    }
    
    # Show logs if there are issues
    $appRunning = docker ps -q --filter "name=$CONTAINER_NAME"
    if (-not $appRunning) {
        Write-ColorOutput "`n[INFO] App Container Logs (last 10 lines):" "Yellow"
        docker logs $CONTAINER_NAME --tail 10
    }
    
    # Clean up dangling images
    Write-ColorOutput "`n[INFO] Cleaning up dangling images..." "Cyan"
    $danglingImages = docker images -f "dangling=true" -q
    if ($danglingImages) {
        Invoke-DockerCommand "docker rmi $($danglingImages -join ' ')" "Removing dangling images"
    } else {
        Write-ColorOutput "[INFO] No dangling images to clean up" "Gray"
    }
    
    # Final success message
    Write-ColorOutput "`n[SUCCESS] Deployment Complete for $Environment!" "Green"
    Write-ColorOutput "==============================" "Green"
    $port = switch ($Environment) {
        "dev" { "3000" }
        "stg" { "3001" }
        "prod" { "3002" }
        default { "3000" }
    }
    Write-ColorOutput "Application should be available at: http://localhost:$port" "Cyan"
    Write-ColorOutput "Environment: $Environment" "Cyan"
    Write-ColorOutput "Image: $IMAGE_NAME" "Gray"
    Write-ColorOutput "To view logs: docker logs $CONTAINER_NAME" "Gray"
    Write-ColorOutput "To stop: docker-compose down" "Gray"
}

# Help function
function Show-Help {
    Write-ColorOutput "Fitness Tracker Deployment Script" "Magenta"
    Write-ColorOutput "=================================" "Magenta"
    Write-ColorOutput ""
    Write-ColorOutput "Usage:" "White"
    Write-ColorOutput "  .\deploy.ps1                         # Deploy to dev environment (default)" "Gray"
    Write-ColorOutput "  .\deploy.ps1 -Environment prod       # Deploy to production environment" "Gray"
    Write-ColorOutput "  .\deploy.ps1 -Environment stg        # Deploy to staging environment" "Gray"
    Write-ColorOutput "  .\deploy.ps1 -Environment dev        # Deploy to development environment" "Gray"
    Write-ColorOutput "  .\deploy.ps1 -SkipBuild              # Skip Docker build step" "Gray"
    Write-ColorOutput "  .\deploy.ps1 -Verbose                # Show detailed command output" "Gray"
    Write-ColorOutput "  .\deploy.ps1 -Help                   # Show this help message" "Gray"
    Write-ColorOutput ""
    Write-ColorOutput "Parameters:" "White"
    Write-ColorOutput "  -Environment  Target environment (dev, prod, stg) - Default: dev" "Gray"
    Write-ColorOutput "  -SkipBuild    Skip the Docker image build step" "Gray"
    Write-ColorOutput "  -Verbose      Show detailed command execution" "Gray"
    Write-ColorOutput "  -Help         Show this help message" "Gray"
    Write-ColorOutput ""
    Write-ColorOutput "Examples:" "White"
    Write-ColorOutput "  .\deploy.ps1 -Environment prod -Verbose" "Gray"
    Write-ColorOutput "  .\deploy.ps1 -Environment stg -SkipBuild" "Gray"
    Write-ColorOutput ""
    Write-ColorOutput "Environment Details:" "White"
    Write-ColorOutput "  dev  - Development (localhost:3000)" "Gray"
    Write-ColorOutput "  stg  - Staging (localhost:3001)" "Gray"
    Write-ColorOutput "  prod - Production (localhost:3002)" "Gray"
}

# Check for help parameter
if ($Help) {
    Show-Help
    exit 0
}

# Start the deployment process
try {
    Start-Deployment
}
catch {
    Write-ColorOutput "[ERROR] Unexpected error occurred: $($_.Exception.Message)" "Red"
    Write-ColorOutput "Please check the error above and try again." "Yellow"
    exit 1
}
