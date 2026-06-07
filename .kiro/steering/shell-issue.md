---
inclusion: manual
---

# Kiro Shell Execution Issue — Investigation Notes

## Problem
Kiro's agent cannot execute shell commands. Commands time out with no output.

## Root Cause
Kiro's installer injects shell integration scripts into multiple dotfiles (`.zshrc`, `.bashrc`, `.zprofile`, `.profile`). These scripts call `kiro --locate-shell-integration-path zsh` or source pre/post hook files that hang in non-interactive shells. Since Kiro spawns shells to run agent commands, its own integration scripts block the shell from starting.

## What Was Tried

### .zshrc fixes
- Guarded `compinit` with `[[ -o interactive ]]` — this fixed it initially
- Guarded Kiro pre/post blocks with `[[ -o interactive ]]`
- Guarded prompt/vcs_info block with `[[ -o interactive ]]`
- Guarded shell integration line: `[[ "$TERM_PROGRAM" == "kiro" ]] && [[ -o interactive ]] && . "$(kiro --locate-shell-integration-path zsh)"`

### .bashrc fixes
- Guarded all Kiro pre/post blocks with `[[ $- == *i* ]]`
- Removed duplicate unguarded shell integration line

### .profile fixes
- Guarded Kiro pre/post blocks with `[[ -o interactive ]]`

### .zprofile — THE MAIN CULPRIT
- Contained unguarded Kiro CLI and Fig/Q pre/post source blocks
- These hung in non-interactive login shells (which is what Kiro spawns with `-l`)
- **Fix: deleted .zprofile entirely** (only useful content was PATH export, moved to .zshrc)

### Kiro Settings tried
- `kiroAgent.terminalCommandTimeout`: bumped to 30000
- `terminal.integrated.automationProfile.osx`: tried `{"path": "/bin/zsh", "args": ["--no-rcs"]}` — commands execute but Kiro can't detect completion (no shell integration)
- `terminal.integrated.defaultProfile.osx`: was null, left as-is

## Current State (FIXED)
The shell now works. The final fix required:

1. **Delete ~/.zprofile** — contained unguarded Kiro/Fig source blocks that hung
2. **Guard history block** with `if [[ -o interactive ]]; then ... fi`
3. **Guard compinit** with `[[ -o interactive ]]`
4. **Guard prompt/vcs_info block** with `if [[ -o interactive ]] && [[ "$TERM_PROGRAM" != "kiro" ]]; then ... fi`
   - This was the final culprit — `precmd_functions` and `vcs_info` hooks conflict with Kiro's shell integration
5. **Shell integration line stays UNGUARDED**: `[[ "$TERM_PROGRAM" == "kiro" ]] && . "$(kiro --locate-shell-integration-path zsh)"`
   - Kiro NEEDS this to detect command completion
6. **Kiro pre/post blocks** guarded with `[[ -o interactive ]]`

### Key Insight
The `precmd_functions` hook (used by vcs_info for git branch display) conflicts with Kiro's shell integration which also hooks into the prompt lifecycle. Both can't coexist in the same shell.

### Related Issues
- https://github.com/kirodotdev/Kiro/issues/1216
- https://github.com/kirodotdev/Kiro/issues/1393 (suggests using if/else instead of &&)
- https://kiro.dev/docs/troubleshooting/#kiro-stuck-in-working-status-on-terminal-commands-or-kiro-does-not-see-terminal-output

## What DID Work
1. Commenting out ALL of .zshrc — shell worked perfectly
2. Everything guarded + `--no-rcs` automation profile — commands ran but timed out (no completion detection)

## Workaround
User runs commands in their own terminal and pastes output back to the agent.

## To Permanently Fix
The Kiro team needs to either:
1. Guard their injected shell scripts with interactive checks at install time
2. Use `terminal.integrated.automationProfile.osx` for agent shells with proper completion detection that doesn't rely on shell integration
3. Make `kiro --locate-shell-integration-path` fast/non-blocking in all contexts

## Current Dotfile State

### ~/.zshrc
- All Kiro pre/post blocks: guarded with `[[ -o interactive ]]`
- compinit: guarded with `[[ -o interactive ]]`
- Prompt/vcs_info: wrapped in `if [[ -o interactive ]]; then ... fi`
- Shell integration: `[[ "$TERM_PROGRAM" == "kiro" ]] && [[ -o interactive ]] && . "$(kiro --locate-shell-integration-path zsh)"`
- PATH includes cargo, go, homebrew

### ~/.bashrc
- All blocks guarded with `[[ $- == *i* ]]`

### ~/.profile
- Kiro blocks guarded with `[[ -o interactive ]]`

### ~/.zprofile
- DELETED (was the main culprit)
