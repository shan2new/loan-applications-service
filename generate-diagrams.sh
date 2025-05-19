#!/bin/bash

# Ensure the images directory exists
mkdir -p docs/images

# Generate high-level architecture diagram
echo "Generating high-level architecture diagram..."
mmdc -i docs/high-level-architecture.mmd -o docs/images/high-level-architecture.png -t default -b white -w 1200

# Generate low-level architecture diagram with increased dimensions
echo "Generating low-level architecture diagram..."
mmdc -i docs/low-level-architecture.mmd -o docs/images/low-level-architecture.png -t default -b white -w 2400 -H 1800

# Generate deployment architecture diagram with significantly increased dimensions
echo "Generating deployment architecture diagram..."
mmdc -i docs/deployment-architecture.mmd -o docs/images/deployment-architecture.png -t default -b white -w 3000 -H 2200

echo "All diagrams generated successfully!"
