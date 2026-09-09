# @resolve/ui — UI Package for Resolve ecosystem

`@resolve/ui` is a growing package that contains shared UI components and global SCSS tokens used by the applications within the Resolve ecosystem.
<br><br>
## Shared Components Design Principles

Shared components are designed with the following principles:

1. **Consumer-Agnostic**  
   Components do not depend on the application consuming them. They provide shared UI and presentation without assuming whether they are being rendered by the Resolve React application, the Next.js portal, or another consumer in the future.

2. **Domain-Aware**  
   These are shared components within the Resolve ecosystem, rather than generic UI components intended for any application. Where appropriate, they can work directly with known Resolve domain models such as `Identity`, `Interaction`, or `Status` rather than reducing everything to generic primitive props.

3. **Material UI Components**  
   Material UI provides the foundation for shared form controls and other common interface elements where it makes sense. The package can expose these components with Resolve-specific styling, behavior, and types while allowing consuming applications to use them consistently.

4. **Application Adapters**  
   When a shared component needs application-specific behavior, that behavior is provided by an adapter in the consuming application rather than being built into the shared component itself.
<br><br>
## Application Adapters

**Adapters provide the boundary between application-specific behavior and shared UI.** The consuming application determines how a component should behave within its own routing and application context, while `@resolve/ui` remains responsible for the shared presentation.

        ┌─────────────────────┐          ┌─────────────────────┐
        │    Resolve / React   │          │   Portal / Next.js  │
        └──────────┬──────────┘          └──────────┬──────────┘
                   │                                │
                   ▼                                ▼
        ┌─────────────────────┐          ┌─────────────────────┐
        │ IdentityBadgeAdapter│          │ IdentityBadgeAdapter│
        │                     │          │                     │
        │ App-specific:       │          │ App-specific:       │
        │ • route calculation │          │ • route calculation │
        │ • link behavior     │          │ • link behavior     │
        │ • renderLink        │          │ • renderLink        │
        └──────────┬──────────┘          └──────────┬──────────┘
                   │                                │
                   └──────────────┬─────────────────┘
                                  ▼
                       ┌─────────────────────┐
                       │     @resolve/ui     │
                       │                     │
                       │    IdentityBadge    │
                       │                     │
                       │ Shared UI / styling │
                       │ and presentation    │
                       └─────────────────────┘

```jsx
export const IdentityBadgeAdapter: React.FC<IdentityBadgeProps> = ({
  identity,
  size = "sm",
  isSquare = false,
  link = true,
}) => {
  const workspacePath = useWorkspacePath();
  const profilePath = workspacePath(identityRoute(identity.id));

  return (
    <IdentityBadgeUi // UI package component
      identity={identity}
      profileUrl={profilePath}
      renderLink={(children, url = profilePath, className) => (
        <Link
          to={url}
          aria-label={`View profile for ${identity.name}`}
          className={className}
        >
          {children}
        </Link>
      )}
      size={size}
      isSquare={isSquare}
      link={link}
    />
  );
};
```

The adapter handles the parts of the component that are specific to the consuming application. In this case, Resolve determines the profile route and provides its React Router Link, while IdentityBadgeUi remains responsible for the shared presentation.

The Portal adapter can provide the equivalent Next.js routing mechanism.
<br><br>
## UI Component Examples

Shared components currently include:

- `Avatar`
```jsx
<AvatarUi
  identity={identity}
  profileUrl={profileUrl}
  renderLink={(children, url = profileUrl) => (
    <Link to={url}>{children}</Link>
  )}
  addLink={addLink}
  decorative={decorative}
  size={size}
  isSquare={isSquare}
/>
```
- `StatusBadge`
```jsx
<StatusBadge status={interaction.status} hideIcon />
```
- `Button`
```jsx
<Button
  buttonType={ButtonType.Primary}
  onClick={() => redirect(`/interactions/${interaction?.id}`)}
>
  View Request
</Button>
```
- `IdentityBadge`
- `IdentifierBadge`
- `MetadataRow` (for displaying metadata in interaction detail page sidebar boxes)
<br><br>
## Global SCSS Tokens

Shared design tokens are defined in `@resolve/ui` and exposed for consumption by the applications.

Applications import the shared tokens from their top-level global stylesheet:

```scss
@use "@resolve/ui/styles/tokens";
```

This allows application-specific styles to use the same values without duplicating the token definitions.

```scss
/* Brand */
--color-brand-500: #3b6edc;
--color-brand-600: #2f5cc2;
--color-brand-100: #e8f0ff;

/* Neutral */
--color-gray-900: #111827;
--color-gray-700: #374151;
--color-gray-500: #6b7280;
--color-gray-300: #d1d5db;
```

The consuming app can then use the tokens in its app-specific style definitions.
```scss
.card {
  border-radius: 16px;
  border-left: 4px solid var(--color-brand-500);
}
```
<br><br>
## Documentation Boundaries

- **Domain Models:** Shared Resolve types are defined in `@resolve/types`.
- **Application Behavior:** Routing, application state, and other consumer-specific behavior remain in the consuming application.
- **API & Data:** API communication and data operations are handled outside `@resolve/ui`.
