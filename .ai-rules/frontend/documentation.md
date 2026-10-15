---
paths:
  - '**/*.ts'
  - '**/*.html'
  - '**/*.md'
---

# Frontend Documentation Guidelines

Documentation is **optional** in frontend code. Use your judgment to determine when documentation adds value.

## Language: English Only

When you DO add comments, JSDoc/TSDoc, or in-template `<!-- ... -->` notes, write them in English — even when a nearby pre-existing comment or the user prompt is in another language. Domain terms with no precise English equivalent are retained as proper nouns; all surrounding prose is English. Process artifacts not checked into the codebase (`.claude/plans/`, ad-hoc notes) may use any language.

## When Documentation Is Recommended

Document complex components, services, or logic when:

- The code is not self-explanatory
- The component has non-obvious usage patterns
- The service implements complex business logic
- Future developers would benefit from context

## Component Documentation (Optional)

For complex or reusable components, consider adding JSDoc:

```typescript
/**
 * Displays a list of user agreements with selection capability.
 *
 * @example
 * <app-agreement-list
 *   [agreements]="agreements"
 *   (selectionChange)="onSelectionChange($event)">
 * </app-agreement-list>
 *
 * @input agreements - Array of agreements to display
 * @output selectionChange - Emits when user selects/deselects agreements
 */
@Component({
	selector: 'app-agreement-list',
	templateUrl: './agreement-list.component.html'
})
export class AgreementListComponent {
	// implementation
}
```

## Service Documentation (Optional)

For complex service methods, JSDoc can be helpful:

```typescript
/**
 * Fetches agreements for a specific employee with optional filtering.
 *
 * @param employeeId - Unique identifier for the employee
 * @param activeOnly - If true, only returns active agreements
 * @returns Observable stream of Agreement objects
 */
getAgreements(employeeId: string, activeOnly = false): Observable<Agreement[]> {
  // implementation
}
```

## Code Comments

Code should be readable and self-documenting. If you think you need to add comments to explain your code, you probably need to refactor it. However, if you think a comment is necessary, ask the user for verification.

## README and Architecture Documentation

When making significant changes, update:

- **README.md**: feature lists, installation, configuration
- **Architecture docs**: C4 diagrams if architecture changes, new ADRs for significant decisions

## Outdated Documentation

If you find outdated or inaccurate documentation:

1. Alert the user
2. Suggest specific updates
3. Consider removing it if it no longer adds value
