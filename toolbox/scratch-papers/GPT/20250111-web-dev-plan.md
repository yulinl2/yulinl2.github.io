Hi GPT, I need you to build up my personal website with me. This will be a huge project so I need you to help me figure out the best way to keep track of my progress, plan my To-Do's, and manage my GitHub repo the best way you can. I will need to build up systematic workflows and all the helpful tools to document and keep the project structured.

To give you an idea of how large of a project we're looking at, and how important it is to maintain a seamless pipeline for easy updates and daily maintenance, let me share with you a few of my ambitions:

I'd like to have:

- **A space for my artistic creations**, e.g.,

  - Performance videos
  - Music scores
  - Awards/event timeline, etc.

- **A space for my academic journey** - in which, besides the usual components in a personal website and an academic CV, I'd also like to build up:

  - **A personal library for my learning record**, where I'd be able to:
    - Track which papers I have read for each project
    - Record the start/access date
    - Add topic tags
    - Maintain research roadmaps/relation graphs for easy review in the future, helping me build up my knowledge base
  - **Another branch to emphasize my teaching journey**, to be able to:
    - Frequently update my teaching experience
    - Post helpful tutorials summarizing important learning outcomes in all areas (for which I'll also need your help to quickly formulate the write-ups)
    - Create a board of "My Favorites in Statistics" to highlight the most insightful results I've found in my academic journey, and maybe some learning milestones or "uh-huh" moments that amazed me

- **A project manager**, to manage goals and timelines at different scopes for all projects, including:

  - Website development:
    - Actually, why don't you help me make a To-Do document to keep track of the development goals and timelines of different branches under my personal website?
    - It'd be even better if we could have easy navigation links to different subprojects and resources...
  - Research code development
  - Theoretical project

---

### Versioning and Archiving

1. **Outdated Versions Storage**:

   - Create a dedicated `/archive` folder for storing outdated or deprecated versions of content.
   - Within `/archive`, maintain subfolders for each project (e.g., `/archive/docs`, `/archive/projects`, `/archive/reading`).
   - Alternatively, if preferred, a single `/trash` folder can be used as a general dumping ground for old versions.

2. **Folder Setup Commands**:

   ```bash
   mkdir archive
   mkdir archive/docs archive/projects archive/reading
   ```

### Nearest Term Must-Do's:

**Step 1: Set Up Initial Infrastructure**

1. **Initialize GitHub repository**:

   - Ensure that your `index.md` file is correctly linked to your GitHub Pages.
   - Add a README.md to describe the purpose and content of the repository.

2. **Basic Website Layout**:

   - Create a simple structure for your website:
     - `/docs` folder: For tutorials and documents.
     - `/assets` folder: For images and media.
     - `/projects` folder: For ongoing and completed projects.
     - `/reading` folder: For literature reading notes and brainstorming.

**Step 2: Develop a Systematic Workflow**

1. **Folder Organization**:

   - Create subfolders within `/docs` for different categories like tutorials, academic records, and artistic creations.
   - Create subfolders within `/reading` for each paper, named with a concise version of the paper title or arXiv ID.
   - Use a consistent naming convention for files and folders (e.g., `yyyy-mm-dd-topic-title.md`).

2. **Version Control**:

   - Set up a clear branching strategy for version control (e.g., `main`, `dev`, `feature-*`).
   - Use GitHub Issues and Milestones to track progress and manage tasks.

**Step 3: Create a Basic To-Do Document**

1. **Development Goals**:

   - List all immediate goals, such as setting up a homepage, navigation, and initial content sections.

2. **Navigation Links**:

   - Include placeholder links for subprojects (e.g., artistic creations, academic journey, tutorials).

---

### Workflow for Updating Tutorials

1. **Content Creation**:

   - Draft tutorials in `.md` files.
   - Use your custom HTML style to render the markdown.

2. **Version Tracking**:

   - Use Git for version control.
   - Maintain an update log section on the rendered page.

3. **Screenshots and Media**:

   - Store images in the `/assets` folder.
   - Use relative paths in markdown for easy linking.

### Immediate Tasks for This Weekend

1. **Upload GitHub Beginners Tutorial**:

   - Finalize the markdown content.
   - Ensure proper rendering using your custom HTML style.

2. **Prepare Paper Review Section**:

   - Create a dedicated folder for paper reviews.
   - Set up a template for digesting papers (e.g., key points, questions, and insights).

3. **Plan for Screenshots**:

   - Create a subfolder in `/assets` for screenshots.
   - Outline where screenshots will be added in the tutorial.

---

### My Scratch Papers (Under Toolbox)

1. **Quick Drafts Space**:

   - Create a `/toolbox/scratch-papers` subfolder for quick notes and random thoughts.
   - This will serve as your scratchpad for jotting down ideas, brainstorms, and anything else you want to record quickly.

2. **Folder Setup Commands**:

   ```bash
   mkdir toolbox/scratch-papers
   touch toolbox/scratch-papers/index.md
   ```

   Add a link from your homepage to `/drafts/index.md` for quick access.

### Toolbox Space

1. **Tools, Prompts, and Productivity Hacks**:

   - Create a dedicated `/toolbox` folder for storing your collection of prompts and responses.
   - This section will store all the productivity hacks, coding tricks, and useful AI-assisted workflows you want to keep track of.

2. **Folder Setup Commands**:

   ```bash
   mkdir toolbox
   touch toolbox/index.md
   ```

   Add links from your homepage to the `/toolbox/index.md` file for easy access.

### Folder Structure Setup Commands:

```bash
# Create the main folders, including productivity hacks space
mkdir personal-website
cd personal-website
mkdir docs assets projects reading hacks

# Create subfolders for different categories
mkdir docs/tutorials docs/academic docs/artistic-creations
mkdir assets/images assets/screenshots assets/media
mkdir projects/ongoing projects/completed
mkdir reading/paper-templates

# Create index files
toW Create README
echo "# Yulin Li's Personal Website" > README.md
```

### Basic Content for `reading/index.md`:

```markdown
# Literature Reading Notes

Welcome to my literature reading section. This is where I document thoughts, comments, and brainstorms on academic papers I've read. Each paper has its own dedicated page for detailed notes and insights.

## Recent Papers
- [Paper Title 1](./paper-templates/example-paper-1.md)
- [Paper Title 2](./paper-templates/example-paper-2.md)

## How to Use This Section
1. **Link to the Paper**: Include a link to the paper on arXiv or another source.
2. **Notes and Brainstorms**: Add your thoughts, key insights, and questions.
3. **Tags**: Use topic tags to categorize the paper for easy reference.

---

_Last updated: [Date]_ by Yulin Li
```

By following this plan, you’ll have a well-organized repository and a clear direction for building out your personal website efficiently. Let me know when you’re ready for the next steps or if you need help with any of the tasks!

