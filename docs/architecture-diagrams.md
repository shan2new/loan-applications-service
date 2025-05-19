# Architecture Diagrams Documentation

This document describes the architecture diagrams used in this project, how they were generated, and how they can be updated.

## Overview

The project uses [Mermaid](https://mermaid.js.org/) to define and generate architecture diagrams. Mermaid is a JavaScript-based diagramming and charting tool that renders Markdown-inspired text definitions to create diagrams.

We have three main architecture diagrams:

1. **High-Level Architecture** - Shows the main architectural layers and their relationships
2. **Low-Level Architecture** - Provides a detailed view of the components and their interactions
3. **Deployment Architecture** - Illustrates the AWS infrastructure setup for the application

## Source Files

The Mermaid definition files are located in the `docs/` directory:

- `high-level-architecture.mmd` - High-level architecture diagram
- `low-level-architecture.mmd` - Low-level architecture diagram
- `deployment-architecture.mmd` - Deployment architecture diagram

The generated PNG images are stored in the `docs/images/` directory.

## How to Generate the Diagrams

We use the [Mermaid CLI](https://github.com/mermaid-js/mermaid-cli) to generate the diagrams from the Mermaid definition files.

### Prerequisites

1. Node.js (v16 or higher)
2. Mermaid CLI installed globally:
   ```
   npm install -g @mermaid-js/mermaid-cli
   ```

### Generating the Diagrams

To generate all diagrams, run the provided script:

```
./generate-diagrams.sh
```

This script will:

1. Create the `docs/images/` directory if it doesn't exist
2. Generate PNG files for each Mermaid definition with a light theme and white background for optimal readability
3. Save the generated images in the `docs/images/` directory

## How to Update the Diagrams

To update a diagram:

1. Edit the corresponding `.mmd` file in the `docs/` directory
2. Run the `generate-diagrams.sh` script to regenerate the diagrams
3. Review the updated diagrams in the `docs/images/` directory
4. Commit both the updated `.mmd` file and the regenerated PNG files

### Mermaid Syntax

The diagrams use Mermaid's flowchart syntax. For more information on how to edit these diagrams, please refer to the [Mermaid Flowchart Documentation](https://mermaid.js.org/syntax/flowchart.html).

### Theme Customization

The diagrams use the default light theme with a white background for optimal readability. If you need to change the theme:

1. Edit the `generate-diagrams.sh` script
2. Modify the theme parameter (`-t`) to use one of: `default`, `forest`, `dark`, `neutral`, or `base`
3. Modify the background parameter (`-b`) as needed (e.g., `white`, `transparent`, or a color hex code)

Example:

```bash
mmdc -i diagram.mmd -o output.png -t forest -b '#f0f0f0' -w 1200
```

## Adding New Diagrams

To add a new diagram:

1. Create a new `.mmd` file in the `docs/` directory
2. Add the diagram generation command to the `generate-diagrams.sh` script
3. Run the script to generate the new diagram
4. Update relevant documentation to reference the new diagram

## Tips for Diagram Design

- Keep diagrams focused on one aspect of the architecture
- Use consistent styles and colors across diagrams
- Use meaningful names and descriptive labels
- Group related components using subgraphs
- Consider different diagram types like sequence diagrams or class diagrams for different aspects of the system
