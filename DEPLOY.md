
# Deploying to GitHub Pages

This project is configured for easy deployment to GitHub Pages.

## Automatic Deployment

The project includes a GitHub Actions workflow that automatically deploys the application to GitHub Pages whenever changes are pushed to the main branch.

1. Push your changes to the main branch
2. GitHub Actions will automatically build and deploy your application
3. Your application will be available at: https://[your-username].github.io/campus-food-fusion/

## Manual Deployment

If you prefer to deploy manually, you can do so with the following steps:

1. Build the application:
   ```
   npm run build
   ```

2. Deploy to GitHub Pages using the gh-pages package:
   ```
   npm run deploy
   ```

## Configuration

- The base URL is configured in `vite.config.ts` as `/campus-food-fusion/`
- Make sure your repository settings have GitHub Pages enabled and set to deploy from the gh-pages branch

## Troubleshooting

If you encounter issues with routing after deployment:
- Ensure all internal links use React Router's Link component
- Check that your router is configured with the correct basename
- Verify that the base URL in vite.config.ts matches your repository name
