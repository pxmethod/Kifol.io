# Development Notes

## Known Issues and Solutions

### Parent Invitation System

#### Issue 1: Null Email in Parent Invitations
- **Problem**: When creating a new student, received error: "null value in column 'email' of relation 'parent_invitations' violates not-null constraint"
- **Root Cause**: Code attempted to create parent invitations without validating parent email existence
- **Solution**: 
```typescript
// Added validation in storage.ts:
if (!existingParent) {
  // Create parent invitation only if we have a valid email
  if (parentEmail) {
    await this.createParentInvitation(parentEmail);
  }
}
```

#### Issue 2: Student Deletion Cascade
- **Problem**: Error when deleting students: "column 'student_id' does not exist"
- **Root Cause**: Incorrect column reference in parent invitation deletion query
- **Solution**:
```typescript
// Modified deleteStudent method in storage.ts:
async deleteStudent(id: number): Promise<void> {
  // Delete any parent invitations for this student's email
  const student = await this.getStudent(id);
  if (student) {
    await db.delete(parentInvitations)
      .where(eq(parentInvitations.email, student.email));
  }
  // Then delete related records...
}
```

## Best Practices

### Database Operations
1. Always validate data before insertion
2. Use transactions for operations that modify multiple tables
3. Follow proper deletion order to handle foreign key constraints
4. Use type-safe queries with Drizzle ORM instead of raw SQL

### Email Integration
1. Handle email sending errors gracefully without failing the main operation
2. Use proper error logging for failed email attempts
3. Validate email addresses before attempting to send invitations
