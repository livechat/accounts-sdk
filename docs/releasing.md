# Releasing

## Release Process

To release a new version of the package to npm:

1. **Make sure you're logged in**:
   ```bash
   npm login
   ```

   This will prompt you for your npm username, password, and 2FA code (if enabled).
   You can confirm you're logged in with:

   ```bash
   npm whoami
   ```

2. **Verify you have publish permissions**:
   ```bash
   npm publish --dry-run
   ```
   This will simulate publishing without actually publishing. If you don't have permission, you'll see:
   ```
   403 Forbidden - You do not have permission to publish to this organization
   ```

   You can also check your permissions with:
   ```bash
   npm access list collaborators @livechat/accounts-sdk | grep "$(npm whoami)"
   ```

   Or list all collaborators with write permission:
   ```bash
   npm access list collaborators @livechat/accounts-sdk | grep write
   ```

3. **Create a new branch** for the release:
   ```bash
   git checkout -b release-v2.0.11  # use the appropriate version number
   ```

4. **Update the version** in `package.json` following [semantic versioning](https://semver.org/):
   ```bash
   npm version patch --no-git-tag-version  # for bug fixes (2.0.10 -> 2.0.11)
   npm version minor --no-git-tag-version  # for new features (2.0.10 -> 2.1.0)
   npm version major --no-git-tag-version  # for breaking changes (2.0.10 -> 3.0.0)
   ```

5. **Update the CHANGELOG.md**:
   - Move all items from the `[Unreleased]` section to a new version section with the release version number and date
   - Ensure the changes are categorized properly (Added, Changed, Fixed, Security, Documentation)
   - Add a new empty `[Unreleased]` section at the top
   - Update the version comparison links at the bottom of the file

   Example:
   ```markdown
   ## [Unreleased]


   ## [2.0.11] - 2026-02-09

   ### Fixed
   - Fix issue with authentication flow
   ```

   Then commit both changes:
   ```bash
   git add package.json package-lock.json CHANGELOG.md
   git commit -m "Bump version to 2.0.11"
   ```

6. **Build the package**:
   ```bash
   npm run build
   ```

7. **Run tests** to ensure everything works:
   ```bash
   npm test
   ```

8. **Push the branch**:
   ```bash
   git push origin release-v2.0.11
   ```

9. **Create a pull request** with the version update and get it reviewed and merged.

10. **After the PR is merged**, checkout the default branch and pull the latest changes:
    ```bash
    git checkout master
    git pull
    ```

11. **Create and push the git tag on the merged commit**:
    ```bash
    git tag v2.0.11
    git push origin v2.0.11
    ```

12. **Publish to npm**:
    ```bash
    npm publish
    ```

**Note**: Tagging *after* the PR is merged keeps the tag on the commit that actually landed on the default branch (important when using squash/rebase merges). The `prepare` script will automatically run the build before publishing.

## Beta Release Process

To release a beta version of the package for testing purposes:

1. **Make sure you're logged in to npm**:
   ```bash
   npm login
   npm whoami  # confirm you're logged in
   ```

2. **Create a beta version** (without committing):
   ```bash
   npm version prerelease --preid=beta --no-git-tag-version
   ```

   This will bump the version to something like `2.1.4-beta.0`. For subsequent beta iterations:
   ```bash
   npm version prerelease --no-git-tag-version  # increments to beta.1, beta.2, etc.
   ```

3. **Build the package**:
   ```bash
   npm run build
   ```

4. **Run tests** to ensure everything works:
   ```bash
   npm test
   ```

5. **Publish to npm with the beta tag**:
   ```bash
   npm publish --tag beta
   ```

**Note**: The `--tag beta` flag ensures that this version is not installed by default. Users must explicitly install it with `npm install @livechat/accounts-sdk@beta`. You can view all published beta versions with `npm view @livechat/accounts-sdk versions`.
