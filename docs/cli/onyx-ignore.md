# Ignoring files

This document provides an overview of the Onyx Ignore (`.onyxignore`)
feature of Onyx CLI.

Onyx CLI includes the ability to automatically ignore files, similar to
`.gitignore` (used by Git) and `.aiexclude` (used by Onyx Code Assist). Adding
paths to your `.onyxignore` file will exclude them from tools that support
this feature, although they will still be visible to other services (such as
Git).

## How it works

When you add a path to your `.onyxignore` file, tools that respect this file
will exclude matching files and directories from their operations. For example,
when you use the `@` command to share files, any paths in your `.onyxignore`
file will be automatically excluded.

For the most part, `.onyxignore` follows the conventions of `.gitignore`
files:

- Blank lines and lines starting with `#` are ignored.
- Standard glob patterns are supported (such as `*`, `?`, and `[]`).
- Putting a `/` at the end will only match directories.
- Putting a `/` at the beginning anchors the path relative to the
  `.onyxignore` file.
- `!` negates a pattern.

You can update your `.onyxignore` file at any time. To apply the changes, you
must restart your Onyx CLI session.

## How to use `.onyxignore`

To enable `.onyxignore`:

1. Create a file named `.onyxignore` in the root of your project directory.

To add a file or directory to `.onyxignore`:

1. Open your `.onyxignore` file.
2. Add the path or file you want to ignore, for example: `/archive/` or
   `apikeys.txt`.

### `.onyxignore` examples

You can use `.onyxignore` to ignore directories and files:

```
# Exclude your /packages/ directory and all subdirectories
/packages/

# Exclude your apikeys.txt file
apikeys.txt
```

You can use wildcards in your `.onyxignore` file with `*`:

```
# Exclude all .md files
*.md
```

Finally, you can exclude files and directories from exclusion with `!`:

```
# Exclude all .md files except README.md
*.md
!README.md
```

To remove paths from your `.onyxignore` file, delete the relevant lines.
