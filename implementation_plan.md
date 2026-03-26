# NutriAI UX Improvement Plan

## Goal Description
Based on a comprehensive review of the website using the browser subagent, several key areas of the User Experience (UX) and User Interface (UI) require refinement to make the application feel truly production-ready. The main issues include low contrast for text/placeholders, broken routing for `/dashboard`, poor mobile responsiveness, and a lack of refined interactive states.

This plan details the code changes needed to resolve these issues while maintaining the existing clean, Vanilla CSS-based design system.

## Proposed Changes

### Global Styling & Accessibility ([index.css](file:///c:/Users/krish/.gemini/antigravity/scratch/Smart_Inventory/frontend/src/index.css))
- **[MODIFY] src/index.css**:
  - Update `--text-secondary` in the light theme to handle contrast issues (make it slightly darker).
  - Add explicit styling for `::placeholder` to ensure it meets WCAG accessibility guidelines.
  - Enhance `.glass-panel` hover effects by adding a subtle `transform: translateY(-2px)` for improved interactivity.
  - Add an `.animate-pulse` utility class for generic loading states.
  - Fix mobile layout by expanding responsive CSS media queries for forms, sidebar handling, and padding.

### Core Application & Routing
- **[MODIFY] src/App.tsx**:
  - Update react-router configuration to either redirect `/dashboard` to `/` (the root component), or assign the `Dashboard` component explicitly to the `/dashboard` route as well to prevent the 404 error noted during the review.

### Layout & Components
- **[MODIFY] src/components/Sidebar.tsx** (or equivalent layout component):
  - Refactor the sidebar to be responsive. On mobile (`max-width: 768px`), hide the sidebar by default and introduce a toggleable hamburger menu or bottom navigation.
  - Adjust the padding and spacing of the "Upgrade to Pro" card so it doesn't appear cramped on smaller screens.
- **[MODIFY] src/pages/Account.tsx**:
  - Update the "Sign Out" button to use a brand-aligned danger color (e.g., a softer Rose/Coral red) instead of the default saturated red that clashes with the green/grey palette. 
- **[MODIFY] src/pages/Login.tsx & src/pages/Signup.tsx**:
  - Replace native browser validation tooltips with custom styled error messages below inputs.
  - Ensure the "Sign In" and "Create Account" buttons show a clear loading state (using the existing `.lucide-spin` or `.ai-loader-ring`) during authentication requests, including a timeout handler if the server delays.

## Verification Plan

### Automated Tests
Currently, there are no predefined test commands in [package.json](file:///c:/Users/krish/.gemini/antigravity/scratch/Smart_Inventory/frontend/package.json) (like Jest or Cypress). We will rely on manual and subagent-driven verification.

### Manual Verification
1. Run `npm run dev` to start the frontend server.
2. Use the `browser_subagent` to navigate to `http://localhost:5173`:
   - Verify `/dashboard` successfully loads the main dashboard instead of a 404 page.
   - Resize the browser window to mobile dimensions (`width: 400px`) and ensure the sidebar collapses or adapts functionally without breaking layout.
   - Test Login/Signup with invalid inputs and verify custom red error text appears instead of browser tooltips.
   - Check the contrast of form placeholders visually or using browser devtools to ensure readability.
   - Review the "Sign Out" button color in the Account page for brand consistency.
