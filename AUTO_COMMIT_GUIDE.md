# 🔄 Auto Commit & Push Guide

## Quick Commands

### Option 1: Use the PowerShell Script (Easiest)

```powershell
# Default commit message
.\quick-push.ps1

# Custom commit message
.\quick-push.ps1 "Add new feature"
```

### Option 2: Manual Git Commands

```powershell
# Add all changes
git add .

# Commit with message
git commit -m "Your commit message here"

# Push to GitHub
git push
```

### Option 3: Single Line Command

```powershell
git add . ; git commit -m "Update files" ; git push
```

---

## What the Script Does

1. ✅ **Checks** for changes
2. ✅ **Adds** all modified files
3. ✅ **Commits** with your message
4. ✅ **Pushes** to GitHub automatically
5. ✅ Shows confirmation with repository link

---

## Usage Examples

```powershell
# After making changes to code
.\quick-push.ps1 "Add customer search feature"

# After fixing bugs
.\quick-push.ps1 "Fix login validation bug"

# After adding new files
.\quick-push.ps1 "Add deployment documentation"

# Quick push with default message
.\quick-push.ps1
```

---

## VS Code Integration

### Add as a Task (Recommended)

1. Press `Ctrl+Shift+P`
2. Type "Tasks: Configure Task"
3. Add this to `.vscode/tasks.json`:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Quick Push to GitHub",
      "type": "shell",
      "command": ".\\quick-push.ps1",
      "args": ["${input:commitMessage}"],
      "problemMatcher": [],
      "presentation": {
        "reveal": "always",
        "panel": "new"
      }
    }
  ],
  "inputs": [
    {
      "id": "commitMessage",
      "type": "promptString",
      "description": "Commit message",
      "default": "Update project files"
    }
  ]
}
```

4. Run with: `Ctrl+Shift+P` → "Tasks: Run Task" → "Quick Push to GitHub"

---

## Git Workflow Tips

### Before Making Changes
```powershell
# Pull latest changes
git pull
```

### After Making Changes
```powershell
# Option 1: Use quick-push script
.\quick-push.ps1 "Your message"

# Option 2: Manual
git add .
git commit -m "Your message"
git push
```

### Check Status Anytime
```powershell
git status
```

### View Commit History
```powershell
git log --oneline -10
```

---

## Commit Message Best Practices

### Good Messages ✅
- "Add user authentication feature"
- "Fix dashboard loading bug"
- "Update README with deployment steps"
- "Refactor product controller"
- "Add Vercel deployment configuration"

### Bad Messages ❌
- "update"
- "fix"
- "changes"
- "asdf"
- "final version"

### Message Format
```
<type>: <description>

Examples:
feat: Add customer search functionality
fix: Resolve login validation issue
docs: Update API documentation
style: Format code with Prettier
refactor: Simplify auth controller
test: Add unit tests for products
chore: Update dependencies
```

---

## Troubleshooting

### "Nothing to commit"
- No changes detected
- Already committed everything
- Check with: `git status`

### "Push rejected"
- Someone else pushed changes
- Solution: `git pull` then `git push`

### "Permission denied"
- GitHub authentication issue
- Re-authenticate: `git credential manager`

### "Merge conflict"
- Files changed both locally and remotely
- Resolve conflicts manually
- Then: `git add . && git commit && git push`

---

## Automation with VS Code Extensions

### Recommended Extensions:

1. **GitLens** - Enhanced Git features
2. **Git Graph** - Visual commit history
3. **GitHub Pull Requests** - PR management

### Auto-commit on Save (Optional)

Install "Git Auto Commit" extension:
- Commits automatically when you save files
- Useful for continuous backup

---

## Keyboard Shortcuts (Create in VS Code)

1. Press `Ctrl+K Ctrl+S` (Keyboard Shortcuts)
2. Search for "Run Task"
3. Add keybinding: `Ctrl+Shift+G P`

Now `Ctrl+Shift+G P` = Quick Push!

---

## Current Repository

- **GitHub**: https://github.com/kruthikroshan/Rental-Management-System
- **Branch**: main
- **Remote**: origin

---

**Created**: October 19, 2025  
**Status**: ✅ Ready to use  
**Usage**: `.\quick-push.ps1 "Your commit message"`
