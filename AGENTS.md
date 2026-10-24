# Project workflow

The user explicitly requested that completed changes be committed and pushed to GitHub by default. After finishing the requested work and appropriate checks, commit the task's changes and push to the task's remote branch without asking for routine confirmation. Report the resulting commit and branch, or the specific reason a push failed.

The selected remote branch for this project is `claude/trusting-franklin-x92q1i` on `origin`. A cloud checkout may use a local branch named `work`; when it has no upstream, push explicitly to the selected remote branch. Preserve remote updates and do not force-push.

See `README.md` for dependency and original-paper asset preparation. Generated files under `public/past-papers/`, `dist/`, and dependency directories are intentionally ignored; commit their reproducible source definitions and generation scripts.
